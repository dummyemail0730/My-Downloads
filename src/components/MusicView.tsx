import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Download, Music, Disc, ListMusic, Volume2, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';

import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  quality: 'FLAC [LOSSLESS]' | 'MP3 [320KBPS]' | 'M4A [256KBPS]';
  size: string;
  link: string;
  image: string;
  protocol?: string;
  description?: string;
}

export default function MusicView() {
  const [downloadSync, setDownloadSync] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayingVirtual, setIsPlayingVirtual] = useState<boolean>(false);
  const [playerProgress, setPlayerProgress] = useState<number>(34);
  const [playerVolume, setPlayerVolume] = useState<number>(80);

  // Load custom music items mapped from "custom_games" in localStorage
  const loadMusic = (): Track[] => {
    const saved = localStorage.getItem('custom_games');
    let loaded = [];
    try {
      loaded = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    const defaultTracks: Track[] = [
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
      },
      {
        id: 'default-music-4',
        title: 'Polaris (Unplugged Acoustic)',
        artist: 'Seven Shadows S2 OST',
        duration: '04:05',
        quality: 'MP3 [320KBPS]',
        size: '10.5 MB',
        link: 'https://docs.google.com/uc?export=download&id=1n9s8d7f6g5h4j3k2l1m0o9p8q7r6s5t',
        image: shadowAura,
        protocol: 'HQ MP3'
      },
      {
        id: 'default-music-5',
        title: 'Shadow Garden Combat March',
        artist: 'Kenichiro Suehiro Orchestrations',
        duration: '05:14',
        quality: 'FLAC [LOSSLESS]',
        size: '48.9 MB',
        link: 'https://docs.google.com/uc?export=download&id=1m0n2b3v4c5x6z7l8k9j0h8g7f6d5s4a',
        image: shadowBlade,
        protocol: 'ORCHESTRAL'
      }
    ];

    if (loaded.length === 0) {
      return defaultTracks;
    }

    const customList = loaded.map((item: any, idx: number) => {
      const fallbackImages = [shadowBlade, shadowAura, shadowElectricity];
      return {
        id: item.id || `custom-music-${idx}`,
        title: item.title,
        artist: item.artist || item.description || 'Shadow Garden Operatives',
        duration: item.duration || '03:30',
        quality: (item.quality || 'MP3 [320KBPS]') as any,
        size: item.size || '8.5 MB',
        link: item.link || '',
        image: item.image || fallbackImages[idx % fallbackImages.length],
        protocol: item.protocol || 'EXT',
        description: item.description || ''
      };
    });

    return [
      ...customList,
      ...defaultTracks.filter(def => !customList.some((l: any) => l.title.toLowerCase().trim() === def.title.toLowerCase().trim()))
    ];
  };

  const [musicList, setMusicList] = useState<Track[]>(loadMusic);

  useEffect(() => {
    const handleSync = () => {
      setMusicList(loadMusic());
    };
    const handleDownloadSync = () => {
      setDownloadSync(prev => prev + 1);
    };
    window.addEventListener('shadow_sync_update', handleSync);
    window.addEventListener('shadow_download_sync', handleDownloadSync);
    return () => {
      window.removeEventListener('shadow_sync_update', handleSync);
      window.removeEventListener('shadow_download_sync', handleDownloadSync);
    };
  }, []);

  const activeTrack = useMemo(() => {
    return musicList[currentTrackIndex] || musicList[0];
  }, [musicList, currentTrackIndex]);

  // Handle Play/Pause operations
  const handlePlayToggle = (index?: number) => {
    if (index !== undefined && index !== currentTrackIndex) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setIsPlayingVirtual(true);
    } else {
      setIsPlaying(!isPlaying);
      setIsPlayingVirtual(!isPlaying);
    }
  };

  // Direct Audio Trigger and tracking increments
  const handleDownloadTrigger = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    incrementDownloadCount('music', track.id, track.title);
    if (typeof window !== 'undefined' && (window as any).logUserMovement) {
      (window as any).logUserMovement('action', `Streamed/Downloaded "${track.title}" from Lo-fi Music Suite`);
    }

    if (track.link) {
      if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
        (window as any).triggerRedirectLoader(track.link, track.title);
      } else {
        window.open(track.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Fake timeline and frequency bar animations for premium look
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlayerProgress(prev => {
          if (prev >= 100) {
            return 0; // Loop track simulation
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans select-none relative overflow-y-auto">
      
      {/* Top Banner & Player Dashboard */}
      <div className="border-b border-neutral-900 p-6 md:p-8 bg-neutral-950 flex flex-col xl:flex-row gap-6 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-radial-gradient from-purple-950/15 via-transparent to-transparent pointer-events-none" />
        
        {/* Dynamic Vinyl Record Wrapper */}
        <div className="w-full sm:w-64 h-64 mx-auto flex-shrink-0 relative flex items-center justify-center p-3 rounded-2xl border border-neutral-905 bg-neutral-900/40 backdrop-blur-md shadow-2xl">
          <div className="absolute inset-2 rounded-full border border-neutral-800/40 animate-pulse pointer-events-none" />
          
          {/* Main Vinyl CD Disc layout */}
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="w-56 h-56 rounded-full bg-black border-[6px] border-neutral-800 flex items-center justify-center relative shadow-black/80 shadow-2xl overflow-hidden"
          >
            {/* Vinyl groves */}
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
            <div className="w-5 h-5 bg-neutral-900 rounded-full border border-neutral-850 absolute z-20" />
          </motion.div>
        </div>

        {/* Player controls details */}
        <div className="flex-1 flex flex-col justify-between p-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/20 text-purple-400 border border-purple-800/20 uppercase tracking-[0.1em]">
                {activeTrack?.quality || 'FLAC [LOSSLESS]'}
              </span>
              <span className="text-[9px] font-mono font-extrabold text-neutral-500 uppercase tracking-widest">
                // SYSTEM_AUDIO_DECK
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide mb-1 leading-tight line-clamp-1">
              {activeTrack?.title || 'Unknown Sound Entry'}
            </h2>
            <p className="text-sm font-mono text-purple-400 font-bold mb-4">
              {activeTrack?.artist || 'Shadow Garden Archives'}
            </p>
            
            {/* Fake wave spectrum animation */}
            <div className="h-10 flex items-end gap-[3px] mb-6 py-1 select-none overflow-hidden pl-1">
              {Array.from({ length: 48 }).map((_, i) => {
                // Generate random heights to simulate interactive frequency signals
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
              <span className="text-[10px] font-mono text-neutral-500 w-10">01:24</span>
              <div 
                className="flex-grow h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                  setPlayerProgress(pct);
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-450 rounded-full" 
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 w-10 text-right">
                {activeTrack?.duration || '03:45'}
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
                      : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-850 text-white'
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
                <button
                  onClick={(e) => handleDownloadTrigger(e, activeTrack)}
                  className="h-11 px-5 flex items-center justify-center gap-2 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 hover:text-white rounded-xl font-mono text-xs font-extrabold uppercase tracking-wide transition-all duration-300 cursor-pointer shadow-md"
                  title="Download selected track"
                >
                  <Download size={13} />
                  <span>DOWNLOAD</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded-md border border-cyan-800/30 font-bold ml-0.5">
                    {getDownloadCount('music', activeTrack.id, activeTrack.title)}
                  </span>
                </button>
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

      {/* Track Directory Selection List */}
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-neutral-400">
            <ListMusic size={15} className="text-purple-400" />
            <h3 className="text-xs uppercase font-black tracking-widest font-mono">
              SHADOW GARDEN SOUND DECK ({musicList.length} AUDIO FILES)
            </h3>
          </div>
          
          <div className="text-[10px] font-mono text-neutral-500 leading-none">
            [ AUTOMATIC_LINK_MIGRATOR_ONLINE ]
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {musicList.map((track, idx) => {
            const isSelected = activeTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handlePlayToggle(idx)}
                className={`group flex items-center justify-between gap-3 p-4 border rounded-xl transition-all duration-250 cursor-pointer select-none relative overflow-hidden ${
                  isSelected 
                    ? 'border-purple-500/50 bg-gradient-to-r from-purple-950/20 via-purple-900/5 to-neutral-900 shadow-[0_0_20px_rgba(168,85,247,0.12)]' 
                    : 'border-neutral-800/80 bg-neutral-900/35 hover:border-purple-500/20 hover:bg-neutral-900/65'
                }`}
              >
                {/* Original Audio Frequency Waves Background Deco */}
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

                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold uppercase tracking-wide leading-snug truncate max-w-[280px] sm:max-w-xs md:max-w-md ${
                      isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-450 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Right side download stats and operations */}
                <div className="flex items-center gap-4 flex-shrink-0 relative z-10">
                  <div className="hidden sm:flex flex-col items-end text-right font-mono">
                    <span className="text-[9px] font-black tracking-widest text-neutral-550 group-hover:text-neutral-450">
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
                    className="h-9 px-3 shrink-0 flex items-center justify-center gap-1.5 border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-white rounded-lg transition-all duration-350 cursor-pointer shadow-md text-[11px] font-extrabold uppercase font-mono tracking-wider hover:scale-[1.03]"
                    title="Download audio stream"
                  >
                    <Download size={13} className="shrink-0 text-purple-400" />
                    <span>{getDownloadCount('music', track.id, track.title)}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
