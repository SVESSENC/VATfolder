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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const crypto_1 = require("crypto");
let DocumentsService = class DocumentsService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async getApplication(applicationId, userId) {
        const app = await this.prisma.vatApplication.findUnique({
            where: { id: applicationId },
        });
        if (!app)
            throw new common_1.NotFoundException(`Application ${applicationId} not found`);
        if (app.applicantId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return app;
    }
    async initiateUpload(applicationId, userId, dto) {
        await this.getApplication(applicationId, userId);
        const storagePath = `applications/${applicationId}/documents/${(0, crypto_1.randomUUID)()}/${dto.filename}`;
        const document = await this.prisma.document.create({
            data: {
                ownerApplicationId: applicationId,
                filename: dto.filename,
                contentType: dto.contentType,
                storagePath,
                checksum: dto.checksum ?? null,
            },
        });
        // In production this would return a presigned URL from an S3-compatible object store.
        // For now we return the document record and a placeholder uploadUrl.
        const storageBaseUrl = this.config.get('BLOB_STORAGE_URL', 'https://storage.example.com');
        return {
            documentId: document.id,
            uploadUrl: `${storageBaseUrl}/${storagePath}`,
            storagePath,
            expiresIn: 900, // 15 minutes
        };
    }
    async findOne(applicationId, documentId, userId) {
        await this.getApplication(applicationId, userId);
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc || doc.ownerApplicationId !== applicationId)
            throw new common_1.NotFoundException(`Document ${documentId} not found`);
        return doc;
    }
    async listForApplication(applicationId, userId) {
        await this.getApplication(applicationId, userId);
        return this.prisma.document.findMany({
            where: { ownerApplicationId: applicationId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map