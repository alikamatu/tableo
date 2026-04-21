import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port       = config.get<number>('PORT', 4000);
  const prefix     = config.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = config.get<string>('CORS_ORIGINS', 'http://localhost:3000');

  // ── Cookie parser (must be before guards that read cookies) ──────────────
  app.use(cookieParser());

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix(prefix);

  // ── CORS — allow credentials so httpOnly cookies are sent cross-origin ────
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filters & interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  // ── Swagger (non-production only) ─────────────────────────────────────────
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Tableo API')
      .setDescription('Restaurant SaaS — digital menus, ordering, analytics')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`🚀  API  →  http://localhost:${port}/${prefix}`);
  if (config.get('NODE_ENV') !== 'production') {
    console.log(`📖  Docs →  http://localhost:${port}/docs`);
  }
}

bootstrap();
