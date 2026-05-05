# WiseSocial Messenger and Instagram Inbox Setup

This guide covers Facebook Page Messenger and Instagram Direct messaging in WiseSocial Inbox.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
Facebook Inbox redirect URI: https://social.wiseadmit.io/integrations/social/facebook-messages
Instagram Inbox redirect URI: https://social.wiseadmit.io/integrations/social/instagram-messages
Webhook callback URL: https://social.wiseadmit.io/api/webhooks/meta
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Meta Business Assets

1. Add the Facebook Page to the WiseAdmit Business portfolio.
2. Assign the connecting admin user to the Page.
3. For Instagram Inbox, connect an Instagram Business account to that Page.
4. Confirm the app has the Messenger and Webhooks products configured.
5. Confirm the Page can be subscribed to app webhooks.

## Facebook Inbox Permissions

```text
pages_show_list
business_management
pages_manage_metadata
pages_messaging
pages_read_engagement
```

WiseSocial usage:

- `pages_show_list`: list Pages the user can connect.
- `business_management`: access Business-owned or client Pages.
- `pages_manage_metadata`: subscribe the Page to app webhooks.
- `pages_messaging`: receive and reply to Page Messenger conversations.
- `pages_read_engagement`: read Page metadata needed for the connection.

## Instagram Inbox Permissions

```text
instagram_basic
instagram_manage_messages
pages_show_list
pages_manage_metadata
business_management
```

WiseSocial usage:

- `instagram_basic`: identify the connected Instagram Business account.
- `instagram_manage_messages`: receive and reply to Instagram Direct conversations.
- `pages_show_list`: list Pages connected to Instagram accounts.
- `pages_manage_metadata`: subscribe the connected Page to app webhooks.
- `business_management`: access Business-owned or assigned assets.

## Webhook Setup

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
```

WiseSocial subscribes connected Pages to webhook fields after the user connects Facebook Inbox or Instagram Inbox.

## WiseSocial Facebook Inbox Setup

1. In WiseSocial, add `Facebook Inbox`.
2. Complete Facebook Login for Business.
3. Select the Facebook Page.
4. Confirm WiseSocial subscribes the Page to Messenger webhook fields.
5. Send a test message to the Facebook Page from a Facebook user.
6. Confirm it appears in WiseSocial Inbox.
7. Reply from WiseSocial.
8. Confirm the reply arrives in Messenger.

## WiseSocial Instagram Inbox Setup

1. Confirm the Instagram Business account is connected to a Facebook Page.
2. In WiseSocial, add `Instagram Inbox`.
3. Complete Facebook Login for Business.
4. Select the Instagram/Page asset.
5. Confirm WiseSocial subscribes the Page to Instagram messaging webhook fields.
6. Send a test DM to the Instagram account.
7. Confirm it appears in WiseSocial Inbox.
8. Reply from WiseSocial.
9. Confirm the reply arrives in Instagram.

## App Review Demo

Show these in the review video:

1. Public WiseSocial website and legal links.
2. Facebook Inbox connection flow.
3. Page selection.
4. Inbound Messenger message.
5. Reply from WiseSocial and received reply in Messenger.
6. Instagram Inbox connection flow.
7. Connected Instagram Business account.
8. Inbound Instagram DM.
9. Reply from WiseSocial and received reply in Instagram.

## Review Notes Template

```text
WiseSocial uses pages_manage_metadata to subscribe connected Pages to app webhooks. pages_messaging is used to receive and reply to Facebook Page messages. instagram_manage_messages is used to receive and reply to Instagram Direct messages for the connected Instagram Business account. Users can only connect Pages and Instagram accounts they are authorized to manage.
```
