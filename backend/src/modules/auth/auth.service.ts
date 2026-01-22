import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UserLoginDto, LoginResponse, JwtToken } from '@tech-community/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 注册新用户
  async register(createUserDto: CreateUserDto): Promise<LoginResponse> {
    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // 生成令牌
    const token = await this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  // 用户登录
  async login(userLoginDto: UserLoginDto): Promise<LoginResponse> {
    const { email, password } = userLoginDto;

    // 查找用户
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 生成令牌
    const token = await this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  // 生成 JWT 令牌
  private async generateToken(user: User): Promise<JwtToken> {
    // 生成 access token (15 minutes)
    const accessPayload = { sub: user.id, email: user.email, type: 'access' };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
    });

    // 生成 refresh token (7 days)
    const refreshPayload = { sub: user.id, email: user.email, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    // 哈希并存储 refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // 使用 refresh token 刷新 access token
  async refreshToken(refreshToken: string): Promise<JwtToken> {
    try {
      // 验证 refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // 确保是 refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // 查找用户
      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 验证存储的 refresh token
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 生成新的双 token
      return this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 验证用户（用于 Passport 策略）
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // 根据用户ID查找用户
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
}
