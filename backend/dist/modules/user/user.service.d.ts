import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserDto, UserProfileDto } from '@tech-community/shared';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    getProfile(userId: string): Promise<UserProfileDto>;
    updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserProfileDto>;
    getUserArticles(userId: string): Promise<import("../../entities/article.entity").Article[]>;
}
