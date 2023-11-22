/**
 * Dieses Modul enthält Konfigurationen für den auf Node basierenden Server.
 * @packageDocumentation
 */

import { type HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface.js';
import { RESOURCES_DIR } from './app.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tlsDir = resolve(RESOURCES_DIR, 'tls');
export const httpsOptions: HttpsOptions = {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    key: readFileSync(resolve(tlsDir, 'private-key.pem')),
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    cert: readFileSync(resolve(tlsDir, 'certificate.cer')),
};
