import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { ExternalLink, Download, Cpu, Database, Terminal } from 'lucide-react';
import { Project } from '../types';
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';

// Import technical/software specific backgrounds
import computerSoftwareBg from '../assets/images/computer_software_bg_1781345966685.jpg';
import intelCpuBg from '../assets/images/intel_cpu_bg_1781341674798.jpg';
import hardwareBg from '../assets/images/hardware_background_1779204942117.png';
import systemRecoveryBg from '../assets/images/system_recovery_bg_1779205058378.png';
import shadowTechMagic from '../assets/images/shadow_tech_magic_1780090755590.png';

import cyberTerminalBg from '../assets/images/cyber_terminal_tool_bg_1781609678510.jpg';
import hardwareDiagnosticsBg from '../assets/images/hardware_diagnostics_bg_1781609697998.jpg';
import softwareCodeMatrixBg from '../assets/images/software_code_matrix_bg_1781610295283.jpg';
import serverRackDatabaseBg from '../assets/images/server_rack_database_bg_1781610314139.jpg';
import osDesktopGuiBg from '../assets/images/os_desktop_gui_bg_1781610329859.jpg';

// Import newly generated high-quality original computer backgrounds
import highTechLaptopBg from '../assets/images/high_tech_laptop_recovery_bg_1781612911261.jpg';
import cyberDesktopBg from '../assets/images/cyber_desktop_setup_bg_1781612930975.jpg';
import biosSetupBg from '../assets/images/bios_setup_screen_bg_1781612949476.jpg';
import internalPcBg from '../assets/images/internal_pc_motherboard_bg_1781612967173.jpg';

const resolveComputerImage = (project: Project, fallbackImg: any) => {
  const title = (project.title || '').toLowerCase();
  const tags = (project.tags || []).map(t => t.toLowerCase());
  const desc = (project.description || '').toLowerCase();

  // 1. Windows ISOs / operating systems
  if (title.includes('w11') || title.includes('windows 11')) {
    return osDesktopGuiBg;
  }
  if (title.includes('w10') || title.includes('windows 10') || title.includes('spectre')) {
    return systemRecoveryBg;
  }

  // 2. Office Suites
  if (title.includes('office') || title.includes('microsoft') || desc.includes('productivity') || tags.includes('office')) {
    return computerSoftwareBg;
  }

  // 3. Coding / Script / Omni Script
  if (title.includes('script') || title.includes('omni') || tags.includes('llvm') || tags.includes('compiler')) {
    return softwareCodeMatrixBg;
  }

  // 4. CMS / Database / Backend
  if (title.includes('cms') || tags.includes('postgresql') || tags.includes('database') || title.includes('aether')) {
    return serverRackDatabaseBg;
  }

  // Fallback
  return fallbackImg;
};

const getSoftwareIcon = (tags: string[]) => {
  const allTags = (tags || []).map(t => t.toUpperCase());
  if (allTags.some(t => t.includes('OFFICE') || t.includes('PRODUCTIVITY') || t.includes('DRIVE'))) {
    return <Database size={18} />;
  }
  if (allTags.some(t => t.includes('GO') || t.includes('POSTGRESQL') || t.includes('API') || t.includes('CMS'))) {
    return <Database size={18} />;
  }
  if (allTags.some(t => t.includes('LLVM') || t.includes('COMPILER') || t.includes('GENERATIVE') || t.includes('SCRIPT'))) {
    return <Terminal size={18} />;
  }
  return <Cpu size={18} />;
};

