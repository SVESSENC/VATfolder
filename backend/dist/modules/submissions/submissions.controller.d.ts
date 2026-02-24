import { SubmissionsService } from './submissions.service';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    submit(id: string, req: any, idempotencyKey: string, correlationId: string): Promise<string | number | true | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray | {
        submissionId: string;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        queuedAt: Date;
    }>;
    getStatus(submissionId: string, req: any): Promise<{
        submissionId: string;
        applicationId: string | null;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        attempts: number;
        externalReference: string | null;
        lastError: string | null;
        queuedAt: Date;
        lastAttemptAt: Date | null;
    }>;
    retry(submissionId: string, req: any): Promise<{
        submissionId: string;
        status: import(".prisma/client").$Enums.SubmissionStatus;
    }>;
}
//# sourceMappingURL=submissions.controller.d.ts.map