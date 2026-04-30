import dayjs from 'dayjs';
import {
  AnalyticsData,
  AuthTokenDetails,
  FetchPageInformationResult,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { SocialAbstract, BadBody } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { metaGraphUrl, getMetaGraphApiVersion } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';
import { Integration } from '@prisma/client';

const WA_API_VERSION = getMetaGraphApiVersion();

export class WhatsAppProvider extends SocialAbstract implements SocialProvider {
  identifier = 'whatsapp';
  name = 'WhatsApp Business';
  isBetweenSteps = false;
  editor = 'none' as const;
  scopes = ['whatsapp_business_management', 'whatsapp_business_messaging'];

  maxLength() {
    return 4096;
  }

  async customFields() {
    return [
      {
        key: 'accessToken',
        label: 'Permanent Access Token',
        validation: `/^.+$/`,
        type: 'password' as const,
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        validation: `/^\\\\d+$/`,
        type: 'text' as const,
      },
      {
        key: 'wabaId',
        label: 'WhatsApp Business Account ID',
        validation: `/^\\\\d+$/`,
        type: 'text' as const,
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

  private readSetting(integration: Integration | undefined, title: string) {
    try {
      const settings = JSON.parse(integration?.additionalSettings || '[]');
      return settings.find((s: any) => s.title === title)?.value || '';
    } catch {
      return '';
    }
  }

  private getWabaId(integration?: Integration): string {
    return this.readSetting(integration, 'WhatsApp Business Account ID');
  }

  async authenticate(params: { code: string }) {
    const body: {
      accessToken: string;
      phoneNumberId: string;
      wabaId: string;
    } = JSON.parse(Buffer.from(params.code, 'base64').toString());

    try {
      const phone = await (
        await this.fetch(
          `${metaGraphUrl(`/${body.phoneNumberId}`)}?fields=id,display_phone_number,verified_name&access_token=${body.accessToken}`
        )
      ).json();

      return {
        refreshToken: 'null',
        expiresIn: dayjs().add(100, 'years').unix() - dayjs().unix(),
        accessToken: body.accessToken,
        id: body.phoneNumberId,
        name: phone.verified_name || phone.display_phone_number || 'WhatsApp Business',
        picture: '',
        username: phone.display_phone_number || body.wabaId,
        additionalSettings: [
          {
            title: 'WhatsApp Business Account ID',
            description: 'Used for template sync and webhook routing',
            type: 'text' as const,
            value: body.wabaId,
          },
        ],
      };
    } catch (err) {
      return 'Invalid WhatsApp credentials';
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
      'WhatsApp channels are inbox-only and do not support scheduled post publishing'
    );
  }

  // ── Analytics ─────────────────────────────────────────

  async analytics(
    id: string,
    accessToken: string,
    date: number,
    integration?: Integration
  ): Promise<AnalyticsData[]> {
    const wabaId = this.getWabaId(integration);
    if (!wabaId) return [];

    const today = dayjs().format('YYYY-MM-DD');
    const since = dayjs().subtract(date, 'day').unix();
    const until = dayjs().unix();

    try {
      const response = await (
        await this.fetch(
          `${metaGraphUrl(`/${wabaId}`)}?fields=analytics.start(${since}).end(${until}).granularity(DAY)&access_token=${accessToken}`
        )
      ).json();

      const analyticsData = response?.analytics?.data_points || [];
      const results: AnalyticsData[] = [];

      // Aggregate by metric
      const sentPoints = analyticsData.map((dp: any) => ({
        total: String(dp.sent || 0),
        date: dayjs.unix(dp.start).format('YYYY-MM-DD'),
      }));
      const deliveredPoints = analyticsData.map((dp: any) => ({
        total: String(dp.delivered || 0),
        date: dayjs.unix(dp.start).format('YYYY-MM-DD'),
      }));

      if (sentPoints.length) {
        results.push({ label: 'Messages Sent', percentageChange: 0, data: sentPoints });
      }
      if (deliveredPoints.length) {
        results.push({ label: 'Messages Delivered', percentageChange: 0, data: deliveredPoints });
      }

      // Fallback: if analytics endpoint didn't return data, show basic counts
      if (!results.length) {
        results.push(
          { label: 'Messages Sent', percentageChange: 0, data: [{ total: '0', date: today }] },
          { label: 'Messages Delivered', percentageChange: 0, data: [{ total: '0', date: today }] }
        );
      }

      return results;
    } catch (err) {
      console.error('Error fetching WhatsApp analytics:', err);
      return [];
    }
  }

  async postAnalytics(): Promise<AnalyticsData[]> {
    return [];
  }

  // ── Conversation Sync ─────────────────────────────────
  // WhatsApp Cloud API is webhook-driven. We store incoming
  // webhook messages in the social-inbox DB and return them
  // here. For now return an empty shell that the webhook
  // handler will populate.

  async syncConversations(
    accessToken: string,
    data: Record<string, any>,
    id: string,
    integration?: Integration
  ) {
    // WhatsApp doesn't have a "list conversations" REST endpoint.
    // Conversations are built from incoming webhook events stored
    // in our database.  Return empty data so the UI can display
    // outbound-only threads until webhooks populate the inbox.
    return { data: [] as any[], paging: { cursors: {} } };
  }

  async replyToConversation(
    accessToken: string,
    data: { recipientId: string; message: string },
    id: string
  ) {
    return (
      await this.fetch(metaGraphUrl(`/${id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: data.recipientId,
          type: 'text',
          text: { body: data.message },
        }),
      })
    ).json();
  }

  // ── Webhook Subscription ──────────────────────────────

  async afterConnect(
    accessToken: string,
    information: FetchPageInformationResult
  ) {
    // Subscribe the WABA to webhook events so we receive
    // inbound messages, status updates, and template changes.
    try {
      await this.fetch(
        `${metaGraphUrl(`/${information.id}`)}/subscribed_apps?access_token=${accessToken}`,
        { method: 'POST' },
        'subscribe whatsapp webhooks'
      );
    } catch (err) {
      console.error('Error subscribing to WhatsApp webhooks:', err);
    }
  }

  // ── Template Management ───────────────────────────────

  async templates(accessToken: string, wabaId: string) {
    return (
      await this.fetch(
        `${metaGraphUrl(`/${wabaId}/message_templates`)}?fields=id,name,status,language,category,components,quality_score&limit=100&access_token=${accessToken}`
      )
    ).json();
  }

  async createTemplate(
    id: string,
    accessToken: string,
    data: Record<string, any>
  ) {
    const wabaId = data.wabaId || id;
    return (
      await this.fetch(
        `${metaGraphUrl(`/${wabaId}/message_templates`)}?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            language: data.language || 'en_US',
            category: data.category || 'UTILITY',
            components: data.components || [],
            ...(data.payload || {}),
          }),
        }
      )
    ).json();
  }

  async deleteTemplate(
    id: string,
    accessToken: string,
    templateName: string
  ) {
    const wabaId = id;
    return (
      await this.fetch(
        `${metaGraphUrl(`/${wabaId}/message_templates`)}?name=${encodeURIComponent(templateName)}&access_token=${accessToken}`,
        { method: 'DELETE' }
      )
    ).json();
  }

  // ── Rich Media Messages ───────────────────────────────

  async sendMediaMessage(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      type: 'image' | 'video' | 'document' | 'audio' | 'sticker' | 'location' | 'contacts';
      payload: Record<string, any>;
    }
  ) {
    const messageBody: Record<string, any> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: data.recipientId,
      type: data.type,
    };

    switch (data.type) {
      case 'image':
        messageBody.image = { link: data.payload.url, caption: data.payload.caption };
        break;
      case 'video':
        messageBody.video = { link: data.payload.url, caption: data.payload.caption };
        break;
      case 'document':
        messageBody.document = {
          link: data.payload.url,
          caption: data.payload.caption,
          filename: data.payload.filename,
        };
        break;
      case 'audio':
        messageBody.audio = { link: data.payload.url };
        break;
      case 'sticker':
        messageBody.sticker = { link: data.payload.url };
        break;
      case 'location':
        messageBody.location = {
          latitude: data.payload.latitude,
          longitude: data.payload.longitude,
          name: data.payload.name,
          address: data.payload.address,
        };
        break;
      case 'contacts':
        messageBody.contacts = data.payload.contacts;
        break;
    }

    return (
      await this.fetch(metaGraphUrl(`/${id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(messageBody),
      })
    ).json();
  }

  // ── Interactive Messages ──────────────────────────────

  async sendInteractiveMessage(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      interactiveType: 'button' | 'list' | 'product' | 'product_list' | 'cta_url' | 'flow';
      payload: Record<string, any>;
    }
  ) {
    return (
      await this.fetch(metaGraphUrl(`/${id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: data.recipientId,
          type: 'interactive',
          interactive: {
            type: data.interactiveType,
            ...data.payload,
          },
        }),
      })
    ).json();
  }

  // ── Template Messages ─────────────────────────────────

  async sendTemplateMessage(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      templateName: string;
      languageCode: string;
      components?: Record<string, any>[];
    }
  ) {
    return (
      await this.fetch(metaGraphUrl(`/${id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: data.recipientId,
          type: 'template',
          template: {
            name: data.templateName,
            language: { code: data.languageCode },
            components: data.components || [],
          },
        }),
      })
    ).json();
  }

  // ── Broadcast (Bulk Template Messages) ────────────────

  async sendBroadcast(
    id: string,
    accessToken: string,
    data: {
      recipients: string[];
      templateName: string;
      languageCode: string;
      components?: Record<string, any>[];
    }
  ) {
    const results = [];

    for (const recipient of data.recipients) {
      try {
        const result = await this.sendTemplateMessage(id, accessToken, {
          recipientId: recipient,
          templateName: data.templateName,
          languageCode: data.languageCode,
          components: data.components,
        });
        results.push({ recipient, success: true, ...result });
      } catch (err: any) {
        results.push({ recipient, success: false, error: err.message || 'Failed' });
      }
    }

    return {
      total: data.recipients.length,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  // ── Commerce / Product Messages ───────────────────────

  async sendProductMessage(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      catalogId: string;
      productRetailerId?: string;
      sections?: Record<string, any>[];
    }
  ) {
    const interactive: Record<string, any> = {
      type: data.productRetailerId ? 'product' : 'product_list',
    };

    if (data.productRetailerId) {
      // Single product message
      interactive.body = { text: 'Check out this product' };
      interactive.action = {
        catalog_id: data.catalogId,
        product_retailer_id: data.productRetailerId,
      };
    } else {
      // Multi-product message
      interactive.header = { type: 'text', text: 'Our Products' };
      interactive.body = { text: 'Browse our catalog' };
      interactive.action = {
        catalog_id: data.catalogId,
        sections: data.sections || [],
      };
    }

    return (
      await this.fetch(metaGraphUrl(`/${id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: data.recipientId,
          type: 'interactive',
          interactive,
        }),
      })
    ).json();
  }
}
