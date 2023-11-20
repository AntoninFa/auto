
import {
    DocumentBuilder,
    type SwaggerCustomOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { corsOptions } from './config/cors.options.js';
import { helmetHandlers } from './security/http/helmet.handler.js';
import { nodeConfig } from './config/node.js';
import { paths } from './config/paths.js';

const { httpsOptions, port } = nodeConfig;

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Auto')
        .setDescription('Auto Datenbank')
        .setVersion('2023.10.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const options: SwaggerCustomOptions = {
        customSiteTitle: 'Auto',
    };
    SwaggerModule.setup(paths.swagger, app, document, options);
};

const bootstrap = async () => {
<<<<<<< HEAD
    const app = await NestFactory.create(AppModule, { httpsOptions }); // "Shorthand Properties" ab ES 2015
=======
    const app = await NestFactory.create(AppModule, { httpsOptions });
>>>>>>> 92fb94b1937e75e7d77dfecf7980877572b9f581
    app.use(helmetHandlers, compression());
    app.useGlobalPipes(new ValidationPipe());
    setupSwagger(app);
    app.enableCors(corsOptions);
    await app.listen(port);
};
<<<<<<< HEAD

=======
>>>>>>> 92fb94b1937e75e7d77dfecf7980877572b9f581
await bootstrap();