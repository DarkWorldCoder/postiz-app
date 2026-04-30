'use client';

import { FC, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { ChartSocial } from '@gitroom/frontend/components/analytics/chart-social';
import { Button } from '@gitroom/react/form/button';

export const CrossPlatformAnalytics: FC<{ date: number }> = ({ date }) => {
  const fetch = useFetch();
  const t = useT();

  const load = useCallback(async () => {
    return await (
      await fetch(`/analytics/cross-platform/summary?date=${date}`)
    ).json();
  }, [date]);

  const { data, isLoading } = useSWR(`/analytics/cross-platform/${date}`, load, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });

  const handleExport = useCallback(() => {
    window.open(`/api/analytics/export?date=${date}`, '_blank');
  }, [date]);

  const metricsSummary = useMemo(() => {
    if (!data) return [];
    
    // Aggregate by metric label
    const metricsMap = new Map<string, { total: number, data: any[] }>();
    
    for (const integration of data) {
      if (!integration.analytics) continue;
      
      for (const metric of integration.analytics) {
        if (!metricsMap.has(metric.label)) {
          metricsMap.set(metric.label, { total: 0, data: [] });
        }
        
        const m = metricsMap.get(metric.label)!;
        const totalValue = metric.data.reduce((acc: number, val: any) => acc + val.total, 0);
        m.total += totalValue;
        
        // Merge timeline data
        metric.data.forEach((d: any) => {
          const existingDate = m.data.find(x => x.date === d.date);
          if (existingDate) {
            existingDate.total += d.total;
          } else {
            m.data.push({ ...d });
          }
        });
      }
    }
    
    return Array.from(metricsMap.entries()).map(([label, value]) => {
      // Sort data by date
      value.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { label, ...value };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[48px]">
        <LoadingComponent />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center py-[48px] text-textItemBlur">
        {t('no_data_available', 'No data available for the selected period')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-[500]">{t('cross_platform_overview', 'Cross-Platform Overview')}</h2>
        <Button onClick={handleExport} className="!bg-[#32d583] hover:!bg-[#2ebc74] !text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-[6px] inline">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('export_csv', 'Export CSV')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {metricsSummary.map((metric, i) => (
          <div key={metric.label} className="bg-newTableHeader border border-newTableBorder rounded-[12px] flex flex-col overflow-hidden">
            <div className="px-[16px] pt-[14px] pb-[8px]">
              <span className="text-[15px] font-medium text-newTableText">
                {metric.label}
              </span>
            </div>
            {metric.data.length > 1 ? (
              <>
                <div className="flex-1 px-[12px] py-[8px]">
                  <div className="h-[120px] relative">
                    <ChartSocial data={metric.data} color={['purple', 'green', 'blue'][i % 3] as any} key={`chart-${metric.label}`} />
                  </div>
                </div>
                <div className="px-[16px] pb-[14px]">
                  <div className="text-[36px] leading-[42px] font-semibold tracking-tight">
                    {new Intl.NumberFormat().format(Math.round(metric.total))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[16px]">
                <div className="text-[48px] leading-[56px] font-semibold tracking-tight">
                  {new Intl.NumberFormat().format(Math.round(metric.total))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-[20px]">
        <h3 className="text-[18px] font-[500] mb-[12px]">{t('channels_breakdown', 'Channels Breakdown')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {data.map((integration: any) => (
            <div key={integration.integrationId} className="bg-newBgLineColor rounded-[10px] p-[16px] flex flex-col gap-[10px]">
              <div className="flex items-center gap-[10px] mb-[4px]">
                <img src={integration.picture || '/no-picture.jpg'} className="w-[24px] h-[24px] rounded-full" alt="" />
                <span className="font-[500]">{integration.name}</span>
                <span className="text-[12px] text-textItemBlur ml-auto bg-newBgColorInner px-[8px] py-[2px] rounded-full">
                  {integration.provider}
                </span>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                {integration.analytics?.map((metric: any) => {
                  const total = metric.data.reduce((acc: number, val: any) => acc + val.total, 0);
                  return (
                    <div key={metric.label} className="flex flex-col">
                      <span className="text-[12px] text-textItemBlur">{metric.label}</span>
                      <span className="font-[500]">{new Intl.NumberFormat().format(Math.round(total))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
