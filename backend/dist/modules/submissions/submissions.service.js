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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let SubmissionsService = class SubmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getApplication(applicationId, userId) {
        const app = await this.prisma.vatApplication.findUnique({
            where: { id: applicationId },
            include: { submission: true },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${applicationId} not found`);
        if (app.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return app;
    }
    async submit(applicationId, userId, idempotencyKey, correlationId, route) {
        const app = await this.getApplication(applicationId, userId);
        if (app.status !== client_1.ApplicationStatus.validated) {
            throw new common_1.BadRequestException(`Application must be in 'validated' status before submission (current: ${app.status})`);
        }
        if (app.submission) {
            throw new common_1.ConflictException(`Application ${applicationId} has already been submitted`);
        }
        // Idempotency: return cached response if key already used
        const requestHash = (0, crypto_1.createHash)('sha256')
            .update(applicationId)
            .digest('hex');
        const existing = await this.prisma.idempotencyKey.findUnique({
            where: { idempotencyKey_route: { idempotencyKey, route } },
        });
        if (existing?.responsePayload) {
            return existing.responsePayload;
        }
        const submission = await this.prisma.submission.create({
            data: {
                applicationId,
                payload: app.applicationData,
                status: client_1.SubmissionStatus.queued,
            },
        });
        await this.prisma.vatApplication.update({
            where: { id: applicationId },
            data: { status: client_1.ApplicationStatus.queued },
        });
        await this.prisma.eventLog.create({
            data: {
                eventType: 'ApplicationQueued',
                aggregateType: 'VatApplication',
                aggregateId: applicationId,
                correlationId: correlationId ?? undefined,
                payload: { submissionId: submission.id, applicationId },
            },
        });
        const response = {
            submissionId: submission.id,
            status: submission.status,
            queuedAt: submission.queuedAt,
        };
        await this.prisma.idempotencyKey.create({
            data: {
                idempotencyKey,
                route,
                ownerId: userId,
                requestHash,
                responsePayload: response,
            },
        });
        return response;
    }
    async getStatus(submissionId, userId) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { application: true },
        });
        if (!submission)
            throw new common_1.NotFoundException(`Submission ${submissionId} not found`);
        if (submission.application?.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return {
            submissionId: submission.id,
            applicationId: submission.applicationId,
            status: submission.status,
            attempts: submission.attempts,
            externalReference: submission.externalReference,
            lastError: submission.lastError,
            queuedAt: submission.queuedAt,
            lastAttemptAt: submission.lastAttemptAt,
        };
    }
    async retry(submissionId, userId) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { application: true },
        });
        if (!submission)
            throw new common_1.NotFoundException(`Submission ${submissionId} not found`);
        if (submission.application?.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (submission.status !== client_1.SubmissionStatus.failed) {
            throw new common_1.BadRequestException(`Only failed submissions can be retried (current: ${submission.status})`);
        }
        const updated = await this.prisma.submission.update({
            where: { id: submissionId },
            data: { status: client_1.SubmissionStatus.queued, lastError: null },
        });
        return {
            submissionId: updated.id,
            status: updated.status,
        };
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map