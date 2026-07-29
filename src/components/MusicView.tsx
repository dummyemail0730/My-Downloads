import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Music, Volume2, VolumeX, Search, Trash2, Plus, 
  SkipForward, SkipBack, X, Shuffle, Link, RefreshCw, AlertCircle, Settings,
  Edit3, Check, Sparkles, FolderSync, FolderPlus, Lock, Key
} from 'lucide-react';
import { googleSignIn, getAccessToken } from '../lib/googleAuth';

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

export default function MusicView({ isAdmin = false }: MusicViewProps) {
  // Main Track Library State
  const [musicList, setMusicList] = useState<Track[]>([]);
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

  // Playlist State
  const [playlists, setPlaylists] = useState<string[]>(['All']);
  const [activePlaylist, setActivePlaylist] = useState<string>('All');
  const [showPlaylistModal, setShowPlaylistModal] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [playlistMsg, setPlaylistMsg] = useState<string>('');

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

  const handleAddMp3Click = () => {
    setMp3PasswordInput('');
    setMp3PasswordError('');
    setShowMp3PasswordModal(true);
  };

  const handleVerifyMp3Password = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pwd = mp3PasswordInput.trim().toLowerCase();
    if (!pwd) {
      setMp3PasswordError('Please enter passcode.');
      return;
    }
    if (['1234', 'shadow', 'guest', 'admin', 'passcode'].includes(pwd)) {
      setShowMp3PasswordModal(false);
      setShowAdminConsole(true);
    } else {
      setMp3PasswordError('Incorrect passcode. Please enter valid admin passcode.');
    }
  };

  const handleCreatePlaylistSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPlaylistName.trim();
    if (!trimmed) {
      setPlaylistMsg('Please enter a playlist name.');
      return;
    }
    if (playlists.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setPlaylistMsg('Playlist with this name already exists.');
      return;
    }
    setPlaylists([...playlists, trimmed]);
    setActivePlaylist(trimmed);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
    setConsoleMsg({ text: `Playlist "${trimmed}" created!`, type: 'success' });
    setTimeout(() => setConsoleMsg(null), 3000);
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

  // Direct Sync with User's Google Drive Music Folder
  const handleSyncGoogleDriveMusic = async () => {
    setIsSaving(true);
    setConsoleMsg({ text: 'Connecting to Google Drive...', type: 'success' });

    try {
      let token = getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        if (authResult?.accessToken) {
          token = authResult.accessToken;
        }
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      setConsoleMsg({ text: 'Scanning Google Drive for songs and resolving exact titles & artists...', type: 'success' });

      // 1. Fetch songs from user's Google Drive
      const syncRes = await fetch('/api/drive/sync-music', { headers });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.files && Array.isArray(syncData.files) && syncData.files.length > 0) {
          const syncedTracks: Track[] = syncData.files.map((file: { fileId: string; name: string }) => {
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

          // Merge and update existing list
          const existingMap = new Map<string, Track>(musicList.map(t => [t.fileId || t.id, t]));
          
          for (const st of syncedTracks) {
            existingMap.set(st.fileId || st.id, st);
          }

          const combined = Array.from(existingMap.values());
          setMusicList(combined);
          await saveLibraryToServer(combined);

          setConsoleMsg({ 
            text: `Successfully synced ${syncedTracks.length} song(s) from your Google Drive! Song names and artists updated.`, 
            type: 'success' 
          });
          setTimeout(() => setConsoleMsg(null), 4000);
          return;
        }
      }

      // Fallback: Fix unresolved tracks
      await autoFixUnresolvedTracks(musicList);

      setConsoleMsg({ text: 'Sync complete! All song titles and artists updated.', type: 'success' });
      setTimeout(() => setConsoleMsg(null), 3000);
    } catch (err: any) {
      console.error('Google Drive Sync error:', err);
      setConsoleMsg({ text: err.message || 'Error connecting to Google Drive.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const loadLibrary = async () => {
    let loadedTracks: Track[] = [];
    try {
      const res = await fetch('/api/music/library');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.tracks)) {
          loadedTracks = data.tracks;
          setMusicList(loadedTracks);
          if (loadedTracks.length === 0) {
            localStorage.removeItem('shadow_gdrive_tracks');
          } else {
            localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(loadedTracks));
            autoFixUnresolvedTracks(loadedTracks);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load library from server:', e);
    }

    // Fallback
    try {
      const stored = localStorage.getItem('shadow_gdrive_tracks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMusicList(parsed);
          autoFixUnresolvedTracks(parsed);
        }
      }
    } catch (e) {}
  };

  const saveLibraryToServer = async (tracks: Track[]) => {
    setIsSaving(true);
    try {
      if (tracks.length === 0) {
        localStorage.removeItem('shadow_gdrive_tracks');
      } else {
        localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(tracks));
      }
    } catch (e) {}

    try {
      await fetch('/api/music/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks })
      });
    } catch (e) {
      console.warn('Failed to save library to server:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered music list based on user search query
  const filteredMusicList = useMemo(() => {
    let list = musicList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      );
    }
    return list;
  }, [musicList, searchQuery]);

  const activeTrack = useMemo(() => {
    return filteredMusicList[currentTrackIndex] || filteredMusicList[0] || musicList[0];
  }, [filteredMusicList, musicList, currentTrackIndex]);

  // Compute active stream URL (direct or Google Drive proxy)
  const activeStreamUrl = useMemo(() => {
    if (!activeTrack) return undefined;

    const driveId = extractDriveFileId(activeTrack.fileId || activeTrack.link || activeTrack.streamUrl || activeTrack.id);
    if (driveId) {
      return `/api/drive/audio-stream?fileId=${driveId}`;
    }

    return activeTrack.streamUrl || activeTrack.link || undefined;
  }, [activeTrack]);

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
        const scanRes = await fetch(`/api/drive/scan-folder?folderId=${folderId}`);
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

  // Save Manual Track Edit
  const handleSaveTrackEdit = async () => {
    if (!editingTrack) return;
    const cleanTitle = editTitle.trim() || editingTrack.title;
    const cleanArtist = editArtist.trim() || editingTrack.artist;

    const updated = musicList.map(t => t.id === editingTrack.id ? { ...t, title: cleanTitle, artist: cleanArtist } : t);
    setMusicList(updated);
    await saveLibraryToServer(updated);
    setEditingTrack(null);
  };

  // Delete Track from Player
  const handleDeleteTrack = async (trackId: string) => {
    const updated = musicList.filter(t => t.id !== trackId);
    setMusicList(updated);
    await saveLibraryToServer(updated);
  };

  // Clear All Songs
  const handleClearAllSongs = async () => {
    if (window.confirm('Are you sure you want to reset and clear all songs from your music deck?')) {
      setMusicList([]);
      localStorage.removeItem('shadow_gdrive_tracks');
      try {
        await fetch('/api/music/library', { method: 'DELETE' });
      } catch (e) {}
      await saveLibraryToServer([]);
      setConsoleMsg({ text: 'All songs reset successfully.', type: 'success' });
      setTimeout(() => setConsoleMsg(null), 2500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      <audio ref={audioRef} />

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

            {/* PROMINENT "ADD MP3" PILL BUTTON INSIDE UI BOX */}
            <button
              onClick={handleAddMp3Click}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-full border border-purple-400/50 shadow-lg shadow-purple-950/80 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title="Add MP3 or Google Drive share link"
            >
              <Plus size={16} />
              <span className="tracking-wider uppercase font-black">ADD MP3</span>
            </button>
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
          <div className="flex items-center gap-2 mb-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Shorter Search Bar */}
            <div className="relative w-36 sm:w-44 lg:w-48 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>

            {/* Create Playlist Button */}
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

            {/* Sync Drive Songs Button */}
            <button
              onClick={handleSyncGoogleDriveMusic}
              disabled={isSaving}
              className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 hover:text-white border border-purple-600/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 shadow-md shadow-purple-950"
              title="Sync songs directly from your Google Drive Music folder"
            >
              <FolderSync size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Sync Drive</span>
              <span className="sm:hidden">Sync</span>
            </button>
          </div>

          {/* Playlist filter pills */}
          {playlists.length > 1 && (
            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {playlists.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlaylist(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activePlaylist === p
                      ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Songs List */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1">
            {filteredMusicList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                <Music size={32} className="mb-2 text-neutral-600" />
                <p className="text-xs font-semibold text-neutral-400">Your Music Deck is empty</p>
                <p className="text-[11px] text-neutral-600 mt-1 max-w-xs">
                  Click the purple <span className="text-purple-400 font-bold">"+ ADD MP3"</span> button above to input your Google Drive share links.
                </p>
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
                      Song Title <span className="font-normal text-[10px] text-purple-400">(Single File only)</span>:
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
                      Singer / Artist <span className="font-normal text-[10px] text-purple-400">(Single File only)</span>:
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
                    onClick={handleSyncGoogleDriveMusic}
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
                    <span>Create Playlist</span>
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
