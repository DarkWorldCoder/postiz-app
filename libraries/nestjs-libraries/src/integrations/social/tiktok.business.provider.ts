import dayjs from 'dayjs';
import {
  AnalyticsData,
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { Integration } from '@prisma/client';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import {
  BadBody,
  SocialAbstract,
} from '@gitroom/nestjs-libraries/integrations/social.abstract';

const TIKTOK_BUSINESS_API_BASE =
  process.env.TIKTOK_BUSINESS_API_BASE ||
  'https://business-api.tiktok.com/open_api/v1.3';

type TikTokBusinessCredentials = {
  accessToken: string;
  advertiserId: string;
  businessId?: string;
  messagingBaseUrl?: string;
  messagingApiKey?: string;
};

type TikTokMessagingSettings = {
  baseUrl?: string;
  apiKey?: string;
};

const encodeCommentId = (
  businessId: string,
  videoId: string,
  commentId: string
) => [businessId, videoId, commentId].join(':');

const decodeCommentId = (fallbackBusinessId: string, value: string) => {
  const [businessId, videoId, commentId] = value.split(':');
  if (commentId) {
    return { businessId, videoId, commentId };
  }

  return { businessId: fallbackBusinessId, videoId: '', commentId: value };
};

const decodeVideoId = (fallbackBusinessId: string, value: string) => {
  const [businessId, videoId] = value.split(':');
  if (videoId) {
    return { businessId, videoId };
  }

  return { businessId: fallbackBusinessId, videoId: value };
};

export class TikTokBusinessProvider
  extends SocialAbstract
  implements SocialProvider
{
  identifier = 'tiktok-business';
  name = 'TikTok Business';
  isBetweenSteps = false;
  editor = 'none' as const;
  scopes = [] as string[];

  maxLength() {
    return 0;
  }

  async customFields() {
    return [
      {
        key: 'accessToken',
        label: 'TikTok Business API Access Token',
        validation: `/^.+$/`,
        type: 'password' as const,
      },
      {
        key: 'advertiserId',
        label: 'Advertiser ID',
        validation: `/^\\d+$/`,
        type: 'text' as const,
      },
      {
        key: 'businessId',
        label: 'Business Account ID',
        validation: `/^\\d*$/`,
        type: 'text' as const,
      },
      {
        key: 'messagingBaseUrl',
        label: 'WiseSocial Messaging Base URL',
        validation: `/^.*$/`,
        type: 'text' as const,
      },
      {
        key: 'messagingApiKey',
        label: 'WiseSocial Messaging API Key',
        validation: `/^.*$/`,
        type: 'password' as const,
      },
    ];
  }

  async generateAuthUrl() {
    const state = makeId(6);
    return { url: state, codeVerifier: makeId(10), state };
  }

  async refreshToken(): Promise<AuthTokenDetails> {
    return {
      refreshToken: '',
      expiresIn: 0,
      accessToken: '',
      id: '',
      name: '',
      picture: '',
      username: '',
    };
  }

  async authenticate(params: { code: string }) {
    const body = JSON.parse(
      Buffer.from(params.code, 'base64').toString()
    ) as TikTokBusinessCredentials;

    try {
      const advertiser = await this.businessFetch(
        '/advertiser/info/',
        body.accessToken,
        {
          advertiser_ids: JSON.stringify([body.advertiserId]),
        }
      );
      const info = advertiser?.data?.list?.[0] || {};
      return {
        refreshToken: 'null',
        expiresIn: dayjs().add(100, 'years').unix() - dayjs().unix(),
        accessToken: body.accessToken,
        id: body.advertiserId,
        name: info.name || `TikTok Advertiser ${body.advertiserId}`,
        picture: '',
        username: body.businessId || body.advertiserId,
        additionalSettings: [
          {
            title: 'Business Account ID',
            description:
              'Use post IDs as "businessId:videoId" when managing organic TikTok comments if this value differs by video.',
            type: 'text' as const,
            value: body.businessId || '',
          },
          {
            title: 'WiseSocial Messaging Base URL',
            description:
              'Optional bridge endpoint for TikTok Business Messaging conversations.',
            type: 'text' as const,
            value:
              body.messagingBaseUrl ||
              process.env.WISESOCIAL_TIKTOK_MESSAGING_BASE_URL ||
              process.env.PROERP_TIKTOK_MESSAGING_BASE_URL ||
              '',
          },
          {
            title: 'WiseSocial Messaging API Key',
            description:
              'Optional bridge token. Environment variable WISESOCIAL_TIKTOK_MESSAGING_API_KEY takes precedence.',
            type: 'text' as const,
            value: body.messagingApiKey || '',
          },
        ],
      };
    } catch (err) {
      return 'Invalid TikTok Business credentials';
    }
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]> {
    throw new BadBody(
      this.identifier,
      '{}',
      JSON.stringify({ id, postDetails, integration }),
      'TikTok Business is for ads, leads, business comments, catalogs, and audiences. Use the TikTok creator channel for organic publishing.'
    );
  }

  async analytics(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]> {
    const report = await this.adsInsights(id, accessToken, {
      report_type: 'BASIC',
      data_level: 'AUCTION_ADVERTISER',
      dimensions: ['advertiser_id'],
      metrics: ['spend', 'impressions', 'clicks', 'ctr', 'cpc'],
      start_date: dayjs().subtract(date, 'day').format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
    });
    const row = report?.data?.list?.[0]?.metrics || {};
    const today = dayjs().format('YYYY-MM-DD');
    return ['spend', 'impressions', 'clicks', 'ctr', 'cpc'].map((key) => ({
      label: key.toUpperCase(),
      percentageChange: 0,
      average: ['ctr', 'cpc'].includes(key),
      data: [{ total: String(row[key] || 0), date: today }],
    }));
  }

  async postAnalytics(): Promise<AnalyticsData[]> {
    return [];
  }

  private async businessFetch(
    path: string,
    accessToken: string,
    body?: Record<string, any>,
    method: 'GET' | 'POST' = 'GET'
  ) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${TIKTOK_BUSINESS_API_BASE}${normalized}`);
    const request: RequestInit = {
      method,
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET') {
      for (const [key, value] of Object.entries(body || {})) {
        if (typeof value !== 'undefined' && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    } else {
      request.body = JSON.stringify(body || {});
    }

    return (await this.fetch(url.toString(), request, this.identifier)).json();
  }

  private readSetting(integration: Integration | undefined, title: string) {
    try {
      const settings = JSON.parse(integration?.additionalSettings || '[]');
      return settings.find((setting: any) => setting.title === title)?.value || '';
    } catch (err) {
      return '';
    }
  }

  private messagingSettings(integration?: Integration): TikTokMessagingSettings {
    return {
      baseUrl:
        process.env.WISESOCIAL_TIKTOK_MESSAGING_BASE_URL ||
        process.env.PROERP_TIKTOK_MESSAGING_BASE_URL ||
        this.readSetting(integration, 'WiseSocial Messaging Base URL') ||
        this.readSetting(integration, 'ProERP Messaging Base URL'),
      apiKey:
        process.env.WISESOCIAL_TIKTOK_MESSAGING_API_KEY ||
        process.env.PROERP_TIKTOK_MESSAGING_API_KEY ||
        this.readSetting(integration, 'WiseSocial Messaging API Key') ||
        this.readSetting(integration, 'ProERP Messaging API Key'),
    };
  }

  private async messagingFetch(
    integration: Integration | undefined,
    path: string,
    options: RequestInit = {}
  ) {
    const settings = this.messagingSettings(integration);
    if (!settings.baseUrl || !settings.apiKey) {
      throw new BadBody(
        this.identifier,
        '{}',
        JSON.stringify({ path }),
        'TikTok Business Messaging needs WISESOCIAL_TIKTOK_MESSAGING_BASE_URL and WISESOCIAL_TIKTOK_MESSAGING_API_KEY, or the same values on the integration settings.'
      );
    }

    const base = settings.baseUrl.endsWith('/')
      ? settings.baseUrl.slice(0, -1)
      : settings.baseUrl;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const response = await this.fetch(`${base}${normalized}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    return response.json();
  }

  private normalizeMessagingConversation(id: string, conversation: any) {
    const messages = conversation.messages || conversation.message_list || [];
    const participant =
      conversation.participant ||
      conversation.customer ||
      conversation.user ||
      {};
    const participantId =
      participant.id ||
      conversation.participant_id ||
      conversation.open_id ||
      conversation.user_id ||
      conversation.recipient_id;

    return {
      id: String(conversation.id || conversation.conversation_id || participantId),
      updated_time:
        conversation.updated_time ||
        conversation.updatedAt ||
        conversation.last_message_at ||
        new Date().toISOString(),
      unread_count: conversation.unread_count || conversation.unreadCount || 0,
      participants: {
        data: [
          { id },
          {
            id: String(participantId),
            name:
              participant.name ||
              participant.display_name ||
              conversation.participant_name ||
              'TikTok User',
          },
        ],
      },
      messages: {
        data: messages.map((message: any) => ({
          id: String(message.id || message.message_id || makeId(12)),
          message:
            message.message ||
            message.text ||
            message.content ||
            message.body ||
            '',
          created_time:
            message.created_time ||
            message.createdAt ||
            message.timestamp ||
            new Date().toISOString(),
          from: {
            id: String(message.from?.id || message.sender_id || message.from || participantId),
            name: message.from?.name || message.sender_name,
          },
        })),
      },
      snippet:
        conversation.snippet ||
        conversation.last_message ||
        messages[0]?.text ||
        messages[0]?.message,
    };
  }

  async syncConversations(
    _accessToken: string,
    data: { after?: string },
    id: string,
    integration?: Integration
  ) {
    const query = new URLSearchParams({
      advertiser_id: id,
      ...(data.after ? { after: data.after } : {}),
    });
    const response = await this.messagingFetch(
      integration,
      `/conversations?${query.toString()}`
    );
    const conversations =
      response.data?.conversations ||
      response.conversations ||
      response.data ||
      [];

    return {
      data: conversations.map((conversation: any) =>
        this.normalizeMessagingConversation(id, conversation)
      ),
      paging: {
        cursors: {
          after: response.data?.after || response.after || response.next_cursor,
        },
      },
    };
  }

  async replyToConversation(
    _accessToken: string,
    data: { recipientId: string; message: string },
    id: string,
    integration?: Integration
  ) {
    const response = await this.messagingFetch(integration, '/messages', {
      method: 'POST',
      body: JSON.stringify({
        advertiser_id: id,
        recipient_id: data.recipientId,
        message: data.message,
      }),
    });

    return {
      ...response,
      message_id:
        response.message_id ||
        response.id ||
        response.data?.message_id ||
        response.data?.id,
    };
  }

  async createCampaign(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/campaign/create/',
      accessToken,
      {
        advertiser_id: id,
        campaign_name: input.name,
        objective_type: input.objective || input.objective_type || 'TRAFFIC',
        budget_mode:
          input.budgetMode ||
          input.budget_mode ||
          (input.dailyBudget ? 'BUDGET_MODE_DAY' : 'BUDGET_MODE_TOTAL'),
        budget: input.dailyBudget || input.lifetimeBudget || input.budget,
        operation_status: input.status === 'ACTIVE' ? 'ENABLE' : 'DISABLE',
        ...input.payload,
      },
      'POST'
    );
  }

  async listCampaigns(id: string, accessToken: string) {
    return this.businessFetch('/campaign/get/', accessToken, {
      advertiser_id: id,
      page: 1,
      page_size: 100,
    });
  }

  async updateCampaign(
    id: string,
    accessToken: string,
    campaignId: string,
    input: any
  ) {
    return this.businessFetch(
      '/campaign/update/',
      accessToken,
      {
        advertiser_id: id,
        campaign_id: campaignId,
        campaign_name: input.name,
        operation_status: input.status === 'ACTIVE' ? 'ENABLE' : undefined,
        ...input.payload,
      },
      'POST'
    );
  }

  async createAdSet(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/adgroup/create/',
      accessToken,
      {
        advertiser_id: id,
        campaign_id: input.campaignId,
        adgroup_name: input.name,
        placement_type: input.placementType || 'PLACEMENT_TYPE_NORMAL',
        placements: input.placements || ['PLACEMENT_TIKTOK'],
        location_ids: input.targeting?.location_ids || input.locationIds,
        budget_mode:
          input.budgetMode ||
          input.budget_mode ||
          (input.dailyBudget ? 'BUDGET_MODE_DAY' : 'BUDGET_MODE_TOTAL'),
        budget: input.dailyBudget || input.lifetimeBudget || input.budget,
        optimization_goal: input.optimizationGoal || 'CLICK',
        billing_event: input.billingEvent || 'CPC',
        bid_type: input.bidType || 'BID_TYPE_NO_BID',
        operation_status: input.status === 'ACTIVE' ? 'ENABLE' : 'DISABLE',
        ...input.payload,
      },
      'POST'
    );
  }

  async createAdCreative(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/file/temporarily/upload/',
      accessToken,
      {
        advertiser_id: id,
        upload_type: input.uploadType || 'URL',
        content_type: input.contentType || 'image',
        image_url: input.imageUrl,
        video_url: input.videoUrl,
        ...input.payload,
      },
      'POST'
    );
  }

  async createAd(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/ad/create/',
      accessToken,
      {
        advertiser_id: id,
        adgroup_id: input.adSetId,
        creatives: input.creatives || [
          {
            ad_name: input.name,
            identity_id: input.identityId,
            identity_type: input.identityType || 'CUSTOMIZED_USER',
            ad_format: input.adFormat || 'SINGLE_VIDEO',
            video_id: input.videoId,
            image_ids: input.imageIds,
            ad_text: input.text || input.name,
            call_to_action: input.callToAction || 'LEARN_MORE',
            landing_page_url: input.url,
          },
        ],
        operation_status: input.status === 'ACTIVE' ? 'ENABLE' : 'DISABLE',
        ...input.payload,
      },
      'POST'
    );
  }

  async adsInsights(id: string, accessToken: string, options: any) {
    return this.businessFetch('/report/integrated/get/', accessToken, {
      advertiser_id: id,
      report_type: options.report_type || options.reportType || 'BASIC',
      data_level: options.data_level || options.dataLevel || 'AUCTION_CAMPAIGN',
      dimensions: JSON.stringify(options.dimensions || ['campaign_id']),
      metrics: JSON.stringify(
        options.metrics || ['spend', 'impressions', 'clicks', 'ctr', 'cpc']
      ),
      start_date:
        options.start_date ||
        options.startDate ||
        dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      end_date: options.end_date || options.endDate || dayjs().format('YYYY-MM-DD'),
      page: options.page || 1,
      page_size: options.page_size || options.pageSize || 100,
      filtering: options.filtering ? JSON.stringify(options.filtering) : undefined,
    });
  }

  async fetchComments(id: string, accessToken: string, postId: string) {
    const { businessId, videoId } = decodeVideoId(id, postId);
    const response = await this.businessFetch('/business/comment/list/', accessToken, {
      business_id: businessId,
      video_id: videoId,
      status: 'PUBLIC',
    });

    return (response?.data?.comments || response?.data?.list || []).map(
      (comment: any) => ({
        externalCommentId: encodeCommentId(
          businessId,
          videoId,
          String(comment.comment_id || comment.id)
        ),
        authorId: String(comment.user_id || comment.username || 'unknown'),
        authorName: comment.username || comment.nickname || 'TikTok User',
        authorPicture: comment.profile_image,
        content: comment.text || '',
        likeCount: Number(comment.likes || comment.like_count || 0),
        isHidden: comment.status === 'HIDDEN',
        createdAt: comment.create_time
          ? dayjs(Number(comment.create_time) * 1000).toISOString()
          : new Date().toISOString(),
      })
    );
  }

  async replyToExternalComment(
    fallbackBusinessId: string,
    accessToken: string,
    commentId: string,
    message: string
  ) {
    const decoded = decodeCommentId(fallbackBusinessId, commentId);
    const response = await this.businessFetch(
      '/business/comment/reply/create/',
      accessToken,
      {
        business_id: decoded.businessId,
        video_id: decoded.videoId,
        comment_id: decoded.commentId,
        text: message,
      },
      'POST'
    );

    return {
      commentId: encodeCommentId(
        decoded.businessId,
        decoded.videoId,
        String(response?.data?.comment_id || response?.data?.reply_id || makeId(12))
      ),
      success: true,
    };
  }

  async hideExternalComment(
    fallbackBusinessId: string,
    accessToken: string,
    commentId: string,
    hide: boolean
  ) {
    const decoded = decodeCommentId(fallbackBusinessId, commentId);
    await this.businessFetch(
      '/business/comment/hide/',
      accessToken,
      {
        business_id: decoded.businessId,
        video_id: decoded.videoId,
        comment_id: decoded.commentId,
        action: hide ? 'HIDE' : 'UNHIDE',
      },
      'POST'
    );

    return { success: true, isHidden: hide };
  }

  async deleteExternalComment(
    fallbackBusinessId: string,
    accessToken: string,
    commentId: string
  ) {
    const decoded = decodeCommentId(fallbackBusinessId, commentId);
    await this.businessFetch(
      '/business/comment/delete/',
      accessToken,
      {
        business_id: decoded.businessId,
        video_id: decoded.videoId,
        comment_id: decoded.commentId,
      },
      'POST'
    );

    return { success: true };
  }

  async listLeadForms(id: string) {
    return [
      {
        externalFormId: `${id}:lead-manager`,
        name: 'TikTok Lead Manager',
        status: 'ACTIVE',
      },
    ];
  }

  async fetchLead(id: string, accessToken: string, leadId: string) {
    return this.businessFetch('/page/lead/get/', accessToken, {
      advertiser_id: id,
      lead_id: leadId,
    });
  }

  async listCatalogs(id: string, accessToken: string) {
    const response = await this.businessFetch('/catalog/get/', accessToken, {
      advertiser_id: id,
    });
    return response?.data?.catalogs || response?.data?.list || [];
  }

  async listProducts(_id: string, accessToken: string, catalogId: string) {
    const response = await this.businessFetch('/catalog/product/get/', accessToken, {
      catalog_id: catalogId,
    });
    return response?.data?.products || response?.data?.list || [];
  }

  async createProduct(
    _id: string,
    accessToken: string,
    catalogId: string,
    input: any
  ) {
    return this.businessFetch(
      '/catalog/product/create/',
      accessToken,
      {
        catalog_id: catalogId,
        sku_id: input.retailerId,
        title: input.name,
        description: input.description,
        price: input.price,
        currency: input.currency,
        availability: input.availability,
        image_url: input.imageUrl,
        landing_page_url: input.url,
        ...input.payload,
      },
      'POST'
    );
  }

  async createAudience(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/dmp/custom_audience/create/',
      accessToken,
      {
        advertiser_id: id,
        audience_name: input.name,
        audience_sub_type: input.subtype || input.subType || 'NORMAL',
        description: input.description,
        ...input.payload,
      },
      'POST'
    );
  }

  async createLookalikeAudience(
    id: string,
    accessToken: string,
    audienceId: string,
    input: any
  ) {
    return this.businessFetch(
      '/dmp/lookalike/create/',
      accessToken,
      {
        advertiser_id: id,
        audience_name: input.name,
        origin_audience_id: audienceId,
        location_ids: input.locationIds || input.payload?.location_ids,
        ...input.payload,
      },
      'POST'
    );
  }

  async getSubscriptions(id: string, accessToken: string, input: any = {}) {
    return this.businessFetch('/subscription/get/', accessToken, {
      advertiser_id: id,
      ...input,
    });
  }

  async subscribeEvents(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/subscription/subscribe/',
      accessToken,
      {
        advertiser_id: id,
        event_source:
          input.eventSource ||
          input.event_source ||
          input.eventType ||
          input.event_type ||
          'AD_ACCOUNT',
        callback_url:
          input.callbackUrl ||
          input.callback_url ||
          `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''}/webhooks/tiktok`,
        ...input.payload,
      },
      'POST'
    );
  }

  async unsubscribeEvents(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/subscription/unsubscribe/',
      accessToken,
      {
        advertiser_id: id,
        subscription_id: input.subscriptionId || input.subscription_id,
        event_source: input.eventSource || input.event_source,
        ...input.payload,
      },
      'POST'
    );
  }

  // ── Conversion API (Events / CAPI) ──────────────────

  async sendConversionEvent(id: string, accessToken: string, event: any) {
    return this.businessFetch(
      '/pixel/track/',
      accessToken,
      {
        pixel_code: event.pixel_code,
        event: event.event,
        event_id: event.event_id,
        timestamp: event.timestamp || new Date().toISOString(),
        context: event.context,
        properties: event.properties,
      },
      'POST'
    );
  }

  async batchConversionEvents(id: string, accessToken: string, events: any[]) {
    return this.businessFetch(
      '/pixel/batch/',
      accessToken,
      {
        pixel_code: events[0]?.pixel_code,
        batch: events,
        test_event_code: events[0]?.test_event_code,
      },
      'POST'
    );
  }

  async listPixels(id: string, accessToken: string) {
    const response = await this.businessFetch('/pixel/list/', accessToken, {
      advertiser_id: id,
    });
    return response?.data?.pixels || response?.data?.list || [];
  }

  // ── Async Reporting ─────────────────────────────────

  async createReportTask(id: string, accessToken: string, options: any) {
    return this.businessFetch(
      '/report/task/create/',
      accessToken,
      {
        advertiser_id: id,
        report_type: options.report_type || options.reportType || 'BASIC',
        data_level: options.data_level || options.dataLevel || 'AUCTION_CAMPAIGN',
        dimensions: options.dimensions || ['campaign_id'],
        metrics: options.metrics || ['spend', 'impressions', 'clicks', 'ctr', 'cpc'],
        start_date:
          options.start_date || options.startDate,
        end_date: options.end_date || options.endDate,
        filtering: options.filtering,
        order_field: options.order_field || options.orderField,
        order_type: options.order_type || options.orderType,
      },
      'POST'
    );
  }

  async getReportTaskStatus(id: string, accessToken: string, taskId: string) {
    return this.businessFetch('/report/task/check/', accessToken, {
      advertiser_id: id,
      task_id: taskId,
    });
  }

  // ── Identity / Spark Ads ────────────────────────────

  async listIdentities(id: string, accessToken: string) {
    const response = await this.businessFetch('/identity/get/', accessToken, {
      advertiser_id: id,
    });
    return response?.data?.identity_list || response?.data?.list || [];
  }

  async createIdentity(id: string, accessToken: string, input: any) {
    return this.businessFetch(
      '/identity/create/',
      accessToken,
      {
        advertiser_id: id,
        display_name: input.displayName || input.display_name || input.name,
        image_uri: input.imageUri || input.image_uri,
        ...input.payload,
      },
      'POST'
    );
  }

  async requestSparkAdAuth(id: string, accessToken: string, authCode: string) {
    return this.businessFetch(
      '/tt_video/authorize/',
      accessToken,
      {
        advertiser_id: id,
        auth_code: authCode,
      },
      'POST'
    );
  }

  // ── Creative Portfolio ──────────────────────────────

  async listCreativePortfolio(id: string, accessToken: string) {
    const response = await this.businessFetch('/creative/get/', accessToken, {
      advertiser_id: id,
      page: 1,
      page_size: 100,
    });
    return response?.data?.creatives || response?.data?.list || [];
  }

  // ── Campaign / AdGroup / Ad Listing & Deletion ──────

  async deleteCampaign(id: string, accessToken: string, campaignId: string) {
    return this.businessFetch(
      '/campaign/update/status/',
      accessToken,
      {
        advertiser_id: id,
        campaign_ids: [campaignId],
        opt_status: 'DELETE',
      },
      'POST'
    );
  }

  async listAdGroups(id: string, accessToken: string, campaignId?: string) {
    const response = await this.businessFetch('/adgroup/get/', accessToken, {
      advertiser_id: id,
      ...(campaignId ? { filtering: JSON.stringify({ campaign_ids: [campaignId] }) } : {}),
      page: 1,
      page_size: 100,
    });
    return response?.data?.list || [];
  }

  async listAds(id: string, accessToken: string, adGroupId?: string) {
    const response = await this.businessFetch('/ad/get/', accessToken, {
      advertiser_id: id,
      ...(adGroupId ? { filtering: JSON.stringify({ adgroup_ids: [adGroupId] }) } : {}),
      page: 1,
      page_size: 100,
    });
    return response?.data?.list || [];
  }

  // ── Advanced Audience ───────────────────────────────

  async estimateAudienceSize(id: string, accessToken: string, targeting: any) {
    return this.businessFetch(
      '/dmp/custom_audience/reach_estimate/',
      accessToken,
      {
        advertiser_id: id,
        ...targeting,
      },
      'POST'
    );
  }
}
