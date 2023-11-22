/**
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */
// eslint-disable-next-line max-classes-per-file
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    type Auto,
    type GetriebeType,
    HerstellerType,
} from '../../auto/entity/auto.entity.js';
import {
    AutoReadService,
    type Suchkriterien,
} from '../service/auto-read.service.js';
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { type Eigentuemer } from '../entity/eigentuemer.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

/** href-Link für HATEOS */
export interface Link {
    readonly href: string;
}

/** Links für HATEOAS */
export interface Links {
    /** self-Link */
    readonly self: Link;
    /** Optionaler Linke für list */
    readonly list?: Link;
    /** Optionaler Linke für add */
    readonly add?: Link;
    /** Optionaler Linke für update */
    readonly update?: Link;
    /** Optionaler Linke für remove */
    readonly remove?: Link;
}

/**
 * Typdefinition eines Eigentuemer- & Ausstattungs-Objekts ohne Rückwärtsverweis zum Auto
 */
export type EigentuemerModel = Omit<Eigentuemer, 'auto' | 'id'>;

export type AutoModel = Omit<
    Auto,
    | 'eigentuemer'
    | 'ausstattungen'
    | 'aktualisiert'
    | 'erzeugt'
    | 'id'
    | 'version'
> & {
    eigentuemer: EigentuemerModel;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links: Links;
};

/**
 * Auto-Objekte mit HATEOAS-Links in einem JSON-Array
 */
export interface AutosModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _embedded: {
        autos: AutoModel[];
    };
}

/**
 * Klasse für `AutoGetController`, um die Queries in _OpenAPI_ zu formulieren.
 * Damit dürfen die Properties auch undefined deklariert werden.
 */
export class AutoQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly modellbezeichnung: string;

    @ApiProperty({ required: false })
    declare readonly hersteller: HerstellerType;

    @ApiProperty({ required: false })
    declare readonly fin: string;

    @ApiProperty({ required: false })
    declare readonly kilometerstand: number;

    @ApiProperty({ required: false })
    declare readonly auslieferungstag: Date;

    @ApiProperty({ required: false })
    declare readonly grundpreis: number;

    @ApiProperty({ required: false })
    declare readonly istAktuellesModell: boolean;

    @ApiProperty({ required: false })
    declare readonly getriebeArt: GetriebeType;

    @ApiProperty({ required: false })
    declare readonly eigentuemer: string;
}

const APPLICATION_HAL_JSON = 'application/hal+json';

/**
 * Die Controller Klasse zur Verwaltung von Autos.
 */
@Controller(paths.rest)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Auto REST-API')
export class AutoGetController {
    readonly #service: AutoReadService;

    readonly #logger = getLogger(AutoGetController.name);

    constructor(service: AutoReadService) {
        this.#service = service;
    }

    /**
     *
     * Ein Auto wird asynchron anhand seiner ID gesucht.
     *
     * Falls ein Auto gefunden wird und `If-None-Match` auf die aktuelle Version gesetzt war,
     * wird der Statuscode `304` - Not Modified ausgegeben. Falls `If-None-Match` nicht gesetzt war
     * oder die Version veraltet ist wird das Objekt als JSON-Datensatz zurückgeliefert,
     * mit Statuscode `200` (`OK`).
     *
     * Falls es kein Auto zur ID gab, wir der Statuscode `404` (`Not Found`) ausgegeben.
     *
     * @param id Pfad-Parameter `id`
     * @param req Request Objekt
     * @param version Versionsnummer im Request Header
     * @param accept Mime-Type
     * @param res Leeres Response Objekt von Express
     * @returns Leeres Promise Objekt
     */
    // eslint-disable-next-line max-params
    @Get(':id')
    @ApiOperation({ summary: 'Suche mit der Auto-ID' })
    @ApiParam({
        name: 'id',
        description: 'z.B. 1',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte Get-Requests, z.B."0" ',
        required: false,
    })
    @ApiOkResponse({ description: 'Das Auto wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Kein Auto zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Das Auto wurde bereits heruntergeladen',
    })
    async getById(
        @Param('id') idStr: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<AutoModel | undefined>> {
        this.#logger.debug('getById: idStr=%s, version=%s"', idStr, version);
        const id = Number(idStr);
        if (Number.isNaN(id)) {
            this.#logger.debug('getById: NaN');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('getById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const auto = await this.#service.findById({ id });
        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug('getById(): auto=%s', auto.toString());
            this.#logger.debug('getById(): eigentuemer=%o', auto.eigentuemer);
        }

        // ETags
        const versionDb = auto.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('getById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('getById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        // HATEOAS mit Atom Links und HAL (= Hypertext Application Language)
        const autoModel = this.#toModel(auto, req);
        this.#logger.debug('getById: autoModel=%o', autoModel);
        return res.contentType(APPLICATION_HAL_JSON).json(autoModel);
    }

    /**
     * Autos werden mit Query-Parameter asynchron gesucht. Gibt es mindestens
     * ein Auto, dann wird der Statuscode `200` (`OK`) zurückgegeben.
     *
     * Gibt es kein Auto zur gesuchten ID, dann werden alle Autos ausgegeben.
     *
     * @param query Query-Parameter
     * @param req Request-Objekt
     * @param res Leeres Response-Objekt
     * @returns Leeres Promise-Obkjet
     */
    @Get()
    @ApiOperation({ summary: 'Suche mit Suchkriterien' })
    @ApiOkResponse({ description: 'Eine evtl. leere Liste mit Autos' })
    async get(
        @Query() query: AutoQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<AutoModel | undefined>> {
        this.#logger.debug('get: query=%o', query);

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('get: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const autos = await this.#service.find(query);
        this.#logger.debug('get: %o', autos);

        // HATEOAS: Atom Links je Auto
        const autosModel = autos.map(
            (auto: Auto): AutoModel => this.#toModel(auto, req, false),
        );
        this.#logger.debug('get: autoModel=%o', autosModel);

        const result: AutosModel = { _embedded: { autos: autosModel } };
        return res.contentType(APPLICATION_HAL_JSON).json(result).send();
    }

    #toModel(auto: Auto, req: Request, all = true): AutoModel {
        const baseUri: string = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = auto;
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug('#toModel: auto=%o, links=%o', auto, links);
        const eigentuemerModel: EigentuemerModel = {
            /* eslint-disable unicorn/consistent-destructuring */
            eigentuemer: auto.eigentuemer?.eigentuemer ?? 'N/A',
            fuehrerscheinnummer: auto.eigentuemer?.fuehrerscheinnummer ?? 'N/A',
            geburtsdatum: auto.eigentuemer?.geburtsdatum ?? 'N/A',
        };

        const autoModel: AutoModel = {
            modellbezeichnung: auto.modellbezeichnung,
            hersteller: auto.hersteller,
            fin: auto.fin,
            kilometerstand: auto.kilometerstand,
            auslieferungstag: auto.auslieferungstag,
            grundpreis: auto.grundpreis,
            istAktuellesModell: auto.istAktuellesModell,
            getriebeArt: auto.getriebeArt,
            eigentuemer: eigentuemerModel,
            _links: links,
        };
        /* eslint-enable unicorn/consistent-destructuring */
        return autoModel;
    }
}
