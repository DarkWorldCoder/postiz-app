import { Metadata } from 'next';
import { LegalShell, LegalSection, LegalList } from '../legal-shell';

export const metadata: Metadata = {
  title: 'WiseSocial Data Deletion Instructions',
  description:
    'Instructions for deleting WiseSocial account data and social platform data received from TikTok, Facebook, Instagram, and WhatsApp.',
};

export default function DataDeletionPage() {
  return (
    <LegalShell
      title="Data Deletion Instructions"
      description="Use this page to understand how to disconnect WiseSocial from social platforms and request deletion of WiseSocial account, workspace, and social platform data."
    >
      <LegalSection title="Disconnect Social Integrations">
        <LegalList
          items={[
            'Open WiseSocial and go to the connected channel or integration settings.',
            'Remove or disconnect the TikTok, Facebook, Instagram, WhatsApp, or other social account you no longer want WiseSocial to access.',
            'After disconnection, WiseSocial will stop using that integration for future access, posting, syncing, and analytics requests unless you reconnect it.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Revoke Access From Social Platform Settings">
        <LegalList
          items={[
            'For Facebook or Instagram, open your Facebook settings, go to Apps and Websites, find WiseSocial, and remove access. You may also manage connected business assets in Meta Business settings.',
            'For TikTok, open your TikTok account settings for connected apps or authorized apps, find WiseSocial, and revoke access.',
            'For WhatsApp Business and Meta business assets, remove WiseSocial permissions through Meta Business settings or the relevant business integration settings.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Request Deletion From WiseAdmit">
        <p>
          To request deletion of WiseSocial account data, workspace data, or social
          platform data received by WiseSocial, email WiseAdmit at
          ayush@wiseadmit.io or info@wiseadmit.io from the email address associated with your
          WiseSocial account.
        </p>
        <p>Please include:</p>
        <LegalList
          items={[
            'Your WiseSocial account email address.',
            'The workspace or organization name, if applicable.',
            'The social platform and account/page/profile you want deleted, if the request concerns a connected account.',
            'A clear request such as "delete my WiseSocial account" or "delete data received from my TikTok integration."',
          ]}
        />
      </LegalSection>

      <LegalSection title="What Happens Next">
        <p>
          WiseAdmit will verify the request and delete or anonymize applicable
          WiseSocial data unless retention is required for security, fraud
          prevention, legal compliance, tax, accounting, dispute resolution, or
          platform enforcement obligations. We will also stop future platform API
          access for disconnected integrations unless you reconnect them.
        </p>
      </LegalSection>

      <LegalSection title="Platform Data Deletion Requests">
        <p>
          If Meta, TikTok, Facebook, Instagram, WhatsApp, or another platform
          sends WiseAdmit a valid data deletion request for WiseSocial, WiseAdmit
          will process the request according to applicable platform rules and
          law. WiseSocial does not sell social platform data and uses platform data
          only to provide requested WiseSocial features.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
