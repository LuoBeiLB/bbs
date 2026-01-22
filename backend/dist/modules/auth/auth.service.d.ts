import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UserLoginDto, LoginResponse, JwtToken } from '@tech-community/shared';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(createUserDto: CreateUserDto): Promise<LoginResponse>;
    login(userLoginDto: UserLoginDto): Promise<LoginResponse>;
    private generateToken;
    refreshToken(refreshToken: string): Promise<JwtToken>;
    validateUser(email: string, password: string): Promise<User | null>;
    findUserById(id: string): Promise<User | null>;
}
