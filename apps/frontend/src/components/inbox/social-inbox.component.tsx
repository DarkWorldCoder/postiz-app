'use client';

import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import SafeImage from '@gitroom/react/helpers/safe.image';
import clsx from 'clsx';
import dayjs from 'dayjs';
import useSWR, { mutate } from 'swr';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPlatformIcon } from '@gitroom/frontend/components/helpers/platform-icon';

interface InboxIntegration {
  id: string;
  name: string;
  picture?: string;
  providerIdentifier: string;
  internalId: string;
}

type InboxChannel = 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'TIKTOK';
type InboxFilter = 'ALL' | InboxChannel;
const LIVE_REFRESH_INTERVAL = 3000;

interface InboxConversation {
  id: string;
  participantName?: string;
  participantId: string;
  snippet?: string;
  unreadCount: number;
  lastMessageAt?: string;
  channel?: InboxChannel;
  integration: InboxIntegration;
}

interface InboxMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'SYSTEM';
  content?: string;
  sentAt: string;
}

const channelForProvider = (providerIdentifier: string): InboxChannel => {
  if (providerIdentifier === 'instagram-messages') return 'INSTAGRAM';
  if (providerIdentifier === 'whatsapp') return 'WHATSAPP';
  if (providerIdentifier === 'tiktok-business') return 'TIKTOK';
  return 'FACEBOOK';
};

const channelLabel = (channel: InboxFilter) => {
  if (channel === 'ALL') return 'All';
  if (channel === 'INSTAGRAM') return 'Instagram';
  if (channel === 'WHATSAPP') return 'WhatsApp';
  if (channel === 'TIKTOK') return 'TikTok';
  return 'Facebook';
};

const channelIcon = (channel?: InboxChannel) => {
  if (channel === 'INSTAGRAM') return getPlatformIcon('instagram-messages');
  if (channel === 'WHATSAPP') return getPlatformIcon('whatsapp');
  if (channel === 'TIKTOK') return getPlatformIcon('tiktok-business');
  return getPlatformIcon('facebook-messages');
};

