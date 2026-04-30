import {
  AnalyticsData,
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { FacebookProvider } from '@gitroom/nestjs-libraries/integrations/social/facebook.provider';
import { BadBody } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import dayjs from 'dayjs';
import { Integration } from '@prisma/client';
import { getMetaGraphApiVersion, metaGraphUrl } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';

const FACEBOOK_API_VERSION = getMetaGraphApiVersion();

const getPercentageChange = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }

  const midpoint = Math.ceil(values.length / 2);
  const previous = values
    .slice(0, midpoint)
    .reduce((sum, value) => sum + value, 0);
  const current = values
    .slice(midpoint)
    .reduce((sum, value) => sum + value, 0);

  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const formatMetricValue = (value: string | number | undefined) => {
  if (value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export class FacebookAdsProvider
  extends FacebookProvider
  implements SocialProvider
{
  override identifier = 'facebook-ads';
  override name = 'Facebook Ads';
  override scopes = ['business_management', 'ads_read', 'ads_management'];
  override editor = 'none' as const;
  override dto: any = undefined;

  override maxLength() {
    return 0;
  }

  override async pages(accessToken: string) {
    const adAccounts: any[] = [];
    let nextUrl:
      | string
      | undefined = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/adaccounts?fields=id,account_id,name,account_status,currency,timezone_name,business_name&limit=100&access_token=${accessToken}`;

    while (nextUrl) {
      const response = await (await fetch(nextUrl)).json();
      if (response?.data?.length) {
        adAccounts.push(
          ...response.data.map((account: any) => ({
            id: String(account.account_id || account.id).replace('act_', ''),
            page: String(account.account_id || account.id).replace('act_', ''),
            name: account.name || `Ad Account ${account.account_id}`,
            username: account.business_name || account.currency || '',
            accountStatus: account.account_status,
            currency: account.currency,
            timezoneName: account.timezone_name,
          }))
        );
      }

      nextUrl = response?.paging?.next;
    }

    return adAccounts;
  }

  override async fetchPageInformation(accessToken: string, data: { page: string }) {
    const accountId = String(data.page).replace('act_', '');
    const accounts = await this.pages(accessToken);
    const account = accounts.find(
      (item: any) => String(item.id) === accountId
    );

    if (!account) {
      throw new Error('Ad account not found in your businesses');
    }

    return {
      id: accountId,
      name: account.name,
      access_token: accessToken,
      picture: '',
      username: account.username,
    };
  }

  override async reConnect(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>> {
    const information = await this.fetchPageInformation(accessToken, {
      page: requiredId,
    });

    return {
      id: information.id,
      name: information.name,
      accessToken: information.access_token,
      picture: information.picture,
      username: information.username,
    };
  }

  override async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[]
  ): Promise<PostResponse[]> {
    throw new BadBody(
      'facebook-ads',
      '{}',
      JSON.stringify({ id, postDetails, accessToken }),
      'Facebook Ads channels are analytics-only and cannot publish posts'
    );
  }

  override async comment(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]> {
    throw new BadBody(
      'facebook-ads',
      '{}',
      JSON.stringify({ id, postId, lastCommentId, postDetails, integration }),
      'Facebook Ads channels are analytics-only and do not support comments'
    );
  }

  override async analytics(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]> {
    const since = dayjs().subtract(date, 'day').format('YYYY-MM-DD');
    const until = dayjs().endOf('day').format('YYYY-MM-DD');
    const timeRange = encodeURIComponent(JSON.stringify({ since, until }));

    const { data } = await (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/act_${id}/insights?fields=spend,impressions,reach,clicks,ctr,cpc&time_increment=1&time_range=${timeRange}&access_token=${accessToken}`
      )
    ).json();

    const metrics = [
      { key: 'spend', label: 'Spend' },
      { key: 'impressions', label: 'Impressions' },
      { key: 'reach', label: 'Reach' },
      { key: 'clicks', label: 'Clicks' },
      { key: 'ctr', label: 'CTR', average: true },
      { key: 'cpc', label: 'CPC', average: true },
    ];

    return metrics
      .map((metric): AnalyticsData | null => {
        const points =
          data?.map((item: Record<string, string>) => ({
            total: formatMetricValue(item[metric.key]),
            date: item.date_start,
          })) || [];

        if (!points.length) {
          return null;
        }

        return {
          label: metric.label,
          average: metric.average,
          percentageChange: getPercentageChange(
            points.map((point: { total: number }) => point.total)
          ),
          data: points,
        };
      })
      .filter((item): item is AnalyticsData => item !== null);
  }

  override async postAnalytics(
    integrationId: string,
    accessToken: string,
    postId: string,
    date: number
  ): Promise<AnalyticsData[]> {
    return [];
  }

  async createCampaign(id: string, accessToken: string, input: any) {
    const body = {
      name: input.name,
      objective: input.objective,
      status: input.status || 'PAUSED',
      special_ad_categories: JSON.stringify(input.specialAdCategories || []),
      ...(input.dailyBudget ? { daily_budget: Math.round(input.dailyBudget * 100) } : {}),
      ...(input.lifetimeBudget ? { lifetime_budget: Math.round(input.lifetimeBudget * 100) } : {}),
      access_token: accessToken,
    };

    return (
      await this.fetch(metaGraphUrl(`/act_${id}/campaigns`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    ).json();
  }

  async updateCampaign(
    _id: string,
    accessToken: string,
    campaignId: string,
    input: any
  ) {
    return (
      await this.fetch(metaGraphUrl(`/${campaignId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(input.name ? { name: input.name } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.dailyBudget ? { daily_budget: Math.round(input.dailyBudget * 100) } : {}),
          ...(input.lifetimeBudget ? { lifetime_budget: Math.round(input.lifetimeBudget * 100) } : {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async createAdSet(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/adsets`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          campaign_id: input.campaignId,
          status: input.status || 'PAUSED',
          targeting: input.targeting,
          optimization_goal: input.optimizationGoal || 'LINK_CLICKS',
          billing_event: input.billingEvent || 'IMPRESSIONS',
          bid_strategy: input.bidStrategy,
          start_time: input.startTime,
          end_time: input.endTime,
          ...(input.dailyBudget ? { daily_budget: Math.round(input.dailyBudget * 100) } : {}),
          ...(input.lifetimeBudget ? { lifetime_budget: Math.round(input.lifetimeBudget * 100) } : {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async createAdCreative(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/adcreatives`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          object_story_spec: input.objectStorySpec,
          degrees_of_freedom_spec: input.degreesOfFreedomSpec,
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async createAd(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/ads`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          adset_id: input.adSetId,
          creative: { creative_id: input.creativeId },
          status: input.status || 'PAUSED',
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async adsInsights(id: string, accessToken: string, options: any) {
    const fields = options.fields || 'spend,impressions,reach,clicks,ctr,cpc,frequency,actions,action_values';
    const breakdowns = options.breakdowns ? `&breakdowns=${encodeURIComponent(options.breakdowns)}` : '';
    const timeRange = options.timeRange
      ? `&time_range=${encodeURIComponent(JSON.stringify(options.timeRange))}`
      : '';
    return (
      await this.fetch(
        metaGraphUrl(
          `/act_${id}/insights?fields=${fields}${breakdowns}${timeRange}&access_token=${accessToken}`
        )
      )
    ).json();
  }

  async listLeadForms(id: string, accessToken: string) {
    const { data } = await (
      await this.fetch(
        metaGraphUrl(`/act_${id}/leadgen_forms?fields=id,name,status,created_time&limit=100&access_token=${accessToken}`)
      )
    ).json();

    return (data || []).map((form: any) => ({
      externalFormId: form.id,
      name: form.name,
      status: form.status,
      rawPayload: form,
    }));
  }

  async fetchLead(_id: string, accessToken: string, leadId: string) {
    return (
      await this.fetch(
        metaGraphUrl(`/${leadId}?fields=id,created_time,field_data,form_id&access_token=${accessToken}`)
      )
    ).json();
  }

  async createAudience(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/customaudiences`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          subtype: input.subtype || 'CUSTOM',
          customer_file_source: input.customerFileSource || 'USER_PROVIDED_ONLY',
          ...input.payload,
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async createLookalikeAudience(id: string, accessToken: string, audienceId: string, input: any) {
    return this.createAudience(id, accessToken, {
      ...input,
      subtype: 'LOOKALIKE',
      payload: {
        ...(input.payload || {}),
        origin_audience_id: audienceId,
      },
    });
  }

  async deliveryEstimate(id: string, accessToken: string, targeting: Record<string, any>) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/delivery_estimate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targeting_spec: targeting, access_token: accessToken }),
      })
    ).json();
  }

  // ── Conversion API (CAPI) ───────────────────────────

  async sendConversionEvent(id: string, accessToken: string, event: any) {
    const pixelId = event.pixel_id || event.pixelId;
    if (!pixelId) {
      throw new BadBody(
        'facebook-ads',
        '{}',
        JSON.stringify({ id, event }),
        'pixel_id is required for Conversion API events'
      );
    }

    return (
      await this.fetch(metaGraphUrl(`/${pixelId}/events`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_name: event.event_name || event.eventName,
              event_time: event.event_time || Math.floor(Date.now() / 1000),
              event_id: event.event_id || event.eventId,
              event_source_url: event.event_source_url || event.sourceUrl,
              action_source: event.action_source || event.actionSource || 'website',
              user_data: event.user_data || event.userData || {},
              custom_data: event.custom_data || event.customData || {},
            },
          ],
          ...(event.test_event_code
            ? { test_event_code: event.test_event_code }
            : {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async batchConversionEvents(
    id: string,
    accessToken: string,
    events: any[]
  ) {
    const pixelId = events[0]?.pixel_id || events[0]?.pixelId;
    if (!pixelId) {
      throw new BadBody(
        'facebook-ads',
        '{}',
        JSON.stringify({ id, events }),
        'pixel_id is required for Conversion API events'
      );
    }

    return (
      await this.fetch(metaGraphUrl(`/${pixelId}/events`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: events.map((event) => ({
            event_name: event.event_name || event.eventName,
            event_time: event.event_time || Math.floor(Date.now() / 1000),
            event_id: event.event_id || event.eventId,
            event_source_url: event.event_source_url || event.sourceUrl,
            action_source: event.action_source || event.actionSource || 'website',
            user_data: event.user_data || event.userData || {},
            custom_data: event.custom_data || event.customData || {},
          })),
          ...(events[0]?.test_event_code
            ? { test_event_code: events[0].test_event_code }
            : {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  // ── A/B Testing / Experiments ───────────────────────

  async createExperiment(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/adstudies`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
          type: input.type || 'SPLIT_TEST',
          start_time: input.startTime || input.start_time,
          end_time: input.endTime || input.end_time,
          cells: input.cells,
          objectives: input.objectives,
          ...(input.payload || {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async getExperimentResults(
    id: string,
    accessToken: string,
    studyId: string
  ) {
    return (
      await this.fetch(
        metaGraphUrl(
          `/${studyId}?fields=id,name,description,type,start_time,end_time,results,cells{id,name,adsets{id,name}}&access_token=${accessToken}`
        )
      )
    ).json();
  }

  // ── Automated Ad Rules ──────────────────────────────

  async createAdRule(id: string, accessToken: string, input: any) {
    return (
      await this.fetch(metaGraphUrl(`/act_${id}/adrules_library`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name,
          evaluation_spec: input.evaluationSpec || input.evaluation_spec,
          execution_spec: input.executionSpec || input.execution_spec,
          schedule_spec: input.scheduleSpec || input.schedule_spec,
          status: input.status || 'ENABLED',
          ...(input.payload || {}),
          access_token: accessToken,
        }),
      })
    ).json();
  }

  async listAdRules(id: string, accessToken: string) {
    const { data } = await (
      await this.fetch(
        metaGraphUrl(
          `/act_${id}/adrules_library?fields=id,name,status,evaluation_spec,execution_spec,schedule_spec&limit=100&access_token=${accessToken}`
        )
      )
    ).json();

    return data || [];
  }

  // ── Campaign / AdSet / Ad Listing & Deletion ────────

  async listCampaigns(id: string, accessToken: string) {
    const { data } = await (
      await this.fetch(
        metaGraphUrl(
          `/act_${id}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time&limit=100&access_token=${accessToken}`
        )
      )
    ).json();

    return data || [];
  }

  async deleteCampaign(
    _id: string,
    accessToken: string,
    campaignId: string
  ) {
    return (
      await this.fetch(
        metaGraphUrl(`/${campaignId}?access_token=${accessToken}`),
        { method: 'DELETE' }
      )
    ).json();
  }

  async listAdGroups(id: string, accessToken: string, campaignId?: string) {
    const endpoint = campaignId
      ? `/${campaignId}/adsets`
      : `/act_${id}/adsets`;

    const { data } = await (
      await this.fetch(
        metaGraphUrl(
          `${endpoint}?fields=id,name,status,campaign_id,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_strategy,start_time,end_time&limit=100&access_token=${accessToken}`
        )
      )
    ).json();

    return data || [];
  }

  async listAds(id: string, accessToken: string, adSetId?: string) {
    const endpoint = adSetId
      ? `/${adSetId}/ads`
      : `/act_${id}/ads`;

    const { data } = await (
      await this.fetch(
        metaGraphUrl(
          `${endpoint}?fields=id,name,status,adset_id,creative{id,name,object_story_spec},created_time&limit=100&access_token=${accessToken}`
        )
      )
    ).json();

    return data || [];
  }
}

