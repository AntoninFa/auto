/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../../testserver.js';
import { type GraphQLQuery } from '../../auto/auto-mutation.resolver.test.js';
import { type GraphQLResponseBody } from '../../auto/auto-query.resolver.test.js';
import { HttpStatus } from '@nestjs/common';

// TESTS
// eslint-disable-next-line max-lines-per-function
describe('Login', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver hochfahren und Verbindung mit DB aufbauen.
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Login', async () => {
        const username = 'admin';
        const password = 'p'; // NOSONAR
        const body: GraphQLQuery = {
            query: `
                mutation {
                    login(
                        username: "${username}",
                        password: "${password}"
                    ) {
                        token
                    }
                }
            `,
        };
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).not.toBeNull();
        expect(data.data!.login).not.toBeNull();

        const { login } = data.data!;

        expect(login).toBeDefined();
        expect(login).not.toBeNull();

        const { token } = login;

        expect(token).toBeDefined();
        expect(token).not.toBeNull();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const tokenParts = token.split('.');

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(tokenParts).toHaveLength(3);
        expect(token).toMatch(/^[a-z\d]+\.[a-z\d]+\.[\w-]+$/iu);
    });

    test('Login mit falschem Passwort', async () => {
        const username = 'admin';
        const password = 'FALSCH'; // NOSONAR
        const body: GraphQLQuery = {
            query: `
                mutation {
                    login(
                        username: "${username}",
                        password: "${password}"
                    ) {
                        token
                    }
                }
            `,
        };
        const response: AxiosResponse<GraphQLResponseBody> = await client.post(
            graphqlPath,
            body,
        );
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.login).toBeNull();

        const { errors } = data;

        expect(errors).toBeDefined();
        expect(errors!).toHaveLength(1);

        const error = errors![0]!;
        const { message, path, extensions } = error;

        expect(message).toBe('Benutzername, oder Passwort sind falsch');
        expect(path).toBeDefined();
        expect(path!![0]).toBe('login');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-extra-non-null-assertion */
