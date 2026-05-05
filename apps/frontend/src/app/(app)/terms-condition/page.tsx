import { Metadata } from 'next';
import { LegalShell, LegalSection, LegalList } from '../legal-shell';

export const metadata: Metadata = {
  title: 'WiseSocial Terms of Service',
  description:
    'Terms of Service for WiseSocial by WiseAdmit, including social posting, connected accounts, and platform compliance.',
};

export default function TermsConditionPage() {
  return (
    <LegalShell
      title="Terms of Service"
      description="These Terms of Service govern your access to and use of WiseSocial, the WiseAdmit social media management service for connecting social accounts, scheduling content, publishing posts, and managing social workflows."
    >
      <LegalSection title="Effective Date and Agreement">
        <p>Effective and last updated: May 5, 2026.</p>
        <p>
          These Terms are a binding agreement between you and WiseAdmit for use
          of WiseSocial. By accessing WiseSocial, creating an account, connecting a
          social platform, uploading content, scheduling posts, or using any
          WiseSocial feature, you agree to these Terms.
        </p>
      </LegalSection>

      <LegalSection title="The WiseSocial Service">
        <p>
          WiseSocial helps users and organizations manage social media workflows in
          one web application. Features may include account connection, social
          login, content creation, media upload, scheduling, direct publishing,
          draft upload, analytics, inbox workflows, comment management, lead
          syncing, ads and audience tools, commerce tools, and subscription or
          reporting features.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and Authorized Users">
        <LegalList
          items={[
            'You must provide accurate account, organization, and billing information.',
            'You are responsible for all activity under your WiseSocial account and workspace.',
            'You must keep login credentials secure and promptly notify WiseAdmit of unauthorized access.',
            'You may only connect social accounts, pages, business assets, ad accounts, WhatsApp Business accounts, and other channels that you are authorized to manage.',
            'If you use WiseSocial for an organization, you represent that you have authority to bind that organization to these Terms.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Connected Social Platforms">
        <p>
          WiseSocial integrates with third-party platforms such as TikTok, Meta,
          Facebook, Instagram, WhatsApp, and other social services. You must
          comply with all applicable third-party terms, community standards,
          developer rules, advertising policies, commerce policies, music usage
          rules, privacy rules, and content guidelines when using WiseSocial.
        </p>
        <p>
          WiseSocial is not affiliated with, endorsed by, or sponsored by TikTok,
          Meta, Facebook, Instagram, WhatsApp, or any other third-party social
          platform. Third-party platforms may change, suspend, restrict, or
          discontinue APIs, permissions, reviews, or account access at any time.
          WiseAdmit is not responsible for third-party platform decisions,
          outages, moderation actions, account restrictions, or API changes.
        </p>
      </LegalSection>

      <LegalSection title="Authorized Features and Permissions">
        <p>
          By connecting a platform account or entering platform credentials, you
          authorize WiseSocial to use the permissions required for the features you
          enable:
        </p>
        <LegalList
          items={[
            'Facebook Page permissions for listing Pages, publishing posts, reading and managing engagement, moderating comments, and viewing insights.',
            'Instagram Business permissions for account connection, content publishing, comment and engagement management, insights, and catalog or product workflows.',
            'Facebook and Instagram messaging permissions for webhook subscriptions, conversation sync, and replies sent by authorized workspace users.',
            'Facebook Ads permissions for ad account discovery, campaign management, reporting, and related ads workflows.',
            'WhatsApp Business permissions and credentials for conversation sync, replies, templates, broadcast, rich media, interactive messages, and product messages.',
            'TikTok creator permissions for Login Kit, profile display, account statistics, public video listing, video draft upload, and direct publishing.',
            'TikTok Business credentials for ads, reporting, leads, comments, catalogs, audiences, subscriptions, conversion events, identities, Spark Ads, and creative portfolio workflows.',
          ]}
        />
        <p>
          You must only grant WiseSocial access to accounts, Pages, businesses,
          advertisers, catalogs, phone numbers, and profiles that you are
          authorized to manage.
        </p>
      </LegalSection>

      <LegalSection title="Content and Publishing Responsibilities">
        <LegalList
          items={[
            'You are solely responsible for all text, images, videos, audio, captions, links, metadata, advertising material, messages, replies, and other content that you create, upload, schedule, publish, or manage through WiseSocial.',
            'You must have all rights, licenses, consents, releases, and permissions required for content you upload or publish, including music, likeness, trademark, copyright, privacy, publicity, and advertising rights.',
            'You must review content, publishing settings, privacy settings, targeting, timing, account selection, and platform-specific disclosures before publishing.',
            'For TikTok direct posting, you must comply with TikTok content posting requirements, including privacy selection, interaction settings, music usage confirmations, creator consent, and any audit or platform review requirements that apply.',
            'For Facebook, Instagram, WhatsApp, and Meta business features, you must comply with Meta Platform Terms, Developer Policies, Community Standards, Advertising Standards, Commerce Policies, messaging rules, and data deletion obligations.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>You may not use WiseSocial to:</p>
        <LegalList
          items={[
            'Violate law, third-party rights, platform terms, or WiseAdmit policies.',
            'Post illegal, deceptive, harmful, hateful, adult, exploitative, infringing, spammy, or malicious content.',
            'Misrepresent identity, affiliation, endorsements, sponsorships, metrics, or source of content.',
            'Scrape, sell, rent, transfer, or misuse social platform data except as permitted by the relevant platform and the user who authorized access.',
            'Build surveillance tools, eligibility scoring, discriminatory targeting, or unrelated advertising profiles from social platform data.',
            'Interfere with WiseSocial security, abuse APIs, bypass rate limits, introduce malware, or attempt unauthorized access.',
            'Use browser extensions, automation, or integration workarounds in ways that violate a platform terms of service.',
          ]}
        />
      </LegalSection>

      <LegalSection title="User Content License">
        <p>
          You retain ownership of your content. You grant WiseAdmit a limited,
          worldwide, non-exclusive license to host, store, process, reproduce,
          transmit, display, and modify your content only as needed to operate
          WiseSocial, provide requested features, publish or upload content to
          connected platforms, create previews, provide support, secure the
          service, and comply with law.
        </p>
      </LegalSection>

      <LegalSection title="Privacy and Data Deletion">
        <p>
          WiseAdmit processes information as described in the WiseSocial Privacy
          Policy. You may disconnect integrations, revoke platform access,
          request account or workspace deletion, and request deletion of social
          platform data as described in the Privacy Policy and Data Deletion
          Instructions.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions, Fees, and Taxes">
        <p>
          Some WiseSocial features may require a paid plan. If you purchase a paid
          feature, you authorize WiseAdmit or its payment processor to charge
          applicable fees and taxes according to the plan and billing terms shown
          at purchase. Fees are non-refundable except where required by law or
          expressly stated in writing. You are responsible for keeping billing
          information current.
        </p>
      </LegalSection>

      <LegalSection title="Service Changes and Availability">
        <p>
          WiseAdmit may modify, suspend, or discontinue features to improve
          WiseSocial, maintain security, comply with law, respond to platform API
          changes, or address operational needs. We work to keep WiseSocial
          reliable, but we do not guarantee uninterrupted, error-free, or
          platform-approved operation.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers">
        <p>
          WiseSocial is provided on an "as is" and "as available" basis to the
          fullest extent permitted by law. WiseAdmit disclaims warranties of
          merchantability, fitness for a particular purpose, non-infringement,
          uninterrupted operation, error-free operation, approval by any
          third-party platform, or any specific business result.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, WiseAdmit will not be liable
          for indirect, incidental, special, consequential, exemplary, or punitive
          damages, including lost profits, lost revenue, lost data, loss of
          goodwill, account suspension, content removal, failed publishing,
          platform restrictions, or business interruption. WiseAdmit aggregate
          liability for claims relating to WiseSocial will not exceed the amount you
          paid to WiseAdmit for WiseSocial in the three months before the event
          giving rise to the claim, or USD 100 if you did not pay WiseAdmit.
        </p>
      </LegalSection>

      <LegalSection title="Indemnification">
        <p>
          You will defend, indemnify, and hold harmless WiseAdmit from claims,
          damages, liabilities, losses, costs, and expenses arising from your
          content, your connected accounts, your use of WiseSocial, your violation
          of these Terms, your violation of platform rules, or your violation of
          law or third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using WiseSocial at any time. WiseAdmit may suspend or
          terminate access if you violate these Terms, create risk, fail to pay
          applicable fees, misuse platform data, infringe rights, or if continued
          access would violate law or third-party platform rules. After
          termination, some provisions will survive, including ownership,
          payment obligations, disclaimers, limitation of liability,
          indemnification, and dispute provisions.
        </p>
      </LegalSection>

      <LegalSection title="Governing Law and Disputes">
        <p>
          These Terms are governed by the laws applicable to WiseAdmit, without
          regard to conflict of laws rules. You and WiseAdmit will first attempt
          to resolve disputes informally by contacting ayush@wiseadmit.io or info@wiseadmit.io. If
          a dispute cannot be resolved informally, it may be handled in the
          courts or forum with jurisdiction over WiseAdmit, unless applicable law
          requires a different venue.
        </p>
      </LegalSection>

      <LegalSection title="Changes to These Terms">
        <p>
          WiseAdmit may update these Terms from time to time. If changes are
          material, we will take reasonable steps to notify users. Continued use
          of WiseSocial after updated Terms become effective means you accept the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact WiseAdmit">
        <p>
          For legal, privacy, platform review, or support questions about
          WiseSocial, contact WiseAdmit at ayush@wiseadmit.io or info@wiseadmit.io.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
