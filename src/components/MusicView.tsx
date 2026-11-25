import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Music, Volume2, VolumeX, Search, Trash2, Plus, 
  SkipForward, SkipBack, X, Shuffle, Link, RefreshCw, AlertCircle, Settings,
  Edit3, Check, Sparkles, FolderSync, FolderPlus, Lock, Key
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { initAuth, googleSignIn, getAccessToken, setAccessToken } from '../lib/googleAuth';
import {
  auth,
  loadMusicLibraryFromFirestore,
  syncMusicLibraryToFirestore,
  isFirebaseAdminUser,
  hasStrictAdminAuthority,
  getAdminIdToken,
} from '../firebase';
import GoogleSignInButton from './GoogleSignInButton';
import DrivePickerTrigger from './DrivePickerModal';
import type { PickedDriveFile } from '../lib/googlePicker';

import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  quality?: string;
  size: string;
  link: string;
  streamUrl?: string;
  image: string;
  fileId?: string;
  isDrive?: boolean;
  playlists?: string[];
  protocol?: string;
}

export interface MusicViewProps {
  isAdmin?: boolean;
}

// Helper to extract Google Drive Folder ID
export function extractDriveFolderId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  const match = 
    str.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
    str.match(/[?&]folderId=([a-zA-Z0-9_-]+)/) ||
    str.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (match && match[1] && match[1].length > 8) {
    return match[1];
  }

  return null;
}

// Helper to extract Google Drive file ID from any URL or raw string
export function extractDriveFileId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();
  
  if (str.startsWith('gdrive-')) {
    const raw = str.replace('gdrive-', '');
    if (raw.length > 8 && !raw.includes('/')) return raw;
  }

  const match = 
    str.match(/\/files\/([a-zA-Z0-9_-]+)/) ||
    str.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    str.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    str.match(/[?&]fileId=([a-zA-Z0-9_-]+)/);

  if (match && match[1] && match[1].length > 8) {
    return match[1];
  }

  if (/^[a-zA-Z0-9_-]{20,50}$/.test(str)) {
    return str;
  }

  return null;
}

// Helper to parse filename or title into { artist, title }
export function parseAudioTitleAndArtist(rawName: string): { title: string; artist: string } {
  if (!rawName) return { title: 'Untitled Track', artist: 'Google Drive MP3' };
  
  let name = rawName.replace(/\.(mp3|flac|m4a|wav|ogg|aac|wma|opus|aiff)$/i, '').trim();

  // Strip trailing metadata brackets e.g. "(Official Music Video)", "[320kbps]", "(Lyric Video)"
  name = name.replace(/[\(\[](official[-_ ]*(music[-_ ]*)?video|official[-_ ]*audio|lyric[-_ ]*video|hd|1080p|720p|320kbps|lossless).*?[\)\]]/gi, '').trim();

  // Strip leading track numbers e.g. "01. ", "01 - ", "01 ", "1 - "
  name = name.replace(/^[0-9]{1,3}\s*[\.\-–—]\s*/, '').trim();

  // Check for artist - title delimiter
  const parts = name.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    if (/^[0-9]{1,3}$/.test(parts[0].trim())) {
      if (parts.length >= 3) {
        return {
          artist: parts[1].trim(),
          title: parts.slice(2).join(' - ').trim()
        };
      } else {
        return {
          artist: 'Google Drive MP3',
          title: parts[1].trim()
        };
      }
    }
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }

  if (name.includes('_') && !name.includes(' ')) {
    const uParts = name.split('_').filter(Boolean);
    if (uParts.length >= 2) {
      return {
        artist: uParts[0].trim(),
        title: uParts.slice(1).join(' ').trim()
      };
    }
  }

  return { title: name, artist: 'Google Drive MP3' };
}

const DEFAULT_MUSIC_TRACKS: Track[] = [
  {
    id: 'default-track-1',
    fileId: '1zUW4zza5mVJYG2DETaSEHVPUq26mLPqT',
    title: 'HIGHEST (Official Theme)',
    artist: 'OxT / Shadow Garden',
    duration: '03:45',
    quality: 'FLAC [LOSSLESS]',
    size: '12.4 MB',
    link: 'https://drive.google.com/file/d/1zUW4zza5mVJYG2DETaSEHVPUq26mLPqT/view',
    streamUrl: '/api/drive/audio-stream?fileId=1zUW4zza5mVJYG2DETaSEHVPUq26mLPqT',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    protocol: 'GDRIVE_STREAM',
    isDrive: true
  },
  {
    id: 'default-track-2',
    fileId: '1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY',
    title: 'School Life (OST Theme)',
    artist: 'Eminence in Shadow',
    duration: '02:50',
    quality: 'MP3 [320KBPS]',
    size: '8.1 MB',
    link: 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view',
    streamUrl: '/api/drive/audio-stream?fileId=1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    protocol: 'GDRIVE_STREAM',
    isDrive: true
  },
  {
    id: 'default-track-3',
    fileId: '1-eZazHgsDtT0xAW94L2woWfK4sbFPC71',
    title: 'Xado Theme Orchestral',
    artist: 'Shadow Symphony',
    duration: '04:12',
    quality: 'FLAC [LOSSLESS]',
    size: '15.6 MB',
    link: 'https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view',
    streamUrl: '/api/drive/audio-stream?fileId=1-eZazHgsDtT0xAW94L2woWfK4sbFPC71',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    protocol: 'GDRIVE_STREAM',
    isDrive: true
  },
  {
    id: 'default-track-4',
    fileId: '1JOkYke7BPH_i8A6biBkw3hclsnAwFrOv',
    title: 'Shadow Garden Lofi Chill',
    artist: 'Lo-fi Music Suite',
    duration: '03:18',
    quality: 'MP3 [320KBPS]',
    size: '9.2 MB',
    link: 'https://drive.google.com/file/d/1JOkYke7BPH_i8A6biBkw3hclsnAwFrOv/view',
    streamUrl: '/api/drive/audio-stream?fileId=1JOkYke7BPH_i8A6biBkw3hclsnAwFrOv',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    protocol: 'GDRIVE_STREAM',
    isDrive: true
  }
];

