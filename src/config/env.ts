/**
 * Dieses Modul enthält Objekte mit Daten aus den Umgebungsvariablen.
 * @packageDocumentation
 */

import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config();
const { NODE_ENV, LOG_DEFAULT, START_DB_SERVER } = process.env;
/**
 * Die Umgebungsvariable
 */
export const env = {
    NODE_ENV, // kann Wert production(Cloud), development oder test annehmen
    LOG_DEFAULT,
    START_DB_SERVER,
} as const;
