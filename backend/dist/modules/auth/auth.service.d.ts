import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(mitidSub: string, email: string): Promise<{
        id: string;
        mitidSub: string | null;
        email: string | null;
        displayName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDisplayName(userId: string, displayName: string): Promise<{
        id: string;
        mitidSub: string | null;
        email: string | null;
        displayName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findById(userId: string): Promise<{
        id: string;
        email: string | null;
        displayName: string | null;
        createdAt: Date;
    } | null>;
    generateToken(userId: string): string;
}
//# sourceMappingURL=auth.service.d.ts.map