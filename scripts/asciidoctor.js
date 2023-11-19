import asciidoctor from '@asciidoctor/core'
import kroki from 'asciidoctor-kroki';
import { join } from 'node:path';
import url from 'node:url';

const adoc = asciidoctor();
console.log(`Asciidoctor.js ${adoc.getVersion()}`);
kroki.register(adoc.Extensions);
const options = {
    safe: 'safe',
    attributes: { linkcss: true },
    base_dir: '.extras/doc/projekthandbuch',
    to_dir: 'html',
    mkdirs: true,
};
adoc.convertFile(
    join('.extras', 'doc', 'projekthandbuch', 'projekthandbuch.adoc'),
    options,
);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
console.log(
    `HTML-Datei ${join(
        __dirname,
        '..',
        '.extras',
        'doc',
        'projekthandbuch',
        'html',
        'projekthandbuch.html',
    )}`,
);
