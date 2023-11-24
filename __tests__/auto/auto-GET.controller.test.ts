/* eslint-disable no-underscore-dangle */
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import {
    type AutoModel,
    type AutosModel,
    type EigentuemerModel,
} from '../../src/auto/rest/auto-get.controller.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const eigentuemerVorhanden = 'anna schmidt';
// const eigentuemerNichtVorhanden = 'xx';
// const modellbezeichnungVorhanden = 'A3';
// const modellbezeichnungNichtVorhanden = 'F10';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GET /rest', () => {
    let baseURL: string;
    let baseURLReg: string;
    let client: AxiosInstance;

    beforeAll(async () => {
        await startServer();
        baseURL = `https://${host}:${port}/rest`;
        baseURLReg = `https://${host}:${port}/rest(?:/)+\\d+`;
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
            .map((auto: AutoModel) => auto._links.self.href)
            .forEach((selfLink: string) => {
                // eslint-disable-next-line security/detect-non-literal-regexp, security-node/non-literal-reg-expr
                expect(selfLink).toMatch(new RegExp(`^${baseURLReg}$`, 'iu'));
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
            .map((auto: AutoModel) => auto.eigentuemer)
            .forEach((eigentuemer: EigentuemerModel) =>
                expect(eigentuemer.eigentuemer.toLowerCase()).toEqual(
                    expect.stringContaining(eigentuemerVorhanden),
                ),
            );
    });

    test('Mind. 1 Auto mit vorhandene Eigentuemer', async () => {
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
        // JSON-Array mit mind. 1 JSON-Objekt
        expect(data).toBeDefined();

        const { autos } = data._embedded;

        autos
            .map((auto) => auto.eigentuemer)
            .forEach((eigentuemer) =>
                expect(eigentuemer.eigentuemer.toLowerCase()).toEqual(
                    expect.stringContaining(eigentuemerVorhanden),
                ),
            );
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
