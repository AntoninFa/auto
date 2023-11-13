/**
 * Das Modul besteht aus der Controller-Klasse für Schreiben an der REST-Schnittstelle.
 * @packageDocumentation
 */

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AutoDTO, AutoDtoOhneRef } from './autoDTO.entity.js';
import { Request, Response } from 'express';
import { type Ausstattung } from '../entity/ausstattung.entity.js';
import { type Auto } from '../entity/auto.entity.js';
import { AutoWriteService } from '../service/auto-write.service.js';
import { type Eigentuemer } from '../entity/eigentuemer.entity.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';
import { JwtAuthGuard } from '../../security/auth/jwt/jwt-auth.guard.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { RolesAllowed } from '../../security/auth/roles/roles-allowed.decorator.js';
import { RolesGuard } from '../../security/auth/roles/roles.guard.js';

const MSG_FORBIDDEN = 'Kein Token mit ausreichender Berechtigung vorhanden';
/**
 * Die Controller-Klasse für die Verwaltung von Autos.
 */
@Controller(paths.rest)
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Auto REST-API')
@ApiBearerAuth()
export class AutoWriteController {
    readonly #service: AutoWriteService;

    readonly #logger = getLogger(AutoWriteController.name);

    constructor(service: AutoWriteService) {
        this.#service = service;
    }

