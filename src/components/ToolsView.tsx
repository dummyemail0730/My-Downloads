import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { TOOLS as STATIC_TOOLS } from '../constants';
import { Terminal, Cpu, Database, ExternalLink, Download } from 'lucide-react';
import { Tool } from '../types';
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';

import cyberTerminalBg from '../assets/images/cyber_terminal_tool_bg_1781609678510.jpg';
import hardwareDiagnosticsBg from '../assets/images/hardware_diagnostics_bg_1781609697998.jpg';
import hardwareBg from '../assets/images/hardware_background_1779204942117.png';
import systemRecoveryBg from '../assets/images/system_recovery_bg_1779205058378.png';
import intelCpuBg from '../assets/images/intel_cpu_bg_1781341674798.jpg';
import computerSoftwareBg from '../assets/images/computer_software_bg_1781345966685.jpg';
import softwareCodeMatrixBg from '../assets/images/software_code_matrix_bg_1781610295283.jpg';
import serverRackDatabaseBg from '../assets/images/server_rack_database_bg_1781610314139.jpg';
import osDesktopGuiBg from '../assets/images/os_desktop_gui_bg_1781610329859.jpg';

// Import newly generated high-quality original computer backgrounds
import highTechLaptopBg from '../assets/images/high_tech_laptop_recovery_bg_1781612911261.jpg';
import cyberDesktopBg from '../assets/images/cyber_desktop_setup_bg_1781612930975.jpg';
import biosSetupBg from '../assets/images/bios_setup_screen_bg_1781612949476.jpg';
import internalPcBg from '../assets/images/internal_pc_motherboard_bg_1781612967173.jpg';

