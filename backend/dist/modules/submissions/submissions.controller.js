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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const submissions_service_1 = require("./submissions.service");
let SubmissionsController = class SubmissionsController {
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    submit(id, req, idempotencyKey, correlationId) {
        if (!idempotencyKey)
            throw new common_1.BadRequestException('X-Idempotency-Key header is required');
        return this.submissionsService.submit(id, req.user.userId, idempotencyKey, correlationId ?? null, `POST /api/v1/applications/${id}/submit`);
    }
    getStatus(submissionId, req) {
        return this.submissionsService.getStatus(submissionId, req.user.userId);
    }
    retry(submissionId, req) {
        return this.submissionsService.retry(submissionId, req.user.userId);
    }
};
exports.SubmissionsController = SubmissionsController;
__decorate([
    (0, common_1.Post)('applications/:id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, swagger_1.ApiOperation)({ summary: 'Queue a validated application for submission to SKAT' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Idempotency-Key', required: true }),
    (0, swagger_1.ApiHeader)({ name: 'X-Correlation-ID', required: false }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Submission queued' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Headers)('x-idempotency-key')),
    __param(3, (0, common_1.Headers)('x-correlation-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('submissions/:submissionId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get submission status' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('submissions/:submissionId/retry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed submission (operator action)' }),
    __param(0, (0, common_1.Param)('submissionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubmissionsController.prototype, "retry", null);
exports.SubmissionsController = SubmissionsController = __decorate([
    (0, swagger_1.ApiTags)('Submissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], SubmissionsController);
//# sourceMappingURL=submissions.controller.js.map