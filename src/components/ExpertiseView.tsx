import { motion } from 'motion/react';
import { Cpu, Binary, Heart } from 'lucide-react';

import shadowMysteriousAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowDarkBlade from '../assets/images/shadow_dark_blade_1779250640689.png';

const SKILLS = [
  {
    category: "System Recovery & OS Configuration",
    icon: <Cpu className="w-5 h-5" />,
    items: [
      "Blue Screen",
      "Boot Failure",
      "Boot Loop",
      "Format / Reformat",
      "Data Recovery",
      "System and Files Backup",
      "O.S. Cloning",
      "O.S. Migration",
      "Password Removal",
      "BIOS Update"
    ],
    backgroundImage: shadowMysteriousAura
  },
  {
    category: "Software & Game Installation",
    icon: <Binary className="w-5 h-5" />,
    items: [
      "Adobe Photoshop",
      "Microsoft Office 365 Installation & Activation",
      "Windows 11 Permanent Activation",
      "Game Installation"
    ],
    backgroundImage: shadowMysteriousAura
  }
];

export default function ExpertiseView({ onBack, onSupportClick }: { onBack?: () => void; onSupportClick?: () => void }) {
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

      {/* Support Shadow Garden Button */}
      <div className="flex justify-center py-4 relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSupportClick}
          className="group relative px-6 md:px-8 py-3 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 hover:from-purple-800 hover:to-indigo-900 border border-purple-500/30 hover:border-purple-400 text-white rounded-xl font-mono text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] cursor-pointer flex items-center gap-2"
        >
          <Heart className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>Support shadow Garden</span>
          <Heart className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        </motion.button>
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
