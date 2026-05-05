'use client';

import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Button } from '@gitroom/react/form/button';
import { Select } from '@gitroom/react/form/select';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useToaster } from '@gitroom/react/toaster/toaster';

type Feature = 'comments' | 'ads' | 'leads' | 'commerce' | 'audiences' | 'suggestions' | 'subscriptions';

const titleMap: Record<Feature, string> = {
  comments: 'WiseSocial Comments',
  ads: 'WiseSocial Ads',
  leads: 'WiseSocial Leads',
  commerce: 'WiseSocial Commerce',
  audiences: 'WiseSocial Audiences',
  suggestions: 'WiseSocial Ideas',
  subscriptions: 'WiseSocial Subscriptions',
};

const providerAllowList = [
  'facebook',
  'instagram',
  'instagram-standalone',
  'threads',
  'facebook-ads',
  'tiktok-business',
  'facebook-messages',
  'instagram-messages',
  'whatsapp',
];

export const MetaFeatureConsole: FC<{ feature: Feature }> = ({ feature }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const [integrationId, setIntegrationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionResult, setActionResult] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({
    status: 'PAUSED',
    objective: 'OUTCOME_TRAFFIC',
    confirmActive: false,
  });

  const load = useCallback(async (url: string) => (await fetch(url)).json(), []);
  const { data: integrationsData, isLoading } = useSWR('/integrations/list', load, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  const integrations = useMemo(() => {
    const list = integrationsData?.integrations || integrationsData || [];
    return (list || []).filter((item: any) =>
      providerAllowList.includes(item.identifier || item.providerIdentifier)
    );
  }, [integrationsData]);

  const selected = integrations.find((item: any) => item.id === integrationId) || integrations[0];
  const selectedId = integrationId || selected?.id || '';

  const dataKey = useMemo(() => {
    if (!selectedId) return null;
    if (feature === 'ads') return `/ads/${selectedId}/campaigns`;
    if (feature === 'leads') return '/leads';
    if (feature === 'audiences') return `/audiences?integrationId=${selectedId}`;
    if (feature === 'comments') return `/comments?integrationId=${selectedId}`;
    if (feature === 'subscriptions') return `/subscriptions/${selectedId}`;
    return null;
  }, [feature, selectedId]);

  const { data, isLoading: dataLoading } = useSWR(dataKey, load, {
    refreshInterval: feature === 'comments' || feature === 'leads' ? 10000 : 30000,
    revalidateOnFocus: true,
  });

  const run = useCallback(
    async (path: string, options: RequestInit = {}, success = 'Done') => {
      setBusy(true);
      try {
        const response = await fetch(path, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });
        if (!response.ok) throw new Error(await response.text());
        toaster.show(success, 'success');
        if (dataKey) await mutate(dataKey);
        const result = await response.json().catch(() => ({}));
        setActionResult(result);
        return result;
      } catch (err: any) {
        toaster.show(err?.message || 'Request failed', 'warning');
      } finally {
        setBusy(false);
      }
    },
    [dataKey]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-newBgColorInner">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className="bg-newBgColorInner flex-1 p-[20px] overflow-y-auto">
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-[16px] border-b border-blockSeparator pb-[18px]">
        <div>
          <div className="text-[12px] font-[600] uppercase text-textItemBlur">WiseSocial workspace</div>
          <h1 className="mt-[4px] text-[24px] font-[600]">{titleMap[feature]}</h1>
        </div>
        <div className="w-[280px]">
          <Select
            label=""
            name="integration"
            disableForm
            hideErrors
            value={selectedId}
            onChange={(event) => setIntegrationId(event.target.value)}
          >
            {integrations.map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.identifier || item.providerIdentifier})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!selectedId ? (
        <EmptyPanel title="No connected channel" text="Connect Facebook, Instagram, WhatsApp, or TikTok Business to load WiseSocial data here." />
      ) : feature === 'comments' ? (
        <CommentsPanel
          data={data}
          loading={dataLoading}
          busy={busy}
          form={form}
          setForm={setForm}
          run={run}
          integrationId={selectedId}
        />
      ) : feature === 'ads' ? (
        <AdsPanel data={data} loading={dataLoading} busy={busy} form={form} setForm={setForm} run={run} integrationId={selectedId} />
      ) : feature === 'leads' ? (
        <LeadsPanel data={data} loading={dataLoading} busy={busy} run={run} integrationId={selectedId} />
      ) : feature === 'commerce' ? (
        <CommercePanel busy={busy} form={form} setForm={setForm} run={run} integrationId={selectedId} />
      ) : feature === 'audiences' ? (
        <AudiencesPanel data={data} loading={dataLoading} busy={busy} form={form} setForm={setForm} run={run} integrationId={selectedId} />
      ) : feature === 'subscriptions' ? (
        <SubscriptionsPanel data={data} loading={dataLoading} busy={busy} form={form} setForm={setForm} run={run} integrationId={selectedId} />
      ) : (
        <SuggestionsPanel busy={busy} form={form} setForm={setForm} run={run} integrationId={selectedId} result={actionResult} />
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  type?: string;
}) => (
  <label className="flex flex-col gap-[6px] text-[13px] text-textItemBlur">
    {label}
    <input
      type={type}
      value={value || ''}
      placeholder={placeholder}
      onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
      className="bg-newBgLineColor border border-newTableBorder rounded-[8px] px-[12px] py-[9px] text-textColor outline-none"
    />
  </label>
);

