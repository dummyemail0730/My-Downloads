import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { ExternalLink, Download, Cpu, Database, Terminal } from 'lucide-react';
import { Project } from '../types';
import { getDownloadCount, incrementDownloadCount } from '../utils/downloadTracker';

import shadowOnRoof from '../assets/images/shadow_on_roof_1779250618867.png';
import shadowDarkBlade from '../assets/images/shadow_dark_blade_1779250640689.png';
import shadowMysteriousAura from '../assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowMoonRain from '../assets/images/shadow_moon_rain_1779250676888.png';
import shadowNeonElectricity from '../assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';

const resolveImage = (imgSrc: any) => {
  if (!imgSrc) return null;
  if (typeof imgSrc !== 'string') return imgSrc;
  
  const lower = imgSrc.toLowerCase();
  if (lower.includes('shadow_on_roof')) return shadowOnRoof;
  if (lower.includes('shadow_dark_blade')) return shadowDarkBlade;
  if (lower.includes('shadow_mysterious_aura')) return shadowMysteriousAura;
  if (lower.includes('shadow_moon_rain')) return shadowMoonRain;
  if (lower.includes('shadow_neon_electricity')) return shadowNeonElectricity;
  if (lower.includes('shadow_clock_tower')) return shadowClockTower;
  
  return imgSrc;
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
      .filter((proj: Project) => !deletedIds.includes(proj.id))
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

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-neutral-900">
        {projects.map((project, idx) => {
          const Tag = motion.div;
          const fallbackBgImages = [
            shadowOnRoof,
            shadowDarkBlade,
            shadowMysteriousAura,
            shadowMoonRain,
            shadowNeonElectricity,
            shadowClockTower
          ];
          const bgImage = resolveImage(project.image) || fallbackBgImages[idx % fallbackBgImages.length];
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
              {bgImage && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={bgImage} 
                    alt="" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-90 saturate-[0.50] group-hover:saturate-[0.70] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-neutral-950/40 to-black/20 group-hover:from-black/95 group-hover:via-neutral-900/35 group-hover:to-black/25 transition-all duration-350 z-10" />
                </div>
              )}

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
