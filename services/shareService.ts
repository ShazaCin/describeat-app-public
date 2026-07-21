import { Title } from '../types';

/**
 * Composes a premium sharing message for a title.
 */
export const composeShareText = (title: Title): string => {
  const intro = `Experience ${title.title} like never before with Audio Descriptions on describeAT!`;
  const yearText = title.year ? ` (${title.year})` : '';
  const synopsisSnippet = title.synopsis
    ? `\n\n"${title.synopsis.length > 150 ? title.synopsis.substring(0, 147) + '...' : title.synopsis}"`
    : '';
  const tagline = `\n\nListen in, see everything. 🎧✨`;

  return `${intro}${yearText}${synopsisSnippet}${tagline}`;
};

/**
 * Fetches an image URL and converts it to a File object for the Web Share API.
 */
export const urlToFile = async (url: string, fileName: string, mimeType: string): Promise<File | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Failed to convert URL to file:', error);
    return null;
  }
};

/**
 * Updates social metadata dynamically for better link unfurling.
 */
export const updateSocialMetadata = (title: Title) => {
  // Update document title
  document.title = `${title.title} - describeAT`;

  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', title.synopsis || `Audio descriptions for ${title.title}`);

  // Update OG tags (if present/needed)
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', title.synopsis || '');

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && title.images.poster) ogImage.setAttribute('content', title.images.poster);
};
