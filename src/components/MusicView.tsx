import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Download, Music, Disc, ListMusic, Volume2, RefreshCw, AlertCircle, 
  Search, Folder, CheckCircle2, CloudDownload, Sparkles, LogIn, LogOut, ChevronRight, HardDrive, Trash2, Filter,
  Pencil, Edit3, Check, X, Wand2, Shuffle
} from 'lucide-react';

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

  // Strip YouTube / Downloader clutter
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
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';
import { googleSignIn, googleSignOut, initAuth, getAccessToken } from '../lib/googleAuth';
import { fetchDriveMusicFiles, DriveTrack, DriveFolder, isAudioFile } from '../utils/googleDriveMusic';

import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  quality: 'FLAC [LOSSLESS]' | 'MP3 [320KBPS]' | 'M4A [256KBPS]' | 'HQ STREAM';
  size: string;
  link: string;
  streamUrl?: string;
  image: string;
  protocol?: string;
  description?: string;
  fileId?: string;
  isDrive?: boolean;
  mimeType?: string;
}

export interface MusicViewProps {
  isAdmin?: boolean;
}

export default function MusicView({ isAdmin = false }: MusicViewProps) {
  const [downloadSync, setDownloadSync] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('00:00');
  const [durationFormatted, setDurationFormatted] = useState<string>('00:00');
  const [playerVolume, setPlayerVolume] = useState<number>(80);

  // Admin Verification for Google Drive account changes
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(isAdmin);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminPasscodeError, setAdminPasscodeError] = useState<string>('');
  const [pendingDriveAction, setPendingDriveAction] = useState<'signin' | 'signout' | 'switch' | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setIsAuthorizedAdmin(true);
    }
  }, [isAdmin]);

  // Google Drive Auth & Sync states
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [isDriveScanning, setIsDriveScanning] = useState<boolean>(false);
  const [driveScanMessage, setDriveScanMessage] = useState<string>('');
  const [scannedDriveTracks, setScannedDriveTracks] = useState<DriveTrack[]>([]);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDrivePanel, setShowDrivePanel] = useState<boolean>(false);
  const [hidePresetSamples, setHidePresetSamples] = useState<boolean>(false);
  const [isRandomized, setIsRandomized] = useState<boolean>(false);

  // HTML Audio Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default initial sample tracks
  const defaultSampleTracks: Track[] = [
    {
      id: 'default-music-1',
      title: 'HIGHEST (Official Theme)',
      artist: 'OxT // Seven Shadows Alliance',
      duration: '04:12',
      quality: 'FLAC [LOSSLESS]',
      size: '38.4 MB',
      link: 'https://docs.google.com/uc?export=download&id=1j7-F13a96kCg2vU_nKk_w_uX4Z7vS1Yp', 
      image: shadowElectricity,
      protocol: 'HQ STREAM'
    },
    {
      id: 'default-music-2',
      title: 'Darling in the Night',
      artist: 'Seven Shadows Operatives',
      duration: '03:48',
      quality: 'FLAC [LOSSLESS]',
      size: '34.2 MB',
      link: 'https://docs.google.com/uc?export=download&id=1pZ0l7F_g6N9I8kL8wX4r5p9s8h7g6f5d',
      image: shadowAura,
      protocol: 'HQ FLAC'
    },
    {
      id: 'default-music-3',
      title: 'grArmor (Overdrive Edit)',
      artist: 'OxT Instrumental Network',
      duration: '03:55',
      quality: 'MP3 [320KBPS]',
      size: '9.2 MB',
      link: 'https://docs.google.com/uc?export=download&id=1G8X4h6d5R6f7Y8t9O0P1Q2R3S4T5U6V7',
      image: shadowBlade,
      protocol: 'EXT AUDIO'
    }
  ];

  const [musicList, setMusicList] = useState<Track[]>([]);

  // Persistent library loader & title sanitizer helper with deduplication
  const sanitizeTrackList = (tracks: Track[]): Track[] => {
    const seenIds = new Set<string>();
    const result: Track[] = [];

    for (const t of tracks) {
      if (!t || !t.id) continue;
      // Strictly filter out non-audio items (photos, zip archives, office files, video tutorials, executables)
      if (t.isDrive || t.protocol === 'GDRIVE_STREAM' || t.fileId) {
        if (!isAudioFile(t.title, t.mimeType)) {
          continue;
        }
      }

      if (seenIds.has(t.id)) {
        continue; // Deduplicate tracks with identical ID
      }
      seenIds.add(t.id);

      let item = t;
      if (!t.artist || t.artist === 'Google Drive Library' || t.artist === 'Google Drive Audio' || t.title.includes('-ft-') || t.title.includes(' - ') || t.title.includes('_')) {
        const { title: cleanTitle, artist: cleanArtist } = cleanRawTitle(t.title);
        item = {
          ...t,
          title: cleanTitle || t.title,
          artist: (t.artist && t.artist !== 'Google Drive Library' && t.artist !== 'Google Drive Audio') ? t.artist : (cleanArtist || 'Google Drive Audio')
        };
      }
      result.push(item);
    }

    return result;
  };

  // Inline track title editing state
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');
  const [editArtistInput, setEditArtistInput] = useState<string>('');

  const handleStartRename = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    setEditingTrackId(track.id);
    setEditTitleInput(track.title);
    setEditArtistInput(track.artist);
  };

  const handleSaveRename = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (!editTitleInput.trim()) return;

    const updated = musicList.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          title: editTitleInput.trim(),
          artist: editArtistInput.trim() || 'Google Drive Library'
        };
      }
      return t;
    });

    setMusicList(updated);
    setEditingTrackId(null);

    try {
      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(updated));
    } catch (err) {}

    saveTracksToBackend(updated);
    setDriveScanMessage(`Renamed track title to "${editTitleInput.trim()}"`);
    setTimeout(() => setDriveScanMessage(''), 3000);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrackId(null);
  };

  const handleAutoCleanTitles = () => {
    const cleaned = musicList.map(t => {
      const { title: cleanTitle, artist: cleanArtist } = cleanRawTitle(t.title);
      return {
        ...t,
        title: cleanTitle,
        artist: cleanArtist || t.artist || 'Google Drive Audio'
      };
    });
    setMusicList(cleaned);
    try {
      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(cleaned));
    } catch (e) {}
    saveTracksToBackend(cleaned);
    setDriveScanMessage('Successfully cleaned all raw numeric filenames!');
    setTimeout(() => setDriveScanMessage(''), 3000);
  };

  // Load persistent library from backend Firestore / API endpoint
  const loadPersistentLibrary = async () => {
    try {
      const res = await fetch('/api/music/library');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
          setMusicList(sanitizeTrackList(data.tracks));
          setHidePresetSamples(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load persistent library from backend:', e);
    }

    // Fallback to local storage if API empty
    let savedDriveTracks: Track[] = [];
    try {
      const stored = localStorage.getItem('shadow_gdrive_tracks');
      if (stored) {
        savedDriveTracks = JSON.parse(stored);
      }
    } catch (e) {}

    if (savedDriveTracks.length > 0) {
      setMusicList(sanitizeTrackList(savedDriveTracks));
      setHidePresetSamples(true);
    } else {
      setMusicList(defaultSampleTracks);
    }
  };

  useEffect(() => {
    loadPersistentLibrary();
  }, []);

  // Filter music list based on user search query and sample filters, sorted alphabetically by singer name
  const filteredMusicList = useMemo(() => {
    let list = musicList;
    if (hidePresetSamples) {
      const driveOnly = list.filter(t => t.isDrive || !t.id.startsWith('default-music-'));
      if (driveOnly.length > 0) {
        list = driveOnly;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
    }

    // ALWAYS sort alphabetically by Singer / Artist Name (A to Z)
    return [...list].sort((a, b) => {
      const singerA = (a.artist || 'Google Drive Audio').trim();
      const singerB = (b.artist || 'Google Drive Audio').trim();

      const singerCompare = singerA.localeCompare(singerB, undefined, { sensitivity: 'base', numeric: true });
      if (singerCompare !== 0) {
        return singerCompare;
      }

      // Secondary sort by Song Title (A to Z)
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      return titleA.localeCompare(titleB, undefined, { sensitivity: 'base', numeric: true });
    });
  }, [musicList, searchQuery, hidePresetSamples]);

  const activeTrack = useMemo(() => {
    return filteredMusicList[currentTrackIndex] || filteredMusicList[0] || musicList[0];
  }, [filteredMusicList, musicList, currentTrackIndex]);

  // Auth Initialization Listener & Auto-Sync
  useEffect(() => {
    const handleAuth = async (user: any, token: string) => {
      setDriveUser(user);
      setDriveAccessToken(token);
      if (token) {
        autoScanDrive(token);
      }
    };

    const unsubscribe = initAuth(
      handleAuth,
      () => {
        const storedToken = getAccessToken();
        if (storedToken) {
          setDriveAccessToken(storedToken);
          setDriveUser({ displayName: 'Google Drive User', email: 'Connected Account' });
          autoScanDrive(storedToken);
        } else {
          setDriveUser(null);
          setDriveAccessToken(null);
        }
      }
    );

    // Initial check on mount
    const existingToken = getAccessToken();
    if (existingToken && !driveAccessToken) {
      setDriveAccessToken(existingToken);
      setDriveUser({ displayName: 'Google Drive User', email: 'Connected Account' });
      autoScanDrive(existingToken);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Automatic Drive Music Scanner
  const autoScanDrive = async (token: string) => {
    if (!token || isDriveScanning) return;
    setIsDriveScanning(true);
    setDriveScanMessage('Syncing with your Google Drive music files...');

    try {
      const { tracks, folders } = await fetchDriveMusicFiles(token);
      setScannedDriveTracks(tracks);
      setDriveFolders(folders);

      if (tracks.length > 0) {
        handleImportDriveTracksToDeck(tracks);
        setDriveScanMessage(`Synced ${tracks.length} track(s) from your Google Drive!`);
      } else {
        setDriveScanMessage('Drive scan complete. No audio files found in connected Google Drive.');
      }
    } catch (err: any) {
      console.warn('Auto drive scan error:', err);
      setDriveScanMessage(`Drive Sync: ${err.message || 'Ready'}`);
    } finally {
      setIsDriveScanning(false);
      setTimeout(() => setDriveScanMessage(''), 4000);
    }
  };

  // System Sync Listeners
  useEffect(() => {
    const handleDownloadSync = () => setDownloadSync(prev => prev + 1);
    window.addEventListener('shadow_download_sync', handleDownloadSync);
    return () => {
      window.removeEventListener('shadow_download_sync', handleDownloadSync);
    };
  }, []);

  // Audio Playback Engine Handler
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = playerVolume / 100;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setPlayerProgress(pct);

        const curMins = Math.floor(audio.currentTime / 60);
        const curSecs = Math.floor(audio.currentTime % 60);
        setCurrentTimeFormatted(`${curMins.toString().padStart(2, '0')}:${curSecs.toString().padStart(2, '0')}`);

        const durMins = Math.floor(audio.duration / 60);
        const durSecs = Math.floor(audio.duration % 60);
        setDurationFormatted(`${durMins.toString().padStart(2, '0')}:${durSecs.toString().padStart(2, '0')}`);
      }
    };

    const handleEnded = () => {
      // Auto advance to next track (or pick random track if randomize mode enabled)
      if (filteredMusicList.length > 0) {
        let nextIdx = 0;
        if (isRandomized) {
          nextIdx = Math.floor(Math.random() * filteredMusicList.length);
        } else {
          nextIdx = (currentTrackIndex + 1) % filteredMusicList.length;
        }
        setCurrentTrackIndex(nextIdx);
        setIsPlaying(true);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playerVolume, currentTrackIndex, filteredMusicList, isRandomized]);

  // Randomize track selection and toggle shuffle playback
  const handleRandomize = () => {
    if (filteredMusicList.length === 0) return;
    const randomIdx = Math.floor(Math.random() * filteredMusicList.length);
    setCurrentTrackIndex(randomIdx);
    setIsPlaying(true);
    setIsRandomized(true);
    if (audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(err => console.warn('Randomize play error:', err));
      }, 100);
    }
  };

  // Handle Play/Pause operations
  const handlePlayToggle = (index?: number) => {
    if (index !== undefined && index !== currentTrackIndex) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      if (audioRef.current) {
        setTimeout(() => {
          audioRef.current?.play().catch(err => console.warn('Audio play prevented:', err));
        }, 100);
      }
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(err => console.warn('Audio play error:', err));
        setIsPlaying(true);
      }
    }
  };

  // Trigger Google Sign-In with Admin Guard
  const triggerGoogleSignIn = () => {
    if (!isAdmin && !isAuthorizedAdmin) {
      setPendingDriveAction('signin');
      setAdminPasscodeInput('');
      setAdminPasscodeError('');
      setShowAdminPasscodeModal(true);
      return;
    }
    handleGoogleSignIn();
  };

  const triggerGoogleSignOut = () => {
    if (!isAdmin && !isAuthorizedAdmin) {
      setPendingDriveAction('signout');
      setAdminPasscodeInput('');
      setAdminPasscodeError('');
      setShowAdminPasscodeModal(true);
      return;
    }
    handleGoogleSignOut();
  };

  const handleVerifyAdminPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = adminPasscodeInput.trim();
    if (!code) {
      setAdminPasscodeError('Please enter the Admin Passcode.');
      return;
    }

    let isValid = false;

    // Validate against stored passcodes / master codes
    const storedGuestPasscode = localStorage.getItem('generated_guest_passcode');
    if (
      code === 'kgab0730' || 
      code === '102490' || 
      code === 'SHADOW2026' || 
      (storedGuestPasscode && code.toLowerCase() === storedGuestPasscode.toLowerCase())
    ) {
      isValid = true;
    } else {
      try {
        const res = await fetch('/api/validate-passcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: code })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid) isValid = true;
        }
      } catch (err) {}
    }

    if (isValid) {
      setIsAuthorizedAdmin(true);
      setShowAdminPasscodeModal(false);
      setAdminPasscodeInput('');
      setAdminPasscodeError('');

      if (pendingDriveAction === 'signin' || pendingDriveAction === 'switch') {
        handleGoogleSignIn();
      } else if (pendingDriveAction === 'signout') {
        handleGoogleSignOut();
      }
      setPendingDriveAction(null);
    } else {
      setAdminPasscodeError('Incorrect Admin Passcode. Only authorized admins can modify Google Drive account connection.');
    }
  };

  // Google Sign-In Trigger
  const handleGoogleSignIn = async () => {
    try {
      setDriveScanMessage('Connecting to Google Drive...');
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveAccessToken(result.accessToken);
        setDriveScanMessage('Successfully authenticated with Google Drive!');
        await autoScanDrive(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setDriveScanMessage(`Auth Error: ${err.message || 'Failed to sign in'}`);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setDriveUser(null);
    setDriveAccessToken(null);
    setDriveScanMessage('Signed out from Google Drive.');
    setTimeout(() => setDriveScanMessage(''), 3000);
  };

  // Google Drive Music Scanner
  const handleScanDriveMusic = async () => {
    const token = driveAccessToken || getAccessToken();
    if (!token) {
      handleGoogleSignIn();
      return;
    }

    setIsDriveScanning(true);
    setDriveScanMessage('Scanning Google Drive for all ~500+ audio tracks across folders...');

    try {
      const { tracks, folders } = await fetchDriveMusicFiles(
        token,
        selectedFolderId || undefined
      );

      setScannedDriveTracks(tracks);
      setDriveFolders(folders);
      setDriveScanMessage(`Found ${tracks.length} MP3/Audio file(s) in Google Drive!`);

      // Auto import scanned tracks to deck & save to Firestore!
      if (tracks.length > 0) {
        handleImportDriveTracksToDeck(tracks);
      }
    } catch (err: any) {
      console.error('Drive scan error:', err);
      setDriveScanMessage(`Scan Failed: ${err.message || 'Error reading Drive files'}`);
    } finally {
      setIsDriveScanning(false);
    }
  };

  // Save music array to Firestore backend
  const saveTracksToBackend = async (tracksToSave: Track[]) => {
    try {
      await fetch('/api/music/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: tracksToSave })
      });
    } catch (e) {
      console.warn('Failed to post music library to backend:', e);
    }
  };

  // Import Scanned Google Drive Tracks to Sound Deck and Firestore Database
  const handleImportDriveTracksToDeck = (tracksToImport: DriveTrack[]) => {
    if (tracksToImport.length === 0) return;

    const fallbackImages = [shadowBlade, shadowAura, shadowElectricity];
    const convertedTracks: Track[] = tracksToImport.map((dt, idx) => ({
      id: dt.id,
      fileId: dt.fileId,
      title: dt.title,
      artist: dt.artist,
      duration: dt.duration || '03:45',
      quality: dt.quality as any,
      size: dt.size,
      link: dt.link,
      streamUrl: dt.streamUrl,
      image: fallbackImages[idx % fallbackImages.length],
      protocol: 'GDRIVE_STREAM',
      isDrive: true,
      mimeType: dt.mimeType
    }));

    const convertedMap = new Map(convertedTracks.map(t => [t.id, t]));
    
    // Update existing tracks if their titles were missing or 'Audio Track #'
    const updatedExisting = musicList.filter(m => m.isDrive).map(existing => {
      const fresh = convertedMap.get(existing.id);
      if (fresh) {
        if (!existing.title || existing.title.startsWith('Audio Track #') || existing.title.includes('Audio Track #')) {
          return { ...existing, title: fresh.title, artist: fresh.artist };
        }
      }
      return existing;
    });

    const existingIds = new Set(updatedExisting.map(m => m.id));
    const newTracks = convertedTracks.filter(t => !existingIds.has(t.id));

    const combined = [...newTracks, ...updatedExisting];
    const finalTrackList = sanitizeTrackList(combined.length > 0 ? combined : convertedTracks);

    setMusicList(finalTrackList);
    setHidePresetSamples(true);

    try {
      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(finalTrackList));
    } catch (e) {}

    // Save permanently to Firestore database
    saveTracksToBackend(finalTrackList);

    setDriveScanMessage(`Uploaded & saved ${finalTrackList.length} song(s) to Portal Database!`);
    setTimeout(() => setDriveScanMessage(''), 5000);
  };

  // Remove preset dummy songs
  const handleRemovePresetSongs = async () => {
    const driveOnly = musicList.filter(t => t.isDrive || !t.id.startsWith('default-music-'));
    setMusicList(driveOnly);
    setHidePresetSamples(true);
    try {
      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(driveOnly));
    } catch (e) {}
    await saveTracksToBackend(driveOnly);
    setDriveScanMessage('Removed preset sample songs. Showing your Google Drive files only.');
    setTimeout(() => setDriveScanMessage(''), 3000);
  };

  // Track download trigger
  const handleDownloadTrigger = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    incrementDownloadCount('music', track.id, track.title);
    if (typeof window !== 'undefined' && (window as any).logUserMovement) {
      (window as any).logUserMovement('action', `Streamed/Downloaded "${track.title}" from Music Deck`);
    }

    const downloadTarget = track.link || track.streamUrl;
    if (downloadTarget) {
      if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
        (window as any).triggerRedirectLoader(downloadTarget, track.title);
      } else {
        window.open(downloadTarget, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Stream URL calculation for active track
  const activeStreamUrl = useMemo(() => {
    if (!activeTrack) return undefined;
    if (activeTrack.streamUrl) return activeTrack.streamUrl;
    if (activeTrack.link && activeTrack.link.includes('drive.google.com/file/d/')) {
      const match = activeTrack.link.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `/api/drive/audio-stream?fileId=${match[1]}&token=${encodeURIComponent(driveAccessToken || '')}`;
      }
    }
    return activeTrack.link || undefined;
  }, [activeTrack, driveAccessToken]);

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans select-none relative overflow-y-auto">
      
      {/* Hidden Audio Player Element */}
      <audio 
        ref={audioRef}
        src={activeStreamUrl || undefined}
        preload="metadata"
      />

      {/* Top Banner & Player Dashboard */}
      <div className="border-b border-neutral-900 p-6 md:p-8 bg-neutral-950 flex flex-col xl:flex-row gap-6 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-radial-gradient from-purple-950/15 via-transparent to-transparent pointer-events-none" />
        
        {/* Dynamic Vinyl Record Wrapper */}
        <div className="w-full sm:w-64 h-64 mx-auto flex-shrink-0 relative flex items-center justify-center p-3 rounded-2xl border border-neutral-900 bg-neutral-900/40 backdrop-blur-md shadow-2xl">
          <div className="absolute inset-2 rounded-full border border-neutral-800/40 animate-pulse pointer-events-none" />
          
          {/* Main Vinyl CD Disc layout */}
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="w-56 h-56 rounded-full bg-black border-[6px] border-neutral-800 flex items-center justify-center relative shadow-black/80 shadow-2xl overflow-hidden"
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-4 rounded-full border border-neutral-700/10" />
            <div className="absolute inset-8 rounded-full border border-neutral-700/15" />
            <div className="absolute inset-12 rounded-full border border-neutral-700/20" />
            <div className="absolute inset-16 rounded-full border border-neutral-700/25" />
            
            {/* Custom Album Art Center */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black relative z-10 flex-shrink-0">
              <img 
                src={activeTrack?.image || shadowElectricity} 
                alt="Album Cover" 
                className="w-full h-full object-cover brightness-[0.8]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-neutral-950/25 flex items-center justify-center">
                <Disc className={`w-10 h-10 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>
            
            {/* CD Hole center pin */}
            <div className="w-5 h-5 bg-neutral-900 rounded-full border border-neutral-800 absolute z-20" />
          </motion.div>
        </div>

        {/* Player controls details */}
        <div className="flex-1 flex flex-col justify-between p-1">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/20 text-purple-400 border border-purple-800/20 uppercase tracking-[0.1em]">
                  {activeTrack?.quality || 'FLAC [LOSSLESS]'}
                </span>
                {activeTrack?.isDrive && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/30 uppercase tracking-wider flex items-center gap-1">
                    <HardDrive size={10} /> GOOGLE DRIVE
                  </span>
                )}
                <span className="text-[9px] font-mono font-extrabold text-neutral-500 uppercase tracking-widest hidden sm:inline">
                  // PORTAL_AUDIO_DECK
                </span>
              </div>

              {/* Toggle Google Drive Sync Control Panel */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDrivePanel(!showDrivePanel)}
                  className="text-xs font-mono font-extrabold px-3 py-1 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 text-purple-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HardDrive size={13} className="text-purple-400" />
                  <span>{showDrivePanel ? 'CLOSE DRIVE PANEL' : 'GOOGLE DRIVE SYNC'}</span>
                </button>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide mb-1 leading-tight line-clamp-1">
              {activeTrack?.title || 'No Audio Selected'}
            </h2>
            <p className="text-sm font-mono text-purple-400 font-bold mb-4">
              {activeTrack?.artist || 'Portal Music Archives'}
            </p>
            
            {/* Fake wave spectrum animation */}
            <div className="h-10 flex items-end gap-[3px] mb-6 py-1 select-none overflow-hidden pl-1">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = isPlaying ? Math.floor(Math.random() * 32) + 4 : 2;
                return (
                  <motion.div 
                    key={i}
                    animate={{ height }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className={`w-[3px] rounded-none opacity-85 transition-colors duration-300 ${
                      isPlaying 
                        ? i % 2 === 0 ? 'bg-purple-500' : 'bg-cyan-400'
                        : 'bg-neutral-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Interactive Player Deck Bar */}
          <div className="space-y-4">
            {/* Progress Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-500 w-10">{currentTimeFormatted}</span>
              <div 
                className="flex-grow h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                  setPlayerProgress(pct);
                  if (audioRef.current && audioRef.current.duration) {
                    audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
                  }
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-150" 
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 w-10 text-right">
                {durationFormatted !== '00:00' ? durationFormatted : (activeTrack?.duration || '03:45')}
              </span>
            </div>

            {/* Audio Deck Bottom Button Grid */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayToggle()}
                  className={`h-11 px-6 flex items-center justify-center gap-2 border text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer shadow-lg ${
                    isPlaying 
                      ? 'border-purple-500 bg-purple-950/40 text-purple-300' 
                      : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={13} className="fill-purple-300 text-purple-300 animate-pulse" />
                      <span>PAUSE TRACK</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="fill-white text-white" />
                      <span>PLAY TRACK</span>
                    </>
                  )}
                </button>
                
                {/* Download active track */}
                {activeTrack && (
                  <button
                    onClick={(e) => handleDownloadTrigger(e, activeTrack)}
                    className="h-11 px-5 flex items-center justify-center gap-2 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 hover:text-white rounded-xl font-mono text-xs font-extrabold uppercase tracking-wide transition-all duration-300 cursor-pointer shadow-md"
                    title="Download selected track"
                  >
                    <Download size={13} />
                    <span>DOWNLOAD THIS SONG</span>
                    <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded-md border border-cyan-800/30 font-bold ml-0.5">
                      {getDownloadCount('music', activeTrack.id, activeTrack.title)}
                    </span>
                  </button>
                )}
              </div>

              {/* Volume Slider Control */}
              <div className="flex items-center gap-2 font-mono text-neutral-500">
                <Volume2 size={13} className="text-neutral-500" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={playerVolume} 
                  onChange={(e) => setPlayerVolume(Number(e.target.value))}
                  className="w-20 md:w-24 accent-purple-500 h-1 rounded-none cursor-pointer bg-neutral-800 border-none outline-none"
                />
                <span className="text-[11px] leading-none text-neutral-400 min-w-8 text-right font-mono font-bold">
                  {playerVolume}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Integration Control Panel */}
      <AnimatePresence>
        {showDrivePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-purple-900/30 bg-gradient-to-b from-purple-950/30 to-neutral-950 p-6 overflow-hidden"
          >
            <div className="max-w-5xl mx-auto space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-800/40 flex items-center justify-center text-purple-400">
                    <HardDrive size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white font-mono tracking-wide">
                      Google Drive MP3 Library Auto-Importer & Database Sync
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Scan your Google Drive to automatically import all ~500+ MP3 songs directly into Firebase Firestore!
                    </p>
                  </div>
                </div>

                {/* Sign-in / Auth State */}
                <div>
                  {driveUser ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          Synced Account: {driveUser.email || driveUser.displayName || 'Google Account'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-[10px] font-mono font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded uppercase">
                          ADMIN MANAGED
                        </span>
                        <button
                          onClick={triggerGoogleSignOut}
                          className="text-[11px] font-mono text-neutral-400 hover:text-red-400 ml-1 cursor-pointer flex items-center gap-1 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800"
                          title="Only Admin can switch or sign out Google Drive account"
                        >
                          <LogOut size={12} /> Sign Out (Admin)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerGoogleSignIn}
                        className="bg-white hover:bg-neutral-100 text-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3 font-medium text-xs shadow-lg transition-all cursor-pointer border border-neutral-300"
                      >
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>Connect Google Drive (Admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {driveScanMessage && (
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs font-mono text-purple-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400 shrink-0" />
                  <span>{driveScanMessage}</span>
                </div>
              )}

              {/* Scanner controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleScanDriveMusic}
                  disabled={isDriveScanning}
                  className="h-10 px-5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isDriveScanning ? 'animate-spin' : ''} />
                  <span>{isDriveScanning ? 'Scanning Google Drive...' : 'SCAN & SYNC ALL GOOGLE DRIVE MUSIC'}</span>
                </button>

                {driveFolders.length > 0 && (
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="h-10 px-3 bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 rounded-xl outline-none"
                  >
                    <option value="">All Drive Folders</option>
                    {driveFolders.map(f => (
                      <option key={f.id} value={f.id}>📁 {f.name}</option>
                    ))}
                  </select>
                )}

                {scannedDriveTracks.length > 0 && (
                  <button
                    onClick={() => handleImportDriveTracksToDeck(scannedDriveTracks)}
                    className="h-10 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg ml-auto"
                  >
                    <CloudDownload size={14} />
                    <span>Save {scannedDriveTracks.length} Tracks to Portal DB</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Directory Selection List */}
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-2 text-neutral-400">
            <ListMusic size={15} className="text-purple-400" />
            <h3 className="text-xs uppercase font-black tracking-widest font-mono">
              PORTAL MUSIC DECK ({filteredMusicList.length} / {musicList.length} AUDIO FILES)
            </h3>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md uppercase flex items-center gap-1 font-bold">
              <Filter size={10} /> SINGER (A-Z)
            </span>
          </div>
          
          {/* Search Bar and Randomize button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className={`px-3 py-1.5 border rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isRandomized
                  ? 'bg-purple-900/60 hover:bg-purple-800/80 border-purple-500/60 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 hover:text-white'
              }`}
              title="Play a random song and enable randomize playback"
            >
              <Shuffle size={13} className={`text-cyan-400 ${isRandomized ? 'animate-pulse text-purple-300' : ''}`} />
              <span className="hidden sm:inline">{isRandomized ? 'RANDOMIZED' : 'RANDOMIZE'}</span>
            </button>

            <div className="relative min-w-[200px] sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search songs, artists, or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 rounded-xl outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {filteredMusicList.map((track, idx) => {
            const isSelected = activeTrack?.id === track.id;
            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => handlePlayToggle(idx)}
                className={`group flex items-center justify-between gap-3 p-4 border rounded-xl transition-all duration-250 cursor-pointer select-none relative overflow-hidden ${
                  isSelected 
                    ? 'border-purple-500/50 bg-gradient-to-r from-purple-950/20 via-purple-900/5 to-neutral-900 shadow-[0_0_20px_rgba(168,85,247,0.12)]' 
                    : 'border-neutral-800/80 bg-neutral-900/35 hover:border-purple-500/20 hover:bg-neutral-900/65'
                }`}
              >
                {/* Audio Frequency Waves Background Deco */}
                <div className="absolute inset-x-0 bottom-0 top-0 z-0 overflow-hidden pointer-events-none opacity-[0.06] group-hover:opacity-[0.14] transition-opacity duration-300">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path d="M 0 25 C 50 10, 100 40, 150 25 C 200 10, 250 40, 300 25 C 350 10, 400 40, 450 25 C 500 10, 550 40, 600 25 C 650 10, 700 40, 750 25" stroke="currentColor" strokeWidth="2.5" className={isSelected ? "text-purple-400 animate-pulse" : "text-neutral-400"} />
                    <path d="M 0 35 C 40 25, 80 50, 120 35 C 160 20, 200 50, 240 35 C 280 20, 320 50, 360 35 C 400 20, 440 50, 480 35 C 520 20, 560 50, 600 35 C 640 20, 680 50, 720 35" stroke="currentColor" strokeWidth="1.5" className={isSelected ? "text-cyan-400" : "text-neutral-500"} />
                  </svg>
                </div>
                
                {/* Left side album image & info description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
                  
                  {/* Music State Indicator Button */}
                  <div className="relative w-10 h-10 flex-shrink-0 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      src={track.image || shadowElectricity} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10">
                      {isSelected && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <div className="w-[2px] h-2 bg-purple-400 animate-pulse" />
                          <div className="w-[2px] h-3 bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-[2px] h-1 bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      ) : (
                        <Music size={13} className={isSelected ? "text-purple-400 animate-pulse" : "text-neutral-500 group-hover:text-neutral-300"} />
                      )}
                    </div>
                  </div>

                  {editingTrackId === track.id ? (
                    <div 
                      className="min-w-0 flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        placeholder="Song Title..."
                        className="flex-1 px-3 py-1.5 bg-neutral-950 border border-purple-500 rounded-lg text-xs font-bold text-white focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editArtistInput}
                        onChange={(e) => setEditArtistInput(e.target.value)}
                        placeholder="Artist Name..."
                        className="w-36 sm:w-44 px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 focus:outline-none"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleSaveRename(e, track.id)}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Save Title"
                        >
                          <Check size={13} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 
                          className={`text-sm font-extrabold tracking-wide leading-snug break-words ${
                            isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                          }`}
                          title={track.title}
                        >
                          {track.title}
                        </h4>
                        {track.isDrive && (
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.2 rounded shrink-0">
                            GDRIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-300 truncate" title={track.artist}>
                          {track.artist}
                        </p>
                        <button
                          onClick={(e) => handleStartRename(e, track)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-purple-400 transition-all rounded hover:bg-neutral-800/60 cursor-pointer flex items-center gap-1 text-[10px] font-mono shrink-0"
                          title="Rename track title"
                        >
                          <Pencil size={11} />
                          <span className="hidden sm:inline">Rename</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side download stats and operations */}
                <div className="flex items-center gap-4 flex-shrink-0 relative z-10">
                  <div className="hidden sm:flex flex-col items-end text-right font-mono">
                    <span className="text-[9px] font-black tracking-widest text-neutral-500 group-hover:text-neutral-400">
                      {track.quality || 'MP3 [320KBPS]'}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold">
                      {track.size || '12.4 MB'}
                    </span>
                  </div>

                  <div className="font-mono text-xs text-neutral-400 font-bold hidden md:block min-w-[45px] text-center">
                    {track.duration}
                  </div>

                  {/* Special Custom Styled download icon showing exact downloads count */}
                  <button
                    onClick={(e) => handleDownloadTrigger(e, track)}
                    className="h-9 px-3 shrink-0 flex items-center justify-center gap-1.5 border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-white rounded-lg transition-all duration-300 cursor-pointer shadow-md text-[11px] font-extrabold uppercase font-mono tracking-wider hover:scale-[1.03]"
                    title="Download audio stream"
                  >
                    <Download size={13} className="shrink-0 text-purple-400" />
                    <span>{getDownloadCount('music', track.id, track.title)}</span>
                  </button>
                </div>

              </div>
            );
          })}

          {filteredMusicList.length === 0 && (
            <div className="p-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20 space-y-3">
              <Music size={32} className="mx-auto text-neutral-600" />
              <p className="text-sm font-mono text-neutral-400 font-bold">
                No music files found matching "{searchQuery}".
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-xs font-mono text-purple-400 rounded-xl hover:bg-neutral-800 cursor-pointer"
                >
                  Clear Search Filter
                </button>
                <button
                  onClick={() => setShowDrivePanel(true)}
                  className="px-4 py-2 bg-purple-600 text-xs font-mono font-bold text-white rounded-xl hover:bg-purple-500 cursor-pointer"
                >
                  Open Google Drive Sync Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Passcode Modal for Google Drive Account Security */}
      <AnimatePresence>
        {showAdminPasscodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-neutral-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                <div className="flex items-center gap-2 text-purple-400 font-mono text-sm font-bold uppercase">
                  <HardDrive size={18} />
                  <span>Admin Authorization Required</span>
                </div>
                <button
                  onClick={() => setShowAdminPasscodeModal(false)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-neutral-300 font-mono mb-4 leading-relaxed">
                Only the system <strong className="text-purple-400">Administrator</strong> can connect, switch, or disconnect the synced Google Drive account. Enter the Admin Passcode to proceed:
              </p>

              <form onSubmit={handleVerifyAdminPasscode} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={adminPasscodeInput}
                    onChange={(e) => {
                      setAdminPasscodeInput(e.target.value);
                      setAdminPasscodeError('');
                    }}
                    placeholder="Enter Admin Passcode..."
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 focus:border-purple-500 rounded-xl text-sm font-mono text-white placeholder-neutral-500 outline-none transition-colors"
                    autoFocus
                  />
                  {adminPasscodeError && (
                    <p className="text-xs text-red-400 font-mono mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{adminPasscodeError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscodeModal(false)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors shadow-lg"
                  >
                    Authorize & Proceed
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
