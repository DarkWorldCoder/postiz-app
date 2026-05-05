# WiseSocial Social API Setup

Use this checklist for `https://social.wiseadmit.io`. Keep all tokens in `.env` only.

## App review identity

Use one public brand and one public domain across TikTok, Meta, demo videos, and the live web app.

```text
App name: WiseSocial
Operator: WiseAdmit
Website URL: https://social.wiseadmit.io/
Terms of Service URL: https://social.wiseadmit.io/terms-condition
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Data Deletion URL: https://social.wiseadmit.io/data-deletion
```

The website URL must not redirect reviewers to a login page. The Privacy Policy and Terms of Service links must be visible on the website URL without opening a menu.

For TikTok review, the demo video must show `https://social.wiseadmit.io/` and the end-to-end flow inside WiseSocial. Do not upload a demo from `wiseadmit.io`, `postiz.com`, localhost, or any other domain unless the submitted Website URL is changed to that same domain.

## WiseSocial app features and required permissions

Use this map when completing app review notes. Only request products, scopes, or credentials for features that are enabled and demonstrated in WiseSocial.

| WiseSocial feature | Product or integration | Permissions, scopes, or credentials | Why WiseSocial needs it |
| --- | --- | --- | --- |
| Facebook Page publishing, comments, and insights | Meta Graph API | `pages_show_list`, `business_management`, `pages_manage_posts`, `pages_manage_engagement`, `pages_read_engagement`, `read_insights` | List authorized Pages, publish posts, manage engagement/comments, and show Page/post analytics. |
| Instagram Business publishing, comments, insights, and commerce | Instagram Graph API through Meta | `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_engagement`, `instagram_manage_insights`, `catalog_management` | Connect Instagram Business accounts, publish content, manage comments/engagement, show insights, and support catalog/product workflows. |
| Facebook Inbox | Messenger Platform / Meta webhooks | `pages_show_list`, `business_management`, `pages_manage_metadata`, `pages_messaging`, `pages_read_engagement` | Subscribe to Page messaging events, sync conversations, and send authorized replies from WiseSocial. |
| Instagram Inbox | Instagram Messaging / Meta webhooks | `instagram_basic`, `instagram_manage_messages`, `pages_show_list`, `pages_manage_metadata`, `business_management` | Sync Instagram conversations and send authorized replies from WiseSocial. |
| Facebook Ads | Marketing API | `business_management`, `ads_read`, `ads_management` | List ad accounts, show reports, create/update campaign workflows, and manage authorized ad assets. |
| WhatsApp Business Inbox and messaging | WhatsApp Cloud API | `whatsapp_business_management`, `whatsapp_business_messaging`, Permanent Access Token, Phone Number ID, WhatsApp Business Account ID | Sync conversations, reply to users, manage templates, and send media, interactive, template, broadcast, and product messages. |
| TikTok creator login, video listing, upload, and publishing | TikTok Login Kit and Content Posting API | `user.info.basic`, `user.info.profile`, `user.info.stats`, `video.list`, `video.upload`, `video.publish` | Connect TikTok accounts, display authorized profile/stats, list public videos, upload drafts, and publish videos after user confirmation. |
| TikTok Business ads, leads, catalogs, audiences, subscriptions, comments, and reporting | TikTok API for Business | TikTok Business API Access Token, Advertiser ID, Business Account ID, optional WiseSocial messaging bridge URL/API key | Manage business reporting, ads, leads, business comments, catalogs, audiences, subscriptions, conversion events, identities, Spark Ads, and creative portfolio workflows. |

Do not request TikTok Share Kit for WiseSocial unless a native mobile app using TikTok's mobile SDK is submitted separately.

## Production environment

```env
FRONTEND_URL="https://social.wiseadmit.io"
MAIN_URL="https://social.wiseadmit.io"
NEXT_PUBLIC_BACKEND_URL="https://social.wiseadmit.io/api"
BACKEND_URL="https://social.wiseadmit.io/api"
BACKEND_INTERNAL_URL="http://localhost:3000"

FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
FACEBOOK_WEBHOOK_VERIFY_TOKEN=""
FACEBOOK_WEBHOOK_APP_SECRET=""
META_GRAPH_API_VERSION="v25.0"

TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""
TIKTOK_BUSINESS_API_BASE="https://business-api.tiktok.com/open_api/v1.3"
WISESOCIAL_TIKTOK_MESSAGING_BASE_URL=""
WISESOCIAL_TIKTOK_MESSAGING_API_KEY=""
```

After changing env values on the server:

```bash
docker compose up -d --build --force-recreate postiz
```

## Meta app

Create a Meta Business app in Meta for Developers. Add Facebook Login for Business, Webhooks, Messenger, WhatsApp, and Marketing API.

App domain:

```text
social.wiseadmit.io
```

Valid OAuth redirect URIs:

```text
https://social.wiseadmit.io/integrations/social/facebook
https://social.wiseadmit.io/integrations/social/instagram
https://social.wiseadmit.io/integrations/social/facebook-ads
https://social.wiseadmit.io/integrations/social/facebook-messages
https://social.wiseadmit.io/integrations/social/instagram-messages
```

Request advanced access for:

```text
pages_show_list
business_management
pages_manage_posts
pages_manage_engagement
pages_read_engagement
read_insights
pages_manage_metadata
pages_messaging
instagram_basic
instagram_content_publish
instagram_manage_comments
instagram_manage_engagement
instagram_manage_insights
instagram_manage_messages
catalog_management
ads_read
ads_management
whatsapp_business_management
whatsapp_business_messaging
```

