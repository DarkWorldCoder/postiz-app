# WiseSocial Social API Setup

Use this checklist for `https://social.wiseadmit.io`. Keep all tokens in `.env` only.

Separate platform setup docs:

- [Facebook Page and Ads](./social/facebook.md)
- [Instagram Business](./social/instagram.md)
- [Messenger and Instagram Inbox](./social/messenger.md)
- [WhatsApp Business](./social/whatsapp.md)
- [Reddit](./social/reddit.md)
- [TikTok](./social/tiktok.md)

## App review identity

Use one public brand and one public domain across TikTok, Meta, demo videos, and the live web app.

```text
App name: WiseSocial
Operator: WiseAdmit
Website URL: https://social.wiseadmit.io/
Terms of Service URL: https://social.wiseadmit.io/terms-condition
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Data Deletion URL: https://social.wiseadmit.io/data-deletion
App icon: apps/frontend/public/wisesocial.png
Browser favicon URL: https://social.wiseadmit.io/wisesocial.png
```

The website URL must not redirect reviewers to a login page. The Privacy Policy and Terms of Service links must be visible on the website URL without opening a menu.

The same `wisesocial.png` icon must be used in TikTok Basic Info, the browser tab favicon, and the header/top area of the Privacy Policy and Terms of Service pages.

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

## Meta Business setup checklist

Do this in Meta Business Suite / Business Settings before submitting any Facebook, Instagram, WhatsApp, Ads, Messenger, or Lead permissions for review.

1. Create or select one Meta Business portfolio for WiseAdmit.
2. Complete Business verification with the legal business name, address, phone, website, and supporting documents.
3. Add the Facebook Page that WiseSocial will manage.
4. Assign the connecting admin user to the Page with full control or the required task access.
5. Connect the Instagram Professional account to the Facebook Page:
   - Instagram account must be Business or Creator, not personal.
   - In Page settings or Meta Business Suite, confirm the Page shows the connected Instagram account.
   - In Instagram, confirm the profile is connected to the same Page.
6. Add the Facebook Ad Account to the Business portfolio.
7. Assign the connecting admin user and any System User to the Ad Account.
8. Add a payment method to the Ad Account if you need ad creation or active campaign management.
9. Add or create a Meta Pixel / dataset if Conversion API or pixel reporting features are used.
10. Add or create a Commerce Catalog if Instagram product/catalog features are used.
11. Add or create a WhatsApp Business Account (WABA).
12. Add and verify the WhatsApp phone number.
13. Make sure all assets are owned by or shared with the same Business portfolio:
    - Facebook Page
    - Instagram Business account
    - Ad Account
    - Pixel / dataset
    - Catalog
    - WhatsApp Business Account
    - WhatsApp phone number

## Meta Developer app setup

In Meta for Developers:

1. Create an app with app type `Business`.
2. Set the app display name to `WiseSocial`.
3. Set app contact email to `ayush@wiseadmit.io` or `info@wiseadmit.io`.
4. Add the app domain:

```text
social.wiseadmit.io
```

5. Set the public URLs:

```text
Website URL: https://social.wiseadmit.io/
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms of Service URL: https://social.wiseadmit.io/terms-condition
User Data Deletion URL: https://social.wiseadmit.io/data-deletion
```

6. Add the Business portfolio that owns the Page, Instagram account, Ad Account, Catalog, Pixel, and WhatsApp assets.
7. Add these app products / use cases as needed:

