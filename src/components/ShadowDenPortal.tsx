import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Music,
  Play,
  Image as ImageIcon,
  User,
  ChevronRight,
  Home,
  X,
  Maximize2,
  Shield,
  Cpu,
  Headphones,
  Tv,
  Mail,
  Phone,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import MusicView, { parseAudioTitleAndArtist, Track } from './MusicView';
import AnimeView from './AnimeView';
import DrivePickerTrigger from './DrivePickerModal';
import type { PickedDriveFile } from '../lib/googlePicker';
import { hasStrictAdminAuthority, syncMusicLibraryToFirestore } from '../firebase';
import shadowElectricityIcon from '../assets/images/shadow_neon_electricity_1779250694461.png';

import ownerIdPhoto from '../assets/images/owner_id_photo_1779279731967.png';
import shadowMasterAtomic from '../assets/images/shadow_master_atomic_1779279129608.png';
import shadowOnThrone from '../assets/images/shadow_on_throne_1781612271107.jpg';
import shadowGardenCharacters from '../assets/images/shadow_garden_characters_1780189909589.png';
import cyberDesktopSetup from '../assets/images/cyber_desktop_setup_bg_1781612930975.jpg';
import auroraVoidSanctuary from '../assets/images/aurora_void_sanctuary_1782197036617.jpg';
import deltaBeastBlade from '../assets/images/delta_beast_blade_1782196956033.jpg';
import yukimeFoxGod from '../assets/images/yukime_fox_god_1782197021212.jpg';
import shadowViolinRooftop from '../assets/images/shadow_violin_rooftop_1782196626236.jpg';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';
import shadowReadingGrimoire from '../assets/images/shadow_reading_grimoire_1781612288711.jpg';
import lawlessCitySkyline from '../assets/images/lawless_city_skyline_1782197000218.jpg';

const SHADOW_DEN_HERO_ART = '/assets/aistudio/image_aac3722f.png';

interface ShadowDenPortalProps {
  onBackToHub: () => void;
  onGoToShadowTech: () => void;
  isAdmin?: boolean;
}

type DenDestination = 'home' | 'media' | 'gallery' | 'about';
type MediaMode = 'music' | 'anime';
type GalleryFilter = 'ALL' | 'CHARACTERS' | 'SETUPS';

interface GalleryItem {
  id: string;
  title: string;
  category: 'CHARACTERS' | 'SETUPS';
  src: string;
  isHeroSvgCrop?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'den-battlestation',
    title: 'Midnight Sanctuary Setup',
    category: 'SETUPS',
    src: SHADOW_DEN_HERO_ART,
    isHeroSvgCrop: true,
  },
  {
    id: 'cyber-rig',
    title: 'Neon Multi-Monitor Rig',
    category: 'SETUPS',
    src: cyberDesktopSetup,
  },
  {
    id: 'shadow-throne',
    title: 'Shadow Upon the Throne',
    category: 'CHARACTERS',
    src: shadowOnThrone,
  },
  {
    id: 'shadow-atomic',
    title: 'I Am Atomic — Overdrive',
    category: 'CHARACTERS',
    src: shadowMasterAtomic,
  },
  {
    id: 'shadow-garden',
    title: 'Seven Shades Assembly',
    category: 'CHARACTERS',
    src: shadowGardenCharacters,
  },
  {
    id: 'shadow-violin',
    title: 'Moonlight Nocturne Violin',
    category: 'CHARACTERS',
    src: shadowViolinRooftop,
  },
  {
    id: 'aurora-sanctuary',
    title: 'Aurora Void Sanctuary',
    category: 'CHARACTERS',
    src: auroraVoidSanctuary,
  },
  {
    id: 'delta-beast',
    title: 'Delta — Feral Blade',
    category: 'CHARACTERS',
    src: deltaBeastBlade,
  },
  {
    id: 'yukime-fox',
    title: 'Yukime — Spirit Fox',
    category: 'CHARACTERS',
    src: yukimeFoxGod,
  },
  {
    id: 'shadow-grimoire',
    title: 'Archive of the Shadow',
    category: 'CHARACTERS',
    src: shadowReadingGrimoire,
  },
  {
    id: 'clock-tower',
    title: 'Clocktower Storm Watch',
    category: 'SETUPS',
    src: shadowClockTower,
  },
  {
    id: 'lawless-skyline',
    title: 'Crimson District Skyline',
    category: 'SETUPS',
    src: lawlessCitySkyline,
  },
];

