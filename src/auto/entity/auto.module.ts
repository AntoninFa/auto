import { AuthModule } from '../security/auth/auth.module.js';
import { AutoGetController } from './rest/auto-get.controller.js';
import { AutoMutationResolver } from './graphql/auto-mutation.resolver.js';
import { AutoQueryResolver } from './graphql/auto-query.resolver.js';
import { AutoReadService } from './service/auto-read.service.js';
import { AutoWriteController } from './rest/auto-write.controller.js';
import { AutoWriteService } from './service/auto-write.service.js';
import { MailModule } from '../mail/mail.module.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entity/entities.js';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Autos.
 * @packageDocumentation
 */
@Module({
    imports: [MailModule, TypeOrmModule.forFeature(entities), AuthModule],
    controllers: [AutoGetController, AutoWriteController],
    providers: [
        AutoReadService,
        AutoWriteService,
        AutoQueryResolver,
        AutoMutationResolver,
        QueryBuilder,
    ],
    exports: [AutoReadService, AutoWriteService],
})
export class AutoModule {}