| WiseSocial feature | Meta product or use case to configure | Required before review |
| --- | --- | --- |
| Facebook Page publishing | Facebook Login for Business, Graph API | Valid OAuth redirect URI, Page selector flow, Page access token. |
| Facebook comments and insights | Facebook Login for Business, Graph API | Page selected in WiseSocial, Page access token, analytics/comments screens. |
| Facebook Inbox | Messenger, Webhooks | Page subscribed to messaging webhooks after connection. |
| Instagram publishing | Instagram Graph API through Facebook Login for Business | Instagram Business account connected to selected Page. |
| Instagram comments, insights, catalogs | Instagram Graph API, Catalog/Commerce assets | IG Business account, Page access, Catalog assigned to Business. |
| Instagram Inbox | Messenger / Instagram Messaging, Webhooks | Connected IG account and Page subscribed to messaging webhooks. |
| Facebook Ads | Marketing API | Ad Account assigned to Business and connecting user. |
| Lead forms | Marketing API and Webhooks | Lead forms on Page/Ad Account, `leadgen` webhook field. |
| WhatsApp Business | WhatsApp product / Cloud API, Webhooks | WABA, verified phone number, System User token, `messages` webhook field. |

## Facebook Login for Business setup

Configure OAuth so WiseSocial can connect Page, Instagram, Ads, and Inbox accounts.

1. In the Meta app dashboard, open Facebook Login for Business.
2. Add the valid OAuth redirect URIs:

```text
https://social.wiseadmit.io/integrations/social/facebook
https://social.wiseadmit.io/integrations/social/instagram
https://social.wiseadmit.io/integrations/social/facebook-ads
https://social.wiseadmit.io/integrations/social/facebook-messages
https://social.wiseadmit.io/integrations/social/instagram-messages
```

3. Enable Client OAuth Login and Web OAuth Login.
4. Keep Strict Mode for redirect URIs enabled once the exact URLs above are configured.
5. In App Review, request Advanced Access only for permissions used by enabled WiseSocial features.
6. Add test users, app roles, or business assets so reviewers can log in and see the complete flow.

Reviewers must be able to see this flow in the demo:

1. Open `https://social.wiseadmit.io/`.
2. Sign in to WiseSocial.
3. Open Add Channel / Integrations.
4. Choose the exact provider being reviewed.
5. Click Connect and complete Facebook Login for Business.
6. Show the permission screen.
7. Show the Page, Instagram account, Ad Account, or WhatsApp asset selection.
8. Finish connection and show the feature screen that uses the permission.

## Facebook Page features

Use this when setting up Facebook Page publishing, comments, and analytics.

Required Business assets:

- Facebook Page owned by or assigned to the Business portfolio.
- Connecting user has Page task access or full control.
- App has Advanced Access for the Page permissions below.

Permissions:

```text
pages_show_list
business_management
pages_manage_posts
pages_manage_engagement
pages_read_engagement
read_insights
```

WiseSocial use:

- `pages_show_list`: list Pages the user can manage so they can select the correct Page.
- `business_management`: access Pages owned by or assigned to the Business portfolio.
- `pages_manage_posts`: create and publish Page feed/video posts.
- `pages_manage_engagement`: reply to, hide, delete, and manage Page comments.
- `pages_read_engagement`: read Page posts, engagement, comments, and Page metadata.
- `read_insights`: show Page and post analytics in WiseSocial.

WiseSocial setup:

1. In WiseSocial, add `Facebook Page`.
2. Authorize Facebook Login for Business.
3. Select the Page.
4. Publish a test text/image/video post.
5. Open WiseSocial Comments and fetch comments for the post.
6. Open analytics and confirm Page/post metrics load.

Meta review demo must show:

- Page selection after login.
- A Page post being created or scheduled.
- A comment being loaded and, if requested, replied to/hidden/deleted.
- Insights/analytics screen using real or test Page data.

## Instagram Business features

Use this when setting up Instagram publishing, comments, insights, product/catalog workflows, and location/product search.

Required Business assets:

- Instagram Professional account converted to Business or Creator.
- Instagram account connected to a Facebook Page.
- Facebook Page assigned to the Business portfolio.
- Connecting user has access to the Page and Instagram account.
- Catalog assigned to the Business portfolio if product workflows are enabled.

Permissions:

```text
instagram_basic
pages_show_list
pages_read_engagement
business_management
instagram_content_publish
instagram_manage_comments
instagram_manage_engagement
instagram_manage_insights
catalog_management
```

WiseSocial use:

