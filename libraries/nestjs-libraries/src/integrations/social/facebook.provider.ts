import {
  AnalyticsData,
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import dayjs from 'dayjs';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { FacebookDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { Integration } from '@prisma/client';
import { getMetaGraphApiVersion, metaGraphUrl } from '@gitroom/nestjs-libraries/integrations/social/meta/meta-api.constants';

const FACEBOOK_API_VERSION = getMetaGraphApiVersion();

const getFacebookRedirectUri = (
  identifier: string,
  refresh?: string
) =>
  `${process.env.FRONTEND_URL}/integrations/social/${identifier}${
    refresh ? `?refresh=${refresh}` : ''
  }`;

const getPercentageChange = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }

  const midpoint = Math.ceil(values.length / 2);
  const previous = values
    .slice(0, midpoint)
    .reduce((sum, value) => sum + value, 0);
  const current = values
    .slice(midpoint)
    .reduce((sum, value) => sum + value, 0);

  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const toMetricValue = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'object' && value) {
    return Object.values(value as Record<string, number>).reduce(
      (sum, item) => sum + Number(item || 0),
      0
    );
  }

  return 0;
};

export class FacebookProvider extends SocialAbstract implements SocialProvider {
  identifier = 'facebook';
  name = 'Facebook Page';
  isBetweenSteps = true;
  scopes = [
    'pages_show_list',
    'business_management',
    'pages_manage_posts',
    'pages_manage_engagement',
    'pages_read_engagement',
    'read_insights',
  ];
  override maxConcurrentJob = 100; // Facebook has reasonable rate limits
  editor: 'none' | 'normal' | 'markdown' | 'html' = 'normal';
  maxLength() {
    return 63206;
  }
  dto = FacebookDto;

  override handleErrors(
    body: string,
    status: number
  ):
    | {
        type: 'refresh-token' | 'bad-body';
        value: string;
      }
    | undefined {
    // Access token validation errors - require re-authentication
    if (body.indexOf('Error validating access token') > -1) {
      return {
        type: 'refresh-token' as const,
        value: 'Please re-authenticate your Facebook account',
      };
    }

    if (body.indexOf('490') > -1) {
      return {
        type: 'refresh-token' as const,
        value: 'Access token expired, please re-authenticate',
      };
    }

    if (body.indexOf('REVOKED_ACCESS_TOKEN') > -1) {
      return {
        type: 'refresh-token' as const,
        value: 'Access token has been revoked, please re-authenticate',
      };
    }

    if (body.indexOf('1366046') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Photos should be smaller than 4 MB and saved as JPG, PNG',
      };
    }

