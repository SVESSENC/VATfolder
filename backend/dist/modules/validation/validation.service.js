"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
// Static ruleset — replace with a YAML/DB-driven engine when available.
const RULESETS = {
    '2026-01': {
        version: '2026-01',
        rules: [
            'Organisation CVR must be present and 8 digits',
            'Annual turnover field required for threshold determination',
            'Business activity code (branchekode) must be valid',
            'Registration start date must not be in the past by more than 12 months',
        ],
        effectiveFrom: '2026-01-01',
    },
};
const CURRENT_RULESET = '2026-01';
let ValidationService = class ValidationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getRulesets() {
        return Object.values(RULESETS);
    }
    async validate(applicationId, userId, dto) {
        const app = await this.prisma.vatApplication.findUnique({
            where: { id: applicationId },
            include: { organisation: true },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${applicationId} not found`);
        if (app.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (app.status === client_1.ApplicationStatus.submitted ||
            app.status === client_1.ApplicationStatus.accepted) {
            throw new common_1.BadRequestException(`Cannot validate an application with status ${app.status}`);
        }
        const data = app.applicationData;
        const issues = [];
        // --- Rule: CVR present ---
        if (!app.organisationId) {
            issues.push({
                field: 'organisationId',
                message: 'Organisation must be linked to the application',
                severity: 'error',
                legalCitation: 'Momsregistreringsloven §3',
            });
        }
        // --- Rule: annualTurnover present ---
        if (!data['annualTurnover']) {
            issues.push({
                field: 'applicationData.annualTurnover',
                message: 'Annual turnover is required for obligation threshold assessment',
                severity: 'error',
                legalCitation: 'Momsregistreringsloven §48',
            });
        }
        // --- Rule: businessActivityCode ---
        if (!data['businessActivityCode']) {
            issues.push({
                field: 'applicationData.businessActivityCode',
                message: 'Business activity code (branchekode) is required',
                severity: 'warning',
            });
        }
        // --- Rule: registrationStartDate ---
        if (data['registrationStartDate']) {
            const startDate = new Date(data['registrationStartDate']);
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            if (startDate < twelveMonthsAgo) {
                issues.push({
                    field: 'applicationData.registrationStartDate',
                    message: 'Registration start date must not be more than 12 months in the past',
                    severity: 'error',
                    legalCitation: 'Momsregistreringsloven §14',
                });
            }
        }
        const errors = issues.filter((i) => i.severity === 'error');
        const warnings = issues.filter((i) => i.severity === 'warning');
        const passed = errors.length === 0;
        const rulesetVersion = dto.rulesetVersion ?? CURRENT_RULESET;
        const newStatus = passed
            ? client_1.ApplicationStatus.validated
            : client_1.ApplicationStatus.draft;
        await this.prisma.vatApplication.update({
            where: { id: applicationId },
            data: {
                status: newStatus,
                validationWarnings: warnings,
            },
        });
        return {
            applicationId,
            passed,
            rulesetVersion,
            errors,
            warnings,
        };
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ValidationService);
//# sourceMappingURL=validation.service.js.map