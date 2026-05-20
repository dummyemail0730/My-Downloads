import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import shadowLogoMain from '../assets/images/shadow_logo_main_1779199773763.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_MESSAGES = [
  { threshold: 0, text: 'INITIATING SHADOW PROTOCOLS...' },
  { threshold: 12, text: 'ACCESING RESTRICTED FILESYSTEM...' },
  { threshold: 25, text: 'DECRYPTING UTILITY DIRECTORIES...' },
  { threshold: 38, text: 'STABILIZING HIGH-FIDELITY CORES...' },
  { threshold: 52, text: 'LOADING HARDWARE DIAGNOSTIC DRIVERS...' },
  { threshold: 68, text: 'SYNCING TACTICAL DRIVES WITH COG-UPLINK...' },
  { threshold: 82, text: 'STABILIZING MANA CORE POWER CHANNELS...' },
  { threshold: 94, text: 'AUTHENTICATING ENCRYPTED ACCESS KEYS...' },
  { threshold: 100, text: 'ACCESS GRANTED. DEPLOYING ARCHIVE...' }
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [activeMessage, setActiveMessage] = useState(BOOT_MESSAGES[0].text);

  useEffect(() => {
    // Increment progress to 100% over precisely 10 seconds (10000 ms)
    // 100 increments -> 100ms interval for smooth progression
    const intervalTime = 100;
    const increment = 1;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Wait briefly at 100% for a dramatic release effect, then trigger complete
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Update status messages according to current progress
  useEffect(() => {
    const currentMsg = BOOT_MESSAGES.reduce((acc, curr) => {
      if (progress >= curr.threshold) {
        return curr.text;
      }
      return acc;
    }, BOOT_MESSAGES[0].text);
    setActiveMessage(currentMsg);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none overflow-hidden font-mono text-white">
      {/* Background Radial Shadows and Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(56,15,90,0.15)_0%,rgba(0,0,0,1)_85%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />
      
      {/* Laser light scan effect sweeping across background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div 
          animate={{ y: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="w-full h-2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent blur-sm"
        />
      </div>

      <div className="w-full max-w-md flex flex-col items-center justify-center relative z-10">
        
        {/* Mysterious Ambient Ring behind Logo */}
        <div className="relative mb-8 w-48 h-48 md:w-56 md:h-56">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-purple-500/20 border-t-purple-500/70 border-b-purple-500/60 blur-[1px]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-full border border-neutral-800/50 border-r-purple-600/40 border-l-purple-600/40 opacity-50 blur-[2px]"
          />
          <div className="absolute inset-2 bg-[radial-gradient(circle_at_center,rgba(112,26,117,0.15)_0%,transparent_70%)] blur-2xl rounded-full" />
          
          {/* Main Logo Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full relative rounded-full overflow-hidden flex items-center justify-center"
          >
            <img 
              src={shadowLogoMain} 
              alt="Shadow Project Logo"
              className="w-full h-full object-cover filter drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] relative z-10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="text-center w-full space-y-4 mb-4">
          <div className="flex flex-col items-center">
            {/* Elegant Subtitle */}
            <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 font-semibold mb-1">
              DECIDED BY THE SHADOWS
            </span>
            <h2 className="text-sm uppercase tracking-[0.25em] font-black text-white flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              SHADOW SYSTEM INTRUSION
            </h2>
          </div>

          {/* Scrolling Active Boot Message Indicator with static height */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-purple-400 text-center animate-pulse">
              {activeMessage}
            </p>
          </div>
        </div>

        {/* Loader Progress & Percentage bar */}
        <div className="w-full space-y-2 px-6">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-neutral-400">
            <span>UPLINK_SYS_BUSY</span>
            <span className="text-white bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 rounded text-[9px]">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="h-[3px] w-full bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-800 via-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${progress}%` }}
              layoutId="loading-progress-bar"
            />
          </div>

          <div className="flex justify-between items-center text-[8px] tracking-[0.25em] text-neutral-500 font-medium">
            <span>REMOTE_TUNNEL_LOGGED</span>
            <span>RESTRICTED_ACCESS</span>
          </div>
        </div>

        {/* Aesthetic Counter Down Remaining Time */}
        <div className="mt-8 text-[9px] text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-2 bg-neutral-950 border border-neutral-900 px-3 py-1.5 rounded-full">
          <span>TIME REMAINING:</span>
          <span className="font-bold text-neutral-300 font-mono">
            {Math.max(0, Math.ceil((100 - progress) / 10))}s
          </span>
        </div>
      </div>
    </div>
  );
}
