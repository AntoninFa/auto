/**
 * Dieses Modul enthält Konfigurationen für den auf Node basierenden Server.
 * @packageDocumentation
 */

import { RESOURCES_DIR, config } from './app.js';
import { env } from './env.js';
import { hostname } from 'node:os';
import { httpsOptions } from './https.js';

const { NODE_ENV } = env;

const computername = hostname();
const port = (config.node?.port as number | undefined) ?? 3000;

/**
 * Konfigurationen für den auf Node basierenden Server.
 */
export const nodeConfig = {
    host: computername,
    port,
    resourcesDir: RESOURCES_DIR,
    httpsOptions,
    nodeEnv: NODE_ENV as
        | 'development'
        | 'PRODUCTION'
        | 'production'
        | 'test'
        | undefined,
} as const;
