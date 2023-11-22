/**
 * Dieses Modul enthält die Mail Services.
 * @packageDocumentation
 */

import { MailService } from './mail.service.js';
import { Module } from '@nestjs/common';

/**
 *
 */
@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
