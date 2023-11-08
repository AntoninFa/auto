/**
 * Dieses Modul führt Health- und Statuschecks durch.
 */
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { Module } from '@nestjs/common';

@Module({
    imports: [HttpModule, TerminusModule],
    controllers: [HealthController],
})
export class HealthModule {}