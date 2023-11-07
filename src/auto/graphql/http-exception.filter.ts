/**
 * Dieses Modul enthält die Klasse {@linkcode HttpExceptionFilter} welche HttpExceptions 
 * filtert um bessere Fehlermeldungen bereitzustellen.
 * @packageDocumentation
 */

import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { BadUserInputError } from './errors.js';

/**
 * Filtert HttpExceptions für Benutzerfreundlichere Fehlermeldungen.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, _host: ArgumentsHost) {
        const { message }: { message: string } = exception.getResponse() as any;
        throw new BadUserInputError(message, exception);
    }
}
