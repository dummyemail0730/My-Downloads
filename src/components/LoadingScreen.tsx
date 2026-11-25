import { useState, useEffect, useRef } from 'react';

const TECH_LOADING_SCREEN_ART = '/assets/aistudio/image_cfcc69db.png';

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
            ctx.fillStyle = isHead ? '#f3e8ff' : '#a855f7';
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
    // Smooth 60fps progression from 0% to 100% over 7.7s + 0.3s completion hold = 8 seconds total
    const startTime = performance.now();
    const rampDurationMs = 7700;
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

  // Exact inner progress track geometry for image_cfcc69db.png (1672x941):
  // Top edge y=671 (x=473..1105), bottom edge y=692 (x=458..1090)
  const maxBarWidth = 632;
  const currentBarWidth = (smoothProgress / 100) * maxBarWidth;

  return (
    <div
      onClick={() => {
        if (isAudioAllowed) {
          setIsMuted(false);
          setHasInteracted(true);
        }
      }}
      className="fixed inset-0 z-50 w-screen h-screen bg-[#02000c] overflow-hidden select-none cursor-pointer"
    >
      {/* Exact Full-Bleed Image 2 Artwork + Animated Neon Progress Bar & Live % Counter */}
      <svg
        viewBox="0 0 1672 941"
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
            <polygon points="473,671 1105,671 1090,692 458,692" />
          </clipPath>

          <linearGradient id="shadowTechMainBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7004f6" />
            <stop offset="50%" stopColor="#b455fa" />
            <stop offset="85%" stopColor="#d8b0fd" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>

          <filter id="shadowTechMainBarGlow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Untouched Image 2 Artwork (Logo, Emblem, Frame, "LOADING... PLEASE WAIT") */}
        <image
          href={TECH_LOADING_SCREEN_ART}
          x="0"
          y="0"
          width="1672"
          height="941"
        />

        {/* Mask ONLY the static track interior & baked "69%" readout */}
        <polygon points="471,670 1107,670 1092,693 456,693" fill="#02010f" />
        <polygon points="1130,668 1204,668 1197,696 1123,696" fill="#040212" />

        {/* Live Animated Slanted Neon Bar */}
        <g clipPath="url(#shadowTechMainBarClip)">
          {currentBarWidth > 0 && (
            <polygon
              points={`473,671 ${473 + currentBarWidth},671 ${458 + currentBarWidth},692 458,692`}
              fill="url(#shadowTechMainBarGrad)"
              filter="url(#shadowTechMainBarGlow)"
            />
          )}
          {smoothProgress > 0.5 && smoothProgress < 100 && (
            <line
              x1={473 + currentBarWidth}
              y1={671}
              x2={458 + currentBarWidth}
              y2={692}
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.9"
              filter="url(#shadowTechMainBarGlow)"
            />
          )}
        </g>

        {/* Live Dynamic Percentage Counter inside Hexagonal Cap */}
        <text
          x="1166"
          y="689"
          textAnchor="middle"
          fill="#f3e8ff"
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
        className="absolute top-4 right-5 z-20 px-3 py-1.5 rounded-lg bg-black/65 hover:bg-purple-950/75 border border-purple-500/40 text-purple-200 hover:text-white shadow-[0_0_16px_rgba(168,85,247,0.22)] flex items-center gap-2.5 backdrop-blur-sm transition-colors cursor-pointer"
        aria-label={isMuted ? 'Unmute background song' : 'Mute background song'}
      >
        {isMuted ? (
          <span className="text-[10px] leading-none">🔇</span>
        ) : (
          <span className="flex items-end gap-[2px] h-3.5">
            <span className="w-0.5 bg-purple-400 rounded-full shadow-bar" style={{ animationDelay: '0s' }} />
            <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.2s', animationDuration: '0.4s' }} />
            <span className="w-0.5 bg-purple-300 rounded-full shadow-bar" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }} />
            <span className="w-0.5 bg-white rounded-full shadow-bar" style={{ animationDelay: '0.3s', animationDuration: '0.3s' }} />
          </span>
        )}
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-purple-100 whitespace-nowrap">
          {isMuted ? 'SHADOW THEME: MUTED' : 'SHADOW THEME: "HIGHEST" ACTIVE'}
        </span>
      </button>
    </div>
  );
}
