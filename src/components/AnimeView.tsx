import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronRight, Shield, Sparkles, BookOpen, Clock, Heart, Radio, Activity, Volume2, Info, ArrowLeft, Tv } from 'lucide-react';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';

interface Episode {
  id: string;
  season: 1 | 2;
  episodeNumber: number;
  code: string;
  title: string;
  jpTitle: string;
  image: string;
  duration: string;
  airDate: string;
  description: string;
  quote: string;
  quoteBy: string;
  powerLevel: string;
  keyOperatives: string[];
  trackTitle: string;
  trackDuration: string;
}

const EPISODES_DATABASE: Episode[] = [
  {
    id: 's1e1',
    season: 1,
    episodeNumber: 1,
    code: 'S1 EP01',
    title: 'The Self-Proclaimed Mob',
    jpTitle: 'あいつは妄想のモブキャラ？',
    image: shadowOnRoof,
    duration: '23:40',
    airDate: 'October 5, 2022',
    description: 'In modern-day Japan, a boy aspires to be a shadowy powerhouse who operates behind the scenes. Following a fatal accident, he is reincarnated into a magical world as Cid Kagenou.',
    quote: "I didn't want to be a hero, nor a villain. I wanted to be the mastermind in the shadows.",
    quoteBy: 'Cid Kagenou',
    powerLevel: '8,500 MANA',
    keyOperatives: ['Cid Kagenou', 'Alpha', 'Beta'],
    trackTitle: 'The Beginning of Shadow Garden',
    trackDuration: '02:45'
  },
  {
    id: 's1e2',
    season: 1,
    episodeNumber: 2,
    code: 'S1 EP02',
    title: 'Shadow Garden is Born',
    jpTitle: '結成シャドウガーデン',
    image: shadowAura,
    duration: '24:05',
    airDate: 'October 12, 2022',
    description: 'Cid transforms his childhood friend Alpha into a formidable fighter and invents a story about the "Cult of Diablos" to justify his fantasy. Little does he know, the Cult is terrifyingly real.',
    quote: "Our name is Shadow Garden. We lurk in the shadows, to hunt the shadows...",
    quoteBy: 'Shadow',
    powerLevel: '45,200 MANA',
    keyOperatives: ['Shadow', 'Alpha', 'Beta', 'Gamma'],
    trackTitle: 'Shadow Garden Theme (Spooky Waltz)',
    trackDuration: '03:12'
  },
  {
    id: 's1e5',
    season: 1,
    episodeNumber: 5,
    code: 'S1 EP05',
    title: 'I Am Atomic',
    jpTitle: 'アイ・アム・アトミック',
    image: shadowBlade,
    duration: '23:55',
    airDate: 'November 2, 2022',
    description: 'Faced with the villainous Xenon in the royal sewers, Cid decides to demonstrate the ultimate evolution of magical focus. The absolute pinnacle of offensive power is unleashed.',
    quote: "If you do not wish to be vaporized by an atomic blast, you must become Atomic itself.",
    quoteBy: 'Shadow',
    powerLevel: '999,999 MANA',
    keyOperatives: ['Shadow', 'Xenon (Cult)', 'Alexia Midgar'],
    trackTitle: 'I Am Atomic (Orchestral Drop)',
    trackDuration: '04:20'
  },
  {
    id: 's1e12',
    season: 1,
    episodeNumber: 12,
    code: 'S1 EP12',
    title: 'Sanctuary Intruder',
    jpTitle: '記憶の中の真実',
    image: shadowMoonRain,
    duration: '24:12',
    airDate: 'December 21, 2022',
    description: 'Investigating the mysterious Goddess Trial, Cid is transported into the memories of the Sanctuary, where he meets Aurora, the beautiful Calamity Witch who nearly destroyed the ancient world.',
    quote: "You have a fascinating soul, boy. It has been a millennium since someone made me laugh.",
    quoteBy: 'Aurora (Calamity Witch)',
    powerLevel: '120,000 MANA',
    keyOperatives: ['Shadow', 'Aurora', 'Delta', 'Epsilon'],
    trackTitle: 'Sanctuary of Ancient Memories',
    trackDuration: '03:40'
  },
  {
    id: 's2e1',
    season: 2,
    episodeNumber: 1,
    code: 'S2 EP01',
    title: 'The Lawless City',
    jpTitle: '無法都市',
    image: shadowElectricity,
    duration: '23:50',
    airDate: 'October 4, 2023',
    description: 'Cid enters the notorious Lawless City, an anarchist domain ruled by three vicious monarchs. Inside the Crimson Tower, the ancient Progenitor Vampire Queen is about to awaken.',
    quote: "The night is deep, and the moon is red. The blood feast of the monarchs begins now.",
    quoteBy: 'Mary the Ancient Hunter',
    powerLevel: '180,500 MANA',
    keyOperatives: ['Shadow', 'Mary', 'Yukime', 'Juggernaut'],
    trackTitle: 'The Crimson Moon Red Banquet',
    trackDuration: '03:05'
  },
  {
    id: 's2e12',
    season: 2,
    episodeNumber: 12,
    code: 'S2 EP12',
    title: 'Higjacking Legend',
    jpTitle: '世界を乗っ取る最強伝説',
    image: shadowClockTower,
    duration: '24:32',
    airDate: 'December 20, 2023',
    description: 'The spectacular final duel at the Clock Tower merges financial dominance with world-class theatrical flair. Cid takes on the extreme might of ancient dimensions.',
    quote: "The legend belongs to whoever rewrites the chronicle. Let us build a kingdom in the twilight.",
    quoteBy: 'Shadow',
    powerLevel: '1,500,000 MANA',
    keyOperatives: ['Shadow', 'Beta', 'Rose Oriana', 'Alpha'],
    trackTitle: 'Twilight Clock Tower Finale',
    trackDuration: '05:15'
  }
];

