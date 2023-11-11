import { RESOURCES_DIR, config } from './app.js';
import { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Das Modul enthält die Konfiguration für JWT.
 * @packageDocumentation
 */

// public und private key fuer JWT
const jwtDir = resolve(RESOURCES_DIR, 'jwt');
const algorithm = 'RS256';
const utf8 = 'utf8';
// PEM-Datei RS256, z.B. durch OpenSSL
const publicKey = readFileSync(resolve(jwtDir, 'public-key.pem'), utf8); // eslint-disable-line security/detect-non-literal-fs-filename
const privateKey = readFileSync(resolve(jwtDir, 'private-key.pem'), utf8); // eslint-disable-line security/detect-non-literal-fs-filename

const { jwt } = config;

// shorthand property
const signOptions: SignOptions = {
    algorithm,
    expiresIn: (jwt?.expiresIn as string | undefined) ?? '1h',
    issuer:
        (jwt?.issuer as string | undefined) ??
        'https://gruppe1.de',
};

const verifyOptions: VerifyOptions = {
    algorithms: [algorithm],
    issuer: signOptions.issuer,
};

/**
 * Das Konfigurationsobjekt für JWT.
 */
export const jwtConfig = {
    algorithm,
    publicKey,
    privateKey,
    signOptions,
    verifyOptions,
} as const;
