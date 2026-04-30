'use client';

import { FC, useMemo } from 'react';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { Integration } from '@prisma/client';

export const DemographicsAnalytics: FC<{ integration: Integration }> = ({
  integration,
}) => {
  const fetch = useFetch();
  const t = useT();

  const { data, isLoading } = useSWR(
    `/analytics/demographics/${integration.id}`,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    },
    {
      revalidateOnFocus: false,
    }
  );

  const renderProgressBars = (
    obj: Record<string, number>,
    limit = 5,
    title: string
  ) => {
    if (!obj || Object.keys(obj).length === 0) return null;

    const sorted = Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    const max = sorted[0][1];
    const total = Object.values(obj).reduce((sum, val) => sum + val, 0);

    return (
      <div className="flex flex-col bg-newTableHeader border border-newTableBorder rounded-[12px] p-[20px]">
        <h3 className="text-[16px] font-[500] mb-[16px] text-newTableText">
          {title}
        </h3>
        <div className="flex flex-col gap-[12px]">
          {sorted.map(([key, value]) => {
            const percentage = ((value / max) * 100).toFixed(1);
            const totalPercentage = ((value / total) * 100).toFixed(1);
            return (
              <div key={key}>
                <div className="flex justify-between text-[13px] mb-[4px]">
                  <span className="truncate max-w-[200px]">{key}</span>
                  <span className="text-textItemBlur font-[500]">
                    {totalPercentage}%
                  </span>
                </div>
                <div className="w-full bg-newBgLineColor rounded-full h-[6px]">
                  <div
                    className="bg-[#FC69FF] h-[6px] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[20px]">
        <LoadingComponent />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[20px] mt-[30px]">
      <h2 className="text-[20px] font-[500]">{t('audience_demographics', 'Audience Demographics')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {renderProgressBars(data.countries, 5, t('top_countries', 'Top Countries'))}
        {renderProgressBars(data.cities, 5, t('top_cities', 'Top Cities'))}
        {renderProgressBars(data.ageGender, 5, t('age_and_gender', 'Age & Gender'))}
      </div>
    </div>
  );
};
