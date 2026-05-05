import { Metadata } from 'next';
import { MetaFeatureConsole } from '@gitroom/frontend/components/meta/meta-feature-console';

export const metadata: Metadata = {
  title: 'ProERP Subscriptions',
  description: 'Manage platform event subscriptions',
};

export default function SubscriptionsPage() {
  return <MetaFeatureConsole feature="subscriptions" />;
}