    if (body.indexOf('1390008') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'You are posting too fast, please slow down',
      };
    }

    // Content policy violations
    if (body.indexOf('1346003') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Content flagged as abusive by Facebook',
      };
    }

    if (body.indexOf('1404006') > -1) {
      return {
        type: 'bad-body' as const,
        value:
          "We couldn't post your comment, A security check in facebook required to proceed.",
      };
    }

    if (body.indexOf('1404102') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Content violates Facebook Community Standards',
      };
    }

    // Permission errors
    if (body.indexOf('1404078') > -1) {
      return {
        type: 'refresh-token' as const,
        value: 'Page publishing authorization required, please re-authenticate',
      };
    }

    if (body.indexOf('1609008') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Cannot post Facebook.com links',
      };
    }

    // Parameter validation errors
    if (body.indexOf('2061006') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Invalid URL format in post content',
      };
    }

    if (body.indexOf('1349125') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Invalid content format',
      };
    }

    if (body.indexOf('1404112') > -1) {
      return {
        type: 'bad-body' as const,
        value:
          'For security reasons, your account has limited access to the site for a few days',
      };
    }

    if (body.indexOf('Name parameter too long') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Post content is too long',
      };
    }

    // Service errors - checking specific subcodes first
    if (body.indexOf('1363047') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Facebook service temporarily unavailable',
      };
    }

    if (body.indexOf('1609010') > -1) {
      return {
        type: 'bad-body' as const,
        value: 'Facebook service temporarily unavailable',
      };
    }

    if (status === 401) {
      return {
        type: 'bad-body' as const,
        value:
          'An unknown error occurred, please try again later or contact support',
      };
    }

    return undefined;
  }

  async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
    const refreshedToken = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token` +
          '?grant_type=fb_exchange_token' +
          `&client_id=${process.env.FACEBOOK_APP_ID}` +
          `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
          `&fb_exchange_token=${refresh_token}`
      )
    ).json();

    const accessToken = refreshedToken.access_token || refresh_token;
    const expiresIn =
      Number(refreshedToken.expires_in) ||
      dayjs().add(59, 'days').unix() - dayjs().unix();

    const { id, name, picture } = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me?fields=id,name,picture&access_token=${accessToken}`
      )
    ).json();

    return {
      refreshToken: accessToken,
      expiresIn,
      accessToken,
      id,
      name,
      picture: picture?.data?.url || '',
      username: '',
    };
  }

  async generateAuthUrl() {
    const state = makeId(6);
    return {
      url:
        `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth` +
        `?client_id=${process.env.FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(
          getFacebookRedirectUri(this.identifier)
        )}` +
        `&state=${state}` +
        `&scope=${this.scopes.join(',')}`,
      codeVerifier: makeId(10),
      state,
    };
  }

  async reConnect(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>> {
    const information = await this.fetchPageInformation(accessToken, {
      page: requiredId,
    });

    return {
      id: information.id,
      name: information.name,
      accessToken: information.access_token,
      picture: information.picture,
      username: information.username,
    };
  }

  async authenticate(params: {
    code: string;
    codeVerifier: string;
    refresh?: string;
  }) {
    const getAccessToken = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token` +
          `?client_id=${process.env.FACEBOOK_APP_ID}` +
          `&redirect_uri=${encodeURIComponent(
            getFacebookRedirectUri(this.identifier, params.refresh)
          )}` +
          `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
          `&code=${params.code}`
      )
    ).json();

    const { access_token } = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token` +
          '?grant_type=fb_exchange_token' +
          `&client_id=${process.env.FACEBOOK_APP_ID}` +
          `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
          `&fb_exchange_token=${getAccessToken.access_token}&fields=access_token,expires_in`
      )
    ).json();

    const { data } = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/permissions?access_token=${access_token}`
      )
    ).json();

    const permissions = data
      .filter((d: any) => d.status === 'granted')
      .map((p: any) => p.permission);
    this.checkScopes(this.scopes, permissions);

    const { id, name, picture } = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me?fields=id,name,picture&access_token=${access_token}`
      )
    ).json();

    return {
      id,
      name,
      accessToken: access_token,
      refreshToken: access_token,
      expiresIn: dayjs().add(59, 'days').unix() - dayjs().unix(),
      picture: picture?.data?.url || '',
      username: '',
    };
  }

  async pages(accessToken: string) {
    const seenIds = new Set<string>();
    const allPages: any[] = [];

    const fetchPaginated = async (startUrl: string) => {
      let nextUrl: string | undefined = startUrl;
      while (nextUrl) {
        const response = await (await fetch(nextUrl)).json();
        if (response.data) {
          for (const page of response.data) {
            if (!seenIds.has(page.id)) {
              seenIds.add(page.id);
              allPages.push(page);
            }
          }
        }
        nextUrl = response.paging?.next;
      }
    };

    // Fetch pages the user explicitly shared during the OAuth dialog
    await fetchPaginated(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts?fields=id,username,name,access_token,picture.type(large)&limit=100&access_token=${accessToken}`
    );

    // Also fetch pages via Business Manager API to discover pages
    // not selected during the OAuth page selection step
    try {
      let bizUrl:
        | string
        | undefined = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/businesses?access_token=${accessToken}`;

      while (bizUrl) {
        const bizResponse = await (await fetch(bizUrl)).json();
        if (bizResponse.data) {
          for (const business of bizResponse.data) {
            try {
              await fetchPaginated(
                `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${business.id}/owned_pages?fields=id,username,name,access_token,picture.type(large)&limit=100&access_token=${accessToken}`
              );
            } catch {
              // Continue with other businesses
            }

            try {
              await fetchPaginated(
                `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${business.id}/client_pages?fields=id,username,name,access_token,picture.type(large)&limit=100&access_token=${accessToken}`
              );
            } catch {
              // Continue with other businesses
            }
          }
        }
        bizUrl = bizResponse.paging?.next;
      }
    } catch {
      // Business Manager API not available for all users
    }

    return allPages;
  }

  async fetchPageInformation(accessToken: string, data: { page: string }) {
    const pageId = data.page;
    const fields = 'id,username,name,access_token,picture.type(large)';

    const searchPaginated = async (startUrl: string) => {
      let url: string | undefined = startUrl;
      while (url) {
        const response = await (await fetch(url)).json();
        if (response.data) {
          const page = response.data.find(
            (p: any) => String(p.id) === String(pageId)
          );
          if (page) {
            return {
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              picture: page.picture?.data?.url || '',
              username: page.username,
            };
          }
        }
        url = response.paging?.next;
      }
      return null;
    };

    // 1. Check /me/accounts
    const fromAccounts = await searchPaginated(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts?fields=${fields}&limit=100&access_token=${accessToken}`
    );
    if (fromAccounts) return fromAccounts;

    // 2. Check Business Manager owned_pages and client_pages
    try {
      let bizUrl:
        | string
        | undefined = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/businesses?access_token=${accessToken}`;

      while (bizUrl) {
        const bizResponse = await (await fetch(bizUrl)).json();
        if (bizResponse.data) {
          for (const business of bizResponse.data) {
            try {
              const fromOwned = await searchPaginated(
                `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${business.id}/owned_pages?fields=${fields}&limit=100&access_token=${accessToken}`
              );
              if (fromOwned) return fromOwned;
            } catch {
              // Continue with other businesses
            }

            try {
              const fromClient = await searchPaginated(
                `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${business.id}/client_pages?fields=${fields}&limit=100&access_token=${accessToken}`
              );
              if (fromClient) return fromClient;
            } catch {
              // Continue with other businesses
            }
          }
        }
        bizUrl = bizResponse.paging?.next;
      }
    } catch {
      // Business Manager API not available for all users
    }

    throw new Error('Page not found in your accounts');
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails<FacebookDto>[]
  ): Promise<PostResponse[]> {
    const [firstPost] = postDetails;

    let finalId = '';
    let finalUrl = '';
    if ((firstPost?.media?.[0]?.path?.indexOf('mp4') || -2) > -1) {
      const {
        id: videoId,
        permalink_url,
        ...all
      } = await (
        await this.fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/videos?access_token=${accessToken}&fields=id,permalink_url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_url: firstPost?.media?.[0]?.path!,
              description: firstPost.message,
              published: !firstPost.settings.scheduled_publish_time,
              ...(firstPost.settings.scheduled_publish_time
                ? {
                    scheduled_publish_time:
                      firstPost.settings.scheduled_publish_time,
                  }
                : {}),
            }),
          },
          'upload mp4'
        )
      ).json();

      finalUrl = 'https://www.facebook.com/reel/' + videoId;
      finalId = videoId;
    } else {
      const uploadPhotos = !firstPost?.media?.length
        ? []
        : await Promise.all(
            firstPost.media.map(async (media) => {
              const { id: photoId } = await (
                await this.fetch(
                  `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/photos?access_token=${accessToken}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      url: media.path,
                      published: false,
                    }),
                  },
                  'upload images slides'
                )
              ).json();

              return { media_fbid: photoId };
            })
          );

      const {
        id: postId,
        permalink_url,
        ...all
      } = await (
        await this.fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/feed?access_token=${accessToken}&fields=id,permalink_url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...(uploadPhotos?.length ? { attached_media: uploadPhotos } : {}),
              ...(firstPost?.settings?.url
                ? { link: firstPost.settings.url }
                : {}),
              message: firstPost.message,
              published: !firstPost.settings.scheduled_publish_time,
              ...(firstPost.settings.scheduled_publish_time
                ? {
                    scheduled_publish_time:
                      firstPost.settings.scheduled_publish_time,
                  }
                : {}),
              ...(firstPost.settings.crosspost_pages?.length
                ? { crosspost_pages: firstPost.settings.crosspost_pages }
                : {}),
            }),
          },
          'finalize upload'
        )
      ).json();

      finalUrl = permalink_url;
      finalId = postId;
    }

    return [
      {
        id: firstPost.id,
        postId: finalId,
        releaseURL: finalUrl,
        status: 'success',
      },
    ];
  }

  async comment(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails<FacebookDto>[],
    integration: Integration
  ): Promise<PostResponse[]> {
    const [commentPost] = postDetails;
    const replyToId = lastCommentId || postId;

    const data = await (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${replyToId}/comments?access_token=${accessToken}&fields=id,permalink_url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(commentPost.media?.length
              ? { attachment_url: commentPost.media[0].path }
              : {}),
            message: commentPost.message,
          }),
        },
        'add comment'
      )
    ).json();

    return [
      {
        id: commentPost.id,
        postId: data.id,
        releaseURL: data.permalink_url,
        status: 'success',
      },
    ];
  }

  async analytics(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]> {
    const until = dayjs().endOf('day').unix();
    const since = dayjs().subtract(date, 'day').unix();

    // Avoid legacy reach/impression metrics that are being deprecated in newer Meta API versions.
    const metrics = [
      'page_post_engagements',
      'page_daily_follows',
      'page_video_views',
      'page_views_total',
      'page_fan_adds_unique',
      'page_fan_removes_unique',
      'page_actions_post_reactions_total',
    ].join(',');

    const { data } = await (
      await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/insights?metric=${metrics}&access_token=${accessToken}&period=day&since=${since}&until=${until}`
      )
    ).json();

    const labelMap: Record<string, string> = {
      page_post_engagements: 'Post Engagement',
      page_daily_follows: 'New Followers',
      page_video_views: 'Video Views',
      page_views_total: 'Page Views',
      page_fan_adds_unique: 'New Fans',
      page_fan_removes_unique: 'Unfollows',
      page_actions_post_reactions_total: 'Reactions',
    };

    return (
      data?.map((metric: any) => {
        const points = (metric?.values || []).map((value: any) => ({
          total: toMetricValue(value.value),
          date: dayjs(value.end_time).format('YYYY-MM-DD'),
        }));

        return {
          label: labelMap[metric.name] || metric.name,
          percentageChange: getPercentageChange(
            points.map((point: { total: number }) => point.total)
          ),
          data: points,
        };
      }) || []
    );
  }

  /**
   * Fetch audience demographics for a Facebook Page
   * Returns age/gender, city, and country breakdowns
   */
  async demographics(
    id: string,
    accessToken: string
  ): Promise<{
    ageGender: Record<string, number>;
    cities: Record<string, number>;
    countries: Record<string, number>;
  }> {
    const metrics = [
      'page_fans_gender_age',
      'page_fans_city',
      'page_fans_country',
    ].join(',');

    try {
      const { data } = await (
        await this.fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${id}/insights` +
            `?metric=${metrics}&period=lifetime&access_token=${accessToken}`
        )
      ).json();

      const result: any = { ageGender: {}, cities: {}, countries: {} };

      for (const metric of data || []) {
        const value = metric.values?.[0]?.value || {};
        switch (metric.name) {
          case 'page_fans_gender_age':
            result.ageGender = value;
            break;
          case 'page_fans_city':
            result.cities = value;
            break;
          case 'page_fans_country':
            result.countries = value;
            break;
        }
      }

      return result;
    } catch (err) {
      console.error('Error fetching Facebook demographics:', err);
      return { ageGender: {}, cities: {}, countries: {} };
    }
  }

  async postAnalytics(
    integrationId: string,
    accessToken: string,
    postId: string,
    date: number
  ): Promise<AnalyticsData[]> {
    const today = dayjs().format('YYYY-MM-DD');

    try {
      // Fetch post insights from Facebook Graph API
      const { data } = await (
        await this.fetch(
          `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}/insights?metric=post_reactions_by_type_total,post_clicks,post_clicks_by_type&access_token=${accessToken}`
        )
      ).json();

      if (!data || data.length === 0) {
        return [];
      }

      const result: AnalyticsData[] = [];

      for (const metric of data) {
        const value = metric.values?.[0]?.value;
        if (value === undefined) continue;

        let label = '';
        let total = '';

        switch (metric.name) {
          case 'post_clicks':
            label = 'Clicks';
            total = String(value);
            break;
          case 'post_clicks_by_type':
            // This returns an object with click types
            if (typeof value === 'object') {
              const totalClicks = Object.values(
                value as Record<string, number>
              ).reduce((sum: number, v: number) => sum + v, 0);
              label = 'Clicks by Type';
              total = String(totalClicks);
            }
            break;
          case 'post_reactions_by_type_total':
            // This returns an object with reaction types
            if (typeof value === 'object') {
              const totalReactions = Object.values(
                value as Record<string, number>
              ).reduce((sum: number, v: number) => sum + v, 0);
              label = 'Reactions';
              total = String(totalReactions);
            }
            break;
        }

        if (label) {
          result.push({
            label,
            percentageChange: 0,
            data: [{ total, date: today }],
          });
        }
      }

      return result;
    } catch (err) {
      console.error('Error fetching Facebook post analytics:', err);
      return [];
    }
  }

  // ── Comments Management ─────────────────────────────

  /**
   * Fetch comments on a Facebook Page post
   * GET /{post-id}/comments?fields=id,message,from,created_time,like_count,is_hidden,comments{id,message,from,created_time,like_count,is_hidden}
   */
  async fetchComments(
    _pageId: string,
    accessToken: string,
    postId: string
  ) {
    const { data } = await (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}/comments` +
          `?fields=id,message,from,created_time,like_count,is_hidden,attachment,` +
          `comments{id,message,from,created_time,like_count,is_hidden}` +
          `&limit=100&order=reverse_chronological` +
          `&access_token=${accessToken}`
      )
    ).json();

    if (!data) return [];

    return data.map((comment: any) => ({
      externalCommentId: comment.id,
      authorId: comment.from?.id || 'unknown',
      authorName: comment.from?.name || 'Unknown',
      authorPicture: comment.from?.id
        ? `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${comment.from.id}/picture?type=small`
        : undefined,
      content: comment.message || '',
      likeCount: comment.like_count || 0,
      isHidden: comment.is_hidden || false,
      createdAt: comment.created_time,
      replies: (comment.comments?.data || []).map((reply: any) => ({
        externalCommentId: reply.id,
        authorId: reply.from?.id || 'unknown',
        authorName: reply.from?.name || 'Unknown',
        authorPicture: reply.from?.id
          ? `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${reply.from.id}/picture?type=small`
          : undefined,
        content: reply.message || '',
        likeCount: reply.like_count || 0,
        isHidden: reply.is_hidden || false,
        createdAt: reply.created_time,
      })),
    }));
  }

  /**
   * Reply to a comment on a Facebook Page post
   * POST /{comment-id}/comments
   */
  async replyToExternalComment(
    _pageId: string,
    accessToken: string,
    commentId: string,
    message: string
  ) {
    const result = await (
      await this.fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${commentId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            access_token: accessToken,
          }),
        }
      )
    ).json();

    return { commentId: result.id, success: true };
  }

  /**
   * Hide or unhide a comment on a Facebook Page post
   * POST /{comment-id}?is_hidden=true|false
   */
  async hideExternalComment(
    _pageId: string,
    accessToken: string,
    commentId: string,
    hide: boolean
  ) {
    await this.fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${commentId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_hidden: hide,
          access_token: accessToken,
        }),
      }
    );

    return { success: true, isHidden: hide };
  }

  /**
   * Delete a comment on a Facebook Page post (own page comments only)
   * DELETE /{comment-id}
   */
  async deleteExternalComment(
    _pageId: string,
    accessToken: string,
    commentId: string
  ) {
    await this.fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${commentId}?access_token=${accessToken}`,
      { method: 'DELETE' }
    );

    return { success: true };
  }

  /**
   * Like or unlike a comment on a Facebook Page post
   * POST/DELETE /{comment-id}/likes
   */
  async likeExternalComment(
    _pageId: string,
    accessToken: string,
    commentId: string,
    like = true
  ) {
    await this.fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${commentId}/likes?access_token=${accessToken}`,
      { method: like ? 'POST' : 'DELETE' }
    );

    return { success: true };
  }

  async contentRanking(id: string, accessToken: string, date: number) {
    const since = dayjs().subtract(date, 'day').unix();
    const { data } = await (
      await this.fetch(
        metaGraphUrl(
          `/${id}/posts?fields=id,message,created_time,permalink_url,insights.metric(post_clicks,post_reactions_by_type_total,post_video_views)&since=${since}&limit=50&access_token=${accessToken}`
        )
      )
    ).json();

    return (data || [])
      .map((post: any) => {
        const score = (post.insights?.data || []).reduce((all: number, metric: any) => {
          const value = metric.values?.[0]?.value;
          if (typeof value === 'number') return all + value;
          if (typeof value === 'object' && value) {
            return all + Object.values(value).reduce((sum: number, current: any) => sum + Number(current || 0), 0);
          }
          return all;
        }, 0);
        return {
          id: post.id,
          message: post.message || '',
          createdAt: post.created_time,
          url: post.permalink_url,
          score,
        };
      })
      .sort((a: any, b: any) => b.score - a.score);
  }

  async scheduleLiveVideo(
    id: string,
    accessToken: string,
    data: { title: string; description?: string; planned_start_time?: number; status?: string }
  ) {
    return (
      await this.fetch(metaGraphUrl(`/${id}/live_videos`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          planned_start_time: data.planned_start_time,
          status: data.status || 'SCHEDULED_UNPUBLISHED',
          access_token: accessToken,
        }),
      })
    ).json();
  }
}
