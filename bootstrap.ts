import {
  UnprocessableEntityException,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

function toValidationDetails(
  errors: ValidationError[],
): { field: string; message: string }[] {
  return errors.map((error) => ({
    field: error.property,
    message: Object.values(error.constraints ?? {}).join(', '),
  }));
}
export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) =>
        new UnprocessableEntityException({
          message: 'Validation failed',
          details: toValidationDetails(errors),
        }),
    }),
  );

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
}