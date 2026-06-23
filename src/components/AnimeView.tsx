import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, ExternalLink, Film, ArrowLeft, RefreshCw, Download, Copy, Check } from 'lucide-react';
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';

// Import newly available unique character and action backgrounds
import shadowOnThrone from '../assets/images/shadow_on_throne_1781612271107.jpg';
import shadowReadingGrimoire from '../assets/images/shadow_reading_grimoire_1781612288711.jpg';
import shadowDivingMoon from '../assets/images/shadow_diving_moon_1781612308237.jpg';
import shadowControllingStrings from '../assets/images/shadow_controlling_strings_1781612325928.jpg';
import shadowRooftopSword from '../assets/images/shadow_rooftop_sword_1782197321011.jpg';
import shadowRunicMastermind from '../assets/images/shadow_runic_mastermind_1782197344532.jpg';
import elizabethBloodQueen from '../assets/images/elizabeth_blood_queen_1782196938058.jpg';
import deltaBeastBlade from '../assets/images/delta_beast_blade_1782196956033.jpg';
import epsilonPipeOrgan from '../assets/images/epsilon_pipe_organ_1782196970673.jpg';
import johnSmithStrings from '../assets/images/john_smith_strings_1782196983941.jpg';
import lawlessCitySkyline from '../assets/images/lawless_city_skyline_1782197000218.jpg';
import yukimeFoxGod from '../assets/images/yukime_fox_god_1782197021212.jpg';
import auroraVoidSanctuary from '../assets/images/aurora_void_sanctuary_1782197036617.jpg';
import epsilonDynamicWhips from '../assets/images/epsilon_dynamic_whips_1782197579460.jpg';
import zetaPredatorCrouch from '../assets/images/zeta_predator_crouch_1782197596342.jpg';
import gammaElegantDeflect from '../assets/images/gamma_elegant_deflect_1782197611834.jpg';

import shadowSoloBg from '../assets/images/shadow_solo_bg_1780190187431.png';
import alphaSoloBg from '../assets/images/alpha_solo_bg_1780190207110.png';
import betaSoloBg from '../assets/images/beta_solo_bg_1780190226477.png';
import gammaSoloBg from '../assets/images/gamma_solo_bg_1780190246677.png';
import deltaSoloBg from '../assets/images/delta_solo_bg_1780190266500.png';
import epsilonSoloBg from '../assets/images/epsilon_solo_bg_1780190286312.png';
import zetaSoloBg from '../assets/images/zeta_solo_bg_1780190306077.png';
import shadowGardenCharacters from '../assets/images/shadow_garden_characters_1780189909589.png';
import shadowMasterAtomic from '../assets/images/shadow_master_atomic_1779279129608.png';
import shadowBackground from '../assets/images/shadow_background_1779198051469.png';
import shadowTechMagic from '../assets/images/shadow_tech_magic_1780090755590.png';

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

const getNormalizedSeason = (anime: any): 'S1' | 'S2' | 'MOVIE' => {
  if (anime.season) {
    const s = anime.season.toUpperCase();
    if (s.includes('SEASON 1') || s.includes('S1')) return 'S1';
    if (s.includes('SEASON 2') || s.includes('S2')) return 'S2';
    if (s.includes('MOVIE') || s.includes('THEATRIC') || s.includes('LOST ECHOES')) return 'MOVIE';
  }
  const title = (anime.title || '').toLowerCase();
  const protocol = (anime.protocol || '').toLowerCase();
  const description = (anime.description || '').toLowerCase();
  
  if (description.includes('season 1') || description.includes('s1')) {
    return 'S1';
  }
  if (description.includes('season 2') || description.includes('s2')) {
    return 'S2';
  }
  
  if (title.includes('season 1') || title.includes('s1') || protocol.includes('s1') || title.includes('episode 1')) {
    return 'S1';
  }
  if (title.includes('season 2') || title.includes('s2') || protocol.includes('s2') || (title.includes('episode 2') && !/episode 2\d/.test(title))) {
    return 'S2';
  }
  if (title.includes('movie') || protocol.includes('movie') || title.includes('echoes')) {
    return 'MOVIE';
  }
  return 'S1'; // fallback
};

