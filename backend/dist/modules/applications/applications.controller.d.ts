import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssessObligationDto } from './dto/assess-obligation.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(req: any, dto: CreateApplicationDto): Promise<{
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: import("@prisma/client/runtime/client").JsonValue | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        obligationAssessment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organisationId: string;
            assessmentData: import("@prisma/client/runtime/client").JsonValue;
            status: import(".prisma/client").$Enums.ObligationAssessmentStatus;
            obligationRequired: boolean | null;
            legalCitations: import("@prisma/client/runtime/client").JsonValue | null;
            reasoning: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: import("@prisma/client/runtime/client").JsonValue;
        validationWarnings: import("@prisma/client/runtime/client").JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: import("@prisma/client/runtime/client").Bytes | null;
        applicantId: string | null;
    }>;
    list(req: any): Promise<({
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: import("@prisma/client/runtime/client").JsonValue | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: import("@prisma/client/runtime/client").JsonValue;
        validationWarnings: import("@prisma/client/runtime/client").JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: import("@prisma/client/runtime/client").Bytes | null;
        applicantId: string | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: import("@prisma/client/runtime/client").JsonValue | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        } | null;
        submission: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            applicationId: string | null;
            payload: import("@prisma/client/runtime/client").JsonValue | null;
            attempts: number;
            externalReference: string | null;
            lastError: string | null;
            queuedAt: Date;
            lastAttemptAt: Date | null;
        } | null;
        documents: {
            id: string;
            createdAt: Date;
            filename: string | null;
            contentType: string | null;
            checksum: string | null;
            storagePath: string | null;
            meta: import("@prisma/client/runtime/client").JsonValue | null;
            ownerApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: import("@prisma/client/runtime/client").JsonValue;
        validationWarnings: import("@prisma/client/runtime/client").JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: import("@prisma/client/runtime/client").Bytes | null;
        applicantId: string | null;
    }>;
    update(id: string, req: any, dto: UpdateApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: import("@prisma/client/runtime/client").JsonValue;
        validationWarnings: import("@prisma/client/runtime/client").JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: import("@prisma/client/runtime/client").Bytes | null;
        applicantId: string | null;
    }>;
    assess(id: string, req: any, dto: AssessObligationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string;
        assessmentData: import("@prisma/client/runtime/client").JsonValue;
        status: import(".prisma/client").$Enums.ObligationAssessmentStatus;
        obligationRequired: boolean | null;
        legalCitations: import("@prisma/client/runtime/client").JsonValue | null;
        reasoning: string | null;
    }>;
}
//# sourceMappingURL=applications.controller.d.ts.map