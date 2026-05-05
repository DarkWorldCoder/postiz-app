import Link from 'next/link';
import { Metadata } from 'next';
import { LegalShell, LegalSection, LegalList } from './legal-shell';

export const metadata: Metadata = {
  title: 'WiseSocial Social Media Management',
  description:
    'WiseSocial by WiseAdmit helps teams connect social accounts, schedule content, publish posts, and review social performance.',
};

export default function ProerpOverviewPage() {
  return (
    <LegalShell
      title="WiseSocial social media management"
      description="WiseSocial is a WiseAdmit web application for managing connected social channels in one place. Teams use WiseSocial to connect Facebook, Instagram, TikTok, WhatsApp, and other supported accounts, prepare content, schedule posts, publish videos, review analytics, and manage social engagement workflows."
    >
      <div className="grid gap-[24px] lg:grid-cols-[1fr_320px]">
        <div>
          <LegalSection title="What WiseSocial Does">
            <LegalList
              items={[
                'Connect authorized social accounts through official platform login and API flows.',
                'Create, schedule, upload, and publish content to supported social channels when the user requests it.',
                'Show account profile information, post history, public video lists, metrics, comments, messages, leads, ads, audiences, commerce data, and subscription-related social data where supported by the connected platform.',
                'Give users controls to disconnect integrations, manage account settings, and request deletion of WiseSocial account or workspace data.',
              ]}
            />
          </LegalSection>

          <LegalSection title="App Features and Permissions">
            <p>
              WiseSocial requests only the permissions needed for the connected
              features a user chooses to enable. The review-critical permissions
              used by the WiseSocial social app are:
            </p>
            <div className="overflow-x-auto rounded-[8px] border border-[#d9dee8] bg-white">
              <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
                <thead className="bg-[#f1f5f9] text-[#0f172a]">
                  <tr>
                    <th className="border-b border-[#d9dee8] p-[12px]">
                      Feature
                    </th>
                    <th className="border-b border-[#d9dee8] p-[12px]">
                      Platform permissions or credentials
                    </th>
                    <th className="border-b border-[#d9dee8] p-[12px]">
                      Why WiseSocial uses them
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#334155]">
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Facebook Page publishing, comments, and insights
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      pages_show_list, business_management, pages_manage_posts,
                      pages_manage_engagement, pages_read_engagement,
                      read_insights
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      List authorized Pages, publish and manage posts, moderate
                      comments, and show Page/post performance.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Instagram Business publishing, comments, insights, and
                      commerce
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      instagram_basic, pages_show_list, pages_read_engagement,
                      business_management, instagram_content_publish,
                      instagram_manage_comments, instagram_manage_engagement,
                      instagram_manage_insights, catalog_management
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Connect Instagram Business accounts, publish content,
                      manage engagement, view analytics, and support product
                      catalog workflows.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Facebook and Instagram inbox
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      pages_manage_metadata, pages_messaging,
                      instagram_manage_messages, pages_show_list,
                      business_management, instagram_basic
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Subscribe to webhook events, sync conversations, and allow
                      authorized workspace users to reply from WiseSocial.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Facebook Ads
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      business_management, ads_read, ads_management
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      List ad accounts, sync reports, and manage ad campaign
                      workflows when authorized.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      WhatsApp Business
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      whatsapp_business_management,
                      whatsapp_business_messaging, Phone Number ID, WhatsApp
                      Business Account ID
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Sync and reply to conversations, manage templates, send
                      media, interactive, template, broadcast, and product
                      messages.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      TikTok creator publishing and analytics
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      user.info.basic, user.info.profile, user.info.stats,
                      video.list, video.upload, video.publish
                    </td>
                    <td className="border-b border-[#e5e7eb] p-[12px]">
                      Connect a TikTok account, display authorized profile and
                      stats, list public videos, upload drafts, and publish
                      videos when the user confirms.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-[12px]">TikTok Business</td>
                    <td className="p-[12px]">
                      TikTok Business API access token, Advertiser ID, Business
                      Account ID, optional messaging bridge credentials
                    </td>
                    <td className="p-[12px]">
                      Support ads, reports, leads, business comments, catalogs,
                      audiences, subscriptions, conversion events, identities,
                      Spark Ads, and creative portfolio workflows.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LegalSection>

          <LegalSection title="Reviewer Information">
            <p>
              WiseSocial is a web application hosted at{' '}
              <span className="font-[700]">social.wiseadmit.io</span>. Demo
              videos for TikTok, Facebook, Instagram, and related platform
              reviews should show this same website and the exact product flows
              being requested for review.
            </p>
            <p>
              WiseSocial is operated by WiseAdmit. WiseSocial is not affiliated with,
              endorsed by, or sponsored by TikTok, Meta, Facebook, Instagram,
              WhatsApp, or any other third-party social platform.
            </p>
          </LegalSection>
        </div>

        <aside className="h-fit rounded-[8px] border border-[#d9dee8] bg-white p-[20px]">
          <h2 className="text-[18px] font-[700] text-[#0f172a]">
            Legal links
          </h2>
          <div className="mt-[14px] flex flex-col gap-[10px] text-[15px] font-[600]">
            <Link
              href="/privacy-policy"
              className="rounded-[6px] border border-[#d9dee8] px-[12px] py-[10px] text-[#1d4ed8] hover:bg-[#f1f5f9]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-condition"
              className="rounded-[6px] border border-[#d9dee8] px-[12px] py-[10px] text-[#1d4ed8] hover:bg-[#f1f5f9]"
            >
              Terms of Service
            </Link>
            <Link
              href="/data-deletion"
              className="rounded-[6px] border border-[#d9dee8] px-[12px] py-[10px] text-[#1d4ed8] hover:bg-[#f1f5f9]"
            >
              Data Deletion Instructions
            </Link>
          </div>
          <p className="mt-[16px] text-[13px] leading-[1.6] text-[#64748b]">
            Contact WiseAdmit for privacy, security, or app review questions at
            ayush@wiseadmit.io or info@wiseadmit.io.
          </p>
        </aside>
      </div>
    </LegalShell>
  );
}
