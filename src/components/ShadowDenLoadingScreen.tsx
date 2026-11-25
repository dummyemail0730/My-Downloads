import React, { useEffect, useRef, useState } from 'react';
import { loadMusicLibraryFromFirestore } from '../firebase';
import { SHADOW_DEN_PRELOAD_URLS } from './ShadowDenPortal';

const LOADING_SCREEN_ART = '/assets/aistudio/image_584322ea.png';

interface ShadowDenLoadingScreenProps {
  onComplete: () => void;
}

export default function ShadowDenLoadingScreen({ onComplete }: ShadowDenLoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const completedRef = useRef(false);
  const realProgressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    const totalTasks = SHADOW_DEN_PRELOAD_URLS.length + 1; // Gallery/Den assets + music archive sync
    let completedTasks = 0;

    const advanceRealProgress = () => {
      if (cancelled) return;
      completedTasks += 1;
      realProgressRef.current = Math.min(100, Math.round((completedTasks / totalTasks) * 100));
    };

    // 1. Preload & decode actual Shadow Den backdrop + gallery assets into browser memory
    SHADOW_DEN_PRELOAD_URLS.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {}).finally(advanceRealProgress);
        } else {
          advanceRealProgress();
        }
      };
      img.onerror = advanceRealProgress;
      img.src = src;
    });

    // 2. Sync Music + Anime library from Firestore/backend while loading
    (async () => {
      try {
        const fsLib = await loadMusicLibraryFromFirestore().catch(() => null);
        if (fsLib && Array.isArray(fsLib.tracks) && fsLib.tracks.length > 0) {
          localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(fsLib.tracks));
          if (Array.isArray(fsLib.playlists) && fsLib.playlists.length > 0) {
            localStorage.setItem('shadow_music_playlists', JSON.stringify(fsLib.playlists));
          }
        } else {
          const res = await fetch('/api/music/library').catch(() => null);
          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data && Array.isArray(data.tracks) && data.tracks.length > 0) {
              localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(data.tracks));
              if (Array.isArray(data.playlists) && data.playlists.length > 0) {
                localStorage.setItem('shadow_music_playlists', JSON.stringify(data.playlists));
              }
            }
          }
        }
      } catch (_) {}
      advanceRealProgress();
    })();

    // Safety fallback so slow network resources never exceed the 8s loading window
    const safetyTimer = window.setTimeout(() => {
      if (!cancelled) {
        realProgressRef.current = 100;
      }
    }, 7500);

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    const minDurationMs = 7700; // 7.7s progress + 0.3s 100% completion hold = 8s total
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const timeProgress = Math.min(100, (elapsed / minDurationMs) * 100);
      const actual = realProgressRef.current;

      // Sync smooth easing with actual asset load completion across the 8s window
      const target = actual >= 100 ? timeProgress : Math.min(timeProgress, Math.max(actual, (elapsed / minDurationMs) * 90));

      setDisplayProgress((prev) => {
        const next = Math.min(100, Math.max(prev, Math.round(target)));
        if (next >= 100 && actual >= 100 && !completedRef.current) {
          completedRef.current = true;
          window.setTimeout(() => onCompleteRef.current(), 300);
        }
        return next;
      });

      if (!completedRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Exact geometry aligned to image_584322ea.png (1672x941):
  // Inner progress track runs slanted (-45 deg) from x=532..1083 (top y=588) to x=512..1063 (bottom y=608)
  const maxBarWidth = 551;
  const currentBarWidth = (displayProgress / 100) * maxBarWidth;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#040012] overflow-hidden select-none">
      <svg
        viewBox="0 0 1672 941"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        role="img"
        aria-label={`Loading Shadow Den ${displayProgress}%`}
      >
        <defs>
          {/* Clip strictly inside the skewed inner progress track */}
          <clipPath id="shadowDenTrackClip">
            <polygon points="532,588 1083,588 1063,608 512,608" />
          </clipPath>

          {/* Exact neon violet-to-lavender-white gradient matching image_155027be.png */}
          <linearGradient id="shadowDenBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7910f2" />
            <stop offset="45%" stopColor="#a027fa" />
            <stop offset="82%" stopColor="#d27efc" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>

          <filter id="shadowDenBarGlow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Exact untouched Image 2 artwork */}
        <image
          href={LOADING_SCREEN_ART}
          x="0"
          y="0"
          width="1672"
          height="941"
        />

        {/* Mask ONLY the static track interior & baked "78%" area cleanly with exact sampled obsidian-violet */}
        <polygon points="532,587 1084,587 1064,609 511,609" fill="#090224" />
        <polygon points="1103,586 1177,586 1153,610 1079,610" fill="#06011e" />

        {/* Real Animated Slanted Progress Bar Fill matching Image 3 */}
        <g clipPath="url(#shadowDenTrackClip)">
          {currentBarWidth > 0 && (
            <polygon
              points={`532,588 ${532 + currentBarWidth},588 ${512 + currentBarWidth},608 512,608`}
              fill="url(#shadowDenBarGradient)"
              filter="url(#shadowDenBarGlow)"
            />
          )}
          {/* Subtle glowing leading edge pulse at the tip of the bar */}
          {displayProgress > 1 && displayProgress < 100 && (
            <line
              x1={532 + currentBarWidth}
              y1={588}
              x2={512 + currentBarWidth}
              y2={608}
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.85"
              filter="url(#shadowDenBarGlow)"
            />
          )}
        </g>

        {/* Live Dynamic Percentage Counter replacing baked "78%" */}
        <text
          x="1129"
          y="604"
          textAnchor="middle"
          fill="#e9d5ff"
          fontSize="19"
          fontWeight="600"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          style={{ letterSpacing: '0.03em' }}
        >
          {displayProgress}%
        </text>
      </svg>
    </div>
  );
}
