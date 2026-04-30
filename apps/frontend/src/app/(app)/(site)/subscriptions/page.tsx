import { Metadata } from 'next';
import { MetaFeatureConsole } from '@gitroom/frontend/components/meta/meta-feature-console';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Subscriptions`,
  description: 'Manage platform event subscriptions',
};

export default function SubscriptionsPage() {
  return <MetaFeatureConsole feature="subscriptions" />;
}
