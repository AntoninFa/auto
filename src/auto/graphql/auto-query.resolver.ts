import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { Auto } from '../entity/auto.entity.js';
import { AutoReadService } from '../service/auto-read.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';

export interface IdInput {
    readonly id: number;
}

@Resolver((_: any) => Auto)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoQueryResolver {
    readonly #service: AutoReadService;

    readonly #logger = getLogger(AutoQueryResolver.name);

    constructor(service: AutoReadService) {
        this.#service = service;
    }

    @Query('auto')
    async findById(@Args() idInput: IdInput) {
        const { id } = idInput;
        this.#logger.debug('findById: id=%d', id);

        const auto = await this.#service.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: auto=%s, eigentuemer=%o',
                auto.toString(),
                auto.eigentuemer,
            );
        }
        return auto;
    }

    @Query('autos')
    async find(@Args() eigentuemer: { eigentuemer: string } | undefined) {
        const eigentuemerStr = eigentuemer?.eigentuemer;
        this.#logger.debug('find: Suchkriterium eigentuemer=%s', eigentuemerStr);
        const suchkriterium = eigentuemerStr === undefined ? {} : { fin: eigentuemerStr };

        const autos = await this.#service.find(suchkriterium);

        this.#logger.debug('find: autos=%o', autos);
        return autos;
    }
}