import {
  Controller,
  Post,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('applications/:id/submit')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue a validated application for submission to SKAT' })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  @ApiHeader({ name: 'X-Correlation-ID', required: false })
  @ApiResponse({ status: 202, description: 'Submission queued' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Headers('x-correlation-id') correlationId: string,
  ) {
    if (!idempotencyKey)
      throw new BadRequestException('X-Idempotency-Key header is required');

    return this.submissionsService.submit(
      id,
      req.user.userId,
      idempotencyKey,
      correlationId ?? null,
      `POST /api/v1/applications/${id}/submit`,
    );
  }

  @Get('submissions/:submissionId/status')
  @ApiOperation({ summary: 'Get submission status' })
  getStatus(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Request() req: any,
  ) {
    return this.submissionsService.getStatus(submissionId, req.user.userId);
  }

  @Post('submissions/:submissionId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed submission (operator action)' })
  retry(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Request() req: any,
  ) {
    return this.submissionsService.retry(submissionId, req.user.userId);
  }
}
