import { motion } from 'motion/react';
import { TOOLS } from '../constants';
import { Terminal, Cpu, Database } from 'lucide-react';

const getIcon = (category: string) => {
  switch (category) {
    case 'DevOps': return <Cpu size={18} />;
    case 'Data': return <Database size={18} />;
    default: return <Terminal size={18} />;
  }
};

export default function ToolsView() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-black grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 shrink-0">
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Technical Toolkit</h3>
          <p className="text-[10px] opacity-60 font-bold uppercase tracking-tight">
            Modular scripts, internal utilities, and experimental libraries.
          </p>
        </div>
        <div className="flex items-center md:justify-end gap-2 text-[9px] font-mono uppercase tracking-widest opacity-40 italic">
          [System_Init // Core_Lib_V4]
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-black">
        {TOOLS.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-5 bg-white border-r border-b border-black group hover:bg-black hover:text-white transition-colors cursor-default"
          >
            <div className="mt-1 p-2 border border-black group-hover:border-white transition-colors">
              {getIcon(tool.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black uppercase tracking-tighter">{tool.name}</h3>
                <span className="text-[8px] font-mono font-bold bg-black text-white px-1 py-0.5 group-hover:bg-white group-hover:text-black">
                  V{tool.version}
                </span>
              </div>
              <p className="text-[10px] opacity-60 font-medium mb-3 group-hover:opacity-80 leading-tight">
                {tool.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-black border-b border-black group-hover:border-white">
                  SYS://{tool.category.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
