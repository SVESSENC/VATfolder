import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssessObligationDto } from './dto/assess-obligation.dto';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateApplicationDto): Promise<{
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
        } | null;
        obligationAssessment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organisationId: string;
            assessmentData: Prisma.JsonValue;
            status: import(".prisma/client").$Enums.ObligationAssessmentStatus;
            obligationRequired: boolean | null;
            legalCitations: Prisma.JsonValue | null;
            reasoning: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: Prisma.JsonValue;
        validationWarnings: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: Prisma.Bytes | null;
        applicantId: string | null;
    }>;
    findOne(id: string, userId: string): Promise<{
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
        } | null;
        submission: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubmissionStatus;
            applicationId: string | null;
            payload: Prisma.JsonValue | null;
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
            meta: Prisma.JsonValue | null;
            ownerApplicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: Prisma.JsonValue;
        validationWarnings: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: Prisma.Bytes | null;
        applicantId: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: Prisma.JsonValue;
        validationWarnings: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: Prisma.Bytes | null;
        applicantId: string | null;
    }>;
    assess(id: string, userId: string, dto: AssessObligationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string;
        assessmentData: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.ObligationAssessmentStatus;
        obligationRequired: boolean | null;
        legalCitations: Prisma.JsonValue | null;
        reasoning: string | null;
    }>;
    listForUser(userId: string): Promise<({
        organisation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string | null;
            cvr: string;
            primaryAddress: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organisationId: string | null;
        obligationAssessmentId: string | null;
        applicationData: Prisma.JsonValue;
        validationWarnings: Prisma.JsonValue | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        currentStep: import(".prisma/client").$Enums.WorkflowStep;
        version: number;
        skatReference: string | null;
        submissionPayload: Prisma.Bytes | null;
        applicantId: string | null;
    })[]>;
}
//# sourceMappingURL=applications.service.d.ts.map