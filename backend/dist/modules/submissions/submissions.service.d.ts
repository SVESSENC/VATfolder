import { PrismaService } from '@/common/prisma/prisma.service';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getApplication;
    submit(applicationId: string, userId: string, idempotencyKey: string, correlationId: string | null, route: string): Promise<string | number | true | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | {
        submissionId: string;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        queuedAt: Date;
    }>;
    getStatus(submissionId: string, userId: string): Promise<{
        submissionId: string;
        applicationId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        attempts: number;
        externalReference: string | null;
        lastError: string | null;
        queuedAt: Date;
        lastAttemptAt: Date | null;
    }>;
    retry(submissionId: string, userId: string): Promise<{
        submissionId: string;
        status: import(".prisma/client").$Enums.SubmissionStatus;
    }>;
}
//# sourceMappingURL=submissions.service.d.ts.map