import { motion } from 'motion/react';
import { Play, ExternalLink, Wrench, Terminal, Cpu, Database, Network, ShieldCheck } from 'lucide-react';

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
  const tutorials: TutorialVideo[] = [
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

          return (
            <motion.a
              key={index}
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
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
    </div>
  );
}
