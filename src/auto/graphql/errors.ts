/**
 * Dieses Modul enthält die {@linkcode BadUserInputError} Klasse zur 
 * Behandlung von User Input Fehlern.
 * @packageDocumentation
 */

import { GraphQLError } from 'graphql';

/**
 * Klasse die einen Error-Response mit Fehlercode: "BAD_USER_INPUT" produziert.
 */
export class BadUserInputError extends GraphQLError {
    constructor(message: string, exception?: Error) {
        super(message, {
            originalError: exception,
            extensions: {
                code: 'BAD_USER_INPUT',
            },
        });
    }
}
