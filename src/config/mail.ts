/**
 * Dieses Modul enthält Konfigurationen für den Mail-Client.
 * @packageDocumentation
 */

import { type Options } from 'nodemailer/lib/smtp-transport';
import { config } from './app.js';
import { loggerDefaultValue } from './logger.js';

const { mail } = config;
const activated = mail?.activated === undefined || mail?.activated === true;
const host = (mail?.host as string | undefined) ?? 'smtp';
const port = (mail?.port as number | undefined) ?? 25;
const logger = mail?.log === true;

/**
 * Konfiguration für den Mail-Client mit _nodemailer_.
 */
export const options: Options = {
    host,
    port,
    secure: false,
    priority: 'normal',
    logger,
} as const;
export const eMailConfig = {
    activated,
    options,
};
Object.freeze(options);
if (!loggerDefaultValue) {
    console.debug('eMailConfig: %o', eMailConfig);
}