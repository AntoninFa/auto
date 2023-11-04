/**
 * Die Klasse enthält die Konfiguration für den Datenbank-Zugriff. 
 * @packageDocumentation
 */
import { config } from './app.js';
import { Auto } from '../auto/entity/auto.entity.js';
import { type DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbType } from './dbtype.js';
import { entities } from '../auto/entity/entities.js';
import { loggerDefaultValue } from './logger.js';
import { nodeConfig } from './node.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const {db} = config; 

const database : string = (db?.name as string | undefined) ?? Auto.name.toLowerCase();

const host = (db?.host as string | undefined) ?? 'localhost';
const username =
    (db?.username as string | undefined) ?? Auto.name.toLowerCase();
const pass = (db?.password as string | undefined) ?? 'p';
const passAdmin = (db?.passwordAdmin as string | undefined) ?? 'p';

const namingStrategy = new SnakeNamingStrategy();

const logging =
    (nodeConfig.nodeEnv === 'development' || nodeConfig.nodeEnv === 'test') &&
    !loggerDefaultValue;
const logger = 'advanced-console';

export const dbResourcesDir = resolve(nodeConfig.resourcesDir, 'db', dbType);

export let typeOrmModuleOptions: TypeOrmModuleOptions;
    {
        const cert = readFileSync(resolve(dbResourcesDir, 'certificate.cer'));
        typeOrmModuleOptions = {
            type: 'postgres',
            host,
            port: 5432,
            username,
            password: pass,
            database,
            entities,
            namingStrategy,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
    }
    Object.freeze(typeOrmModuleOptions);

    if (!loggerDefaultValue) {
        const { password, ssl, ...typeOrmModuleOptionsLog } =
            typeOrmModuleOptions as any;
        console.debug('typeOrmModuleOptions: %o', typeOrmModuleOptionsLog);
    }
    export const dbPopulate = db?.populate === true;
    export const adminDataSourceOptions: DataSourceOptions =
        {
            type: 'postgres',
            host,
            port: 5432,
            username: 'postgres',
            password: passAdmin,
            database,
            schema: database,
            namingStrategy,
            logging,
            logger,
        };
        