interface GoogleDrivePlayerProps {
  driveId: string;
  title: string;
  key?: string;
  mode?: 'gdrive' | 'proxy';
  onFallback?: () => void;
}

function GoogleDrivePlayer({ driveId, title, mode = 'gdrive', onFallback }: GoogleDrivePlayerProps) {
  const [useIframe, setUseIframe] = useState<boolean>(mode === 'gdrive');
  const videoUrl = `/api/video-proxy?id=${driveId}`;
  const iframeUrl = `https://drive.google.com/file/d/${driveId}/preview?autoplay=1&vq=hd720`;

  useEffect(() => {
    setUseIframe(mode === 'gdrive');
  }, [mode, driveId]);

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-center items-center overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {!useIframe ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            onError={() => {
              console.log("Direct video streaming fallback initiated due to error.");
              setUseIframe(true);
              if (onFallback) {
                onFallback();
              }
            }}
            className="w-full h-full object-contain animate-fade-in"
            referrerPolicy="no-referrer"
          />
        ) : (
          <iframe
            src={iframeUrl}
            title={title}
            className="w-full h-full border-0 animate-fade-in"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        
        <div className="absolute top-3 left-3 z-35 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 bg-rose-950/85 border border-rose-500/30 rounded text-[9px] text-rose-400 font-mono font-bold tracking-wider uppercase">
            {!useIframe ? 'PREMIUM DIRECT STREAM' : 'SECURE EMBEDDED PLAYER'}
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
            {!useIframe ? (
              <span>⚡ Hyper-stream protocol active. Zero buffer direct play.</span>
            ) : (
              <span>⚠️ Browser blocking cookies? Click <span className="text-rose-400 font-bold">OPEN NATIVE TAB</span> to play securely.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const getEpisodeStreamLink = (url: string, defaultVideo: string) => {
  if (!url) return defaultVideo;
  const lower = url.toLowerCase().trim();
  // If it's a known installer/archive/zip/executable or generic Google Drive URL, return the direct stream backup
  if (
    lower.includes('msoffice') || 
    lower.includes('office') || 
    lower.includes('windows') || 
    lower.includes('win10') || 
    lower.includes('ezazhgs') ||
    lower.endsWith('.iso') ||
    lower.endsWith('.zip') ||
    lower.endsWith('.rar') ||
    lower.endsWith('.exe') ||
    lower === 'https://drive.google.com' || 
    lower === 'https://drive.google.com/' || 
    lower === 'https://drive.google.com/drive' ||
    lower === 'https://drive.google.com/drive/my-drive' ||
    (lower.includes('drive.google.com') && !getGoogleDriveId(lower))
  ) {
    return defaultVideo;
  }
  return url;
};

export default function AnimeView() {
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [inlineLinkInput, setInlineLinkInput] = useState('');
  const [selectedTab, setSelectedTab] = useState<'S1' | 'S2' | 'MOVIE'>('S1');
  const [playerMode, setPlayerMode] = useState<'gdrive' | 'proxy'>('gdrive');

  useEffect(() => {
    if (activeVideo) {
      const season = getNormalizedSeason(activeVideo);
      if (season === 'S2') {
        setPlayerMode('proxy');
      } else {
        setPlayerMode('gdrive');
      }
    }
  }, [activeVideo?.id]);

  const loadAnime = () => {
    const saved = localStorage.getItem('custom_anime');
    let loaded = [];
    try {
      loaded = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    // Self-healing: restore original Google Drive links if they were mutated to generic Sintel sample fallbacks or Windows 10 recovery ISO links
    const cleanMutatedLink = (title: string, currentLink: string, itemSeason?: string) => {
      const lowerLink = (currentLink || '').toLowerCase();
      if (
        !lowerLink || 
        lowerLink.includes('sample') || 
        lowerLink.includes('sintel') || 
        lowerLink.includes('tearsofsteel') || 
        lowerLink.includes('gtv-videos-bucket') ||
        lowerLink.includes('ezazhgs')
      ) {
        const lowerTitle = (title || '').toLowerCase().trim();
        const isS2 = 
          (itemSeason && (itemSeason.toUpperCase().includes('SEASON 2') || itemSeason.toUpperCase().includes('S2'))) ||
          lowerTitle.includes('season 2') || 
          lowerTitle.includes('s2') ||
          false;

        // Extremely robust regex helpers to match episode numbers (ep2, ep 2, episode2, episode 2, etc.)
        const matchEp = (epNum: number) => {
          const regex = new RegExp(`\\b(episode|ep)\\s*${epNum}\\b`, 'i');
          return regex.test(lowerTitle);
        };

        if (isS2) {
          if (matchEp(12)) return 'https://drive.google.com/file/d/13n1GtCSLb54oJCAfLQYou_-JApa2FR0d/view?usp=sharing';
          if (matchEp(11)) return 'https://drive.google.com/file/d/1ZYzQGgdLZFQ_psT0eOXiEj8Jrb8HNWnB/view?usp=sharing';
          if (matchEp(10)) return 'https://drive.google.com/file/d/1a15iOwyxblUJg_buG3Y7oM-okeQ4H7lV/view?usp=sharing';
          if (matchEp(9)) return 'https://drive.google.com/file/d/12g5iCTOnxpAVKsSeYm34eTQXiJXVln9b/view?usp=sharing';
          if (matchEp(8)) return 'https://drive.google.com/file/d/15L9Owf5kM4MdvAWxCAns9kZf1bnYzi6_/view?usp=sharing';
          if (matchEp(7)) return 'https://drive.google.com/file/d/1PfwEK9R349RLK7G9hauUQ4nI6AqOv4Qj/view?usp=sharing';
          if (matchEp(6)) return 'https://drive.google.com/file/d/1qhr4oIxgYizhDcWTPD_7z2fJDyxP2O7L/view?usp=sharing';
          if (matchEp(5)) return 'https://drive.google.com/file/d/1p4hoog_1jZ58bqpXzfc7SEo7ueNyPGlk/view?usp=sharing';
          if (matchEp(4)) return 'https://drive.google.com/file/d/1VpsEqqTfGSdB2XEVOzDC5teIhRdNmZ-C/view?usp=sharing';
          if (matchEp(3)) return 'https://drive.google.com/file/d/1wi5qyUCo0qm6QrxYbbu-keFrqTmMYFP2/view?usp=sharing';
          if (matchEp(2)) return 'https://drive.google.com/file/d/1F-8ASSeSZoCTGfU4pNBWoHQ7skPfow72/view?usp=sharing';
          if (matchEp(1)) return 'https://drive.google.com/file/d/1s-qUZGHPFSEBe8sxsEJlDMoVkpGEon5W/view?usp=sharing';
        }
      }
      return currentLink;
    };

    let isHealed = false;
    loaded = loaded.map((item: any) => {
      const originalLink = item.link || '';
      const cleaned = cleanMutatedLink(item.title, originalLink, item.season);
      if (cleaned !== originalLink) {
        isHealed = true;
        return { ...item, link: cleaned };
      }
      return item;
    });

    if (isHealed) {
      localStorage.setItem('custom_anime', JSON.stringify(loaded));
      setTimeout(() => {
        window.dispatchEvent(new Event('shadow_sync_update'));
      }, 100);
    }

    const adminLink = localStorage.getItem('admin_console_link') || 'https://drive.google.com';

    const defaultAnime = [
      {
        id: 'default-anime-movie',
        title: 'Xado: Lost Echoes',
        season: 'THEATRIC MOVIE',
        description: 'Cinematic teaser sequence. Experience the legendary saga of the shadow arts.',
        protocol: 'MOVIE TEASER',
        link: getEpisodeStreamLink(adminLink, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'),
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

      const resolvedDefaultLink = matchedDefault?.id === 'default-anime-s2' 
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' 
        : (matchedDefault?.id === 'default-anime-movie' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

      return {
        id: item.id || `custom-anime-${idx}`,
        title: matchedDefault ? matchedDefault.title : item.title,
        description: item.description || matchedDefault?.description || '',
        protocol: item.protocol || matchedDefault?.protocol || 'EXT LINK',
        link: getEpisodeStreamLink(item.link || adminLink, resolvedDefaultLink),
        downloadLink: item.link || adminLink,
        image: item.image || matchedDefault?.image || null,
        season: item.season || matchedDefault?.season || ''
      };
    }).filter((item: any) => normalizeTitle(item.title) !== 'xadoepisode1');

    // Merge default list while filtering duplicates by title
    return [
      ...customList,
      ...defaultAnime.filter(def => !customList.some((l: any) => normalizeTitle(l.title) === normalizeTitle(def.title))).map(def => ({
        ...def,
        downloadLink: def.link || adminLink
      }))
    ];
  };

  const [animeList, setAnimeList] = useState<any[]>(loadAnime);
  const [downloadSync, setDownloadSync] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setAnimeList(loadAnime());
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



  const filteredAnimeList = animeList.filter(anime => {
    if (getNormalizedSeason(anime) !== selectedTab) return false;
    
    const url = (anime.link || '').trim();
    if (!url) return false;
    
    // Check if the URL is just a generic fallback/folder link with no file ID
    const isGenericDrive = url === 'https://drive.google.com' || 
                           url === 'https://drive.google.com/' || 
                           url === 'https://drive.google.com/drive' ||
                           url === 'https://drive.google.com/drive/my-drive';
    if (isGenericDrive) {
      return false;
    }
    
    if (isGoogleDriveUrl(url) && !getGoogleDriveId(url)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    return (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  const resolvedAnimeBgImages = useMemo(() => {
    const fallbackAnimeBgImages = selectedTab === 'S2' ? [
      elizabethBloodQueen,        // Unique S2: Blood Queen Elizabeth on gothic throne under red moon
      deltaBeastBlade,            // Unique S2: Delta atypical dynamic blast pose
      epsilonPipeOrgan,           // Unique S2: Epsilon atypical massive gothic pipe organ
      johnSmithStrings,           // Unique S2: John Smith controlling wire strings atypically
      shadowRooftopSword,         // Unique S2: Legendary rooftop position drawing glowing sword (Original Atypical, Non-musical)
      shadowRunicMastermind,      // Unique S2: Supreme runic mastermind circle activation posture (Original Atypical, Non-musical)
      lawlessCitySkyline,         // Unique S2: Lawless city crimson skyline vista
      yukimeFoxGod,               // Unique S2: Yukime beautiful fox-spirit white tails
      auroraVoidSanctuary,        // Unique S2: Aurora Witch of Calamity void-runes look
      epsilonDynamicWhips,        // Unique S2: Epsilon atypical highly dynamic magic whip posture
      zetaPredatorCrouch,         // Unique S2: Zeta atypical low crouching gargoyle pose
      gammaElegantDeflect,        // Unique S2: Gamma atypical elegant magical sphere deflection pose
      deltaSoloBg,                // Character: Delta wild animal combat posture
      shadowAura,                 // Posture: Hovering wrapped in deep purple high-intensity fire aura
      shadowTechMagic,            // Posture: Manifesting cybernetic code hologram screens
      shadowBlade,                // Posture: Sword-drawn shadow stance in dramatic temple
      shadowSoloBg,               // Posture: Profile stance dark shadow coat
      shadowBackground            // Posture: Hooded close up look
    ] : [
      shadowOnThrone,             // Posture: Sitting relaxed holding a purple chalice (Throne Room)
      shadowReadingGrimoire,      // Posture: Reading ancient spellbook, mysterious workspace
      shadowDivingMoon,           // Posture: Diving mid-air, coat like bat-wings (Gothic Skyline)
      shadowControllingStrings,   // Posture: Puppeteer stance controlling thin slime lines
      shadowOnRoof,               // Posture: Rooftop stand observing under moon
      alphaSoloBg,                // Character: Alpha blonde elf leader stance
      shadowClockTower,           // Posture: Dark silhouette leaning on giant clock face
      betaSoloBg,                 // Character: Beta silver literature researcher stance
      shadowElectricity,          // Posture: High-tech matrix energy workspace
      gammaSoloBg,                // Character: Gamma dark-haired elegant shadow posture
      shadowMasterAtomic,         // Posture: Giant nuclear magic eruption sphere stance
      deltaSoloBg,                // Character: Delta wild wolf-beast beast-girl stance
      shadowMoonRain,             // Posture: Grim rain-slicked umbrella walk stance
      epsilonSoloBg,              // Character: Epsilon pink keyboard/shield stance
      shadowGardenCharacters,     // Stance: Dynamic Seven Shadows team ensemble group shot
      zetaSoloBg,                 // Character: Zeta cat-girl stance
      shadowAura,                 // Posture: Hovering wrapped in deep purple high-intensity fire aura
      shadowTechMagic,            // Posture: Manifesting cybernetic code hologram screens
      shadowBlade,                // Posture: Sword-drawn shadow stance in dramatic temple
      shadowSoloBg,               // Posture: Profile stance dark shadow coat
      shadowBackground            // Posture: Hooded close up look
    ];
    const result: any[] = [];
    filteredAnimeList.forEach((anime, idx) => {
      let chosen = anime.image;
      if (!chosen) {
        chosen = fallbackAnimeBgImages[idx % fallbackAnimeBgImages.length];
      }
      
      const prev1 = idx >= 1 ? result[idx - 1] : null;
      const prev2 = idx >= 2 ? result[idx - 2] : null;
      const prev3 = idx >= 3 ? result[idx - 3] : null;
      
      if (chosen === prev1 || chosen === prev2 || chosen === prev3) {
        let altIndex = (idx + 1) % fallbackAnimeBgImages.length;
        for (let attempt = 0; attempt < fallbackAnimeBgImages.length; attempt++) {
          const candidate = fallbackAnimeBgImages[(altIndex + attempt) % fallbackAnimeBgImages.length];
          if (candidate !== prev1 && candidate !== prev2 && candidate !== prev3) {
            chosen = candidate;
            break;
          }
        }
      }
      result.push(chosen);
    });
    return result;
  }, [filteredAnimeList]);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Dynamic Purple High-Contrast Glowing Tab Bar Controls */}
      <div className="relative border-b border-purple-950/40 bg-neutral-950 px-4 py-4 md:px-8 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-[0_10px_30px_rgba(168,85,247,0.06)]">
        {/* Emanating purple visual glow */}
        <div className="absolute -bottom-12 left-1/4 w-[350px] h-20 bg-purple-650/10 blur-[50px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 right-1/4 w-[350px] h-20 bg-fuchsia-650/10 blur-[50px] rounded-full pointer-events-none animate-pulse" />
        
        <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center md:justify-between gap-4 z-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-purple-400/90 uppercase">
              ARCHIVE SAGA SYSTEM
            </span>
            <h2 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
              <span>SHADOW SEASONS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </h2>
          </div>

          {/* Glowing tab buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center bg-neutral-900/40 p-1 border border-neutral-800/80 rounded-xl relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
            {[
              { id: 'S1', label: 'Season 1', tagline: 'Shadow Resurrection', badge: `${animeList.filter(a => getNormalizedSeason(a) === 'S1').length}` },
              { id: 'S2', label: 'Season 2', tagline: 'Neon Eminence', badge: `${animeList.filter(a => getNormalizedSeason(a) === 'S2').length}` },
              { id: 'MOVIE', label: 'Movie / Teaser', tagline: 'Lost Chronicles', badge: `${animeList.filter(a => getNormalizedSeason(a) === 'MOVIE').length}` },
            ].map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all duration-300 font-mono text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center shrink-0 cursor-pointer overflow-hidden group select-none ${
                    isActive
                      ? 'text-white border border-purple-500/40 bg-gradient-to-b from-purple-950/80 to-purple-900/60 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40 border border-transparent'
                  }`}
                >
                  {/* Purple Laser underline emanation */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-x-0 bottom-0 h-[2.5px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                      isActive ? 'bg-purple-500 text-black font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <span className={`text-[7px] lowercase tracking-normal font-medium mt-0.5 opacity-60 ${
                    isActive ? 'text-purple-300' : 'text-neutral-500 group-hover:text-neutral-400'
                  }`}>
                    {tab.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredAnimeList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-neutral-950/40 font-mono select-none text-center">
          <div className="w-12 h-12 bg-purple-950/30 border border-purple-500/25 flex items-center justify-center rounded-xl text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-4 animate-pulse">
            <Tv size={20} />
          </div>
          <span className="text-xs font-black uppercase text-white tracking-widest">
            no recordings decrypted
          </span>
          <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mt-1">
            no episodes exist in category '{selectedTab}'
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-full border-b border-neutral-900 bg-neutral-950 flex-1">
          {filteredAnimeList.map((anime, idx) => {
          const animeBgImage = resolvedAnimeBgImages[idx];
          const hasBgImage = !!animeBgImage;
          const Tag = motion.div;
          const adminLink = localStorage.getItem('admin_console_link') || 'https://drive.google.com';
          const targetLink = anime.link || adminLink;
          const downloadTargetLink = anime.downloadLink || targetLink;
          const driveId = getGoogleDriveId(downloadTargetLink);
          const downloadUrl = driveId 
            ? `https://drive.google.com/uc?export=download&id=${driveId}`
            : downloadTargetLink;

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setActiveVideo({
              ...anime,
              link: targetLink
            });
          };

          const handleDownloadClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            incrementDownloadCount('anime', anime.id, anime.title);
            if (typeof window !== 'undefined' && (window as any).logUserMovement) {
              (window as any).logUserMovement('action', `Downloaded "${anime.title}" from Anime Catalog`);
            }
            
            // Resolve safe download link that redirects to file page instead of playing video
            let finalDownloadLink = downloadTargetLink;
            const driveId = getGoogleDriveId(downloadTargetLink);
            if (driveId) {
              // Direct download URL on Google Drive (forces direct file download, completely bypasses video player)
              finalDownloadLink = `https://drive.google.com/uc?export=download&id=${driveId}`;
            } else if (isDirectVideo(downloadTargetLink)) {
              // Direct video links are fallback assets - redirect to the actual Google Drive technical files repo instead, to show files for download
              finalDownloadLink = adminLink;
            }

            if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
              (window as any).triggerRedirectLoader(finalDownloadLink, anime.title);
            } else {
              window.open(finalDownloadLink, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <Tag
              key={anime.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group cursor-default min-h-[200px] md:min-h-[240px] ${
                hasBgImage 
                  ? 'bg-neutral-950 text-white' 
                  : 'bg-neutral-900/35 hover:bg-neutral-900/80 text-white'
              }`}
            >
              {/* Original Cinematic Widescreen Widespan Background */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950">
                {animeBgImage && (
                  <img 
                    src={animeBgImage} 
                    alt="" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 brightness-[0.85] group-hover:brightness-[1.0] saturate-[0.95] group-hover:saturate-[1.1] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Widescreen Cinematic Vignette and Film Mask Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_20%,rgba(0,0,0,0.5)_80%)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/45 to-transparent group-hover:from-neutral-950/90 group-hover:via-neutral-950/20 transition-all duration-500 z-10" />

                {/* Simulated Anamorphic Rose Lens Flare is removed */}

                {/* Theater dust / floating embers look */}
                <div className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 z-10 bg-[radial-gradient(rgba(244,63,94,0.15)_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_3s_infinite]" />

                {/* Laser light sweep across from left to right on hover */}
                <div className="absolute inset-0 w-[45%] h-full bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-[1200ms] ease-out pointer-events-none z-15" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className={`w-8 h-1 transition-colors ${
                      hasBgImage ? 'bg-rose-500 group-hover:bg-rose-450' : 'bg-purple-500 group-hover:bg-purple-400'
                    }`}></div>
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
                        if (lowerTitle.includes('season 2') || lowerTitle.includes('s2') || lowerProtocol.includes('s2') || (lowerTitle.includes('episode 2') && !/episode 2\d/.test(lowerTitle))) {
                          return 'SEASON 2';
                        }
                        if (lowerTitle.includes('movie') || lowerProtocol.includes('movie') || lowerTitle.includes('echoes')) {
                          return 'THEATRIC MOVIE';
                        }
                        return 'SEASON 1';
                      })()}
                    </span>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-lg sm:text-xl font-black uppercase tracking-wide leading-tight transition-colors break-words line-clamp-3 ${
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
                
                <div className="pt-6 flex justify-end items-end mt-auto animate-fade-in">
                  <div className="flex gap-1.5 items-center shrink-0">
                    <button
                      onClick={handleDownloadClick}
                      className={`h-10 px-3.5 shrink-0 flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer shadow-md rounded-xl font-mono text-[11px] font-extrabold uppercase tracking-wide ${
                        hasBgImage
                          ? 'bg-neutral-900/45 hover:bg-neutral-800/85 border-neutral-700/50 hover:border-rose-500/50 text-neutral-400 hover:text-rose-450'
                          : 'bg-neutral-900/45 hover:bg-neutral-800/85 border-neutral-700/50 hover:border-purple-500/50 text-neutral-400 hover:text-purple-450'
                      }`}
                      title="Download file directly"
                    >
                      <Download size={14} className="shrink-0" />
                      <span>{getDownloadCount('anime', anime.id, anime.title)}</span>
                    </button>
                    
                    <button
                      onClick={handleDownloadClick}
                      className={`h-10 w-10 shrink-0 flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-md rounded-none ${
                        hasBgImage
                          ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-500/40 text-rose-300 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.12)] hover:shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:border-rose-400'
                          : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-300 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400'
                      }`}
                      title="Download episode"
                    >
                      <Download size={14} className="shrink-0" />
                    </button>

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
        {(filteredAnimeList.length % 3 !== 0) && Array.from({ length: 3 - (filteredAnimeList.length % 3) }).map((_, i) => (
          <div key={`filler-${i}`} className="border-b border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r border-r border-neutral-900"></div>
        ))}
        </div>
      )}

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
                <div className="flex flex-col sm:flex-row border-b border-neutral-800 bg-neutral-950 font-mono text-[9px] tracking-wider shrink-0 p-1.5 gap-1.5">
                  <button
                    onClick={() => setPlayerMode('gdrive')}
                    className={`flex-1 py-2 px-3 text-center transition-all flex items-center justify-center gap-1.5 uppercase font-extrabold rounded-lg border cursor-pointer active:scale-95 ${
                      playerMode === 'gdrive'
                        ? 'bg-rose-950/50 text-white border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        : 'border-neutral-800 hover:border-rose-500/30 bg-neutral-900/60 text-neutral-400 hover:text-rose-300'
                    }`}
                  >
                    <Tv size={12} />
                    <span>Google Drive Player</span>
                  </button>
                  <button
                    onClick={() => setPlayerMode('proxy')}
                    className={`flex-1 py-2 px-3 text-center border font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer active:scale-95 ${
                      playerMode === 'proxy'
                        ? 'bg-purple-950/50 text-white border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                        : 'border-neutral-800 hover:border-purple-500/50 bg-neutral-900/60 text-neutral-400 hover:text-purple-300'
                    }`}
                  >
                    <RefreshCw size={11} className={playerMode === 'proxy' ? "animate-spin [animation-duration:6s]" : ""} />
                    <span>Switch to Instant High-Speed Direct Stream</span>
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
                      playsInline
                      className="w-full h-full object-contain col-span-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : isGoogleDriveUrl(activeVideo.link) ? (
                    (() => {
                      const driveId = getGoogleDriveId(activeVideo.link);
                      if (driveId) {
                        return (
                          <GoogleDrivePlayer
                            key={driveId}
                            driveId={driveId}
                            title={activeVideo.title}
                            mode={playerMode}
                            onFallback={() => setPlayerMode('gdrive')}
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
