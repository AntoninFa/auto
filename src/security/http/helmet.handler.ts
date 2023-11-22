/**
 * Dieses Modul enthält Security-Funktionen für z.B. CSP, XSS, Click-Jacking,
 * HSTS und MIME-Sniffing, implementiert von helmet.
 * @packageDocumentation
 */

import {
    contentSecurityPolicy,
    frameguard,
    hidePoweredBy,
    hsts,
    noSniff,
    xssFilter,
} from 'helmet';

/**
 * Security-Funktionen.
 */
export const helmetHandlers = [
    contentSecurityPolicy({
        useDefaults: true,
        directives: {
            defaultSrc: ["https: 'self'"],
            scriptSrc: ["https: 'unsafe-inline' 'unsafe-eval'"],
            imgSrc: ["data: 'self'"],
        },
        reportOnly: false,
    }),
    xssFilter(),
    frameguard(),
    hsts(),
    noSniff(),
    hidePoweredBy(),
];
