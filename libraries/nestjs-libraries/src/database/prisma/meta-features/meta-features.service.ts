import { Injectable } from '@nestjs/common';
import { SocialInboxDirection } from '@prisma/client';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { metaGraphUrl } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';
import { SocialInboxRepository } from '@gitroom/nestjs-libraries/database/prisma/social-inbox/social-inbox.repository';

@Injectable()
export class MetaFeaturesService {
  constructor(
    private _integration: PrismaRepository<'integration'>,
    private _adCampaign: PrismaRepository<'adCampaign'>,
    private _adSet: PrismaRepository<'adSet'>,
    private _ad: PrismaRepository<'ad'>,
    private _adCreative: PrismaRepository<'adCreative'>,
    private _leadForm: PrismaRepository<'leadForm'>,
    private _lead: PrismaRepository<'lead'>,
    private _commerceCatalog: PrismaRepository<'commerceCatalog'>,
    private _commerceProduct: PrismaRepository<'commerceProduct'>,
    private _metaAudience: PrismaRepository<'metaAudience'>,
    private _contentSuggestion: PrismaRepository<'contentSuggestion'>,
    private _metaWebhookEvent: PrismaRepository<'metaWebhookEvent'>,
    private _socialInbox: SocialInboxRepository,
    private _integrationManager: IntegrationManager
  ) {}

  private async integration(orgId: string, integrationId: string) {
    const integration = await this._integration.model.integration.findFirst({
      where: { id: integrationId, organizationId: orgId, deletedAt: null },
    });
    if (!integration) {
      throw new Error('Integration not found');
    }

    return integration;
  }

  private provider(identifier: string): any {
    return this._integrationManager.getSocialIntegration(identifier) as any;
  }

  private assertActiveConfirmed(status?: string, confirmActive?: boolean) {
    if (status === 'ACTIVE' && !confirmActive) {
      throw new Error('Active ad mutations require confirmActive=true');
    }
  }

  private externalId(result: any, keys: string[]) {
    for (const key of keys) {
      const value = key
        .split('.')
        .reduce((current, part) => current?.[part], result);
      if (value) return String(value);
    }
    return String(result?.id || result?.data?.id || '');
  }

  private async graph(provider: any, path: string, accessToken: string, options?: RequestInit) {
    return (
      await provider.fetch(
        path.startsWith('https://') ? path : metaGraphUrl(path),
        options || undefined
      )
    ).json();
  }