export default function AnimeView() {
  const [selectedSeason, setSelectedSeason] = useState<1 | 2 | 'ALL'>('ALL');
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(35);
  const [spectrumBars, setSpectrumBars] = useState<number[]>(new Array(25).fill(10));
  
  // Audio simulation ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 0.5;
        });
        setSpectrumBars(() => {
          return new Array(25).fill(0).map(() => Math.floor(Math.random() * 45) + 5);
        });
      }, 150);
    } else {
      setSpectrumBars(new Array(25).fill(10));
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const filteredEpisodes = EPISODES_DATABASE.filter(ep => {
    if (selectedSeason === 'ALL') return true;
    return ep.season === selectedSeason;
  });

  const handleLaunchEpisodeIntel = (ep: Episode) => {
    setActiveEpisode(ep);
    setIsPlaying(false);
    setPlayProgress(15);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans select-none relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeEpisode ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 p-6 md:p-8 flex flex-col justify-between max-w-6xl mx-auto w-full overflow-hidden"
          >
            {/* Upper Section */}
            <div className="shrink-0 mb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.25em] text-purple-400 font-black uppercase mb-1">
                    // SHADOW OBSIDIAN DECK ARCHIVE
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                    Eminence in Shadow Chronicle
                  </h3>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                    Declassified files logs from the primary tactical database of Shadow Garden
                  </p>
                </div>

                {/* Season switch filter */}
                <div className="flex bg-neutral-900/60 p-1 border border-neutral-850 rounded-xl shrink-0 self-start md:self-auto">
                  <button
                    onClick={() => setSelectedSeason('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                      selectedSeason === 'ALL'
                        ? 'bg-purple-950 text-purple-400 border border-purple-500/20'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    ALL SAGAS
                  </button>
                  <button
                    onClick={() => setSelectedSeason(1)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                      selectedSeason === 1
                        ? 'bg-purple-950 text-purple-400 border border-purple-500/20'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    SEASON 01
                  </button>
                  <button
                    onClick={() => setSelectedSeason(2)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                      selectedSeason === 2
                        ? 'bg-purple-950 text-purple-400 border border-purple-500/20'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    SEASON 02
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Episodes Grid Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEpisodes.map((ep, idx) => (
                  <motion.div
                    key={ep.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.45)' }}
                    className="border border-neutral-900 bg-neutral-950/40 backdrop-blur-sm rounded-2xl overflow-hidden group flex flex-col justify-between h-[340px] transition-all duration-300 relative shadow-lg"
                  >
                    {/* Cover art box */}
                    <div className="h-36 relative overflow-hidden bg-neutral-900 shrink-0">
                      <img
                        src={ep.image}
                        alt={ep.title}
                        className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
                      
                      {/* Tags */}
                      <span className="absolute top-4 left-4 bg-purple-950/90 border border-purple-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-black tracking-widest text-purple-400 uppercase">
                        {ep.code}
                      </span>
                      <span className="absolute top-4 right-4 flex items-center gap-1 bg-black/70 border border-neutral-800 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-neutral-400 uppercase">
                        <Clock size={8} /> {ep.duration}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-base font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                          {ep.title}
                        </h4>
                        <p className="text-[9px] font-bold text-neutral-500 tracking-wider font-mono italic">
                          {ep.jpTitle}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-semibold leading-relaxed line-clamp-3 uppercase tracking-wide">
                          {ep.description}
                        </p>
                      </div>

                      {/* Launch Intel Trigger */}
                      <div className="pt-4 border-t border-neutral-900/40 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-purple-500 font-extrabold tracking-widest">
                          {ep.powerLevel}
                        </span>
                        <button
                          onClick={() => handleLaunchEpisodeIntel(ep)}
                          className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-400 group-hover:text-white transition-colors cursor-pointer"
                        >
                          DECLASSIFY INTEL <ChevronRight size={12} className="text-purple-450 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>


          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col lg:flex-row bg-neutral-950 h-full overflow-y-auto lg:overflow-hidden"
          >
            {/* Left Side: Detail & Story Intel */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar flex flex-col justify-between">
              <div>
                {/* Back Link */}
                <button
                  onClick={() => setActiveEpisode(null)}
                  className="flex items-center gap-2 group transition-opacity opacity-75 hover:opacity-100 text-neutral-400 hover:text-white mb-6 cursor-pointer"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                    RETURN_TO_ARCHIVE_DECK
                  </span>
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-950 border border-purple-500/30 text-purple-405 text-purple-400 px-2.5 py-0.5 text-[9px] font-bold tracking-widest font-mono rounded-full uppercase">
                    {activeEpisode.code}
                  </span>
                  <span className="text-neutral-500 font-mono text-[9px] font-bold uppercase">
                    LAUNCH: {activeEpisode.airDate}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none mb-1">
                  {activeEpisode.title}
                </h2>
                <p className="text-[10px] font-extrabold text-neutral-500 tracking-wider font-mono italic mb-6">
                  {activeEpisode.jpTitle}
                </p>

                {/* Cover art mockup in details */}
                <div className="relative border border-neutral-900 rounded-2xl overflow-hidden h-52 sm:h-64 mb-6 bg-neutral-900 shadow-2xl">
                  <img
                    src={activeEpisode.image}
                    alt={activeEpisode.title}
                    className="w-full h-full object-cover filter brightness-[1.1] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <span className="text-[7.5px] text-purple-400 font-extrabold tracking-widest block uppercase mb-1">RECORD DEPLOYER</span>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Cid Kagenou Sovereign Account</p>
                    </div>
                    <span className="text-[8px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                      SYSTEM OK
                    </span>
                  </div>
                </div>

                {/* Overview */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] text-neutral-500 font-black tracking-widest uppercase block mb-1">DECLASSIFIED PLOT LOG</span>
                    <p className="text-neutral-300 text-xs uppercase leading-relaxed font-semibold tracking-wide bg-neutral-900/40 p-3 rounded-lg border border-neutral-900/80">
                      {activeEpisode.description}
                    </p>
                  </div>

                  {/* Character Operatives */}
                  <div>
                    <span className="text-[8px] text-neutral-500 font-black tracking-widest uppercase block mb-2">OPERATIVES ENGAGED IN COMBAT</span>
                    <div className="flex flex-wrap gap-2">
                      {activeEpisode.keyOperatives.map((op, i) => (
                        <span key={i} className="flex items-center gap-1 text-[9px] font-bold bg-neutral-900/80 border border-neutral-800 px-2.5 py-1 text-zinc-300 uppercase tracking-tight rounded-md">
                          <Shield size={10} className="text-purple-400" />
                          {op}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status block info */}
              <div className="mt-8 pt-4 border-t border-neutral-900/60 text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                // ACTIVE CRON LOG: {activeEpisode.powerLevel} FORCE INTENSITY DETECTED
              </div>
            </div>

            {/* Right Side: Tactical Immersive Sound Deck Player */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-neutral-900 p-6 md:p-8 bg-neutral-950/65 backdrop-blur-sm flex flex-col justify-between shrink-0">
              <div>
                <p className="text-[9px] font-mono tracking-[0.2em] text-purple-400 font-black uppercase mb-3">
                  // COGNITIVE MANA COIL
                </p>
                <h3 className="text-base font-black uppercase tracking-tight text-white mb-6">
                  Anime Audio Stream
                </h3>

                {/* Wave Visualizer Box */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 mb-6 relative overflow-hidden flex flex-col justify-end h-44 shadow-inner">
                  {/* Neon Glow bg */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-500/5 filter blur-[45px] pointer-events-none" />

                  {/* Micro grid indicators */}
                  <div className="absolute top-4 inset-x-4 flex justify-between font-mono text-[7px] text-neutral-600 uppercase font-bold">
                    <span>STATUS: {isPlaying ? 'STREAMING ACTIVE' : 'LOCKED'}</span>
                    <span>COIL_VOLTAGE: {isPlaying ? '780V' : '15V'}</span>
                  </div>

                  <div className="flex items-end justify-center gap-1.5 h-20 mb-2 relative z-10 w-full">
                    {spectrumBars.map((val, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: `${val}%` }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-1.5 rounded-full bg-gradient-to-t from-purple-950 via-purple-500 to-violet-300"
                      />
                    ))}
                  </div>

                  <div className="border-t border-neutral-900/80 pt-2 flex items-center justify-between font-mono text-[8px] text-neutral-500 uppercase">
                    <span>9.41 KB/S</span>
                    <span className="flex items-center gap-1">
                      <Radio size={8} className="text-purple-400 animate-pulse" /> DECRYPTION MODULE ACTIVE
                    </span>
                  </div>
                </div>

                {/* Track details metadata */}
                <div className="mb-8 space-y-1 bg-neutral-900/45 border border-neutral-900/80 p-4 rounded-xl">
                  <span className="text-[7.5px] font-black tracking-widest text-purple-4.. text-purple-400 uppercase block mb-1">EPISODE THEME SCORE</span>
                  <div className="text-xs font-bold text-white uppercase tracking-wide truncate">{activeEpisode.trackTitle}</div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono pt-1">
                    <span>COMPOSER: SHADOW GARDEN CHRONICLE</span>
                    <span>{activeEpisode.trackDuration}</span>
                  </div>
                </div>

                {/* Interactive Player Controls */}
                <div className="space-y-4">
                  {/* Time progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-1 bg-neutral-900 rounded-full overflow-hidden relative cursor-pointer group">
                      <div 
                        style={{ width: `${playProgress}%` }}
                        className="absolute h-full left-0 top-0 bg-purple-500 transition-all duration-300 group-hover:bg-purple-400" 
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-neutral-500 font-semibold font-mono uppercase">
                      <span>00:34</span>
                      <span>{activeEpisode.trackDuration}</span>
                    </div>
                  </div>

                  {/* Row buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-400 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer shadow-lg transition-transform"
                    >
                      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Quote section inside visual controls */}
              <div className="border-t border-neutral-900/60 pt-6 mt-8 space-y-2">
                <span className="text-[7.5px] text-neutral-500 font-black tracking-widest uppercase block">// ANCIENT MEMEX TRANSCRIPT</span>
                <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wider italic">
                  "{activeEpisode.quote}"
                </p>
                <div className="text-[8px] font-semibold text-purple-400 text-right uppercase tracking-widest block font-mono">
                  — {activeEpisode.quoteBy}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
