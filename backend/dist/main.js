"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // must be first — loads .env before any module initializes
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    // Global filters
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    // Global pipes
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // CORS
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', '*'),
        credentials: true,
    });
    // Swagger documentation
    if (nodeEnv !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('VAT Registration API')
            .setDescription('Danish VAT Registration Platform API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error('Failed to bootstrap application', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map