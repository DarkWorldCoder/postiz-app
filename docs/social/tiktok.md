# WiseSocial TikTok Setup

This guide covers TikTok Login Kit, Content Posting API, creator scopes, TikTok Business credentials, review notes, and demo requirements.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
OAuth redirect URI: https://social.wiseadmit.io/integrations/social/tiktok
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Environment Variables

```env
TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""
TIKTOK_BUSINESS_API_BASE="https://business-api.tiktok.com/open_api/v1.3"
WISESOCIAL_TIKTOK_MESSAGING_BASE_URL=""
WISESOCIAL_TIKTOK_MESSAGING_API_KEY=""
```

## TikTok Developer App Setup

1. Create or open the TikTok for Developers app.
2. Set app name to `WiseSocial`.
3. Upload the same app icon used by the website:

```text
Website icon path: apps/frontend/public/wisesocial.png
Browser favicon URL: https://social.wiseadmit.io/wisesocial.png
Website header icon URL: https://social.wiseadmit.io/wisesocial.png
TikTok Basic Info icon: use the same wisesocial.png file
```

4. Set category to `Business`.
5. Set Website URL to `https://social.wiseadmit.io/`.
6. Set Terms URL to `https://social.wiseadmit.io/terms-condition`.
7. Set Privacy Policy URL to `https://social.wiseadmit.io/privacy-policy`.
8. Select platform `Web`.
9. Configure redirect URI:

```text
https://social.wiseadmit.io/integrations/social/tiktok
```

10. Add products:

```text
Login Kit
Content Posting API
```

11. Do not select Share Kit for WiseSocial unless a separate native mobile app using TikTok mobile SDK exists.

## TikTok Creator Scopes

```text
user.info.basic
user.info.profile
user.info.stats
video.list
video.upload
video.publish
```

WiseSocial usage:

- `user.info.basic`: show connected account identity, display name, and avatar.
- `user.info.profile`: show authorized profile details such as bio/profile links/verified status.
- `user.info.stats`: show account-level stats.
- `video.list`: list public videos inside WiseSocial.
- `video.upload`: upload content as a TikTok draft for creator review.
- `video.publish`: publish directly after the user confirms settings.

## WiseSocial TikTok Creator Setup

1. In WiseSocial, add `TikTok`.
2. Complete TikTok Login Kit authorization.
3. Confirm connected account identity appears in WiseSocial.
4. Create a post with supported TikTok media.
5. Choose Upload as draft or Direct Post.
6. Confirm title, privacy, comments, duet/stitch, and any required TikTok posting settings.
7. Upload or publish.
8. Confirm the TikTok post/status in WiseSocial.

## TikTok Business Setup

TikTok Business is separate from creator publishing. Use it for ads, leads, business comments, catalogs, audiences, subscriptions, conversion events, identities, Spark Ads, and creative portfolio workflows.

In WiseSocial, add `TikTok Business` with:

```text
TikTok Business API Access Token
Advertiser ID
Business Account ID
WiseSocial Messaging Base URL (optional)
WiseSocial Messaging API Key (optional)
```

Optional messaging bridge env:

```env
WISESOCIAL_TIKTOK_MESSAGING_BASE_URL=""
WISESOCIAL_TIKTOK_MESSAGING_API_KEY=""
```

Webhook callback for TikTok Business subscriptions:

```text
https://social.wiseadmit.io/api/webhooks/tiktok
```

## App Review Demo

Show these in the TikTok review video:

1. Public `https://social.wiseadmit.io/` website with Privacy Policy and Terms links.
2. Browser tab showing the WiseSocial favicon.
3. WiseSocial icon visible in the header/top area of the Privacy Policy page.
4. WiseSocial icon visible in the header/top area of the Terms of Service page.
5. WiseSocial login.
6. Add TikTok integration.
7. TikTok authorization / Login Kit flow.
8. Connected TikTok account in WiseSocial.
9. Create a TikTok post with media.
10. Show upload/draft or direct post settings.
11. Upload or publish successfully.
12. Show public video list or analytics if `video.list` / stats scopes are requested.
13. Do not show Share Kit unless a native mobile app is included.

## TikTok Review Notes Template

```text
WiseSocial is a WiseAdmit web app hosted at https://social.wiseadmit.io/. Login Kit is used so a TikTok user can connect their own TikTok account to WiseSocial. user.info.basic, user.info.profile, and user.info.stats are used to display the authorized account identity, profile, and statistics. Content Posting API is used only when the authorized user chooses to upload a draft or publish content from WiseSocial. video.upload uploads content as a draft, video.publish publishes after user confirmation, and video.list lists the user's public TikTok videos. Share Kit is not requested because WiseSocial is a web app and does not use the TikTok mobile SDK.
```
