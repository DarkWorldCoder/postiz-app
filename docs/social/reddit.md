# WiseSocial Reddit Setup

This guide covers Reddit OAuth setup for posting to Reddit from WiseSocial.

## Required WiseSocial URLs

```text
Website URL: https://social.wiseadmit.io/
OAuth redirect URI: https://social.wiseadmit.io/integrations/social/reddit
Privacy Policy URL: https://social.wiseadmit.io/privacy-policy
Terms URL: https://social.wiseadmit.io/terms-condition
Data Deletion URL: https://social.wiseadmit.io/data-deletion
Contact: ayush@wiseadmit.io or info@wiseadmit.io
```

## Environment Variables

```env
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""
```

## Reddit App Setup

1. Sign in to the Reddit account that will own the app.
2. Open Reddit app preferences / developer app creation.
3. Create a new OAuth app.
4. Choose app type `web app`.
5. Set app name to `WiseSocial`.
6. Set about/description to a short social scheduling description.
7. Set redirect URI exactly:

```text
https://social.wiseadmit.io/integrations/social/reddit
```

8. Copy the client ID into `REDDIT_CLIENT_ID`.
9. Copy the client secret into `REDDIT_CLIENT_SECRET`.
10. Use a clear Reddit User-Agent in deployment/network configuration if the platform or library requires it.

## Reddit OAuth Scopes

WiseSocial requests:

```text
read
identity
submit
flair
```

WiseSocial usage:

- `identity`: identify the connected Reddit account.
- `read`: read subreddit/post metadata needed for publishing options.
- `submit`: submit text, link, image, or video posts to selected subreddits.
- `flair`: read and apply subreddit flair options when the subreddit requires or supports flair.

WiseSocial uses `duration=permanent` so Reddit can issue a refresh token for scheduled posts.

## WiseSocial Setup

1. In WiseSocial, add `Reddit`.
2. Complete Reddit OAuth.
3. Approve the requested scopes.
4. Create a Reddit post in WiseSocial.
5. Choose one or more subreddit targets.
6. Select post type: text, link, image, video, or media where available.
7. Select flair if required.
8. Publish or schedule the post.
9. Confirm the post URL opens on Reddit.

## Review / Verification Demo

Show these in the demo or internal verification:

1. Public WiseSocial website and legal links.
2. Add Reddit integration.
3. Reddit OAuth permission screen.
4. Connected Reddit username in WiseSocial.
5. Subreddit/post settings in WiseSocial.
6. A test post submitted or scheduled.
7. Published Reddit post URL.

## Troubleshooting

- Redirect URI must match exactly, including `https` and path.
- App type must be `web app`.
- If token exchange fails, confirm client ID, client secret, redirect URI, and scopes.
- Reddit has strict rate limits; WiseSocial limits Reddit jobs to one concurrent job.
- Some subreddits require flair, minimum account age, karma, moderator approval, or specific content rules.

## Review Notes Template

```text
WiseSocial uses Reddit OAuth to let a user connect their own Reddit account and submit posts to subreddits they choose. identity is used to show the connected account, read is used to load subreddit/post metadata, submit is used to publish user-created posts, and flair is used to show/apply subreddit flair when required. WiseSocial only posts after the authorized user creates or schedules Reddit content.
```
