# WiseSocial Social Platform Setup Docs

Use these files when configuring platform apps, permissions, review notes, and demo videos for `https://social.wiseadmit.io`.

Core review identity:

```text
App name: WiseSocial
Operator: WiseAdmit
Website URL: https://social.wiseadmit.io/
Terms of Service URL: https://social.wiseadmit.io/terms-condition
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

Platform docs:

- [Facebook Page setup](./facebook.md)
- [Instagram Business setup](./instagram.md)
- [Messenger and Instagram Inbox setup](./messenger.md)
- [WhatsApp Business setup](./whatsapp.md)
- [Reddit setup](./reddit.md)
- [TikTok setup](./tiktok.md)

General rules for every app review:

1. Use the same public website domain shown in the demo video: `https://social.wiseadmit.io/`.
2. Make sure Privacy Policy, Terms, and Data Deletion pages are public and visible from the website.
3. Request only the products, scopes, and permissions used by enabled WiseSocial features.
4. In the demo video, show login, permission grant, account/page selection, and the exact feature that uses each permission.
5. Remove unused products before review. For example, do not request TikTok Share Kit for WiseSocial unless a separate native mobile app exists.

Primary references:

- Meta Webhooks: https://developers.facebook.com/docs/graph-api/webhooks/
- Messenger Webhooks: https://developers.facebook.com/docs/messenger-platform/webhooks
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- WhatsApp Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- Meta Marketing APIs: https://developers.facebook.com/docs/marketing-apis/
- TikTok App Management: https://developers.tiktok.com/doc/getting-started-create-an-app
- TikTok Login Kit Web: https://developers.tiktok.com/doc/login-kit-web/
- TikTok Content Posting API: https://developers.tiktok.com/doc/content-posting-api-get-started/
- Reddit OAuth scopes: https://www.reddit.com/api/v1/scopes
- Reddit OAuth overview: https://github.com/reddit-archive/reddit/wiki/OAuth2
