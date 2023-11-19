import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './service/auth.service.js';
import { BadUserInputError } from '../../auto/graphql/errors.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { getLogger } from '../../logger/logger.js';

/** Typdefinition für Login-Daten bei GraphQL */
export interface LoginInput {
    /**
     * Benutzername
     */
    readonly username: string;
    /**
     *  Passwort 
     */
    readonly password: string;
}

@Resolver('login')
@UseInterceptors(ResponseTimeInterceptor)
export class LoginResolver {
    readonly #service: AuthService;
    readonly #logger = getLogger(LoginResolver.name);
    constructor(service: AuthService) {
        this.#service = service;
    }

    @Mutation()
    async login(@Args() input: LoginInput) {
        this.#logger.debug('login: input=%o', input);
        const { username, password } = input;
        const user = await this.#service.validate({ username, pass: password });
        if (user === undefined) {
            throw new BadUserInputError(
                'Benutzername oder Passwort sind falsch',
            );
        }
        const result = await this.#service.login(user);
        this.#logger.debug('login: result=%o', result);
        return result;
    }
}
