import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { ApiTags } from '@nestjs/swagger';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';

@ApiTags('Analytics')
@Controller('/analytics')
export class AnalyticsController {
  constructor(
    private _integrationService: IntegrationService,
    private _postsService: PostsService
  ) {}

  @Get('/:integration')
  async getIntegration(
    @GetOrgFromRequest() org: Organization,
    @Param('integration') integration: string,
    @Query('date') date: string
  ) {
    return this._integrationService.checkAnalytics(org, integration, date);
  }

  @Get('/post/:postId')
  async getPostAnalytics(
    @GetOrgFromRequest() org: Organization,
    @Param('postId') postId: string,
    @Query('date') date: string
  ) {
    return this._postsService.checkPostAnalytics(org.id, postId, +date);
  }

  /**
   * Get audience demographics for an integration (FB Page or IG account)
   */
  @Get('/demographics/:integration')
  async getDemographics(
    @GetOrgFromRequest() org: Organization,
    @Param('integration') integration: string
  ) {
    return this._integrationService.checkDemographics(org, integration);
  }

  /**
   * Get cross-platform analytics summary across all integrations
   */
  @Get('/cross-platform/summary')
  async getCrossPlatformSummary(
    @GetOrgFromRequest() org: Organization,
    @Query('date') date: string
  ) {
    return this._integrationService.getCrossPlatformAnalytics(
      org,
      date
    );
  }

  @Get('/content-ranking/:integration')
  async getContentRanking(
    @GetOrgFromRequest() org: Organization,
    @Param('integration') integration: string,
    @Query('date') date: string
  ) {
    return this._integrationService.getContentRanking(
      org,
      integration,
      date || '30'
    );
  }

  @Get('/export')
  async exportAnalytics(
    @GetOrgFromRequest() org: Organization,
    @Query('date') date: string,
    @Res() res: any
  ) {
    const summary = await this._integrationService.getCrossPlatformAnalytics(
      org,
      date
    );

    let csv = 'Integration,Provider,Label,Date,Value\n';
    
    for (const integration of summary) {
      for (const metric of integration.analytics) {
        for (const dataPoint of metric.data) {
          csv += `"${integration.name}",${integration.provider},"${metric.label}",${dataPoint.date},${dataPoint.total}\n`;
        }
      }
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`analytics-${date}-days.csv`);
    return res.send(csv);
  }
}
