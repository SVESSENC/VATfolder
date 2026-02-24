import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { InitiateUploadDto } from './dto/initiate-upload.dto';
export declare class DocumentsService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    private getApplication;
    initiateUpload(applicationId: string, userId: string, dto: InitiateUploadDto): Promise<{
        documentId: string;
        uploadUrl: string;
        storagePath: string;
        expiresIn: number;
    }>;
    findOne(applicationId: string, documentId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        filename: string | null;
        contentType: string | null;
        checksum: string | null;
        storagePath: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
        ownerApplicationId: string;
    }>;
    listForApplication(applicationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        filename: string | null;
        contentType: string | null;
        checksum: string | null;
        storagePath: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
        ownerApplicationId: string;
    }[]>;
}
//# sourceMappingURL=documents.service.d.ts.map