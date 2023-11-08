/**
 * Dieses Modul enthält die Controler-Klasse zur Überprüfung der Healthyness.
 * @packageDocumentation
 */

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import {
    HealthCheckService,
    HealthCheck,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';

/**
 * Klasse, welche die Health-Checks durchführt.
 */
@Controller('health')
@ApiTags('Health')
export class HealthController {
    readonly #health: HealthCheckService;
    readonly #typeorm: TypeOrmHealthIndicator;
    constructor(health: HealthCheckService, typeorm: TypeOrmHealthIndicator) {
        this.#health = health;
        this.#typeorm = typeorm;
    }

    @Get('liveness')
    @HealthCheck()
    @ApiOperation({ summary: 'Auf Liveness prüfen' })
    live() {
        return this.#health.check([
            () => ({
                appserver: {
                    status: 'up',
                },
            }),
        ]);
    }

    @Get('readiness')
    @HealthCheck()
    @ApiOperation({ summary: 'Auf Readiness prüfen' })
    ready() {
        return this.#health.check([() => this.#typeorm.pingCheck('db')]);
    }
}