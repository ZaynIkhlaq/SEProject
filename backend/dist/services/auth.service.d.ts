import { RegisterBrandRequest, RegisterInfluencerRequest, AuthResponse } from '../shared/types';
export declare class AuthService {
    static registerBrand(data: RegisterBrandRequest): Promise<AuthResponse>;
    static registerInfluencer(data: RegisterInfluencerRequest): Promise<AuthResponse>;
    static login(email: string, password: string): Promise<AuthResponse>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private static generateAccessToken;
    private static generateRefreshToken;
}
//# sourceMappingURL=auth.service.d.ts.map