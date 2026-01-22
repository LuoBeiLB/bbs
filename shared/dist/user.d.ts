export interface User {
    id: string;
    email: string;
    phone?: string;
    nickname: string;
    avatar?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    email: string;
    password: string;
    nickname: string;
    phone?: string;
}
export interface UpdateUserDto {
    nickname?: string;
    avatar?: string;
    bio?: string;
    phone?: string;
}
export interface UserLoginDto {
    email: string;
    password: string;
}
export interface UserProfileDto {
    id: string;
    email: string;
    phone?: string;
    nickname: string;
    avatar?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}
