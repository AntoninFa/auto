import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { AutoModel, type AutosModel } from '../../src/auto/rest/auto-get.controller.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';
import { Eigentuemer } from '../../src/auto/entity/eigentuemer.entity';
import { EigentuemerModel } from '../../src/auto/rest/auto-get.controller';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const eigentuemerVorhanden = 'a';
const eigentuemerNichtVorhanden = 'xx';
const modellbezeichnungVorhanden = 'javascript';
const modellbezeichnungNichtVorhanden = 'csharp';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /rest', () => {
    let baseURL: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}/rest`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Alle Autos', async () => {
        // given

        // when
        const response: AxiosResponse<AutosModel> = await client.get('/');

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu); // eslint-disable-line sonarjs/no-duplicate-string
        expect(data).toBeDefined();

        const { autos } = data._embedded;

        autos
            .map((auto : AutoModel) => auto._links.self.href)
            .forEach((selfLink : string) => {
                // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                expect(selfLink).toMatch(new RegExp(`^${baseURL}`, 'u'));
            });
    });

    test('Autos mit einem Teil-Eigentuemer suchen', async () => {
        // given
        const params = { eigentuemer: eigentuemerVorhanden };

        // when
        const response: AxiosResponse<AutosModel> = await client.get('/', {
            params,
        });

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data).toBeDefined();

        const { autos } = data._embedded;

        // Jedes Auto hat einen Eigentuemer mit dem Teilstring 'a'
        autos
            .map((auto : AutoModel) => auto.eigentuemer)
            .forEach((eigentuemer : EigentuemerModel) =>
                expect(eigentuemer.eigentuemer.toLowerCase()).toEqual(
                    expect.stringContaining(eigentuemerVorhanden),
                ),
            );
    });

    test('Autos zu einem nicht vorhandenen Teil-Eigentuemer suchen', async () => {
        // given
        const params = { eigentuemer: eigentuemerNichtVorhanden };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Mind. 1 Auto mit vorhandener Modellbezeichnung', async () => {
        // given
        const params = { [modellbezeichnungVorhanden]: 'true' };

        // when
        const response: AxiosResponse<AutosModel> = await client.get('/', {
            params,
        });

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        // JSON-Array mit mind. 1 JSON-Objekt
        expect(data).toBeDefined();

        const { autos } = data._embedded;

        // Jedes Auto hat im Array der Modellbezeichnungen z.B. "javascript"
        autos
            .map((auto : AutoModel) => auto.modellbezeichnung)
            .forEach((modellbezeichnung : string) =>
                expect(modellbezeichnung).toEqual(
                    expect.arrayContaining([modellbezeichnungVorhanden.toUpperCase()]),
                ),
            );
    });

    test('Keine Autos zu einem nicht vorhandenen modellbezeichnung', async () => {
        // given
        const params = { [modellbezeichnungNichtVorhanden]: 'true' };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Keine Autos zu einer nicht-vorhandenen Property', async () => {
        // given
        const params = { foo: 'bar' };

        // when
        const response: AxiosResponse<ErrorResponse> = await client.get('/', {
            params,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NOT_FOUND);

        const { error, statusCode } = data;

        expect(error).toBe('Not Found');
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    });
});
/* eslint-enable no-underscore-dangle */
