const jestConfig = {
    // globalSetup: '<rootDir>/dist/__tests__/global-setup.js',
    // globalTeardown: '<rootDir>/dist/__tests__/global-teardown.js',
    // setupFilesAfterEnv: ['<rootDir>/dist/__tests__/setup-jest.js'],

    // Verzeichnis in node_modules mit einer Datei jest-preset.js
    preset: 'ts-jest/presets/default-esm',

    extensionsToTreatAsEsm: ['.ts', '.mts', '.json'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.m?js$': '$1', // eslint-disable-line @typescript-eslint/naming-convention
    },

    transform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '\\.test\\.m?ts$': [
            'ts-jest',
            {
                useESM: true,
                isolatedModules: false,
            },
        ],
    },

    testRegex: '__tests__\\.*\\\\.*test\\.m?ts$',
    collectCoverageFrom: ['<rootDir>/src/**/*.*ts'],
    // coverageDirectory: 'coverage',
    testEnvironment: 'node',

    bail: true,
    coveragePathIgnorePatterns: [
        '<rootDir>/src/main\\.m?ts$',
        '.*\\.module\\.m?ts$',
        '<rootDir>/src/health/',
    ],
    coverageReporters: ['text-summary', 'html'],
    errorOnDeprecated: true,
    // Hoher Timeout-Wert, insbesondere fuer den ersten Mutation-Test
    testTimeout: 60_000,
    verbose: true,
    // showSeed: true,
};

export default jestConfig;
