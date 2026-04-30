import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import {
  SocialInboxConversation,
  SocialInboxDirection,
} from '@prisma/client';

@Injectable()
export class SocialInboxRepository {
  constructor(
    private _conversation: PrismaRepository<'socialInboxConversation'>,
    private _message: PrismaRepository<'socialInboxMessage'>,
    private _syncState: PrismaRepository<'socialInboxSyncState'>,
    private _integration: PrismaRepository<'integration'>
  ) {}

  getInboxIntegrations(orgId: string) {
    return this._integration.model.integration.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        disabled: false,
        inBetweenSteps: false,
        providerIdentifier: {
          in: ['facebook-messages', 'instagram-messages', 'whatsapp', 'tiktok-business'],
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        picture: true,
        providerIdentifier: true,
        internalId: true,
      },
    });
  }

  getIntegrationByPageId(pageId: string) {
    return this._integration.model.integration.findMany({
      where: {
        internalId: pageId,
        providerIdentifier: {
          in: ['facebook-messages', 'instagram-messages', 'whatsapp', 'tiktok-business'],
        },
        deletedAt: null,
        inBetweenSteps: false,
      },
    });
  }

  getIntegrationById(orgId: string, id: string) {
    return this._integration.model.integration.findFirst({
      where: {
        id,
        organizationId: orgId,
        deletedAt: null,
      },
    });
  }

  async upsertConversation(
    integrationId: string,
    data: {
      participantId: string;
      participantName?: string;
      externalConversationId?: string;
      snippet?: string;
      unreadCount?: number;
      lastMessageAt?: Date;
      channel?: any;
    }
  ) {
    return this._conversation.model.socialInboxConversation.upsert({
      where: {
        integrationId_participantId: {
          integrationId,
          participantId: data.participantId,
        },
      },
      create: {
        integrationId,
        participantId: data.participantId,
        participantName: data.participantName,
        externalConversationId: data.externalConversationId,
        snippet: data.snippet,
        unreadCount: data.unreadCount || 0,
        lastMessageAt: data.lastMessageAt,
        ...(data.channel ? { channel: data.channel } : {}),
      },
      update: {
        ...(data.participantName ? { participantName: data.participantName } : {}),
        ...(data.externalConversationId
          ? { externalConversationId: data.externalConversationId }
          : {}),
        ...(typeof data.snippet !== 'undefined' ? { snippet: data.snippet } : {}),
        ...(typeof data.unreadCount !== 'undefined'
          ? { unreadCount: data.unreadCount }
          : {}),
        ...(data.lastMessageAt ? { lastMessageAt: data.lastMessageAt } : {}),
        ...(data.channel ? { channel: data.channel } : {}),
      },
    });
  }

  async createMessageIfNotExists(
    conversationId: string,
    data: {
      externalMessageId: string;
      senderId: string;
      senderName?: string;
      direction: SocialInboxDirection;
      content?: string;
      messageType?: string;
      sentAt: Date;
      isEcho?: boolean;
      rawPayload?: string;
    }
  ) {
    return this._message.model.socialInboxMessage.upsert({
      where: {
        conversationId_externalMessageId: {
          conversationId,
          externalMessageId: data.externalMessageId,
        },
      },
      create: {
        conversationId,
        externalMessageId: data.externalMessageId,
        senderId: data.senderId,
        senderName: data.senderName,
        direction: data.direction,
        content: data.content,
        messageType: data.messageType || 'text',
        sentAt: data.sentAt,
        isEcho: !!data.isEcho,
        rawPayload: data.rawPayload,
      },
      update: {
        senderName: data.senderName,
        content: data.content,
        isEcho: !!data.isEcho,
        rawPayload: data.rawPayload,
      },
    });
  }

  updateConversationSnippet(
    conversationId: string,
    data: { snippet?: string; lastMessageAt?: Date; unreadIncrement?: boolean }
  ) {
    return this._conversation.model.socialInboxConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        ...(typeof data.snippet !== 'undefined' ? { snippet: data.snippet } : {}),
        ...(data.lastMessageAt ? { lastMessageAt: data.lastMessageAt } : {}),
        ...(data.unreadIncrement ? { unreadCount: { increment: 1 } } : {}),
      },
    });
  }

  listConversations(orgId: string, integrationId?: string) {
    return this._conversation.model.socialInboxConversation.findMany({
      where: {
        deletedAt: null,
        ...(integrationId ? { integrationId } : {}),
        integration: {
          organizationId: orgId,
          deletedAt: null,
        },
      },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            picture: true,
            providerIdentifier: true,
          },
        },
        messages: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: [
        {
          lastMessageAt: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    });
  }

  getConversation(orgId: string, conversationId: string) {
    return this._conversation.model.socialInboxConversation.findFirst({
      where: {
        id: conversationId,
        deletedAt: null,
        integration: {
          organizationId: orgId,
          deletedAt: null,
        },
      },
      include: {
        integration: true,
      },
    });
  }

  listMessages(conversationId: string) {
    return this._message.model.socialInboxMessage.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });
  }

  markConversationRead(conversationId: string) {
    return this._conversation.model.socialInboxConversation.update({
      where: {
        id: conversationId,
      },
      data: {
        unreadCount: 0,
      },
    });
  }

  updateSyncState(
    integrationId: string,
    data: { afterCursor?: string; lastSyncedAt?: Date; lastWebhookAt?: Date }
  ) {
    return this._syncState.model.socialInboxSyncState.upsert({
      where: {
        integrationId,
      },
      create: {
        integrationId,
        afterCursor: data.afterCursor,
        lastSyncedAt: data.lastSyncedAt,
        lastWebhookAt: data.lastWebhookAt,
      },
      update: {
        ...(typeof data.afterCursor !== 'undefined'
          ? { afterCursor: data.afterCursor }
          : {}),
        ...(data.lastSyncedAt ? { lastSyncedAt: data.lastSyncedAt } : {}),
        ...(data.lastWebhookAt ? { lastWebhookAt: data.lastWebhookAt } : {}),
      },
    });
  }

  getSyncState(integrationId: string) {
    return this._syncState.model.socialInboxSyncState.findUnique({
      where: {
        integrationId,
      },
    });
  }
}
