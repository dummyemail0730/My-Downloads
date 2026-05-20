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

const TOOL_BG_IMAGES = [
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

    return loaded.map((tool: Tool) => {
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
    <div className="h-full flex flex-col bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-black">
        {tools.map((tool, idx) => {
          const Tag = tool.link ? motion.a : motion.div;
          const bgImage = TOOL_BG_IMAGES[idx % TOOL_BG_IMAGES.length];
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
              className={`flex items-start gap-4 p-5 bg-neutral-950 border-r border-b border-black group text-white relative overflow-hidden transition-all duration-300 select-none ${
                tool.link ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Background Image of Shadow from Shadow Garden */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={bgImage} 
                  alt="" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-[0.75] group-hover:brightness-[0.85]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 group-hover:from-black/95 group-hover:via-black/60 group-hover:to-black/35 transition-all duration-300" />
              </div>

              {/* Icon */}
              <div className="mt-1 p-2 border border-white/20 group-hover:border-white transition-colors bg-black/40 group-hover:bg-neutral-900 text-white shrink-0 relative z-10 shadow-lg">
                {getIcon(tool.category)}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-lg font-black uppercase tracking-tighter truncate text-white">
                    {tool.name}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[8px] font-mono font-bold bg-white text-black px-1.5 py-0.5 group-hover:bg-cyan-400 group-hover:text-black transition-colors rounded">
                      V{tool.version}
                    </span>
                    {tool.link && (
                      <ExternalLink size={11} className="opacity-70 group-hover:opacity-100 transition-opacity text-white" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-neutral-300 font-medium mb-3 group-hover:text-white transition-colors leading-tight min-h-[2.5rem] flex items-center">
                  {tool.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-black border-b border-white/20 group-hover:border-white text-neutral-300 group-hover:text-white transition-colors">
                    SYS://{tool.category.toUpperCase().slice(0, 15)}
                  </span>
                </div>
              </div>
            </Tag>
          );
        })}
        {/* Empty filler blocks to maintain grid-cols-3 bento-grid integrity */}
        {(tools.length % 3 !== 0) && Array.from({ length: 3 - (tools.length % 3) }).map((_, i) => (
          <div key={`filler-${i}`} className="border-b border-black border-r border-black p-5 hidden lg:block bg-gray-50/20 last:border-r-0"></div>
        ))}
      </div>
    </div>
  );
}
