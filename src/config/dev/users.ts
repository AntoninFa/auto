import { type User } from '../../security/auth/service/user.service.js';
import { config } from '../app.js';

const { passwordEncoded } = config.auth; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
const password =
    (passwordEncoded as string | undefined) ?? '!!! To Be Changed !!!';

/**
 * Ein JSON-Array der Benutzerdaten mit den vorhandenen Rollen.
 * Nicht Set, weil es dafür keine Suchfunktion gibt.
 */
export const users: User[] = [
    {
        userId: 1,
        username: 'admin',
        password,
        email: 'admin@acme.com',
        roles: ['admin', 'verkaeufer'],
    },
    {
        userId: 2,
        username: 'adriana.alpha',
        password,
        email: 'adriana.alpha@acme.com',
        roles: ['kunde'],
    },
    {
        userId: 3,
        username: 'max.mustermann',
        password,
        email: 'max.mustermann@example.com',
        roles: ['verkaeufer'],
    },
];
