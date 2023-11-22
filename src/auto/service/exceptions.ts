/**
 * Dieses Modul enthält Ausnahmen zur Fehlerbehandlung bei DB-Zugriffen.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import { HttpException, HttpStatus } from '@nestjs/common';
/**
 * Ausnahme, falls die fin eines anzulegenden Autos bereits verwendet wird.
 */
export class FinAlreadyExistsException extends HttpException {
    constructor(readonly fin: string) {
        super(
            `Es existiert berits ein Auto mit der fin: ${fin}`,
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Ausnahme, bei ungültiger Versionsnummer.
 */
export class VersionInvalidException extends HttpException {
    constructor(readonly version: string | undefined) {
        super(
            `ungültige Versionsnummer: ${version}`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}

/**
 * Ausnahme, falls die Versionsnummer veraltet ist.
 */
export class VersionOutdatedException extends HttpException {
    constructor(readonly version: number) {
        super(
            `Veraltete Versionsnummer: ${version}`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}
