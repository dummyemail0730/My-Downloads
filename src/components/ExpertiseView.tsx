import { motion } from 'motion/react';
import { Cpu, Binary, ArrowLeft } from 'lucide-react';

const SKILLS = [
  {
    category: "Hardware Maintenance",
    icon: <Cpu className="w-5 h-5" />,
    items: ["PC Diagnostics", "Hardware Optimization", "Computer Assembly And Replacement", "Thermal Management", "Hardware Cross-Compatibility & Validation"],
    backgroundImage: "/src/assets/images/hardware_background_1779204942117.png"
  },
  {
    category: "System Recovery and Deployment",
    icon: <Binary className="w-5 h-5" />,
    items: ["BIOS Update", "Full-System Imaging & Deployment", "MBR to GPT Conversion", "Disk Image Creation", "File Restoration", "Boot Repair", "Password Reset"],
    backgroundImage: "/src/assets/images/system_recovery_bg_1779205058378.png"
  }
];

export default function ExpertiseView({ onBack }: { onBack?: () => void }) {
  return (
    <div className="p-8 md:p-12 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 group px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return Home</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-0.5 bg-black" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">Areas of Expertise</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black border border-black text-black">
        {SKILLS.map((skill, index) => (
          <motion.div 
            key={skill.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 md:p-12 min-h-[500px] group transition-colors duration-500 overflow-hidden ${
              skill.backgroundImage ? 'bg-black text-white' : 'bg-white hover:bg-black hover:text-white transition-colors'
            }`}
          >
            {skill.backgroundImage && (
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity hover:opacity-60 transition-opacity duration-700" 
                style={{ backgroundImage: `url(${skill.backgroundImage})` }}
              />
            )}
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 flex items-center justify-center transition-colors ${
                  skill.backgroundImage 
                    ? 'bg-white text-black' 
                    : 'bg-black text-white group-hover:bg-white group-hover:text-black'
                }`}>
                  {skill.icon}
                </div>
                <h3 className="font-black uppercase tracking-tight">{skill.category}</h3>
              </div>
              
              <ul className="space-y-3">
                {skill.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rotate-45 transition-colors ${
                      skill.backgroundImage 
                        ? 'bg-white' 
                        : 'bg-black group-hover:bg-white'
                    }`} />
                    <span className={`text-xs font-bold uppercase tracking-widest transition-all ${
                      skill.backgroundImage 
                        ? 'opacity-100' 
                        : 'opacity-60 group-hover:opacity-100'
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black leading-relaxed"
      >
        Technical proficiency verified via distributed testing protocols // 
        last updated MAY 2026 // archive reference #EXP-772
      </motion.div>
    </div>
  );
}
