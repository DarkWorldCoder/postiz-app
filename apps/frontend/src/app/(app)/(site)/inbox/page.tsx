export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SocialInboxComponent } from '@gitroom/frontend/components/inbox/social-inbox.component';

export const metadata: Metadata = {
  title: 'WiseSocial Inbox',
  description: '',
};

export default async function Index() {
  return <SocialInboxComponent />;
}