Business requirements:

- Business verification completed.
- App is in Live mode after testing.
- Privacy Policy URL, Terms URL, and Data Deletion URL are configured with the WiseSocial URLs listed above.
- Facebook Page is owned by or assigned to the Business.
- Instagram account is Professional/Business and connected to the Facebook Page.
- Ad account is assigned to the Business and to the connecting user.
- Catalog is assigned if Commerce features are used.
- WhatsApp Business Account and phone number are assigned to the Business.

## Meta webhooks

Callback URL:

```text
https://social.wiseadmit.io/api/webhooks/meta
```

Verify token:

```text
FACEBOOK_WEBHOOK_VERIFY_TOKEN
```

Page/Messenger fields:

```text
messages
messaging_postbacks
messaging_optins
message_deliveries
message_reads
leadgen
```

WhatsApp Business Account field:

```text
messages
```

Quick verification test:

```bash
curl "https://social.wiseadmit.io/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=ok"
```

It should return:

```text
ok
```

## WhatsApp Business

In Meta Business settings:

1. Create or connect a WhatsApp Business Account.
2. Add and verify the phone number.
3. Create a System User.
4. Assign the WhatsApp account and phone number to the System User.
5. Generate a permanent token with `whatsapp_business_management` and `whatsapp_business_messaging`.
6. In WiseSocial, add WhatsApp Business with:

```text
Permanent Access Token
Phone Number ID
WhatsApp Business Account ID
```

Inbound WhatsApp messages are handled by `https://social.wiseadmit.io/api/webhooks/meta`.

## TikTok organic

Create an app in TikTok for Developers. Add Login Kit and Content Posting API only.

Do not select Share Kit for this web app. TikTok Share Kit is for mobile SDK/share-sheet flows, and reviewers have asked that it be removed.

Basic information:

```text
App name: WiseSocial
Category: Business
Description: Manage and publish social content in one place. WiseSocial helps teams create, schedule, upload, publish, and review posts.
Website URL: https://social.wiseadmit.io/
Terms of Service URL: https://social.wiseadmit.io/terms-condition
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Platform: Web
```

Redirect URI:

```text
https://social.wiseadmit.io/integrations/social/tiktok
```

Products:

```text
Login Kit
Content Posting API
```

Scopes:

```text
video.list
user.info.basic
video.publish
video.upload
user.info.profile
user.info.stats
```

Reviewer explanation:

```text
This revision updates WiseSocial's public Website URL, Privacy Policy, and Terms of Service so they are hosted on the same domain as the WiseSocial web app: https://social.wiseadmit.io/. The Privacy Policy and Terms of Service now explicitly name WiseSocial and WiseAdmit and describe how WiseSocial uses TikTok data for login, account display, video listing, uploading, direct posting, analytics, security, retention, and deletion controls.

Login Kit is used to let TikTok users authorize and connect their TikTok account to WiseSocial. WiseSocial uses user.info.basic to show the connected account identity, user.info.profile to show profile details authorized by the user, and user.info.stats to display account-level statistics inside WiseSocial.

Content Posting API is used only when the authorized user chooses to upload or publish TikTok content through WiseSocial. WiseSocial uses video.upload to upload content as a TikTok draft for creator review, video.publish to directly publish content after the user confirms the publishing settings, and video.list to display the user's public TikTok videos in WiseSocial.

Share Kit has been removed because WiseSocial is a web app and does not use the TikTok mobile SDK or mobile share sheet.
```

Set:

```env
TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""
```

## TikTok Business

Create or connect a TikTok Business Center and Ads Manager account. Get an API for Business access token with Marketing API access.

In WiseSocial, add TikTok Business with:

```text
Access Token
Advertiser ID
Business Account ID
```

TikTok Business API base:

```env
TIKTOK_BUSINESS_API_BASE="https://business-api.tiktok.com/open_api/v1.3"
```

TikTok subscription callback:

```text
https://social.wiseadmit.io/api/webhooks/tiktok
```

TikTok Business Messaging needs a messaging bridge:

```env
WISESOCIAL_TIKTOK_MESSAGING_BASE_URL=""
WISESOCIAL_TIKTOK_MESSAGING_API_KEY=""
```

Ads, audiences, subscriptions, and reporting can work with the TikTok Business API token. Inbox messaging will only work when the messaging bridge is configured.

## Final test pass

1. Add Facebook Page.
2. Add Instagram Business.
3. Add Facebook Ads.
4. Add Facebook Inbox.
5. Add Instagram Inbox.
6. Add WhatsApp Business.
7. Add TikTok.
8. Add TikTok Business.
9. Send a Facebook message, Instagram message, WhatsApp message, test lead, and test ad sync.
10. Check WiseSocial Inbox, Comments, Leads, Ads, Commerce, Audiences, Ideas, and Subscriptions pages.

Official references:

- https://developers.facebook.com/docs/graph-api/webhooks/
- https://developers.facebook.com/docs/messenger-platform/webhooks
- https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- https://developers.facebook.com/docs/marketing-apis/
- https://developers.tiktok.com/doc/login-kit-web/
- https://developers.tiktok.com/doc/content-posting-api-get-started/
- https://business-api.tiktok.com/portal/docs
