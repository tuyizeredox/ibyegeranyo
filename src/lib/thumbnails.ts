import type { Documentary } from '@/lib/types';
import { getVideoThumbnail } from '@/lib/cloudinary';

// Server-only: resolves a card/backdrop image so client components never need
// to import the Cloudinary SDK.
const fallbacks = [
  'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,h_540,q_auto,w_960/samples/landscapes/nature-mountains.jpg',
  'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,h_540,q_auto,w_960/samples/landscapes/landscape-panorama.jpg',
  'https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,h_540,q_auto,w_960/samples/animals/three-dogs.jpg',
];

export function getDocumentaryThumbnail(documentary: Documentary): string {
  if (documentary.thumbnailUrl) return documentary.thumbnailUrl;
  if (documentary.cloudinaryPublicId) return getVideoThumbnail(documentary.cloudinaryPublicId);
  return fallbacks[documentary.id.charCodeAt(0) % fallbacks.length];
}
