import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export default function ShadowProject({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="h-full flex flex-col p-8 md:p-12 bg-white">
      <div className="flex-1 flex flex-col justify-center max-w-4xl">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 12,
              delay: 0.2
            }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-6"
          >
            Shadow<br />
            <span className="text-gray-200">Project.</span>
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.8,
              ease: "easeOut"
            }}
            className="inline-block px-3 py-1 bg-black text-white font-mono text-[10px] uppercase tracking-[0.3em] mb-4 md:mb-6 font-bold"
          >
            By: Ian Gabionza // V.1.0
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.04,
                  delayChildren: 1.4
                }
              }
            }}
            className="text-lg md:text-xl font-bold uppercase tracking-tight text-gray-400 max-w-2xl leading-tight mb-8"
          >
            {"A systematic exploration of digital boundaries. This repository exists to document the intersection of minimalist design and high-performance computing.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 5 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8 }}
            onClick={onEnter}
            className="group flex items-center gap-4 px-8 py-3 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors"
          >
            Enter Archive
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
