import { IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../constants/password-policy';
import { IsDifferentFrom } from '../validators/is-different-from.validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'La contraseña actual es requerida.' })
  currentPassword!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  @IsDifferentFrom('currentPassword')
  newPassword!: string;
}