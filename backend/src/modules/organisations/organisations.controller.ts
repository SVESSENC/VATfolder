import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';

@Controller('api/v1/organisations')
@ApiTags('Organisations')
export class OrganisationsController {
  constructor(private organisationsService: OrganisationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get organisation by CVR' })
  async getOrganisation(@Query('cvr') cvr: string) {
    return this.organisationsService.getOrganisationByCvr(cvr);
  }
}
