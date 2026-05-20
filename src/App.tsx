import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, RotateCcw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import MusicView from './components/MusicView';
import PhotosView from './components/PhotosView';
import ToolsView from './components/ToolsView';
import ExpertiseView from './components/ExpertiseView';
import ShadowProject from './components/ShadowProject';
import LoadingScreen from './components/LoadingScreen';
import shadowBg from './assets/images/shadow_background_1779198051469.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from './constants';

// Automatically merge custom duplicates on startup
try {
  // 1. Process custom_projects
  const saved = localStorage.getItem('custom_projects');
  let projectsList = saved ? JSON.parse(saved) : [...STATIC_PROJECTS];
  if (Array.isArray(projectsList)) {
    // Clean specific W11 duplicates
    let w11CustomIdx = projectsList.findIndex((p: any) => 
      p.title && p.id !== '1' && (
        p.title.toLowerCase().includes('custom os') || 
        p.title.toLowerCase().includes('w11 custom')
      )
    );
    while (w11CustomIdx !== -1) {
      const customLink = projectsList[w11CustomIdx].link;
      const customDesc = projectsList[w11CustomIdx].description;
      const targetIdx = projectsList.findIndex((p: any) => p.id === '1' || p.title === 'G.S. W11 ISO');
      
      if (targetIdx !== -1) {
        if (customLink) projectsList[targetIdx].link = customLink;
        if (customDesc) projectsList[targetIdx].description = customDesc;
      } else {
        projectsList.push({
          id: '1',
          title: 'G.S. W11 ISO',
          description: customDesc || 'all-in-one, bootable Windows Preinstallation Environment (WinPE)',
          link: customLink || 'https://drive.google.com/file/d/1Lz'
        });
      }
      projectsList.splice(w11CustomIdx, 1);
      w11CustomIdx = projectsList.findIndex((p: any) => 
        p.title && p.id !== '1' && (
          p.title.toLowerCase().includes('custom os') || 
          p.title.toLowerCase().includes('w11 custom')
        )
      );
    }

    // Clean specific W10 duplicates
    let w10CustomIdx = projectsList.findIndex((p: any) => 
      p.title && p.id !== '2' && (
        p.title.toLowerCase().replace(/[\s\.]/g, '').includes('w10')
      )
    );
    while (w10CustomIdx !== -1) {
      const customLink = projectsList[w10CustomIdx].link;
      const customDesc = projectsList[w10CustomIdx].description;
      const customTags = projectsList[w10CustomIdx].tags;
      const targetIdx = projectsList.findIndex((p: any) => p.id === '2' || p.title === 'G.S W10 ISO');
      
      if (targetIdx !== -1) {
        if (customLink) projectsList[targetIdx].link = customLink;
        if (customDesc) projectsList[targetIdx].description = customDesc;
        if (customTags) projectsList[targetIdx].tags = customTags;
      } else {
        projectsList.push({
          id: '2',
          title: 'G.S W10 ISO',
          description: customDesc || 'Ghost Spectre ISO',
          link: customLink || '',
          tags: customTags || ['OS', 'Utility', 'Windows']
        });
      }
      projectsList.splice(w10CustomIdx, 1);
      w10CustomIdx = projectsList.findIndex((p: any) => 
        p.title && p.id !== '2' && (
          p.title.toLowerCase().replace(/[\s\.]/g, '').includes('w10')
        )
      );
    }

    // Generic Name-Based Deduplication for Software/Projects
    for (const staticProj of STATIC_PROJECTS) {
      const dupIdx = projectsList.findIndex((p: any) => 
        p.id !== staticProj.id && 
        p.title && 
        p.title.toLowerCase().trim() === staticProj.title.toLowerCase().trim()
      );
      
      if (dupIdx !== -1) {
        const dupItem = projectsList[dupIdx];
        const targetIdx = projectsList.findIndex((p: any) => p.id === staticProj.id);
        if (targetIdx !== -1) {
          if (dupItem.link) projectsList[targetIdx].link = dupItem.link;
          if (dupItem.description) projectsList[targetIdx].description = dupItem.description;
          if (dupItem.tags) projectsList[targetIdx].tags = dupItem.tags;
          if (dupItem.image) projectsList[targetIdx].image = dupItem.image;
        } else {
          projectsList.push({
            ...staticProj,
            link: dupItem.link || '',
            description: dupItem.description || staticProj.description,
            tags: dupItem.tags || staticProj.tags
          });
        }
        projectsList.splice(dupIdx, 1);
      }
    }

    // Ensure Microsoft Office (id '3') has its permanent correct link in local storage
    const msofficeIdx = projectsList.findIndex((p: any) => p.id === '3' || (p.title && p.title.toLowerCase().includes('microsoft office')));
    if (msofficeIdx !== -1) {
      if (!projectsList[msofficeIdx].link) {
        projectsList[msofficeIdx].link = 'https://drive.google.com/file/d/1O_MSOfficeLTSC2021';
      }
    }

    // Ensure G.S W10 ISO (id '2') has its permanent correct link in local storage
    const w10Idx = projectsList.findIndex((p: any) => p.id === '2' || (p.title && p.title.toLowerCase().includes('w10')));
    if (w10Idx !== -1) {
      if (!projectsList[w10Idx].link) {
        projectsList[w10Idx].link = 'https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing';
      }
    }

    localStorage.setItem('custom_projects', JSON.stringify(projectsList));
  }

  // 2. Process custom_tools generic duplicate detection & automatic consolidation
  const savedTools = localStorage.getItem('custom_tools');
  let toolsList = savedTools ? JSON.parse(savedTools) : [...STATIC_TOOLS];
  if (Array.isArray(toolsList)) {
    let hasMadeChanges = false;
    for (const staticTool of STATIC_TOOLS) {
      const dupIdx = toolsList.findIndex((t: any) => 
        t.id !== staticTool.id && 
        t.name && 
        t.name.toLowerCase().trim() === staticTool.name.toLowerCase().trim()
      );
      
      if (dupIdx !== -1) {
        const dupItem = toolsList[dupIdx];
        const targetIdx = toolsList.findIndex((t: any) => t.id === staticTool.id);
        if (targetIdx !== -1) {
          if (dupItem.link) toolsList[targetIdx].link = dupItem.link;
          if (dupItem.description) toolsList[targetIdx].description = dupItem.description;
          if (dupItem.category) toolsList[targetIdx].category = dupItem.category;
        } else {
          toolsList.push({
            ...staticTool,
            link: dupItem.link || '',
            description: dupItem.description || staticTool.description,
            category: dupItem.category || staticTool.category
          });
        }
        toolsList.splice(dupIdx, 1);
        hasMadeChanges = true;
      }
    }
    if (hasMadeChanges) {
      localStorage.setItem('custom_tools', JSON.stringify(toolsList));
    }
  }

} catch (e) {
  console.error('Migration error:', e);
}

