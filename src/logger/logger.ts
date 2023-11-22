import { type SonicBoom } from 'sonic-boom';
import { parentLogger } from '../config/logger.js';
import type pino from 'pino';

/**
 * Klasse, um ein Logger-Objekt von Pino zu erzeugen mit {@linkcode getLogger}
 * @param context Der Kontext
 * @param kind i.a. `class`
 */
export const getLogger: (
    context: string,
    kind?: string,
) => pino.Logger<pino.ChildLoggerOptions & SonicBoom> = (
    context: string,
    kind = 'class',
) => {
    const bindings: Record<string, string> = {};
    // eslint-disable-next-line security/detect-object-injection
    bindings[kind] = context;

    return parentLogger.child(bindings);
};
