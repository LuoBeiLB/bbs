import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto, RefreshTokenDto } from '@tech-community/shared';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<import("@tech-community/shared").LoginResponse>;
    login(userLoginDto: UserLoginDto): Promise<import("@tech-community/shared").LoginResponse>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("@tech-community/shared").JwtToken>;
}
