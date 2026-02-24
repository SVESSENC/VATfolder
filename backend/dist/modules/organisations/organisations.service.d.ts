import { PrismaService } from '@/common/prisma/prisma.service';
export declare class OrganisationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrganisationByCvr(cvr: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        cvr: string;
        primaryAddress: import("@prisma/client/runtime/client").JsonValue | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
}
//# sourceMappingURL=organisations.service.d.ts.map