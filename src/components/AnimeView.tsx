import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, ExternalLink, Film, ArrowLeft, RefreshCw, Download } from 'lucide-react';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';

function getEmbedUrl(url: string, title?: string) {
  if (!url) return '';
  
  // Google Drive url mapping
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/) || 
                        url.match(/[?&]id=([^&]+)/) || 
                        url.match(/\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }
  
  // YouTube normal video mapping
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split(/[?#]/)[0] || '';
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  // No arbitrary YouTube fallbacks or promotional trailers
  return '';
}

const isGoogleDriveUrl = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.includes('drive.google.com') || lower.includes('docs.google.com');
};

const getGoogleDriveId = (url: string) => {
  if (!url) return '';
  const fileIdMatch = url.match(/\/file\/d\/([^/]+)/) || 
                      url.match(/[?&]id=([^&]+)/) || 
                      url.match(/\/d\/([^/]+)/);
  return fileIdMatch ? fileIdMatch[1] : '';
};

const isDirectVideo = (url: string) => {
  if (!url) return false;
  if (isGoogleDriveUrl(url)) return false; // Use the Google Drive iframe preview player for 100% video format compatibility (including .mkv files)
  const lower = url.toLowerCase().trim();
  return lower.endsWith('.mp4') || 
         lower.endsWith('.webm') || 
         lower.endsWith('.ogg') || 
         lower.endsWith('.mov') ||
         lower.includes('/api/video') ||
         lower.includes('video');
};

const isEmbeddable = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  // Only play YouTube URLs in the general iframe player block, everything else has specific handlers or external portal views
  return lower.includes('youtube.com') || lower.includes('youtu.be');
};

interface GoogleDrivePlayerProps {
  driveId: string;
  title: string;
}

