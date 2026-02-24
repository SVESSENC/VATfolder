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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const dev_login_dto_1 = require("./dto/dev-login.dto");
let AuthController = class AuthController {
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async initiateOidc() {
        // TODO: Implement MitID OIDC flow
        return { message: 'OIDC flow initiated' };
    }
    async handleOidcCallback(payload) {
        // TODO: Implement OIDC callback handling
        return { message: 'OIDC callback received' };
    }
    /** Development-only: issue a JWT for any email without MitID. Disabled in production. */
    async devLogin(dto) {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new common_1.ForbiddenException('Dev login is not available in production');
        }
        const user = await this.authService.validateUser(`dev-sub:${dto.email}`, dto.email);
        if (dto.displayName) {
            await this.authService.updateDisplayName(user.id, dto.displayName);
        }
        const token = this.authService.generateToken(user.id);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: dto.displayName ?? user.displayName ?? dto.email,
            },
        };
    }
    async me(req) {
        return this.authService.findById(req.user.userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('oidc/initiate'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate MitID OIDC authentication flow' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "initiateOidc", null);
__decorate([
    (0, common_1.Post)('oidc/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle OIDC callback' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleOidcCallback", null);
__decorate([
    (0, common_1.Post)('dev-login'),
    (0, swagger_1.ApiOperation)({ summary: '[DEV ONLY] Login with email, bypasses MitID' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dev_login_dto_1.DevLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "devLogin", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/v1/auth'),
    (0, swagger_1.ApiTags)('Authentication'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map