import { UserService } from './user.service';
import { UpdateUserDto } from '@tech-community/shared';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<import("@tech-community/shared").UserProfileDto>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("@tech-community/shared").UserProfileDto>;
    getUserArticles(req: any): Promise<import("../../entities/article.entity").Article[]>;
}
