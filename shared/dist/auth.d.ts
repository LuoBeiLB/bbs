export interface JwtToken {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}
export interface LoginResponse {
    token: JwtToken;
    user: {
        id: string;
        email: string;
        nickname: string;
        avatar?: string;
    };
}
export interface RefreshTokenDto {
    refreshToken: string;
}
