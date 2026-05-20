import { useState } from 'react';
import { motion } from 'motion/react';
import { TOOLS as STATIC_TOOLS } from '../constants';
import { Terminal, Cpu, Database, ExternalLink } from 'lucide-react';
import { Tool } from '../types';

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
    const loaded = saved ? JSON.parse(saved) : STATIC_TOOLS;
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
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-black">
        {tools.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              if (tool.link) {
                window.open(tool.link, '_blank', 'noopener,noreferrer');
              }
            }}
            className={`flex items-start gap-4 p-5 bg-white border-r border-b border-black group hover:bg-black hover:text-white transition-colors select-none ${
              tool.link ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="mt-1 p-2 border border-black group-hover:border-white transition-colors bg-white group-hover:bg-neutral-900 text-black group-hover:text-white shrink-0">
              {getIcon(tool.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-lg font-black uppercase tracking-tighter truncate text-neutral-900 group-hover:text-white transition-colors">
                  {tool.name}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-mono font-bold bg-black text-white px-1.5 py-0.5 group-hover:bg-white group-hover:text-black transition-colors rounded">
                    V{tool.version}
                  </span>
                  {tool.link && (
                    <ExternalLink size={11} className="opacity-40 group-hover:opacity-100 transition-opacity text-neutral-400 group-hover:text-white" />
                  )}
                </div>
              </div>
              <p className="text-[10px] opacity-60 font-medium mb-3 group-hover:opacity-80 leading-tight">
                {tool.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-black border-b border-black group-hover:border-white transition-colors">
                  SYS://{tool.category.toUpperCase().slice(0, 15)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
