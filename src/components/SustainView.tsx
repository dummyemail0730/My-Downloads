import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Heart, Copy, Check, X, Smartphone, QrCode, ShieldCheck } from 'lucide-react';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';
import shadowGardenLogo from '../assets/images/shadow_garden_logo_1779199904393.png';

export default function SustainView() {
  const [hardwareBoost, setHardwareBoost] = useState<number>(74); // Mock hardware optimization slider tracker
  const [isGcashModalOpen, setIsGcashModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supportTiers = [
    {
      id: 'tier-1',
      title: 'COOLING & CORE BOOST',
      cost: '$10 - $25',
      benefit: 'Upgrades cooling vents & CPU clock stability thresholds.',
      simValue: 85,
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      border: 'border-purple-500/20 hover:border-purple-500/50',
    },
    {
      id: 'tier-2',
      title: 'COGNITIVE ARRAY UPGRADE',
      cost: '$50 - $100',
      benefit: 'Expands hyperparameter limits & parallel high-speed memory modules.',
      simValue: 95,
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.45)]',
      border: 'border-violet-500/20 hover:border-violet-500/50',
    },
    {
      id: 'tier-3',
      title: 'SHADOW ARCHITECTURE GATEWAY',
      cost: '$200+',
      benefit: 'Sustains remote access deployment grids & shadow protection pipelines.',
      simValue: 100,
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.55)]',
      border: 'border-indigo-500/20 hover:border-indigo-500/50',
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-full flex flex-col justify-between overflow-x-hidden bg-neutral-950 text-white relative">
      
      {/* Background Graphic Blend with Clock Tower */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none select-none">
        <img 
          src={shadowClockTower} 
          alt="" 
          className="w-full h-full object-cover filter grayscale brightness-50"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-neutral-900">
          <div>
            <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-purple-400 font-extrabold">// SYSTEM_SUSTENANCE</span>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-white to-purple-300">
              WHY SUSTAIN THE SHADOWS?
            </h1>
          </div>
        </div>

        {/* Core Manifesto Text (Fulfill user prompt text requirement perfectly, compressed ~30%) */}
        <div className="bg-neutral-950/80 border border-neutral-900/50 backdrop-blur-md rounded-2xl p-5 md:p-6 space-y-4 text-neutral-300 leading-relaxed font-sans text-sm md:text-base relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-mono text-[70px] font-black leading-none uppercase text-purple-500">
            SHDW
          </div>
          
          <div className="space-y-4 text-left">
            <p className="font-extrabold text-white text-lg md:text-xl border-l-2 border-purple-500 pl-4 tracking-tight leading-snug">
              True innovation cannot be bound by standard hardware. To construct tomorrow's digital frameworks, mundane tools are no longer sufficient.
            </p>

            <p className="leading-relaxed opacity-90 pl-4 border-l-2 border-transparent">
              Currently, an optimized, remote-access environment combined with advanced AI creation arrays operates from the shadows to design and deploy elite models with maximum efficiency. Your support directly upgrades our core infrastructure, shattering hardware bottlenecks.
            </p>

            <p className="font-medium text-purple-200 pl-4 border-l-2 border-purple-500/40">
              Supporting this page does not merely fund code. It directly sustains a technician operating from the shadows to keep our local community connected, functional, and secure.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Hardware Optimization Block */}
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="font-mono text-xs uppercase font-black tracking-widest text-neutral-200">
                  Infrastructure Gateway Status
                </h3>
              </div>
              <p className="text-[10px] font-sans text-neutral-400">
                Adjust support impact configuration to target bottleneck thresholds.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-neutral-950/90 border border-neutral-800 rounded-lg px-2.5 py-1 shrink-0 self-start md:self-auto">
              <span className="text-[9px] font-mono font-bold text-neutral-400">CORE_CAPACITY:</span>
              <span className={`text-[11px] font-mono font-black ${hardwareBoost === 100 ? 'text-emerald-400' : hardwareBoost >= 90 ? 'text-purple-400' : 'text-amber-500'}`}>
                {hardwareBoost === 100 ? '100% (ATOMIC_LIMIT)' : `${hardwareBoost}% THROTTLED`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Interactive sliders for support levels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {supportTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setHardwareBoost(tier.simValue)}
                  className={`p-3.5 border rounded-xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${tier.glow} ${tier.border} ${
                    hardwareBoost === tier.simValue 
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:bg-neutral-900/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono font-extrabold tracking-wider text-purple-400">
                        {tier.title}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 px-1 py-0.5 rounded">
                        {tier.cost}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans leading-snug">
                      {tier.benefit}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-neutral-900/50">
                    <span className="text-neutral-500">SIMULATE IMPACT:</span>
                    <span className="text-purple-300 font-bold">+{tier.simValue}% SPEED</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Support Shadow Button & GCash Trigger */}
        <div className="flex flex-col items-center justify-center py-4 relative z-10">
          <button
            onClick={() => setIsGcashModalOpen(true)}
            className="group relative px-8 py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl border border-purple-500/50 hover:border-purple-400 font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] cursor-pointer flex items-center gap-2 px-6 active:scale-95 overflow-hidden"
          >
            <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
            <span>Click to support Shadow Garden</span>
            <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
          </button>
          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-2">// DIRECT GCASH CONDUIT SECURE GATEWAY</p>
        </div>

      </div>

      {/* GCash Details Popup Modal */}
      <AnimatePresence>
        {isGcashModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGcashModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-md bg-neutral-950 border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.4)] font-mono text-neutral-200 z-10 p-1"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-sky-400 to-indigo-600" />
              
              <div className="p-6 md:p-8 bg-neutral-950 rounded-[22px] relative space-y-5">
                
                {/* Close Button */}
                <button
                  onClick={() => setIsGcashModalOpen(false)}
                  className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Cyber Header */}
                <div className="text-center pt-2 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950/45 border border-sky-500/30 rounded-full text-[9px] text-sky-400 font-extrabold tracking-wider uppercase">
                    <Smartphone size={10} className="text-sky-400" />
                    <span>GCash Secure Conduit</span>
                  </div>
                  <h3 className="text-base font-black text-white tracking-wide uppercase mt-1">
                    SUPPORT RECIPIENT
                  </h3>
                </div>

                {/* QR Screen Wrapper */}
                <div className="border border-dashed border-purple-500/25 p-5 rounded-2xl bg-neutral-900/30 flex flex-col items-center justify-center relative group select-none">
                  <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-purple-500/40 rounded-tl" />
                  <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-purple-500/40 rounded-tr" />
                  <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-purple-500/40 rounded-bl" />
                  <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-purple-500/40 rounded-br" />
                  
                  {/* Outer glowing target scan effect */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-[bounce_3s_infinite] pointer-events-none" />

                  <QrCode className="w-16 h-16 text-purple-400 opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300" strokeWidth={1.5} />
                  
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest mt-2.5">
                    SCAN QR OR COPY INFO BELOW
                  </span>
                </div>

                {/* Fields Table */}
                <div className="space-y-3">
                  {/* Recipient Account Name */}
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0">
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">ACCOUNT NAME</span>
                      <span className="text-xs font-black text-white uppercase tracking-wide">ADRIAN G.</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('ADRIAN G.');
                        setCopiedField('name');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 hover:border-purple-500 hover:text-white text-neutral-400 bg-neutral-900/60"
                    >
                      {copiedField === 'name' ? (
                        <>
                          <Check size={10} className="text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recipient GCash Number */}
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0">
                      <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">GCASH MOBILE NUMBER</span>
                      <span className="text-xs font-black text-purple-400 tracking-wider">0993 618 8535</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('09936188535');
                        setCopiedField('number');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 hover:border-purple-500 hover:text-white text-neutral-400 bg-neutral-900/60"
                    >
                      {copiedField === 'number' ? (
                        <>
                          <Check size={10} className="text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Warning / Guide */}
                <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-purple-300 leading-relaxed font-sans font-medium">
                    Funds directly sponsor advanced cloud development resources, remote servers, and shadow tech tool maintenance.
                  </p>
                </div>

                {/* ID badge bottom ribbon */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[8px] text-neutral-500 uppercase tracking-widest">
                  <span>SECURE_ID: #4c46-GCASH</span>
                  <div className="flex items-center gap-1 text-emerald-500">
                    <ShieldCheck size={9} />
                    <span>ACTIVE</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid footer watermark matching SoftwareView / ToolsView */}
      <div className="mt-8 text-center relative z-10 border-t border-neutral-900/80 pt-4">
        <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest max-w-sm mx-auto">
          COGNITIVE SUITE HARWARE INTERFACE // SECURE SECRECY LEVEL 4
        </p>
      </div>

    </div>
  );
}
