import {
  AnalyticsData,
  FetchPageInformationResult,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { InstagramProvider } from '@gitroom/nestjs-libraries/integrations/social/instagram.provider';
import { BadBody } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { getMetaGraphApiVersion } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';

const INSTAGRAM_API_VERSION = getMetaGraphApiVersion();

export class InstagramMessagesProvider
  extends InstagramProvider
  implements SocialProvider
{
  override identifier = 'instagram-messages';
  override name = 'Instagram Inbox';
  override editor = 'none' as any;
  override dto: any = undefined;
  override scopes = [
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_manage_metadata',
    'business_management',
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
      'Instagram Inbox channels do not support scheduled post publishing'
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
      'Instagram Inbox channels do not support post comments'
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
    // Note: The page ID used for subscribing to webhooks is the underlying Facebook Page ID connected to the IG account.
    // Need to find the Page ID first, then subscribe.
    try {
      const pageData = await (
        await this.fetch(
          `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${information.id}?fields=id,name&access_token=${accessToken}`
        )
      ).json();

      if (pageData?.id) {
        await this.fetch(
          `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${pageData.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads&access_token=${accessToken}`,
          {
            method: 'POST',
          },
          'subscribe page to instagram messenger webhooks'
        );
      }
    } catch (err) {
      console.error('Error subscribing to IG webhooks', err);
    }
  }

  async syncConversations(
    accessToken: string,
    data: { after?: string } | undefined,
    id: string
  ) {
    const after = data?.after ? `&after=${encodeURIComponent(data.after)}` : '';
    // Fetch Instagram conversations
    const url =
      `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${id}/conversations` +
      `?platform=instagram&fields=id,updated_time,unread_count,link,participants,messages.limit(50){id,message,created_time,from,to}` +
      `&limit=25${after}&access_token=${accessToken}`;

    return (
      await this.fetch(url, undefined, 'sync instagram conversations')
    ).json();
  }

  async replyToConversation(
    accessToken: string,
    data: { recipientId: string; message: string },
    id: string
  ) {
    return (
      await this.fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/me/messages?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: {
              id: data.recipientId,
            },
            message: {
              text: data.message,
            },
          }),
        },
        'reply to instagram conversation'
      )
    ).json();
  }
}
