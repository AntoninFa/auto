/**
 * Dieses Modul enthält funktionen um die DB neu zu laden.
 * @packageDocumentation
 */

import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import {
    adminDataSourceOptions,
    dbPopulate,
    dbResourcesDir,
    typeOrmModuleOptions,
} from '../db.js';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { getLogger } from '../../logger/logger.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Neu aufbauen der DB im Development-Modus.
 */
@Injectable()
export class DbPopulateService implements OnApplicationBootstrap {
    readonly #tabellen = ['auto', 'eigentuemer', 'ausstattung'];

    readonly #datasource: DataSource;

    readonly #resourcesDir = dbResourcesDir;

    readonly #logger = getLogger(DbPopulateService.name);

    /**
     * Initialisierung durch DI mit `DataSource` für SQL-Queries.
     */
    constructor(@InjectDataSource() dataSource: DataSource) {
        this.#datasource = dataSource;
    }

    /**
     * Die Test-DB wird im Development-Modus neu geladen.
     */
    async onApplicationBootstrap() {
        await this.populateTestdaten();
    }

    async populateTestdaten() {
        if (!dbPopulate) {
            return;
        }
        this.#logger.warn(`${typeOrmModuleOptions.type}: DB wird neu geladen`);
        await this.#populatePostgres();
        this.#logger.warn('DB wurde neu geladen');
    }

    async #populatePostgres() {
        const dropScript = resolve(this.#resourcesDir, 'drop.sql');
        const dropStatements = readFileSync(dropScript, 'utf8'); // eslint-disable-line security/detect-non-literal-fs-filename,n/no-sync
        await this.#datasource.query(dropStatements);
        const createScript = resolve(this.#resourcesDir, 'create.sql');
        const createStatements = readFileSync(createScript, 'utf8'); // eslint-disable-line security/detect-non-literal-fs-filename,n/no-sync
        await this.#datasource.query(createStatements);
        const dataSource = new DataSource(adminDataSourceOptions);
        await dataSource.initialize();
        await dataSource.query(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `SET search_path TO ${adminDataSourceOptions.database};`,
        );
        const copyStmt =
            "COPY %TABELLE% FROM '/csv/%TABELLE%.csv' (FORMAT csv, DELIMITER ';', HEADER true);";
        for (const tabelle of this.#tabellen) {
            // eslint-disable-next-line unicorn/prefer-string-replace-all
            await dataSource.query(copyStmt.replace(/%TABELLE%/gu, tabelle));
        }
        await dataSource.destroy();
    }
}
