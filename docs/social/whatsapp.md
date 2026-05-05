# WiseSocial WhatsApp Business Setup

This guide covers WhatsApp Cloud API, WABA setup, phone numbers, templates, webhooks, and WiseSocial Inbox.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
Webhook callback URL: https://social.wiseadmit.io/api/webhooks/meta
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Meta Business Assets

1. Create or select the WiseAdmit Meta Business portfolio.
2. Complete Business verification.
3. Create or connect a WhatsApp Business Account (WABA).
4. Add a business phone number.
5. Verify the phone number by SMS or voice.
6. Add a payment method if production messaging requires it.
7. Create approved message templates in WhatsApp Manager for template/broadcast features.
8. Connect a catalog to the WABA if product messages are enabled.

## Meta Developer App Setup

1. Add the WhatsApp product to the WiseSocial Meta app.
2. In WhatsApp > API Setup, create or select the WABA.
3. Copy the Phone Number ID and WhatsApp Business Account ID.
4. Configure Webhooks:

```text
Callback URL: https://social.wiseadmit.io/api/webhooks/meta
Verify token: FACEBOOK_WEBHOOK_VERIFY_TOKEN
Subscribed field: messages
```

## System User Token

1. In Meta Business Settings, create a System User for server-to-server access.
2. Assign the System User to the WiseSocial app.
3. Assign the System User to the WABA and phone number.
4. Generate a permanent token with:

```text
business_management
whatsapp_business_management
whatsapp_business_messaging
```

## WiseSocial Setup

In WiseSocial, add `WhatsApp Business` with:

```text
Permanent Access Token
Phone Number ID
WhatsApp Business Account ID
```

Then:

1. Send a test WhatsApp message from a user phone to the WhatsApp Business number.
2. Confirm the message appears in WiseSocial Inbox.
3. Reply from WiseSocial.
4. Confirm the reply arrives in WhatsApp.
5. Test approved templates if template/broadcast features are enabled.
6. Test product messages only if catalog/product workflows are enabled.

## WiseSocial WhatsApp Features

- Inbox conversation sync from webhooks.
- Text replies.
- Rich media messages: image, video, document, audio, sticker, location, contacts.
- Interactive messages: buttons, lists, product, product list, CTA URL, flow.
- Template messages.
- Broadcast template messages to authorized recipients.
- Template create/delete workflows.
- Commerce/product messages.
- WABA analytics for sent/delivered message counts.

## App Review Demo

Show these in the review video:

1. WABA and phone number configured in Meta.
2. WhatsApp Business connected in WiseSocial.
3. Inbound message from a WhatsApp user.
4. Reply sent from WiseSocial.
5. Template message only if template permissions/features are requested.
6. Product message only if commerce/catalog features are requested.

## Review Notes Template

```text
WiseSocial uses whatsapp_business_management to access authorized WhatsApp Business Account resources, phone numbers, templates, analytics, and business settings. WiseSocial uses whatsapp_business_messaging to send and receive WhatsApp messages from authorized business phone numbers. Inbound messages are received through https://social.wiseadmit.io/api/webhooks/meta and displayed in WiseSocial Inbox.
```
