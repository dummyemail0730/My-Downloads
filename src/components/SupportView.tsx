import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Copy, Check, ArrowLeft, Smartphone, QrCode, ShieldCheck, X } from 'lucide-react';
import shadowDarkBlade from '../assets/images/shadow_dark_blade_1779250640689.png';

interface SupportViewProps {
  onBack: () => void;
}

export default function SupportView({ onBack }: SupportViewProps) {
  const [isGcashModalOpen, setIsGcashModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-40 bg-neutral-950 text-white flex flex-col justify-between overflow-x-hidden p-4 md:p-8 select-none">
      
      {/* Immersive background using shadowDarkBlade (image 2) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950 z-10" />
        <img 
          src={shadowDarkBlade} 
          alt="" 
          className="w-full h-full object-cover filter brightness-[0.22] contrast-125 select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Floating Sparkles or Cyber Highlights */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_60%)] pointer-events-none" />

      {/* Header with Return Home Action */}
      <div className="relative z-10 flex items-center justify-between border-b border-purple-500/15 pb-4 md:pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center">
            <Heart className="w-4 h-4 text-purple-400 fill-purple-400/20" />
          </div>
          <div>
            <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-purple-400 font-extrabold block">// STANDALONE_NODE_GATEWAY</span>
            <h1 className="text-sm md:text-base font-black uppercase tracking-widest text-neutral-100">
              SHADOW GARDEN SUPPORT
            </h1>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 group transition-all duration-300 text-purple-400 hover:text-white bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/50 px-4 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
          <span>Return</span>
        </motion.button>
      </div>

      {/* Core Body Container */}
      <div className="relative z-10 max-w-3xl mx-auto w-full my-auto py-8 space-y-6 md:space-y-8">
        
        {/* Core Manifesto Card with Image 2 overlay */}
        <div className="relative bg-neutral-950/90 border border-purple-500/25 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-5 text-neutral-300 leading-relaxed font-sans overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.2)]">
          {/* Card internal wallpaper */}
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none bg-cover bg-center mix-blend-luminosity" style={{ backgroundImage: `url(${shadowDarkBlade})` }} />
          
          <div className="absolute top-0 right-0 p-4 select-none pointer-events-none opacity-[0.03] font-mono text-[100px] font-black leading-none uppercase text-purple-500 z-10">
            EMINENCE
          </div>
          
          <div className="space-y-4 text-left relative z-10">
            <p className="font-extrabold text-white text-lg md:text-2xl border-l-4 border-purple-500 pl-4 tracking-tight leading-snug">
              True innovation cannot be bound by standard hardware. To construct tomorrow's digital frameworks, mundane tools are no longer sufficient.
            </p>

            <p className="text-sm md:text-base leading-relaxed opacity-90 pl-4 border-l-4 border-transparent">
              Currently, an optimized, remote-access environment combined with advanced AI creation arrays operates from the shadows to design and deploy elite models with maximum efficiency. Your support directly upgrades our core infrastructure, shattering hardware bottlenecks.
            </p>

            <p className="text-sm md:text-base font-medium text-purple-200 pl-4 border-l-4 border-purple-500/40">
              Supporting this page does not merely fund code. It directly sustains a technician operating from the shadows to keep our local community connected, functional, and secure.
            </p>
          </div>
        </div>

        {/* Support Call to Action Area */}
        <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGcashModalOpen(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl border border-purple-500/40 hover:border-purple-400 font-mono text-xs font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] cursor-pointer flex items-center gap-3 px-8 active:scale-95 overflow-hidden"
          >
            <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
            <span>Click to support Shadow Garden</span>
            <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
          </motion.button>
          
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.3em] animate-pulse">
            // DIRECT GCASH CONDUIT SECURE GATEWAY //
          </span>
        </div>

      </div>

      {/* Footer Branding Status Indicator */}
      <div className="relative z-10 border-t border-neutral-900 pt-4 text-center">
        <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-[0.25em] max-w-md mx-auto">
          COGNITIVE SUITE HARWARE INTERFACE // SECURE SECRECY LEVEL 4
        </p>
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
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
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
                          <span className="text-emerald-400 text-[9px]">COPIED</span>
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
                          <span className="text-emerald-400 text-[9px]">COPIED</span>
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

    </div>
  );
}
