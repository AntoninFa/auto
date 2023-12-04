import fs from 'node:fs';
import path from 'node:path';

const { cpSync, existsSync, mkdirSync } = fs;
const { join } = path

const src = 'src';
const dist = 'dist';
if (!existsSync(dist)) {
    mkdirSync(dist);
}

// DB-Skripte, EM-Dateien fuer TLS und JWT sowie GraphQL-Schema kopieren
const resourcesSrc = join(src, 'config', 'resources');
const resourcesDist = join(dist, src, 'config', 'resources');
mkdirSync(resourcesDist, { recursive: true });
cpSync(resourcesSrc, resourcesDist, { recursive: true });