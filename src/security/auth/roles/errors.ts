/**
 * Dieses Modul enthält die Klassen {@linkcode NoTokenError} und
 * {@linkcode UserInvalidError} welche Fehlerbehandlung erleichtern.
 * @packageDocumentation
 */
/* eslint-disable max-classes-per-file */

/**
 * Fehler-Klasse falls es keinen JSON Web Token gab.
 */
export class NoTokenError extends Error {
    constructor() {
        super('Es gibt keinen Token');
        this.name = 'NoTokenError';
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
/**
 * Fehler-Klasse für den Fall, dass es zu einem Request einen JSON Web Token gibt,
 * aber keinen dazugehörigen User.
 */
export class UserInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserInvalidError';
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
/* eslint-enable max-classes-per-file */