    /**
     * Asynchronse Anlegen eines neuen Autos. Das neu anzulegende Auto ist als
     * JSON-Datensatz im Request-Objekt enthalten. Bei erfolgreichen Anlegen 
     * wird der Statuscode `201` (`Created`) gesetzt und der `Location`-Header 
     * ermöglicht das Abrufen des neuen Autos.
     *
     * Bei Verletzungen von Constraints oder wenn die Fin bereits existiert
     * wird der Statuscode `400` (`Bad Request`) gesetzt.
     *
     * @param auto JSON-Daten für ein Auto im Request-Body.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Post()
    @RolesAllowed('admin', 'verkaeufer')
    @ApiOperation({ summary: 'Ein neues Auto anlegen' })
    @ApiCreatedResponse({ description: 'Erfolgreich neu angelegt' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Autodaten' })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async post(
        @Body() autoDTO: AutoDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug('post: autoDTO=%o', autoDTO);

        const auto = this.#autoDtoToAuto(autoDTO);
        const result = await this.#service.create(auto);

        const location = `${getBaseUri(req)}/${result}`;
        this.#logger.debug('post: location=%s', location);
        return res.location(location).send();
    }

    /**
     * Asynchrone Aktualisierung eines vorhandenen Autos. Die ID des zu
     * aktualisierenden Autos muss als Pfad-Parameter im Express Request-Objekt 
     * enthalten sein. Der JSON-Datensatz des zu aktualisierenden Autos muss
     * im Request-Body vorhanden sein. Zur Durchführung der Aktualisierung
     * muss der Header das If-Match-Feld mit der korrekten Versionsnummer für 
     * die optimistische Synchronisation enthalten.
     * 
     * Bei erfolgreicher Aktualisierung wird der Statuscode `204` (`No Content`) 
     * gesetzt, und der Header enthält auch die neue Versionsnummer als ETag.
     * 
     * Falls die Versionsnummer fehlt, wird der Statuscode `428` (`Precondition
     * required`) gesetzt, bei inkorrekter Versionsnummer wird der Statuscode `412`
     * (`Precondition failed`) gesetzt. Bei Verletzungen von Constraints oder wenn
     *  die Fin bereits existiert wird der Statuscode `400` (`Bad Request`) gesetzt.
     *
     * @param auto Autodaten im Request-Body.
     * @param id Pfad-Paramater für die ID.
     * @param version Versionsnummer aus dem Header _If-Match_.
     * @param res Leeres Express Response-Objekt .
     * @returns Leeres Promise-Objekt.
     */
    @Put(':id')
    @RolesAllowed('admin', 'verkaeufer')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Ein vorhandenes Auto aktualisieren',
        tags: ['Aktualisieren'],
    })
    @ApiHeader({
        name: 'If-Match',
        description: 'Header für optimistische Synchronisation',
        required: false,
    })
    @ApiNoContentResponse({ description: 'Erfolgreich aktualisiert' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Autodaten' })
    @ApiPreconditionFailedResponse({
        description: 'Falsche Version im Header "If-Match"',
    })
    @ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        description: 'Header "If-Match" fehlt',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async put(
        @Body() autoDTO: AutoDtoOhneRef,
        @Param('id') id: number,
        @Headers('If-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug(
            'put: id=%s, autoDTO=%o, version=%s',
            id,
            autoDTO,
            version,
        );

        if (version === undefined) {
            const msg = 'Header "If-Match" fehlt';
            this.#logger.debug('put: msg=%s', msg);
            return res
                .status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'application/json')
                .send(msg);
        }

        const auto = this.#autoDtoOhneRefToAuto(autoDTO);
        const neueVersion = await this.#service.update({ id, auto, version });
        this.#logger.debug('put: version=%d', neueVersion);
        return res.header('ETag', `"${neueVersion}"`).send();
    }

    /**
     * Löschung eines Autos durch Angabe seiner ID als Pfad-Parameter.
     * Der zurückgelieferte Statuscode ist `204` (`No Content`).
     *
     * @param id Pfad-Paramater für die ID.
     * @param res Leeres Express Response-Objekt.
     * @returns Leeres Promise-Objekt.
     */
    @Delete(':id')
    @RolesAllowed('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Auto mit der ID löschen' })
    @ApiNoContentResponse({
        description: 'Das Auto wurde gelöscht oder war nicht vorhanden',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async delete(@Param('id') id: number) {
        this.#logger.debug('delete: id=%s', id);
        await this.#service.delete(id);
    }

    #autoDtoToAuto(autoDTO: AutoDTO): Auto {
        const eigentuemerDTO = autoDTO.eigentuemer;
        const eigentuemer: Eigentuemer = {
            id: undefined,
            eigentuemer: eigentuemerDTO.eigentuemer,
            geburtsdatum: eigentuemerDTO.geburtsdatum,
            fuehrerscheinnummer: eigentuemerDTO.fuehrerscheinnummer,
            auto: undefined,
        };
        const ausstattungen = autoDTO.ausstattungen?.map((ausstattungDTO) => {
            const ausstattung: Ausstattung = {
                id: undefined,
                bezeichnung: ausstattungDTO.bezeichnung,
                preis: ausstattungDTO.preis,
                verfuegbar: ausstattungDTO.verfuegbar,
                auto: undefined,
            };
            return ausstattung;
        });
        const auto = {
            id: undefined,
            version: undefined,
            modellbezeichnung: autoDTO.modellbezeichnung,
            hersteller: autoDTO.hersteller,
            fin: autoDTO.fin,
            kilometerstand: autoDTO.kilometerstand,
            auslieferungstag: autoDTO.auslieferungstag,
            grundpreis: autoDTO.grundpreis,
            istAktuellesModell: autoDTO.istAktuellesModell,
            getriebeArt: autoDTO.getriebeArt,
            eigentuemer,
            ausstattungen,
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        // Rueckwaertsverweise
        auto.eigentuemer.auto = auto;
        auto.ausstattungen?.forEach((ausstattung) => {
            ausstattung.auto = auto;
        });
        return auto;
    }

    #autoDtoOhneRefToAuto(autoDTO: AutoDtoOhneRef): Auto {
        return {
            id: undefined,
            version: undefined,   
            modellbezeichnung: autoDTO.modellbezeichnung,
            hersteller: autoDTO.hersteller,
            fin: autoDTO.fin,
            kilometerstand: autoDTO.kilometerstand,
            auslieferungstag: autoDTO.auslieferungstag,
            grundpreis: autoDTO.grundpreis,
            istAktuellesModell: autoDTO.istAktuellesModell,
            getriebeArt: autoDTO.getriebeArt,
            eigentuemer: undefined,
            ausstattungen: undefined,
            erzeugt: undefined,
            aktualisiert: undefined,
        };
    }
}