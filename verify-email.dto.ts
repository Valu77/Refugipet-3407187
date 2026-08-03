import { IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @MinLength(1, { message: 'El token de verificación es requerido.' })
  token!: string;
}