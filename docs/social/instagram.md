# WiseSocial Instagram Business Setup

This guide covers Instagram Business publishing, reels/stories/carousels, comments, insights, catalogs, and Meta review requirements.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
OAuth redirect URI: https://social.wiseadmit.io/integrations/social/instagram
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Meta Business Assets

1. Convert the Instagram profile to a Professional account.
2. Use Business or Creator, not a personal profile.
3. Connect the Instagram account to a Facebook Page.
4. Add the Page to the WiseAdmit Meta Business portfolio.
5. Assign the connecting admin user to the Page and Instagram account.
6. Add a Commerce Catalog if product/catalog workflows are enabled.
7. Confirm the Page, Instagram account, and Catalog are owned by or shared with the same Business portfolio.

## Meta Developer App Setup

1. Use the same Meta Business app as Facebook.
2. Add Facebook Login for Business.
3. Add Instagram Graph API / Instagram API features through Meta.
4. Add Webhooks if comments, engagement, or Instagram Inbox are enabled.
5. Configure redirect URI:

```text
https://social.wiseadmit.io/integrations/social/instagram
```

## Permissions

Request these only if the matching WiseSocial features are enabled:

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

WiseSocial usage:

- `instagram_basic`: identify and display the connected Instagram Business account.
- `pages_show_list`: list Facebook Pages that have connected Instagram accounts.
- `pages_read_engagement`: read Page/Instagram relationship data needed to resolve the Instagram account.
- `business_management`: access Business-owned or client Page, Instagram, and catalog assets.
- `instagram_content_publish`: publish Instagram feed posts, reels, stories, and carousels.
- `instagram_manage_comments`: read, reply to, hide, delete, and manage comments on Instagram media.
- `instagram_manage_engagement`: manage supported engagement workflows.
- `instagram_manage_insights`: show Instagram account and media insights.
- `catalog_management`: list catalogs/products and support commerce/product workflows.

## WiseSocial Setup

1. In Meta Business Suite, verify Instagram is connected to the Facebook Page.
2. In WiseSocial, add `Instagram (Facebook Business)`.
3. Complete Facebook Login for Business.
4. Select the Page that contains the connected Instagram Business account.
5. Confirm WiseSocial shows the Instagram account name/avatar.
6. Publish or schedule a test post, reel, story, or carousel.
7. Open WiseSocial Comments and load media comments.
8. Open analytics and confirm account/media insights load.
9. Open Commerce/product search only if `catalog_management` is requested.

## App Review Demo

Show these in the review video:

1. Instagram account is Professional and connected to the selected Facebook Page.
2. WiseSocial add-channel flow for Instagram.
3. Facebook Login permission screen.
4. Page/Instagram account selection.
5. Instagram account visible in WiseSocial.
6. Publishing or scheduling an Instagram post/reel/story/carousel.
7. Comment moderation if comment permissions are requested.
8. Insights screen if `instagram_manage_insights` is requested.
9. Catalog/product screen if `catalog_management` is requested.

## Review Notes Template

```text
WiseSocial uses Instagram permissions to connect authorized Instagram Business accounts through their linked Facebook Pages. instagram_content_publish is used only when a user chooses to publish or schedule Instagram content. instagram_manage_comments and instagram_manage_engagement are used for comment and engagement management. instagram_manage_insights is used to display account and media analytics. catalog_management is used only for product/catalog workflows selected by the user.
```
