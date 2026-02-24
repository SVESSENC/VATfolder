import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { InitiateUploadDto } from './dto/initiate-upload.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private async getApplication(applicationId: string, userId: string) {
    const app = await this.prisma.vatApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app)
      throw new NotFoundException(`Application ${applicationId} not found`);
    if (app.applicantId !== userId)
      throw new ForbiddenException('Access denied');
    return app;
  }

  async initiateUpload(
    applicationId: string,
    userId: string,
    dto: InitiateUploadDto,
  ) {
    await this.getApplication(applicationId, userId);

    const storagePath = `applications/${applicationId}/documents/${randomUUID()}/${dto.filename}`;

    const document = await this.prisma.document.create({
      data: {
        ownerApplicationId: applicationId,
        filename: dto.filename,
        contentType: dto.contentType,
        storagePath,
        checksum: dto.checksum ?? null,
      },
    });

    // In production this would return a presigned URL from Azure Blob / S3.
    // For now we return the document record and a placeholder uploadUrl.
    const storageBaseUrl = this.config.get<string>(
      'BLOB_STORAGE_URL',
      'https://storage.example.com',
    );

    return {
      documentId: document.id,
      uploadUrl: `${storageBaseUrl}/${storagePath}`,
      storagePath,
      expiresIn: 900, // 15 minutes
    };
  }

  async findOne(applicationId: string, documentId: string, userId: string) {
    await this.getApplication(applicationId, userId);

    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.ownerApplicationId !== applicationId)
      throw new NotFoundException(`Document ${documentId} not found`);

    return doc;
  }

  async listForApplication(applicationId: string, userId: string) {
    await this.getApplication(applicationId, userId);

    return this.prisma.document.findMany({
      where: { ownerApplicationId: applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
