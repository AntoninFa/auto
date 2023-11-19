
import { AuthController } from './auth.controller.js';
import { AuthService } from './service/auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy.js';
import { LocalStrategy } from './local/local.strategy.js';
import { LoginResolver } from './login.resolver.js';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './service/user.service.js';
import { jwtConfig } from '../../config/jwt.js';

const { privateKey, signOptions, verifyOptions } = jwtConfig;

/**
 * Dieses Modul enthält Klassen für die Authentifizierung.
 * @packageDocumentation
 */

/**
 * Modul-Klasse wird exportiert zur bereitstellung von Authentifizierungsfunktionalität.
 */
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ privateKey, signOptions, verifyOptions }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        LocalStrategy,
        JwtStrategy,
        LoginResolver,
    ],
    exports: [AuthService, UserService],
})
export class AuthModule {}