export default function SoftwareView() {
  const loadProjects = () => {
    const saved = localStorage.getItem('custom_projects');
    let loaded = saved ? JSON.parse(saved) : [...STATIC_PROJECTS];
    const deletedIds = JSON.parse(localStorage.getItem('deleted_item_ids') || '[]');
    
    // Ensure static projects are always merged even if custom_projects exists
    if (saved && Array.isArray(loaded)) {
      const loadedIds = new Set(loaded.map((p: any) => p.id));
      for (const staticProj of STATIC_PROJECTS) {
        if (!loadedIds.has(staticProj.id) && !deletedIds.includes(staticProj.id)) {
          loaded.push(staticProj);
        }
      }
    }

    const mapped = loaded
      .filter((proj: Project) => {
        if (deletedIds.includes(proj.id)) return false;
        const normTitle = proj.title?.toLowerCase() || '';
        if (normTitle.includes('episode 16') || normTitle.includes('episode 18')) return false;
        return true;
      })
      .map((proj: Project) => {
        // Find the corresponding static project to merge newly updated details/assets
        const staticProj = STATIC_PROJECTS.find(p => p.id === proj.id || (p.title && proj.title && p.title.toLowerCase().trim() === proj.title.toLowerCase().trim()));
        if (staticProj) {
          const isDbPlaceholder = proj.description?.includes('database') || proj.tags?.includes('C++');
          return {
            ...staticProj,
            description: isDbPlaceholder ? staticProj.description : (proj.description || staticProj.description),
            link: proj.link || staticProj.link,
            tags: isDbPlaceholder ? staticProj.tags : (proj.tags || staticProj.tags)
          };
        }
        // Return custom projects completely (with a fallback empty tags array)
        return {
          ...proj,
          tags: proj.tags || []
        };
      });

    // Deduplicate by title to ensure same name always merges
    const deduplicated: Project[] = [];
    const seenTitles = new Set<string>();

    for (const proj of mapped) {
      if (!proj || !proj.title) continue;
      const normTitle = proj.title.trim().toLowerCase();
      if (!seenTitles.has(normTitle)) {
        seenTitles.add(normTitle);
        deduplicated.push(proj);
      } else {
        // Merge item with existing index
        const idx = deduplicated.findIndex(p => p.title.trim().toLowerCase() === normTitle);
        if (idx !== -1) {
          const existing = deduplicated[idx];
          deduplicated[idx] = {
            ...existing,
            ...proj,
            image: existing.image || proj.image,
            description: (proj.description && proj.description.length > (existing.description?.length || 0)) ? proj.description : existing.description,
            link: (proj.link && !proj.link.includes('github.500') && !proj.link.includes('drive.google.com/drive/my-drive') && proj.link !== 'https://drive.google.com') ? proj.link : existing.link,
            tags: Array.from(new Set([...(existing.tags || []), ...(proj.tags || [])]))
          };
        }
      }
    }

    return deduplicated;
  };

  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [downloadSync, setDownloadSync] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setProjects(loadProjects());
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

  const defaultLinks: { [key: string]: string } = {
    '1': 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing',
    '2': 'https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing',
    '3': 'https://drive.google.com/drive/folders/1PQ2CG9rLB1QbtbcaR8z0T37qUl0J0e_1?usp=sharing',
    '4': 'https://github.com/topics/omniscript',
    '5': 'https://github.com/topics/headless-cms',
  };

  const resolvedBgImages = useMemo(() => {
    const fallbackBgImages = [
      highTechLaptopBg,
      cyberDesktopBg,
      biosSetupBg,
      internalPcBg,
      computerSoftwareBg,
      intelCpuBg,
      hardwareBg,
      systemRecoveryBg,
      cyberTerminalBg,
      hardwareDiagnosticsBg,
      softwareCodeMatrixBg,
      serverRackDatabaseBg,
      osDesktopGuiBg
    ];
    const result: any[] = [];
    projects.forEach((project, idx) => {
      let chosen = resolveComputerImage(project, fallbackBgImages[idx % fallbackBgImages.length]);
      
      // Avoid matching previous items to ensure maximum distribution and no repetition in grid
      const prev1 = idx >= 1 ? result[idx - 1] : null;
      const prev2 = idx >= 2 ? result[idx - 2] : null;
      const prev3 = idx >= 3 ? result[idx - 3] : null;
      
      if (chosen === prev1 || chosen === prev2 || chosen === prev3) {
        // Shift to another one that doesn't match any of the last 3 elements
        let altIndex = (idx + 1) % fallbackBgImages.length;
        for (let attempt = 0; attempt < fallbackBgImages.length; attempt++) {
          const candidate = fallbackBgImages[(altIndex + attempt) % fallbackBgImages.length];
          if (candidate !== prev1 && candidate !== prev2 && candidate !== prev3) {
            chosen = candidate;
            break;
          }
        }
      }
      result.push(chosen);
    });
    return result;
  }, [projects]);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-900">
        {projects.map((project, idx) => {
          const Tag = motion.div;
          const bgImage = resolvedBgImages[idx];
          const targetLink = project.link || defaultLinks[project.id] || 'https://drive.google.com/drive/my-drive';

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
              (window as any).triggerRedirectLoader(targetLink, project.title);
            } else {
              window.open(targetLink, '_blank', 'noopener,noreferrer');
            }
          };

          const handleDownloadClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            incrementDownloadCount('software', project.id, project.title);
            if (typeof window !== 'undefined' && (window as any).logUserMovement) {
              (window as any).logUserMovement('action', `Downloaded "${project.title}" from Software Archive`);
            }
            handleClick(e);
          };

          return (
            <Tag
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group text-white cursor-default"
            >
              {/* Original Cybernetic Tech Matrix Background */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-850">
                {bgImage && (
                  <img 
                    src={bgImage} 
                    alt="" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100 brightness-[0.80] group-hover:brightness-[0.95] saturate-[0.80] group-hover:saturate-[1.0] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Tech circuit lines & grid mesh overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                  <defs>
                    <pattern id={`grid-${project.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-500" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} />
                  {/* Glowing custom circuit lines */}
                  <path d="M 10 10 L 100 10 L 120 30 M 200 80 L 150 130 H 250" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400 animate-pulse" />
                </svg>

                {/* Cybernetic code elements / floating status bits */}
                <div className="absolute top-2 right-4 font-mono text-[7px] text-cyan-500/20 group-hover:text-cyan-400/40 select-none pointer-events-none transition-colors duration-300">
                  <span>SYS_KERN_ADDR_0x{(idx * 163 + 4729).toString(16).toUpperCase()}</span>
                  <br />
                  <span>INTEGRITY_SAFE</span>
                </div>

                {/* Interactive Cyan pulse background glow */}
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 blur-[60px] transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 border border-white/20 group-hover:border-cyan-500/50 transition-colors bg-black/40 group-hover:bg-neutral-900 text-cyan-400 shrink-0 relative z-10 shadow-lg rounded">
                    {getSoftwareIcon(project.tags)}
                  </div>
                  <div className="flex items-center gap-1.55">
                    {project.tags && project.tags.length > 0 && (
                      <span className="text-[8px] font-mono font-bold bg-neutral-900 text-cyan-300 border border-neutral-800 px-1.5 py-0.5 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300 rounded mr-1 uppercase">
                        {project.tags[0]}
                      </span>
                    )}
                    <button
                      onClick={handleClick}
                      className="cursor-pointer p-1 rounded hover:bg-neutral-800/40 transition-colors"
                      title="Open External Link"
                    >
                      <ExternalLink size={14} className="opacity-45 group-hover:opacity-100 transition-opacity text-neutral-400 group-hover:text-cyan-300" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black uppercase tracking-wide leading-tight mb-2 text-neutral-100 group-hover:text-cyan-300 transition-colors">
                  {project.title}
                </h3>
                
                <div className="mt-auto pt-6 flex justify-end">
                  <button
                    onClick={handleDownloadClick}
                    className="h-10 px-3.5 shrink-0 flex items-center justify-center gap-2 border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.12)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:border-cyan-400 font-mono text-[11px] font-extrabold uppercase tracking-wide"
                    title="Download File"
                  >
                    <Download size={14} className="shrink-0" />
                    <span>{getDownloadCount('software', project.id, project.title)}</span>
                  </button>
                </div>
              </div>
            </Tag>
          );
        })}
        {/* Empty filler blocks to maintain grid-cols-3 bento-grid integrity */}
        {(projects.length % 3 !== 0) && Array.from({ length: 3 - (projects.length % 3) }).map((_, i) => (
          <div key={`filler-${i}`} className="border-b border-neutral-900 border-r border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r-0"></div>
        ))}
      </div>
    </div>
  );
}
