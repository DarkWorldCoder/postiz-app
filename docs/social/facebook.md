# WiseSocial Facebook Page and Ads Setup

This guide covers Facebook Page publishing, comments, insights, Ads, lead forms, and Meta review requirements.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
OAuth redirect URI: https://social.wiseadmit.io/integrations/social/facebook
OAuth redirect URI for ads: https://social.wiseadmit.io/integrations/social/facebook-ads
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Environment Variables

```env
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_WEBHOOK_VERIFY_TOKEN=""
FACEBOOK_WEBHOOK_APP_SECRET=""
META_GRAPH_API_VERSION="v25.0"
```

## Meta Business Assets

1. Create or select the WiseAdmit Meta Business portfolio.
2. Complete Business verification.
3. Add the Facebook Page to the Business portfolio.
4. Assign the connecting admin user to the Page with full control or the required task access.
5. Add the Facebook Ad Account to the same Business portfolio if Ads are enabled.
6. Assign the connecting admin user and any System User to the Ad Account.
7. Add a payment method to the Ad Account if campaign creation or activation is used.
8. Create/select a Meta Pixel or dataset if conversion or pixel reporting features are used.
9. Create/select Facebook Lead Forms if WiseSocial Leads is enabled.

## Meta Developer App Setup

1. Create a Meta app with app type `Business`.
2. Set app display name to `WiseSocial`.
3. Set app contact email to `ayush@wiseadmit.io` or `info@wiseadmit.io`.
4. Add app domain:

```text
social.wiseadmit.io
```

5. Add Facebook Login for Business.
6. Add Marketing API if Ads or Leads are enabled.
7. Add Webhooks if comments, Messenger, leads, or real-time events are enabled.
8. Configure valid OAuth redirect URIs:

```text
https://social.wiseadmit.io/integrations/social/facebook
https://social.wiseadmit.io/integrations/social/facebook-ads
```

## Facebook Page Permissions

Request these only if Facebook Page publishing/comments/analytics are enabled:

```text
pages_show_list
business_management
pages_manage_posts
pages_manage_engagement
pages_read_engagement
read_insights
```

WiseSocial usage:

- `pages_show_list`: list Pages the user can manage.
- `business_management`: access Business-owned or client Pages.
- `pages_manage_posts`: publish Page feed/video posts.
- `pages_manage_engagement`: reply to, hide, delete, and manage comments.
- `pages_read_engagement`: read Page posts, comments, engagement, and metadata.
- `read_insights`: show Page and post analytics.

## Facebook Ads and Leads Permissions

Request these only if WiseSocial Ads, reporting, campaign management, leads, pixels, or audiences are enabled:

```text
business_management
ads_read
ads_management
```

WiseSocial usage:

- `business_management`: discover Business-owned ad accounts and related assets.
- `ads_read`: read ad accounts, campaigns, ad sets, ads, lead forms, leads, pixels, reports, and performance insights.
- `ads_management`: create, update, pause, and manage campaign workflows, audiences, ad sets, ads, rules, and experiments.

## Webhooks

Callback URL:

```text
https://social.wiseadmit.io/api/webhooks/meta
```

Verify token:

```text
FACEBOOK_WEBHOOK_VERIFY_TOKEN
```

Page fields for Facebook leads and messaging:

```text
messages
messaging_postbacks
messaging_optins
message_deliveries
message_reads
leadgen
```

WiseSocial processes `leadgen` webhooks by receiving the lead ID, then fetching the full lead through the authorized integration.

## WiseSocial Setup

Facebook Page:

1. Open WiseSocial.
2. Add `Facebook Page`.
3. Complete Facebook Login for Business.
4. Select the Page.
5. Publish or schedule a test Page post.
6. Open WiseSocial Comments and load comments for that post.
7. Open analytics and confirm Page/post metrics load.

Facebook Ads:

1. Open WiseSocial.
2. Add `Facebook Ads`.
3. Complete Facebook Login for Business.
4. Select the Ad Account.
5. Open WiseSocial Ads and confirm campaigns load.
6. Open reporting and confirm spend/impressions/click metrics load.
7. If `ads_management` is requested, create or update a paused test campaign.
8. For leads, submit a test lead and confirm it appears in WiseSocial Leads.

## App Review Demo

Show these in the review video:

1. Public `https://social.wiseadmit.io/` website with Privacy Policy and Terms links.
2. WiseSocial login.
3. Add Facebook Page.
4. Facebook Login permission screen.
5. Page selection.
6. Post creation/scheduling.
7. Comments loading and one moderation action if requested.
8. Analytics screen if `read_insights` is requested.
9. Add Facebook Ads.
10. Ad Account selection.
11. Campaign list/reporting.
12. Campaign create/update only if `ads_management` is requested.
13. Lead form/test lead flow if lead features are requested.

## Review Notes Template

```text
WiseSocial uses Facebook Page permissions so business users can connect authorized Pages, publish/schedule Page posts, manage comments, and view Page/post analytics. WiseSocial uses Marketing API permissions only for Ad Accounts selected by the authorized user, so users can view campaign reporting, manage campaign workflows, and sync lead form data. WiseSocial does not sell Meta data and provides public Privacy Policy, Terms, and Data Deletion pages at https://social.wiseadmit.io/.
```
