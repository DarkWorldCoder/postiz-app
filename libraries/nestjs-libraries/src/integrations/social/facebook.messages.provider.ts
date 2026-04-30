import {
  AnalyticsData,
  AuthTokenDetails,
  FetchPageInformationResult,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { FacebookProvider } from '@gitroom/nestjs-libraries/integrations/social/facebook.provider';
import { BadBody } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { getMetaGraphApiVersion } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';

const FACEBOOK_API_VERSION = getMetaGraphApiVersion();

export class FacebookMessagesProvider
  extends FacebookProvider
  implements SocialProvider
{
  override identifier = 'facebook-messages';
  override name = 'Facebook Inbox';
  override editor = 'none' as const;
  override dto: any = undefined;
  override scopes = [
    'pages_show_list',
    'business_management',
    'pages_manage_metadata',
    'pages_messaging',
    'pages_read_engagement',
  ];

  override maxLength() {
    return 0;
  }

  override async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[]
  ): Promise<PostResponse[]> {
    throw new BadBody(
      this.identifier,
      '{}',
      JSON.stringify({ id, postDetails }),
      'Facebook Inbox channels do not support scheduled post publishing'
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
      this.identifier,
      '{}',
      JSON.stringify({ id, postId, lastCommentId, postDetails, integration }),
      'Facebook Inbox channels do not support post comments'
    );
  }

  override async analytics(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]> {
    return [];
  }

  override async postAnalytics(
    integrationId: string,
    accessToken: string,
    postId: string,
    date: number
  ): Promise<AnalyticsData[]> {
    return [];
  }

  async afterConnect(
    accessToken: string,
    information: FetchPageInformationResult
  ) {
    await this.fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${information.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads&access_token=${accessToken}`,
      {
        method: 'POST',
      },
      'subscribe page to messenger webhooks'
    );
  }

  async syncConversations(
    accessToken: string,
    data: { after?: string } | undefined,
    id: string
  ) {
    const after = data?.after ? `&after=${encodeURIComponent(data.after)}` : '';
    const url =
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/conversations` +
      `?platform=messenger&fields=id,updated_time,unread_count,link,participants,messages.limit(50){id,message,created_time,from,to}` +
      `&limit=25${after}&access_token=${accessToken}`;

    return (
      await this.fetch(url, undefined, 'sync facebook conversations')
    ).json();
  }

  async replyToConversation(
    accessToken: string,
    data: { recipientId: string; message: string },
    id: string
  ) {
    return (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: {
              id: data.recipientId,
            },
            messaging_type: 'RESPONSE',
            message: {
              text: data.message,
            },
          }),
        },
        'reply to facebook conversation'
      )
    ).json();
  }

  /**
   * Send a rich media message (image, video, file, audio) via Messenger
   */
  async sendMediaMessage(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      type: 'image' | 'video' | 'document' | 'audio' | 'sticker' | 'location' | 'contacts';
      payload: Record<string, any>;
    }
  ) {
    // Map WhatsApp-style types to Messenger attachment types
    const messengerType =
      data.type === 'document'
        ? 'file'
        : data.type === 'sticker'
        ? 'image'
        : data.type;

    if (data.type === 'location' || data.type === 'contacts') {
      // Messenger doesn't support location/contacts natively — send as text
      const text =
        data.type === 'location'
          ? `📍 Location: ${data.payload.name || ''} (${data.payload.latitude}, ${data.payload.longitude})`
          : `📇 Contact shared`;

      return (
        await this.fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/messages?access_token=${accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: data.recipientId },
              messaging_type: 'RESPONSE',
              message: { text },
            }),
          },
          'send media message'
        )
      ).json();
    }

    return (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: data.recipientId },
            messaging_type: 'RESPONSE',
            message: {
              attachment: {
                type: messengerType,
                payload: {
                  url: data.payload.url,
                  is_reusable: true,
                },
              },
            },
          }),
        },
        'send media message'
      )
    ).json();
  }

  /**
   * Send an interactive message (buttons, quick replies) via Messenger
   */
  async sendInteractiveMessage(
    _id: string,
    accessToken: string,
    data: {
      recipientId: string;
      interactiveType: string;
      payload: Record<string, any>;
    }
  ) {
    return (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: data.recipientId },
            messaging_type: 'RESPONSE',
            message: {
              attachment: {
                type: 'template',
                payload: data.payload,
              },
            },
          }),
        },
        'send interactive message'
      )
    ).json();
  }
}

