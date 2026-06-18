// Download tracker utility for persistent and realistic download counts
// Stores counts dynamically in localStorage and triggers global synchronization events.

const SOFTWARE_SEEDS: { [key: string]: number } = {
  '1': 284,
  '2': 195,
  '3': 315,
  '4': 45,
  '5': 78,
};

const TOOL_SEEDS: { [key: string]: number } = {
  '1': 512,
  '2': 142,
  '3': 293,
  '4': 405,
  '5': 219,
  '6': 638,
  '7': 87,
};

const ANIME_SEEDS: { [key: string]: number } = {
  'default-anime-s2': 54,
  'default-anime-movie': 72,
};

const MUSIC_SEEDS: { [key: string]: number } = {
  'default-music-1': 328,
  'default-music-2': 415,
  'default-music-3': 189,
  'default-music-4': 247,
  'default-music-5': 533,
  'default-music-6': 294,
};

// Generates a deterministic fallback seed if not hardcoded
const getFallbackSeed = (id: string, name: string): number => {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 450) + 45; // Fallback between 45 and 495 downloads
};

export const getDownloadCount = (type: 'software' | 'tool' | 'anime' | 'music', id: string, name: string): number => {
  if (typeof window === 'undefined') return 9;
  
  const key = `downloads_${type}_${id}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    const num = parseInt(saved, 10);
    const val = isNaN(num) ? 9 : num;
    return Math.min(val, 90);
  }

  // Get seeds based on category type
  let seed = 9;
  if (type === 'software') {
    const rawSeed = SOFTWARE_SEEDS[id] || getFallbackSeed(id, name);
    seed = Math.min((rawSeed % 35) + 45, 90);
  } else if (type === 'tool') {
    const rawSeed = TOOL_SEEDS[id] || getFallbackSeed(id, name);
    seed = Math.min((rawSeed % 35) + 45, 90);
  } else if (type === 'anime') {
    const rawSeed = ANIME_SEEDS[id] || getFallbackSeed(id, name);
    seed = Math.min((rawSeed % 35) + 45, 90); // Deterministic initial value between 45 and 80
  } else if (type === 'music') {
    const rawSeed = MUSIC_SEEDS[id] || getFallbackSeed(id, name);
    seed = Math.min((rawSeed % 35) + 45, 90);
  }

  localStorage.setItem(key, seed.toString());
  return Math.min(seed, 90);
};

export const incrementDownloadCount = (type: 'software' | 'tool' | 'anime' | 'music', id: string, name: string): number => {
  if (typeof window === 'undefined') return 10;

  const key = `downloads_${type}_${id}`;
  const current = getDownloadCount(type, id, name);
  let nextVal = current + 1;
  if (nextVal > 90) {
    nextVal = 90;
  }
  localStorage.setItem(key, nextVal.toString());

  // Notify components to update download views
  window.dispatchEvent(new Event('shadow_download_sync'));
  return nextVal;
};
