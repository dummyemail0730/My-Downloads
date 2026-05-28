import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, ExternalLink, Film, HelpCircle, ArrowLeft } from 'lucide-react';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';

function getEmbedUrl(url: string) {
  if (!url) return '';
  
  // Google Drive url mapping
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
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

  return url;
}

const isDirectVideo = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.endsWith('.mp4') || 
         lower.endsWith('.mkv') || 
         lower.endsWith('.webm') || 
         lower.endsWith('.ogg') || 
         lower.endsWith('.mov') ||
         lower.includes('/api/video') ||
         lower.includes('video');
};

export default function AnimeView() {
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<'360p' | '480p' | '720p' | '1080p'>('360p');
  const [isChangingQuality, setIsChangingQuality] = useState<boolean>(false);

  const changeQuality = (quality: '360p' | '480p' | '720p' | '1080p') => {
    if (selectedQuality === quality) return;
    setIsChangingQuality(true);
    setSelectedQuality(quality);
    setTimeout(() => {
      setIsChangingQuality(false);
    }, 700);
  };

  const [animeList] = useState<any[]>(() => {
    const saved = localStorage.getItem('custom_anime');
    let loaded = [];
    try {
      loaded = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    const defaultAnime = [
      {
        id: 'default-anime-s1',
        title: 'Eminence in Shadow Episode 1',
        season: 'SEASON 1',
        description: 'Cid Kagenou is reincarnated into a fantasy world as Shadow, the mysterious mastermind of the Shadow Garden secret society.',
        protocol: 'S1 FULL',
        link: 'https://crunchyroll.com/series/G79H23X08/the-eminence-in-shadow',
        image: shadowOnRoof
      },
      {
        id: 'default-anime-s2',
        title: 'Eminence in Shadow Episode 2',
        season: 'SEASON 2',
        description: 'Under the blood red moon, Shadow faces the legendary vampire Queen Elisabeth and commands the corporate skirmishes of Mitsugoshi.',
        protocol: 'S2 FULL',
        link: 'https://crunchyroll.com/series/G79H23X08/the-eminence-in-shadow',
        image: shadowClockTower
      },
      {
        id: 'default-anime-movie',
        title: 'The Eminence in Shadow: Lost Echoes',
        season: 'THEATRIC MOVIE',
        description: 'Upcoming continuation theatrical film declassifying new parallel-world conflicts.',
        protocol: 'MOVIE TEASER',
        link: 'https://crunchyroll.com/series/G79H23X08/the-eminence-in-shadow',
        image: shadowMoonRain
      }
    ];

    if (loaded.length === 0) {
      return defaultAnime;
    }

    // Map loaded custom anime and fallback images dynamically
    const customList = loaded.map((item: any, idx: number) => {
      const fallbackImages = [shadowBlade, shadowAura, shadowElectricity];
      return {
        id: item.id || `custom-anime-${idx}`,
        title: item.title,
        description: item.description || 'No description provided.',
        protocol: item.protocol || 'EXT LINK',
        link: item.link || 'https://crunchyroll.com',
        image: item.image || fallbackImages[idx % fallbackImages.length],
        season: item.season || ''
      };
    });

    // Merge default list while filtering duplicates by title
    return [
      ...customList,
      ...defaultAnime.filter(def => !customList.some((l: any) => l.title.toLowerCase().trim() === def.title.toLowerCase().trim()))
    ];
  });

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full border-b border-neutral-900 bg-neutral-950 flex-1">
        {animeList.map((anime, idx) => {
          const hasBgImage = !!anime.image;
          const Tag = motion.div;
          const targetLink = anime.link || 'https://crunchyroll.com';

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setVideoError(false);
            setSelectedQuality('360p');
            setIsChangingQuality(false);
            setActiveVideo(anime);
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
                  >
                    <Play size={14} fill="currentColor" className="shrink-0 ml-0.5" />
                  </button>
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
              className="relative w-full max-w-4xl bg-neutral-900/90 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden z-10 animate-fade-in"
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

              {/* Responsive Video Frame */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {isChangingQuality && (
                  <div className="absolute inset-0 bg-neutral-950/95 z-20 flex flex-col items-center justify-center space-y-3 font-mono">
                    <div className="flex gap-1.5 justify-center items-center">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-none animate-[bounce_0.6s_infinite_100ms]" />
                      <div className="w-1.5 h-6 bg-rose-500 rounded-none animate-[bounce_0.6s_infinite_200ms]" />
                      <div className="w-1.5 h-6 bg-rose-500 rounded-none animate-[bounce_0.6s_infinite_300ms]" />
                    </div>
                    <div className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em] animate-pulse">
                      MUTATING DENSITY RESOLUTION PROTOCOLS TO {selectedQuality}...
                    </div>
                  </div>
                )}

                {activeVideo.link ? (
                  isDirectVideo(activeVideo.link) ? (
                    <video
                      src={activeVideo.link}
                      controls
                      autoPlay
                      onError={() => setVideoError(true)}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(activeVideo.link)}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  )
                ) : (
                  <div className="text-center p-6 space-y-4 font-mono">
                    <div className="text-rose-400 font-bold">SOURCE TRANSMISSION ENCRYPTED / OFFLINE</div>
                    <div className="text-xs text-neutral-500">Provide an active external or file link to initiate streams.</div>
                  </div>
                )}

                {/* Direct video player fallback error banner */}
                {videoError && (
                  <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center p-6 space-y-4 text-center font-mono">
                    <HelpCircle className="w-12 h-12 text-rose-500 animate-pulse" />
                    <div className="text-rose-400 font-bold text-sm uppercase">NATIVE RENDER DIRECTORY CONFLICT</div>
                    <p className="text-[10px] text-neutral-400 max-w-md leading-relaxed">
                      Your browser has bypassed native MKV/raw video render filters inside this web frame. Try launching the stream in a bypass browser tab.
                    </p>
                    <a
                      href={activeVideo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-rose-950 border border-rose-800/50 hover:border-rose-500 text-rose-300 rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider"
                    >
                      Bypass Render Frame ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Resolution / Decryption Bandwidth Terminal selector */}
              <div className="px-4 py-3 bg-neutral-950/80 border-t border-b border-neutral-800/80 flex flex-col gap-2.5 font-mono">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[ping_1.5s_infinite]" />
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                      DECRYPTION LEVEL (FEED DENSITY):
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['360p', '480p', '720p', '1080p'] as const).map((q) => {
                      const qLabels = {
                        '360p': { label: '360P', detail: 'SD NET' },
                        '480p': { label: '480P', detail: 'HQ STREAM' },
                        '720p': { label: '720P', detail: 'HD PRO' },
                        '1080p': { label: '1080P', detail: 'U-CORE HD' }
                      };
                      const isActive = selectedQuality === q;
                      
                      return (
                        <button
                          key={q}
                          onClick={() => changeQuality(q)}
                          className={`px-3 py-1.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                            isActive
                              ? 'bg-rose-950/80 border-rose-500/80 text-white shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          <span className={`${isActive ? 'text-rose-400 scale-125' : 'text-neutral-600'} transition-transform`}>●</span>
                          <span>{qLabels[q].label}</span>
                          <span className="text-[7.5px] opacity-50 font-medium">({qLabels[q].detail})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated resolution instruction banner to explain sandboxed frame limitation */}
                {selectedQuality !== '360p' && (
                  <div className="bg-rose-950/20 border border-rose-500/10 rounded-xl p-3 text-[10px] text-rose-300 tracking-wide leading-relaxed animate-fade-in flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-extrabold text-white uppercase block tracking-wider text-[9px]">
                        ⚠️ STABILITY WARP: GOOGLE {selectedQuality} THROTTLE FILTERED
                      </span>
                      <span>
                        Inside integrated iframe boxes, standard Drive network protocols enforce a 360p limitation to save rendering threads. Click the Bypass launcher to bypass sandboxes and force native {selectedQuality} playback!
                      </span>
                    </div>
                    <a
                      href={activeVideo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-white rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider shrink-0 text-center inline-flex items-center gap-1.5 w-full md:w-auto justify-center"
                    >
                      <span>FORCE {selectedQuality} STREAM ↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom details / specifications block */}
              <div className="p-4 bg-neutral-950/70 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left font-sans">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-xs font-black text-white uppercase font-mono tracking-tight sm:hidden">
                    {activeVideo.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed font-semibold">
                    {activeVideo.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-[9px] uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                  <a
                    href={activeVideo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:text-white text-rose-450 rounded-xl transition-all cursor-pointer font-bold"
                  >
                    Bypass Player ↗
                  </a>
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
