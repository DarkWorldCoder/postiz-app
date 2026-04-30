'use client';

import { withContinueProvider } from '../with-continue-provider';

interface FacebookAdsItem {
  id: string;
  page: string;
  username?: string;
  name: string;
  currency?: string;
  timezoneName?: string;
}

export const FacebookAdsContinue = withContinueProvider<
  FacebookAdsItem,
  string
>({
  endpoint: 'pages',
  swrKey: 'load-facebook-ad-accounts',
  titleKey: 'select_ad_account',
  titleDefault: 'Select Ad Account:',
  emptyStateMessages: [
    {
      key: 'we_couldn_t_find_any_ad_accounts_for_this_business',
      text: "We couldn't find any ad accounts for this business.",
    },
    {
      key: 'please_confirm_the_connected_user_has_ads_access',
      text: 'Please confirm the connected user has Meta Ads Manager access.',
    },
  ],
  getItemId: (item) => item.id,
  getSelectionValue: (item) => item.id,
  transformSaveData: (selection) => ({ page: selection }),
  isSelected: (item, selection) => selection === item.id,
  renderItem: (item) => (
    <>
      <div className="w-full flex justify-center">
        <img
          className="w-[56px] h-[56px] rounded-full"
          src="/icons/platforms/facebook.png"
          alt="facebook ads"
        />
      </div>
      <div className="font-medium">{item.name}</div>
      <div className="text-[12px] opacity-70">
        {item.username || item.currency || 'Meta Ads'}
      </div>
      {!!item.timezoneName && (
        <div className="text-[11px] opacity-50">{item.timezoneName}</div>
      )}
    </>
  ),
});
