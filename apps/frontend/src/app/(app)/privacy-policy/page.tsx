import Link from 'next/link';
import { Metadata } from 'next';
import { LegalShell, LegalSection, LegalList } from '../legal-shell';

export const metadata: Metadata = {
  title: 'ProERP Privacy Policy',
  description:
    'Privacy Policy for ProERP by WiseAdmit, including social media platform data use and deletion controls.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      description="This Privacy Policy explains how WiseAdmit collects, uses, shares, retains, and protects information when you use ProERP, including information received from connected social platforms such as TikTok, Facebook, Instagram, and WhatsApp."
    >
      <LegalSection title="Effective Date">
        <p>Effective and last updated: May 5, 2026.</p>
        <p>
          In this policy, "ProERP," "we," "us," and "our" mean the ProERP social
          media management service operated by WiseAdmit. "You" means the user,
          customer, workspace member, or organization using ProERP.
        </p>
      </LegalSection>

      <LegalSection title="Information We Collect">
        <LegalList
          items={[
            'Account information, such as name, email address, organization, workspace membership, role, authentication records, and support communications.',
            'Connected social account information authorized by you, including profile identifiers, display names, avatars, public profile links, bios, verified status, account statistics, page or business account identifiers, and access tokens or refresh tokens needed to operate integrations.',
            'Content and publishing information, including drafts, captions, media files, thumbnails, links, scheduled dates, post settings, privacy selections, upload status, publishing status, public video or post lists, and related platform response data.',
            'Engagement and business workflow information, including comments, messages, message delivery status, leads, forms, ads, audiences, commerce catalog information, reporting metrics, insights, and subscriptions when supported by the connected platform and authorized by you.',
            'Technical and security information, including IP address, device and browser data, log records, error events, authentication events, API request metadata, cookies, and similar technologies.',
            'Billing or transaction information if paid ProERP features are enabled, such as plan status, invoices, payment processor identifiers, and limited payment metadata. We do not store full payment card numbers when a third-party payment processor is used.',
          ]}
        />
      </LegalSection>

      <LegalSection title="How We Use Information">
        <p>
          ProERP uses social platform data only to provide requested features and
          maintain the security and reliability of the service. We use
          information to:
        </p>
        <LegalList
          items={[
            'Authenticate users and allow them to connect, manage, and disconnect social accounts.',
            'Display authorized profile, page, business, account, and workspace information inside ProERP.',
            'Create, schedule, upload, publish, or direct-post content when you request those actions.',
            'Retrieve and list videos, posts, comments, messages, leads, ads, audiences, commerce data, subscriptions, and statistics that you are authorized to manage.',
            'Provide analytics, reports, previews, inbox views, moderation workflows, content planning, and account management tools.',
            'Operate webhooks, troubleshoot failed posts, prevent abuse, monitor service health, maintain audit logs, and protect ProERP, users, and connected accounts.',
            'Respond to support, legal, privacy, security, and app review requests.',
          ]}
        />
      </LegalSection>

      <LegalSection title="TikTok, Facebook, Instagram, and WhatsApp Data">
        <p>
          When you connect TikTok, Facebook, Instagram, WhatsApp, or other social
          channels, ProERP receives only the data and permissions you authorize
          through the relevant platform. For TikTok, this may include basic user
          profile data, profile details, account statistics, public video lists,
          video uploads, and direct publishing permissions. For Meta products,
          this may include Facebook Page data, Instagram business data,
          comments, messages, leads, ads, insights, WhatsApp Business messages,
          and related business assets.
        </p>
        <p>
          ProERP does not sell social platform data. ProERP does not use social
          platform data for surveillance, eligibility decisions, or unrelated
          advertising profiles. ProERP does not share TikTok, Facebook,
          Instagram, or WhatsApp user data with third parties unless required to
          provide the service you requested, comply with law, protect security,
          or act with your consent.
        </p>
      </LegalSection>

      <LegalSection title="Feature and Permission Use">
        <p>
          ProERP maps each requested permission or credential to a specific app
          feature. We do not request these permissions for unrelated purposes.
        </p>
        <LegalList
          items={[
            'Facebook Page features use pages_show_list, business_management, pages_manage_posts, pages_manage_engagement, pages_read_engagement, and read_insights to list authorized Pages, publish posts, manage comments and engagement, and show Page/post analytics.',
            'Instagram Business features use instagram_basic, pages_show_list, pages_read_engagement, business_management, instagram_content_publish, instagram_manage_comments, instagram_manage_engagement, instagram_manage_insights, and catalog_management to connect Instagram Business accounts, publish content, manage comments, show insights, and support product catalog workflows.',
            'Facebook Inbox uses pages_show_list, business_management, pages_manage_metadata, pages_messaging, and pages_read_engagement to subscribe to Page messaging events, sync conversations, and send authorized replies.',
            'Instagram Inbox uses instagram_basic, instagram_manage_messages, pages_show_list, pages_manage_metadata, and business_management to sync Instagram conversations and send authorized replies.',
            'Facebook Ads uses business_management, ads_read, and ads_management to list ad accounts, show reports, and manage ad campaign workflows when authorized.',
            'WhatsApp Business uses whatsapp_business_management, whatsapp_business_messaging, Phone Number ID, and WhatsApp Business Account ID to sync conversations, send replies, manage message templates, and send media, interactive, template, broadcast, and product messages.',
            'TikTok creator features use user.info.basic, user.info.profile, user.info.stats, video.list, video.upload, and video.publish to connect TikTok accounts, display authorized profile and statistics, list public videos, upload drafts, and publish videos after user confirmation.',
            'TikTok Business uses a TikTok Business API access token, Advertiser ID, Business Account ID, and optional messaging bridge credentials for ads, reports, leads, business comments, catalogs, audiences, subscriptions, conversion events, identities, Spark Ads, and creative portfolio workflows.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies and Similar Technologies">
        <p>
          ProERP may use cookies, local storage, and similar technologies to keep
          you signed in, remember settings, protect sessions, measure service
          performance, diagnose errors, and improve the product. You can control
          cookies through your browser settings, but disabling some cookies may
          prevent ProERP from working correctly.
        </p>
      </LegalSection>

      <LegalSection title="How We Share Information">
        <LegalList
          items={[
            'With social platforms when you ask ProERP to connect an account, upload content, publish content, retrieve analytics, sync comments or messages, or otherwise use an integration.',
            'With service providers that help us host, secure, monitor, support, process payments for, or operate ProERP, under contractual obligations appropriate to their role.',
            'With workspace members according to the workspace permissions and features configured in ProERP.',
            'With authorities, platforms, or other parties when required by law, legal process, security obligations, platform rules, or to protect the rights, safety, and integrity of ProERP, WiseAdmit, users, or the public.',
            'In connection with a business transaction such as a merger, financing, acquisition, or sale of assets, subject to appropriate confidentiality and continuity protections.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          We retain information for as long as needed to provide ProERP, comply
          with law, resolve disputes, enforce agreements, maintain security, and
          support legitimate business operations. Social access tokens and
          integration records are retained while the integration remains
          connected or as needed for security and audit purposes. Drafts,
          scheduled posts, published post records, messages, comments, and
          analytics may remain in your workspace until deleted, disconnected, or
          removed under our retention processes.
        </p>
      </LegalSection>

      <LegalSection title="Your Controls and Choices">
        <LegalList
          items={[
            'Disconnect integrations in ProERP to stop future access for a connected social account.',
            'Revoke ProERP access directly in your TikTok, Facebook, Instagram, WhatsApp, or other platform account settings.',
            'Delete drafts, media, schedules, and workspace records available in the ProERP interface.',
            'Request access, correction, export, or deletion of ProERP account or workspace data by contacting WiseAdmit.',
            'Request deletion of social platform data received by ProERP through the Data Deletion Instructions page.',
          ]}
        />
        <p>
          See{' '}
          <Link href="/data-deletion" className="font-[700] text-[#1d4ed8]">
            Data Deletion Instructions
          </Link>{' '}
          for platform-specific deletion steps.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use administrative, technical, and organizational safeguards
          designed to protect ProERP data, including access controls, secured
          authentication, logging, and restricted handling of platform tokens.
          No internet service can guarantee perfect security. You are
          responsible for maintaining secure credentials and limiting workspace
          access to authorized users.
        </p>
      </LegalSection>

      <LegalSection title="International Use">
        <p>
          ProERP may process information in countries where WiseAdmit, hosting
          providers, support providers, or integration providers operate. By
          using ProERP, you understand that information may be transferred and
          processed outside your country, subject to applicable law and
          safeguards.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          ProERP is intended for business and professional use and is not
          directed to children. Users must be old enough to use ProERP and any
          connected social platform under applicable law and platform terms.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Platforms">
        <p>
          ProERP is not affiliated with, endorsed by, or sponsored by TikTok,
          Meta, Facebook, Instagram, WhatsApp, or other third-party social
          platforms. Those platforms process information under their own terms,
          privacy policies, and developer rules. You should review those
          documents before connecting an account or publishing content.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If changes are
          material, we will take reasonable steps to notify users through ProERP,
          email, or another appropriate method. Continued use of ProERP after an
          update means the revised policy applies going forward.
        </p>
      </LegalSection>

      <LegalSection title="Contact WiseAdmit">
        <p>
          For privacy questions, data requests, security concerns, or app review
          questions about ProERP, contact WiseAdmit at support@wiseadmit.io.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