  async listCampaigns(orgId: string, integrationId: string) {
    await this.integration(orgId, integrationId);
    return this._adCampaign.model.adCampaign.findMany({
      where: { integrationId, deletedAt: null },
      include: { adSets: { include: { ads: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async syncCampaigns(orgId: string, integrationId: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const campaignList = provider.listCampaigns
      ? await provider.listCampaigns(integration.internalId, integration.token)
      : await this.graph(
          provider,
          `/act_${integration.internalId}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time&limit=100&access_token=${integration.token}`,
          integration.token
        );
    const data = campaignList?.data?.list || campaignList?.data || campaignList?.list || [];

    for (const campaign of data || []) {
      const externalId = String(campaign.id || campaign.campaign_id);
      const name = campaign.name || campaign.campaign_name || externalId;
      await this._adCampaign.model.adCampaign.upsert({
        where: {
          integrationId_externalId: {
            integrationId,
            externalId,
          },
        },
        create: {
          integrationId,
          externalId,
          name,
          objective: campaign.objective || campaign.objective_type || '',
          status: campaign.status || campaign.operation_status || 'UNKNOWN',
          dailyBudget: campaign.daily_budget ? Number(campaign.daily_budget) / 100 : undefined,
          lifetimeBudget: campaign.lifetime_budget ? Number(campaign.lifetime_budget) / 100 : undefined,
          startDate: campaign.start_time ? new Date(campaign.start_time) : undefined,
          endDate: campaign.stop_time ? new Date(campaign.stop_time) : undefined,
          rawPayload: campaign,
        },
        update: {
          name,
          objective: campaign.objective || campaign.objective_type || '',
          status: campaign.status || campaign.operation_status || 'UNKNOWN',
          dailyBudget: campaign.daily_budget ? Number(campaign.daily_budget) / 100 : undefined,
          lifetimeBudget: campaign.lifetime_budget ? Number(campaign.lifetime_budget) / 100 : undefined,
          startDate: campaign.start_time ? new Date(campaign.start_time) : undefined,
          endDate: campaign.stop_time ? new Date(campaign.stop_time) : undefined,
          rawPayload: campaign,
          syncedAt: new Date(),
        },
      });
    }

    return this.listCampaigns(orgId, integrationId);
  }

  async createCampaign(orgId: string, integrationId: string, body: any) {
    this.assertActiveConfirmed(body.status, body.confirmActive);
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    if (!provider.createCampaign) {
      throw new Error(`${integration.providerIdentifier} does not support campaign creation`);
    }

    const result = await provider.createCampaign(integration.internalId, integration.token, body);
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.campaign_id',
      'campaign_id',
    ]);
    if (!externalId) throw new Error('Campaign created but no external ID was returned');
    return this._adCampaign.model.adCampaign.upsert({
      where: { integrationId_externalId: { integrationId, externalId } },
      create: {
        integrationId,
        externalId,
        name: body.name,
        objective: body.objective,
        status: body.status || 'PAUSED',
        dailyBudget: body.dailyBudget,
        lifetimeBudget: body.lifetimeBudget,
        rawPayload: result,
      },
      update: {
        name: body.name,
        objective: body.objective,
        status: body.status || 'PAUSED',
        dailyBudget: body.dailyBudget,
        lifetimeBudget: body.lifetimeBudget,
        rawPayload: result,
      },
    });
  }

  async updateCampaign(orgId: string, integrationId: string, campaignId: string, body: any) {
    this.assertActiveConfirmed(body.status, body.confirmActive);
    const integration = await this.integration(orgId, integrationId);
    const campaign = await this._adCampaign.model.adCampaign.findFirst({
      where: { id: campaignId, integrationId, deletedAt: null },
    });
    if (!campaign) throw new Error('Campaign not found');
    const provider = this.provider(integration.providerIdentifier);
    const result = await provider.updateCampaign(
      integration.internalId,
      integration.token,
      campaign.externalId,
      body
    );
    return this._adCampaign.model.adCampaign.update({
      where: { id: campaign.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(typeof body.dailyBudget !== 'undefined' ? { dailyBudget: body.dailyBudget } : {}),
        ...(typeof body.lifetimeBudget !== 'undefined' ? { lifetimeBudget: body.lifetimeBudget } : {}),
        rawPayload: result,
      },
    });
  }

  async createAdSet(orgId: string, integrationId: string, body: any) {
    this.assertActiveConfirmed(body.status, body.confirmActive);
    const integration = await this.integration(orgId, integrationId);
    const campaign = await this._adCampaign.model.adCampaign.findFirst({
      where: { id: body.campaignId, integrationId, deletedAt: null },
    });
    const provider = this.provider(integration.providerIdentifier);
    const input = { ...body, campaignId: campaign?.externalId || body.campaignId };
    const result = await provider.createAdSet(integration.internalId, integration.token, input);
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.adgroup_id',
      'adgroup_id',
    ]);
    if (!campaign) return result;

    return this._adSet.model.adSet.upsert({
      where: { campaignId_externalId: { campaignId: campaign.id, externalId } },
      create: {
        campaignId: campaign.id,
        externalId,
        name: body.name,
        status: body.status || 'PAUSED',
        targeting: body.targeting || {},
        bidStrategy: body.bidStrategy,
        budget: body.dailyBudget || body.lifetimeBudget,
        rawPayload: result,
      },
      update: {
        name: body.name,
        status: body.status || 'PAUSED',
        targeting: body.targeting || {},
        bidStrategy: body.bidStrategy,
        budget: body.dailyBudget || body.lifetimeBudget,
        rawPayload: result,
      },
    });
  }

  async createAdCreative(orgId: string, integrationId: string, body: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const result = await provider.createAdCreative(integration.internalId, integration.token, body);
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.image_id',
      'data.video_id',
      'data.material_id',
      'image_id',
      'video_id',
    ]);
    if (!externalId) throw new Error('Creative created but no external ID was returned');
    return this._adCreative.model.adCreative.upsert({
      where: { integrationId_externalId: { integrationId, externalId } },
      create: {
        integrationId,
        externalId,
        name: body.name,
        creativeData: body,
        rawPayload: result,
      },
      update: { name: body.name, creativeData: body, rawPayload: result },
    });
  }