export default function MusicView({ isAdmin = false }: MusicViewProps) {
  // Main Track Library State
  const [musicList, setMusicList] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem('shadow_gdrive_tracks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MUSIC_TRACKS;
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('00:00');
  const [durationFormatted, setDurationFormatted] = useState<string>('00:00');
  const [playerVolume, setPlayerVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRandomized, setIsRandomized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MP3 Add Password Modal State
  const [showMp3PasswordModal, setShowMp3PasswordModal] = useState<boolean>(false);
  const [mp3PasswordInput, setMp3PasswordInput] = useState<string>('');
  const [mp3PasswordError, setMp3PasswordError] = useState<string>('');

  // Persistent Playlist State
  const [playlists, setPlaylists] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shadow_music_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.includes('All') ? parsed : ['All', ...parsed];
        }
      }
    } catch (e) {}
    return ['All'];
  });
  const [activePlaylist, setActivePlaylist] = useState<string>('All');
  const [showPlaylistModal, setShowPlaylistModal] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [playlistMsg, setPlaylistMsg] = useState<string>('');

  // Manage Songs in Playlist Modal State
  const [showManagePlaylistModal, setShowManagePlaylistModal] = useState<boolean>(false);
  const [targetPlaylistForManage, setTargetPlaylistForManage] = useState<string>('');
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState<string>('');

  // Quick Track Playlist Popover State
  const [activePlaylistTrackMenu, setActivePlaylistTrackMenu] = useState<string | null>(null);

  // Music Admin Console Modal State
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);
  
  // Console Inputs
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputTitle, setInputTitle] = useState<string>('');
  const [inputArtist, setInputArtist] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [consoleMsg, setConsoleMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Track Modal State
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editArtist, setEditArtist] = useState<string>('');

  // In-memory Google OAuth state & Firebase Admin state
  const [driveToken, setDriveToken] = useState<string | null>(() => getAccessToken());
  const [firebaseAdmin, setFirebaseAdmin] = useState<boolean>(() => isFirebaseAdminUser());
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveToken(token);
        setFirebaseAdmin(isFirebaseAdminUser(user));
      },
      () => setDriveToken(null)
    );
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseAdmin(isFirebaseAdminUser(user));
    });
    const handlePickerTracksUpdate = () => {
      try {
        const stored = localStorage.getItem('shadow_gdrive_tracks');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMusicList(parsed);
          }
        }
      } catch (_) {}
    };
    window.addEventListener('shadow_picker_music_added', handlePickerTracksUpdate);
    return () => {
      unsubscribe();
      unsubAuth();
      window.removeEventListener('shadow_picker_music_added', handlePickerTracksUpdate);
    };
  }, []);

  const savePlaylistsToStorage = (newPlaylists: string[]) => {
    if (!isAdmin) return;
    setPlaylists(newPlaylists);
    try {
      localStorage.setItem('shadow_music_playlists', JSON.stringify(newPlaylists));
    } catch (e) {}
    saveLibraryToServer(musicList, newPlaylists);
  };

  const handleAddMp3Click = () => {
    if (!isAdmin) {
      setMp3PasswordInput('');
      setMp3PasswordError('Admin passcode + Admin Google sign-in required.');
      setShowMp3PasswordModal(true);
      return;
    }
    setShowAdminConsole(true);
  };

  const handleVerifyMp3Password = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawInput = mp3PasswordInput.trim();
    if (!rawInput) {
      setMp3PasswordError('Please enter admin passcode.');
      return;
    }

    // Strict master portal admin passphrase check only (never accept guest or default passcodes)
    let isMasterAdmin = false;
    try {
      const msgBuffer = new TextEncoder().encode(rawInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      if (hashHex === 'cf7a14191ac01a39913eadfae86c9e032ec7bd69fe01d452113f54ea6eef68ef') {
        isMasterAdmin = true;
      }
    } catch (err) {
      if (btoa(rawInput) === 'S0dhYjA3MzA=') {
        isMasterAdmin = true;
      }
    }

    if (!isMasterAdmin) {
      setMp3PasswordError('Access denied. Valid Master Admin passcode required.');
      return;
    }

    if (!isFirebaseAdminUser()) {
      try {
        const res = await googleSignIn();
        if (!res?.user || !isFirebaseAdminUser(res.user)) {
          setMp3PasswordError('Sign in with the verified Admin Google account to continue.');
          return;
        }
      } catch (err: any) {
        setMp3PasswordError(err?.message || 'Admin Google sign-in required for permanent edits.');
        return;
      }
    }

    sessionStorage.setItem('is_admin_mode', 'true');
    setFirebaseAdmin(true);
    setShowMp3PasswordModal(false);
    setShowAdminConsole(true);
  };

  const handleCreatePlaylistSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    const trimmed = newPlaylistName.trim();
    if (!trimmed) {
      setPlaylistMsg('Please enter a playlist name.');
      return;
    }
    if (playlists.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setPlaylistMsg('Playlist with this name already exists.');
      return;
    }
    const updatedPlaylists = [...playlists, trimmed];
    savePlaylistsToStorage(updatedPlaylists);
    setActivePlaylist(trimmed);
    setNewPlaylistName('');
    setShowPlaylistModal(false);

    // Open option to add music in that playlist immediately!
    setTargetPlaylistForManage(trimmed);
    setPlaylistSearchQuery('');
    setShowManagePlaylistModal(true);
  };

  const handleDeletePlaylist = (playlistToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin || playlistToDelete === 'All') return;

    if (!window.confirm(`Are you sure you want to remove the playlist "${playlistToDelete}"? Songs will remain in your main deck.`)) {
      return;
    }

    const updatedPlaylists = playlists.filter(p => p !== playlistToDelete);
    savePlaylistsToStorage(updatedPlaylists);

    const updatedTracks = musicList.map(t => {
      if (!t.playlists) return t;
      return {
        ...t,
        playlists: t.playlists.filter(p => p !== playlistToDelete)
      };
    });

    setMusicList(updatedTracks);
    saveLibraryToServer(updatedTracks, updatedPlaylists);

    if (activePlaylist === playlistToDelete) {
      setActivePlaylist('All');
    }
  };

  const handleToggleTrackInPlaylist = (trackId: string, playlistName: string) => {
    if (!isAdmin) return;
    const updatedTracks = musicList.map(t => {
      if (t.id !== trackId) return t;
      const current = t.playlists || [];
      const exists = current.includes(playlistName);
      const next = exists 
        ? current.filter(p => p !== playlistName)
        : [...current, playlistName];
      return { ...t, playlists: next };
    });

    setMusicList(updatedTracks);
    saveLibraryToServer(updatedTracks);
  };

  const handleSelectAllTracksForPlaylist = (playlistName: string, selectAll: boolean) => {
    if (!isAdmin) return;
    const updatedTracks = musicList.map(t => {
      const current = t.playlists || [];
      let next = current.filter(p => p !== playlistName);
      if (selectAll) {
        next.push(playlistName);
      }
      return { ...t, playlists: next };
    });

    setMusicList(updatedTracks);
    saveLibraryToServer(updatedTracks);
  };

  // Load persistent library on mount & purge any old local tracks if needed
  useEffect(() => {
    loadLibrary();
  }, []);

  const autoFixUnresolvedTracks = async (tracks: Track[]) => {
    let token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const unresolved = tracks.filter(t => t.fileId && (t.title.startsWith("Audio Track ") || t.artist === "Google Drive MP3" || t.artist === "Custom Audio"));
    if (unresolved.length === 0) return;

    let updatedList = [...tracks];
    let changed = false;

    for (const track of unresolved) {
      if (!track.fileId) continue;
      try {
        const res = await fetch(`/api/drive/file-info?fileId=${track.fileId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.name && !data.name.startsWith("Audio Track ")) {
            const { title, artist } = parseAudioTitleAndArtist(data.name);
            updatedList = updatedList.map(t => t.id === track.id ? { ...t, title, artist } : t);
            changed = true;
          }
        }
      } catch (e) {
        console.warn('Auto-fix track info failed:', e);
      }
    }

    if (changed) {
      setMusicList(updatedList);
      saveLibraryToServer(updatedList);
    }
  };

  // Direct Sync with User's Google Drive Music Folder (supports subfolders -> playlists)
  const handleSyncGoogleDriveMusic = async (silent = false) => {
    if (!isAdmin) {
      if (!silent) {
        setSyncStatus({ text: 'Admin authorization required to sync Google Drive Music.', type: 'error' });
        setTimeout(() => setSyncStatus(null), 4000);
      }
      return;
    }
    setIsSaving(true);
    setIsSyncingDrive(true);
    if (!silent) {
      setConsoleMsg({ text: 'Connecting to Google Drive...', type: 'success' });
      setSyncStatus({ text: 'Connecting to Google Drive...', type: 'success' });
    }

    try {
      let token = getAccessToken();
      if (!token) {
        if (silent) {
          setIsSaving(false);
          setIsSyncingDrive(false);
          return;
        }
        const authResult = await googleSignIn();
        if (authResult?.accessToken) {
          token = authResult.accessToken;
          setDriveToken(token);
        }
      }

      if (!token) {
        throw new Error('Google Sign-In required to load your Google Drive Music folder.');
      }

      const fetchSync = async (t: string) =>
        fetch('/api/drive/sync-music', {
          headers: { Authorization: `Bearer ${t}` }
        });

      if (!silent) {
        setConsoleMsg({ text: 'Scanning Google Drive Music folder & playlists...', type: 'success' });
        setSyncStatus({ text: 'Scanning Google Drive Music folder & playlists...', type: 'success' });
      }

      let syncRes = await fetchSync(token);

      if (syncRes.status === 401 && !silent) {
        setAccessToken(null);
        setDriveToken(null);
        const reAuth = await googleSignIn();
        if (reAuth?.accessToken) {
          token = reAuth.accessToken;
          setDriveToken(token);
          syncRes = await fetchSync(token);
        }
      }

      if (!syncRes.ok) {
        const errData = await syncRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to sync Google Drive Music folder.');
      }

      const syncData = await syncRes.json();
      if (syncData.files && Array.isArray(syncData.files) && syncData.files.length > 0) {
        const formatSize = (bytes?: string) => {
          if (!bytes) return 'Drive Audio';
          const num = parseInt(bytes, 10);
          if (isNaN(num)) return 'Drive Audio';
          return `${(num / (1024 * 1024)).toFixed(1)} MB`;
        };

        const syncedTracks: Track[] = syncData.files.map(
          (file: { fileId: string; name: string; size?: string; mimeType?: string; playlists?: string[] }) => {
            const { title, artist } = parseAudioTitleAndArtist(file.name);
            const lowerName = (file.name || '').toLowerCase();
            const quality = lowerName.endsWith('.flac')
              ? 'FLAC [LOSSLESS]'
              : lowerName.endsWith('.m4a')
              ? 'M4A [256KBPS]'
              : 'MP3 [320KBPS]';
            return {
              id: `gdrive-${file.fileId}`,
              fileId: file.fileId,
              title,
              artist,
              duration: '03:45',
              quality,
              size: formatSize(file.size),
              link: `https://drive.google.com/file/d/${file.fileId}/view`,
              streamUrl: `/api/drive/audio-stream?fileId=${file.fileId}`,
              image: shadowElectricity,
              isDrive: true,
              playlists: Array.isArray(file.playlists) ? file.playlists : [],
              protocol: 'GDRIVE_STREAM'
            };
          }
        );

        // Merge playlists from Drive subfolders + existing playlists
        const drivePlaylists: string[] = Array.isArray(syncData.playlists) ? syncData.playlists : [];
        const mergedPlaylists = Array.from(
          new Set(['All', ...playlists.filter((p) => p !== 'All'), ...drivePlaylists.filter((p) => p && p !== 'All')])
        );

        // Replace default placeholder tracks with live Drive tracks, preserving custom manual tracks
        const nonDefaultExisting = musicList.filter((t) => !t.id.startsWith('default-track-'));
        const existingMap = new Map<string, Track>(nonDefaultExisting.map((t) => [t.fileId || t.id, t]));

        for (const st of syncedTracks) {
          const prev = existingMap.get(st.fileId || st.id);
          const mergedTrackPlaylists = Array.from(
            new Set([...(prev?.playlists || []), ...(st.playlists || [])])
          );
          existingMap.set(st.fileId || st.id, {
            ...st,
            playlists: mergedTrackPlaylists
          });
        }

        const combined = Array.from(existingMap.values());
        setPlaylists(mergedPlaylists);
        try {
          localStorage.setItem('shadow_music_playlists', JSON.stringify(mergedPlaylists));
        } catch (_) {}

        setMusicList(combined);
        await saveLibraryToServer(combined, mergedPlaylists);

        const msg = `Synced ${syncedTracks.length} track(s) across ${Math.max(mergedPlaylists.length - 1, 0)} playlist(s) from Google Drive!`;
        setConsoleMsg({ text: msg, type: 'success' });
        setSyncStatus({ text: msg, type: 'success' });
        setTimeout(() => {
          setConsoleMsg(null);
          setSyncStatus(null);
        }, 4500);
        return;
      }

      // Fallback: Fix unresolved tracks if folder was empty
      await autoFixUnresolvedTracks(musicList);

      const noFilesMsg = 'Connected to Google Drive, but no audio files were found in your Music folder.';
      setConsoleMsg({ text: noFilesMsg, type: 'error' });
      setSyncStatus({ text: noFilesMsg, type: 'error' });
      setTimeout(() => {
        setConsoleMsg(null);
        setSyncStatus(null);
      }, 4500);
    } catch (err: any) {
      console.error('Google Drive Sync error:', err);
      const errMsg = err?.message || 'Error connecting to Google Drive.';
      setConsoleMsg({ text: errMsg, type: 'error' });
      setSyncStatus({ text: errMsg, type: 'error' });
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setIsSaving(false);
      setIsSyncingDrive(false);
    }
  };

  const loadLibrary = async () => {
    let loadedTracks: Track[] = [];
    try {
      const firestoreLib = await loadMusicLibraryFromFirestore().catch(() => null);
      if (firestoreLib && Array.isArray(firestoreLib.tracks) && firestoreLib.tracks.length > 0) {
        if (Array.isArray(firestoreLib.playlists) && firestoreLib.playlists.length > 0) {
          const normalized = firestoreLib.playlists.includes('All') ? firestoreLib.playlists : ['All', ...firestoreLib.playlists];
          setPlaylists(normalized);
          try {
            localStorage.setItem('shadow_music_playlists', JSON.stringify(normalized));
          } catch (_) {}
        }
        setMusicList(firestoreLib.tracks);
        try {
          localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(firestoreLib.tracks));
        } catch (_) {}
        return;
      }
    } catch (_) {}

    try {
      const res = await fetch('/api/music/library');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.playlists) && data.playlists.length > 0) {
          const normalized = data.playlists.includes('All') ? data.playlists : ['All', ...data.playlists];
          setPlaylists(normalized);
          try {
            localStorage.setItem('shadow_music_playlists', JSON.stringify(normalized));
          } catch (_) {}
        }
        if (data && Array.isArray(data.tracks)) {
          loadedTracks = data.tracks;
          const onlyDefaults = loadedTracks.every((t) => t.id.startsWith('default-track-'));
          if (loadedTracks.length > 0) {
            setMusicList(loadedTracks);
            localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(loadedTracks));
            autoFixUnresolvedTracks(loadedTracks);
            if (onlyDefaults && isAdmin && getAccessToken()) {
              handleSyncGoogleDriveMusic(true);
            }
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load library from server:', e);
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('shadow_gdrive_tracks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMusicList(parsed);
          autoFixUnresolvedTracks(parsed);
          if (parsed.every((t: Track) => t.id.startsWith('default-track-')) && isAdmin && getAccessToken()) {
            handleSyncGoogleDriveMusic(true);
          }
          return;
        }
      }
    } catch (e) {}

    // Fallback to DEFAULT_MUSIC_TRACKS
    setMusicList(DEFAULT_MUSIC_TRACKS);
    localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(DEFAULT_MUSIC_TRACKS));
    if (isAdmin && getAccessToken()) {
      handleSyncGoogleDriveMusic(true);
    }
  };

  const saveLibraryToServer = async (tracks: Track[], currentPlaylists?: string[], allowEmpty = false) => {
    if (!allowEmpty && tracks.length === 0) return;
    if (!isAdmin) return;

    setIsSaving(true);
    try {
      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(tracks));
      if (currentPlaylists) {
        localStorage.setItem('shadow_music_playlists', JSON.stringify(currentPlaylists));
      }
    } catch (e) {}

    if (!hasStrictAdminAuthority()) {
      setIsSaving(false);
      setConsoleMsg({
        text: 'Sign in with your Admin Google account above to save changes permanently to Firebase.',
        type: 'error',
      });
      return;
    }

    try {
      await syncMusicLibraryToFirestore(tracks, currentPlaylists || playlists).catch((fsErr) => {
        console.warn('Firestore music sync notice:', fsErr);
      });
      const idToken = await getAdminIdToken();
      if (idToken) {
        await fetch('/api/music/library', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            tracks,
            playlists: currentPlaylists || playlists
          })
        });
      }
    } catch (e) {
      console.warn('Failed to save library to server:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered music list based on active playlist & search query
  const filteredMusicList = useMemo(() => {
    let list = musicList;

    // Filter by Active Playlist
    if (activePlaylist !== 'All') {
      list = list.filter(t => t.playlists && t.playlists.includes(activePlaylist));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
    }
    return list;
  }, [musicList, activePlaylist, searchQuery]);

  const activeTrack = useMemo(() => {
    return filteredMusicList[currentTrackIndex] || filteredMusicList[0] || musicList[0];
  }, [filteredMusicList, musicList, currentTrackIndex]);

  // Compute active stream URL (direct or Google Drive proxy)
  const activeStreamUrl = useMemo(() => {
    if (!activeTrack) return undefined;

    const driveId = extractDriveFileId(activeTrack.fileId || activeTrack.link || activeTrack.streamUrl || activeTrack.id);
    if (driveId) {
      const tokenParam = driveToken ? `&token=${encodeURIComponent(driveToken)}` : '';
      return `/api/drive/audio-stream?fileId=${driveId}${tokenParam}`;
    }

    return activeTrack.streamUrl || activeTrack.link || undefined;
  }, [activeTrack, driveToken]);

  // Sync Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : playerVolume / 100;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
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
  }, [playerVolume, isMuted, currentTrackIndex, filteredMusicList, isRandomized]);

  // Playback control effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    if (!activeStreamUrl) {
      setIsPlaying(false);
      return;
    }

    const absUrl = activeStreamUrl.startsWith('http') ? activeStreamUrl : window.location.origin + activeStreamUrl;
    if (audio.src !== absUrl && audio.src !== activeStreamUrl) {
      audio.src = activeStreamUrl;
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [activeStreamUrl, isPlaying]);

  // Add Google Drive Link (Supports Folder Links OR Single MP3 Links)
  const handleAddSingleLink = async () => {
    if (!isAdmin) {
      setConsoleMsg({ text: 'Admin authorization required to modify music library.', type: 'error' });
      return;
    }
    if (!inputUrl.trim()) {
      setConsoleMsg({ text: 'Please enter a Google Drive share link (Folder or File) or audio URL.', type: 'error' });
      return;
    }

    const rawUrl = inputUrl.trim();
    const folderId = extractDriveFolderId(rawUrl);

    // 1. IF USER PASTED A GOOGLE DRIVE FOLDER LINK
    if (folderId && (rawUrl.includes('/folders/') || rawUrl.includes('folderId'))) {
      setIsSaving(true);
      setConsoleMsg({ text: 'Scanning Google Drive folder for MP3 files...', type: 'success' });

      try {
        const token = getAccessToken();
        const scanRes = await fetch(`/api/drive/scan-folder?folderId=${folderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!scanRes.ok) {
          throw new Error('Failed to scan Google Drive folder.');
        }

        const data = await scanRes.json();
        if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
          setConsoleMsg({ 
            text: 'No audio files found in this folder. Make sure the folder share permission is set to "Anyone with the link".', 
            type: 'error' 
          });
          setIsSaving(false);
          return;
        }

        const scannedTracks: Track[] = data.files.map((file: { fileId: string; name: string }) => {
          const { title, artist } = parseAudioTitleAndArtist(file.name);
          return {
            id: `gdrive-${file.fileId}`,
            fileId: file.fileId,
            title: title,
            artist: artist,
            duration: '03:45',
            quality: 'MP3 [320KBPS]',
            size: 'Drive MP3',
            link: `https://drive.google.com/file/d/${file.fileId}/view`,
            streamUrl: `/api/drive/audio-stream?fileId=${file.fileId}`,
            image: shadowElectricity,
            isDrive: true
          };
        });

        // Filter out existing tracks to avoid duplicates
        const existingIds = new Set(musicList.map(t => t.id));
        const newTracks = scannedTracks.filter(t => !existingIds.has(t.id));

        if (newTracks.length === 0) {
          setConsoleMsg({ text: 'All songs in this folder are already added to your deck!', type: 'success' });
          setIsSaving(false);
          return;
        }

        const updated = [...newTracks, ...musicList];
        setMusicList(updated);
        await saveLibraryToServer(updated);

        setInputUrl('');
        setInputTitle('');
        setInputArtist('');
        setConsoleMsg({ 
          text: `Successfully imported ${newTracks.length} song(s) from folder! Song titles and artists extracted.`, 
          type: 'success' 
        });
        setTimeout(() => setConsoleMsg(null), 4000);
      } catch (err: any) {
        console.error('Folder scan error:', err);
        setConsoleMsg({ text: err.message || 'Error scanning Google Drive folder.', type: 'error' });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // 2. SINGLE MP3 / FILE LINK
    const driveId = extractDriveFileId(rawUrl);
    let parsedTitle = inputTitle.trim();
    let parsedArtist = inputArtist.trim();

    if (!parsedTitle) {
      const parsed = parseAudioTitleAndArtist(rawUrl);
      parsedTitle = parsed.title;
      if (!parsedArtist) parsedArtist = parsed.artist;
    }

    if (!parsedArtist) {
      parsedArtist = 'Google Drive Audio';
    }

    const newTrack: Track = {
      id: driveId ? `gdrive-${driveId}` : `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fileId: driveId || undefined,
      title: parsedTitle,
      artist: parsedArtist,
      duration: '03:45',
      quality: 'MP3 [320KBPS]',
      size: '12.4 MB',
      link: rawUrl,
      streamUrl: driveId ? `/api/drive/audio-stream?fileId=${driveId}` : rawUrl,
      image: shadowElectricity,
      isDrive: !!driveId
    };

    const updated = [newTrack, ...musicList];
    setMusicList(updated);
    await saveLibraryToServer(updated);

    setInputUrl('');
    setInputTitle('');
    setInputArtist('');
    setConsoleMsg({ text: `Successfully added "${parsedTitle}" to music deck!`, type: 'success' });
    setTimeout(() => setConsoleMsg(null), 3000);
  };

  // Save Manual Track Edit (Admin only)
  const handleSaveTrackEdit = async () => {
    if (!editingTrack || !isAdmin) return;
    const cleanTitle = editTitle.trim() || editingTrack.title;
    const cleanArtist = editArtist.trim() || editingTrack.artist;

    const updated = musicList.map(t => t.id === editingTrack.id ? { ...t, title: cleanTitle, artist: cleanArtist } : t);
    setMusicList(updated);
    await saveLibraryToServer(updated);
    setEditingTrack(null);
  };

  // Delete Track from Player (Admin only)
  const handleDeleteTrack = async (trackId: string) => {
    if (!isAdmin) return;
    const updated = musicList.filter(t => t.id !== trackId);
    setMusicList(updated);
    await saveLibraryToServer(updated, playlists, true);
  };

  // Clear All Songs (Admin only)
  const handleClearAllSongs = async () => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to reset and clear all songs from your music deck?')) {
      setMusicList([]);
      localStorage.removeItem('shadow_gdrive_tracks');
      try {
        const idToken = await getAdminIdToken();
        if (idToken) {
          await fetch('/api/music/library', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${idToken}` },
          });
        }
      } catch (e) {}
      await saveLibraryToServer([], playlists, true);
      setConsoleMsg({ text: 'All songs reset successfully.', type: 'success' });
      setTimeout(() => setConsoleMsg(null), 2500);
    }
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    const driveId = extractDriveFileId(activeTrack.fileId || activeTrack.link || activeTrack.streamUrl || activeTrack.id);
    if (driveId && audio.src && !audio.src.includes('uc?export=download')) {
      console.warn('[Audio Player] Proxy stream failed or unreached, falling back to direct Google Drive download URL...');
      audio.src = `https://drive.google.com/uc?export=download&id=${driveId}`;
      audio.load();
      audio.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      <audio ref={audioRef} onError={handleAudioError} />

      {/* MAIN MUSIC PLAYER BODY - FULL SCREEN SPACING */}
      <div className="flex-1 min-h-0 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: ACTIVE NOW PLAYING CANVAS */}
        <div className="lg:col-span-5 bg-neutral-900/60 border border-purple-900/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center shadow-xl backdrop-blur-sm">
          
          {/* TOP CARD HEADER BAR: MUSIC DECK BADGE + ADD MP3 BUTTON */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-purple-900/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                <Music size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  Music Deck
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                    {musicList.length} Tracks
                  </span>
                </h2>
                <p className="text-[11px] text-neutral-400">Google Drive Soundtrack Player</p>
              </div>
            </div>

            {/* PROMINENT "ADD MP3" PILL BUTTON INSIDE UI BOX (ADMIN ONLY) */}
            {isAdmin && (
              <button
                onClick={handleAddMp3Click}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-full border border-purple-400/50 shadow-lg shadow-purple-950/80 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                title="Add MP3 or Google Drive share link"
              >
                <Plus size={16} />
                <span className="tracking-wider uppercase font-black">ADD MP3</span>
              </button>
            )}
          </div>

          {/* Album Vinyl / Art Display */}
          <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[200px] py-2">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-purple-900/40 shadow-2xl flex items-center justify-center overflow-hidden group bg-neutral-950">
              <motion.img
                src={activeTrack?.image && (activeTrack.image.startsWith('http') || activeTrack.image.startsWith('/') || activeTrack.image.startsWith('data:')) ? activeTrack.image : shadowElectricity}
                alt=""
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = shadowElectricity;
                }}
                className="w-full h-full object-cover rounded-full"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              />
              {/* Vinyl Groove Rings Overlay */}
              <div className="absolute inset-0 rounded-full border border-purple-500/20 pointer-events-none" />
              <div className="absolute inset-4 sm:inset-6 rounded-full border border-purple-500/10 pointer-events-none" />
              
              {/* Center Vinyl Hole */}
              <div className="absolute w-12 h-12 rounded-full bg-neutral-950 border-2 border-purple-500/50 flex items-center justify-center shadow-inner pointer-events-none z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-purple-400 border border-purple-200" />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="w-full text-center mt-3 mb-4 px-2">
            <h3 className="text-lg font-bold text-white truncate max-w-full">
              {activeTrack?.title || 'No Track Selected'}
            </h3>
            <p className="text-xs font-medium text-purple-300 mt-0.5 truncate">
              {activeTrack?.artist || 'Add your music using the Add MP3 button'}
            </p>
          </div>

          {/* Progress Bar & Scrubber */}
          <div className="w-full space-y-1 mb-4">
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden cursor-pointer relative"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const clickX = e.clientX - rect.left;
                   const pct = clickX / rect.width;
                   if (audioRef.current && audioRef.current.duration) {
                     audioRef.current.currentTime = pct * audioRef.current.duration;
                   }
                 }}>
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-100"
                style={{ width: `${playerProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-neutral-400 px-0.5">
              <span>{currentTimeFormatted}</span>
              <span>{durationFormatted}</span>
            </div>
          </div>

          {/* Player Main Controls */}
          <div className="w-full flex items-center justify-between px-2">
            <button
              onClick={() => setIsRandomized(!isRandomized)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isRandomized ? 'text-purple-400 bg-purple-950/80 border border-purple-500/40' : 'text-neutral-400 hover:text-white'
              }`}
              title="Toggle Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (filteredMusicList.length === 0) return;
                  const prevIdx = (currentTrackIndex - 1 + filteredMusicList.length) % filteredMusicList.length;
                  setCurrentTrackIndex(prevIdx);
                  setIsPlaying(true);
                }}
                className="p-2.5 text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl transition-all cursor-pointer"
                title="Previous Song"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (filteredMusicList.length === 0) return;
                  const nextIdx = (currentTrackIndex + 1) % filteredMusicList.length;
                  setCurrentTrackIndex(nextIdx);
                  setIsPlaying(true);
                }}
                className="p-2.5 text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700/80 rounded-xl transition-all cursor-pointer"
                title="Next Song"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : playerVolume}
                onChange={(e) => {
                  setPlayerVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 accent-purple-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRACK LIST & SEARCH */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-purple-900/30 rounded-2xl p-4 flex flex-col min-h-0 shadow-xl backdrop-blur-sm">
          {/* Search, Playlist & Sync Bar */}
          <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap">
            {/* Shorter Search Bar */}
            <div className="relative flex-1 min-w-[140px] max-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            {/* Admin-only Create Playlist & Sync Google Drive Music Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setNewPlaylistName('');
                    setPlaylistMsg('');
                    setShowPlaylistModal(true);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 hover:text-white border border-purple-600/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-purple-950"
                  title="Create a new playlist"
                >
                  <FolderPlus size={14} className="text-purple-400" />
                  <span className="hidden sm:inline">Create Playlist</span>
                  <span className="sm:hidden">Playlist</span>
                </button>

                <button
                  onClick={() => handleSyncGoogleDriveMusic(false)}
                  disabled={isSyncingDrive}
                  className="px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Load Music folder and subfolder playlists from your Google Drive"
                >
                  <FolderSync size={14} className={isSyncingDrive ? 'animate-spin text-emerald-300' : 'text-emerald-400'} />
                  <span>{isSyncingDrive ? 'Syncing Drive...' : 'Sync Drive Music'}</span>
                </button>

                <DrivePickerTrigger
                  viewMode="audio"
                  label="Google Picker"
                  showPickedPreviewModal={false}
                  className="px-3 py-2 bg-indigo-950/75 hover:bg-indigo-900/80 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  onFilesPicked={(pickedFiles: PickedDriveFile[]) => {
                    if (!pickedFiles.length) return;
                    const nextTracks = [...musicList];
                    let addedCount = 0;
                    for (const file of pickedFiles) {
                      const existingIdx = nextTracks.findIndex(
                        (t) => t.fileId === file.id || t.id === `gdrive-${file.id}`
                      );
                      const parsedMeta = parseAudioTitleAndArtist(file.name);
                      const targetPlaylists =
                        activePlaylist && activePlaylist !== 'All' ? [activePlaylist] : ['All'];
                      if (existingIdx === -1) {
                        nextTracks.unshift({
                          id: `gdrive-${file.id}`,
                          fileId: file.id,
                          title: parsedMeta.title,
                          artist: parsedMeta.artist || 'Google Drive Audio',
                          duration: 'Play',
                          size: file.sizeBytes
                            ? `${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                            : 'Drive File',
                          link: file.url,
                          image: shadowElectricity,
                          isDrive: true,
                          playlists: targetPlaylists,
                        });
                        addedCount++;
                      }
                    }
                    setMusicList(nextTracks);
                    try {
                      localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(nextTracks));
                    } catch (_) {}
                    saveLibraryToServer(nextTracks, playlists);
                    setSyncStatus({
                      text:
                        addedCount > 0
                          ? `Added ${addedCount} track${addedCount !== 1 ? 's' : ''} via Google Picker.`
                          : 'Selected Drive file is already in your playlist.',
                      type: 'success',
                    });
                  }}
                />
              </>
            )}
          </div>

          {/* Visible Google Drive Connect / Sync Status Banner */}
          {syncStatus && (
            <div
              className={`mb-2 px-3 py-2 rounded-xl text-[11px] font-semibold border flex items-center justify-between gap-2 ${
                syncStatus.type === 'error'
                  ? 'bg-red-950/70 border-red-500/40 text-red-200'
                  : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <AlertCircle size={13} />
                {syncStatus.text}
              </span>
              <button onClick={() => setSyncStatus(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X size={12} />
              </button>
            </div>
          )}

          {isAdmin && !firebaseAdmin && (
            <div className="mb-2.5 px-3 py-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-amber-200">
                <span className="font-bold text-white">Firebase Admin sign-in required for permanent edits.</span>{' '}
                Sign in with your Google Admin account to save tracks &amp; playlists permanently.
              </div>
              <GoogleSignInButton
                onClick={() => handleSyncGoogleDriveMusic(false)}
                loading={isSyncingDrive}
                label="Sign in Admin & Sync"
              />
            </div>
          )}

          {isAdmin && !driveToken && firebaseAdmin && musicList.every((t) => t.id.startsWith('default-track-')) && (
            <div className="mb-2.5 px-3 py-2.5 bg-purple-950/50 border border-purple-500/40 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-purple-200">
                <span className="font-bold text-white">Google Drive not connected in preview.</span>{' '}
                Sign in to load your Google Drive Music folder &amp; playlists.
              </div>
              <GoogleSignInButton
                onClick={() => handleSyncGoogleDriveMusic(false)}
                loading={isSyncingDrive}
                label="Sign in & Load Drive Music"
              />
            </div>
          )}

          {/* Playlist filter pills */}
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
            {playlists.map((p) => {
              const songCount = p === 'All' 
                ? musicList.length 
                : musicList.filter(t => t.playlists?.includes(p)).length;
              return (
                <button
                  key={p}
                  onClick={() => setActivePlaylist(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    activePlaylist === p
                      ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  <span>{p}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${activePlaylist === p ? 'bg-purple-800 text-purple-200' : 'bg-neutral-800 text-neutral-400'}`}>
                    {songCount}
                  </span>
                </button>
              );
            })}
          </div>

              {activePlaylist !== 'All' && (
                <div className="mb-2 px-3 py-1.5 bg-purple-950/70 border border-purple-600/40 rounded-xl flex items-center justify-between gap-2 text-xs text-purple-200">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-white text-[11px]">Playlist: "{activePlaylist}"</span>
                    <span className="text-[10px] text-purple-300">
                      ({filteredMusicList.length} song{filteredMusicList.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setTargetPlaylistForManage(activePlaylist);
                          setPlaylistSearchQuery('');
                          setShowManagePlaylistModal(true);
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Plus size={11} />
                        <span>Add / Manage Music</span>
                      </button>
                      <button
                        onClick={(e) => handleDeletePlaylist(activePlaylist, e)}
                        className="p-1 text-purple-300 hover:text-red-400 hover:bg-purple-900/60 rounded-lg transition-colors cursor-pointer"
                        title="Delete this playlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Songs List */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1">
                {filteredMusicList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                    <Music size={32} className="mb-2 text-neutral-600" />
                    <p className="text-xs font-semibold text-neutral-400">
                      {activePlaylist !== 'All' 
                        ? `No songs in "${activePlaylist}" playlist yet`
                        : 'Your Music Deck is empty'}
                    </p>
                    {activePlaylist !== 'All' && isAdmin ? (
                      <button
                        onClick={() => {
                          setTargetPlaylistForManage(activePlaylist);
                          setPlaylistSearchQuery('');
                          setShowManagePlaylistModal(true);
                        }}
                        className="mt-2.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950"
                      >
                        <Plus size={14} />
                        <span>Add Music to {activePlaylist}</span>
                      </button>
                    ) : isAdmin ? (
                      <p className="text-[11px] text-neutral-600 mt-1 max-w-xs">
                        Click the purple <span className="text-purple-400 font-bold">"+ ADD MP3"</span> button above to input your Google Drive share links.
                      </p>
                    ) : null}
                  </div>
            ) : (
              filteredMusicList.map((track, idx) => {
                const isActive = activeTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 border transition-all cursor-pointer group ${
                      isActive 
                        ? 'bg-purple-950/70 border-purple-500/50 text-white shadow-sm' 
                        : 'bg-neutral-950/40 border-neutral-800/50 hover:bg-neutral-800/50 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-purple-400">
                        {isActive && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-2.5">
                            <div className="w-0.5 bg-purple-400 animate-bounce h-full" />
                            <div className="w-0.5 bg-purple-400 animate-bounce h-2/3" />
                            <div className="w-0.5 bg-purple-400 animate-bounce h-4/5" />
                          </div>
                        ) : (
                          <Play size={10} className="ml-0.5" />
                        )}
                      </div>

                      <div className="min-w-0 leading-tight">
                        <h4 className={`text-[11px] font-bold truncate ${isActive ? 'text-purple-300' : 'text-white'}`}>
                          {track.title}
                        </h4>
                        <p className="text-[9px] font-medium text-neutral-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Playlist Badge / Quick Selector */}
                        {playlists.length > 1 && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePlaylistTrackMenu(activePlaylistTrackMenu === track.id ? null : track.id);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all flex items-center gap-1 ${
                                track.playlists && track.playlists.length > 0
                                  ? 'bg-purple-900/80 text-purple-200 border-purple-500/50'
                                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white'
                              }`}
                              title="Add or remove from playlists"
                            >
                              <FolderPlus size={10} />
                              <span>
                                {track.playlists && track.playlists.length > 0 
                                  ? `${track.playlists.length} playlist${track.playlists.length > 1 ? 's' : ''}` 
                                  : '+ Playlist'}
                              </span>
                            </button>

                            {/* Quick Playlist Popover */}
                            {activePlaylistTrackMenu === track.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 z-40 w-44 bg-neutral-900 border border-purple-600/50 rounded-xl shadow-2xl p-2 space-y-1 text-xs"
                              >
                                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider px-1 pb-1 border-b border-neutral-800">
                                  Add to Playlist
                                </div>
                                <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                                  {playlists.filter(p => p !== 'All').map(p => {
                                    const inPlaylist = track.playlists?.includes(p) || false;
                                    return (
                                      <button
                                        key={p}
                                        onClick={() => handleToggleTrackInPlaylist(track.id, p)}
                                        className={`w-full px-2 py-1 rounded-lg text-left text-[11px] font-medium flex items-center justify-between transition-colors ${
                                          inPlaylist 
                                            ? 'bg-purple-900/70 text-white font-bold' 
                                            : 'hover:bg-neutral-800 text-neutral-300'
                                        }`}
                                      >
                                        <span className="truncate">{p}</span>
                                        {inPlaylist && <Check size={12} className="text-purple-400 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button
                                  onClick={() => setActivePlaylistTrackMenu(null)}
                                  className="w-full text-center text-[10px] text-neutral-400 hover:text-white pt-1 border-t border-neutral-800"
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTrack(track);
                            setEditTitle(track.title);
                            setEditArtist(track.artist);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-purple-300 hover:bg-neutral-800/80 transition-colors"
                          title="Edit Song Title / Artist"
                        >
                          <Edit3 size={12} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTrack(track.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 transition-colors"
                          title="Delete Song"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MUSIC ADMIN CONSOLE MODAL (STREAMLINED PURPLE THEME) */}
      <AnimatePresence>
        {showAdminConsole && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-purple-950/95 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-purple-100"
            >
              {/* Console Header */}
              <div className="px-5 py-4 bg-purple-900/60 border-b border-purple-500/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-800/50 text-purple-200 border border-purple-400/30">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wide uppercase text-white">
                      Music Admin Console
                    </h3>
                    <p className="text-[11px] text-purple-300">Input Google Drive Folder or MP3 Share Link</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAdminConsole(false)}
                  className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-800/60 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Firebase Admin Permanent Save Status */}
              {!firebaseAdmin && (
                <div className="px-4 py-2.5 bg-amber-950/70 border-b border-amber-500/30 flex items-center justify-between gap-2 text-[11px] text-amber-200">
                  <span>Sign in with Admin Google to save music changes permanently to Firebase.</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await googleSignIn();
                      if (res?.user) {
                        setFirebaseAdmin(isFirebaseAdminUser(res.user));
                        if (res.accessToken) setDriveToken(res.accessToken);
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Sign In Admin
                  </button>
                </div>
              )}

              {/* Console Alert / Feedback */}
              {consoleMsg && (
                <div className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
                  consoleMsg.type === 'error' 
                    ? 'bg-red-950/80 text-red-200 border-red-500/40' 
                    : 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
                }`}>
                  <AlertCircle size={15} />
                  <span>{consoleMsg.text}</span>
                </div>
              )}

              {/* Console Body Form */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-purple-200 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link size={13} className="text-purple-400" />
                      Google Drive Folder Link or File Link:
                    </span>
                    <span className="text-[10px] text-purple-300 font-normal normal-case">Folder or Single MP3</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://drive.google.com/drive/folders/12345abcdef... OR file link"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-purple-900/40 border border-purple-600/40 rounded-xl text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400 transition-colors font-mono"
                  />
                  <p className="text-[11px] text-purple-300/90 mt-1.5 leading-relaxed">
                    📁 <strong>Folder Upload:</strong> Paste a Google Drive folder share link to import all MP3s inside automatically. Song titles and artists will be parsed directly from each filename!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-purple-200 mb-1">
                      Song Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lipat Bahay"
                      value={inputTitle}
                      onChange={(e) => setInputTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-purple-900/40 border border-purple-600/40 rounded-xl text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-purple-200 mb-1">
                      Singer / Artist:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abra ft. Thyro"
                      value={inputArtist}
                      onChange={(e) => setInputArtist(e.target.value)}
                      className="w-full px-3.5 py-2 bg-purple-900/40 border border-purple-600/40 rounded-xl text-xs text-white placeholder-purple-400/50 outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddSingleLink}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/80 transition-all cursor-pointer flex items-center justify-center gap-2 border border-purple-400/40 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={15} />}
                  <span>Add Folder / MP3 to Deck</span>
                </button>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-purple-800/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSyncGoogleDriveMusic(false)}
                    disabled={isSaving}
                    className="text-[11px] font-bold text-purple-200 hover:text-white bg-purple-900/60 hover:bg-purple-800/60 border border-purple-600/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title="Auto-fetch exact song titles and artists from Google Drive"
                  >
                    <Sparkles size={13} className="text-purple-400" />
                    <span>Auto-Sync Drive Titles</span>
                  </button>

                  <button
                    onClick={handleClearAllSongs}
                    className="text-[11px] font-bold text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Reset All Songs</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TRACK MODAL */}
      <AnimatePresence>
        {editingTrack && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-neutral-900 border border-purple-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
            >
              <div className="px-5 py-4 bg-purple-950/80 border-b border-purple-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-purple-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">Edit Song Info</h3>
                </div>
                <button
                  onClick={() => setEditingTrack(null)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                    Song Title:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-purple-700/40 rounded-xl text-xs text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-purple-300 mb-1">
                    Singer / Artist:
                  </label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-purple-700/40 rounded-xl text-xs text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingTrack(null)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTrackEdit}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950"
                  >
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MP3 PASSWORD POPUP MODAL */}
      <AnimatePresence>
        {showMp3PasswordModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-neutral-900 border border-purple-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
            >
              <div className="px-5 py-4 bg-purple-950/90 border-b border-purple-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-purple-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">Security Verification</h3>
                </div>
                <button
                  onClick={() => setShowMp3PasswordModal(false)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleVerifyMp3Password} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-300 mb-1.5 flex items-center gap-1.5">
                    <Key size={13} className="text-purple-400" />
                    Enter Admin Passcode to Add MP3:
                  </label>
                  <input
                    type="password"
                    placeholder="Enter passcode..."
                    value={mp3PasswordInput}
                    onChange={(e) => {
                      setMp3PasswordInput(e.target.value);
                      setMp3PasswordError('');
                    }}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-purple-700/50 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400 transition-colors font-mono tracking-widest text-center"
                  />
                  {mp3PasswordError && (
                    <p className="text-[11px] font-semibold text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {mp3PasswordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMp3PasswordModal(false)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-purple-950 flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Unlock & Add</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE PLAYLIST MODAL */}
      <AnimatePresence>
        {showPlaylistModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-neutral-900 border border-purple-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
            >
              <div className="px-5 py-4 bg-purple-950/90 border-b border-purple-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FolderPlus size={18} className="text-purple-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">Create New Playlist</h3>
                </div>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePlaylistSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-purple-300 mb-1.5">
                    Playlist Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Synthwave Chores, Anime OST, Favorites..."
                    value={newPlaylistName}
                    onChange={(e) => {
                      setNewPlaylistName(e.target.value);
                      setPlaylistMsg('');
                    }}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-purple-700/50 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400 transition-colors"
                  />
                  {playlistMsg && (
                    <p className="text-[11px] font-semibold text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {playlistMsg}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPlaylistModal(false)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-purple-950 flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Create & Add Songs</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE SONGS IN PLAYLIST MODAL */}
      <AnimatePresence>
        {showManagePlaylistModal && targetPlaylistForManage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-neutral-900 border border-purple-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[85vh]"
            >
              <div className="px-5 py-4 bg-purple-950/90 border-b border-purple-800/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FolderPlus size={18} className="text-purple-400" />
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                      Add Songs to "{targetPlaylistForManage}"
                    </h3>
                    <p className="text-[10px] text-purple-300">Select music from your deck to include in this playlist</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManagePlaylistModal(false)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Search Bar inside Modal */}
                <div className="relative shrink-0">
                  <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search songs by title or artist..."
                    value={playlistSearchQuery}
                    onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-neutral-950 border border-purple-700/40 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                {/* Bulk Select / Deselect Controls */}
                <div className="flex items-center justify-between px-1 text-[11px] text-neutral-400 shrink-0">
                  <span>
                    {musicList.filter(t => t.playlists?.includes(targetPlaylistForManage)).length} of {musicList.length} song(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllTracksForPlaylist(targetPlaylistForManage, true)}
                      className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllTracksForPlaylist(targetPlaylistForManage, false)}
                      className="text-neutral-400 hover:text-neutral-200 font-medium transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Song Checkbox List */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 border border-neutral-800/80 rounded-xl p-1 bg-neutral-950/50">
                  {musicList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No songs in your music deck yet. Add songs first to populate playlists!
                    </div>
                  ) : (
                    musicList
                      .filter(t => {
                        if (!playlistSearchQuery.trim()) return true;
                        const q = playlistSearchQuery.toLowerCase().trim();
                        return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
                      })
                      .map((track) => {
                        const isChecked = track.playlists?.includes(targetPlaylistForManage) || false;
                        return (
                          <div
                            key={track.id}
                            onClick={() => handleToggleTrackInPlaylist(track.id, targetPlaylistForManage)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-purple-950/80 border-purple-500/60 text-white shadow-sm'
                                : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // handled by parent div onClick
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-neutral-950 border-neutral-700 cursor-pointer"
                              />
                              <div className="min-w-0 leading-tight">
                                <p className={`text-xs font-bold truncate ${isChecked ? 'text-purple-200' : 'text-neutral-300'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">
                                  {track.artist}
                                </p>
                              </div>
                            </div>
                            {isChecked && <Check size={14} className="text-purple-400 shrink-0" />}
                          </div>
                        );
                      })
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowManagePlaylistModal(false)}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-purple-950 flex items-center justify-center gap-1.5"
                  >
                    <Check size={15} />
                    <span>Done & Save Playlist</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
