import { Injectable } from '@nestjs/common';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { SocialInboxRepository } from '@gitroom/nestjs-libraries/database/prisma/social-inbox/social-inbox.repository';
import {
  Integration,
  SocialInboxConversation,
  SocialInboxDirection,
} from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class SocialInboxService {
  constructor(
    private _socialInboxRepository: SocialInboxRepository,
    private _integrationManager: IntegrationManager
  ) {}

  getInboxIntegrations(orgId: string) {
    return this._socialInboxRepository.getInboxIntegrations(orgId);
  }

  getConversations(orgId: string, integrationId?: string) {
    return this._socialInboxRepository.listConversations(orgId, integrationId);
  }

  async getMessages(orgId: string, conversationId: string) {
    const conversation = await this._socialInboxRepository.getConversation(
      orgId,
      conversationId
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await this._socialInboxRepository.markConversationRead(conversationId);
    return this._socialInboxRepository.listMessages(conversationId);
  }

  async syncIntegration(orgId: string, integrationId: string) {
    const integration = await this._socialInboxRepository.getIntegrationById(
      orgId,
      integrationId
    );
    if (
      !integration ||
      !['facebook-messages', 'instagram-messages', 'whatsapp', 'tiktok-business'].includes(
        integration.providerIdentifier
      )
    ) {
      throw new Error('Inbox integration not found or unsupported');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      integration.providerIdentifier
    );
    const syncState = await this._socialInboxRepository.getSyncState(
      integration.id
    );
    const data = await provider.syncConversations(
      integration.token,
      {
        after: syncState?.afterCursor,
      },
      integration.internalId,
      integration
    );

    await this.ingestFacebookConversationList(integration, data?.data || []);
    await this._socialInboxRepository.updateSyncState(integration.id, {
      afterCursor: data?.paging?.cursors?.after,
      lastSyncedAt: new Date(),
    });

    return this.getConversations(orgId, integrationId);
  }

  async reply(orgId: string, conversationId: string, message: string) {
    const conversation = await this._socialInboxRepository.getConversation(
      orgId,
      conversationId
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (
      !['facebook-messages', 'instagram-messages', 'whatsapp', 'tiktok-business'].includes(
        conversation.integration.providerIdentifier
      )
    ) {
      throw new Error('Replies are only supported for Inbox channels');
    }

    const provider: any = this._integrationManager.getSocialIntegration(
      conversation.integration.providerIdentifier
    );
    const response = await provider.replyToConversation(
      conversation.integration.token,
      {
        recipientId: conversation.participantId,
        message,
      },
      conversation.integration.internalId,
      conversation.integration
    );

    const sentAt = new Date();
    await this._socialInboxRepository.createMessageIfNotExists(conversation.id, {
      externalMessageId:
        response.message_id ||
        response.messages?.[0]?.id ||
        `local-${conversation.id}-${sentAt.getTime()}`,
      senderId: conversation.integration.internalId,
      senderName: conversation.integration.name,
      direction: SocialInboxDirection.OUTBOUND,
      content: message,
      sentAt,
      isEcho: true,
      rawPayload: JSON.stringify(response),
    });

    await this._socialInboxRepository.updateConversationSnippet(conversation.id, {
      snippet: message,
      lastMessageAt: sentAt,
    });

    return {
      success: true,
      messageId: response.message_id || response.messages?.[0]?.id,
    };
  }

  verifyFacebookWebhook(
    mode: string,
    verifyToken: string,
    challenge: string | undefined
  ) {
    if (
      mode === 'subscribe' &&
      verifyToken &&
      verifyToken === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
    ) {
      return challenge || '';
    }

    throw new Error('Invalid webhook verification');
  }

  async ingestFacebookWebhook(body: any, rawBody?: Buffer, signature?: string) {
    this.verifyFacebookSignature(rawBody, signature);

    if (body.object !== 'page') {
      return { received: true };
    }

    for (const entry of body.entry || []) {
      const pageId = String(entry.id || '');
      const integrations =
        await this._socialInboxRepository.getIntegrationByPageId(pageId);

      if (!integrations.length) {
        continue;
      }

      for (const messaging of entry.messaging || []) {
        for (const integration of integrations) {
          await this.ingestFacebookMessagingEvent(integration, messaging);
        }
      }
    }

    return { received: true };
  }

  private verifyFacebookSignature(rawBody?: Buffer, signature?: string) {
    if (!process.env.FACEBOOK_WEBHOOK_APP_SECRET || !rawBody || !signature) {
      return true;
    }

    const expected = `sha256=${createHmac(
      'sha256',
      process.env.FACEBOOK_WEBHOOK_APP_SECRET
    )
      .update(rawBody)
      .digest('hex')}`;

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw new Error('Invalid Facebook webhook signature');
    }

    return true;
  }

  private async ingestFacebookConversationList(
    integration: Integration,
    conversations: any[]
  ) {
    for (const item of conversations) {
      const participant = (item.participants?.data || []).find(
        (value: any) => String(value.id) !== String(integration.internalId)
      );

      if (!participant?.id) {
        continue;
      }

      const latestMessage = item.messages?.data?.[0];
      const conversation = await this._socialInboxRepository.upsertConversation(
        integration.id,
        {
          participantId: String(participant.id),
          participantName: participant.name,
          externalConversationId: item.id,
          snippet: latestMessage?.message || item.snippet || '',
          unreadCount: item.unread_count || 0,
          channel:
            integration.providerIdentifier === 'instagram-messages'
              ? 'INSTAGRAM'
              : integration.providerIdentifier === 'whatsapp'
              ? 'WHATSAPP'
              : integration.providerIdentifier === 'tiktok-business'
              ? 'TIKTOK'
              : 'FACEBOOK',
          lastMessageAt: latestMessage?.created_time
            ? new Date(latestMessage.created_time)
            : item.updated_time
            ? new Date(item.updated_time)
            : undefined,
        }
      );

      for (const message of (item.messages?.data || []).slice().reverse()) {
        const isOutbound =
          String(message.from?.id || '') === String(integration.internalId);
        await this._socialInboxRepository.createMessageIfNotExists(
          conversation.id,
          {
            externalMessageId: message.id,
            senderId: String(message.from?.id || participant.id),
            senderName: message.from?.name,
            direction: isOutbound
              ? SocialInboxDirection.OUTBOUND
              : SocialInboxDirection.INBOUND,
            content: message.message || '',
            sentAt: new Date(message.created_time),
            rawPayload: JSON.stringify(message),
          }
        );
      }
    }
  }

  private async ingestFacebookMessagingEvent(
    integration: Integration,
    messaging: any
  ) {
    const participantId = String(messaging.sender?.id || '');
    if (!participantId) {
      return;
    }

    const timestamp = messaging.timestamp
      ? new Date(messaging.timestamp)
      : new Date();
    const conversation = await this._socialInboxRepository.upsertConversation(
      integration.id,
      {
        participantId,
        snippet:
          messaging.message?.text ||
          messaging.postback?.title ||
          messaging.read?.watermark?.toString() ||
          '',
        channel:
          integration.providerIdentifier === 'instagram-messages'
            ? 'INSTAGRAM'
            : integration.providerIdentifier === 'whatsapp'
            ? 'WHATSAPP'
            : integration.providerIdentifier === 'tiktok-business'
            ? 'TIKTOK'
            : 'FACEBOOK',
        lastMessageAt: timestamp,
      }
    );

    if (messaging.message?.mid) {
      const isEcho = !!messaging.message?.is_echo;
      await this._socialInboxRepository.createMessageIfNotExists(
        conversation.id,
        {
          externalMessageId: messaging.message.mid,
          senderId: isEcho
            ? String(integration.internalId)
            : participantId,
          direction: isEcho
            ? SocialInboxDirection.OUTBOUND
            : SocialInboxDirection.INBOUND,
          content: messaging.message.text || '',
          sentAt: timestamp,
          isEcho,
          rawPayload: JSON.stringify(messaging),
        }
      );

      await this._socialInboxRepository.updateConversationSnippet(
        conversation.id,
        {
          snippet: messaging.message.text || '',
          lastMessageAt: timestamp,
          unreadIncrement: !isEcho,
        }
      );
    }

    if (messaging.postback?.payload) {
      await this._socialInboxRepository.createMessageIfNotExists(
        conversation.id,
        {
          externalMessageId:
            messaging.postback.mid ||
            `postback-${participantId}-${messaging.timestamp}`,
          senderId: participantId,
          direction: SocialInboxDirection.SYSTEM,
          content: messaging.postback.title || messaging.postback.payload,
          messageType: 'postback',
          sentAt: timestamp,
          rawPayload: JSON.stringify(messaging),
        }
      );
    }

    await this._socialInboxRepository.updateSyncState(integration.id, {
      lastWebhookAt: new Date(),
    });
  }
}
