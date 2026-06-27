import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserDto, UserProfileDto } from '../../shared';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // 获取用户个人资料
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // 更新用户个人资料
  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户资料
    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  // 获取用户发布的文章列表（简化版，仅返回基本信息）
  async getUserArticles(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['articles'],
      select: ['id', 'nickname', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.articles;
  }

  // 更新用户头像
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户头像
    user.avatar = avatarUrl;
    await this.userRepository.save(user);

    return user;
  }
}
