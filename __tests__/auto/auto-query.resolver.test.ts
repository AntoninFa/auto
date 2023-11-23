import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type Auto } from '../../src/auto/entity/auto.entity.js';
import { type GraphQLFormattedError } from 'graphql';
import { type GraphQLRequest } from '@apollo/server';
import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line jest/no-export
export interface GraphQLResponseBody {
    data?: Record<string, any> | null;
    errors?: readonly [GraphQLFormattedError];
}

type AutoDTO = Omit<Auto, 'ausstattungen' | 'aktualisiert' | 'erzeugt'>;

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = '1';

const eigentuemerVorhanden = 'Max Rimmelspacher';

const teilEigentuemerVorhanden = 'a';

const teilEigentuemerNichtVorhanden = 'abc';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Auto zu vorhandener ID', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${idVorhanden}") {
                        version
                        fin
                        getriebeArt
                        eigentuemer {
                            eigentuemer
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { auto } = data.data!;
        const result: AutoDTO = auto as AutoDTO;

        expect(result.eigentuemer?.eigentuemer).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Auto zu nicht-vorhandener ID', async () => {
        // given
        const id = '420';
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${id}") {
                        eigentuemer {
                            eigentuemer
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.auto).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt kein Auto mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('auto');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Auto zu vorhandenem Eigentuemer', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(eigentuemer: "${eigentuemerVorhanden}") {
                        getriebeArt
                        eigentuemer {
                            eigentuemer
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();

        expect(data.data).toBeDefined();

        const { autos } = data.data!;

        expect(autos).not.toHaveLength(0);

        const autosArray: AutoDTO[] = autos as AutoDTO[];

        expect(autosArray).toHaveLength(1);

        const [auto] = autosArray;

        expect(auto!.eigentuemer?.eigentuemer).toBe(eigentuemerVorhanden);
    });

    test('Auto zu vorhandenem Teil-Eigentuemer', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(eigentuemer: "${teilEigentuemerVorhanden}") {
                        getriebeArt
                        eigentuemer {
                            eigentuemer
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data!;

        expect(autos).not.toHaveLength(0);

        const autosArray: AutoDTO[] = autos as AutoDTO[];
        autosArray
            .map((auto) => auto.eigentuemer)
            .forEach((eigentuemer) =>
                expect(eigentuemer?.eigentuemer.toLowerCase()).toEqual(
                    expect.stringContaining(teilEigentuemerVorhanden),
                ),
            );
    });

    test('Auto zu nicht vorhandenem Eigentuemer', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(eigentuemer: "${teilEigentuemerNichtVorhanden}") {
                        getriebeArt
                        eigentuemer {
                            eigentuemer
                        }
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.autos).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Autos gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('autos');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
});
