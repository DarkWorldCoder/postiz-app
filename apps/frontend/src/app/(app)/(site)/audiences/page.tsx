export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { MetaFeatureConsole } from '@gitroom/frontend/components/meta/meta-feature-console';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Audiences`,
  description: '',
};

export default async function Index() {
  return <MetaFeatureConsole feature="audiences" />;
}
