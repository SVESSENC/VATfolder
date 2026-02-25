import { DocumentsService } from './documents.service';
import { InitiateUploadDto } from './dto/initiate-upload.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    initiateUpload(applicationId: string, req: any, dto: InitiateUploadDto): Promise<{
        documentId: string;
        uploadUrl: string;
        storagePath: string;
        expiresIn: number;
    }>;
    list(applicationId: string, req: any): Promise<{
        id: string;
        filename: string | null;
        contentType: string | null;
        storagePath: string | null;
        checksum: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        ownerApplicationId: string;
    }[]>;
    findOne(applicationId: string, documentId: string, req: any): Promise<{
        id: string;
        filename: string | null;
        contentType: string | null;
        storagePath: string | null;
        checksum: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        ownerApplicationId: string;
    }>;
}
//# sourceMappingURL=documents.controller.d.ts.map