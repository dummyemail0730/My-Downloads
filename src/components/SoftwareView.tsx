import { motion } from 'motion/react';
import { PROJECTS } from '../constants';
import { ExternalLink } from 'lucide-react';

export default function SoftwareView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full border-b border-black">
      {PROJECTS.map((project, idx) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="border-r border-b border-black p-5 flex flex-col justify-between hover:bg-black hover:text-white transition-colors group cursor-pointer bg-white"
        >
          <div>
            <div className="w-8 h-1 bg-black group-hover:bg-white mb-4 transition-colors"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">
                {project.title}
              </h3>
              <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed max-w-sm font-medium">
              {project.description}
            </p>
          </div>
          <div className="mt-8 flex justify-between items-end border-t border-black/10 group-hover:border-white/20 pt-3 transition-colors">
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono uppercase tracking-widest bg-gray-100 group-hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase opacity-40 group-hover:opacity-100">
              BUILD://{project.id.padStart(2, '0')}
            </span>
          </div>
        </motion.div>
      ))}
      {/* Empty filler block to maintain grid integrity if needed */}
      {(PROJECTS.length % 3 !== 0) && Array.from({ length: 3 - (PROJECTS.length % 3) }).map((_, i) => (
        <div key={`filler-${i}`} className="border-b border-black p-5 hidden lg:block bg-gray-50/20 last:border-r"></div>
      ))}
    </div>
  );
}
