import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import MusicView from './components/MusicView';
import ISOView from './components/ISOView';
import ToolsView from './components/ToolsView';

const TABS = [
  { id: 'SOFTWARE', label: '01 Software' },
  { id: 'MUSIC', label: '02 Music' },
  { id: 'ISO', label: '03 Photography' },
  { id: 'TOOLS', label: '04 Dev Tools' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('SOFTWARE');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'SOFTWARE':
        return <SoftwareView />;
      case 'MUSIC':
        return <MusicView />;
      case 'ISO':
        return <ISOView />;
      case 'TOOLS':
        return <ToolsView />;
      default:
        return <SoftwareView />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-hidden relative">
        
        {/* Header Section */}
        <header className="h-24 border-b border-black flex items-center justify-between px-8 bg-white shrink-0 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Archive Repository</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Design & Development / 2026 Edition</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-mono font-bold tracking-tighter text-black uppercase">ST_V.09.26</span>
            <span className="text-[10px] uppercase opacity-50 font-medium">Last Modified: MAY 2026</span>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar / Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            tabs={TABS} 
          />

          {/* Content Area */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-4 md:p-6 border-b border-black flex items-end justify-between bg-bg-card shrink-0">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                {activeTab.replace('_', ' ')}
              </h2>
              <div className="text-right flex flex-col items-end">
                <p className="text-[9px] uppercase font-black opacity-40">SECTION</p>
                <p className="text-xl md:text-2xl font-mono leading-none font-bold">
                  {TABS.find(t => t.id === activeTab)?.label.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Footer Bar */}
        <footer className="h-10 border-t border-black flex items-center justify-between px-8 bg-black text-white text-[9px] uppercase tracking-[0.2em] shrink-0 overflow-hidden">
          <div className="flex gap-4 md:gap-8">
            <span className="hidden sm:inline">LOCAL: {currentTime}</span>
            <span>STATUS: READY_FOR_HIRE</span>
          </div>
          <div className="flex gap-4 md:gap-8">
            <a href="#" className="hover:text-gray-400 transition-colors">GITHUB://ADRIAN</a>
            <a href="#" className="hidden sm:inline hover:text-gray-400 transition-colors">MAIL://HELO@ARCHIVE</a>
          </div>
        </footer>
    </div>
  );
}

