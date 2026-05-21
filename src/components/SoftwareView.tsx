import { useState } from 'react';
import { motion } from 'motion/react';
import { PROJECTS as STATIC_PROJECTS } from '../constants';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';

export default function SoftwareView() {
  const [projects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('custom_projects');
    const loaded = saved ? JSON.parse(saved) : STATIC_PROJECTS;
    return loaded
      .filter((proj: Project) => STATIC_PROJECTS.some(p => p.id === proj.id))
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
        return proj;
      });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full border-b border-neutral-900 bg-neutral-950">
      {projects.map((project, idx) => {
        const hasBgImage = !!project.image;
        const Tag = project.link ? motion.a : motion.div;
        return (
          <Tag
            key={project.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            {...(project.link ? {
              href: project.link,
              target: "_blank",
              rel: "noopener noreferrer"
            } : {})}
            className={`border-r border-b border-neutral-900 p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${
              project.link ? 'cursor-pointer' : 'cursor-default'
            } ${
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

            <div className="relative z-10">
              <div className={`w-8 h-1 mb-4 transition-colors ${
                hasBgImage ? 'bg-cyan-400 group-hover:bg-cyan-300' : 'bg-purple-500 group-hover:bg-purple-400'
              }`}></div>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-xl font-black uppercase tracking-tighter leading-tight transition-colors ${
                  hasBgImage ? 'text-white' : 'text-neutral-100 group-hover:text-purple-300'
                }`}>
                  {project.title}
                </h3>
                {project.link && (
                  <ExternalLink size={16} className={`transition-opacity ${
                    hasBgImage ? 'opacity-70 group-hover:opacity-100 text-white' : 'opacity-40 group-hover:opacity-100 text-neutral-400 group-hover:text-purple-300'
                  }`} />
                )}
              </div>
              <p className={`text-[11px] leading-relaxed max-w-sm font-medium transition-colors ${
                hasBgImage ? 'text-neutral-300' : 'text-neutral-400 group-hover:text-neutral-200'
              }`}>
                {project.description}
              </p>
            </div>
            <div className={`mt-8 flex justify-between items-end border-t pt-3 transition-colors relative z-10 ${
              hasBgImage ? 'border-white/10' : 'border-neutral-800 group-hover:border-neutral-700'
            }`}>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span 
                    key={tag} 
                    className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded transition-colors ${
                      hasBgImage 
                        ? 'bg-cyan-950/50 text-cyan-300 group-hover:bg-cyan-950/70 border border-cyan-500/20' 
                        : 'bg-neutral-950/60 text-neutral-300 border border-neutral-800/80 group-hover:bg-neutral-800 group-hover:text-white'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase transition-colors ${
                hasBgImage ? 'text-neutral-400' : 'text-neutral-500 group-hover:text-neutral-300'
              }`}>
                BUILD://{project.id.length < 3 && !isNaN(Number(project.id)) ? project.id.padStart(2, '0') : 'CUSTOM'}
              </span>
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
