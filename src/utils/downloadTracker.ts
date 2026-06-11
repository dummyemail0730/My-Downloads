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
  'default-anime-s2': 154,
  'default-anime-movie': 342,
};

// Generates a deterministic fallback seed if not hardcoded
const getFallbackSeed = (id: string, name: string): number => {
  let hash = 0;
  const str = id + name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 90) + 9; // Fallback between 9 and 99 downloads
};

export const getDownloadCount = (type: 'software' | 'tool' | 'anime', id: string, name: string): number => {
  if (typeof window === 'undefined') return 9;
  
  const key = `downloads_${type}_${id}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    const num = parseInt(saved, 10);
    return isNaN(num) ? 9 : num;
  }

  // Get seeds based on category type
  let seed = 9;
  if (type === 'software') {
    seed = SOFTWARE_SEEDS[id] || getFallbackSeed(id, name);
  } else if (type === 'tool') {
    seed = TOOL_SEEDS[id] || getFallbackSeed(id, name);
  } else if (type === 'anime') {
    seed = ANIME_SEEDS[id] || getFallbackSeed(id, name);
  }

  localStorage.setItem(key, seed.toString());
  return seed;
};

export const incrementDownloadCount = (type: 'software' | 'tool' | 'anime', id: string, name: string): number => {
  if (typeof window === 'undefined') return 10;

  const key = `downloads_${type}_${id}`;
  const current = getDownloadCount(type, id, name);
  const nextVal = current + 1;
  localStorage.setItem(key, nextVal.toString());

  // Notify components to update download views
  window.dispatchEvent(new Event('shadow_download_sync'));
  return nextVal;
};
