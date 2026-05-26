import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RedirectLoaderProps {
  isOpen: boolean;
  targetUrl: string;
  itemTitle: string;
  onClose: () => void;
}

export default function RedirectLoader({ isOpen, targetUrl, itemTitle, onClose }: RedirectLoaderProps) {
  const [progress, setProgress] = useState(1);
  const [statusText, setStatusText] = useState('INITIALIZING SECURE DOWNLOAD...');

  useEffect(() => {
    if (!isOpen) {
      setProgress(1);
      setStatusText('INITIALIZING SECURE DOWNLOAD...');
      return;
    }

    setProgress(1);
    setStatusText('INITIALIZING SECURE DOWNLOAD...');

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

    return () => clearInterval(interval);
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
          
          {/* Main Ring Area */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-8">
            
            {/* Outer segmented ring (Ticks) - Image 1 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                {Array.from({ length: ticksCount }).map((_, i) => {
                  const angle = (i * 360) / ticksCount;
                  // Calculate if tick should be highlighted based on progress percentage
                  const isLith = i / ticksCount <= progress / 100;
                  return (
                    <div
                      key={i}
                      className="absolute w-[8px] h-[4px] rounded-[1px] transition-all duration-300"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-135px)`,
                        backgroundColor: isLith ? '#c084fc' : '#1e1b4b', // lit purple vs deep raw dark
                        boxShadow: isLith ? '0 0 10px rgba(168, 85, 247, 0.95), 0 0 4px rgba(255, 255, 255, 1)' : 'none',
                        opacity: isLith ? 1 : 0.45,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Inner rotating gradient arc or circle - Image 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[230px] h-[230px] rounded-full border-2 border-transparent"
              style={{
                borderTopColor: '#ffffff',
                borderRightColor: 'rgba(168, 85, 247, 1)',
                borderBottomColor: 'rgba(168, 85, 247, 0.1)',
                borderLeftColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: 'inset 0 0 15px rgba(168, 85, 247, 0.15)',
              }}
            />

            {/* Concentric Dot Ring spinning opposite direction - Image 1 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-white/20 flex items-center justify-center"
              style={{
                borderWidth: '2px',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                borderStyle: 'dotted',
              }}
            />

            {/* Innermost pulsing soft purple backing shadow */}
            <div className="absolute w-[140px] h-[140px] rounded-full bg-black border border-purple-500/20 shadow-[0_0_35px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center p-4 text-center">
              
              {/* Spinning progress text */}
              <span className="text-3xl font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                {progress}%
              </span>
              
              {/* Tiny system stats */}
              <span className="text-[8px] text-purple-400 font-extrabold uppercase tracking-widest mt-1">
                DL ENGINE
              </span>
            </div>

          </div>

          {/* Interactive display tags */}
          <div className="text-center space-y-3 px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-950/40 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                TARGET: {itemTitle || 'SECURE CONTAINER'}
              </span>
            </div>

            <h3 className="text-sm font-black uppercase text-white tracking-[0.2em] leading-tight select-none">
              {statusText}
            </h3>

            {progress === 100 && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="pt-2 w-full flex justify-center"
              >
                <button
                  onClick={() => {
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                    onClose();
                  }}
                  className="px-6 py-3.5 rounded-xl bg-black border-2 border-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>DOWNLOAD LINK READY</span>
                  <span className="text-[14px]">⚡</span>
                </button>
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