  async createAd(orgId: string, integrationId: string, body: any) {
    this.assertActiveConfirmed(body.status, body.confirmActive);
    const integration = await this.integration(orgId, integrationId);
    const adSet = await this._adSet.model.adSet.findFirst({
      where: { id: body.adSetId, campaign: { integrationId }, deletedAt: null },
    });
    const creative = await this._adCreative.model.adCreative.findFirst({
      where: { id: body.creativeId, integrationId, deletedAt: null },
    });
    const provider = this.provider(integration.providerIdentifier);
    const result = await provider.createAd(integration.internalId, integration.token, {
      ...body,
      adSetId: adSet?.externalId || body.adSetId,
      creativeId: creative?.externalId || body.creativeId,
    });
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.ad_id',
      'data.ad_ids.0',
      'ad_id',
    ]);
    if (!adSet) return result;

    return this._ad.model.ad.upsert({
      where: { adSetId_externalId: { adSetId: adSet.id, externalId } },
      create: {
        adSetId: adSet.id,
        creativeId: creative?.id,
        externalId,
        name: body.name,
        status: body.status || 'PAUSED',
        creativeData: body,
        rawPayload: result,
      },
      update: {
        creativeId: creative?.id,
        name: body.name,
        status: body.status || 'PAUSED',
        creativeData: body,
        rawPayload: result,
      },
    });
  }

  async adInsights(orgId: string, integrationId: string, query: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    return provider.adsInsights(integration.internalId, integration.token, query);
  }

  async syncLeadForms(orgId: string, integrationId: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const forms = provider.listLeadForms
      ? await provider.listLeadForms(integration.internalId, integration.token)
      : [];

    for (const form of forms || []) {
      await this._leadForm.model.leadForm.upsert({
        where: { integrationId_externalFormId: { integrationId, externalFormId: form.externalFormId } },
        create: {
          integrationId,
          externalFormId: form.externalFormId,
          name: form.name,
          status: form.status || 'ACTIVE',
          rawPayload: form as any,
        },
        update: {
          name: form.name,
          status: form.status || 'ACTIVE',
          rawPayload: form as any,
        },
      });
    }

    return this._leadForm.model.leadForm.findMany({
      where: { integrationId, deletedAt: null },
      include: { leads: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listLeads(orgId: string, formId?: string) {
    return this._lead.model.lead.findMany({
      where: {
        deletedAt: null,
        ...(formId ? { formId } : {}),
        form: { integration: { organizationId: orgId, deletedAt: null } },
      },
      include: { form: { include: { integration: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLeadStatus(orgId: string, leadId: string, status: string) {
    const lead = await this._lead.model.lead.findFirst({
      where: { id: leadId, form: { integration: { organizationId: orgId } } },
    });
    if (!lead) throw new Error('Lead not found');
    return this._lead.model.lead.update({ where: { id: leadId }, data: { status } });
  }

  async ingestLeadByExternalId(integrationId: string, leadgenId: string) {
    const integration = await this._integration.model.integration.findFirst({
      where: { id: integrationId, deletedAt: null },
    });
    if (!integration) return null;
    const provider = this.provider(integration.providerIdentifier);
    if (!provider.fetchLead) return null;
    const lead = await provider.fetchLead(integration.internalId, integration.token, leadgenId);
    const externalFormId = String(lead.form_id || lead.form?.id || 'unknown');
    const form = await this._leadForm.model.leadForm.upsert({
      where: { integrationId_externalFormId: { integrationId, externalFormId } },
      create: {
        integrationId,
        externalFormId,
        name: `Lead Form ${externalFormId}`,
      },
      update: {},
    });
    return this._lead.model.lead.upsert({
      where: { formId_externalLeadId: { formId: form.id, externalLeadId: lead.id } },
      create: {
        formId: form.id,
        externalLeadId: lead.id,
        fieldData: lead.field_data || lead,
        platformCreatedAt: lead.created_time ? new Date(lead.created_time) : undefined,
        rawPayload: lead,
      },
      update: {
        fieldData: lead.field_data || lead,
        rawPayload: lead,
      },
    });
  }

  async syncCatalogs(orgId: string, integrationId: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const catalogs = provider.listCatalogs
      ? await provider.listCatalogs(integration.internalId, integration.token)
      : [];
    for (const catalog of catalogs || []) {
      const externalCatalogId = String(catalog.id || catalog.catalog_id);
      const name = catalog.name || catalog.catalog_name || externalCatalogId;
      await this._commerceCatalog.model.commerceCatalog.upsert({
        where: {
          integrationId_externalCatalogId: {
            integrationId,
            externalCatalogId,
          },
        },
        create: {
          integrationId,
          externalCatalogId,
          name,
          rawPayload: catalog,
        },
        update: {
          name,
          rawPayload: catalog,
          syncedAt: new Date(),
        },
      });
    }
    return this._commerceCatalog.model.commerceCatalog.findMany({
      where: { integrationId, deletedAt: null },
      include: { products: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async syncProducts(orgId: string, integrationId: string, catalogId: string) {
    const integration = await this.integration(orgId, integrationId);
    const catalog = await this._commerceCatalog.model.commerceCatalog.findFirst({
      where: { id: catalogId, integrationId, deletedAt: null },
    });
    if (!catalog) throw new Error('Catalog not found');
    const provider = this.provider(integration.providerIdentifier);
    const products = provider.listProducts
      ? await provider.listProducts(integration.internalId, integration.token, catalog.externalCatalogId)
      : [];
    for (const product of products || []) {
      const externalProductId = String(
        product.id || product.product_id || product.sku_id
      );
      const name =
        product.name || product.title || product.product_name || externalProductId;
      await this._commerceProduct.model.commerceProduct.upsert({
        where: { catalogId_externalProductId: { catalogId, externalProductId } },
        create: {
          catalogId,
          externalProductId,
          retailerId: product.retailer_id || product.sku_id,
          name,
          description: product.description,
          price: product.price,
          availability: product.availability,
          imageUrl: product.image_url || product.main_image_url,
          productUrl: product.url || product.landing_page_url,
          rawPayload: product,
        },
        update: {
          retailerId: product.retailer_id || product.sku_id,
          name,
          description: product.description,
          price: product.price,
          availability: product.availability,
          imageUrl: product.image_url || product.main_image_url,
          productUrl: product.url || product.landing_page_url,
          rawPayload: product,
          syncedAt: new Date(),
        },
      });
    }
    return this._commerceProduct.model.commerceProduct.findMany({
      where: { catalogId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createProduct(orgId: string, integrationId: string, catalogId: string, body: any) {
    const integration = await this.integration(orgId, integrationId);
    const catalog = await this._commerceCatalog.model.commerceCatalog.findFirst({
      where: { id: catalogId, integrationId, deletedAt: null },
    });
    if (!catalog) throw new Error('Catalog not found');
    const provider = this.provider(integration.providerIdentifier);
    const result = await provider.createProduct(
      integration.internalId,
      integration.token,
      catalog.externalCatalogId,
      body
    );
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.product_id',
      'data.sku_id',
      'product_id',
    ]);
    if (!externalId) throw new Error('Product created but no external ID was returned');
    return this._commerceProduct.model.commerceProduct.upsert({
      where: { catalogId_externalProductId: { catalogId, externalProductId: externalId } },
      create: {
        catalogId,
        externalProductId: externalId,
        retailerId: body.retailerId,
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency,
        availability: body.availability,
        imageUrl: body.imageUrl,
        productUrl: body.url,
        rawPayload: result,
      },
      update: {
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency,
        availability: body.availability,
        imageUrl: body.imageUrl,
        productUrl: body.url,
        rawPayload: result,
      },
    });
  }

  async createAudience(orgId: string, integrationId: string, body: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const result = body.lookalikeSourceAudienceId
      ? await provider.createLookalikeAudience(
          integration.internalId,
          integration.token,
          body.lookalikeSourceAudienceId,
          body
        )
      : await provider.createAudience(integration.internalId, integration.token, body);
    const externalId = this.externalId(result, [
      'id',
      'data.id',
      'data.audience_id',
      'audience_id',
    ]);
    if (!externalId) throw new Error('Audience created but no external ID was returned');
    return this._metaAudience.model.metaAudience.upsert({
      where: { integrationId_externalAudienceId: { integrationId, externalAudienceId: externalId } },
      create: {
        integrationId,
        externalAudienceId: externalId,
        name: body.name,
        subtype: body.subtype || (body.lookalikeSourceAudienceId ? 'LOOKALIKE' : 'CUSTOM'),
        status: result.operation_status?.status,
        rawPayload: result,
      },
      update: {
        name: body.name,
        subtype: body.subtype || (body.lookalikeSourceAudienceId ? 'LOOKALIKE' : 'CUSTOM'),
        status: result.operation_status?.status,
        rawPayload: result,
      },
    });
  }

  async listAudiences(orgId: string, integrationId?: string) {
    return this._metaAudience.model.metaAudience.findMany({
      where: {
        deletedAt: null,
        ...(integrationId ? { integrationId } : {}),
        integration: { organizationId: orgId, deletedAt: null },
      },
      include: { integration: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deliveryEstimate(orgId: string, integrationId: string, targeting: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    return provider.deliveryEstimate(integration.internalId, integration.token, targeting);
  }

  async listSubscriptions(orgId: string, integrationId: string, query: any = {}) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    if (!provider.getSubscriptions) {
      throw new Error(`${integration.providerIdentifier} does not support event subscriptions`);
    }
    return provider.getSubscriptions(integration.internalId, integration.token, query);
  }

  async subscribeEvents(orgId: string, integrationId: string, body: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    if (!provider.subscribeEvents) {
      throw new Error(`${integration.providerIdentifier} does not support event subscriptions`);
    }
    return provider.subscribeEvents(integration.internalId, integration.token, body);
  }

  async unsubscribeEvents(orgId: string, integrationId: string, body: any) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    if (!provider.unsubscribeEvents) {
      throw new Error(`${integration.providerIdentifier} does not support event subscriptions`);
    }
    return provider.unsubscribeEvents(integration.internalId, integration.token, body);
  }

  async bestPostingTimes(orgId: string, integrationId: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const postingTimes = JSON.parse(integration.postingTimes || '[]');
    const result = postingTimes.map((slot: any) => ({
      minuteOfDay: slot.time,
      score: 1,
    }));
    return this.saveSuggestion(orgId, integrationId, 'best-times', { provider: integration.providerIdentifier }, result, provider);
  }

  async suggestHashtags(orgId: string, body: { content: string; platform?: string }) {
    const words = (body.content || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s#]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !word.startsWith('#'));
    const unique = Array.from(new Set(words)).slice(0, 10);
    const result = unique.map((word) => `#${word}`);
    return this.saveSuggestion(orgId, undefined, 'hashtags', body, result);
  }

  async contentIdeas(orgId: string, integrationId: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const ranking = provider.contentRanking
      ? await provider.contentRanking(integration.internalId, integration.token, 90)
      : [];
    const result = ranking.slice(0, 10).map((item: any) => ({
      title: item.message ? `Follow up on: ${String(item.message).slice(0, 80)}` : 'Create a follow-up post',
      sourcePostId: item.id,
      score: item.score,
    }));
    return this.saveSuggestion(orgId, integrationId, 'content-ideas', { topPosts: ranking.length }, result);
  }

  async competitor(orgId: string, integrationId: string, username: string) {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const result = await this.graph(
      provider,
      `/${integration.internalId}?fields=business_discovery.username(${encodeURIComponent(username)}){username,followers_count,media_count,media.limit(12){caption,like_count,comments_count,media_type,permalink,timestamp}}&access_token=${integration.token}`,
      integration.token
    );
    return this.saveSuggestion(orgId, integrationId, 'competitor', { username }, result);
  }

  async trendingAudio(orgId: string, integrationId: string, query = 'trending') {
    const integration = await this.integration(orgId, integrationId);
    const provider = this.provider(integration.providerIdentifier);
    const response = provider.music
      ? await (await provider.music(integration.token, { q: query })).json()
      : { data: [] };
    return this.saveSuggestion(orgId, integrationId, 'trending-audio', { query }, response.data || []);
  }

  private async saveSuggestion(
    organizationId: string,
    integrationId: string | undefined,
    type: string,
    input: any,
    result: any,
    _provider?: any
  ) {
    return this._contentSuggestion.model.contentSuggestion.create({
      data: {
        organizationId,
        integrationId,
        type,
        input,
        result,
      },
    });
  }

  async logWebhook(body: any, integrationId?: string, organizationId?: string) {
    const event = await this._metaWebhookEvent.model.metaWebhookEvent.create({
      data: {
        organizationId,
        integrationId,
        objectType: body.object || 'unknown',
        eventType: body.entry?.[0]?.changes?.[0]?.field || body.entry?.[0]?.messaging?.[0]?.message ? 'message' : undefined,
        externalId: String(body.entry?.[0]?.id || ''),
        payload: body,
      },
    });
    await this.processWebhookEvent(event.id);
    return { received: true, eventId: event.id };
  }

  async processWebhookEvent(eventId: string) {
    const event = await this._metaWebhookEvent.model.metaWebhookEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) return null;

    try {
      const body: any = event.payload;
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen' && change.value?.leadgen_id) {
            const integrations = await this._integration.model.integration.findMany({
              where: {
                internalId: String(entry.id),
                deletedAt: null,
                inBetweenSteps: false,
              },
            });
            for (const integration of integrations) {
              await this.ingestLeadByExternalId(integration.id, change.value.leadgen_id);
            }
          }
        }

        for (const messaging of entry.messaging || []) {
          const integrations = await this._integration.model.integration.findMany({
            where: {
              internalId: String(entry.id),
              providerIdentifier: { in: ['whatsapp', 'facebook-messages', 'instagram-messages', 'tiktok-business'] },
              deletedAt: null,
              inBetweenSteps: false,
            },
          });
          for (const integration of integrations) {
            await this.upsertInboxWebhookMessage(integration, messaging, body.object);
          }
        }
      }

      return this._metaWebhookEvent.model.metaWebhookEvent.update({
        where: { id: eventId },
        data: { processedAt: new Date(), error: null },
      });
    } catch (err: any) {
      return this._metaWebhookEvent.model.metaWebhookEvent.update({
        where: { id: eventId },
        data: { error: err?.message || 'Webhook processing failed' },
      });
    }
  }

  private async upsertInboxWebhookMessage(integration: any, messaging: any, objectType: string) {
    const senderId = String(messaging.sender?.id || messaging.from || '');
    if (!senderId) return;
    const sentAt = messaging.timestamp ? new Date(Number(messaging.timestamp)) : new Date();
    const content =
      messaging.message?.text ||
      messaging.text?.body ||
      messaging.postback?.title ||
      '';
    const channel =
      integration.providerIdentifier === 'instagram-messages'
        ? 'INSTAGRAM'
        : integration.providerIdentifier === 'whatsapp' || objectType === 'whatsapp_business_account'
        ? 'WHATSAPP'
        : integration.providerIdentifier === 'tiktok-business' || objectType === 'tiktok'
        ? 'TIKTOK'
        : 'FACEBOOK';
    const conversation = await this._socialInbox.upsertConversation(integration.id, {
      participantId: senderId,
      participantName: messaging.sender?.name || messaging.profile?.name,
      snippet: content,
      channel,
      lastMessageAt: sentAt,
    });

    await this._socialInbox.createMessageIfNotExists(conversation.id, {
      externalMessageId:
        messaging.message?.mid ||
        messaging.id ||
        `webhook-${senderId}-${sentAt.getTime()}`,
      senderId,
      senderName: messaging.sender?.name || messaging.profile?.name,
      direction: SocialInboxDirection.INBOUND,
      content,
      sentAt,
      rawPayload: JSON.stringify(messaging),
    });

    await this._socialInbox.updateConversationSnippet(conversation.id, {
      snippet: content,
      lastMessageAt: sentAt,
      unreadIncrement: true,
    });
  }
}
