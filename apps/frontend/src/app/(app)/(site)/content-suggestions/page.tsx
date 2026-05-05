export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { MetaFeatureConsole } from '@gitroom/frontend/components/meta/meta-feature-console';

export const metadata: Metadata = {
  title: 'ProERP Ideas',
  description: '',
};

export default async function Index() {
  return <MetaFeatureConsole feature="suggestions" />;
}
