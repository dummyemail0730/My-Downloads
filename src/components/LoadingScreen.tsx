import { useState, useEffect, useRef } from 'react';

const TECH_LOADING_SCREEN_ART = '/assets/aistudio/Shadow_Tech__Cyberpunk_Loading_Screen_0bd47542.png';

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ';
    const charArr = chars.split('');
    const fontSize = 14;

    let columns = 0;
    let drops: number[] = [];

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
      const parentHeight = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = parentWidth;
      canvas.height = parentHeight;

      const newColumns = Math.ceil(parentWidth / (fontSize - 1));
      if (newColumns !== columns) {
        const newDrops = Array.from({ length: newColumns }, (_, i) =>
          i < drops.length ? drops[i] : Math.random() * -100
        );
        drops = newDrops;
        columns = newColumns;
      }
    };

    resizeCanvas();

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
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > interval) {
        lastTime = timestamp - (elapsed % interval);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `bold ${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = charArr[Math.floor(Math.random() * charArr.length)];
          const x = i * (fontSize - 1);
          const y = drops[i] * fontSize;

          if (y > 0) {
            const isHead = Math.random() > 0.95;
            ctx.fillStyle = isHead ? '#e0f7ff' : '#00c8ff';
            ctx.fillText(char, x, y);
          }

          drops[i] += 0.85;

          if (y > canvas.height) {
            if (Math.random() > 0.975 || y > canvas.height + 150) {
              drops[i] = -5;
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

  return <canvas ref={canvasRef} className="w-full h-full block bg-transparent" />;
}

interface LoadingScreenProps {
  onComplete: () => void;
  isAudioAllowed: boolean;
}

export default function LoadingScreen({ onComplete, isAudioAllowed }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(!isAudioAllowed);
  const [hasInteracted, setHasInteracted] = useState(isAudioAllowed);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isAudioAllowed) {
      setIsMuted(true);
      return;
    }

    const enableAudio = () => {
      setIsMuted(false);
      setHasInteracted(true);
    };

    setIsMuted(false);

    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });
    window.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, [isAudioAllowed]);

  useEffect(() => {
    // Smooth 60fps progression from 0% to 100% over 14.7s + 0.3s completion hold = 15 seconds total
    const startTime = performance.now();
    const rampDurationMs = 14700;
    let rafId = 0;
    let completeTimer: number | null = null;
    let finished = false;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, (elapsed / rampDurationMs) * 100);
      setSmoothProgress(pct);
      setProgress(Math.min(100, Math.round(pct)));

      if (pct >= 100) {
        if (!finished) {
          finished = true;
          completeTimer = window.setTimeout(() => {
            onCompleteRef.current();
          }, 300);
        }
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (completeTimer !== null) {
        window.clearTimeout(completeTimer);
      }
    };
  }, []);

  // Exact inner progress track geometry for Shadow_Tech__Cyberpunk_Loading_Screen_0bd47542.png (1697x927):
  // Top edge y=668 (x=481..1122), bottom edge y=688 (x=466..1107)
  const maxBarWidth = 641;
  const currentBarWidth = (smoothProgress / 100) * maxBarWidth;

  return (
    <div
      onClick={() => {
        if (isAudioAllowed) {
          setIsMuted(false);
          setHasInteracted(true);
        }
      }}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#010712] overflow-hidden select-none cursor-pointer"
    >
      {/* Full-Bleed Cyan Shadow Tech Artwork + Animated Neon Progress Bar & Live % Counter */}
      <svg
        viewBox="0 0 1697 927"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`Loading Shadow Tech ${progress}%`}
      >
        <defs>
          <clipPath id="shadowTechMainBarClip">
            <polygon points="481,668 1122,668 1107,688 466,688" />
          </clipPath>

          <linearGradient id="shadowTechMainBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="45%" stopColor="#00d8ff" />
            <stop offset="85%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#e0faff" />
          </linearGradient>

          <filter id="shadowTechMainBarGlow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Untouched Shadow Tech Artwork */}
        <image
          href={TECH_LOADING_SCREEN_ART}
          x="0"
          y="0"
          width="1697"
          height="927"
        />

        {/* Blend out baked top-right screenshot toast artifact so only live badge & matrix rain show */}
        <rect x="1218" y="24" width="468" height="66" rx="8" fill="#010814" fillOpacity="0.95" />

        {/* Mask ONLY the static track interior & baked "23%" readout */}
        <polygon points="479,667 1123,667 1108,689 464,689" fill="#000811" />
        <polygon points="1140,666 1216,666 1225,678 1215,690 1124,690 1132,678" fill="#010a15" />

        {/* Live Animated Slanted Cyan Neon Bar */}
        <g clipPath="url(#shadowTechMainBarClip)">
          {currentBarWidth > 0 && (
            <polygon
              points={`481,668 ${481 + currentBarWidth},668 ${466 + currentBarWidth},688 466,688`}
              fill="url(#shadowTechMainBarGrad)"
              filter="url(#shadowTechMainBarGlow)"
            />
          )}
          {smoothProgress > 0.5 && smoothProgress < 100 && (
            <line
              x1={481 + currentBarWidth}
              y1={668}
              x2={466 + currentBarWidth}
              y2={688}
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.9"
              filter="url(#shadowTechMainBarGlow)"
            />
          )}
        </g>

        {/* Live Dynamic Percentage Counter inside Hexagonal Cap */}
        <text
          x="1174"
          y="685"
          textAnchor="middle"
          fill="#e0f7ff"
          fontSize="22"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          style={{ letterSpacing: '0.03em' }}
        >
          {progress}%
        </text>
      </svg>

      {/* Live Matrix Digital Rain Animation layered cleanly around the wings so central logo & bar stay crisp */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-65"
        style={{
          mixBlendMode: 'screen',
          WebkitMaskImage:
            'radial-gradient(ellipse 38% 66% at 50% 48%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0.95) 100%)',
          maskImage:
            'radial-gradient(ellipse 38% 66% at 50% 48%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0.95) 100%)',
        }}
      >
        <MatrixRain />
      </div>

      {/* Hidden YouTube Theme Audio Stream ("HIGHEST" OST) */}
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
            zIndex: -9999,
          }}
        />
      )}

      {/* Discreet Corner Audio Indicator / Toggle for Background Song */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shadow-eq {
              0% { height: 4px; }
              100% { height: 13px; }
            }
            .shadow-bar {
              animation: shadow-eq 0.6s ease-in-out infinite alternate;
            }
          `,
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setHasInteracted(true);
          setIsMuted((prev) => !prev);
        }}
        className="absolute top-4 right-5 z-20 px-3 py-1.5 rounded-lg bg-[#010b19]/80 hover:bg-cyan-950/80 border border-cyan-400/50 text-cyan-100 hover:text-white shadow-[0_0_16px_rgba(34,211,238,0.28)] flex items-center gap-2.5 backdrop-blur-sm transition-colors cursor-pointer"
        aria-label={isMuted ? 'Unmute background song' : 'Mute background song'}
      >
        {isMuted ? (
          <span className="text-[10px] leading-none">🔇</span>
        ) : (
          <span className="flex items-end gap-[2px] h-3.5">
            <span className="w-0.5 bg-cyan-400 rounded-full shadow-bar" style={{ animationDelay: '0s' }} />
            <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.2s', animationDuration: '0.4s' }} />
            <span className="w-0.5 bg-cyan-300 rounded-full shadow-bar" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }} />
            <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.3s', animationDuration: '0.3s' }} />
          </span>
        )}
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-cyan-100 whitespace-nowrap">
          {isMuted ? 'SHADOW THEME: MUTED' : 'SHADOW THEME: "HIGHEST" ACTIVE'}
        </span>
      </button>
    </div>
  );
}
