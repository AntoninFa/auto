import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AutoDTO } from '../../src/auto/rest/autoDTO.entity.js';
import { AutoReadService } from '../../src/auto/service/auto-read.service.js';
import { type ErrorResponse } from './error-response.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

// TESTDATEN
const neuesAuto: AutoDTO = {
    modellbezeichnung: 'Golf',
    hersteller: 'VOLKSWAGEN',
    fin: '1HGCM82633A123477',
    kilometerstand: 101,
    auslieferungstag: '2022-01-01',
    grundpreis: 250_000.5,
    istAktuellesModell: true,
    getriebeArt: 'MANUELL',
    eigentuemer: {
        eigentuemer: 'Karl Heinz',
        geburtsdatum: '1980-05-15',
        fuehrerscheinnummer: 'HKA321',
    },
    ausstattungen: [
        {
            bezeichnung: 'Sitzheitzung',
            preis: 22.2,
            verfuegbar: true,
        },
    ],
};

const neuesAutoInvalid: Record<string, unknown> = {
    modellbezeichnung: '1234jsadklfjsdkfk4jklejlfksdjajsdafjdflded',
    hersteller: '_',
    fin: 'sdfjV',
    kilometerstand: -101,
    auslieferungstag: '2022-02-30',
    grundpreis: -250_000.5,
    istAktuellesModell: true,
    getriebeArt: 'FALSCH',
    eigentuemer: {
        eigentuemer: '1234jsadklfjsdkfk4jklejlfksdjajsdafjdflded',
        geburtsdatum: '2022-02-30',
        fuehrerscheinnummer: '1234jsadklfjsdkfk4jVBSDJSK',
    },
};
const neuesAutoMitExFin: AutoDTO = {
    modellbezeichnung: 'Golf',
    hersteller: 'VOLKSWAGEN',
    fin: '1HGCM82633A123456',
    kilometerstand: 101,
    auslieferungstag: '2022-01-01',
    grundpreis: 250_000.5,
    istAktuellesModell: true,
    getriebeArt: 'MANUELL',
    eigentuemer: {
        eigentuemer: 'Karl Heinz',
        geburtsdatum: '1980-05-15',
        fuehrerscheinnummer: 'HKA321',
    },
    ausstattungen: [
        {
            bezeichnung: 'Sitzheitzung',
            preis: 22.2,
            verfuegbar: true,
        },
    ],
};

// TESTS
// eslint-disable-next-line max-lines-per-function
describe('POST /rest', () => {
    let client: AxiosInstance;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
    };

    // Testserver hochfahren und Verbindung mit DB aufbauen.
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Neues Auto', async () => {
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<string> = await client.post(
            '/rest',
            neuesAuto,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.CREATED);

        const { location } = response.headers as { location: string };

        expect(location).toBeDefined();

        const indexLastSlash: number = location.lastIndexOf('/');

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(AutoReadService.ID_PATTERN.test(idStr)).toBe(true);
        expect(data).toBe('');
    });

    test('Neues Auto mit ungueltigen Daten', async () => {
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;
        const expectedMsg = [
            expect.stringMatching(/^eigentuemer.eigentuemer /u),
            expect.stringMatching(/^eigentuemer.fuehrerscheinnummer /u),
            expect.stringMatching(/^modellbezeichnung /u),
            expect.stringMatching(/^hersteller /u),
            expect.stringMatching(/^fin /u),
            expect.stringMatching(/^kilometerstand /u),
            expect.stringMatching(/^auslieferungstag /u),
            expect.stringMatching(/^grundpreis /u),
            expect.stringMatching(/^getriebeArt /u),
        ];
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAutoInvalid,
            { headers },
        );
        const { status, data } = response;

        expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const messages: string[] = data.message;

        expect(messages).toBeDefined();
        expect(messages).toHaveLength(expectedMsg.length);
        expect(messages).toEqual(expect.arrayContaining(expectedMsg));
    });

    test('Neues Auto, mit bereits existierender fin', async () => {
        const token = await loginRest(client);
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<ErrorResponse> = await client.post(
            '/rest',
            neuesAutoMitExFin,
            { headers },
        );
        const { data } = response;

        const { message, statusCode } = data;

        expect(message).toEqual(expect.stringContaining('ISBN'));
        expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    test('Neues Auto nur als "admin"/"fachabteilung', async () => {
        const token = await loginRest(client, 'adriana.alpha', 'p');
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAuto,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Neues Auto, aber ohne Token', async () => {
        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAuto,
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Neues Auto, aber mit falschem Token', async () => {
        const token = 'FALSCH';
        headers.Authorization = `Bearer ${token}`;

        const response: AxiosResponse<Record<string, any>> = await client.post(
            '/rest',
            neuesAuto,
            { headers },
        );

        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test.todo('Abgelaufener Token');
});