export const SocialInboxComponent = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const [currentIntegrationId, setCurrentIntegrationId] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [channelFilter, setChannelFilter] = useState<InboxFilter>('ALL');

  const load = useCallback(async (path: string) => {
    return (await (await fetch(path)).json()) as any;
  }, []);

  const { data: integrations, isLoading: integrationsLoading } = useSWR(
    '/inbox/integrations',
    load,
    {
      refreshInterval: LIVE_REFRESH_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  useEffect(() => {
    if (!currentIntegrationId && integrations?.[0]?.id) {
      setCurrentIntegrationId(integrations[0].id);
    }
  }, [integrations, currentIntegrationId]);

  const conversationsKey = useMemo(
    () =>
      currentIntegrationId
        ? `/inbox/conversations?integrationId=${currentIntegrationId}`
        : null,
    [currentIntegrationId]
  );

  const { data: conversations, isLoading: conversationsLoading } = useSWR(
    conversationsKey,
    load,
    {
      refreshInterval: LIVE_REFRESH_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  useEffect(() => {
    if (!currentConversationId && conversations?.[0]?.id) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  const messagesKey = useMemo(
    () =>
      currentConversationId
        ? `/inbox/conversations/${currentConversationId}/messages`
        : null,
    [currentConversationId]
  );

  const { data: messages, isLoading: messagesLoading } = useSWR(
    messagesKey,
    load,
    {
      refreshInterval: LIVE_REFRESH_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );

  const sync = useCallback(async () => {
    if (!currentIntegrationId) {
      return;
    }

    setSyncing(true);
    try {
      await fetch(`/inbox/sync/${currentIntegrationId}`, {
        method: 'POST',
      });
      await mutate(conversationsKey);
      if (messagesKey) {
        await mutate(messagesKey);
      }
      toaster.show(t('inbox_synced', 'Inbox synced'), 'success');
    } catch (e) {
      toaster.show(t('inbox_sync_failed', 'Inbox sync failed'), 'warning');
    } finally {
      setSyncing(false);
    }
  }, [currentIntegrationId, conversationsKey, messagesKey]);

  const sendReply = useCallback(async () => {
    if (!currentConversationId || !reply.trim()) {
      return;
    }

    setSending(true);
    try {
      await fetch(`/inbox/conversations/${currentConversationId}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          message: reply.trim(),
        }),
      });
      setReply('');
      await mutate(conversationsKey);
      await mutate(messagesKey);
      toaster.show(t('reply_sent', 'Reply sent'), 'success');
    } catch (e) {
      toaster.show(t('reply_failed', 'Reply failed'), 'warning');
    } finally {
      setSending(false);
    }
  }, [currentConversationId, reply, conversationsKey, messagesKey]);

  if (integrationsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  if (!integrations?.length) {
    return (
      <div className="flex flex-1 items-center justify-center bg-newBgColorInner text-center p-[32px]">
        <div>
          <div className="text-[28px] font-[600] mb-[10px]">
            {t('no_inbox_channels', 'No inbox channels connected yet')}
          </div>
          <div className="text-textItemBlur">
            {t(
              'connect_facebook_inbox_channel',
              'Connect a Facebook Inbox channel to start syncing conversations.'
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentConversation = (conversations || []).find(
    (conversation: InboxConversation) => conversation.id === currentConversationId
  );
  const filteredIntegrations = (integrations as InboxIntegration[]).filter(
    (integration) => {
      if (channelFilter === 'ALL') return true;
      return channelForProvider(integration.providerIdentifier) === channelFilter;
    }
  );

  return (
    <>
      <div className="bg-newBgColorInner p-[20px] flex flex-col gap-[15px] w-[280px] min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-[500]">
              {t('channels', 'Channels')}
            </h2>
            <div className="mt-[4px] flex items-center gap-[6px] text-[12px] text-textItemBlur">
              <span className="h-[7px] w-[7px] rounded-full bg-green-500" />
              {t('live', 'Live')}
            </div>
          </div>
          <Button onClick={sync} loading={syncing}>
            {t('sync', 'Sync')}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-[8px] text-[13px] border-b border-blockSeparator pb-[10px]">
          {(['ALL', 'FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'TIKTOK'] as InboxFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setChannelFilter(filter)}
              className={clsx(
                'px-[12px] py-[4px] rounded-[14px] font-[500] transition-colors',
                channelFilter === filter
                  ? 'bg-[#FC69FF] text-white'
                  : 'bg-newBgLineColor text-textItemBlur hover:text-textColor'
              )}
            >
              {channelLabel(filter)}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-col gap-[10px] overflow-y-auto">
          {filteredIntegrations.map((integration) => {
            const channel = channelForProvider(integration.providerIdentifier);
            return (
            <button
              key={integration.id}
              onClick={() => {
                setCurrentIntegrationId(integration.id);
                setCurrentConversationId('');
              }}
              className={clsx(
                'flex items-center gap-[10px] text-left rounded-[10px] p-[10px] bg-newBgLineColor',
                integration.id === currentIntegrationId &&
                  'ring-1 ring-[#FC69FF]'
              )}
            >
              <div className="relative">
                <ImageWithFallback
                  fallbackSrc="/no-picture.jpg"
                  src={integration.picture || '/no-picture.jpg'}
                  className="rounded-[8px]"
                  alt={integration.name}
                  width={36}
                  height={36}
                />
                <SafeImage
                  src={channelIcon(channel)}
                  className="rounded-[8px] absolute z-10 bottom-[-4px] end-[-4px] border border-fifth"
                  alt={channelLabel(channel)}
                  width={16}
                  height={16}
                />
              </div>
              <div className="min-w-0">
                <div className="font-[500] truncate">{integration.name}</div>
                <div className="text-[12px] text-textItemBlur truncate">
                  ProERP {channelLabel(channel)} Inbox
                </div>
              </div>
            </button>
          )})}
          {!filteredIntegrations.length && (
            <div className="rounded-[10px] border border-dashed border-newTableBorder p-[14px] text-[13px] text-textItemBlur">
              {t('no_channels_for_filter', 'No channels for this filter.')}
            </div>
          )}
        </div>
      </div>

      <div className="bg-newBgColorInner p-[20px] flex min-h-0 flex-col gap-[12px] w-[380px] border-l border-blockSeparator">
        <div>
          <div className="text-[20px] font-[500]">
            {t('conversations', 'Conversations')}
          </div>
          <div className="text-[12px] text-textItemBlur">
            ProERP
          </div>
        </div>
        {conversationsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingComponent />
          </div>
        ) : !(conversations as InboxConversation[])?.length ? (
          <div className="text-textItemBlur">
            {t(
              'no_conversations_found',
              'No conversations found yet. Try syncing or sending a message to the Page.'
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-col gap-[10px] overflow-y-auto">
            {(conversations as InboxConversation[]).map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setCurrentConversationId(conversation.id)}
                className={clsx(
                  'rounded-[10px] p-[12px] bg-newBgLineColor text-left',
                  conversation.id === currentConversationId &&
                    'ring-1 ring-[#FC69FF]'
                )}
              >
                <div className="flex items-center justify-between gap-[10px]">
                  <div className="font-[500] truncate flex items-center gap-[6px]">
                    <SafeImage src={channelIcon(conversation.channel)} width={12} height={12} alt={conversation.channel || 'Inbox'} className="rounded-full" />
                    {conversation.participantName || conversation.participantId}
                  </div>
                  {!!conversation.unreadCount && (
                    <div className="min-w-[22px] h-[22px] rounded-full bg-[#FC69FF] text-white text-[12px] flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
                <div className="text-[13px] text-textItemBlur truncate mt-[6px]">
                  {conversation.snippet || t('no_messages', 'No messages yet')}
                </div>
                <div className="text-[11px] text-textItemBlur mt-[6px]">
                  {conversation.lastMessageAt
                    ? dayjs(conversation.lastMessageAt).format(
                        'MMM D, YYYY h:mm A'
                      )
                    : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 bg-newBgColorInner p-[20px] flex min-h-0 flex-col gap-[14px] border-l border-blockSeparator">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[20px] font-[500]">
              {currentConversation?.participantName ||
                t('select_a_conversation', 'Select a conversation')}
            </div>
            <div className="text-[13px] text-textItemBlur">
              {currentConversation?.participantId || ''}
            </div>
          </div>
          {!!currentConversationId && (
            <div className="rounded-full bg-newBgLineColor px-[10px] py-[5px] text-[12px] text-textItemBlur">
              {t('live', 'Live')}
            </div>
          )}
        </div>

        {!currentConversationId ? (
          <div className="flex flex-1 items-center justify-center text-textItemBlur">
            {t(
              'pick_a_conversation_to_view_messages',
              'Pick a conversation to view messages.'
            )}
          </div>
        ) : messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingComponent />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] pe-[4px]">
              {(messages as InboxMessage[])?.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'max-w-[75%] rounded-[12px] px-[14px] py-[10px] text-[14px]',
                    message.direction === 'OUTBOUND'
                      ? 'self-end bg-[#FC69FF] text-white'
                      : message.direction === 'SYSTEM'
                      ? 'self-center bg-btnSimple text-textItemBlur'
                      : 'self-start bg-newBgLineColor'
                  )}
                >
                  <div>{message.content || t('unsupported_message', 'Unsupported message')}</div>
                  <div
                    className={clsx(
                      'text-[11px] mt-[6px]',
                      message.direction === 'OUTBOUND'
                        ? 'text-white/80'
                        : 'text-textItemBlur'
                    )}
                  >
                    {dayjs(message.sentAt).format('MMM D, h:mm A')}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-[10px] items-end">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t('write_a_reply', 'Write a reply...')}
                className="flex-1 min-h-[90px] rounded-[12px] bg-newBgLineColor p-[12px] outline-none resize-none"
              />
              <Button onClick={sendReply} loading={sending}>
                {t('send', 'Send')}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
