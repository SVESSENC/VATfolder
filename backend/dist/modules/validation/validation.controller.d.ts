import { ValidationService } from './validation.service';
import { ValidateApplicationDto } from './dto/validate-application.dto';
export declare class ValidationController {
    private readonly validationService;
    constructor(validationService: ValidationService);
    getRulesets(): {
        version: string;
        rules: string[];
        effectiveFrom: string;
    }[];
    validate(id: string, req: any, dto: ValidateApplicationDto): Promise<{
        applicationId: string;
        passed: boolean;
        rulesetVersion: string;
        errors: import("./validation.service").ValidationIssue[];
        warnings: import("./validation.service").ValidationIssue[];
    }>;
}
//# sourceMappingURL=validation.controller.d.ts.map