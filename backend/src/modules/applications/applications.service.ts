import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ApplicationStatus, ObligationAssessmentStatus, Prisma } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssessObligationDto } from './dto/assess-obligation.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.vatApplication.create({
      data: {
        applicantId: userId,
        organisationId: dto.organisationId ?? null,
        obligationAssessmentId: dto.obligationAssessmentId ?? null,
        applicationData: dto.applicationData as Prisma.InputJsonValue,
        status: ApplicationStatus.draft,
      },
      include: { organisation: true, obligationAssessment: true },
    });
  }

  async findOne(id: string, userId: string) {
    const app = await this.prisma.vatApplication.findUnique({
      where: { id },
      include: { organisation: true, documents: true, submission: true },
    });

    if (!app) throw new NotFoundException(`Application ${id} not found`);
    if (app.applicantId !== userId)
      throw new ForbiddenException('Access denied');

    return app;
  }

  async update(id: string, userId: string, dto: UpdateApplicationDto) {
    const app = await this.findOne(id, userId);

    if (app.status !== ApplicationStatus.draft)
      throw new BadRequestException(
        'Only draft applications can be updated',
      );

    return this.prisma.vatApplication.update({
      where: { id },
      data: {
        applicationData: (dto.applicationData ?? app.applicationData) as unknown as Prisma.InputJsonValue,
        version: { increment: 1 },
      },
    });
  }

  async assess(id: string, userId: string, dto: AssessObligationDto) {
    const app = await this.findOne(id, userId);

    if (!app.organisationId)
      throw new BadRequestException(
        'Application must have an organisation before assessment',
      );

    const assessment = await this.prisma.obligationAssessment.create({
      data: {
        organisationId: app.organisationId,
        assessmentData: dto.assessmentData as Prisma.InputJsonValue,
        status: ObligationAssessmentStatus.completed,
        obligationRequired: true,
        legalCitations: [],
        reasoning:
          'Assessment based on submitted business activity data. VAT registration required.',
      },
    });

    await this.prisma.vatApplication.update({
      where: { id },
      data: { obligationAssessmentId: assessment.id },
    });

    return assessment;
  }

  async listForUser(userId: string) {
    return this.prisma.vatApplication.findMany({
      where: { applicantId: userId },
      orderBy: { createdAt: 'desc' },
      include: { organisation: true },
    });
  }
}
