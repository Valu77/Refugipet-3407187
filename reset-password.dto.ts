import { IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../constants/password-policy';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1, { message: 'El token es requerido.' })
  token!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword!: string;
}