import fs from 'node:fs';
import fsExtra from 'fs-extra';
import path from 'node:path';

const { existsSync, mkdirSync } = fs;
const { copySync } = fsExtra;
const { join } = path

if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

const src = 'src';
const dist = 'dist';
if (!existsSync(dist)) {
    mkdirSync(dist);
}

const resourcesSrc = join(src, 'config', 'resources');
const resourcesDist = join(dist, src, 'config', 'resources');
mkdirSync(resourcesDist, { recursive: true });
copySync(resourcesSrc, resourcesDist);
