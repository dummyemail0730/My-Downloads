import { motion } from 'motion/react';
import { ArrowLeft, Target, User, Heart } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Tab[];
  onHomeClick: () => void;
  onShowOwnerClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, tabs, onHomeClick, onShowOwnerClick }: SidebarProps) {
  return (
    <nav className="w-28 md:w-72 border-r border-neutral-900 flex flex-col bg-bg-sidebar shrink-0">
      <div className="p-3 md:p-6 border-b border-neutral-900">
        <p className="hidden md:block text-[11px] font-black uppercase mb-4 opacity-40 tracking-widest text-neutral-400">Navigation</p>
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex flex-col md:flex-row items-center justify-center md:justify-between px-1 md:px-4 py-3 md:py-3 border rounded-lg transition-all duration-350 group relative min-h-[58px] md:min-h-0
                    ${isActive 
                      ? 'bg-purple-950/40 text-white font-black border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.55)]' 
                      : 'border-purple-500/25 bg-neutral-900/50 shadow-[0_0_8px_rgba(168,85,247,0.15)] hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.35)] text-neutral-400 hover:text-white hover:bg-purple-950/10 font-bold'
                    }
                  `}
                >
                  {/* Desktop Label */}
                  <span className="hidden md:block uppercase text-xs tracking-tighter w-full text-left whitespace-nowrap overflow-hidden text-ellipsis">
                    {tab.label}
                  </span>
                  {/* Mobile Label */}
                  <span className="md:hidden uppercase text-[10px] font-mono tracking-wider font-extrabold block select-none">
                    {tab.label}
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

      <div className="flex-1 p-2 md:p-6 flex flex-col justify-end">
        <div className="mb-4 space-y-4 md:space-y-4">
          <button 
            onClick={() => setActiveTab('SUSTAIN')}
            className={`w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 pb-1 md:pb-0 group transition-all duration-300 ${
              activeTab === 'SUSTAIN' 
                ? 'text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
              activeTab === 'SUSTAIN'
                ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-neutral-900/50 border-purple-500/25 text-neutral-400 group-hover:text-purple-400 group-hover:border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]'
            }`}>
              <Heart className="w-4 h-4 text-purple-400" />
            </div>
            <span className="font-mono text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider leading-[1.15] text-center md:text-left block cursor-pointer">
              <span className="md:hidden">SUSTAIN<br/>SHADOWS</span>
              <span className="hidden md:inline">Sustain the Shadows</span>
            </span>
          </button>

          <button 
            onClick={onShowOwnerClick}
            className="w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 pb-1 md:pb-0 group transition-all duration-305 text-neutral-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900/50 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/50 transition-all shadow-[0_0_8px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_12px_rgba(168,85,247,0.35)] shrink-0">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <span className="font-mono text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider leading-[1.15] text-center md:text-left block cursor-pointer">
              <span className="md:hidden">OWNER<br/>CONTACT</span>
              <span className="hidden md:inline">Owner Contact Info</span>
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
