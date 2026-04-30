import { Integration } from '@prisma/client';

export interface ClientInformation {
  client_id: string;
  client_secret: string;
  instanceUrl: string;
}
export interface IAuthenticator {
  authenticate(
    params: {
      code: string;
      codeVerifier: string;
      refresh?: string;
    },
    clientInformation?: ClientInformation
  ): Promise<AuthTokenDetails | string>;
  refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
  reConnect?(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
  generateAuthUrl(
    clientInformation?: ClientInformation
  ): Promise<GenerateAuthUrlResponse>;
  analytics?(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]>;
  postAnalytics?(
    integrationId: string,
    accessToken: string,
    postId: string,
    fromDate: number,
  ): Promise<AnalyticsData[]>;
  changeNickname?(
    id: string,
    accessToken: string,
    name: string
  ): Promise<{ name: string }>;
  changeProfilePicture?(
    id: string,
    accessToken: string,
    url: string
  ): Promise<{ url: string }>;
  missing?(
    id: string,
    accessToken: string
  ): Promise<{ id: string; url: string }[]>;
}

export interface AnalyticsData {
  label: string;
  data: Array<{ total: string; date: string }>;
  percentageChange: number;
  average?: boolean;
}

export interface SocialCommentData {
  externalCommentId: string;
  parentCommentId?: string;
  authorId: string;
  authorName: string;
  authorPicture?: string;
  content: string;
  likeCount?: number;
  isHidden?: boolean;
  createdAt: string;
  replies?: SocialCommentData[];
}

export interface MetaCampaignInput {
  name: string;
  objective: string;
  status?: 'ACTIVE' | 'PAUSED';
  dailyBudget?: number;
  lifetimeBudget?: number;
  specialAdCategories?: string[];
}

export interface MetaAdSetInput {
  campaignId: string;
  name: string;
  status?: 'ACTIVE' | 'PAUSED';
  targeting: Record<string, any>;
  dailyBudget?: number;
  lifetimeBudget?: number;
  optimizationGoal?: string;
  billingEvent?: string;
  bidStrategy?: string;
  startTime?: string;
  endTime?: string;
}

export interface MetaAdCreativeInput {
  name: string;
  objectStorySpec: Record<string, any>;
  degreesOfFreedomSpec?: Record<string, any>;
}

export interface MetaAdInput {
  adSetId: string;
  creativeId: string;
  name: string;
  status?: 'ACTIVE' | 'PAUSED';
}

export interface MetaLeadFormData {
  externalFormId: string;
  name: string;
  status?: string;
}

export interface MetaAudienceInput {
  name: string;
  description?: string;
  subtype?: string;
  customerFileSource?: string;
  payload?: Record<string, any>;
}

export interface MetaCatalogProductInput {
  retailerId: string;
  name: string;
  description?: string;
  price?: string;
  currency?: string;
  availability?: string;
  condition?: string;
  imageUrl?: string;
  url?: string;
  payload?: Record<string, any>;
}

export interface ContentSuggestionResult {
  type: string;
  items: any[];
}


export type GenerateAuthUrlResponse = {
  url: string;
  codeVerifier: string;
  state: string;
};

export type AuthTokenDetails = {
  id: string;
  name: string;
  error?: string;
  accessToken: string; // The obtained access token
  refreshToken?: string; // The refresh token, if applicable
  expiresIn?: number; // The duration in seconds for which the access token is valid
  picture?: string;
  username: string;
  additionalSettings?: {
    title: string;
    description: string;
    type: 'checkbox' | 'text' | 'textarea';
    value: any;
    regex?: string;
  }[];
};

export interface ISocialMediaIntegration {
  post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]>; // Schedules a new post

  comment?(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]>; // Schedules a new post

  // ── Advanced Analytics & Demographics ───────────────
  demographics?(
    id: string,
    accessToken: string
  ): Promise<{
    ageGender?: Record<string, number>;
    countries?: Record<string, number>;
    cities?: Record<string, number>;
  }>;

  // ── Comments Management ─────────────────────────────
  fetchComments?(
    id: string,
    accessToken: string,
    postId: string
  ): Promise<any[]>;

  replyToExternalComment?(
    id: string,
    accessToken: string,
    commentId: string,
    message: string
  ): Promise<{ commentId: string; success: boolean }>;

  hideExternalComment?(
    id: string,
    accessToken: string,
    commentId: string,
    hide: boolean
  ): Promise<{ success: boolean; isHidden: boolean }>;

