/**
 * Dieses Modul enthält die {@linkcode Auto-WriteService} Klasse,
 * als Abstraktion von Schreiboperationen im Anwendungskern und DB-Zugriffen.
 * @packageDocumentation
 */

import RE2 from 're2';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    FinAlreadyExistsException,
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { Auto } from '../entity/auto.entity.js';
import { getLogger } from '../../logger/logger.js';
import { type DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AutoReadService } from './auto-read.service.js';
import { Eigentuemer } from '../entity/eigentuemer.entity.js';
import { Ausstattung } from '../entity/ausstattung.entity.js';

/**
 * Typdefinitionen, die die Struktur eines Objekt vorgeben, das zum Updaten
 * übergeben werden soll.
 */
export interface UpdateParams {
    /**
     * Die ID des Autos auf dem die Schreiboperation ausgeführt werden soll.
     */
    readonly id: number | undefined;
    /**
     * Resultierendes Auto-Objekt.
     */
    readonly auto: Auto;
    /**
     * Kennzeichnung der Version
     */
    readonly version: string;
}

/**
 *  Implementierung von Schreiboperationen im Anwendungskern und DB-Zugriff.
 */
@Injectable()
export class AutoWriteService {
    private static readonly VERSION_PATTERN: RE2 =new RE2('^"\\d*"');
    readonly #repo: Repository<Auto>;
    readonly #readService: AutoReadService;
    readonly #logger = getLogger(AutoWriteService.name);
    //TODO Mail Service

    constructor(
        @InjectRepository(Auto) repo: Repository<Auto>,
        readService: AutoReadService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
    }

    /**
     * Anlegen eines neuen Autos.
     * @param auto Auto das angelegt werden soll.
     * @returns Die dem angelegten Auto zugehörige ID.
     */
    async create(auto: Auto): Promise<number> {
        this.#logger.debug('create: auto=%o', auto);
        await this.#validateCreate(auto);
        const autoDb = await this.#repo.save(auto);
        this.#logger.debug('create: autoDb=%o', autoDb);
        //TODO Mail
        return autoDb.id!;
    }

    async #validateCreate(auto: Auto): Promise<undefined> {
        this.#logger.debug('#validateCreate: auto=%o', auto);

        const { fin } = auto;
        try {
            await this.#readService.find({ fin: fin});
        } catch (err) {
            if (err instanceof NotFoundException) {
                return;
            }
        }
        throw new FinAlreadyExistsException(fin);
    }

    /**
     * Aktualisierung eines bereits existierenden Autos.
     * @param auto Auto welches aktualisiert werden soll.
     * @param id ID des zu aktualisierenden Autos.
     * @param version Die Versionsnummer.
     * @returns Die neue Versionsnummer.
     * @throws VersionInvalidException bei ungültiger Versionsnummer.
     * @throws VersionOutdatedException bei veralteter Versionsnummer.
     */
    async update({id, auto, version}: UpdateParams): Promise<number> {
        this.#logger.debug(
            'update: id=%d, auto=%o, version=%s',
            id,
            auto,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: ID ist ungueltig');
            throw new NotFoundException(`Es existiert kein Auto mit ID: ${id}.`);
        }
        const validateResult = await this.#validateUpdate(auto, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Auto)) {
            return validateResult;
        }
        const autoNeu = validateResult;
        const merged = this.#repo.merge(autoNeu, auto);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged);
        this.#logger.debug('update: updated=%o', updated);
        return updated.version!;
    }

    async #validateUpdate(
        auto: Auto,
        id: number,
        version: string,
    ): Promise<Auto> {
        const versionNum = this.#validateVersion(version);
        this.#logger.debug(
            `#validateUpdate: Version: ${versionNum}, auto: auto=%o `,
            auto,
        );
        const resultFindById = await this.#findByIdAndCheckVersion(id, versionNum);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): number {
        this.#logger.debug('#validateVersion: version=%s', version);
        if (
            version === undefined ||
            !AutoWriteService.VERSION_PATTERN.test(version)
        ) {
            throw new VersionInvalidException(version);
        }
        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #findByIdAndCheckVersion(id: number, version: number): Promise<Auto> {
        const autoDB = await this.#readService.findById({ id });
        const versionDB = autoDB.version!;
        if (version < versionDB) {
            this.#logger.debug(
                '#findByIdAndCheckVersion: VersionOutdated=%d',
                version,
            );
            throw new VersionOutdatedException(version);
        }
        return autoDB;
    }

    /**
     * Löschen eines Autos durch seine ID.
     * 
     * @param id ID des zu löschenden Autos.
     * @returns true, bei erfolgreichem löschen. Sonst false.
     */
    async delete(id: number): Promise<boolean> {
        this.#logger.debug('delete: id: %d', id);
        const auto = await this.#readService.findById({
            id,
            mitAusstattung: true,
        });
        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            
            const eigentuemerID = auto.eigentuemer?.id;
            if (eigentuemerID !== undefined) {
                await transactionalMgr.delete(Eigentuemer, eigentuemerID);
            }
            const ausstattungen = auto.ausstattungen ?? [];
            for (const ausstattung of ausstattungen) {
                await transactionalMgr.delete(Ausstattung, ausstattung.id);
            }
            deleteResult = await transactionalMgr.delete(Auto, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });
        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }
}