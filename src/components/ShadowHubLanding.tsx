import React from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Wrench,
  Settings,
  ShieldCheck,
  Layers,
  Monitor,
  Music,
  Play,
  Star,
  Lock,
} from 'lucide-react';

interface ShadowHubLandingProps {
  onEnterShadowTech: () => void;
  onEnterShadowDen: () => void;
  onOpenAdminLogin: () => void;
}

const HUB_ARTWORK_PATH = '/assets/aistudio/image_e4aa0343.png';

function ShadowCrownEmblem({ className = 'w-9 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 46"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shadowHubCrownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      <path
        d="M32 2L38.5 18.5L59 10L49 33H15L5 10L25.5 18.5L32 2Z"
        fill="url(#shadowHubCrownGrad)"
      />
      <path d="M16 37H48L45 43H19L16 37Z" fill="url(#shadowHubCrownGrad)" />
    </svg>
  );
}

export default function ShadowHubLanding({
  onEnterShadowTech,
  onEnterShadowDen,
  onOpenAdminLogin,
}: ShadowHubLandingProps) {
  return (
    <div className="min-h-screen w-full bg-[#04050c] text-white relative overflow-hidden flex flex-col justify-between select-none">
      {/* Top Left & Right Non-Text Cyber Wing Backdrops (1907x825 asset; center stays clean obsidian so live SHADOW HUB never ghosts) */}
      <div className="absolute inset-x-0 top-0 h-[40vh] pointer-events-none overflow-hidden z-0">
        {/* Left Wing: Electric blue crystal shards & cyber circuits (x=0..495 only, strictly left of baked text) */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-[34%] overflow-hidden">
          <svg
            viewBox="0 0 495 225"
            preserveAspectRatio="xMinYMin slice"
            className="w-full h-full opacity-95"
            aria-hidden="true"
          >
            <image
              href={HUB_ARTWORK_PATH}
              x="0"
              y="0"
              width="1907"
              height="825"
            />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(4,5,12,0.02) 0%, rgba(4,5,12,0.42) 68%, #04050c 100%), linear-gradient(180deg, rgba(4,5,12,0.02) 0%, rgba(4,5,12,0.52) 72%, #04050c 100%)',
            }}
          />
        </div>

        {/* Right Wing: Violet crystal shards & Shadow Crown banner (x=1410..1907 only, strictly right of baked text) */}
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[34%] overflow-hidden">
          <svg
            viewBox="1410 0 497 225"
            preserveAspectRatio="xMaxYMin slice"
            className="w-full h-full opacity-95"
            aria-hidden="true"
          >
            <image
              href={HUB_ARTWORK_PATH}
              x="0"
              y="0"
              width="1907"
              height="825"
            />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(270deg, rgba(4,5,12,0.02) 0%, rgba(4,5,12,0.42) 68%, #04050c 100%), linear-gradient(180deg, rgba(4,5,12,0.02) 0%, rgba(4,5,12,0.52) 72%, #04050c 100%)',
            }}
          />
        </div>

        {/* Center subtle atmospheric crown aura (zero baked-image pixels) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 42% 65% at 50% 24%, rgba(126, 34, 206, 0.28) 0%, rgba(30, 58, 138, 0.14) 55%, transparent 100%)',
          }}
        />
      </div>

      {/* Subtle ambient glows behind left cyan card & right violet card */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-55"
        style={{
          backgroundImage:
            'radial-gradient(circle at 22% 60%, rgba(0, 194, 255, 0.16) 0%, transparent 42%), radial-gradient(circle at 78% 60%, rgba(217, 70, 239, 0.18) 0%, transparent 42%)',
        }}
      />

      {/* Discreet Top-Right Admin Access */}
      <div className="absolute top-3 right-4 z-30">
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="p-2 rounded-lg bg-black/45 hover:bg-purple-500/25 border border-white/15 hover:border-purple-400/60 text-slate-300 hover:text-purple-100 transition-all cursor-pointer backdrop-blur-sm"
          title="Admin Login"
          aria-label="Admin Login"
        >
          <Lock size={14} />
        </button>
      </div>

      {/* MAIN HERO & TWO-WORLD GATEWAY CARDS */}
      <main className="relative z-20 w-full max-w-[1340px] mx-auto px-4 sm:px-8 pt-2.5 sm:pt-4 pb-2 flex-1 flex flex-col items-center justify-center">
        {/* Clean Metallic SHADOW HUB Title Block matching Image 2 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center w-full max-w-5xl mb-3 sm:mb-4 relative"
        >
          {/* Glowing purple Shadow Crown centered above SHADOW HUB */}
          <div className="flex justify-center -mb-1 pointer-events-none" aria-hidden="true">
            <ShadowCrownEmblem className="w-10 h-7 drop-shadow-[0_0_18px_rgba(192,132,252,0.85)]" />
          </div>

          {/* SHADOW HUB Giant Metallic & Violet Display Headline with Circuit Hairlines */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {/* Left Cyan Circuit Line + Node */}
            <div className="hidden sm:flex items-center flex-1 max-w-[230px] justify-end">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-400/95 via-cyan-400/50 to-transparent" />
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-[4rem] font-black italic uppercase tracking-wider leading-none px-3 py-0.5"
              style={{
                fontFamily: 'var(--font-display)',
                textShadow: '0 4px 28px rgba(0, 0, 0, 0.9)',
              }}
            >
              <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,0.28)]">
                SHADOW
              </span>{' '}
              <span className="bg-gradient-to-b from-fuchsia-200 via-purple-400 to-violet-600 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(192,132,252,0.7)]">
                HUB
              </span>
            </h1>

            {/* Right Purple Circuit Line + Node */}
            <div className="hidden sm:flex items-center flex-1 max-w-[230px] justify-start">
              <div className="h-[2px] flex-1 bg-gradient-to-l from-purple-400/95 via-purple-400/50 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
            </div>
          </div>

          {/* "Choose where you want to go:" with subtle flanking hairlines matching Image 2 */}
          <div className="flex items-center justify-center gap-4 mt-1.5">
            <div className="hidden sm:block w-28 h-[1px] bg-gradient-to-l from-cyan-400/45 to-transparent" />
            <p className="text-sm sm:text-base font-medium text-slate-100/95 tracking-wide">
              Choose where you want to go:
            </p>
            <div className="hidden sm:block w-28 h-[1px] bg-gradient-to-r from-purple-400/45 to-transparent" />
          </div>
        </motion.div>

        {/* TWO SIDE-BY-SIDE CHAMFERED PORTAL CARDS */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* ============================================================== */}
          {/* CARD 1: SHADOW TECH (Cyan / Online Computer Repair Service)    */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative group pt-5 flex flex-col"
          >
            {/* Top-Center Notched Icon Badge (Monitor + Wrench) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center drop-shadow-[0_0_16px_rgba(34,211,238,0.65)]">
              <div
                className="w-24 sm:w-28 h-11 sm:h-12 p-[2px] bg-gradient-to-b from-cyan-300 via-sky-400 to-cyan-500"
                style={{
                  clipPath: 'polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%)',
                }}
              >
                <div
                  className="w-full h-full bg-[#07152e] flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%)',
                  }}
                >
                  <div className="relative flex items-center justify-center text-cyan-300">
                    <Monitor className="w-6 h-6 stroke-[2]" />
                    <Wrench className="w-3.5 h-3.5 absolute -bottom-0.5 -right-1 text-sky-200 bg-[#07152e] rounded-full p-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chamfered Neon Cyan Container */}
            <div
              onClick={onEnterShadowTech}
              className="relative flex-1 p-[2px] bg-gradient-to-br from-cyan-300 via-sky-500/80 to-blue-500/90 shadow-[0_0_38px_rgba(6,182,212,0.28)] transition-all duration-300 group-hover:from-cyan-200 group-hover:to-cyan-400 group-hover:shadow-[0_0_54px_rgba(34,211,238,0.48)] cursor-pointer"
              style={{
                clipPath:
                  'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)',
              }}
            >
              <div
                className="relative h-full min-h-[275px] sm:min-h-[305px] lg:min-h-[325px] bg-[#060d1f] shadow-[inset_0_0_34px_rgba(14,165,233,0.16)] overflow-hidden"
                style={{
                  clipPath:
                    'polygon(23px 0%, calc(100% - 23px) 0%, 100% 23px, 100% calc(100% - 23px), calc(100% - 23px) 100%, 23px 100%, 0% calc(100% - 23px), 0% 23px)',
                }}
              >
                {/* Left Artwork Slice: Strictly pure hooded character + PC tower & Shadow Crown monitors (x=38..480), zero baked text */}
                <div className="hidden sm:block absolute inset-y-0 left-0 w-[44%] pointer-events-none overflow-hidden">
                  <svg
                    viewBox="38 242 442 480"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full opacity-95 group-hover:scale-[1.03] transition-transform duration-500"
                    aria-hidden="true"
                  >
                    <image
                      href={HUB_ARTWORK_PATH}
                      x="0"
                      y="0"
                      width="1907"
                      height="825"
                    />
                  </svg>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(6,13,31,0.0) 0%, rgba(6,13,31,0.2) 62%, rgba(6,13,31,0.92) 89%, #060d1f 100%)',
                    }}
                  />
                </div>

                {/* Mobile faint background scrim */}
                <div className="sm:hidden absolute inset-0 bg-gradient-to-br from-cyan-950/35 via-[#060d1f]/90 to-[#060d1f] pointer-events-none" />

                {/* Content Column (Right-aligned inside left card matching Image 2) */}
                <div className="relative z-10 h-full flex flex-col justify-between items-center sm:items-start sm:pl-[44%] pr-6 pl-6 pt-8 pb-5 text-center sm:text-left">
                  <div className="w-full">
                    <h2
                      className="text-2xl sm:text-[1.85rem] font-black italic uppercase tracking-wide leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <span className="text-white">SHADOW</span>{' '}
                      <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                        TECH
                      </span>
                    </h2>
                    <p className="text-sm font-medium text-sky-100/90 mt-1">
                      Online Computer Repair Services
                    </p>

                    {/* Feature List matching Image 2 */}
                    <ul className="mt-4 space-y-2 text-xs sm:text-[13.5px] font-medium text-slate-100">
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Repair Guides &amp; Fixes</span>
                      </li>
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Tools &amp; Software Downloads</span>
                      </li>
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Helpful Utilities</span>
                      </li>
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Online Repair Resources</span>
                      </li>
                    </ul>
                  </div>

                  {/* Primary CTA Button 1 -> Leads to Shadow Tech LoadingScreen & Home Page */}
                  <div className="w-full mt-5 flex justify-center sm:justify-start">
                    <div
                      className="w-full sm:w-auto min-w-[230px] p-[2px] bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_24px_rgba(14,165,233,0.5)] hover:shadow-[0_0_34px_rgba(34,211,238,0.8)] transition-all duration-200"
                      style={{
                        clipPath:
                          'polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)',
                      }}
                    >
                      <button
                        type="button"
                        id="enter-shadow-tech-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterShadowTech();
                        }}
                        className="w-full px-7 py-2.5 bg-gradient-to-r from-[#072654] via-[#0b3b75] to-[#072654] hover:from-[#0a3675] hover:via-[#0d4d99] hover:to-[#0a3675] text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-cyan-300"
                        style={{
                          clipPath:
                            'polygon(13px 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 13px 100%, 0% 50%)',
                        }}
                      >
                        <span>Enter Shadow Tech</span>
                        <ChevronRight className="w-4 h-4 text-cyan-200 stroke-[2.75]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* CARD 2: SHADOW DEN (Magenta / Violet Personal Space)           */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="relative group pt-5 flex flex-col"
          >
            {/* Top-Center Notched Icon Badge (Video Monitor / Play) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center drop-shadow-[0_0_18px_rgba(217,70,239,0.65)]">
              <div
                className="w-24 sm:w-28 h-11 sm:h-12 p-[2px] bg-gradient-to-b from-fuchsia-300 via-purple-400 to-fuchsia-500"
                style={{
                  clipPath: 'polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%)',
                }}
              >
                <div
                  className="w-full h-full bg-[#1a092e] flex items-center justify-center"
                  style={{
                    clipPath: 'polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%)',
                  }}
                >
                  <div className="relative flex items-center justify-center text-fuchsia-300">
                    <div className="w-7 h-5 rounded border-2 border-fuchsia-300 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-fuchsia-300 text-fuchsia-300 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chamfered Neon Magenta-Purple Container */}
            <div
              onClick={onEnterShadowDen}
              className="relative flex-1 p-[2px] bg-gradient-to-bl from-fuchsia-300 via-purple-500/85 to-fuchsia-500 shadow-[0_0_38px_rgba(192,38,211,0.28)] transition-all duration-300 group-hover:from-fuchsia-200 group-hover:to-fuchsia-400 group-hover:shadow-[0_0_54px_rgba(217,70,239,0.48)] cursor-pointer"
              style={{
                clipPath:
                  'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)',
              }}
            >
              <div
                className="relative h-full min-h-[275px] sm:min-h-[305px] lg:min-h-[325px] bg-[#0e071d] shadow-[inset_0_0_34px_rgba(168,85,247,0.18)] overflow-hidden"
                style={{
                  clipPath:
                    'polygon(23px 0%, calc(100% - 23px) 0%, 100% 23px, 100% calc(100% - 23px), calc(100% - 23px) 100%, 23px 100%, 0% calc(100% - 23px), 0% 23px)',
                }}
              >
                {/* Right Artwork Slice: Pure Shadow w/ crown headphones, mug, plushie & monitors (x=1362..1878), zero baked button */}
                <div className="hidden sm:block absolute inset-y-0 right-0 w-[47%] pointer-events-none overflow-hidden">
                  <svg
                    viewBox="1362 242 516 480"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full opacity-95 group-hover:scale-[1.03] transition-transform duration-500"
                    aria-hidden="true"
                  >
                    <image
                      href={HUB_ARTWORK_PATH}
                      x="0"
                      y="0"
                      width="1907"
                      height="825"
                    />
                  </svg>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(270deg, rgba(14,7,29,0.0) 0%, rgba(14,7,29,0.18) 62%, rgba(14,7,29,0.92) 89%, #0e071d 100%)',
                    }}
                  />
                </div>

                {/* Mobile faint background scrim */}
                <div className="sm:hidden absolute inset-0 bg-gradient-to-bl from-fuchsia-950/35 via-[#0e071d]/90 to-[#0e071d] pointer-events-none" />

                {/* Content Column (Left-aligned inside right card matching Image 2) */}
                <div className="relative z-10 h-full flex flex-col justify-between items-center sm:items-start sm:pr-[46%] pl-6 sm:pl-9 pr-6 pt-8 pb-5 text-center sm:text-left">
                  <div className="w-full">
                    <h2
                      className="text-2xl sm:text-[1.85rem] font-black italic uppercase tracking-wide leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <span className="text-white">SHADOW</span>{' '}
                      <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(217,70,239,0.55)]">
                        DEN
                      </span>
                    </h2>
                    <p className="text-sm font-medium text-purple-100/90 mt-1">
                      Your Personal Space
                    </p>

                    {/* Feature List matching Image 2 */}
                    <ul className="mt-4 space-y-2 text-xs sm:text-[13.5px] font-medium text-slate-100">
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <span className="w-4 h-3.5 rounded-[3px] border border-fuchsia-400 flex items-center justify-center shrink-0">
                          <Play className="w-2 h-2 fill-fuchsia-400 text-fuchsia-400 ml-0.5" />
                        </span>
                        <span>Anime Video Player</span>
                      </li>
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Music className="w-4 h-4 text-fuchsia-400 shrink-0" />
                        <span>MP3 Music Player</span>
                      </li>
                      <li className="flex items-center justify-center sm:justify-start gap-2.5">
                        <Star className="w-4 h-4 text-fuchsia-400 shrink-0 fill-fuchsia-400" />
                        <span>And More...</span>
                      </li>
                    </ul>
                  </div>

                  {/* Primary CTA Button 2 */}
                  <div className="w-full mt-5 flex justify-center sm:justify-start">
                    <div
                      className="w-full sm:w-auto min-w-[230px] p-[2px] bg-gradient-to-r from-fuchsia-400 via-purple-300 to-fuchsia-400 shadow-[0_0_26px_rgba(217,70,239,0.55)] hover:shadow-[0_0_38px_rgba(232,121,249,0.85)] transition-all duration-200"
                      style={{
                        clipPath:
                          'polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)',
                      }}
                    >
                      <button
                        type="button"
                        id="enter-shadow-den-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterShadowDen();
                        }}
                        className="w-full px-7 py-2.5 bg-gradient-to-r from-[#2e0b4e] via-[#4a1278] to-[#2e0b4e] hover:from-[#40116b] hover:via-[#6518a3] hover:to-[#40116b] text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-fuchsia-300"
                        style={{
                          clipPath:
                            'polygon(13px 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 13px 100%, 0% 50%)',
                        }}
                      >
                        <span>Enter Shadow Den</span>
                        <ChevronRight className="w-4 h-4 text-fuchsia-200 stroke-[2.75]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* BOTTOM FOOTER STRIP matching Image 2 (compact so Enjoy Your Stay! never clips on 600px viewports) */}
      <footer className="relative z-20 w-full px-4 sm:px-8 pb-3 pt-1 flex items-center justify-between gap-4">
        {/* Bottom-left cyan cyber hatch corner bar */}
        <div className="hidden md:flex items-center gap-1.5 flex-1 max-w-[340px] shrink-0" aria-hidden="true">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-2.5 h-3 skew-x-[32deg] bg-cyan-500/85 shadow-[0_0_8px_rgba(34,211,238,0.45)]"
              />
            ))}
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-cyan-400/90 to-transparent" />
        </div>

        {/* Center "Enjoy Your Stay!" + Glowing Shadow Crown matching Image 2 */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-purple-100/95 px-4">
          <span className="whitespace-nowrap">Enjoy Your Stay!</span>
          <ShadowCrownEmblem className="w-5 h-4 shrink-0 drop-shadow-[0_0_10px_rgba(217,70,239,0.75)]" />
        </div>

        {/* Bottom-right purple cyber hatch corner bar */}
        <div className="hidden md:flex items-center justify-end gap-1.5 flex-1 max-w-[340px] shrink-0" aria-hidden="true">
          <div className="h-[2px] flex-1 bg-gradient-to-l from-purple-400/90 to-transparent" />
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-2.5 h-3 -skew-x-[32deg] bg-purple-500/85 shadow-[0_0_8px_rgba(168,85,247,0.45)]"
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
