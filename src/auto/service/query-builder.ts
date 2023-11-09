/**
 * Klasse Query-Builder ermöglicht die Abfrage von Autos. 
 */
import {Auto} from '../entity/auto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Ausstattung } from '../entity/ausstattung.entity.js';
import { Eigentuemer } from '../entity/eigentuemer.entity.js';
import { type Suchkriterien } from './auto-read.service.js';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getLogger } from '../../logger/logger';

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



    readonly #eigentuemerAlias: string =  `${Eigentuemer.name
        .charAt(0)
        .toLowerCase()}${Eigentuemer.name.slice(1)}`;

    readonly #ausstattungAlias: string =  `${Ausstattung.name
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
    buildId({ id, mitAusstattung = false}: BuildIdParams): SelectQueryBuilder<Auto> {
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
        queryBuilder.where(`${this.#autoAlias}.id = :id`, { id: id });
        return queryBuilder;
    }

    /**
     * Autos asynchron suchen
     * @param suchkriterien JSON-Objekt mit den Suchkriterien 
     * @returns Querybuilder
     */
    build({ eigentuemer, ausstattung, javascript, typescript, ...props }: Suchkriterien) {
        this.#logger.debug(
            'build: eigentuemer=%s, ausstattung=%s, javascript=%s, typescript=%s, props=%o',
            eigentuemer, 
            ausstattung, 
            javascript,
            typescript,
            props,
        );

        let queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);
        queryBuilder.innerJoinAndSelect(`${this.#autoAlias}.`, 'eigentuemer');

        let useWhere: boolean = true; 

        if (javascript === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.schlagwoerter like '%JAVASCRIPT%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.schlagwoerter like '%JAVASCRIPT%'`,
                  );
            useWhere = false;
        }

        if (typescript === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.schlagwoerter like '%TYPESCRIPT%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.schlagwoerter like '%TYPESCRIPT%'`,
                  );
            useWhere = false;
        }

        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
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