  deleteExternalComment?(
    id: string,
    accessToken: string,
    commentId: string
  ): Promise<{ success: boolean }>;

  likeExternalComment?(
    id: string,
    accessToken: string,
    commentId: string,
    like?: boolean
  ): Promise<{ success: boolean }>;

  contentRanking?(
    id: string,
    accessToken: string,
    date: number
  ): Promise<any[]>;

  createCampaign?(
    id: string,
    accessToken: string,
    input: MetaCampaignInput
  ): Promise<any>;
  updateCampaign?(
    id: string,
    accessToken: string,
    campaignId: string,
    input: Partial<MetaCampaignInput>
  ): Promise<any>;
  createAdSet?(
    id: string,
    accessToken: string,
    input: MetaAdSetInput
  ): Promise<any>;
  createAdCreative?(
    id: string,
    accessToken: string,
    input: MetaAdCreativeInput
  ): Promise<any>;
  createAd?(id: string, accessToken: string, input: MetaAdInput): Promise<any>;
  adsInsights?(
    id: string,
    accessToken: string,
    options: Record<string, any>
  ): Promise<any>;
  listLeadForms?(id: string, accessToken: string): Promise<MetaLeadFormData[]>;
  fetchLead?(id: string, accessToken: string, leadId: string): Promise<any>;
  listCatalogs?(id: string, accessToken: string): Promise<any[]>;
  listProducts?(
    id: string,
    accessToken: string,
    catalogId: string
  ): Promise<any[]>;
  createProduct?(
    id: string,
    accessToken: string,
    catalogId: string,
    input: MetaCatalogProductInput
  ): Promise<any>;
  createAudience?(
    id: string,
    accessToken: string,
    input: MetaAudienceInput
  ): Promise<any>;
  createLookalikeAudience?(
    id: string,
    accessToken: string,
    audienceId: string,
    input: MetaAudienceInput
  ): Promise<any>;
  deliveryEstimate?(
    id: string,
    accessToken: string,
    targeting: Record<string, any>
  ): Promise<any>;
  searchLocations?(
    accessToken: string,
    query: string
  ): Promise<any>;
  searchProducts?(
    accessToken: string,
    catalogId: string,
    query?: string
  ): Promise<any>;
  scheduleLiveVideo?(
    id: string,
    accessToken: string,
    data: Record<string, any>
  ): Promise<any>;
  syncConversations?(
    accessToken: string,
    data: Record<string, any>,
    id: string,
    integration?: Integration
  ): Promise<any>;
  replyToConversation?(
    accessToken: string,
    data: { recipientId: string; message: string },
    id: string,
    integration?: Integration
  ): Promise<any>;
  getSubscriptions?(
    id: string,
    accessToken: string,
    input?: Record<string, any>
  ): Promise<any>;
  subscribeEvents?(
    id: string,
    accessToken: string,
    input: Record<string, any>
  ): Promise<any>;
  unsubscribeEvents?(
    id: string,
    accessToken: string,
    input: Record<string, any>
  ): Promise<any>;

  // ── Conversion API (TikTok CAPI & Meta CAPI) ────────
  sendConversionEvent?(
    id: string,
    accessToken: string,
    event: Record<string, any>
  ): Promise<any>;
  batchConversionEvents?(
    id: string,
    accessToken: string,
    events: Record<string, any>[]
  ): Promise<any>;

  // ── Pixel / Event Source Management ──────────────────
  listPixels?(id: string, accessToken: string): Promise<any[]>;

  // ── Async Reporting ─────────────────────────────────
  createReportTask?(
    id: string,
    accessToken: string,
    options: Record<string, any>
  ): Promise<any>;
  getReportTaskStatus?(
    id: string,
    accessToken: string,
    taskId: string
  ): Promise<any>;

  // ── Identity / Spark Ads (TikTok) ───────────────────
  listIdentities?(id: string, accessToken: string): Promise<any[]>;
  createIdentity?(
    id: string,
    accessToken: string,
    input: Record<string, any>
  ): Promise<any>;
  requestSparkAdAuth?(
    id: string,
    accessToken: string,
    authCode: string
  ): Promise<any>;

  // ── Creative Portfolio ──────────────────────────────
  listCreativePortfolio?(id: string, accessToken: string): Promise<any[]>;

  // ── Campaign / AdGroup / Ad Listing & Deletion ──────
  listCampaigns?(id: string, accessToken: string): Promise<any[]>;
  deleteCampaign?(
    id: string,
    accessToken: string,
    campaignId: string
  ): Promise<any>;
  listAdGroups?(
    id: string,
    accessToken: string,
    campaignId?: string
  ): Promise<any[]>;
  listAds?(
    id: string,
    accessToken: string,
    adGroupId?: string
  ): Promise<any[]>;

