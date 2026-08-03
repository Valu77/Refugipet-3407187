import { User } from '../users/entities/user.entity';
import { EmailVerificationToken } from '../auth/entities/email-verification-token.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';

export const entities = [User, EmailVerificationToken, PasswordResetToken];