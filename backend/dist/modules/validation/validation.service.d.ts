import { PrismaService } from '@/common/prisma/prisma.service';
import { ValidateApplicationDto } from './dto/validate-application.dto';
export interface ValidationIssue {
    field: string;
    message: string;
    severity: 'error' | 'warning';
    legalCitation?: string;
}
export declare class ValidationService {
    private prisma;
    constructor(prisma: PrismaService);
    getRulesets(): {
        version: string;
        rules: string[];
        effectiveFrom: string;
    }[];
    validate(applicationId: string, userId: string, dto: ValidateApplicationDto): Promise<{
        applicationId: string;
        passed: boolean;
        rulesetVersion: string;
        errors: ValidationIssue[];
        warnings: ValidationIssue[];
    }>;
}
//# sourceMappingURL=validation.service.d.ts.map