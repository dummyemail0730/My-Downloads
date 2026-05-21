import { motion } from 'motion/react';
import { Target, Shield, Zap, Theater, Flame, Globe, Sparkles, BookOpen } from 'lucide-react';

export default function ShadowLoreView() {
  const loreCards = [
    {
      title: "Alter Ego",
      highlight: "Cid Kagenou",
      description: "Cid Kagenou plays the role of a mob character while secretly operating as the powerful leader, Shadow.",
      icon: Theater,
      color: "from-purple-500 to-indigo-500",
      glow: "rgba(168,85,247,0.15)"
    },
    {
      title: "Shadow Garden",
      highlight: "Founder of Secret Org",
      description: "Founder of a secret organization dedicated to fighting the Cult of Diablos, often recruiting members without their full knowledge of his \"creative\" deceptions.",
      icon: Shield,
      color: "from-purple-600 to-violet-600",
      glow: "rgba(124,58,237,0.15)"
    },
    {
      title: "\"I am Atomic\"",
      highlight: "Ultimate Technique",
      description: "The signature, devastating magical nuke technique used to eliminate enemies with zero trace.",
      icon: Zap,
      color: "from-red-500 via-purple-600 to-indigo-600",
      glow: "rgba(239,68,68,0.2)"
    },
    {
      title: "Master Actor",
      highlight: "Scenario Improv",
      description: "Highly skilled at improvising elaborate scenarios to maintain the \"Eminence in Shadow\" persona.",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-500",
      glow: "rgba(99,102,241,0.15)"
    },
    {
      title: "Hidden Strength",
      highlight: "Near-Limitless Power",
      description: "While masquerading as a background character, possesses near-limitless magical power and combat prowess.",
      icon: Flame,
      color: "from-purple-500 to-pink-500",
      glow: "rgba(217,70,239,0.15)"
    },
    {
      title: "World Building",
      highlight: "Prophetic Truths",
      description: "Often spins fabricated tales about an ancient cult that unknowingly turn out to be true.",
      icon: Globe,
      color: "from-blue-500 to-purple-500",
      glow: "rgba(59,130,246,0.15)"
    },
    {
      title: "Style",
      highlight: "Iconic Mastermind",
      description: "Known for iconic, dark, and elegant attire that emphasizes the \"cool\" aesthetic of a hidden mastermind.",
      icon: Target,
      color: "from-purple-700 to-neutral-900",
      glow: "rgba(168,85,247,0.2)"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-start max-w-6xl mx-auto w-full font-mono text-neutral-300">
      
      {/* Banner Intro Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 p-6 md:p-8 rounded-3xl border border-purple-500/20 bg-neutral-950/75 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            <p className="text-[10px] text-purple-400 font-extrabold tracking-[0.3em] uppercase">// CODENAME: SHADOW // GENESIS FILING</p>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase font-sans">
            THE SHADOW MASTER LORE
          </h3>
          <p className="text-xs text-neutral-400 max-w-xl font-sans">
            Transcribed profiles detailing the legendary capabilities of <span className="text-purple-400 font-bold">Cid Kagenou</span>, the founder of Shadow Garden, retrieved and logged directly from the digital core interface.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end justify-center shrink-0 border-l md:border-l-0 md:border-r border-neutral-800 pl-4 md:pl-0 md:pr-6">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">TRANSMISSION RATIO</p>
          <p className="text-xl font-bold font-mono tracking-widest text-purple-400">100% SECURE</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">EMINENCE CLASS LEVEL 4</p>
        </div>
      </motion.div>

      {/* Grid of Transcribed Specs */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {loreCards.map((lore, index) => {
          const Icon = lore.icon;
          const isAtomic = lore.title === "\"I am Atomic\"";

          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                borderColor: isAtomic ? "rgba(239,68,68,0.5)" : "rgba(168,85,247,0.5)",
                boxShadow: `0 10px 30px ${lore.glow}`
              }}
              className={`border rounded-2xl p-6 bg-neutral-950/80 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between group h-64
                ${isAtomic ? 'border-red-500/20' : 'border-neutral-900/90'}
              `}
            >
              {/* Target bracket styling */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neutral-900 group-hover:border-purple-500/40 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neutral-900 group-hover:border-purple-500/40 transition-colors" />

              {/* Glowing accent circle */}
              <div 
                className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 blur-xl transition-opacity pointer-events-none"
                style={{ backgroundColor: isAtomic ? '#ef4444' : '#a855f7' }}
              />

              <div>
                {/* Card Icon & Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-800 bg-neutral-900 text-purple-400 group-hover:text-white transition-colors duration-300
                      ${isAtomic ? 'group-hover:border-red-500/40 text-red-400' : ''}
                    `}>
                      <Icon size={16} className={isAtomic ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-sans font-bold">PROFILE METRIC</span>
                      <h4 className={`text-sm font-extrabold uppercase tracking-tight font-sans text-white`}>
                        {lore.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-600 font-extrabold">0{index + 1}</span>
                </div>

                {/* Subheading Highlight */}
                <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider mb-3 bg-neutral-900 text-purple-400 border border-neutral-800
                  ${isAtomic ? 'text-red-400 border-red-950/40 bg-red-950/10' : ''}
                `}>
                  {lore.highlight}
                </span>

                {/* Main Body Text */}
                <p className="text-[11px] leading-relaxed text-neutral-400 group-hover:text-neutral-200 transition-colors duration-300 font-sans font-medium">
                  {lore.description}
                </p>
              </div>

              {/* Bottom tag decoration */}
              <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-[7.5px] text-neutral-600 tracking-widest font-bold">
                <span>SYSTEM://ACTIVE_SECURE_NODE</span>
                <span>STATE_CHECK: OK</span>
              </div>
            </motion.div>
          );
        })}

        {/* Dynamic Interactive Card */}
        <motion.div
          variants={itemVariants}
          className="border border-purple-500/10 rounded-2xl p-6 bg-gradient-to-b from-purple-950/10 to-neutral-950/80 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between group h-64 hover:border-purple-500/30"
        >
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-purple-500/10 group-hover:border-purple-500/40" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-purple-500/10 group-hover:border-purple-500/40" />

          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-purple-950/50 bg-purple-950/20 text-purple-400">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-purple-400 font-extrabold tracking-widest font-sans">// SHADOW DECREE</span>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight font-sans text-white">
                    Lore Integrity
                  </h4>
                </div>
              </div>
              <span className="text-[10px] text-neutral-600 font-extrabold">08</span>
            </div>

            <p className="text-[11px] leading-relaxed text-neutral-400 font-sans font-medium mb-2">
              "We lurk in the shadows to serve the light configurations." Operating behind the scenes ensures total system stability both in real life and in technical systems.
            </p>
          </div>

          <div className="text-[8px] font-bold text-purple-500 uppercase tracking-[0.2em] animate-pulse">
            // SHADOW_GARDEN_CORE_LOADED //
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
