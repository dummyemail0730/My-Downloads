import { getAccessToken } from '../lib/googleAuth';

export interface DriveTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  quality: 'FLAC [LOSSLESS]' | 'MP3 [320KBPS]' | 'M4A [256KBPS]' | 'HQ STREAM';
  size: string;
  link: string;
  streamUrl: string;
  image?: string;
  protocol: string;
  fileId: string;
  mimeType: string;
}

export interface DriveFolder {
  id: string;
  name: string;
}

export const formatFileSize = (bytes?: string | number): string => {
  if (!bytes) return 'N/A';
  const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(b)) return 'N/A';
  if (b >= 1024 * 1024 * 1024) return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
};

export const parseTrackQuality = (fileName: string, mimeType: string): 'FLAC [LOSSLESS]' | 'MP3 [320KBPS]' | 'M4A [256KBPS]' | 'HQ STREAM' => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.flac') || mimeType.includes('flac')) return 'FLAC [LOSSLESS]';
  if (lower.endsWith('.m4a') || mimeType.includes('m4a') || mimeType.includes('mp4')) return 'M4A [256KBPS]';
  if (lower.endsWith('.mp3') || mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'MP3 [320KBPS]';
  return 'HQ STREAM';
};

export const isAudioFile = (fileName: string, mimeType?: string): boolean => {
  if (!fileName) return false;
  const mime = (mimeType || '').toLowerCase();
  const name = fileName.toLowerCase();

  // Reject explicit non-audio mimeTypes
  if (
    mime.startsWith('image/') || 
    mime.startsWith('video/') || 
    mime.includes('zip') || 
    mime.includes('rar') || 
    mime.includes('pdf') || 
    mime.includes('json') || 
    mime.includes('html') || 
    mime.includes('javascript') || 
    mime.includes('executable')
  ) {
    return false;
  }

  // Reject explicit non-audio extensions
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|mp4|mkv|avi|mov|wmv|flv|zip|rar|7z|tar|gz|iso|exe|pdf|txt|doc|docx|apk|msi)$/i.test(name)) {
    return false;
  }

  // Accept if mimeType is explicitly audio
  if (mime.startsWith('audio/')) {
    return true;
  }

  // Accept valid audio extensions
  if (/\.(mp3|flac|m4a|wav|ogg|aac|wma|opus|aiff|alac|m4p)$/i.test(name)) {
    return true;
  }

  return false;
};

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(/\s+/)
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ')
    .trim();
}

export const cleanRawTitle = (rawTitle: string): { title: string; artist: string } => {
  if (!rawTitle) return { title: 'Untitled Audio Track', artist: 'Google Drive Audio' };
  
  let name = rawTitle.replace(/\.(mp3|flac|m4a|wav|ogg|aac|wma|opus|aiff)$/i, '').trim();

  // Strip YouTube / Downloader tags
  name = name.replace(/[-_]?(official[-_]music[-_]video|official[-_]video|lyric[-_]video|official[-_]audio|hd|1080p|720p|128[-_]ytshorts|savetube|ytmp3|y2mate).*$/i, '').trim();
  name = name.replace(/\((official\s*(music\s*)?video|lyric\s*video|official\s*audio)\)/i, '').trim();

  // 1. Standard "Artist - Title"
  if (name.includes(' - ') || name.includes(' – ') || name.includes(' — ')) {
    const parts = name.split(/\s+[-–—]\s+/);
    if (parts.length >= 2) {
      return {
        artist: capitalizeWords(parts[0].trim()),
        title: parts.slice(1).join(' - ').trim()
      };
    }
  }

  // 2. Hyphenated ft pattern: "abra-ft-chito-miranda-diwata" or "Abra-ft-thyro-jeriko-aguilar-Gayuma"
  if (/^[a-z0-9\s]+[-_](ft|feat)[-_]/i.test(name)) {
    const ftMatch = name.match(/^([a-z0-9\s]+)[-_](ft|feat)[-_](.+)$/i);
    if (ftMatch) {
      const mainArtist = capitalizeWords(ftMatch[1].replace(/[-_]/g, ' ').trim());
      const rest = ftMatch[3];
      const restParts = rest.split(/[-_]+/);
      
      if (restParts.length > 1) {
        const songTitle = restParts[restParts.length - 1];
        const featArtists = restParts.slice(0, restParts.length - 1).join(' ');
        return {
          artist: `${mainArtist} ft. ${capitalizeWords(featArtists)}`,
          title: capitalizeWords(songTitle)
        };
      }
      return {
        artist: mainArtist,
        title: capitalizeWords(rest.replace(/[-_]/g, ' '))
      };
    }
  }

  // 3. Simple "Artist_Title"
  if (name.includes('_')) {
    const parts = name.split('_').filter(Boolean);
    if (parts.length === 2) {
      return {
        artist: capitalizeWords(parts[0].trim()),
        title: capitalizeWords(parts[1].trim())
      };
    }
  }

  return { title: name, artist: 'Google Drive Audio' };
};

