import { motion } from 'motion/react';
import { Cpu, Binary } from 'lucide-react';

import hardwareBg from '../assets/images/hardware_background_1779204942117.png';
import systemRecoveryBg from '../assets/images/system_recovery_bg_1779205058378.png';

const SKILLS = [
  {
    category: "Hardware Maintenance",
    icon: <Cpu className="w-5 h-5" />,
    items: ["PC Diagnostics", "Hardware Optimization", "Computer Assembly And Replacement", "Thermal Management", "Hardware Cross-Compatibility & Validation"],
    backgroundImage: hardwareBg
  },
  {
    category: "System Recovery and Deployment",
    icon: <Binary className="w-5 h-5" />,
    items: ["BIOS Update", "Full-System Imaging & Deployment", "MBR to GPT Conversion", "Disk Image Creation", "File Restoration", "Boot Repair", "Password Reset"],
    backgroundImage: systemRecoveryBg
  }
];

export default function ExpertiseView({ onBack }: { onBack?: () => void }) {
  return (
    <div className="p-3 md:p-4 lg:p-5 h-full flex flex-col justify-between overflow-hidden bg-neutral-950">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900 text-white">
          {SKILLS.map((skill, index) => (
            <motion.div 
              key={skill.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 md:p-5 lg:p-6 min-h-[220px] md:min-h-[280px] lg:min-h-[300px] group transition-colors duration-500 overflow-hidden ${
                skill.backgroundImage ? 'bg-neutral-950 text-white' : 'bg-neutral-900 hover:bg-neutral-950 text-white transition-colors'
              }`}
            >
              {skill.backgroundImage && (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:opacity-45 transition-opacity duration-700" 
                  style={{ backgroundImage: `url(${skill.backgroundImage})` }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-colors border border-neutral-800 rounded ${
                    skill.backgroundImage 
                      ? 'bg-neutral-900 text-purple-400 font-black' 
                      : 'bg-neutral-950 text-white group-hover:bg-neutral-900 group-hover:text-purple-400 font-black'
                  }`}>
                    {skill.icon}
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-xs md:text-sm text-neutral-100 group-hover:text-white">{skill.category}</h3>
                </div>
                
                <ul className="space-y-1 md:space-y-1.5 lg:space-y-2">
                  {skill.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <div className={`w-1 h-1 rotate-45 transition-colors shrink-0 ${
                        skill.backgroundImage 
                          ? 'bg-purple-500' 
                          : 'bg-neutral-500 group-hover:bg-purple-505'
                      }`} />
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${
                        skill.backgroundImage 
                          ? 'text-neutral-300' 
                          : 'opacity-60 group-hover:opacity-100 text-neutral-400 group-hover:text-white'
                      }`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
 
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8 }}
        className="mt-2 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-black leading-relaxed text-neutral-500"
      >
        Technical proficiency verified via distributed testing protocols // 
        last updated MAY 2026 // archive reference #EXP-772
      </motion.div>
    </div>
  );
}
