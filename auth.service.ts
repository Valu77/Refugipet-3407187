import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { MoreThan, Repository } from 'typeorm';
import {
  logEmailVerified,
  logLoginFailed,
  logLoginSuccess,
  logPasswordChanged,
  logPasswordResetRequested,
} from '../common/audit-log';
import {
  toAuthUserResponse,
  type AuthUserResponse,
} from '../common/utils/user-response.util';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import type { TokenPayload } from './interfaces/token-payload.interface';

const BCRYPT_SALT_ROUNDS = 12;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1h

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokensRepository: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private signAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = { sub: userId, email, type: 'access' };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_ACCESS_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }

  private signRefreshToken(userId: string, email: string): string {
    const payload: TokenPayload = { sub: userId, email, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }

  private issueTokenPair(userId: string, email: string): TokenResponse {
    return {
      accessToken: this.signAccessToken(userId, email),
      refreshToken: this.signRefreshToken(userId, email),
      tokenType: 'bearer',
    };
  }

  async register(dto: RegisterDto): Promise<AuthUserResponse> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: dto.email,
        fullName: dto.fullName,
        hashedPassword,
      }),
    );

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.emailVerificationTokensRepository.save(
      this.emailVerificationTokensRepository.create({
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      }),
    );

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return toAuthUserResponse(user);
  }

  async login(dto: LoginDto, ip: string): Promise<TokenResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.hashedPassword))) {
      logLoginFailed('Credenciales inválidas', ip);
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.isActive) {
      logLoginFailed('Cuenta desactivada', ip);
      throw new UnauthorizedException('La cuenta está desactivada.');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }

    logLoginSuccess(user.id, ip);
    return this.issueTokenPair(user.id, user.email);
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenResponse> {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    return this.issueTokenPair(user.id, user.email);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const valid = await bcrypt.compare(
      dto.currentPassword,
      user.hashedPassword,
    );
    if (!valid)
      throw new UnauthorizedException('La contraseña actual es incorrecta.');

    user.hashedPassword = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );
    await this.usersRepository.save(user);

    logPasswordChanged(userId);
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.passwordResetTokensRepository.save(
      this.passwordResetTokensRepository.create({
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      }),
    );

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    logPasswordResetRequested();
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenRecord = await this.passwordResetTokensRepository.findOne({
      where: { token: dto.token, used: false, expiresAt: MoreThan(new Date()) },
    });
    if (!tokenRecord) {
      throw new BadRequestException('El token es inválido o ha expirado.');
    }

    const user = await this.usersRepository.findOneOrFail({
      where: { id: tokenRecord.userId },
    });
    user.hashedPassword = await bcrypt.hash(
      dto.newPassword,
      BCRYPT_SALT_ROUNDS,
    );
    await this.usersRepository.save(user);

    tokenRecord.used = true;
    await this.passwordResetTokensRepository.save(tokenRecord);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const tokenRecord = await this.emailVerificationTokensRepository.findOne({
      where: { token: dto.token, used: false, expiresAt: MoreThan(new Date()) },
    });
    if (!tokenRecord) {
      throw new BadRequestException(
        'El token de verificación es inválido o ha expirado.',
      );
    }

    const user = await this.usersRepository.findOneOrFail({
      where: { id: tokenRecord.userId },
    });
    user.isEmailVerified = true;
    await this.usersRepository.save(user);

    tokenRecord.used = true;
    await this.emailVerificationTokensRepository.save(tokenRecord);

    logEmailVerified(tokenRecord.userId);
  }
}