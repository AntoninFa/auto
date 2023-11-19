import { Global, Module } from '@nestjs/common';
import { BannerService } from './banner.service.js';
import { ResponseTimeInterceptor } from './response-time.interceptor.js';

/**
 * Das Modul besteht aus allgemeinen Services, z.B. dem MailService.
 * @packageDocumentation
 */

/**
 * Die Modul-Klasse mit den Service-Klassen.
 */
@Global()
@Module({
    providers: [BannerService, ResponseTimeInterceptor],
    exports: [BannerService, ResponseTimeInterceptor],
})
export class LoggerModule {}