const JsonField = ({ label, value, onChange }: { label: string; value: any; onChange: (value: string) => void }) => (
  <label className="flex flex-col gap-[6px] text-[13px] text-textItemBlur">
    {label}
    <textarea
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      className="bg-newBgLineColor border border-newTableBorder rounded-[8px] px-[12px] py-[9px] text-textColor outline-none min-h-[96px]"
    />
  </label>
);

const parseJsonInput = (value?: string) => {
  if (!value?.trim()) return undefined;
  try {
    return JSON.parse(value);
  } catch (err) {
    return undefined;
  }
};

const EmptyPanel = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-[8px] border border-dashed border-newTableBorder bg-newTableHeader p-[28px] text-center">
    <div className="text-[18px] font-[600]">{title}</div>
    <div className="mx-auto mt-[8px] max-w-[520px] text-[13px] leading-[20px] text-textItemBlur">
      {text}
    </div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="mb-[16px] rounded-[8px] border border-newTableBorder bg-newTableHeader p-[16px]">
    <div className="mb-[12px] text-[15px] font-[600]">{title}</div>
    <div className="flex flex-wrap items-end gap-[10px]">{children}</div>
  </section>
);

const ResultPanel = ({ value }: { value: any }) => {
  if (!value || (typeof value === 'object' && !Object.keys(value).length)) {
    return null;
  }

  return (
    <pre className="mt-[16px] max-h-[360px] overflow-auto rounded-[8px] border border-newTableBorder bg-newBgLineColor p-[14px] text-[12px] leading-[18px] whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

const Toolbar = ({ children }: { children: ReactNode }) => (
  <div className="mb-[16px] flex flex-wrap items-end gap-[10px] rounded-[8px] border border-newTableBorder bg-newTableHeader p-[14px]">
    {children}
  </div>
);

const CommentsPanel = ({ data, loading, busy, form, setForm, run, integrationId }: any) => (
  <>
    <Toolbar>
      <Field label="External post ID" value={form.postReleaseId} onChange={(value) => setForm({ ...form, postReleaseId: value })} />
      <Button
        loading={busy}
        onClick={() => run(`/comments/sync/${integrationId}/${encodeURIComponent(form.postReleaseId || '')}`, { method: 'POST' }, 'Comments synced')}
      >
        Sync
      </Button>
    </Toolbar>
    <Toolbar>
      <Field label="Rule name" value={form.ruleName} onChange={(value) => setForm({ ...form, ruleName: value })} />
      <Field label="Keywords" value={form.keywords} placeholder="spam, scam" onChange={(value) => setForm({ ...form, keywords: value })} />
      <Field label="Auto-reply" value={form.replyTemplate} onChange={(value) => setForm({ ...form, replyTemplate: value })} />
      <Button
        loading={busy}
        onClick={() => run('/comments/moderation/rules', {
          method: 'POST',
          body: JSON.stringify({
            name: form.ruleName || 'Moderation rule',
            action: form.replyTemplate ? 'AUTO_REPLY' : 'HIDE',
            keywords: String(form.keywords || '').split(',').map((item) => item.trim()).filter(Boolean),
            replyTemplate: form.replyTemplate || undefined,
          }),
        }, 'Moderation rule saved')}
      >
        Save Rule
      </Button>
    </Toolbar>
    {loading ? <LoadingComponent /> : !(data?.comments || []).length ? (
      <EmptyPanel title="No comments loaded" text="Sync a post to bring comments into WiseSocial moderation." />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        {(data?.comments || []).map((comment: any) => (
          <div key={comment.id} className="border border-newTableBorder rounded-[8px] p-[14px] bg-newTableHeader">
            <div className="font-[600]">{comment.authorName}</div>
            <div className="text-[13px] mt-[8px] whitespace-pre-wrap">{comment.content}</div>
            <div className="text-[12px] text-textItemBlur mt-[8px]">
              {comment.sentiment || 'unscored'} · {comment.likeCount || 0} likes · {comment.isHidden ? 'hidden' : 'visible'}
            </div>
            <div className="flex gap-[8px] mt-[12px] flex-wrap">
              <Button onClick={() => run(`/comments/${comment.id}/hide`, { method: 'POST', body: JSON.stringify({ hide: !comment.isHidden }) })}>
                {comment.isHidden ? 'Unhide' : 'Hide'}
              </Button>
              <Button onClick={() => run(`/comments/${comment.id}/like`, { method: 'POST', body: JSON.stringify({ like: true }) })}>
                Like
              </Button>
              <Button onClick={() => {
                const message = window.prompt('Reply');
                if (message) run(`/comments/${comment.id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }, 'Reply sent');
              }}>
                Reply
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
);

const AdsPanel = ({ data, loading, busy, form, setForm, run, integrationId }: any) => (
  <>
    <Section title="Campaign controls">
      <Button loading={busy} onClick={() => run(`/ads/${integrationId}/campaigns/sync`, { method: 'POST' }, 'Campaigns synced')}>Sync</Button>
      <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
      <Field label="Objective" value={form.objective} onChange={(value) => setForm({ ...form, objective: value })} />
      <label className="flex items-center gap-[8px] text-[13px]">
        <input type="checkbox" checked={!!form.confirmActive} onChange={(event) => setForm({ ...form, confirmActive: event.target.checked, status: event.target.checked ? 'ACTIVE' : 'PAUSED' })} />
        Allow active delivery
      </label>
      <Button
        loading={busy}
        onClick={() => run(`/ads/${integrationId}/campaigns`, { method: 'POST', body: JSON.stringify(form) }, 'Campaign created')}
      >
        Create Campaign
      </Button>
    </Section>
    {loading ? <LoadingComponent /> : !(data || []).length ? (
      <EmptyPanel title="No campaigns loaded" text="Sync campaigns or create a paused draft campaign to start managing WiseSocial ads." />
    ) : (
      <div className="flex flex-col gap-[10px]">
        {(data || []).map((campaign: any) => (
          <div key={campaign.id} className="border border-newTableBorder rounded-[8px] p-[14px] bg-newTableHeader">
            <div className="font-[600]">{campaign.name}</div>
            <div className="text-[13px] text-textItemBlur">{campaign.objective} · {campaign.status}</div>
          </div>
        ))}
      </div>
    )}
  </>
);

const LeadsPanel = ({ data, loading, busy, run, integrationId }: any) => (
  <>
    <Section title="Lead operations">
      <Button loading={busy} onClick={() => run(`/leads/${integrationId}/forms/sync`, { method: 'POST' }, 'Lead forms synced')}>Sync Forms</Button>
      <Button onClick={() => window.open('/api/leads/export.csv', '_blank')}>Export CSV</Button>
    </Section>
    {loading ? <LoadingComponent /> : !(data || []).length ? (
      <EmptyPanel title="No leads yet" text="Sync forms and wait for Meta lead webhook data to load into WiseSocial." />
    ) : (
      <div className="flex flex-col gap-[10px]">
        {(data || []).map((lead: any) => (
          <div key={lead.id} className="border border-newTableBorder rounded-[8px] p-[14px] bg-newTableHeader">
            <div className="font-[600]">{lead.externalLeadId}</div>
            <div className="text-[13px] text-textItemBlur">{lead.form?.name} · {lead.status}</div>
            <pre className="text-[12px] whitespace-pre-wrap mt-[8px]">{JSON.stringify(lead.fieldData, null, 2)}</pre>
          </div>
        ))}
      </div>
    )}
  </>
);

const CommercePanel = ({ busy, form, setForm, run, integrationId }: any) => (
  <>
    <Section title="Catalog sync">
      <Button loading={busy} onClick={() => run(`/commerce/${integrationId}/catalogs/sync`, { method: 'POST' }, 'Catalogs synced')}>Sync Catalogs</Button>
      <Field label="Catalog ID" value={form.catalogId} onChange={(value) => setForm({ ...form, catalogId: value })} />
      <Button loading={busy} onClick={() => run(`/commerce/${integrationId}/catalogs/${form.catalogId}/products/sync`, { method: 'POST' }, 'Products synced')}>Sync Products</Button>
    </Section>
    <Section title="Product draft">
      <Field label="Name" value={form.productName} onChange={(value) => setForm({ ...form, productName: value })} />
      <Field label="Retailer ID" value={form.retailerId} onChange={(value) => setForm({ ...form, retailerId: value })} />
      <Field label="Price" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
      <Button
        loading={busy}
        onClick={() => run(`/commerce/${integrationId}/catalogs/${form.catalogId}/products`, {
          method: 'POST',
          body: JSON.stringify({ name: form.productName, retailerId: form.retailerId, price: form.price }),
        }, 'Product created')}
      >
        Create Product
      </Button>
    </Section>
  </>
);

const AudiencesPanel = ({ data, loading, busy, form, setForm, run, integrationId }: any) => (
  <>
    <Toolbar>
      <Field label="Name" value={form.audienceName} onChange={(value) => setForm({ ...form, audienceName: value })} />
      <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
      <Button
        loading={busy}
        onClick={() => run(`/audiences/${integrationId}`, {
          method: 'POST',
          body: JSON.stringify({ name: form.audienceName, description: form.description }),
        }, 'Audience created')}
      >
        Create Audience
      </Button>
    </Toolbar>
    {loading ? <LoadingComponent /> : !(data || []).length ? (
      <EmptyPanel title="No audiences loaded" text="Create a WiseSocial audience or sync connected business audience data." />
    ) : (
      <div className="flex flex-col gap-[10px]">
        {(data || []).map((audience: any) => (
          <div key={audience.id} className="border border-newTableBorder rounded-[8px] p-[14px] bg-newTableHeader">
            <div className="font-[600]">{audience.name}</div>
            <div className="text-[13px] text-textItemBlur">{audience.subtype || 'CUSTOM'} · {audience.status || 'unknown'}</div>
          </div>
        ))}
      </div>
    )}
  </>
);

const SuggestionsPanel = ({ busy, form, setForm, run, integrationId, result }: any) => (
  <>
    <Section title="Channel intelligence">
      <Button loading={busy} onClick={() => run(`/content-suggestions/${integrationId}/best-times`, {}, 'Best times loaded')}>Best Times</Button>
      <Button loading={busy} onClick={() => run(`/content-suggestions/${integrationId}/content-ideas`, {}, 'Ideas loaded')}>Content Ideas</Button>
      <Button loading={busy} onClick={() => run(`/content-suggestions/${integrationId}/trending-audio`, {}, 'Audio loaded')}>Trending Audio</Button>
    </Section>
    <Section title="Content helper">
      <JsonField label="Post content" value={form.content} onChange={(value) => setForm({ ...form, content: value })} />
      <Button loading={busy} onClick={() => run('/content-suggestions/hashtags', { method: 'POST', body: JSON.stringify({ content: form.content }) }, 'Hashtags generated')}>
        Hashtags
      </Button>
    </Section>
    <ResultPanel value={result} />
  </>
);

const SubscriptionsPanel = ({ data, loading, busy, form, setForm, run, integrationId }: any) => (
  <>
    <Toolbar>
      <Field
        label="Event source"
        value={form.eventSource}
        placeholder="AD_ACCOUNT"
        onChange={(value) => setForm({ ...form, eventSource: value })}
      />
      <Field
        label="Callback URL"
        value={form.callbackUrl}
        placeholder="/webhooks/tiktok"
        onChange={(value) => setForm({ ...form, callbackUrl: value })}
      />
      <JsonField
        label="Payload overrides"
        value={form.subscriptionPayload}
        onChange={(value) => setForm({ ...form, subscriptionPayload: value })}
      />
      <Button
        loading={busy}
        onClick={() =>
          run(
            `/subscriptions/${integrationId}`,
            {
              method: 'POST',
              body: JSON.stringify({
                eventSource: form.eventSource || 'AD_ACCOUNT',
                callbackUrl: form.callbackUrl,
                payload: parseJsonInput(form.subscriptionPayload),
              }),
            },
            'Subscription saved'
          )
        }
      >
        Subscribe
      </Button>
    </Toolbar>
    <Toolbar>
      <Field
        label="Subscription ID"
        value={form.subscriptionId}
        onChange={(value) => setForm({ ...form, subscriptionId: value })}
      />
      <Button
        loading={busy}
        onClick={() =>
          run(
            `/subscriptions/${integrationId}/unsubscribe`,
            {
              method: 'POST',
              body: JSON.stringify({
                subscriptionId: form.subscriptionId,
                eventSource: form.eventSource,
              }),
            },
            'Subscription removed'
          )
        }
      >
        Unsubscribe
      </Button>
    </Toolbar>
    {loading ? (
      <LoadingComponent />
    ) : (
      <pre className="border border-newTableBorder rounded-[8px] p-[14px] bg-newTableHeader text-[12px] whitespace-pre-wrap overflow-x-auto">
        {JSON.stringify(data || {}, null, 2)}
      </pre>
    )}
  </>
);
