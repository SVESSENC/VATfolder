import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    initiateOidc(): Promise<{
        message: string;
    }>;
    handleOidcCallback(payload: any): Promise<{
        message: string;
    }>;
    /** Development-only: issue a JWT for any email without MitID. Disabled in production. */
    devLogin(dto: DevLoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string | null;
            displayName: string;
        };
    }>;
    me(req: any): Promise<{
        id: string;
        email: string | null;
        displayName: string | null;
        createdAt: Date;
    } | null>;
}
//# sourceMappingURL=auth.controller.d.ts.map