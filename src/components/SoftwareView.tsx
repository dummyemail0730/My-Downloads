import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { ExternalLink, Download } from 'lucide-react';
import { Project } from '../types';

export default function SoftwareView() {
  const [projects] = useState<Project[]>(() => {
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

    return loaded
      .filter((proj: Project) => !deletedIds.includes(proj.id))
      .map((proj: Project) => {
        // Find the corresponding static project to merge newly updated details/assets
        const staticProj = STATIC_PROJECTS.find(p => p.id === proj.id);
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
  });

  const defaultLinks: { [key: string]: string } = {
    '1': 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing',
    '2': 'https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing',
    '3': 'https://drive.google.com/drive/folders/1PQ2CG9rLB1QbtbcaR8z0T37qUl0J0e_1?usp=sharing',
    '4': 'https://github.com/topics/omniscript',
    '5': 'https://github.com/topics/headless-cms',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-full border-b border-neutral-900 bg-neutral-950">
      {projects.map((project, idx) => {
        const hasBgImage = !!project.image;
        const Tag = motion.div;
        
        const targetLink = project.link || defaultLinks[project.id] || 'https://drive.google.com/drive/my-drive';

        const handleClick = (e: React.MouseEvent) => {
          e.preventDefault();
          if (typeof window !== 'undefined' && (window as any).triggerRedirectLoader) {
            (window as any).triggerRedirectLoader(targetLink, project.title);
          } else {
            window.open(targetLink, '_blank', 'noopener,noreferrer');
          }
        };

        return (
          <Tag
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`border-r border-b border-neutral-900 p-5 flex flex-col relative overflow-hidden transition-all duration-300 group cursor-default min-h-[200px] md:min-h-[240px] ${
              hasBgImage 
                ? 'bg-neutral-950 text-white' 
                : 'bg-neutral-900/35 hover:bg-neutral-900/80 text-white'
            }`}
          >
            {project.image && (
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={project.image} 
                  alt="" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-[0.75] group-hover:brightness-[0.85]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 group-hover:from-black/95 group-hover:via-black/60 group-hover:to-black/35 transition-all duration-300" />
              </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col">
              <div className={`w-8 h-1 mb-4 transition-colors ${
                hasBgImage ? 'bg-cyan-400 group-hover:bg-cyan-300' : 'bg-purple-500 group-hover:bg-purple-400'
              }`}></div>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight transition-colors ${
                  hasBgImage ? 'text-white' : 'text-neutral-100 group-hover:text-purple-300'
                }`}>
                  {project.title}
                </h3>
                <button
                  onClick={handleClick}
                  className="cursor-pointer p-1 rounded hover:bg-neutral-800/40 transition-colors"
                  title="Open External Link"
                >
                  <ExternalLink size={16} className={`transition-opacity ${
                    hasBgImage ? 'opacity-70 group-hover:opacity-100 text-white' : 'opacity-40 group-hover:opacity-100 text-neutral-400 group-hover:text-purple-300'
                  }`} />
                </button>
              </div>
              
              <div className="mt-auto pt-6 flex justify-end">
                <button
                  onClick={handleClick}
                  className={`h-10 w-10 shrink-0 flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-md rounded-none ${
                    hasBgImage
                      ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.12)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:border-cyan-400'
                      : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-300 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:border-purple-400'
                  }`}
                  title="Download File"
                >
                  <Download size={14} className="shrink-0" />
                </button>
              </div>
            </div>
          </Tag>
        );
      })}
      {/* Empty filler block to maintain grid integrity if needed */}
      {(projects.length % 3 !== 0) && Array.from({ length: 3 - (projects.length % 3) }).map((_, i) => (
        <div key={`filler-${i}`} className="border-b border-neutral-900 p-5 hidden lg:block bg-neutral-900/10 last:border-r border-r border-neutral-900"></div>
      ))}
    </div>
  );
}