  // ── Rich Media Messaging (WhatsApp) ─────────────────
  sendMediaMessage?(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      type: 'image' | 'video' | 'document' | 'audio' | 'sticker' | 'location' | 'contacts';
      payload: Record<string, any>;
    }
  ): Promise<any>;

  // ── Interactive Messages (WhatsApp) ─────────────────
  sendInteractiveMessage?(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      interactiveType: 'button' | 'list' | 'product' | 'product_list' | 'cta_url' | 'flow';
      payload: Record<string, any>;
    }
  ): Promise<any>;

  // ── Template Messages / Broadcast (WhatsApp) ────────
  sendTemplateMessage?(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      templateName: string;
      languageCode: string;
      components?: Record<string, any>[];
    }
  ): Promise<any>;
  sendBroadcast?(
    id: string,
    accessToken: string,
    data: {
      recipients: string[];
      templateName: string;
      languageCode: string;
      components?: Record<string, any>[];
    }
  ): Promise<any>;

  // ── Template CRUD (WhatsApp) ────────────────────────
  createTemplate?(
    id: string,
    accessToken: string,
    data: Record<string, any>
  ): Promise<any>;
  deleteTemplate?(
    id: string,
    accessToken: string,
    templateName: string
  ): Promise<any>;

  // ── Commerce / Product Messages (WhatsApp) ──────────
  sendProductMessage?(
    id: string,
    accessToken: string,
    data: {
      recipientId: string;
      catalogId: string;
      productRetailerId?: string;
      sections?: Record<string, any>[];
    }
  ): Promise<any>;

  // ── A/B Testing / Experiments (Meta) ────────────────
  createExperiment?(
    id: string,
    accessToken: string,
    input: Record<string, any>
  ): Promise<any>;
  getExperimentResults?(
    id: string,
    accessToken: string,
    studyId: string
  ): Promise<any>;

  // ── Automated Ad Rules (Meta) ───────────────────────
  createAdRule?(
    id: string,
    accessToken: string,
    input: Record<string, any>
  ): Promise<any>;
  listAdRules?(id: string, accessToken: string): Promise<any[]>;
}

export type PostResponse = {
  id: string; // The db internal id of the post
  postId: string; // The ID of the scheduled post returned by the platform
  releaseURL: string; // The URL of the post on the platform
  status: string; // Status of the operation or initial post status
};

export type PostDetails<T = any> = {
  id: string;
  message: string;
  settings: T;
  media?: MediaContent[];
  poll?: PollDetails;
};

export type PollDetails = {
  options: string[]; // Array of poll options
  duration: number; // Duration in hours for which the poll will be active
};

export type MediaContent = {
  type: 'image' | 'video'; // Type of the media content
  path: string;
  alt?: string;
  thumbnail?: string;
  thumbnailTimestamp?: number;
};

export type FetchPageInformationResult = {
  id: string;
  name: string;
  access_token: string;
  picture: string;
  username: string;
};

export interface SocialProvider
  extends IAuthenticator,
    ISocialMediaIntegration {
  identifier: string;
  refreshWait?: boolean;
  convertToJPEG?: boolean;
  refreshCron?: boolean;
  dto?: any;
  maxLength: (additionalSettings?: any) => number;
  isWeb3?: boolean;
  isChromeExtension?: boolean;
  extensionCookies?: { name: string; domain: string }[];
  editor: 'none' | 'normal' | 'markdown' | 'html';
  customFields?: () => Promise<
    {
      key: string;
      label: string;
      defaultValue?: string;
      validation: string;
      type: 'text' | 'password';
    }[]
  >;
  name: string;
  toolTip?: string;
  oneTimeToken?: boolean;
  isBetweenSteps: boolean;
  scopes: string[];
  externalUrl?: (
    url: string
  ) => Promise<{ client_id: string; client_secret: string }>;
  mention?: (
    token: string,
    data: { query: string },
    id: string,
    integration: Integration
  ) => Promise<
    | { id: string; label: string; image: string; doNotCache?: boolean }[]
    | { none: true }
  >;
  mentionFormat?(idOrHandle: string, name: string): string;
  fetchPageInformation?(
    accessToken: string,
    data: any
  ): Promise<FetchPageInformationResult>;
  afterConnect?(
    accessToken: string,
    information: FetchPageInformationResult
  ): Promise<void>;
}
