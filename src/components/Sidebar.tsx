import { motion } from 'motion/react';
import { ArrowLeft, Target, User } from 'lucide-react';

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
  onShowOwnerClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, tabs, onHomeClick, onExpertiseClick, onShowOwnerClick }: SidebarProps) {
  return (
    <nav className="w-20 md:w-72 border-r border-neutral-900 flex flex-col bg-bg-sidebar shrink-0">
      <div className="p-4 md:p-6 border-b border-neutral-900">
        <p className="hidden md:block text-[11px] font-black uppercase mb-4 opacity-40 tracking-widest text-neutral-400">Navigation</p>
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-2 md:px-4 py-3 border border-transparent transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-neutral-900 text-white font-black border-neutral-800' 
                      : 'hover:border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900/60 font-bold'
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
                      className="hidden md:inline text-[10px] text-purple-400"
                    >
                      ●
                    </motion.span>
                  )}
                  {!isActive && (
                    <span className="hidden md:inline opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-neutral-600">
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
            className="flex items-center gap-2 group transition-opacity opacity-60 hover:opacity-100 text-neutral-300 hover:text-white"
          >
            <div className="w-4 h-4 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white">
              <ArrowLeft className="w-3 h-3" />
            </div>
            <span className="hidden md:inline font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Return_Home
            </span>
          </button>

          <button 
            onClick={onExpertiseClick}
            className={`flex items-center gap-2 group transition-opacity ${activeTab === 'EXPERTISE' ? 'opacity-100 text-white' : 'opacity-60 hover:opacity-100 text-neutral-300 hover:text-white'}`}
          >
            <div className="w-4 h-4 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white">
              <Target className="w-3 h-3" />
            </div>
            <span className="hidden md:inline font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Areas_of_Expertise
            </span>
          </button>

          <button 
            onClick={onShowOwnerClick}
            className="flex items-center gap-2 group transition-opacity opacity-60 hover:opacity-100 text-neutral-300 hover:text-white"
          >
            <div className="w-4 h-4 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-white">
              <User className="w-3 h-3 text-purple-400" />
            </div>
            <span className="hidden md:inline font-mono text-[10px] font-bold uppercase tracking-tighter cursor-pointer">
              Owner Contact Info
            </span>
          </button>
        </div>
        <div className="border-t border-neutral-900 pt-6 opacity-30 hidden md:block text-neutral-400">
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
