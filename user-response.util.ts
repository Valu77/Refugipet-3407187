import { User } from '../../users/entities/user.entity';export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  locale: string;
  createdAt: Date;
}export interface UserProfileResponse extends AuthUserResponse {
  updatedAt: Date;
}

export function toAuthUserResponse(user: User): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    locale: user.locale,
    createdAt: user.createdAt,
  };
}

export function toUserProfileResponse(user: User): UserProfileResponse {
  return {
    ...toAuthUserResponse(user),
    updatedAt: user.updatedAt,
  };
}