export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';
import { SocialInboxComponent } from '@gitroom/frontend/components/inbox/social-inbox.component';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postiz' : 'Gitroom'} Inbox`,
  description: '',
};

export default async function Index() {
  return <SocialInboxComponent />;
}
