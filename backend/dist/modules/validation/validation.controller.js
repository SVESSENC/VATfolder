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
exports.ValidationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const validation_service_1 = require("./validation.service");
const validate_application_dto_1 = require("./dto/validate-application.dto");
let ValidationController = class ValidationController {
    constructor(validationService) {
        this.validationService = validationService;
    }
    getRulesets() {
        return this.validationService.getRulesets();
    }
    validate(id, req, dto) {
        return this.validationService.validate(id, req.user.userId, dto);
    }
};
exports.ValidationController = ValidationController;
__decorate([
    (0, common_1.Get)('api/v1/validation/rulesets'),
    (0, swagger_1.ApiOperation)({ summary: 'List available validation rulesets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ValidationController.prototype, "getRulesets", null);
__decorate([
    (0, common_1.Post)('api/v1/applications/:id/validate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a VAT application against the ruleset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Validation result returned' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, validate_application_dto_1.ValidateApplicationDto]),
    __metadata("design:returntype", void 0)
], ValidationController.prototype, "validate", null);
exports.ValidationController = ValidationController = __decorate([
    (0, swagger_1.ApiTags)('Validation'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [validation_service_1.ValidationService])
], ValidationController);
//# sourceMappingURL=validation.controller.js.map