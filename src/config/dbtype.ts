/**
 * Dieses Modul definiert die Namen der verschiedenen Datenbank Typen.
 * @packageDocumentation
 */

import { config } from './app.js';

const type: string | undefined = config.db?.type;

export const dbType =
    type === 'postgres' || type === 'mysql' || type === 'sqlite'
        ? (type as string)
        : 'postgres';
