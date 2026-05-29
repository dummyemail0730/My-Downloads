import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ExternalLink, Wrench, Terminal, Cpu, Database, Network, ShieldCheck, ArrowLeft } from 'lucide-react';

function getEmbedUrl(url: string) {
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

    // Map the static search queries to actual playable YouTube embed links
    if (url.includes('results?search_query=')) {
      if (url.includes('rebuild+bcd+uefi')) {
        return 'https://www.youtube.com/embed/zH01v42gU6E?autoplay=1&rel=0';
      }
      if (url.includes('load+registry+hive')) {
        return 'https://www.youtube.com/embed/Sshx9I6KBlY?autoplay=1&rel=0';
      }
      if (url.includes('pc+thermal+throttling')) {
        return 'https://www.youtube.com/embed/S_7iX3jYv_0?autoplay=1&rel=0';
      }
      if (url.includes('recover+raw+hard+drive')) {
        return 'https://www.youtube.com/embed/0G6m7mZIs6Y?autoplay=1&rel=0';
      }
      if (url.includes('wireshark+network+packet')) {
        return 'https://www.youtube.com/embed/9GdfgUf3fhk?autoplay=1&rel=0';
      }
      if (url.includes('advanced+malware+removal')) {
        return 'https://www.youtube.com/embed/16Wb-P0C9iE?autoplay=1&rel=0';
      }
    }
  }

  return url;
}

const isGoogleDriveUrl = (url: string) => {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.includes('drive.google.com') || lower.includes('docs.google.com');
};


interface TutorialVideo {
  index: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  difficultyColor: string;
  youtubeUrl: string;
  glow: string;
  borderColor: string;
  thumbnailBg: string;
  thumbnailIcon: any;
  iconColor: string;
}