- `instagram_basic`: identify and display the connected Instagram Business account.
- `pages_show_list`: list Pages that have connected Instagram accounts.
- `pages_read_engagement`: read connected Page/IG relationship data needed to resolve the Instagram account.
- `business_management`: access Business-owned or client Instagram/Page/catalog assets.
- `instagram_content_publish`: publish Instagram feed posts, reels, stories, and carousel content.
- `instagram_manage_comments`: read, reply to, hide, delete, and manage comments on Instagram media.
- `instagram_manage_engagement`: manage engagement actions supported by the Instagram Graph API.
- `instagram_manage_insights`: show Instagram account and media insights.
- `catalog_management`: list catalogs/products and support commerce/product workflows.

WiseSocial setup:

1. In Meta Business Suite, connect Instagram to the Facebook Page.
2. In WiseSocial, add `Instagram (Facebook Business)`.
3. Authorize Facebook Login for Business.
4. Select the Page that contains the connected Instagram Business account.
5. Confirm WiseSocial shows the Instagram account name/avatar.
6. Publish a test post/reel/story or schedule one.
7. Open Comments, Analytics, Commerce, or product search features that match the requested permissions.

Meta review demo must show:

- The Instagram Business account is connected to the selected Facebook Page.
- The Instagram account appears in WiseSocial after OAuth.
- Publishing uses the Instagram account, not a personal profile.
- Comments/insights/catalog screens if those permissions are requested.

## Facebook and Instagram Inbox setup

Use this when setting up WiseSocial Inbox for Messenger and Instagram Direct conversations.

Required Business assets:

- Facebook Page assigned to the Business portfolio.
- Instagram Business account connected to the Page for Instagram Inbox.
- App product: Messenger.
- App product: Webhooks.
- Page subscribed to app webhooks after connection.

Facebook Inbox permissions:

```text
pages_show_list
business_management
pages_manage_metadata
pages_messaging
pages_read_engagement
```

Instagram Inbox permissions:

```text
instagram_basic
instagram_manage_messages
pages_show_list
pages_manage_metadata
business_management
```

WiseSocial use:

- `pages_manage_metadata`: subscribe the Page to app webhooks with `subscribed_apps`.
- `pages_messaging`: read and send Facebook Page Messenger messages.
- `instagram_manage_messages`: read and send Instagram Direct messages for the connected Instagram account.
- `pages_show_list`, `business_management`, `instagram_basic`, and `pages_read_engagement`: identify the correct Page and Instagram account.

WiseSocial setup for Facebook Inbox:

1. In WiseSocial, add `Facebook Inbox`.
2. Authorize Facebook Login for Business.
3. Select the Page.
4. WiseSocial subscribes the Page to Messenger webhook fields.
5. Send a test message to the Facebook Page.
6. Confirm it appears in WiseSocial Inbox.
7. Reply from WiseSocial and confirm the message arrives in Messenger.

WiseSocial setup for Instagram Inbox:

1. Confirm the Instagram Business account is connected to the Page.
2. In WiseSocial, add `Instagram Inbox`.
3. Authorize Facebook Login for Business.
4. Select the Instagram/Page asset.
5. WiseSocial subscribes the Page to Instagram messaging webhook fields.
6. Send a test DM to the Instagram account.
7. Confirm it appears in WiseSocial Inbox.
8. Reply from WiseSocial and confirm the message arrives in Instagram.

Meta review demo must show:

- The exact Page/IG account selected.
- A real inbound message arriving in WiseSocial Inbox.
- A reply sent from WiseSocial.
- The reply visible in Facebook Messenger or Instagram.

## Facebook Ads and leads setup

Use this when setting up WiseSocial Ads, campaign reporting, campaign management, lead forms, and lead export.

Required Business assets:

- Ad Account assigned to the Business portfolio.
- Connecting user has access to the Ad Account.
- Payment method configured if creating or activating campaigns.
- Facebook Page connected to lead forms if lead sync is enabled.
- App subscribed to `leadgen` webhooks for real-time lead ingestion.

Permissions:

```text
business_management
ads_read
ads_management
```

