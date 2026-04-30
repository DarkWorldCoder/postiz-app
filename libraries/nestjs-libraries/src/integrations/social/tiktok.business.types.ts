/**
 * TikTok Business API – extended type definitions
 * Used by tiktok.business.provider.ts for Conversion API, Async Reporting,
 * Identity / Spark Ads, and Creative Portfolio features.
 */

// ── Conversion API (Events / CAPI) ─────────────────────

export interface TikTokConversionEvent {
  /** Pixel ID or Events API ID */
  pixel_code: string;
  /** e.g. 'CompletePayment', 'AddToCart', 'ViewContent' */
  event: string;
  /** ISO-8601 timestamp */
  timestamp: string;
  context?: {
    ad?: { callback?: string };
    page?: { url?: string; referrer?: string };
    user?: {
      external_id?: string;
      phone_number?: string;
      email?: string;
      ttp?: string;
    };
    user_agent?: string;
    ip?: string;
  };
  properties?: Record<string, any>;
  /** Client dedup event_id */
  event_id?: string;
}

export interface TikTokConversionBatchPayload {
  pixel_code: string;
  batch: TikTokConversionEvent[];
  /** Test event code for validation */
  test_event_code?: string;
}

// ── Async Reporting ────────────────────────────────────

export interface TikTokReportTaskInput {
  report_type?: string;
  data_level?: string;
  dimensions: string[];
  metrics: string[];
  start_date: string;
  end_date: string;
  filtering?: Record<string, any>;
  order_field?: string;
  order_type?: 'ASC' | 'DESC';
}

export interface TikTokReportTask {
  task_id: string;
  status: 'QUEUING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';
  download_url?: string;
}

// ── Identity / Spark Ads ───────────────────────────────

export interface TikTokIdentity {
  identity_id: string;
  identity_type: 'CUSTOMIZED_USER' | 'AUTH_CODE' | 'TT_USER';
  display_name?: string;
  profile_image?: string;
}

export interface TikTokSparkAdAuthRequest {
  /** The authorization code shared by the creator */
  auth_code: string;
}

export interface TikTokSparkAdAuthResult {
  identity_id: string;
  identity_type: string;
  authorized_bc_id?: string;
}

// ── Creative Portfolio ─────────────────────────────────

export interface TikTokCreativePortfolioItem {
  creative_id: string;
  name: string;
  status: string;
  preview_url?: string;
  created_at?: string;
}

// ── Pixel Management ───────────────────────────────────

export interface TikTokPixel {
  pixel_id: string;
  pixel_code: string;
  pixel_name: string;
  status: string;
}
