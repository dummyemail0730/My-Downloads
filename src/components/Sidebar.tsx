import { motion } from 'motion/react';
import { ArrowLeft, Target } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Tab[];
  onHomeClick: () => void;
  onExpertiseClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, tabs, onHomeClick, onExpertiseClick }: SidebarProps) {
  return (
    <nav className="w-20 md:w-72 border-r border-black flex flex-col bg-bg-sidebar shrink-0">
      <div className="p-4 md:p-6 border-b border-black">
        <p className="hidden md:block text-[11px] font-black uppercase mb-4 opacity-40 tracking-widest">Navigation</p>
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-2 md:px-4 py-3 border border-transparent transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-black text-white font-black' 
                      : 'hover:border-black text-gray-500 hover:text-black font-bold'
                    }
                  `}
                >
                  <span className="uppercase text-[10px] md:text-xs tracking-tighter">
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                  </span>
                  {isActive && (
                    <motion.span 
                      layoutId="activeIndicator"
                      className="hidden md:inline text-[10px]"
                    >
                      ●
                    </motion.span>
                  )}
                  {!isActive && (
                    <span className="hidden md:inline opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                      ○
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex-1 p-4 md:p-6 flex flex-col justify-end">
        <div className="mb-6 space-y-4">
          <button 
            onClick={onHomeClick}
            className="flex items-center gap-2 group transition-opacity opacity-60 hover:opacity-100"
          >
            <div className="w-4 h-4 bg-black flex items-center justify-center text-white">
              <ArrowLeft className="w-3 h-3" />
            </div>
            <span className="hidden md:inline font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Return_Home
            </span>
          </button>

          <button 
            onClick={onExpertiseClick}
            className={`flex items-center gap-2 group transition-opacity ${activeTab === 'EXPERTISE' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className="w-4 h-4 bg-black flex items-center justify-center text-white">
              <Target className="w-3 h-3" />
            </div>
            <span className="hidden md:inline font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Areas_of_Expertise
            </span>
          </button>
        </div>
        <div className="border-t border-black pt-6 opacity-30 hidden md:block">
          <p className="text-[9px] font-mono leading-relaxed uppercase tracking-tighter">
            Geometric Balance // System Architecture v.4.0.1
            <br />
            Selected blocks from the archive repository component library.
          </p>
        </div>
      </div>
    </nav>
  );
}
