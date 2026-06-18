import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const getGoogleDriveId = (url: string) => {
  if (!url) return '';
  const fileIdMatch = url.match(/\/file\/d\/([^/]+)/) || 
                      url.match(/[?&]id=([^&]+)/) || 
                      url.match(/\/d\/([^/]+)/);
  return fileIdMatch ? fileIdMatch[1] : '';
};

const getFinalDownloadUrl = (url: string, title?: string) => {
  return url || '';
};

interface RedirectLoaderProps {
  isOpen: boolean;
  targetUrl: string;
  itemTitle: string;
  onClose: () => void;
}

export default function RedirectLoader({ isOpen, targetUrl, itemTitle, onClose }: RedirectLoaderProps) {
  const [progress, setProgress] = useState(1);
  const [statusText, setStatusText] = useState('INITIALIZING SECURE DOWNLOAD...');
  const [isStarDrawn, setIsStarDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(1);
      setStatusText('INITIALIZING SECURE DOWNLOAD...');
      setIsStarDrawn(false);
      return;
    }

    setProgress(1);
    setStatusText('INITIALIZING SECURE DOWNLOAD...');
    setIsStarDrawn(false);

    // After 5.8 seconds (when sequential lines and clockwise orbs have fully loaded), initiate full continuous rotation
    const starTimeout = setTimeout(() => {
      setIsStarDrawn(true);
    }, 5800);

    // Progress counting up smoothly over exactly 10 seconds (10,000ms)
    // 100 steps of 100ms = 10,000ms (10 seconds)
    let currentProgress = 1;
    const interval = setInterval(() => {
      currentProgress += 1;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setStatusText('DOWNLOAD LINK SECURED!');
      } else {
        // Update status text based on progress
        if (currentProgress < 20) {
          setStatusText('INITIALIZING SECURE DOWNLOAD...');
        } else if (currentProgress < 45) {
          setStatusText('ESTABLISHING SECURE DOWNLOAD CONNECTION...');
        } else if (currentProgress < 70) {
          setStatusText('PREPARING SECURE ARCHIVE PACKET...');
        } else if (currentProgress < 90) {
          setStatusText('DOWNLOADING HIGH-SPEED DATA CHUNKS...');
        } else {
          setStatusText('DOWNLOAD LAUNCHED successfully. EXPANDING...');
        }
      }
      setProgress(currentProgress);
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(starTimeout);
    };
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  // Segmented outer tick blocks (Image 1 outer ring)
  const ticksCount = 40;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-mono"
      >
        {/* Deep Purple Ambient Aura Behind Loader */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] animate-pulse pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 blur-[90px] pointer-events-none" />

        {/* Dynamic Micro-Dots (Floating Space Dust) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="w-full max-w-lg flex flex-col items-center justify-center relative z-10 scale-90 sm:scale-100">
          
          {/* Intricate Purple Magic Circle (From Image 2, 3, 4) - Minimal, Beautiful Loading Arc */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[340px] md:h-[340px] flex items-center justify-center mb-6">
            {/* Outer pulsating purple plasma fog glow */}
            <div className="absolute inset-6 rounded-full bg-purple-950/20 blur-[50px] animate-pulse" />
            
            <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.9)]">
              {/* Outer boundary ring */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.8" strokeDasharray="1 3" />
              
              {/* Outer dotted track rotating clockwise */}
              <motion.circle 
                cx="100" 
                cy="100" 
                r="90" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="1.8" 
                strokeDasharray="1 6"
                filter="url(#neonGlowPurple)"
                animate={{ rotate: 360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: 'center' }}
              />

              {/* Progress gauge arc around the seal (From Image 1 structure) */}
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(168, 85, 247, 0.08)"
                strokeWidth="4"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="url(#loaderProgressGradPurple)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - progress / 100)}
                transform="rotate(-90 100 100)"
                style={{ transformOrigin: 'center' }}
              />

              {/* Concentric solid bounds */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="0.5" />

              {/* Runes Ring - rotates counter-clockwise with ancient runic text */}
              <motion.g
                animate={{ rotate: -360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: 'center' }}
              >
                <path id="loaderRunePath" d="M 100,100 m -71,0 a 71,71 0 1,1 142,0 a 71,71 0 1,1 -142,0" fill="none" stroke="none" />
                <text className="font-mono text-[5.8px] tracking-[0.22em] fill-purple-300 font-extrabold select-none">
                  <textPath href="#loaderRunePath">
                    ᚛ ᛖᛗᛁᚾᛖᚾᚲᛖ ᛁᚾ ᛋᚻᚨᛚᛟᚹ ᚜ ᛁ ᚨᛗ ᚨᛏᛟᛗᛁᚲ ᚛ ᛋᚻᚨᛚᛟᚹ ᚜ ᚛ ᛖᛗᛁᚾᛖᚾᚲᛖ ᛁᚾ ᛋᚻᚨᛚᛟᚹ ᚜ ᛁ ᚨᛗ ᚨᛏᛟᛗᛁᚲ ᚛
                  </textPath>
                </text>
              </motion.g>

              {/* Rotating 6-Pointed Magic Star and Vertex Orbs assembly */}
              <motion.g
                animate={isStarDrawn ? { rotate: 360 } : { rotate: 0 }}
                transition={isStarDrawn ? { duration: 25, repeat: Infinity, ease: "linear" } : { duration: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: 'center' }}
              >
                {/* Upward equilateral triangle */}
                <motion.polygon 
                  points="100,44 148.5,128 51.5,128" 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="1.6" 
                  filter="url(#neonGlowPurple)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isOpen ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 4.5, ease: "easeInOut", delay: 0.2 }}
                />
                
                {/* Downward equilateral triangle (together forms the Hexagram star) */}
                <motion.polygon 
                  points="100,156 148.5,72 51.5,72" 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="1.6" 
                  filter="url(#neonGlowPurple)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isOpen ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 4.5, ease: "easeInOut", delay: 1.0 }}
                />

                {/* Highly bright glowing plasma orbs focused on the 6 vertices */}
                {/* Vertex 1: Top (Upward star tip) */}
                <motion.circle 
                  cx="100" 
                  cy="44" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 2.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '100px 44px' }}
                />
                <motion.circle 
                  cx="100" 
                  cy="44" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 2.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '100px 44px' }}
                />

                {/* Vertex 2: Right-center (Downward star top-right tip) */}
                <motion.circle 
                  cx="148.5" 
                  cy="72" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 3.8, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '148.5px 72px' }}
                />
                <motion.circle 
                  cx="148.5" 
                  cy="72" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 3.8, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '148.5px 72px' }}
                />

                {/* Vertex 3: Bottom-right (Upward star bottom-right tip) */}
                <motion.circle 
                  cx="148.5" 
                  cy="128" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 3.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '148.5px 128px' }}
                />
                <motion.circle 
                  cx="148.5" 
                  cy="128" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 3.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '148.5px 128px' }}
                />

                {/* Vertex 4: Bottom (Downward star bottom tip) */}
                <motion.circle 
                  cx="100" 
                  cy="156" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 2.6, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '100px 156px' }}
                />
                <motion.circle 
                  cx="100" 
                  cy="156" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 2.6, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '100px 156px' }}
                />

                {/* Vertex 5: Bottom-left (Upward star bottom-left tip) */}
                <motion.circle 
                  cx="51.5" 
                  cy="128" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 4.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '51.5px 128px' }}
                />
                <motion.circle 
                  cx="51.5" 
                  cy="128" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 4.2, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '51.5px 128px' }}
                />

                {/* Vertex 6: Left-center (Downward star top-left tip) */}
                <motion.circle 
                  cx="51.5" 
                  cy="72" 
                  r="7.5" 
                  fill="url(#nodeOrbColorPurple)" 
                  stroke="#ffffff" 
                  strokeWidth="1"
                  filter="url(#orbGlowPurple)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 5.0, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '51.5px 72px' }}
                />
                <motion.circle 
                  cx="51.5" 
                  cy="72" 
                  r="3" 
                  fill="#ffffff" 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ delay: 5.0, duration: 0.35, ease: "backOut" }}
                  style={{ transformOrigin: '51.5px 72px' }}
                />
              </motion.g>

              {/* Inner concentric layout rings */}
              <circle cx="100" cy="100" r="39" fill="none" stroke="rgba(168, 85, 247, 0.45)" strokeWidth="0.8" strokeDasharray="6 2 2 2" />
              <circle cx="100" cy="100" r="34" fill="none" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="0.5" />

              {/* Central Core Dark Shield */}
              <circle cx="100" cy="100" r="28" fill="#000000" stroke="#a855f7" strokeWidth="1.2" filter="url(#neonGlowPurple)" />
              
              {/* Centre hot core plasma ball */}
              <motion.circle
                cx="100"
                cy="100"
                r="24"
                fill="url(#loaderCoreGlowPurple)"
                animate={{ opacity: [0.65, 0.95, 0.65], scale: [0.97, 1.05, 0.97] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: 'center' }}
              />

              {/* Dynamic Percentage in center */}
              <text
                x="100"
                y="98"
                textAnchor="middle"
                className="font-mono text-[12px] font-black fill-white tracking-wider select-none drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
              >
                {progress}%
              </text>
              <text
                x="100"
                y="108"
                textAnchor="middle"
                className="font-mono text-[3.8px] font-black fill-purple-200 tracking-[0.2em] uppercase select-none animate-pulse"
              >
                DL ENGINE
              </text>

              {/* High precision definitions of gradients and glowing SVG filters */}
              <defs>
                <filter id="neonGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur1" />
                  <feGaussianBlur stdDeviation="5" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="orbGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id="loaderCoreGlowPurple" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#a855f7" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="nodeOrbColorPurple" cx="40%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#e9d5ff" />
                  <stop offset="85%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </radialGradient>
                
                <linearGradient id="loaderProgressGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Interactive display tags */}
          <div className="text-center space-y-3 px-6">
            <h3 className="text-[11px] font-extrabold uppercase text-purple-300 tracking-[0.25em] leading-tight select-none animate-pulse">
              {statusText}
            </h3>

            {progress === 100 && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="pt-2 w-full flex flex-col items-center gap-2"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Open the original Google Drive / target link in a new window/tab safely as requested
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                    // Close the loader modal safely after 1 second
                    setTimeout(onClose, 1000);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-black border-2 border-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>DOWNLOAD LINK READY</span>
                  <span className="text-[14px]">⚡</span>
                </button>
                
                <a
                  href={getFinalDownloadUrl(targetUrl, itemTitle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-neutral-400 hover:text-white transition-colors duration-200 uppercase tracking-widest mt-1 hover:underline cursor-pointer"
                >
                  [ Direct Download Fallback / Open in New Tab ]
                </a>
              </motion.div>
            )}

            <div className="w-[200px] h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-auto mt-2" />
            
            <button
              onClick={onClose}
              className="text-[9px] font-bold text-neutral-500 hover:text-purple-400 uppercase tracking-widest transition-colors duration-200 mt-2 hover:underline cursor-pointer"
            >
              {progress === 100 ? '[ DISMISS WINDOW ]' : '[ ABORT_DOWNLOAD ]'}
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