WiseSocial use:

- `business_management`: discover Business-owned ad accounts and related assets.
- `ads_read`: read campaigns, ad sets, ads, insights, lead forms, leads, pixels, reports, and ad performance.
- `ads_management`: create, update, pause/delete campaign workflows, audiences, ad sets, ads, rules, experiments, and authorized ad assets.

WiseSocial setup:

1. In WiseSocial, add `Facebook Ads`.
2. Authorize Facebook Login for Business.
3. Select the Ad Account.
4. Open WiseSocial Ads and confirm campaigns load.
5. Create a paused draft campaign or update a safe test campaign.
6. Open Ads reporting and confirm spend/impressions/click metrics load.
7. For leads, create or select a Lead Form in Meta.
8. Submit a test lead.
9. Confirm the lead appears in WiseSocial Leads.

Meta review demo must show:

- Ad Account selection.
- Campaign list/reporting.
- Any create/update action requested by `ads_management`.
- Lead form list or test lead ingestion if lead features are requested.

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

Webhook setup in Meta:

1. In Meta for Developers, open the app.
2. Add the Webhooks product.
3. Set Callback URL to `https://social.wiseadmit.io/api/webhooks/meta`.
4. Set Verify Token to the value in `FACEBOOK_WEBHOOK_VERIFY_TOKEN`.
5. Subscribe the app to the Page fields needed for WiseSocial:

```text
messages
messaging_postbacks
messaging_optins
message_deliveries
message_reads
leadgen
```

6. Subscribe the app to WhatsApp Business Account field:

```text
messages
```

7. Set `FACEBOOK_WEBHOOK_APP_SECRET` to the Meta app secret so WiseSocial can verify signed webhook payloads.
8. After connecting a Page or Instagram Inbox in WiseSocial, confirm the Page is subscribed to the app.
9. After connecting WhatsApp Business in WiseSocial, confirm the WABA is subscribed to app webhooks.

WiseSocial processes webhook events for:

- Facebook Messenger inbound messages and message metadata.
- Instagram Direct inbound messages and message metadata.
- WhatsApp inbound messages and delivery/status payloads.
- Meta leadgen events, then WiseSocial fetches the full lead by lead ID.

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

Detailed WhatsApp setup:

1. In Meta for Developers, add the WhatsApp product to the WiseSocial app.
2. In WhatsApp > API Setup, create or select the WABA.
3. Add a business phone number.
4. Verify the phone number with SMS or voice.
5. In Meta Business Settings, create a System User for server-to-server access.
6. Assign the System User to the app.
7. Assign the System User to the WABA and phone number.
8. Generate a permanent System User token with:

```text
business_management
whatsapp_business_management
whatsapp_business_messaging
```

9. Copy these values into WiseSocial when adding WhatsApp Business:

```text
Permanent Access Token
Phone Number ID
WhatsApp Business Account ID
```

10. Configure Webhooks for the WABA:

```text
Callback URL: https://social.wiseadmit.io/api/webhooks/meta
Verify token: FACEBOOK_WEBHOOK_VERIFY_TOKEN
Field: messages
```

11. Send a test WhatsApp message from a user phone to the WhatsApp Business number.
12. Confirm the message appears in WiseSocial Inbox.
13. Reply from WiseSocial and confirm the reply arrives in WhatsApp.
14. Create at least one approved message template in WhatsApp Manager before testing template or broadcast features.
15. If commerce/product messages are used, connect a catalog to the WABA and confirm product IDs are available.

WiseSocial WhatsApp features:

- Inbox conversation sync from webhooks.
- Text replies.
- Rich media messages: image, video, document, audio, sticker, location, contacts.
- Interactive messages: buttons, lists, product, product list, CTA URL, flow.
- Template messages.
- Broadcast template messages to authorized recipients.
- Template create/delete workflows.
- Commerce/product messages.
- WABA analytics for sent/delivered message counts.

Meta review demo must show:

