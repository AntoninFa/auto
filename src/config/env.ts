/**
 * Dieses Modul enthält Objekte mit Daten aus den Umgebungsvariablen.
 * @packageDocumentation
 */

import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config();
const { NODE_ENV, LOG_DEFAULT, START_DB_SERVER } = process.env; // eslint-disable-line n/no-process-env

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Umgebungsvariable zur Konfiguration
 */
export const env = {
    NODE_ENV,
    LOG_DEFAULT,
    START_DB_SERVER,
} as const;
/* eslint-enable @typescript-eslint/naming-convention */
