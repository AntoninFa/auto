/**
 * Dieses Modul enthält eine Hilfsklasse um URIs zu ermitteln
 * @packageDocumentation
 */

import { nodeConfig } from '../../config/node.js';
import { type Request } from 'express';
import { BuchReadService } from '../service/buch-read.service.js';
//TODO Buch Read Service

const port = `:${nodeConfig.port}`;

export const getBaseUri = (req: Request) => {
    const { protocol, hostname, url } = req;
    let basePath = url.includes('?') ? url.slice(0, url.lastIndexOf('?')) : url;
    const indexLastSlash = basePath.lastIndexOf('/');
    if (indexLastSlash > 0) {
        const idStr = basePath.slice(indexLastSlash + 1);
        if (BuchReadService.ID_PATTERN.test(idStr)) {
            basePath = basePath.slice(0, indexLastSlash);
        }
    }
    return `${protocol}://${hostname}${port}${basePath}`;
};
