import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  ApplicationStatus,
  SubmissionStatus,
} from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  private async getApplication(applicationId: string, userId: string) {
    const app = await this.prisma.vatApplication.findUnique({
      where: { id: applicationId },
      include: { submission: true },
    });
    if (!app)
      throw new NotFoundException(`Application ${applicationId} not found`);
    if (app.applicantId !== userId)
      throw new ForbiddenException('Access denied');
    return app;
  }

  async submit(
    applicationId: string,
    userId: string,
    idempotencyKey: string,
    correlationId: string | null,
    route: string,
  ) {
    const app = await this.getApplication(applicationId, userId);

    if (app.status !== ApplicationStatus.validated) {
      throw new BadRequestException(
        `Application must be in 'validated' status before submission (current: ${app.status})`,
      );
    }

    if (app.submission) {
      throw new ConflictException(
        `Application ${applicationId} has already been submitted`,
      );
    }

    // Idempotency: return cached response if key already used
    const requestHash = createHash('sha256')
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
        payload: app.applicationData as object,
        status: SubmissionStatus.queued,
      },
    });

    await this.prisma.vatApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.queued },
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

  async getStatus(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { application: true },
    });

    if (!submission)
      throw new NotFoundException(`Submission ${submissionId} not found`);

    if (submission.application?.applicantId !== userId)
      throw new ForbiddenException('Access denied');

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

  async retry(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { application: true },
    });

    if (!submission)
      throw new NotFoundException(`Submission ${submissionId} not found`);

    if (submission.application?.applicantId !== userId)
      throw new ForbiddenException('Access denied');

    if (submission.status !== SubmissionStatus.failed) {
      throw new BadRequestException(
        `Only failed submissions can be retried (current: ${submission.status})`,
      );
    }

    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.queued, lastError: null },
    });

    return {
      submissionId: updated.id,
      status: updated.status,
    };
  }
}