export default function ShadowLoreView() {
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

  const [activeVideo, setActiveVideo] = useState<{
    title: string;
    url: string;
    category: string;
    index: string;
    difficulty: string;
    description: string;
    glow: string;
  } | null>(null);

  const [tutorials] = useState<TutorialVideo[]>(() => {
    const staticTutorials: TutorialVideo[] = [
      {
        index: "01",
        category: "BEGINNER",
        title: "INTRO TO SHADOW ARTS",
        description: "Learn the fundamentals of shadow manipulation—rebuilding system bootloaders (BCD), legacy boot records (MBR), and master UEFI partition configurations under the hood.",
        duration: "12:47",
        difficulty: "EASY",
        difficultyColor: "text-purple-400",
        youtubeUrl: "https://www.youtube.com/results?search_query=rebuild+bcd+uefi+bootloader+windows",
        glow: "rgba(168,85,247,0.15)",
        borderColor: "border-purple-500/20 hover:border-purple-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-purple-950/70",
        thumbnailIcon: Terminal,
        iconColor: "text-purple-400"
      },
      {
        index: "02",
        category: "FUNDAMENTALS",
        title: "SHADOW WALKING",
        description: "Master the art of moving unseen across OS structures—loading corrupted offline Registry hives via WinPE rescue nodes to bypass critical Windows startup failure loops.",
        duration: "18:32",
        difficulty: "EASY",
        difficultyColor: "text-purple-400",
        youtubeUrl: "https://www.youtube.com/results?search_query=load+registry+hive+winpe+offline",
        glow: "rgba(99,102,241,0.15)",
        borderColor: "border-indigo-500/20 hover:border-indigo-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-indigo-950/70",
        thumbnailIcon: Wrench,
        iconColor: "text-indigo-400"
      },
      {
        index: "03",
        category: "INTERMEDIATE",
        title: "SHADOW MOLDING",
        description: "Shape heat dynamics to your will—interpreting critical sensor outputs, logs, and voltage margins to troubleshoot PC thermal throttle gates and cooling failures.",
        duration: "24:15",
        difficulty: "MEDIUM",
        difficultyColor: "text-amber-500",
        youtubeUrl: "https://www.youtube.com/results?search_query=test+and+diagnose+pc+thermal+throttling",
        glow: "rgba(245,158,11,0.15)",
        borderColor: "border-amber-500/20 hover:border-amber-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-amber-950/70",
        thumbnailIcon: Cpu,
        iconColor: "text-amber-400"
      },
      {
        index: "04",
        category: "INTERMEDIATE",
        title: "FEAR INDUCTION",
        description: "Salvage raw and corrupted storage sectors—deploying partition command utilities, GPT record rebuilding, and custom file system recovery to rescue lost document vaults.",
        duration: "21:03",
        difficulty: "MEDIUM",
        difficultyColor: "text-amber-500",
        youtubeUrl: "https://www.youtube.com/results?search_query=recover+raw+hard+drive+partition+cmd",
        glow: "rgba(236,72,153,0.15)",
        borderColor: "border-pink-500/20 hover:border-pink-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-pink-950/70",
        thumbnailIcon: Database,
        iconColor: "text-pink-400"
      },
      {
        index: "05",
        category: "ADVANCED",
        title: "SHADOW POSSESSION",
        description: "Assume total network telemetry control—debugging subnet delays, capturing packet logs via Wireshark, and mapping custom firewalls to defend against hidden port requests.",
        duration: "27:40",
        difficulty: "HARD",
        difficultyColor: "text-red-500",
        youtubeUrl: "https://www.youtube.com/results?search_query=wireshark+network+packet+loss+troubleshooting",
        glow: "rgba(16,185,129,0.15)",
        borderColor: "border-emerald-500/20 hover:border-emerald-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-emerald-950/70",
        thumbnailIcon: Network,
        iconColor: "text-emerald-400"
      },
      {
        index: "06",
        category: "MASTER LEVEL",
        title: "DOMAIN OF DARKNESS",
        description: "Purge stealthy persistent security threats—isolating sophisticated rootkits, rogue thread schedulers, and tracking fileless backdoor script parameters with precision tooling.",
        duration: "32:18",
        difficulty: "EXPERT",
        difficultyColor: "text-red-500",
        youtubeUrl: "https://www.youtube.com/results?search_query=advanced+malware+removal+autoruns+process+explorer",
        glow: "rgba(239,68,68,0.2)",
        borderColor: "border-red-500/20 hover:border-red-500/50",
        thumbnailBg: "bg-gradient-to-br from-neutral-900 to-red-950/70",
        thumbnailIcon: ShieldCheck,
        iconColor: "text-red-400"
      }
    ];

    try {
      const saved = localStorage.getItem('shadow_master_tutorials');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((item: any, idx: number) => {
          const indexNum = staticTutorials.length + idx + 1;
          const indexStr = indexNum < 10 ? `0${indexNum}` : `${indexNum}`;

          let thumbnailIcon = Play;
          if (item.category === 'G: DRIVE') {
            thumbnailIcon = Database;
          } else if (item.category === 'FB') {
            thumbnailIcon = Network;
          } else if (item.category === 'EXT' || item.category === 'MISC GUIDE') {
            thumbnailIcon = Terminal;
          }

          return {
            index: indexStr,
            category: item.category || 'TUTORIALS',
            title: item.title,
            description: item.description || 'Custom reference manual linked by administrator profiles.',
            duration: 'UPLINK',
            difficulty: 'EXPERT',
            difficultyColor: 'text-indigo-400',
            youtubeUrl: item.url || item.link || 'https://drive.google.com',
            glow: 'rgba(168,85,247,0.15)',
            borderColor: 'border-purple-500/20 hover:border-purple-500/50',
            thumbnailBg: 'bg-gradient-to-br from-neutral-900 to-purple-950/70',
            thumbnailIcon,
            iconColor: 'text-purple-400'
          };
        });
        return [...staticTutorials, ...mapped];
      }
    } catch (e) {
      console.error(e);
    }

    return staticTutorials;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-start max-w-6xl mx-auto w-full font-mono text-neutral-300">
      
      {/* Banner Intro Section - Matches layout of Image 1 exactly */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 p-6 md:p-8 rounded-3xl border border-purple-500/25 bg-neutral-950/80 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="space-y-2 relative z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <p className="text-[9px] text-purple-400 font-extrabold tracking-[0.3em] uppercase">// SHADOW ARTS ACADEMY // TUTORIAL LIBRARY</p>
          </div>
          <h3 className="text-2xl md:text-4.5xl font-black tracking-tighter text-white uppercase font-sans">
            THE SHADOW MASTER TUTORIALS
          </h3>
          <p className="text-xs text-neutral-400 max-w-xl font-sans leading-relaxed">
            Step-by-step video guides to master the ancient arts of shadow manipulation, stealth, and control. Learn the secrets of deep system configurations, OS recovery, and diagnostic wisdom. Become the shadow.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end justify-center shrink-0 border-l md:border-l-0 md:border-r border-neutral-800 pl-4 md:pl-0 md:pr-6 text-left md:text-right">
          <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">VIDEO LIBRARY</p>
          <p className="text-xl font-black font-sans tracking-wide text-purple-400 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">100% ACCESS</p>
          <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5 font-bold">UNLOCK YOUR POTENTIAL</p>
        </div>
      </motion.div>

      {/* Grid of Video Tutorials */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {tutorials.map((video, index) => {
          const Icon = video.thumbnailIcon;

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            setSelectedQuality('360p');
            setIsChangingQuality(false);
            setActiveVideo({
              title: video.title,
              url: video.youtubeUrl,
              category: video.category,
              index: video.index,
              difficulty: video.difficulty,
              description: video.description,
              glow: video.glow
            });
          };

          return (
            <motion.a
              key={index}
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                boxShadow: `0 12px 30px ${video.glow}`
              }}
              className={`group border ${video.borderColor} rounded-2xl p-4 bg-neutral-950/80 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[190px] cursor-pointer`}
            >
              {/* Top Bracket Decoration */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neutral-900 group-hover:border-purple-500/30 transition-colors" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neutral-900 group-hover:border-purple-500/30 transition-colors" />

              <div className="flex gap-4 items-start pb-3 border-b border-neutral-900/40">
                {/* Square Thumbnail - Matches first image with duration and play button overlay */}
                <div className={`w-28 h-28 ${video.thumbnailBg} rounded-xl border border-neutral-900/85 shrink-0 relative flex flex-col items-center justify-center overflow-hidden group-hover:brightness-110 transition-all`}>
                  {/* Subtle code text grid background inside thumbnail */}
                  <div className="absolute inset-0 opacity-[0.06] flex flex-wrap content-start p-1 pointer-events-none select-none text-[5px] font-mono leading-none tracking-widest text-purple-400">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <span key={i} className="mb-0.5">X048_DNC_BOOT_{i} </span>
                    ))}
                  </div>

                  {/* Thumbnail Central Icon */}
                  <div className={`w-10 h-10 rounded-full bg-neutral-950/90 border border-neutral-800/80 flex items-center justify-center ${video.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={18} />
                  </div>

                  {/* Duration Overlay absolute bottom-right of thumbnail */}
                  <div className="absolute bottom-1 bg-black/85 border border-neutral-800/60 text-neutral-400 font-mono font-bold text-[8px] tracking-wider px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    {video.duration}
                  </div>
                </div>

                {/* Right text panel */}
                <div className="flex-1 min-w-0 flex flex-col text-left">
                  {/* Category & Index code */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] text-purple-400 group-hover:text-purple-300 font-black tracking-widest uppercase truncate max-w-[120px]">
                      {video.category}
                    </span>
                    <span className="text-[10px] text-neutral-600 font-extrabold pr-0.5">0{video.index}</span>
                  </div>

                  {/* Action Title */}
                  <h4 className="text-[11.5px] font-black tracking-tight text-white mb-1 leading-snug group-hover:text-purple-300 transition-colors uppercase font-sans flex items-center gap-1 shrink-0">
                    <span className="truncate">{video.title}</span>
                    <ExternalLink size={10} className="text-neutral-500 group-hover:text-purple-400 shrink-0 transition-colors" />
                  </h4>

                  {/* Operational Description */}
                  <p className="text-[9.5px] leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 font-sans font-medium line-clamp-3">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Bottom footer specifications tag */}
              <div className="pt-2 flex justify-between items-center text-[8px] text-neutral-600 tracking-wider font-bold">
                <span className="font-mono flex items-center gap-1.5">
                  <Play size={10} className="text-purple-500/80 animate-pulse fill-purple-500/10" />
                  <span className="font-mono text-neutral-500 uppercase">DIFFICULTY:</span> 
                  <span className={`${video.difficultyColor} font-black`}>{video.difficulty}</span>
                </span>
                <span className="font-mono font-bold select-none text-neutral-600">{video.duration}</span>
              </div>
            </motion.a>
          );
        })}
      </motion.div>

      {/* Retro bottom archive portal cue button */}
      <div className="text-[8px] font-bold text-neutral-500 text-center tracking-[0.3em] uppercase select-none p-4 border border-dashed border-neutral-900/60 rounded-xl bg-neutral-950/20">
        // CLICK TO INITIATE COGNITIVE LINK ON YOUTUBE // SYSTEM OK
      </div>

      {/* Dynamic In-App Video Player Overlay Modal */}
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
                boxShadow: `0 0 50px ${activeVideo.glow || 'rgba(168,85,247,0.15)'}`
              }}
              className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900/90 rounded-2xl border border-neutral-800 flex flex-col overflow-y-auto z-10 animate-fade-in"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur font-mono text-[9px] tracking-wide">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 font-black tracking-widest uppercase bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/10">
                    {activeVideo.category}
                  </span>
                  <span className="text-neutral-500 font-extrabold shrink-0">
                    TUT_0{activeVideo.index}
                  </span>
                  <span className="hidden sm:inline text-neutral-700">|</span>
                  <span className="hidden sm:inline text-neutral-300 font-sans font-bold truncate max-w-md">
                    {activeVideo.title}
                  </span>
                </div>
                
                <button
                  onClick={() => setActiveVideo(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white rounded-xl text-[9px] font-extrabold uppercase transition-all tracking-wider cursor-pointer group"
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
                      <div className="w-1.5 h-6 bg-purple-500 rounded-none animate-[bounce_0.6s_infinite_100ms]" />
                      <div className="w-1.5 h-6 bg-purple-500 rounded-none animate-[bounce_0.6s_infinite_200ms]" />
                      <div className="w-1.5 h-6 bg-purple-500 rounded-none animate-[bounce_0.6s_infinite_300ms]" />
                    </div>
                    <div className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] animate-pulse">
                      MUTATING REAL-TIME PORT SIGNAL DENSITY TO {selectedQuality}...
                    </div>
                  </div>
                )}

                {getEmbedUrl(activeVideo.url) ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={getEmbedUrl(activeVideo.url)}
                      title={activeVideo.title}
                      className="w-full h-full border-0 animate-fade-in"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                    {isGoogleDriveUrl(activeVideo.url) && (
                      <div className="absolute top-2 left-2 z-30 max-w-sm sm:max-w-md bg-neutral-950/90 border border-amber-500/30 backdrop-blur-md rounded-xl p-2 md:p-3 text-left space-y-2 pointer-events-auto shadow-2xl">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-[pulse_1s_infinite]" />
                          <span className="text-[9px] font-black tracking-widest text-[#f59e0b] uppercase font-mono">
                            Chrome Embed notice
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-300 font-sans tracking-wide leading-relaxed font-semibold">
                          Google Chrome restricts embedded Drive videos outside of AI Studio's trusted frame due to <strong>Third-Party Cookie rules</strong>. If you see "Video unavailable" below, bypass the restriction by playing directly card-native or in a separate tab:
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={activeVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-[9px] font-extrabold uppercase font-mono tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Play in G-Drive Tab ↗</span>
                          </a>
                          <button
                            onClick={() => {
                              window.open(activeVideo.url, '_blank');
                            }}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 hover:border-neutral-600 rounded-lg text-[9px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer"
                          >
                            Direct Open
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-4 font-mono">
                    <div className="text-red-400 font-bold">SOURCE LINK INOPERATIVE</div>
                    <div className="text-xs text-neutral-500">{activeVideo.url}</div>
                  </div>
                )}
              </div>

              {/* Resolution / Decryption Bandwidth Terminal selector */}
              <div className="px-4 py-3 bg-neutral-950/80 border-t border-b border-neutral-800/80 flex flex-col gap-2.5 font-mono">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-[ping_1.5s_infinite]" />
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                      STREAM QUALITY FEED CONSOLE:
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['360p', '480p', '720p', '1080p'] as const).map((q) => {
                      const qLabels = {
                        '360p': { label: '360P', detail: 'SD DEFAULT' },
                        '480p': { label: '480P', detail: 'HQ STREAM' },
                        '720p': { label: '720P', detail: 'HD DIRECT' },
                        '1080p': { label: '1080P', detail: 'CORE 1080P' }
                      };
                      const isActive = selectedQuality === q;
                      
                      return (
                        <button
                          key={q}
                          onClick={() => changeQuality(q)}
                          className={`px-3 py-1.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border cursor-pointer ${
                            isActive
                              ? 'bg-purple-950/80 border-purple-500/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          <span className={`${isActive ? 'text-purple-400 scale-125' : 'text-neutral-600'} transition-transform`}>●</span>
                          <span>{qLabels[q].label}</span>
                          <span className="text-[7.5px] opacity-50 font-medium">({qLabels[q].detail})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated resolution instruction banner to explain sandboxed frame limitation */}
                {selectedQuality !== '360p' && (
                  <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-3 text-[10px] text-purple-300 tracking-wide leading-relaxed animate-fade-in flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1 text-left">
                      <span className="font-extrabold text-white uppercase block tracking-wider text-[9px]">
                        ⚠️ STABILITY PROTOCOL: SANDBOX {selectedQuality} THROTTLE BYPASS
                      </span>
                      <span>
                        Integrated iFrames enforce a standard 360p resolution rate limit. To instantly bypass the preview restrictions and stream this file in full {selectedQuality} density, initiate the bypass link.
                      </span>
                    </div>
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/30 text-white rounded-lg text-[9px] font-bold uppercase transition-all tracking-wider shrink-0 text-center inline-flex items-center gap-1.5 w-full md:w-auto justify-center"
                    >
                      <span>FORCE {selectedQuality} PLAYBACK ↗</span>
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
                  <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed line-clamp-2 sm:line-clamp-none font-medium">
                    {activeVideo.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-[9px] uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn"
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
