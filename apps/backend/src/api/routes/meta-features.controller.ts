import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Organization } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { MetaFeaturesService } from '@gitroom/nestjs-libraries/database/prisma/meta-features/meta-features.service';

@ApiTags('Meta Ads')
@Controller('/ads')
export class MetaAdsController {
  constructor(private _meta: MetaFeaturesService) {}

  @Get('/:integrationId/campaigns')
  campaigns(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.listCampaigns(org.id, integrationId);
  }

  @Post('/:integrationId/campaigns/sync')
  syncCampaigns(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.syncCampaigns(org.id, integrationId);
  }

  @Post('/:integrationId/campaigns')
  createCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Body() body: any
  ) {
    return this._meta.createCampaign(org.id, integrationId, body);
  }

  @Put('/:integrationId/campaigns/:campaignId')
  updateCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('campaignId') campaignId: string,
    @Body() body: any
  ) {
    return this._meta.updateCampaign(org.id, integrationId, campaignId, body);
  }

  @Post('/:integrationId/adsets')
  createAdSet(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.createAdSet(org.id, integrationId, body);
  }

  @Post('/:integrationId/creatives')
  createCreative(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.createAdCreative(org.id, integrationId, body);
  }

  @Post('/:integrationId/ads')
  createAd(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.createAd(org.id, integrationId, body);
  }

  @Post('/:integrationId/insights')
  insights(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.adInsights(org.id, integrationId, body);
  }
}

@ApiTags('Meta Leads')
@Controller('/leads')
export class MetaLeadsController {
  constructor(private _meta: MetaFeaturesService) {}

  @Post('/:integrationId/forms/sync')
  syncForms(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.syncLeadForms(org.id, integrationId);
  }

  @Get('/')
  leads(@GetOrgFromRequest() org: Organization, @Query('formId') formId?: string) {
    return this._meta.listLeads(org.id, formId);
  }

  @Put('/:leadId/status')
  status(@GetOrgFromRequest() org: Organization, @Param('leadId') leadId: string, @Body() body: { status: string }) {
    return this._meta.updateLeadStatus(org.id, leadId, body.status);
  }

  @Get('/export.csv')
  async export(@GetOrgFromRequest() org: Organization, @Res() res: Response) {
    const leads = await this._meta.listLeads(org.id);
    const csv = [
      'Form,Lead ID,Status,Created At,Fields',
      ...leads.map((lead: any) =>
        [
          JSON.stringify(lead.form?.name || ''),
          lead.externalLeadId,
          lead.status,
          lead.platformCreatedAt?.toISOString?.() || lead.createdAt.toISOString(),
          JSON.stringify(lead.fieldData).replace(/"/g, '""'),
        ].join(',')
      ),
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('meta-leads.csv');
    return res.send(csv);
  }
}

@ApiTags('Meta Commerce')
@Controller('/commerce')
export class MetaCommerceController {
  constructor(private _meta: MetaFeaturesService) {}

  @Post('/:integrationId/catalogs/sync')
  syncCatalogs(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.syncCatalogs(org.id, integrationId);
  }

  @Post('/:integrationId/catalogs/:catalogId/products/sync')
  syncProducts(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('catalogId') catalogId: string
  ) {
    return this._meta.syncProducts(org.id, integrationId, catalogId);
  }

  @Post('/:integrationId/catalogs/:catalogId/products')
  createProduct(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('catalogId') catalogId: string,
    @Body() body: any
  ) {
    return this._meta.createProduct(org.id, integrationId, catalogId, body);
  }
}

@ApiTags('Meta Audiences')
@Controller('/audiences')
export class MetaAudiencesController {
  constructor(private _meta: MetaFeaturesService) {}

  @Get('/')
  list(@GetOrgFromRequest() org: Organization, @Query('integrationId') integrationId?: string) {
    return this._meta.listAudiences(org.id, integrationId);
  }

  @Post('/:integrationId')
  create(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.createAudience(org.id, integrationId, body);
  }

  @Post('/:integrationId/delivery-estimate')
  estimate(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string, @Body() body: any) {
    return this._meta.deliveryEstimate(org.id, integrationId, body.targeting || body);
  }
}

@ApiTags('Platform Subscriptions')
@Controller('/subscriptions')
export class PlatformSubscriptionsController {
  constructor(private _meta: MetaFeaturesService) {}

  @Get('/:integrationId')
  list(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Query() query: any
  ) {
    return this._meta.listSubscriptions(org.id, integrationId, query);
  }

  @Post('/:integrationId')
  subscribe(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Body() body: any
  ) {
    return this._meta.subscribeEvents(org.id, integrationId, body);
  }

  @Post('/:integrationId/unsubscribe')
  unsubscribe(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Body() body: any
  ) {
    return this._meta.unsubscribeEvents(org.id, integrationId, body);
  }
}

@ApiTags('Meta Content Suggestions')
@Controller('/content-suggestions')
export class ContentSuggestionsController {
  constructor(private _meta: MetaFeaturesService) {}

  @Get('/:integrationId/best-times')
  bestTimes(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.bestPostingTimes(org.id, integrationId);
  }

  @Post('/hashtags')
  hashtags(@GetOrgFromRequest() org: Organization, @Body() body: { content: string; platform?: string }) {
    return this._meta.suggestHashtags(org.id, body);
  }

  @Get('/:integrationId/content-ideas')
  ideas(@GetOrgFromRequest() org: Organization, @Param('integrationId') integrationId: string) {
    return this._meta.contentIdeas(org.id, integrationId);
  }

  @Get('/:integrationId/competitor/:username')
  competitor(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Param('username') username: string
  ) {
    return this._meta.competitor(org.id, integrationId, username);
  }

  @Get('/:integrationId/trending-audio')
  audio(
    @GetOrgFromRequest() org: Organization,
    @Param('integrationId') integrationId: string,
    @Query('q') q?: string
  ) {
    return this._meta.trendingAudio(org.id, integrationId, q);
  }
}

@ApiTags('Meta Webhooks')
@Controller('/webhooks/meta')
export class MetaWebhookController {
  constructor(private _meta: MetaFeaturesService) {}

  @Get('/')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    if (mode === 'subscribe' && verifyToken === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge || '');
    }
    return res.status(403).send('Invalid verification token');
  }

  @Post('/')
  async ingest(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (process.env.FACEBOOK_WEBHOOK_APP_SECRET && req.rawBody && signature) {
      const expected = `sha256=${createHmac('sha256', process.env.FACEBOOK_WEBHOOK_APP_SECRET)
        .update(req.rawBody)
        .digest('hex')}`;
      const expectedBuffer = Buffer.from(expected);
      const signatureBuffer = Buffer.from(signature);
      if (
        expectedBuffer.length !== signatureBuffer.length ||
        !timingSafeEqual(expectedBuffer, signatureBuffer)
      ) {
        return res.status(401).send('Invalid signature');
      }
    }

    const result = await this._meta.logWebhook(body);
    return res.status(200).send(result);
  }
}

@ApiTags('TikTok Webhooks')
@Controller('/webhooks/tiktok')
export class TikTokWebhookController {
  constructor(private _meta: MetaFeaturesService) {}

  @Post('/')
  async ingest(@Body() body: any, @Res() res: Response) {
    const result = await this._meta.logWebhook({
      object: 'tiktok',
      ...body,
    });
    return res.status(200).send(result);
  }
}