- WABA and phone number configured in Meta.
- WhatsApp Business connected in WiseSocial.
- Inbound message from a WhatsApp user.
- Reply sent from WiseSocial.
- Template or product message only if those features are requested.

## Meta app review notes

Paste and adapt this into Meta App Review. Remove features you are not submitting.

```text
WiseSocial is a WiseAdmit web app hosted at https://social.wiseadmit.io/. It helps business users connect authorized Facebook Pages, Instagram Business accounts, Facebook Ad Accounts, and WhatsApp Business Accounts so they can publish content, manage comments/messages, view insights, manage ad workflows, sync leads, and operate WhatsApp business messaging from one workspace.

Facebook Page permissions:
pages_show_list is used to show the list of Pages the user can connect. business_management is used to access Pages and business assets owned by or assigned to the Business. pages_manage_posts is used to publish posts to selected Pages. pages_manage_engagement and pages_read_engagement are used to read, reply to, hide, delete, and manage comments and engagement. read_insights is used to display Page and post analytics inside WiseSocial.

Instagram permissions:
instagram_basic is used to identify the connected Instagram Business account. pages_show_list, pages_read_engagement, and business_management are used to find the Facebook Page connected to the Instagram Business account. instagram_content_publish is used to publish Instagram posts, reels, stories, or carousels when the user requests publishing. instagram_manage_comments and instagram_manage_engagement are used for comment moderation and engagement workflows. instagram_manage_insights is used to show Instagram account and media analytics. catalog_management is used for product/catalog workflows.

Messaging permissions:
pages_manage_metadata is used to subscribe connected Pages to WiseSocial webhooks. pages_messaging is used to receive and reply to Facebook Page messages. instagram_manage_messages is used to receive and reply to Instagram Direct messages for the connected Instagram Business account.

Ads and lead permissions:
ads_read is used to list ad accounts, campaigns, lead forms, leads, pixels, reports, and performance insights. ads_management is used to create, update, pause, and manage campaign workflows only for ad accounts selected by the authorized user. business_management is used to discover and access business-owned ad assets.

WhatsApp permissions:
whatsapp_business_management is used to access the WhatsApp Business Account, phone number, templates, analytics, and business settings authorized by the business. whatsapp_business_messaging is used to send and receive WhatsApp messages, including text, media, interactive, template, broadcast, and product messages. Inbound messages are received through the WiseSocial webhook at https://social.wiseadmit.io/api/webhooks/meta.

Data handling:
WiseSocial uses Meta data only to provide the requested social publishing, messaging, ads, leads, analytics, commerce, and account management features. WiseSocial does not sell Meta data and provides public Privacy Policy, Terms of Service, and Data Deletion pages on the same domain as the app.
```

Meta review video checklist:

1. Start at `https://social.wiseadmit.io/`.
2. Show visible Privacy Policy and Terms links.
3. Log in to WiseSocial.
4. Connect each product separately:
   - Facebook Page
   - Instagram Business
   - Facebook Inbox
   - Instagram Inbox
   - Facebook Ads
   - WhatsApp Business
5. For every requested permission, show the UI feature that uses it.
6. Show the selected Page, Instagram account, Ad Account, WABA, and phone number.
7. Show one successful action for each feature:
   - Publish or schedule a Facebook Page post.
   - Publish or schedule an Instagram post/reel/story.
   - Load and moderate a Facebook/Instagram comment.
   - Receive and reply to a Messenger message.
   - Receive and reply to an Instagram DM.
   - Load ad campaigns/insights and create/update a paused test campaign if `ads_management` is requested.
   - Submit and sync a test lead if lead features are requested.
   - Receive and reply to a WhatsApp message.
   - Send a WhatsApp template/product message only if requested.
8. Do not include unused features or permissions in the review submission.

## TikTok organic

Create an app in TikTok for Developers. Add Login Kit and Content Posting API only.

Do not select Share Kit for this web app. TikTok Share Kit is for mobile SDK/share-sheet flows, and reviewers have asked that it be removed.

Basic information:

```text
App name: WiseSocial
App icon: use apps/frontend/public/wisesocial.png
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