const TECH_TOOL_BG_IMAGES = [
  highTechLaptopBg,          // Distinct Laptop computer screen running diagnostics
  cyberDesktopBg,            // Distinct dual ultra-wide curved monitor gaming/workstation desktop
  biosSetupBg,               // Distinct UEFI BIOS hardware configuration terminal screenshot
  internalPcBg,              // Distinct water-cooled transparent PC chassis interior with RGB lighting
  cyberTerminalBg,           // Cyber-punk coding terminal focus
  hardwareDiagnosticsBg,     // Micro-circuits diagnostic graph screen
  osDesktopGuiBg,            // Operating System recovery GUI view showing system folders
  intelCpuBg,                // CPU chip circuit layout close-up
  serverRackDatabaseBg,      // Giant data-center flash arrays
  systemRecoveryBg,          // Windows recovery boot screen layout
  hardwareBg,
  computerSoftwareBg,
  softwareCodeMatrixBg
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
  const loadTools = () => {
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

    const mapped = loaded
      .filter((tool: Tool) => !deletedIds.includes(tool.id))
      .map((tool: Tool) => {
        const staticTool = STATIC_TOOLS.find(t => t.id === tool.id || (t.name && tool.name && t.name.toLowerCase().trim() === tool.name.toLowerCase().trim()));
        if (staticTool) {
          return {
            ...staticTool,
            description: tool.description || staticTool.description,
            link: tool.link || staticTool.link,
            category: tool.category || staticTool.category,
            version: tool.version || staticTool.version
          };
        }
        return tool;
      });

    // Deduplicate by name to ensure same name always merges
    const deduplicated: Tool[] = [];
    const seenNames = new Set<string>();

    for (const tool of mapped) {
      if (!tool || !tool.name) continue;
      const normName = tool.name.trim().toLowerCase();
      if (!seenNames.has(normName)) {
        seenNames.add(normName);
        deduplicated.push(tool);
      } else {
        const idx = deduplicated.findIndex(t => t.name.trim().toLowerCase() === normName);
        if (idx !== -1) {
          const existing = deduplicated[idx];
          let mergedVersion = existing.version || tool.version;
          if (tool.version && tool.version !== 'V' && tool.version !== 'v' && tool.version !== '') {
            mergedVersion = tool.version;
          }
          deduplicated[idx] = {
            ...existing,
            ...tool,
            description: (tool.description && tool.description.length > (existing.description?.length || 0)) ? tool.description : existing.description,
            link: (tool.link && !tool.link.includes('drive.google.com/drive/my-drive') && tool.link !== 'https://drive.google.com') ? tool.link : existing.link,
            version: mergedVersion,
            category: (tool.category && tool.category.length > (existing.category?.length || 0)) ? tool.category : existing.category
          };
        }
      }
    }

    return deduplicated;
  };

  const [tools, setTools] = useState<Tool[]>(loadTools);
  const [downloadSync, setDownloadSync] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setTools(loadTools());
    };
    const handleDownloadSync = () => {
      setDownloadSync(prev => prev + 1);
    };
    window.addEventListener('shadow_sync_update', handleSync);
    window.addEventListener('shadow_download_sync', handleDownloadSync);
    return () => {
      window.removeEventListener('shadow_sync_update', handleSync);
      window.removeEventListener('shadow_download_sync', handleDownloadSync);
    };
  }, []);

  const defaultToolLinks: { [key: string]: string } = {
    '1': 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing',
    '2': 'https://www.3dpchip.com',
    '3': 'https://www.wagnardsoft.com/display-driver-uninstaller-ddu',
    '4': 'https://www.cpuid.com/softwares/cpu-z.html',
    '5': 'https://www.hwinfo.com/download/',
    '6': 'https://rufus.ie/en/',
    '7': 'https://github.com/topics/dashboard',
  };

  const resolvedBgImages = useMemo(() => {
    const result: any[] = [];
    tools.forEach((tool, idx) => {
      let chosen = TECH_TOOL_BG_IMAGES[idx % TECH_TOOL_BG_IMAGES.length];
      
      const prev1 = idx >= 1 ? result[idx - 1] : null;
      const prev2 = idx >= 2 ? result[idx - 2] : null;
      const prev3 = idx >= 3 ? result[idx - 3] : null;
      
      if (chosen === prev1 || chosen === prev2 || chosen === prev3) {
        let altIndex = (idx + 1) % TECH_TOOL_BG_IMAGES.length;
        for (let attempt = 0; attempt < TECH_TOOL_BG_IMAGES.length; attempt++) {
          const candidate = TECH_TOOL_BG_IMAGES[(altIndex + attempt) % TECH_TOOL_BG_IMAGES.length];
          if (candidate !== prev1 && candidate !== prev2 && candidate !== prev3) {
            chosen = candidate;
            break;
          }
        }
      }
      result.push(chosen);
    });
    return result;
  }, [tools]);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-900">
        {tools.map((tool, idx) => {
          const Tag = motion.div;
          const bgImage = resolvedBgImages[idx];

          const targetLink = tool.link || defaultToolLinks[tool.id] || 'https://drive.google.com/drive/my-drive';

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
              (window as any).triggerRedirectLoader(targetLink, tool.name);
            } else {
              window.open(targetLink, '_blank', 'noopener,noreferrer');
            }
          };

          const handleDownloadClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            incrementDownloadCount('tool', tool.id, tool.name);
            if (typeof window !== 'undefined' && (window as any).logUserMovement) {
              (window as any).logUserMovement('action', `Downloaded "${tool.name}" from Maintenance Tools`);
            }
            handleClick(e);
          };

          return (
            <Tag
              key={tool.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group text-white cursor-default"
            >
              {/* Original Tactical Console HUD Background */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950">
                {bgImage && (
                  <img 
                    src={bgImage} 
                    alt="" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-80 group-hover:opacity-95 brightness-[0.80] group-hover:brightness-[0.95] saturate-[0.80] group-hover:saturate-[1.0] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Tactical radar coordinate grids & aiming reticles */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                  {/* Concentric target circles on bottom-right corner */}
                  <circle cx="90%" cy="90%" r="50" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-500 stroke-dasharray-[4,4] animate-[spin_20s_infinite_linear]" />
                  <circle cx="90%" cy="90%" r="90" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-purple-400 stroke-dasharray-[8,4]" />
                  <circle cx="90%" cy="90%" r="130" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-300" />
                  
                  {/* Scope target crosshair */}
                  <path d="M 12 12 H 30 M 12 12 V 30 M 12 8 L 8 12 M 16 12 L 12 16" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-400/70" />
                  <text x="35" y="20" className="fill-purple-400/50 font-mono text-[7px]" letterSpacing="1">OPERATIVE_COORDS_ON_GRID</text>
                </svg>

                {/* Tactical Frame alignment brackets */}
                <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-purple-500/30 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-purple-500/30 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-purple-500/30 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-purple-500/30 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-300" />

                {/* Cyber Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(168,85,247,0.01),rgba(0,0,0,0),rgba(168,85,247,0.01))] bg-[size:100%_4px,6px_100%] pointer-events-none" />

                {/* Deep Purple Ambient Radial Light glow on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-700/[0.02] group-hover:bg-purple-500/[0.08] blur-[80px] transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
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

                <h3 className="text-xl font-black uppercase tracking-wide leading-tight mb-2 text-neutral-100 group-hover:text-purple-300 transition-colors">
                  {tool.name}
                </h3>
                
                <div className="mt-auto pt-6 flex justify-end">
                  <button
                    onClick={handleDownloadClick}
                    className="h-10 px-3.5 shrink-0 flex items-center justify-center gap-2 border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400 font-mono text-[11px] font-extrabold uppercase tracking-wide"
                    title="Download File"
                  >
                    <Download size={14} className="shrink-0" />
                    <span>{getDownloadCount('tool', tool.id, tool.name)}</span>
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
