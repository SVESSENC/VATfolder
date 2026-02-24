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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.vatApplication.create({
            data: {
                applicantId: userId,
                organisationId: dto.organisationId ?? null,
                obligationAssessmentId: dto.obligationAssessmentId ?? null,
                applicationData: dto.applicationData,
                status: client_1.ApplicationStatus.draft,
            },
            include: { organisation: true, obligationAssessment: true },
        });
    }
    async findOne(id, userId) {
        const app = await this.prisma.vatApplication.findUnique({
            where: { id },
            include: { organisation: true, documents: true, submission: true },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${id} not found`);
        if (app.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return app;
    }
    async update(id, userId, dto) {
        const app = await this.findOne(id, userId);
        if (app.status !== client_1.ApplicationStatus.draft)
            throw new common_1.BadRequestException('Only draft applications can be updated');
        return this.prisma.vatApplication.update({
            where: { id },
            data: {
                applicationData: (dto.applicationData ?? app.applicationData),
                version: { increment: 1 },
            },
        });
    }
    async assess(id, userId, dto) {
        const app = await this.findOne(id, userId);
        if (!app.organisationId)
            throw new common_1.BadRequestException('Application must have an organisation before assessment');
        const assessment = await this.prisma.obligationAssessment.create({
            data: {
                organisationId: app.organisationId,
                assessmentData: dto.assessmentData,
                status: client_1.ObligationAssessmentStatus.completed,
                obligationRequired: true,
                legalCitations: [],
                reasoning: 'Assessment based on submitted business activity data. VAT registration required.',
            },
        });
        await this.prisma.vatApplication.update({
            where: { id },
            data: { obligationAssessmentId: assessment.id },
        });
        return assessment;
    }
    async listForUser(userId) {
        return this.prisma.vatApplication.findMany({
            where: { applicantId: userId },
            orderBy: { createdAt: 'desc' },
            include: { organisation: true },
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map