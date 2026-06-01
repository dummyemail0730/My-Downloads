import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TOOLS as STATIC_TOOLS } from '../constants';
import { Terminal, Cpu, Database, ExternalLink, Download } from 'lucide-react';
import { Tool } from '../types';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowDarkBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMysteriousAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowNeonElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';
import shadowGardenCharacters from '../assets/images/shadow_garden_characters_1780189909589.png';

import shadowSoloBg from '../assets/images/shadow_solo_bg_1780190187431.png';
import alphaSoloBg from '../assets/images/alpha_solo_bg_1780190207110.png';
import betaSoloBg from '../assets/images/beta_solo_bg_1780190226477.png';
import gammaSoloBg from '../assets/images/gamma_solo_bg_1780190246677.png';
import deltaSoloBg from '../assets/images/delta_solo_bg_1780190266500.png';
import epsilonSoloBg from '../assets/images/epsilon_solo_bg_1780190286312.png';
import zetaSoloBg from '../assets/images/zeta_solo_bg_1780190306077.png';

const CHARACTER_BG_IMAGES = [
  shadowSoloBg,
  alphaSoloBg,
  betaSoloBg,
  gammaSoloBg,
  deltaSoloBg,
  epsilonSoloBg,
  zetaSoloBg
];

const TOOL_BG_IMAGES = [
  shadowGardenCharacters,
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
    const deletedIds = JSON.parse(localStorage.getItem('deleted_item_ids') || '[]');
    
    // Ensure new static tools (e.g. newly added IDs 5 and 6) are merged even if custom_tools exists
    if (saved && Array.isArray(loaded)) {
      const loadedIds = new Set(loaded.map((t: any) => t.id));
      for (const staticTool of STATIC_TOOLS) {
        if (!loadedIds.has(staticTool.id) && !deletedIds.includes(staticTool.id)) {
          loaded.push(staticTool);
        }
      }
    }

    return loaded
      .filter((tool: Tool) => !deletedIds.includes(tool.id))
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

  const defaultToolLinks: { [key: string]: string } = {
    '1': 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing',
    '2': 'https://www.3dpchip.com',
    '3': 'https://www.wagnardsoft.com/display-driver-uninstaller-ddu',
    '4': 'https://www.cpuid.com/softwares/cpu-z.html',
    '5': 'https://www.hwinfo.com/download/',
    '6': 'https://rufus.ie/en/',
    '7': 'https://github.com/topics/dashboard',
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-900">
        {tools.map((tool, idx) => {
          const Tag = motion.div;
          const bgImage = CHARACTER_BG_IMAGES[idx % CHARACTER_BG_IMAGES.length];

          const targetLink = tool.link || defaultToolLinks[tool.id] || 'https://drive.google.com/drive/my-drive';

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
              (window as any).triggerRedirectLoader(targetLink, tool.name);
            } else {
              window.open(targetLink, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <Tag
              key={tool.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group text-white cursor-default"
            >
              {/* Background Image of Cid Kagenou with purple gradient blending */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={bgImage} 
                  alt="" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90 saturate-[0.50] group-hover:saturate-[0.70] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-neutral-950/40 to-black/20 group-hover:from-black/95 group-hover:via-neutral-900/35 group-hover:to-black/25 transition-all duration-350 z-10" />
              </div>

              {/* Top part / main content */}
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 border border-white/20 group-hover:border-purple-500/50 transition-colors bg-black/40 group-hover:bg-neutral-900 text-purple-400 shrink-0 relative z-10 shadow-lg rounded">
                    {getIcon(tool.category)}
                  </div>
                  <div className="flex items-center gap-1.55">
                    <span className="text-[8px] font-mono font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 px-1.5 py-0.5 group-hover:bg-purple-500 group-hover:text-black transition-all duration-300 rounded mr-1">
                      V{tool.version}
                    </span>
                    <button
                      onClick={handleClick}
                      className="cursor-pointer p-1 rounded hover:bg-neutral-800/40 transition-colors"
                      title="Open External Link"
                    >
                      <ExternalLink size={14} className="opacity-45 group-hover:opacity-100 transition-opacity text-neutral-400 group-hover:text-purple-300" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-2 text-neutral-100 group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                
                <div className="mt-auto pt-6 flex justify-end">
                  <button
                    onClick={handleClick}
                    className="h-10 w-10 shrink-0 flex items-center justify-center border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-none transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400"
                    title="Download File"
                  >
                    <Download size={14} className="shrink-0" />
                  </button>
                </div>
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
