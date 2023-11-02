// Informiert Typedoc über den Typ des Moduls
/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
    out: '.extras/doc/api',
    entryPoints: ['src'],
    entryPointStrategy: 'expand',
    excludePrivate: true,
    validation: {
        invalidLink: true,
    },
};
