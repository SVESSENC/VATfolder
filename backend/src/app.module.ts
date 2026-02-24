import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ValidationModule } from './modules/validation/validation.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    OrganisationsModule,
    ApplicationsModule,
    DocumentsModule,
    ValidationModule,
    SubmissionsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
