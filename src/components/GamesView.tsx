import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, RotateCcw, Award, Zap, Shield, ArrowLeft, HelpCircle } from 'lucide-react';

import shadowAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';

type SelectedGame = 'CLICKER' | 'MEMORY' | 'DODGER' | null;

export default function GamesView() {
  const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);

  const [gamesList] = useState<any[]>(() => {
    const saved = localStorage.getItem('custom_games');
    let loaded = [];
    try {
      loaded = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    const defaultGames = [
      {
        id: 'default-game-clicker',
        title: 'Mana Overdrive',
        description: 'Unleash Cid’s magical density. Tap the localized mana core to transmute ultimate power.',
        protocol: 'CLICKER',
        link: '',
        image: shadowElectricity
      },
      {
        id: 'default-game-memory',
        title: 'Recon Matrix',
        description: 'Identify and pair the elite operatives of Shadow Garden. Sharpness and rapid extraction required.',
        protocol: 'MEMORY',
        link: '',
        image: shadowAura
      },
      {
        id: 'default-game-dodger',
        title: 'Blade Deflector',
        description: "Pilot Cid's legendary dark strike vector. Deflect toxic shards and capture active energy nuclei.",
        protocol: 'DODGER',
        link: '',
        image: shadowBlade
      }
    ];

    if (loaded.length === 0) {
      return defaultGames;
    }

    const customList = loaded.map((item: any, idx: number) => {
      const fallbackImages = [shadowBlade, shadowAura, shadowElectricity];
      return {
        id: item.id || `custom-game-${idx}`,
        title: item.title,
        description: item.description || 'No description provided.',
        protocol: item.protocol || 'EXT ACTION',
        link: item.link || '',
        image: item.image || fallbackImages[idx % fallbackImages.length]
      };
    });

    return [
      ...customList,
      ...defaultGames.filter(def => !customList.some((l: any) => l.title.toLowerCase().trim() === def.title.toLowerCase().trim()))
    ];
  });

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans select-none relative overflow-hidden">
      <AnimatePresence mode="wait">
        {selectedGame === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full border-b border-neutral-900 bg-neutral-950">
            {gamesList.map((game, idx) => {
              const hasBgImage = !!game.image;
              const Tag = motion.div;

              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                const cleanProtocol = game.protocol?.toUpperCase().trim();
                if (cleanProtocol === 'CLICKER' || game.id === 'default-game-clicker') {
                  setSelectedGame('CLICKER');
                } else if (cleanProtocol === 'MEMORY' || game.id === 'default-game-memory') {
                  setSelectedGame('MEMORY');
                } else if (cleanProtocol === 'DODGER' || game.id === 'default-game-dodger') {
                  setSelectedGame('DODGER');
                } else if (game.link) {
                  if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
                    (window as any).triggerRedirectLoader(game.link, game.title);
                  } else {
                    window.open(game.link, '_blank', 'noopener,noreferrer');
                  }
                }
              };

              return (
                <Tag
                  key={game.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group cursor-default ${
                    hasBgImage 
                      ? 'bg-neutral-950 text-white' 
                      : 'bg-neutral-900/35 hover:bg-neutral-900/80 text-white'
                  }`}
                >
                  {game.image && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img 
                        src={game.image} 
                        alt="" 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-[0.7] group-hover:brightness-[0.8]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 group-hover:from-black/100 group-hover:via-black/70 group-hover:to-black/45 transition-all duration-300" />
                    </div>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className={`w-8 h-1 transition-colors ${
                          hasBgImage ? 'bg-sky-500 group-hover:bg-sky-450' : 'bg-purple-500 group-hover:bg-purple-400'
                        }`}></div>
                        {game.protocol && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-400 border border-sky-900/30">
                            {game.protocol}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight transition-colors ${
                          hasBgImage ? 'text-white' : 'text-neutral-100 group-hover:text-sky-300'
                        }`}>
                          {game.title}
                        </h3>
                        <Gamepad2 size={16} className={`transition-opacity ${
                          hasBgImage ? 'opacity-70 group-hover:opacity-100 text-white' : 'opacity-40 group-hover:opacity-100 text-neutral-400 group-hover:text-sky-300'
                        }`} />
                      </div>
                      <p className="text-[11px] text-neutral-400 font-semibold leading-relaxed uppercase tracking-wide">
                        {game.description}
                      </p>
                    </div>
                    
                    <div className="pt-6">
                      <button
                        onClick={handleClick}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-[9px] font-mono font-black uppercase tracking-[0.16em] border rounded-lg transition-all duration-300 cursor-pointer w-full justify-center ${
                          hasBgImage
                            ? 'bg-sky-950/40 hover:bg-sky-900/60 border-sky-500/40 text-sky-300 hover:text-white shadow-[0_0_15px_rgba(56,189,248,0.12)] hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:border-sky-400'
                            : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-300 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400'
                        }`}
                      >
                        <Gamepad2 size={12} className="shrink-0 animate-[pulse_2s_infinite]" />
                        <span>{game.link ? 'LAUNCH APPLICATION' : 'PLAY SIMULATION'}</span>
                      </button>
                    </div>
                  </div>
                </Tag>
              );
            })}
            {/* Empty filler block to maintain grid integrity */}
            {(gamesList.length % 3 !== 0) && Array.from({ length: 3 - (gamesList.length % 3) }).map((_, i) => (
              <div key={`filler-${i}`} className="border-b border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r border-r border-neutral-900"></div>
            ))}
          </div>
        ) : (
          <motion.div
            key="game-room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full bg-neutral-950 relative"
          >
            {/* Top Game Bar Controls */}
            <div className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur p-4 flex items-center justify-between relative z-20">
              <button
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-2 mt-0.5 group transition-opacity opacity-75 hover:opacity-100 text-neutral-300 hover:text-white"
              >
                <div className="w-5 h-5 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white rounded">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
                  BACK_TO_TERMINAL
                </span>
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] font-semibold text-neutral-500 uppercase">CURRENT INTEGRATION:</span>
                <span className="bg-purple-950/80 border border-purple-500/40 text-purple-400 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest font-mono uppercase">
                  {selectedGame === 'CLICKER' && 'MANA OVERDRIVE'}
                  {selectedGame === 'MEMORY' && 'RECON MATRIX'}
                  {selectedGame === 'DODGER' && 'BLADE DEFLECTOR'}
                </span>
              </div>
            </div>

            {/* In-view Game Simulator Stage */}
            <div className="flex-1 flex items-center justify-center p-4">
              {selectedGame === 'CLICKER' && <ManaClickerGame />}
              {selectedGame === 'MEMORY' && <ReconMemoryGame />}
              {selectedGame === 'DODGER' && <BladeDodgerGame />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================
   GAME 1: MANA CLICKER (Tapping Overdrive)
   ========================================== */
function ManaClickerGame() {
  const [mana, setMana] = useState(() => {
    const saved = localStorage.getItem('shadow_clicker_mana');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [clickPower, setClickPower] = useState(() => {
    const saved = localStorage.getItem('shadow_clicker_power');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [mps, setMps] = useState(() => {
    const saved = localStorage.getItem('shadow_clicker_mps');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [slimeTransmuters, setSlimeTransmuters] = useState(() => {
    const saved = localStorage.getItem('shadow_clicker_transmuters');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [manaReservoirs, setManaReservoirs] = useState(() => {
    const saved = localStorage.getItem('shadow_clicker_reservoirs');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [clicksCount, setClicksCount] = useState(0);
  const [clickEffects, setClickEffects] = useState<{ id: number; x: number; y: number; val: string }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Shop formulas
  const transmuterCost = Math.round(15 * Math.pow(1.15, slimeTransmuters));
  const reservoirCost = Math.round(85 * Math.pow(1.2, manaReservoirs));

  // Saving state
  useEffect(() => {
    localStorage.setItem('shadow_clicker_mana', mana.toFixed(1));
    localStorage.setItem('shadow_clicker_power', clickPower.toString());
    localStorage.setItem('shadow_clicker_mps', mps.toString());
    localStorage.setItem('shadow_clicker_transmuters', slimeTransmuters.toString());
    localStorage.setItem('shadow_clicker_reservoirs', manaReservoirs.toString());
  }, [mana, clickPower, mps, slimeTransmuters, manaReservoirs]);

  // MPS Loop
  useEffect(() => {
    if (mps === 0) return;
    const interval = setInterval(() => {
      setMana(prev => prev + mps / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [mps]);

  const handleCoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMana(prev => prev + clickPower);
    setClicksCount(prev => prev + 1);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const effectId = Date.now() + Math.random();
      setClickEffects(prev => [...prev, { id: effectId, x, y, val: `+${clickPower}` }]);
      
      setTimeout(() => {
        setClickEffects(prev => prev.filter(eff => eff.id !== effectId));
      }, 800);
    }
  };

  const buyTransmuter = () => {
    if (mana >= transmuterCost) {
      setMana(prev => prev - transmuterCost);
      setSlimeTransmuters(prev => prev + 1);
      setClickPower(prev => prev + 1);
    }
  };

  const buyReservoir = () => {
    if (mana >= reservoirCost) {
      setMana(prev => prev - reservoirCost);
      setManaReservoirs(prev => prev + 1);
      setMps(prev => prev + 4);
    }
  };

  const resetProgress = () => {
    if (window.confirm("ARE YOU SURE YOU WANT TO DISCHARGE ALL ACCUMULATED MANA?")) {
      setMana(0);
      setClickPower(1);
      setMps(0);
      setSlimeTransmuters(0);
      setManaReservoirs(0);
      setClicksCount(0);
    }
  };

  const getRank = () => {
    if (mana < 100) return 'UNREMARKABLE MOB';
    if (mana < 500) return 'BACKGROUND EXTRA';
    if (mana < 1500) return 'SHADOW GARDEN ROOKIE';
    if (mana < 5000) return 'ELITE OPERATIVE';
    return 'XADO';
  };

  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 p-4 relative z-10 font-mono">
      {/* Clicker Area Left */}
      <div className="flex flex-col items-center justify-center border border-neutral-900 bg-neutral-950/80 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        {/* Animated aura particle bg */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-600 filter blur-[90px] animate-pulse" />
        </div>

        {/* Level Stats */}
        <div className="w-full relative z-10 flex justify-between text-[10px] text-neutral-500 mb-6 font-mono font-bold">
          <span>COGNITIVE RANK:</span>
          <span className="text-purple-400 font-extrabold animate-pulse">{getRank()}</span>
        </div>

        {/* Counter Display */}
        <div className="text-center mb-8 relative z-10">
          <span className="text-[10px] text-neutral-500 font-semibold tracking-widest uppercase block mb-1">ACCUMULATED MAGIC INTENSITY</span>
          <div className="text-4xl md:text-5xl font-black text-purple-400 tracking-tighter">
            {Math.floor(mana).toLocaleString()} <span className="text-xs font-mono font-black text-white/50">MP</span>
          </div>
          <span className="text-[10px] text-neutral-400 tracking-wider">
            +{clickPower} PER INFLUX // +{mps} MPS AUTO
          </span>
        </div>

        {/* Central Core Button */}
        <button
          ref={buttonRef}
          onClick={handleCoreClick}
          className="relative w-44 h-44 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-purple-500/30 flex items-center justify-center cursor-pointer overflow-hidden group shadow-2xl active:scale-95 transition-transform"
        >
          {/* Inner pulsating overlay */}
          <div className="absolute inset-2 rounded-full bg-purple-950/30 border border-purple-500/20 group-hover:bg-purple-950/40 transition-colors" />
          <div className="absolute inset-10 rounded-full bg-purple-500/10 blur-[8px] group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300" />
          
          <div className="relative text-center select-none z-10 px-2 pointer-events-none">
            <Zap className="w-10 h-10 text-purple-400 mx-auto group-hover:scale-110 transition-transform mb-1.5 animate-pulse" />
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">ACTIVATE</span>
            <span className="block text-[8px] text-neutral-500 tracking-tight">COIL MATRIX</span>
          </div>

          {/* Floating Click Effects */}
          {clickEffects.map(eff => (
            <span
              key={eff.id}
              style={{ left: eff.x, top: eff.y }}
              className="absolute text-sm font-black text-purple-300 font-mono tracking-tighter pointer-events-none select-none animate-bounce"
            >
              {eff.val}
            </span>
          ))}
        </button>

        {/* Performance tracking */}
        <div className="w-full mt-8 pt-4 border-t border-neutral-900/60 relative z-10 flex justify-between text-[8px] text-neutral-600">
          <span>TOTAL MANA DISCHARGES: {clicksCount}</span>
          <button onClick={resetProgress} className="hover:text-red-400 hover:underline cursor-pointer select-none">
            [RE-CALIBRATE CORES]
          </button>
        </div>
      </div>

      {/* Upgrades Right */}
      <div className="flex flex-col justify-between border border-neutral-900 bg-neutral-950/70 p-6 md:p-8 rounded-2xl">
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-black text-neutral-400 mb-4 pb-2 border-b border-neutral-900">
            // SLIME MATRICES UPGRADES
          </h4>

          <div className="space-y-4">
            {/* Upgrade A */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
              mana >= transmuterCost 
                ? 'bg-neutral-900/60 border-purple-500/30 text-neutral-200' 
                : 'bg-neutral-950/40 border-neutral-900 text-neutral-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-neutral-200">Slime Transmuter</p>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">Enhances raw output. Adds +1 Magic power to every tap.</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] px-2 py-0.5 border border-neutral-800 rounded bg-black/40 font-bold uppercase text-neutral-400">
                    LVL {slimeTransmuters}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-900/45">
                <span className="text-[10px] font-bold tracking-tight text-neutral-400">COST: {transmuterCost} MP</span>
                <button
                  onClick={buyTransmuter}
                  disabled={mana < transmuterCost}
                  className={`px-3 py-1 text-[9px] font-bold uppercase border rounded cursor-pointer ${
                    mana >= transmuterCost
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/50 text-purple-400'
                      : 'bg-neutral-950 border-neutral-850 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  UPGRADE
                </button>
              </div>
            </div>

            {/* Upgrade B */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
              mana >= reservoirCost 
                ? 'bg-neutral-900/60 border-purple-500/30 text-neutral-200' 
                : 'bg-neutral-950/40 border-neutral-900 text-neutral-500'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-neutral-200">Shadow Reservoir</p>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">Automates infusion. Automatically generates +4 MP every second.</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] px-2 py-0.5 border border-neutral-800 rounded bg-black/40 font-bold uppercase text-neutral-400">
                    LVL {manaReservoirs}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-900/45">
                <span className="text-[10px] font-bold tracking-tight text-neutral-400">COST: {reservoirCost} MP</span>
                <button
                  onClick={buyReservoir}
                  disabled={mana < reservoirCost}
                  className={`px-3 py-1 text-[9px] font-bold uppercase border rounded cursor-pointer ${
                    mana >= reservoirCost
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/50 text-purple-400'
                      : 'bg-neutral-950 border-neutral-850 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  ACTIVATE
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[9px] leading-relaxed text-neutral-600 uppercase tracking-tighter">
          ⚡ TIP: Upgrades scale logarithmically with deployment density. Tap the central core to generate resources to launch higher tiers.
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   GAME 2: MEMORY RECON (Operatives Grid)
   ========================================== */
interface CardType {
  id: number;
  operative: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARDS_POOL = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'CID'];

function ReconMemoryGame() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize Memory Grid
  const initBoard = () => {
    // Duplicate pool to make pairs
    const pairs = [...CARDS_POOL, ...CARDS_POOL];
    // Shuffle the items
    const shuffled = pairs
      .map((item, idx) => ({ id: idx, label: item, order: Math.random() }))
      .sort((a, b) => a.order - b.order)
      .map((card, idx) => ({
        id: card.id,
        operative: card.label,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setMatchedCount(0);
    setIsWon(false);
  };

  useEffect(() => {
    initBoard();
  }, []);

  const handleCardClick = (targetId: number) => {
    // If already checking/matching or clicked card is matched/already flipped, ignore
    if (selected.length >= 2) return;
    const targetCard = cards.find(c => c.id === targetId);
    if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return;

    // Flip the clicked card immediately
    const updated = cards.map(c => c.id === targetId ? { ...c, isFlipped: true } : c);
    setCards(updated);

    const nextSelected = [...selected, targetId];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = nextSelected;
      const c1 = cards.find(c => c.id === firstId)!;
      const c2 = cards.find(c => c.id === secondId)!;

      if (c1.operative === c2.operative) {
        // Match found! Keep as matched
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true } 
              : c
          ));
          setSelected([]);
          setMatchedCount(prev => {
            const nextMatched = prev + 1;
            if (nextMatched === CARDS_POOL.length) {
              setIsWon(true);
            }
            return nextMatched;
          });
        }, 500);
      } else {
        // Mismatch. Flip back down
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setSelected([]);
        }, 950);
      }
    }
  };

  return (
    <div className="max-w-xl w-full border border-neutral-900 bg-neutral-950 p-6 rounded-2xl relative z-10 font-mono flex flex-col items-center">
      {/* HUD Info */}
      <div className="w-full justify-between flex items-center mb-6 text-[10px] font-bold text-neutral-500 uppercase">
        <span>MOVES: <b className="text-zinc-300 font-mono font-black">{moves}</b></span>
        <span>MATCHED SECTORS: <b className="text-purple-400 font-mono font-black">{matchedCount}/{CARDS_POOL.length}</b></span>
      </div>

      {!isWon ? (
        <div className="grid grid-cols-4 gap-3 w-full max-w-[400px]">
          {cards.map(card => {
            const shown = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-lg border transition-all duration-300 relative flex items-center justify-center cursor-pointer text-[10px] font-bold tracking-tight select-none outline-none ${
                  shown 
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 font-black scale-95' 
                    : 'bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 border-neutral-800 text-neutral-500'
                }`}
              >
                {shown ? (
                  <span className="uppercase text-center text-[9px] inline-block w-full truncate leading-none">
                    {card.operative}
                  </span>
                ) : (
                  <span className="text-xs">?</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <Award className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-bounce" />
          <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">RECON COMPLETED</h4>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed mb-6">
            All shadow garden elite operatives are successfully identified and integrated into command uplink.
          </p>
          <button
            onClick={initBoard}
            className="px-4 py-2 border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-400 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-transform"
          >
            RE-INITIATE DECK
          </button>
        </motion.div>
      )}

      {/* Footer controls */}
      {!isWon && (
        <div className="w-full mt-6 pt-4 border-t border-neutral-900/60 flex items-center justify-between text-[9px]">
          <span className="text-neutral-600">// DECODER MATRIX TRAINING</span>
          <button 
            type="button" 
            onClick={initBoard} 
            className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer select-none"
          >
            <RotateCcw className="w-3 h-3" /> RESET MATRIX
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   GAME 3: BLADE DODGER (Reflex Arc Arena)
   ========================================== */
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Collectible {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

function BladeDodgerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('shadow_dodger_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lives, setLives] = useState(3);

  // Use refs in order to control player and main loops without stale state
  const playerXRef = useRef(175); // Centered relative to default canvas width of 350
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameIdRef = useRef<number | null>(null);

  // Inputs
  const inputLeftRef = useRef(false);
  const inputRightRef = useRef(false);

  // Dimensions
  const canvasWidth = 350;
  const canvasHeight = 350;

  // Initialize background star stars
  const initStars = () => {
    const stars: Star[] = [];
    for (let i = 0; i < 25; i++) {
      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    initStars();
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  const startGame = () => {
    playerXRef.current = 175;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputLeftRef.current = true;
      if (e.key === 'ArrowRight') inputRightRef.current = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputLeftRef.current = false;
      if (e.key === 'ArrowRight') inputRightRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const triggerLeftTouch = (pressed: boolean) => {
    inputLeftRef.current = pressed;
  };

  const triggerRightTouch = (pressed: boolean) => {
    inputRightRef.current = pressed;
  };

  // Physics and Game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentScore = 0;
    let currentLives = 3;

    // Tick Frame logic
    const tick = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 1. Draw space cosmic background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Starfield movement
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > canvasHeight) {
          star.y = 0;
          star.x = Math.random() * canvasWidth;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // 2. Control Player Navigation
      const dx = 5.5; // steering speed
      if (inputLeftRef.current) {
        playerXRef.current = Math.max(15, playerXRef.current - dx);
      }
      if (inputRightRef.current) {
        playerXRef.current = Math.min(canvasWidth - 15, playerXRef.current + dx);
      }

      // Draw Cid's strike glider blade
      const px = playerXRef.current;
      const py = canvasHeight - 24;

      // Draw beautiful vector glider ship / blade
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = '#1e1b4b';

      ctx.beginPath();
      ctx.moveTo(px, py - 12); // Tip
      ctx.lineTo(px - 14, py + 10); // Bottom left
      ctx.lineTo(px, py + 4); // Tail recess
      ctx.lineTo(px + 14, py + 10); // Bottom right
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Slime shield trail
      ctx.beginPath();
      ctx.arc(px, py - 1, 15, 0, Math.PI, true);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 3. Obstacles generation & tracking (Red evil fragments)
      if (Math.random() < 0.045) {
        const obsWidth = 10 + Math.random() * 15;
        obstaclesRef.current.push({
          x: Math.random() * (canvasWidth - 25),
          y: -15,
          width: obsWidth,
          height: obsWidth,
          speed: 2.2 + Math.random() * 2.5,
        });
      }

      // Draw/Move Obstacles
      ctx.fillStyle = '#ef4444';
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.y += obs.speed;

        // Draw crystal hazard
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height / 2);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height / 2);
        ctx.closePath();
        ctx.fill();

        // Check crash: simple circle check
        const dist = Math.hypot(obs.x + obs.width / 2 - px, obs.y + obs.height / 2 - py);
        if (dist < 18) {
          // Crash! Reduce life and remove obstacle
          currentLives -= 1;
          setLives(currentLives);
          obstaclesRef.current.splice(i, 1);
          if (currentLives <= 0) {
            setGameState('GAMEOVER');
            return;
          }
          continue;
        }

        // Drop if past screen
        if (obs.y > canvasHeight) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // 4. Collectibles generation (Glowing cosmic purple orbs)
      if (Math.random() < 0.03) {
        collectiblesRef.current.push({
          x: 10 + Math.random() * (canvasWidth - 20),
          y: -10,
          radius: 5,
          speed: 1.5 + Math.random() * 1.8,
        });
      }

      // Draw/Move Collectibles
      ctx.fillStyle = '#c084fc';
      for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
        const col = collectiblesRef.current[i];
        col.y += col.speed;

        // Draw glowing circles
        ctx.beginPath();
        ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
        ctx.fill();

        // Check acquisition
        const dist = Math.hypot(col.x - px, col.y - py);
        if (dist < 16) {
          currentScore += 10;
          setScore(currentScore);
          collectiblesRef.current.splice(i, 1);
          continue;
        }

        if (col.y > canvasHeight) {
          collectiblesRef.current.splice(i, 1);
        }
      }

      frameIdRef.current = requestAnimationFrame(tick);
    };

    frameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameState]);

  // Handle Score Updates & highscore persist
  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('shadow_dodger_highscore', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  return (
    <div className="max-w-xl w-full border border-neutral-900 bg-neutral-950 p-5 rounded-2xl relative z-10 font-mono flex flex-col items-center">
      {/* HUD Bar */}
      <div className="w-full flex justify-between items-center mb-4 text-[10px] font-bold text-neutral-500 uppercase">
        <div className="flex gap-2.5">
          <span>SCORE: <b className="text-purple-400 font-mono font-black">{score}</b></span>
          <span>HI-SCORE: <b className="text-zinc-400 font-mono font-black">{highScore}</b></span>
        </div>
        <div>
          <span>LIVES: </span>
          <span className="text-red-500 font-bold ml-1">
            {'❤'.repeat(React.useMemo(() => Math.max(0, lives), [lives])) || '☠'}
          </span>
        </div>
      </div>

      {/* Screen Frame Container */}
      <div className="relative border-4 border-neutral-900 bg-black rounded-xl overflow-hidden shadow-2xl w-[320px] h-[320px] flex items-center justify-center">
        {gameState === 'PLAYING' && (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full block"
          />
        )}

        {gameState === 'IDLE' && (
          <div className="text-center p-6 bg-neutral-950/90 h-full w-full flex flex-col justify-center items-center">
            <Gamepad2 className="w-12 h-12 text-purple-400 mb-3 animate-pulse" />
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-1.5">INITIATE SYSTEM DRIVE</h4>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest leading-relaxed max-w-xs mb-6">
              Navigate Cid's striker model. Avoid falling red debris crystals and acquire glowing purple mana orbs. Use Keyboard Left/Right or buttons below.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-400 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-transform"
            >
              ENGAGE SYSTEMS
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="text-center p-6 bg-neutral-950/90 h-full w-full flex flex-col justify-center items-center">
            <span className="text-[8px] text-red-500 font-black tracking-widest uppercase block mb-1">CRITICAL INTEGRITY FAILURE</span>
            <h4 className="text-lg font-black text-white uppercase tracking-widest mb-3">STRIKER DESTROYED</h4>
            <div className="mb-6 space-y-1">
              <p className="text-[10px] text-neutral-400 uppercase">FINAL INTEL CAPTURED: <b className="text-purple-400 font-bold">{score} PT</b></p>
              {score >= highScore && score > 0 && (
                <p className="text-[8px] text-yellow-450 font-black tracking-widest uppercase text-yellow-500 animate-pulse">new matrix record!</p>
              )}
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2 border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-400 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-transform"
            >
              RUN DIAGNOSTIC AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Manual Touch Navigation Controls for simple access */}
      {gameState === 'PLAYING' && (
        <div className="w-full grid grid-cols-2 gap-4 mt-4 select-none">
          <button
            onMouseDown={() => triggerLeftTouch(true)}
            onMouseUp={() => triggerLeftTouch(false)}
            onMouseLeave={() => triggerLeftTouch(false)}
            onTouchStart={(e) => { e.preventDefault(); triggerLeftTouch(true); }}
            onTouchEnd={(e) => { e.preventDefault(); triggerLeftTouch(false); }}
            className="py-3 bg-neutral-900 active:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer select-none"
          >
            ◄ STEER LEFT
          </button>
          <button
            onMouseDown={() => triggerRightTouch(true)}
            onMouseUp={() => triggerRightTouch(false)}
            onMouseLeave={() => triggerRightTouch(false)}
            onTouchStart={(e) => { e.preventDefault(); triggerRightTouch(true); }}
            onTouchEnd={(e) => { e.preventDefault(); triggerRightTouch(false); }}
            className="py-3 bg-neutral-900 active:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer select-none"
          >
            STEER RIGHT ►
          </button>
        </div>
      )}

      {/* Help info */}
      <div className="hidden md:flex gap-1 items-center justify-center text-[7px] text-neutral-600 uppercase tracking-widest w-full mt-4 text-center">
        <HelpCircle size={8} /> KEYBOARD STEERING: LEFT OR RIGHT ARROWS ALSO ACTIVE.
      </div>
    </div>
  );
}
