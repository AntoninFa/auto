/**
 * Klasse Query-Builder ermöglicht die Abfrage von Autos.
 */
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { Auto } from '../entity/auto.entity.js';
import { Eigentuemer } from '../entity/eigentuemer.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { type Suchkriterien } from './auto-read.service.js';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für die Autosuche.
 */
export interface BuildIdParams {
    readonly id: number;
    readonly mitAusstattung?: boolean;
}

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen von Autos und greift
 * mit TypeORM auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #autoAlias: string = `${Auto.name
        .charAt(0)
        .toLowerCase()}${Auto.name.slice(1)}`;

    readonly #eigentuemerAlias: string = `${Eigentuemer.name
        .charAt(0)
        .toLowerCase()}${Eigentuemer.name.slice(1)}`;

    readonly #ausstattungAlias: string = `${Ausstattung.name
        .charAt(0)
        .toLowerCase()}${Ausstattung.name.slice(1)}`;

    readonly #repo: Repository<Auto>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Auto) repo: Repository<Auto>) {
        this.#repo = repo;
    }

    /**
     * Ein Auto mit der ID suchen
     * @param id ID des gesuchten Autos
     * @returns QueryBuilder
     */
    buildId({ id, mitAusstattung = false }: BuildIdParams) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#autoAlias}.eigentuemer`,
            this.#eigentuemerAlias,
        );

        if (mitAusstattung) {
            queryBuilder.leftJoinAndSelect(
                `${this.#autoAlias}.ausstattung`,
                this.#ausstattungAlias,
            );
        }
        queryBuilder.where(`${this.#autoAlias}.id = :id`, { id });
        return queryBuilder;
    }

    /**
     * Autos asynchron suchen
     * @param suchkriterien JSON-Objekt mit den Suchkriterien
     * @returns Querybuilder
     */
    build({ eigentuemer, ausstattung, ...props }: Suchkriterien) {
        this.#logger.debug(
            'build: eigentuemer=%s, props=%o',
            eigentuemer,
            props,
        );

        let queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#autoAlias}.eigentuemer`,
            'eigentuemer',
        );

        let useWhere = true;
        if (eigentuemer !== undefined && typeof eigentuemer === 'string') {
            const ilike = 'ilike';
            queryBuilder = queryBuilder.where(
                `${this.#eigentuemerAlias}.eigentuemer ${ilike} :eigentuemer`,
                { eigentuemer: `%${eigentuemer}%` },
            );
            useWhere = false;
        }

        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            param[key] = (props as Record<string, any>)[key];
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