export const fetchDriveMusicFiles = async (
  token: string,
  folderId?: string,
  search?: string
): Promise<{ tracks: DriveTrack[]; folders: DriveFolder[]; nextPageToken?: string }> => {
  let allFiles: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore = true;
  let pageCount = 0;

  // Loop through pages to collect all files (up to 100 pages = 10,000 items max)
  while (hasMore && pageCount < 100) {
    pageCount++;
    let data: any = null;

    // 1. Try Express server proxy first (for Google AI Studio / Cloud Run)
    try {
      const params = new URLSearchParams();
      params.set('pageSize', '100');
      if (folderId) params.set('folderId', folderId);
      if (search) params.set('search', search);
      if (pageToken) params.set('pageToken', pageToken);

      const res = await fetch(`/api/drive/files?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        }
      }
    } catch (e) {
      // Ignore express server error and fallback to direct Google Drive REST API
    }

    // 2. Direct Fallback: Google Drive v3 REST API (works on Vercel & static hosting)
    if (!data || !data.files) {
      const directUrl = new URL('https://www.googleapis.com/drive/v3/files');
      let q = "trashed = false and (mimeType contains 'audio' or mimeType = 'application/vnd.google-apps.folder' or name contains '.mp3' or name contains '.m4a' or name contains '.flac' or name contains '.wav' or name contains '.ogg' or name contains '.aac')";
      if (folderId) {
        q = `'${folderId}' in parents and (${q})`;
      }
      if (search) {
        q = `name contains '${search.replace(/'/g, "\\'")}' and (${q})`;
      }

      directUrl.searchParams.set('q', q);
      directUrl.searchParams.set('pageSize', '100');
      directUrl.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, webViewLink, webContentLink)');
      directUrl.searchParams.set('orderBy', 'folder,name');
      if (pageToken) directUrl.searchParams.set('pageToken', pageToken);

      const directRes = await fetch(directUrl.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!directRes.ok) {
        const errText = await directRes.text();
        throw new Error(`Google Drive API error (${directRes.status}): ${errText}`);
      }

      data = await directRes.json();
    }

    const files = data.files || [];
    allFiles = [...allFiles, ...files];

    pageToken = data.nextPageToken;
    if (!pageToken || files.length === 0) {
      hasMore = false;
    }
  }

  const tracks: DriveTrack[] = [];
  const folders: DriveFolder[] = [];

  for (const item of allFiles) {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      folders.push({
        id: item.id,
        name: item.name
      });
    } else if (isAudioFile(item.name, item.mimeType)) {
      // Parse clean title and singer/artist name
      const { title, artist } = cleanRawTitle(item.name);

      const quality = parseTrackQuality(item.name, item.mimeType || '');
      
      // Dual stream URL: Direct Google Drive API stream media URL (works anywhere) + fallback Express route
      const streamUrl = token
        ? `https://www.googleapis.com/drive/v3/files/${item.id}?alt=media&access_token=${encodeURIComponent(token)}`
        : `/api/drive/audio-stream?fileId=${item.id}`;

      tracks.push({
        id: `gdrive-${item.id}`,
        fileId: item.id,
        title: title || item.name,
        artist: artist || 'Google Drive Audio',
        duration: '03:45',
        quality,
        size: formatFileSize(item.size),
        link: item.webContentLink || item.webViewLink || streamUrl,
        streamUrl,
        mimeType: item.mimeType || 'audio/mpeg',
        protocol: 'GDRIVE_STREAM'
      });
    }
  }

  return { tracks, folders, nextPageToken: pageToken };
};
