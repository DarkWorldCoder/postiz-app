const PLATFORM_ICON_ALIASES: Record<string, string> = {
  'facebook-ads': 'facebook',
  'facebook-messages': 'facebook',
  'instagram-messages': 'instagram',
  'tiktok-business': 'tiktok',
};

const WHATSAPP_IDENTIFIERS = new Set([
  'whatsapp',
  'whatsapp-business',
  'whatsapp-messages',
  'whatsapp-business-messages',
]);

export const getPlatformIcon = (identifier?: string) => {
  if (!identifier) {
    return '/no-picture.jpg';
  }

  if (identifier === 'youtube') {
    return '/icons/platforms/youtube.svg';
  }

  if (WHATSAPP_IDENTIFIERS.has(identifier)) {
    return '/icons/platforms/whatsapp.svg';
  }

  return `/icons/platforms/${PLATFORM_ICON_ALIASES[identifier] || identifier}.png`;
};
