
/**
 * Dieses Modul enthält die Klasse {@linkcode AuthService} für die
 * Authentifizierung.
 * @packageDocumentation
 */

import { type User, UserService } from './user.service.js';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getLogger } from '../../../logger/logger.js';
import { jwtConfig } from '../../../config/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import { verify } from 'argon2';

/** 
 * Typdefinition für die Validierung der Authentifizierungsdaten. 
 */
export interface ValidateParams {
    /** 
     * Benutzername. 
     */
    readonly username: string | undefined;
    /** 
     * Eingegebenes Passwort. 
     */
    readonly pass: string | undefined;
}

export interface LoginResult {
    readonly token: string;
    readonly expiresIn: number | string | undefined;
    readonly roles?: readonly string[];
}

/**
 * AuthService implementiert die Funktionen für die
 * Authentifizierung.
 */
@Injectable()
export class AuthService {
    readonly #userService: UserService;
    readonly #jwtService: JwtService;
    readonly #logger = getLogger(AuthService.name);
    constructor(userService: UserService, jwtService: JwtService) {
        this.#userService = userService;
        this.#jwtService = jwtService;
    }

    /**
     * Aufruf durch Passport beim Login.
     *
     * @param username Benutzername.
     * @param pass Passwort.
     * @return Das User-Objekt ohne Passwort oder undefined.
     */
    async validate({ username, pass }: ValidateParams) {
        this.#logger.debug('validate: username=%s', username);
        if (username === undefined || pass === undefined) {
            this.#logger.debug('validate: username oder password fehlen.');
            return;
        }
        const user = await this.#userService.findOne(username);
        this.#logger.debug('validate: user.id=%d', user?.userId);
        if (user === undefined) {
            this.#logger.debug('validate: Kein User zu %s gefunden.', username);
            return;
        }
        const userPassword = user.password;
        this.#logger.debug('validate: userPassword=*****, password=*****'); //NOSONAR
        const isPasswordOK = await this.#checkPassword(userPassword, pass);
        if (!isPasswordOK) {
            this.#logger.debug('validate: Falsches password.');
            return;
        }
        const { password, ...result } = user;
        this.#logger.debug('validate: result=%o', result);
        return result;
    }

    /**
     * Einloggen eines validierten Users
     * @param user Das validierte User-Objekt.
     * @return Objekt mit einem JWT als zukünftigen "Access Token"
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async login(user: unknown) {
        const userObj = user as User;
        const payload = {
            username: userObj.username,
            sub: userObj.userId,
            type: 'access',
            jti: uuidv4(),
        };
        const { signOptions } = jwtConfig;
        const token = this.#jwtService.sign(payload, signOptions);
        const result: LoginResult = {
            token,
            expiresIn: signOptions.expiresIn,
            roles: userObj.roles,
        };

        this.#logger.debug('login: result=%o', result);
        return result;
    }

    async #checkPassword(userPassword: string | undefined, password: string) {
        if (userPassword === undefined) {
            this.#logger.debug('#checkPassword: Kein Passwort');
            return false;
        }
        const result = await verify(userPassword, password);
        this.#logger.debug('#checkPassword: %s', result);
        return result;
    }
}
