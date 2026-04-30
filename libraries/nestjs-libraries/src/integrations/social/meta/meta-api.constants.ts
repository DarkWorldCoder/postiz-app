const DEFAULT_META_GRAPH_API_VERSION = 'v25.0';

export const getMetaGraphApiVersion = (override?: string) =>
  override ||
  process.env.META_GRAPH_API_VERSION ||
  process.env.FACEBOOK_API_VERSION ||
  DEFAULT_META_GRAPH_API_VERSION;

export const metaGraphUrl = (path: string, version?: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `https://graph.facebook.com/${getMetaGraphApiVersion(version)}${normalizedPath}`;
};

export const metaOAuthDialogUrl = (path: string, version?: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `https://www.facebook.com/${getMetaGraphApiVersion(version)}${normalizedPath}`;
};
