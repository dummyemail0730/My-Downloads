import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import shadowLogoMain from '../assets/images/shadow_computer_services_logo_1779535416403.png';

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";
    const charArr = chars.split("");
    const fontSize = 14;

    let columns = 0;
    let drops: number[] = [];

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth || 300;
      const parentHeight = canvas.parentElement?.clientHeight || 800;
      canvas.width = parentWidth;
      canvas.height = parentHeight;

      const newColumns = Math.ceil(parentWidth / (fontSize - 1));
      if (newColumns !== columns) {
        const newDrops = Array.from({ length: newColumns }, (_, i) => {
          return i < drops.length ? drops[i] : Math.random() * -100;
        });
        drops = newDrops;
        columns = newColumns;
      }
    };

    resizeCanvas();

    // Use ResizeObserver to respond instantly to any size or layout change
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 24; // Smooth classic green digital rain
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > interval) {
        lastTime = timestamp - (elapsed % interval);

        // Fill background with a very soft opacity black for trailing effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `bold ${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = charArr[Math.floor(Math.random() * charArr.length)];
          const x = i * (fontSize - 1);
          const y = drops[i] * fontSize;

          if (y > 0) {
            // Bright white/cyan-blue-green for heading characters, emerald-green for trailing tail
            const isHead = Math.random() > 0.95;
            
            if (isHead) {
              ctx.fillStyle = '#ffffff';
            } else {
              // Vibrant neon violet style to match the theme (no expensive GPU canvas shadow to prevent lag)
              ctx.fillStyle = '#bc52ff';
            }

            ctx.fillText(char, x, y);
          }

          drops[i] += 0.85; // Speed speed of descent

          // Reset drop once it goes beyond window height
          if (y > canvas.height) {
            if (Math.random() > 0.975 || y > canvas.height + 150) {
              drops[i] = -5; // slightly above screen
            }
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block bg-black/40" style={{ mixBlendMode: 'screen' }} />;
}

interface LoadingScreenProps {
  onComplete: () => void;
  isAudioAllowed: boolean;
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

export default function LoadingScreen({ onComplete, isAudioAllowed }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [activeMessage, setActiveMessage] = useState(BOOT_MESSAGES[0].text);
  const [isMuted, setIsMuted] = useState(!isAudioAllowed);
  const [hasInteracted, setHasInteracted] = useState(isAudioAllowed);

  useEffect(() => {
    if (!isAudioAllowed) {
      setIsMuted(true);
      return;
    }

    // Automatically unmute/play the audio on any user gesture
    const enableAudio = () => {
      setIsMuted(false);
      setHasInteracted(true);
    };

    // Keep it unmuted from start to attempt autoplay
    setIsMuted(false);

    // Register interaction listeners to bypass browser play restriction on any user activity
    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });
    window.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, [isAudioAllowed]);

  const smokeParticles = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 150, // slightly more optimized size
      x: Math.random() * 100,
      y: Math.random() * 100,
      tx: (Math.random() - 0.5) * 80, // travel range X
      ty: -Math.random() * 100 - 40,    // travel range Y (always floating upwards)
      duration: Math.random() * 8 + 14, // 14s to 22s
      delay: Math.random() * -20, // pre-warmed
      color: i % 2 === 0 
        ? 'rgba(168, 85, 247, 0.05)' // Mystic purple nebula
        : 'rgba(255, 255, 255, 0.02)'   // Soft white celestial glow
    }));
  }, []);

  useEffect(() => {
    // Increment progress to 100% over precisely 15 seconds (15000 ms)
    // 100 increments -> 150ms interval for smooth progression
    const intervalTime = 150;
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
    <div 
      onClick={() => {
        if (isAudioAllowed) {
          setIsMuted(false);
          setHasInteracted(true);
        }
      }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none overflow-hidden font-mono text-white cursor-pointer"
    >
      {/* Dynamic Animated Smoke Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
        {smokeParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              filter: 'blur(45px)',
              mixBlendMode: 'screen',
              willChange: 'transform, opacity'
            }}
            animate={{
              x: [0, p.tx, p.tx * 0.5, 0],
              y: [0, p.ty, p.ty * 0.4, 0],
              scale: [1, 1.15, 0.9, 1],
              opacity: [0.3, 0.7, 0.4, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Background Radial Shadows and Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-black pointer-events-none opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.15) 1px, transparent 1px), linear-gradient(rgba(147,51,234,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* White ambient nodes overlaying */}
      <div 
        className="absolute inset-0 z-0 bg-transparent pointer-events-none opacity-10" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Fullscreen Matrix Digital Rain flowing across the entire screen behind the central UI (Visible on both desktop & mobile) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-55">
        <MatrixRain />
      </div>
      


      <div className="w-full max-w-md flex flex-col items-center justify-center relative z-10">
        
        {/* Mysterious Ambient Ring behind Logo */}
        <div className="relative mb-6 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-black rounded-full shadow-[0_0_60px_rgba(168,85,247,0.35),_0_0_120px_rgba(255,255,255,0.1)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 rounded-full border border-purple-500/20 border-t-white border-b-purple-600 blur-[1px] shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 rounded-full border border-purple-950/40 border-r-white/30 border-l-purple-500/30 opacity-60 blur-[2px] shadow-[0_0_15px_rgba(255,255,255,0.12)]"
          />
          <div className="absolute inset-2 bg-black rounded-full" />
          
          {/* Main Logo Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full relative flex items-center justify-center overflow-visible"
          >
            <img 
              src={shadowLogoMain} 
              alt="ShadowTech"
              className="w-full h-full object-cover rounded-full drop-shadow-[0_0_35px_rgba(168,85,247,0.55)] relative z-10 animate-pulse"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="text-center w-full space-y-4 mb-4">
          <div className="flex flex-col items-center">
            <h2 className="text-sm uppercase tracking-[0.25em] font-black text-white flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
              SHADOW SYSTEM INTRUSION
            </h2>
          </div>

          {/* Scrolling Active Boot Message Indicator with static height */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-neutral-300 text-center animate-pulse">
              {activeMessage}
            </p>
          </div>
        </div>

        {/* Loader Progress & Percentage bar */}
        <div className="w-full space-y-2 px-6">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-neutral-400">
            <span>UPLINK_SYS_BUSY</span>
            <span className="text-white bg-black border border-purple-500 px-2 py-0.5 rounded text-[9.5px] font-black shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="h-[8px] w-full bg-black border border-purple-500/30 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(168,85,247,0.12)]">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-950 via-white to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.85),_0_0_10px_rgba(255,255,255,0.7)]"
              style={{ width: `${progress}%` }}
              layoutId="loading-progress-bar"
            />
          </div>

          <div className="flex justify-between items-center text-[8px] tracking-[0.25em] text-neutral-500 font-medium">
            <span>REMOTE_TUNNEL_LOGGED</span>
            <span>RESTRICTED_ACCESS</span>
          </div>
        </div>

        {/* Hidden YouTube Theme Audio Stream */}
        {!isMuted && (
          <iframe
            key={hasInteracted ? 'interacted' : 'initial'}
            src="https://www.youtube.com/embed/T9MLjIsfUOU?autoplay=1&mute=0&playlist=T9MLjIsfUOU&loop=1&controls=0&showinfo=0&disablekb=1&modestbranding=1"
            allow="autoplay; encrypted-media"
            title="Shadow Theme OST"
            style={{
              position: 'fixed',
              width: '320px',
              height: '240px',
              top: '-2000px',
              left: '-2000px',
              pointerEvents: 'none',
              opacity: 0.001,
              zIndex: -9999
            }}
          />
        )}

        {/* Dynamic Stylized Equalizer and Streaming Info */}
        <div className="mt-6 w-full max-w-xs flex flex-col items-center gap-2">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shadow-eq {
              0% { height: 4px; }
              100% { height: 14px; }
            }
            .shadow-bar {
              animation: shadow-eq 0.6s ease-in-out infinite alternate;
            }
          `}} />
          
          <div 
            className="w-full py-3 px-4 rounded-xl border bg-black border-purple-500/40 text-purple-400 hover:text-white shadow-[0_0_20px_rgba(168,85,247,0.12)] flex items-center justify-center gap-3 select-none relative overflow-hidden"
          >
            {isMuted ? (
              <span className="text-[10px] h-3.5 flex items-center">🔇</span>
            ) : (
              <span className="flex items-end gap-[2px] h-3.5 mb-0.5">
                <span className="w-0.5 bg-purple-500 rounded-full shadow-bar" style={{ animationDelay: '0s' }} />
                <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.2s', animationDuration: '0.4s' }} />
                <span className="w-0.5 bg-purple-400 rounded-full shadow-bar" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }} />
                <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.3s', animationDuration: '0.3s' }} />
              </span>
            )}
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-extrabold text-neutral-200">
              {isMuted ? 'SHADOW THEME: MUTED' : '🔊 SHADOW THEME: "HIGHEST" ACTIVE'}
            </span>
          </div>
          <p className="text-[7px] text-purple-400 uppercase tracking-[0.3em] font-black animate-pulse">
            {isMuted ? 'XADO BROADCAST // COFFEE BREAK' : 'XADO BROADCAST // ONLINE'}
          </p>
        </div>

      </div>
    </div>
  );
}
