import { getUrl } from 'aws-amplify/storage';

const CDN_DOMAIN = import.meta.env.VITE_CDN_DOMAIN || 'https://your-cdn-domain.com';

export const resolveS3Url = (key: string | null | undefined): string => {
  if (!key) return '';

  // If it's already a full URL, return it
  if (key.startsWith('http')) return key;

  // Transform S3 keys to CloudFront/CDN URLs (e.g., app.shazacin.com/public/images/...)
  // Based on the old app's S3ImageComponent logic:
  // It replaces the S3 domain and strips the signature.

  // Normalize key (if it starts with 'public/', keep it, but ensure no leading slash)
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;

  return `${CDN_DOMAIN}/${cleanKey}`;
};