function GoogleDrivePlayer({ driveId, title }: GoogleDrivePlayerProps) {
  const iframeUrl = `https://drive.google.com/file/d/${driveId}/preview?autoplay=1`;

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-center items-center overflow-hidden">
      <div className="relative w-full h-full">
        <iframe
          src={iframeUrl}
          title={title}
          className="w-full h-full border-0 animate-fade-in"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 bg-rose-950/85 border border-rose-500/30 rounded text-[9px] text-rose-400 font-mono font-bold tracking-wider uppercase">
            SECURE EMBEDDED PLAYER
          </span>
          <a
            href={`https://drive.google.com/file/d/${driveId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 rounded text-[9px] text-white font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(244,63,94,0.35)]"
          >
            <span>OPEN NATIVE TAB ↗</span>
          </a>
        </div>

        <div className="absolute bottom-3 right-3 z-30">
          <div className="text-[8px] sm:text-[9px] font-mono text-neutral-400 bg-neutral-950/90 border border-neutral-800 rounded px-2.5 py-1 text-center max-w-[280px] leading-tight shadow-md">
            ⚠️ Browser blocking cookies? Click <span className="text-rose-400 font-bold">OPEN NATIVE TAB</span> to play securely.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnimeView() {
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [inlineLinkInput, setInlineLinkInput] = useState('');

  const [animeList, setAnimeList] = useState<any[]>(() => {
    const saved = localStorage.getItem('custom_anime');
    let loaded = [];
    try {
      loaded = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    const adminLink = localStorage.getItem('admin_console_link') || 'https://drive.google.com';

    const defaultAnime = [
      {
        id: 'default-anime-s1',
        title: 'Xado Episode 1',
        season: 'SEASON 1',
        description: '',
        protocol: 'S1 FULL',
        link: adminLink,
        image: shadowOnRoof
      },
      {
        id: 'default-anime-s2',
        title: 'Xado Episode 2',
        season: 'SEASON 2',
        description: '',
        protocol: 'S2 FULL',
        link: adminLink,
        image: shadowClockTower
      },
      {
        id: 'default-anime-movie',
        title: 'Xado: Lost Echoes',
        season: 'THEATRIC MOVIE',
        description: '',
        protocol: 'MOVIE TEASER',
        link: adminLink,
        image: shadowMoonRain
      }
    ];

    const normalizeTitle = (title: string) => {
      if (!title) return '';
      return title
        .toLowerCase()
        .trim()
        .replace(/\.(mp4|mkv|avi|webm|mov|ogg)$/i, '')
        .replace(/[^a-z0-9]/g, '');
    };

    // Map loaded custom anime and fallback images/details dynamically
    const customList = loaded.map((item: any, idx: number) => {
      const fallbackImages = [shadowBlade, shadowAura, shadowElectricity];
      
      const matchedDefault = defaultAnime.find(
        def => normalizeTitle(def.title) === normalizeTitle(item.title)
      );

      return {
        id: item.id || `custom-anime-${idx}`,
        title: matchedDefault ? matchedDefault.title : item.title,
        description: '',
        protocol: item.protocol || matchedDefault?.protocol || 'EXT LINK',
        link: item.link || adminLink,
        image: item.image || matchedDefault?.image || fallbackImages[idx % fallbackImages.length],
        season: item.season || matchedDefault?.season || ''
      };
    });

    // Merge default list while filtering duplicates by title
    return [
      ...customList,
      ...defaultAnime.filter(def => !customList.some((l: any) => normalizeTitle(l.title) === normalizeTitle(def.title)))
    ];
  });

  const handleUpdateEpisodeLink = (episodeId: string, newLink: string) => {
    const updated = animeList.map(item => {
      if (item.id === episodeId) {
        return { ...item, link: newLink.trim() };
      }
      return item;
    });
    setAnimeList(updated);
    
    // Save locally
    localStorage.setItem('custom_anime', JSON.stringify(updated));
    localStorage.setItem('admin_console_link', newLink.trim());
    
    // Update active state
    if (activeVideo && activeVideo.id === episodeId) {
      setActiveVideo((prev: any) => prev ? ({ ...prev, link: newLink.trim() }) : null);
    }
    setInlineLinkInput('');
  };



  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full border-b border-neutral-900 bg-neutral-950 flex-1">
        {animeList.map((anime, idx) => {
          const hasBgImage = !!anime.image;
          const Tag = motion.div;
          const adminLink = localStorage.getItem('admin_console_link') || 'https://drive.google.com';
          const targetLink = anime.link || adminLink;
          const driveId = getGoogleDriveId(targetLink);
          const downloadUrl = driveId 
            ? `https://drive.google.com/uc?export=download&id=${driveId}`
            : targetLink;

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setActiveVideo({
              ...anime,
              link: targetLink
            });
          };

          return (
            <Tag
              key={anime.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={handleClick}
              className={`border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group cursor-pointer ${
                hasBgImage 
                  ? 'bg-neutral-950 text-white' 
                  : 'bg-neutral-900/35 hover:bg-neutral-900/80 text-white'
              }`}
            >
              {anime.image && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={anime.image} 
                    alt="" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-[0.7] group-hover:brightness-[0.8]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 group-hover:from-black/100 group-hover:via-black/70 group-hover:to-black/45 transition-all duration-300" />
                </div>
              )}

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`w-8 h-1 transition-colors ${
                      hasBgImage ? 'bg-rose-500 group-hover:bg-rose-450' : 'bg-purple-500 group-hover:bg-purple-400'
                    }`}></div>
                    {anime.protocol && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-405 border border-rose-900/30">
                        {anime.protocol}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[9px] font-mono font-extrabold text-rose-400/90 tracking-[0.16em] uppercase">
                      {(() => {
                        if (anime.season) return anime.season.toUpperCase();
                        const lowerTitle = anime.title.toLowerCase();
                        const lowerProtocol = (anime.protocol || '').toLowerCase();
                        if (lowerTitle.includes('season 1') || lowerTitle.includes('s1') || lowerProtocol.includes('s1') || lowerTitle.includes('episode 1')) {
                          return 'SEASON 1';
                        }
                        if (lowerTitle.includes('season 2') || lowerTitle.includes('s2') || lowerProtocol.includes('s2') || lowerTitle.includes('episode 2')) {
                          return 'SEASON 2';
                        }
                        if (lowerTitle.includes('movie') || lowerProtocol.includes('movie') || lowerTitle.includes('echoes')) {
                          return 'THEATRIC MOVIE';
                        }
                        return 'SEASON 1';
                      })()}
                    </span>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tighter leading-tight transition-colors break-words line-clamp-3 ${
                        hasBgImage ? 'text-white' : 'text-neutral-100 group-hover:text-rose-300'
                      }`}>
                        {anime.title}
                      </h3>
                      <Tv size={16} className={`transition-opacity shrink-0 mt-1 ${
                        hasBgImage ? 'opacity-70 group-hover:opacity-100 text-white' : 'opacity-40 group-hover:opacity-100 text-neutral-400 group-hover:text-rose-300'
                      }`} />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-between items-end mt-auto">
                  <span className="text-[8px] font-mono font-black text-rose-400 hover:text-white uppercase tracking-[0.16em] bg-rose-950/10 border border-rose-955/20 px-2 py-0.5 rounded">
                    // STREAM
                  </span>
                  
                  <div className="flex gap-1.5 items-center shrink-0">
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`h-10 w-10 shrink-0 flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-md rounded-none ${
                        hasBgImage
                          ? 'bg-neutral-900/45 hover:bg-neutral-800/80 border-neutral-700/50 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400'
                          : 'bg-neutral-900/45 hover:bg-neutral-800/80 border-neutral-700/50 hover:border-purple-500/50 text-neutral-400 hover:text-purple-400'
                      }`}
                      title="Download file directly"
                    >
                      <Download size={14} className="shrink-0" />
                    </a>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(e);
                      }}
                      className={`h-10 w-10 shrink-0 flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-md rounded-none ${
                        hasBgImage
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.12)] hover:shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:border-rose-400'
                          : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-300 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400'
                      }`}
                      title="Play stream"
                    >
                      <Play size={14} fill="currentColor" className="shrink-0 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Tag>
          );
        })}
        {/* Empty filler block to maintain grid integrity */}
        {(animeList.length % 3 !== 0) && Array.from({ length: 3 - (animeList.length % 3) }).map((_, i) => (
          <div key={`filler-${i}`} className="border-b border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r border-r border-neutral-900"></div>
        ))}
      </div>

      {/* Dynamic In-App Video Player Overlay Modal (Rose-themed for Anime View) */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop with motion fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md cursor-pointer"
            />

            {/* Tactical Decrypted Frame container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              style={{
                boxShadow: `0 0 50px rgba(244, 63, 94, 0.25)`
              }}
              className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900/90 rounded-2xl border border-neutral-800 flex flex-col overflow-y-auto z-10 animate-fade-in"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur font-mono text-[9px] tracking-wide">
                <div className="flex items-center gap-3">
                  <span className="text-rose-400 font-black tracking-widest uppercase bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/10">
                    {activeVideo.protocol || 'ANIME MODULE'}
                  </span>
                  <span className="hidden sm:inline text-neutral-700">|</span>
                  <span className="text-neutral-200 font-sans font-bold truncate max-w-xs sm:max-w-md">
                    {activeVideo.title}
                  </span>
                </div>
                
                <button
                  onClick={() => setActiveVideo(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-[9px] font-extrabold uppercase transition-all tracking-wider cursor-pointer group"
                >
                  <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>BACK</span>
                </button>
              </div>

              {/* Tactical Mode Selector Tabs for Non-direct Links */}
              {activeVideo.link && !isDirectVideo(activeVideo.link) && (
                <div className="flex border-b border-neutral-800 bg-neutral-950 font-mono text-[9px] tracking-wider shrink-0 p-1.5 gap-1.5">
                  <button
                    className="flex-1 py-2 px-3 text-center transition-all flex items-center justify-center gap-1.5 uppercase font-extrabold rounded-lg border bg-rose-950/50 text-white border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)] cursor-default"
                  >
                    <Tv size={12} />
                    <span>Google Drive Player</span>
                  </button>
                </div>
              )}

              {/* Responsive Video Frame */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {activeVideo.link ? (
                  isDirectVideo(activeVideo.link) ? (
                    <video
                      src={activeVideo.link}
                      controls
                      autoPlay
                      className="w-full h-full object-contain col-span-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : isGoogleDriveUrl(activeVideo.link) ? (
                    (() => {
                      const driveId = getGoogleDriveId(activeVideo.link);
                      if (driveId) {
                        return (
                          <GoogleDrivePlayer
                            driveId={driveId}
                            title={activeVideo.title}
                          />
                        );
                      } else {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-neutral-950 animate-fade-in">
                            {activeVideo.image && (
                              <div className="absolute inset-0 z-0 select-none pointer-events-none">
                                <img 
                                  src={activeVideo.image} 
                                  alt="" 
                                  className="w-full h-full object-cover filter brightness-[0.12] blur-[6px]"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-neutral-950/85" />
                              </div>
                            )}
                            <div className="relative z-10 max-w-sm w-full space-y-4 flex flex-col items-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 border border-rose-500/25 rounded text-[9px] text-rose-400 font-extrabold tracking-widest uppercase mb-1 font-mono">
                                <Tv size={10} />
                                <span>STREAM CONFIGURATION PORTAL</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm md:text-base font-black uppercase text-white tracking-tight font-mono">
                                  {activeVideo.title}
                                </h4>
                                <p className="text-[10px] md:text-xs text-neutral-400 font-medium leading-relaxed max-w-xs mx-auto">
                                  Paste your specific Google Drive share link (with sharing set to "Anyone with the link can view") or direct video URL below to stream, or test immediately using our demo module.
                                </p>
                              </div>

                              {/* INLINE LINK PORTAL */}
                              <div className="w-full space-y-3 pt-2">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Paste Google Drive link / direct MP4..."
                                    value={inlineLinkInput}
                                    onChange={(e) => setInlineLinkInput(e.target.value)}
                                    className="flex-1 bg-neutral-900/90 border border-neutral-800 focus:border-rose-500/60 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none placeholder-neutral-600 focus:ring-1 focus:ring-rose-500/20"
                                  />
                                  <button
                                    onClick={() => {
                                      if (inlineLinkInput.trim()) {
                                        handleUpdateEpisodeLink(activeVideo.id, inlineLinkInput);
                                      }
                                    }}
                                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-xl font-mono tracking-widest transition-all uppercase cursor-pointer shrink-0 active:scale-95"
                                  >
                                    STREAM
                                  </button>
                                </div>
                                
                                <div className="flex flex-col gap-2 pt-1">
                                  <button
                                    onClick={() => handleUpdateEpisodeLink(activeVideo.id, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4')}
                                    className="bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-[10px] font-bold tracking-wider font-mono px-4 py-2.5 rounded-xl transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                                  >
                                    <span>⚡ PLAY SAMPLE STREAM (AUTOPLAYS INSTANTLY)</span>
                                  </button>
                                  
                                  <a
                                    href={activeVideo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-500 hover:text-neutral-400 text-[8px] font-mono uppercase tracking-widest flex items-center justify-center gap-1 mt-1.5 transition-colors"
                                  >
                                    <span>Browse configured workspace link</span>
                                    <ExternalLink size={8} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })()
                  ) : isEmbeddable(activeVideo.link) ? (
                    <div className="relative w-full h-full">
                      <iframe
                        src={getEmbedUrl(activeVideo.link, activeVideo.title)}
                        title={activeVideo.title}
                        className="w-full h-full border-0 animate-fade-in"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-neutral-950">
                      {activeVideo.image && (
                        <div className="absolute inset-0 z-0 select-none pointer-events-none">
                          <img 
                            src={activeVideo.image} 
                            alt="" 
                            className="w-full h-full object-cover filter brightness-[0.12] blur-[6px]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-neutral-950/85" />
                        </div>
                      )}
                      <div className="relative z-10 max-w-md space-y-4 flex flex-col items-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 border border-rose-500/25 rounded text-[9px] text-rose-400 font-black tracking-widest uppercase mb-1">
                          <ExternalLink size={10} />
                          <span>SECURE EXTERNAL PORTAL</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm md:text-base font-black uppercase text-white tracking-tight">
                            OFFICIAL STREAM PORTAL REQUIRED
                          </h4>
                          <p className="text-[10px] md:text-xs text-neutral-400 font-semibold leading-relaxed">
                            Due to iframe boundary restrictions imposed by official anime channels, this stream must be opened in its safe native player tab.
                          </p>
                        </div>
                        <a
                          href={activeVideo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] border border-rose-500/30 active:scale-95 cursor-pointer font-bold"
                        >
                          <span>LAUNCH EXTERNAL PLAYER</span>
                          <ExternalLink size={13} className="text-white" />
                        </a>
                        <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest block pt-1">
                          // HOST: {(() => {
                            try {
                              return new URL(activeVideo.link).hostname.toUpperCase();
                            } catch (e) {
                              return 'EXTERNAL';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center p-6 space-y-4 font-mono">
                    <div className="text-rose-400 font-bold">SOURCE TRANSMISSION ENCRYPTED / OFFLINE</div>
                    <div className="text-xs text-neutral-500">Provide an active external or file link to initiate streams.</div>
                  </div>
                )}
              </div>

              {/* Bottom details / specifications block */}
              <div className="p-4 bg-neutral-950/70 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left font-sans">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-xs font-black text-white uppercase font-mono tracking-tight sm:hidden">
                    {activeVideo.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-[9px] uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn"
                  >
                    <ArrowLeft size={11} className="group-hover/btn:-translate-x-0.5 transition-transform" strokeWidth={3} />
                    <span>BACK TO DIRECTORY</span>
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