const TABS = [
  { id: 'SOFTWARE', label: '01 Software' },
  { id: 'MUSIC', label: '02 Music' },
  { id: 'PHOTOS', label: '03 Photos' },
  { id: 'TOOLS', label: '04 End-User Tools' }
];

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPERTISE');
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

  // Professional-grade Security Layer: disable context menu & dev tools shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // 2. Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
      }

      // 3. Prevent Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+Option+K (Mac) / altKey + metaKey
      if (e.metaKey && e.altKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
      }

      // 4. Prevent Ctrl+U / Cmd+U (View Source Code)
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  if (appLoading) {
    return <LoadingScreen onComplete={() => setAppLoading(false)} />;
  }

  if (!showArchive) {
    return (
      <div className="h-screen w-full bg-black overflow-hidden flex items-center justify-center p-0 md:p-8 relative">
        <div className="w-full h-full max-w-7xl bg-neutral-950 border-[12px] md:border-[16px] border-neutral-900 overflow-hidden relative shadow-2xl">
          <ShadowProject 
            onEnter={() => setShowArchive(true)} 
            hasPlayed={introPlayed}
          />
        </div>

        {/* Floating System Reset Loading Button */}
        <div className="fixed bottom-6 right-6 md:right-8 z-50 group flex items-center gap-2">
          {/* Tooltip */}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-950/90 text-white border border-purple-500/30 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase rounded shadow-lg pointer-events-none whitespace-nowrap">
            RE-INITIATE LOADING
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAppLoading(true)}
            className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 text-white flex items-center justify-center relative cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.8)] focus:outline-none"
            title="Re-initiate loading"
          >
            {/* Glowing ring */}
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-75 blur-[2px] transition-all duration-500" />
            
            {/* Inner fill to cover ring */}
            <div className="absolute inset-[1px] rounded-full bg-neutral-950 group-hover:bg-neutral-900 transition-colors duration-300 z-10" />
            
            <RotateCcw size={14} className="relative z-20 group-hover:rotate-180 transition-transform duration-700 ease-out text-neutral-400 group-hover:text-purple-400" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-hidden relative">
        {/* Ambient Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
          <img 
            src={shadowBg} 
            alt="" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header Section */}
          <header className="h-24 border-b border-neutral-900 flex items-center justify-between px-8 bg-neutral-950/95 backdrop-blur-md shrink-0 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-default hover:bg-neutral-800 transition-colors pointer-events-auto">
              <Folder className="text-purple-400" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Tech Archive</h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Design & Development / 2026 Edition</p>
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
          <main className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-neutral-900 flex items-end justify-between bg-zinc-900/45 shrink-0">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                {activeTab.replace('_', ' ')}
              </h2>
              <div className="text-right flex flex-col items-end">
                <p className="text-[9px] uppercase font-black text-neutral-500">SECTION</p>
                <p className="text-xl md:text-2xl font-mono leading-none font-bold text-neutral-300">
                  {activeTab === 'EXPERTISE' ? 'EXP' : TABS.find(t => t.id === activeTab)?.label.split(' ')[0]}
                </p>
              </div>
            </div>
 
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-neutral-950">
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
        <footer className="h-10 border-t border-neutral-900 flex items-center justify-between px-8 bg-black text-neutral-400 text-[9px] uppercase tracking-[0.2em] shrink-0 overflow-hidden">
          <div className="flex gap-4 md:gap-8">
            <span className="hidden sm:inline">LOCAL: {currentTime}</span>
            <span>STATUS: READY_FOR_HIRE</span>
          </div>
          <div className="flex gap-4 md:gap-8">
            <a href="#" className="hover:text-white transition-colors">GITHUB://ADRIAN</a>
            <a href="#" className="hidden sm:inline hover:text-white transition-colors">MAIL://HELO@ARCHIVE</a>
          </div>
        </footer>
      </div>

      {/* Floating System Reset Loading Button */}
      <div className="fixed bottom-14 right-6 md:right-8 z-50 group flex items-center gap-2">
        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-950/90 text-white border border-purple-500/30 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase rounded shadow-lg pointer-events-none whitespace-nowrap">
          RE-INITIATE LOADING
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAppLoading(true)}
          className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 text-white flex items-center justify-center relative cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.8)] focus:outline-none"
          title="Re-initiate loading"
        >
          {/* Glowing ring */}
          <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-75 blur-[2px] transition-all duration-500" />
          
          {/* Inner fill to cover ring */}
          <div className="absolute inset-[1px] rounded-full bg-neutral-950 group-hover:bg-neutral-900 transition-colors duration-300 z-10" />
          
          <RotateCcw size={14} className="relative z-20 group-hover:rotate-180 transition-transform duration-700 ease-out text-neutral-400 group-hover:text-purple-400" />
        </motion.button>
      </div>
    </div>
  );
}