export const SHADOW_DEN_PRELOAD_URLS: string[] = [
  SHADOW_DEN_HERO_ART,
  ownerIdPhoto,
  ...GALLERY_ITEMS.map((item) => item.src).filter((src) => src !== SHADOW_DEN_HERO_ART),
];

export default function ShadowDenPortal({
  onBackToHub,
  onGoToShadowTech,
  isAdmin = false,
}: ShadowDenPortalProps) {
  const [activeDestination, setActiveDestination] = useState<DenDestination>('home');
  const [mediaMode, setMediaMode] = useState<MediaMode>('music');
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>('ALL');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [copiedField, setCopiedField] = useState<'EMAIL' | 'PHONE' | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxItem) {
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [lightboxItem]);

  const openMediaDestination = (mode: MediaMode) => {
    setMediaMode(mode);
    setActiveDestination('media');
  };

  const handleCopy = (field: 'EMAIL' | 'PHONE', value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredGallery =
    galleryFilter === 'ALL'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === galleryFilter);

  return (
    <div className="min-h-screen w-full bg-[#070412] text-white flex flex-col relative overflow-x-hidden">
      {/* Persistent Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#090517]/90 backdrop-blur-md border-b border-fuchsia-500/20">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Back to Hub / Home switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-fuchsia-950/55 hover:bg-fuchsia-900/70 border border-fuchsia-500/40 text-fuchsia-200 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shadow Hub</span>
            </button>

            {activeDestination !== 'home' && (
              <button
                type="button"
                onClick={() => setActiveDestination('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap"
              >
                <Home className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>Den Home</span>
              </button>
            )}
          </div>

          {/* Center: Destination Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-purple-500/20">
            <button
              type="button"
              onClick={() => setActiveDestination('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeDestination === 'home'
                  ? 'bg-fuchsia-600/80 text-white shadow-[0_0_14px_rgba(217,70,239,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveDestination('media')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeDestination === 'media'
                  ? 'bg-fuchsia-600/80 text-white shadow-[0_0_14px_rgba(217,70,239,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Music + Anime Video
            </button>
            <button
              type="button"
              onClick={() => setActiveDestination('gallery')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeDestination === 'gallery'
                  ? 'bg-fuchsia-600/80 text-white shadow-[0_0_14px_rgba(217,70,239,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => setActiveDestination('about')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeDestination === 'about'
                  ? 'bg-fuchsia-600/80 text-white shadow-[0_0_14px_rgba(217,70,239,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About Me
            </button>
          </nav>

          {/* Right: Title & Switch to Shadow Tech */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onGoToShadowTech}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Shadow Tech</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div
              className="text-base sm:text-lg font-black italic uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-white">SHADOW</span>{' '}
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                DEN
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Destination Links Row */}
        <nav className="flex md:hidden items-center gap-1.5 px-4 pb-2.5 overflow-x-auto no-scrollbar border-t border-fuchsia-500/10 pt-2">
          <button
            type="button"
            onClick={() => setActiveDestination('home')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDestination === 'home'
                ? 'bg-fuchsia-600/80 text-white'
                : 'text-slate-300 hover:text-white bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveDestination('media')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDestination === 'media'
                ? 'bg-fuchsia-600/80 text-white'
                : 'text-slate-300 hover:text-white bg-white/5'
            }`}
          >
            Music + Anime
          </button>
          <button
            type="button"
            onClick={() => setActiveDestination('gallery')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDestination === 'gallery'
                ? 'bg-fuchsia-600/80 text-white'
                : 'text-slate-300 hover:text-white bg-white/5'
            }`}
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => setActiveDestination('about')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeDestination === 'about'
                ? 'bg-fuchsia-600/80 text-white'
                : 'text-slate-300 hover:text-white bg-white/5'
            }`}
          >
            About Me
          </button>
          <button
            type="button"
            onClick={onGoToShadowTech}
            className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Shadow Tech</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </nav>
      </header>

      {/* ================================================================== */}
      {/* DESTINATION 0: SHADOW DEN HOME PAGE (Image 1 Hero + 3 Portals)     */}
      {/* ================================================================== */}
      {activeDestination === 'home' && (
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Full-Bleed Image 1 Cyber Battlestation Backdrop */}
          <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <svg
                viewBox="56 18 648 340"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full object-cover"
                aria-hidden="true"
              >
                <image
                  href={SHADOW_DEN_HERO_ART}
                  x="0"
                  y="0"
                  width="849"
                  height="418"
                />
              </svg>
              {/* Atmospheric gradient overlays so Image 1 gleams clearly while UI stays sharp & legible */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(7,4,18,0.62) 0%, rgba(7,4,18,0.28) 38%, rgba(7,4,18,0.72) 72%, rgba(7,4,18,0.97) 100%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 20% 25%, rgba(168,85,247,0.18), transparent 48%), radial-gradient(circle at 80% 70%, rgba(217,70,239,0.18), transparent 50%)',
                }}
              />
            </div>

            {/* Hero Headline Area */}
            <div className="relative z-10 max-w-[1320px] w-full mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#160a2e]/85 border border-fuchsia-400/45 text-fuchsia-200 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Personal Cyber Sanctuary</span>
                </div>

                <h1
                  className="text-4xl sm:text-6xl font-black italic uppercase tracking-wide leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="text-white">WELCOME TO</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    SHADOW DEN
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-100/90 mt-4 max-w-xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  Step inside your private midnight battlestation. Stream curated soundtracks and anime episodes, inspect the visual vault, or check out the creator profile below.
                </p>
              </motion.div>
            </div>

            {/* Bottom Docked 3 Destination Cards inside Image 1 Home Page */}
            <div className="relative z-10 max-w-[1320px] w-full mx-auto px-5 sm:px-8 pb-10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* ---------------------------------------------------------- */}
                {/* DESTINATION 1: MUSIC + ANIME VIDEO                         */}
                {/* ---------------------------------------------------------- */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="group rounded-2xl bg-[#100822]/85 hover:bg-[#160b2e]/95 border border-fuchsia-400/40 hover:border-fuchsia-300/80 p-6 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center text-fuchsia-300">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-fuchsia-300/80">
                        01 // Media Hub
                      </span>
                    </div>

                    <h2
                      className="text-xl font-black italic uppercase tracking-wide text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Music + Anime Video
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300/90 mt-2 leading-relaxed">
                      Launch the integrated MP3 music deck synced with your archive tracks or switch straight into anime episodes and trailers.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => openMediaDestination('music')}
                      className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-600/85 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_18px_rgba(217,70,239,0.35)]"
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>Music</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openMediaDestination('anime')}
                      className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/75 hover:bg-purple-800 border border-purple-400/45 text-purple-100 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-purple-200" />
                      <span>Anime Video</span>
                    </button>
                  </div>
                </motion.div>

                {/* ---------------------------------------------------------- */}
                {/* DESTINATION 2: GALLERY                                     */}
                {/* ---------------------------------------------------------- */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.14 }}
                  className="group rounded-2xl bg-[#100822]/85 hover:bg-[#160b2e]/95 border border-violet-400/40 hover:border-violet-300/80 p-6 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/50 flex items-center justify-center text-violet-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-violet-300/80">
                        02 // Visual Vault
                      </span>
                    </div>

                    <h2
                      className="text-xl font-black italic uppercase tracking-wide text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Gallery
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300/90 mt-2 leading-relaxed">
                      Browse the curated collection of Shadow Garden character art, moonlit scenes, and neon battlestation builds in full resolution.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setActiveDestination('gallery')}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/85 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_18px_rgba(139,92,246,0.35)]"
                    >
                      <span>Open Gallery</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>

                {/* ---------------------------------------------------------- */}
                {/* DESTINATION 3: ABOUT ME                                    */}
                {/* ---------------------------------------------------------- */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="group rounded-2xl bg-[#100822]/85 hover:bg-[#160b2e]/95 border border-pink-400/40 hover:border-pink-300/80 p-6 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-pink-300">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-pink-300/80">
                        03 // Profile
                      </span>
                    </div>

                    <h2
                      className="text-xl font-black italic uppercase tracking-wide text-white"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      About Me
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300/90 mt-2 leading-relaxed">
                      Meet the builder behind Shadow Tech &amp; Shadow Den—PC technician, anime enthusiast, system customizer, and digital archivist.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setActiveDestination('about')}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_18px_rgba(236,72,153,0.3)]"
                    >
                      <span>View About Me</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ================================================================== */}
      {/* DESTINATION 1: MUSIC + ANIME VIDEO                                 */}
      {/* ================================================================== */}
      {activeDestination === 'media' && (
        <main className="flex-1 flex flex-col bg-[#070412] min-h-[calc(100vh-4rem)]">
          {/* Dual Mode Switcher Subbar */}
          <div className="border-b border-fuchsia-500/20 bg-[#0d071e]/90 px-4 sm:px-8 py-4 shrink-0">
            <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1
                  className="text-xl sm:text-2xl font-black italic uppercase tracking-wide text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Music <span className="text-fuchsia-400">+</span> Anime Video
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Switch seamlessly between your MP3 Music Player and Anime Video Player.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-fuchsia-500/30">
                  <button
                    type="button"
                    onClick={() => setMediaMode('music')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      mediaMode === 'music'
                        ? 'bg-fuchsia-600 text-white shadow-[0_0_16px_rgba(217,70,239,0.5)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    <span>Music Player</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaMode('anime')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      mediaMode === 'anime'
                        ? 'bg-purple-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.5)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span>Anime Video</span>
                  </button>
                </div>

                <DrivePickerTrigger
                  viewMode={mediaMode === 'music' ? 'audio' : 'video'}
                  label="Google Picker"
                  showPickedPreviewModal={mediaMode === 'anime'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/50 text-indigo-100 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_16px_rgba(99,102,241,0.28)]"
                  onFilesPicked={(pickedFiles: PickedDriveFile[]) => {
                    if (!pickedFiles.length) return;
                    const audioFiles = pickedFiles.filter(
                      (f) =>
                        f.mimeType.startsWith('audio/') ||
                        /\.(mp3|wav|flac|m4a|ogg|aac|opus)$/i.test(f.name)
                    );
                    if (audioFiles.length > 0 && mediaMode === 'music') {
                      try {
                        const existingRaw = localStorage.getItem('shadow_gdrive_tracks');
                        const existing: Track[] = existingRaw ? JSON.parse(existingRaw) : [];
                        const nextTracks = Array.isArray(existing) ? [...existing] : [];
                        for (const file of audioFiles) {
                          if (!nextTracks.some((t) => t.fileId === file.id || t.id === `gdrive-${file.id}`)) {
                            const meta = parseAudioTitleAndArtist(file.name);
                            nextTracks.unshift({
                              id: `gdrive-${file.id}`,
                              fileId: file.id,
                              title: meta.title,
                              artist: meta.artist || 'Google Drive Audio',
                              duration: 'Play',
                              size: file.sizeBytes
                                ? `${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
                                : 'Drive File',
                              link: file.url,
                              image: shadowElectricityIcon,
                              isDrive: true,
                              playlists: ['All'],
                            });
                          }
                        }
                        localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(nextTracks));
                        window.dispatchEvent(new Event('shadow_picker_music_added'));
                        if (hasStrictAdminAuthority()) {
                          const playlistsRaw = localStorage.getItem('shadow_music_playlists');
                          const playlists: string[] = playlistsRaw ? JSON.parse(playlistsRaw) : ['All'];
                          syncMusicLibraryToFirestore(nextTracks, playlists).catch(() => {});
                        }
                      } catch (_) {}
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
            {mediaMode === 'music' ? (
              <MusicView isAdmin={isAdmin} />
            ) : (
              <AnimeView isAdmin={isAdmin} />
            )}
          </div>
        </main>
      )}

      {/* ================================================================== */}
      {/* DESTINATION 2: GALLERY                                             */}
      {/* ================================================================== */}
      {activeDestination === 'gallery' && (
        <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-6 border-b border-fuchsia-500/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-400">
                Shadow Den // Visual Archive
              </span>
              <h1
                className="text-3xl sm:text-4xl font-black italic uppercase tracking-wide text-white mt-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Shadow <span className="text-fuchsia-400">Gallery</span>
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
              {(['ALL', 'CHARACTERS', 'SETUPS'] as GalleryFilter[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGalleryFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    galleryFilter === tab
                      ? 'bg-fuchsia-600 text-white shadow-[0_0_12px_rgba(217,70,239,0.45)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'CHARACTERS' ? 'Anime & Shadow' : 'Setups'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setLightboxItem(item)}
                className="group text-left rounded-2xl overflow-hidden bg-[#110824] border border-fuchsia-500/25 hover:border-fuchsia-400/80 shadow-lg hover:shadow-[0_0_30px_rgba(217,70,239,0.25)] transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  {item.isHeroSvgCrop ? (
                    <svg
                      viewBox="56 18 648 340"
                      preserveAspectRatio="xMidYMid slice"
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    >
                      <image href={item.src} x="0" y="0" width="849" height="418" />
                    </svg>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0518] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-white">{item.title}</h2>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-fuchsia-300/80">
                      {item.category === 'SETUPS' ? 'Battlestation & Environment' : 'Character Showcase'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-fuchsia-300 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Fullscreen Lightbox */}
          <AnimatePresence>
            {lightboxItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxItem(null)}
                className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-5xl w-full rounded-2xl overflow-hidden bg-[#0e071d] border border-fuchsia-500/40 shadow-[0_0_60px_rgba(217,70,239,0.35)]"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-black/75 hover:bg-fuchsia-600 border border-white/20 text-white transition-colors cursor-pointer"
                    aria-label="Close Lightbox"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-full max-h-[78vh] bg-black flex items-center justify-center overflow-hidden">
                    {lightboxItem.isHeroSvgCrop ? (
                      <svg
                        viewBox="56 18 648 340"
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full max-h-[78vh]"
                      >
                        <image href={lightboxItem.src} x="0" y="0" width="849" height="418" />
                      </svg>
                    ) : (
                      <img
                        src={lightboxItem.src}
                        alt={lightboxItem.title}
                        className="w-full h-full max-h-[78vh] object-contain"
                      />
                    )}
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between border-t border-fuchsia-500/20">
                    <span className="text-base font-bold text-white">{lightboxItem.title}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
                      {lightboxItem.category}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* ================================================================== */}
      {/* DESTINATION 3: ABOUT ME                                            */}
      {/* ================================================================== */}
      {activeDestination === 'about' && (
        <main className="flex-1 max-w-[1160px] w-full mx-auto px-4 sm:px-8 py-10 flex flex-col justify-center">
          <div className="rounded-3xl bg-[#100822]/90 border border-fuchsia-500/35 overflow-hidden shadow-[0_0_55px_rgba(168,85,247,0.2)]">
            {/* Top Banner Crop of Image 1 */}
            <div className="relative h-48 sm:h-60 w-full overflow-hidden">
              <svg
                viewBox="56 18 648 340"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
                aria-hidden="true"
              >
                <image href={SHADOW_DEN_HERO_ART} x="0" y="0" width="849" height="418" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-[#100822] via-[#100822]/40 to-transparent" />
            </div>

            <div className="px-6 sm:px-10 pb-10 -mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-fuchsia-500/20">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-fuchsia-400 shadow-[0_0_28px_rgba(217,70,239,0.5)] bg-[#090517] shrink-0">
                  <img
                    src={ownerIdPhoto}
                    alt="Ian Collantes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-300 mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Shadow Tech Commander // Creator</span>
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl font-black italic uppercase tracking-wide text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Ian Collantes
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Builder of <span className="text-cyan-300 font-semibold">Shadow Tech</span> &amp; curator of <span className="text-fuchsia-300 font-semibold">Shadow Den</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-fuchsia-300 mb-2">
                      Who Am I
                    </h2>
                    <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
                      Hey there—welcome to my personal space inside Shadow Den. Outside of running remote Windows troubleshooting, OS recovery, and PC tune-ups over in Shadow Tech, this midnight setup is where I unwind with anime, curate soundtracks, collect digital artwork, and tinker with web tech.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        PC Builds &amp; Fixes
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Hardware tuning, clean Windows installs, and diagnostics.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <Headphones className="w-5 h-5 text-fuchsia-400 mb-2" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Curated Playlists
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Lo-fi, orchestral OSTs, and late-night coding tracks.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <Tv className="w-5 h-5 text-purple-400 mb-2" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Anime Archive
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        The Eminence in Shadow fan collection &amp; personal watchlists.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Box */}
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-fuchsia-300 mb-2">
                    Direct Contact
                  </h2>
                  <div className="p-4 rounded-xl bg-[#160b2c] border border-fuchsia-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        <Mail className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Email</span>
                      </div>
                      <p className="text-xs sm:text-sm font-mono text-white truncate mt-1">
                        cidkagenou@gmail.com
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('EMAIL', 'cidkagenou@gmail.com')}
                      className="p-2 rounded-lg bg-black/40 hover:bg-fuchsia-600/40 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === 'EMAIL' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#160b2c] border border-fuchsia-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Phone</span>
                      </div>
                      <p className="text-xs sm:text-sm font-mono text-white mt-1">
                        0993 618 8535
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('PHONE', '09936188535')}
                      className="p-2 rounded-lg bg-black/40 hover:bg-fuchsia-600/40 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Phone"
                    >
                      {copiedField === 'PHONE' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openMediaDestination('music')}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Music className="w-4 h-4" />
                    <span>Jump to Music + Anime</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
