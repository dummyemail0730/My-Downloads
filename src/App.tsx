import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import MusicView from './components/MusicView';
import PhotosView from './components/PhotosView';
import ToolsView from './components/ToolsView';
import ExpertiseView from './components/ExpertiseView';
import ShadowProject from './components/ShadowProject';
import shadowBg from './assets/images/shadow_background_1779198051469.png';

const TABS = [
  { id: 'SOFTWARE', label: '01 Software' },
  { id: 'MUSIC', label: '02 Music' },
  { id: 'PHOTOS', label: '03 Photos' },
  { id: 'TOOLS', label: '04 End-User Tools' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('SOFTWARE');
  const [showArchive, setShowArchive] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (showArchive) {
      setIntroPlayed(true);
    }
  }, [showArchive]);

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
      case 'PHOTOS':
        return <PhotosView />;
      case 'TOOLS':
        return <ToolsView />;
      case 'EXPERTISE':
        return <ExpertiseView onBack={() => setShowArchive(false)} />;
      default:
        return <SoftwareView />;
    }
  };

  if (!showArchive) {
    return (
      <div className="h-screen w-full bg-black overflow-hidden flex items-center justify-center p-0 md:p-8">
        <div className="w-full h-full max-w-7xl bg-white border-[12px] md:border-[16px] border-black overflow-hidden relative shadow-2xl">
          <ShadowProject 
            onEnter={() => setShowArchive(true)} 
            hasPlayed={introPlayed}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-hidden relative">
        {/* Ambient Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none">
          <img 
            src={shadowBg} 
            alt="" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header Section */}
          <header className="h-24 border-b border-black flex items-center justify-between px-8 bg-white/90 backdrop-blur-sm shrink-0 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center cursor-default hover:bg-gray-800 transition-colors pointer-events-auto">
              <Folder className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Tech Archive</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Design & Development / 2026 Edition</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar / Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            tabs={TABS} 
            onHomeClick={() => setShowArchive(false)}
            onExpertiseClick={() => setActiveTab('EXPERTISE')}
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
                  {activeTab === 'EXPERTISE' ? 'EXP' : TABS.find(t => t.id === activeTab)?.label.split(' ')[0]}
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
    </div>
  );
}

