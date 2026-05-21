import { useState } from 'react';
import { motion } from 'motion/react';
import { TOOLS as STATIC_TOOLS } from '../constants';
import { Terminal, Cpu, Database, ExternalLink } from 'lucide-react';
import { Tool } from '../types';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowDarkBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMysteriousAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowNeonElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';
import shadowMasterAtomic from '../assets/images/shadow_master_atomic_1779279129608.png';

const TOOL_BG_IMAGES = [
  shadowMasterAtomic,
  shadowOnRoof,
  shadowDarkBlade,
  shadowMysteriousAura,
  shadowMoonRain,
  shadowNeonElectricity,
  shadowClockTower
];

const getIcon = (category: string) => {
  const normCategory = category.toUpperCase();
  if (normCategory.includes('EXT') || normCategory.includes('DEV') || normCategory.includes('CPU') || normCategory.includes('W10')) {
    return <Cpu size={18} />;
  } else if (normCategory.includes('DATA') || normCategory.includes('DB') || normCategory.includes('SQL')) {
    return <Database size={18} />;
  }
  return <Terminal size={18} />;
};

export default function ToolsView() {
  const [tools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('custom_tools');
    let loaded = saved ? JSON.parse(saved) : [...STATIC_TOOLS];
    
    // Ensure new static tools (e.g. newly added IDs 5 and 6) are merged even if custom_tools exists
    if (saved && Array.isArray(loaded)) {
      const loadedIds = new Set(loaded.map((t: any) => t.id));
      for (const staticTool of STATIC_TOOLS) {
        if (!loadedIds.has(staticTool.id)) {
          loaded.push(staticTool);
        }
      }
    }

    return loaded
      .filter((tool: Tool) => STATIC_TOOLS.some(t => t.id === tool.id))
      .map((tool: Tool) => {
        const staticTool = STATIC_TOOLS.find(t => t.id === tool.id);
        if (staticTool) {
          return {
            ...staticTool,
            description: tool.description || staticTool.description,
            link: tool.link || staticTool.link,
            category: tool.category || staticTool.category
          };
        }
        return tool;
      });
  });

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-900">
        {tools.map((tool, idx) => {
          const Tag = tool.link ? motion.a : motion.div;
          const bgImage = shadowMasterAtomic;
          return (
            <Tag
              key={tool.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              {...(tool.link ? {
                href: tool.link,
                target: "_blank",
                rel: "noopener noreferrer"
              } : {})}
              className={`border-r border-b border-neutral-900 p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group text-white ${
                tool.link ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Background Image of Cid Kagenou with purple gradient blending */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={bgImage} 
                  alt="" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-[0.65] group-hover:brightness-[0.75]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-purple-950/45 to-black/30 group-hover:from-black/95 group-hover:via-purple-900/50 group-hover:to-black/35 transition-all duration-350 z-10" />
              </div>

              {/* Top part / main content */}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 border border-white/20 group-hover:border-purple-500/50 transition-colors bg-black/40 group-hover:bg-neutral-900 text-purple-400 shrink-0 relative z-10 shadow-lg rounded">
                    {getIcon(tool.category)}
                  </div>
                  <div className="flex items-center gap-1.55">
                    <span className="text-[8px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 px-1.5 py-0.5 group-hover:bg-purple-500 group-hover:text-black transition-all duration-300 rounded">
                      V{tool.version}
                    </span>
                    {tool.link && (
                      <ExternalLink size={14} className="opacity-45 group-hover:opacity-100 transition-opacity text-neutral-400 group-hover:text-purple-300" />
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-2 text-neutral-100 group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-[11px] leading-relaxed max-w-sm font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors">
                  {tool.description}
                </p>
              </div>

              {/* Bottom footer bar matching SoftwareView */}
              <div className="mt-8 flex justify-between items-end border-t border-neutral-800 group-hover:border-neutral-700 pt-3 transition-colors relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-950/60 text-purple-300 border border-neutral-800/80 group-hover:bg-neutral-800 group-hover:text-white transition-all duration-300">
                    {tool.category.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 group-hover:text-purple-300 transition-all duration-300 font-mono">
                  SYS://{tool.category.toUpperCase().slice(0, 15)}
                </span>
              </div>
            </Tag>
          );
        })}
        {/* Empty filler blocks to maintain grid-cols-3 bento-grid integrity */}
        {(tools.length % 3 !== 0) && Array.from({ length: 3 - (tools.length % 3) }).map((_, i) => (
          <div key={`filler-${i}`} className="border-b border-neutral-900 border-r border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r-0"></div>
        ))}
      </div>
    </div>
  );
}
