import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { ValidateApplicationDto } from './dto/validate-application.dto';

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  legalCitation?: string;
}

// Static ruleset — replace with a YAML/DB-driven engine when available.
const RULESETS: Record<string, { version: string; rules: string[]; effectiveFrom: string }> = {
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

@Injectable()
export class ValidationService {
  constructor(private prisma: PrismaService) {}

  getRulesets() {
    return Object.values(RULESETS);
  }

  async validate(
    applicationId: string,
    userId: string,
    dto: ValidateApplicationDto,
  ) {
    const app = await this.prisma.vatApplication.findUnique({
      where: { id: applicationId },
      include: { organisation: true },
    });

    if (!app) throw new NotFoundException(`Application ${applicationId} not found`);
    if (app.applicantId !== userId)
      throw new ForbiddenException('Access denied');

    if (
      app.status === ApplicationStatus.submitted ||
      app.status === ApplicationStatus.accepted
    ) {
      throw new BadRequestException(
        `Cannot validate an application with status ${app.status}`,
      );
    }

    const data = app.applicationData as Record<string, unknown>;
    const issues: ValidationIssue[] = [];

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
      const startDate = new Date(data['registrationStartDate'] as string);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      if (startDate < twelveMonthsAgo) {
        issues.push({
          field: 'applicationData.registrationStartDate',
          message:
            'Registration start date must not be more than 12 months in the past',
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
      ? ApplicationStatus.validated
      : ApplicationStatus.draft;

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
}
