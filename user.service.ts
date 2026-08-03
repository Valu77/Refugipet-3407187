import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  toUserProfileResponse,
  type UserProfileResponse,
} from '../common/utils/user-response.util';
import { UpdateLocaleDto } from './dto/update-locale.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  // ¿Qué? Obtiene el perfil del usuario por su ID para GET /api/v1/users/me.
  async getById(userId: string): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return toUserProfileResponse(user);
  }
   async updateLocale(
    userId: string,
    dto: UpdateLocaleDto,
  ): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    user.locale = dto.locale;
    const updated = await this.usersRepository.save(user);

    return toUserProfileResponse(updated);
  }
}