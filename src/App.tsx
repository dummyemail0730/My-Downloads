import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, RotateCcw, User, Copy, Check, X, Shield, Mail, Github, Phone, ChevronLeft } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import AnimeView from './components/AnimeView';
import GamesView from './components/GamesView';
import ToolsView from './components/ToolsView';
import ExpertiseView from './components/ExpertiseView';
import ShadowProject from './components/ShadowProject';
import LoadingScreen from './components/LoadingScreen';
import ShadowLoreView from './components/ShadowLoreView';
import shadowBg from './assets/images/shadow_master_atomic_1779279129608.png';
import ownerIdPhoto from './assets/images/owner_id_photo_1779279731967.png';
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
  { id: 'SOFTWARE', label: 'Software' },
  { id: 'ANIME', label: 'Anime' },
  { id: 'GAMES', label: 'Games' },
  { id: 'TOOLS', label: 'Tools' }
];

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPERTISE');
  const [showArchive, setShowArchive] = useState(false);
  const [showShadowLoreOnly, setShowShadowLoreOnly] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [copiedText, setCopiedText] = useState<'EMAIL' | 'KEY' | 'PHONE' | null>(null);

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
      case 'ANIME':
        return <AnimeView />;
      case 'GAMES':
        return <GamesView />;
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

  if (showShadowLoreOnly) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 overflow-y-auto no-scrollbar relative flex flex-col font-mono text-neutral-300">
        {/* Simple top bar with Back button */}
        <div className="h-16 border-b border-neutral-900 bg-neutral-950/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-50">
          <button 
            onClick={() => setShowShadowLoreOnly(false)}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            Back to Gateway
          </button>
          
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400 font-bold uppercase">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            SHADOW_GARDEN_SECURE_LORE
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <ShadowLoreView />
        </div>
      </div>
    );
  }

  if (!showArchive) {
    return (
      <div className="min-h-screen w-full bg-black overflow-y-auto no-scrollbar flex items-start justify-center p-0 relative">
        <div className="w-full min-h-screen bg-neutral-950 overflow-y-auto no-scrollbar relative shadow-2xl">
          <ShadowProject 
            onEnter={() => setShowArchive(true)} 
            hasPlayed={introPlayed}
            onShowShadowLore={() => {
              setShowShadowLoreOnly(true);
            }}
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
    <div className="min-h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-y-auto no-scrollbar relative">
        {/* Ambient Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none">
          <img 
            src={shadowBg} 
            alt="" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10">
          {/* Header Section */}
          <header className="h-24 border-b border-neutral-900 flex items-center justify-between px-8 bg-neutral-950/95 backdrop-blur-md shrink-0 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-default hover:bg-neutral-800 transition-colors pointer-events-auto">
              <Folder className="text-purple-400" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Digital Archive</h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Design & Development / 2026 Edition</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
          </div>
        </header>
 
        {/* Main Content Layout */}
        <div className="flex-1 flex overflow-y-auto no-scrollbar">
          {/* Sidebar / Navigation */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            tabs={TABS} 
            onHomeClick={() => setShowArchive(false)}
            onExpertiseClick={() => setActiveTab('EXPERTISE')}
            onShowOwnerClick={() => setShowOwnerDetails(true)}
          />
 
          {/* Content Area */}
          <main className="flex-1 flex flex-col bg-neutral-950 overflow-y-auto no-scrollbar">
            <div className="p-4 md:p-6 border-b border-neutral-900 flex items-center justify-between bg-zinc-900/45 shrink-0">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                {activeTab.replace('_', ' ')}
              </h2>
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

      {/* Immersive Owner Account Modal */}
      <AnimatePresence>
        {showOwnerDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOwnerDetails(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Futuristic ID / Calling Card Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20, y: 30 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: -20, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 150 }}
              className="relative w-full max-w-[420px] bg-neutral-950 border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.35)] font-mono text-neutral-200 z-10 p-1"
            >
              {/* Outer tech styling / glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-violet-400 to-indigo-600" />
              
              <div className="p-6 md:p-8 bg-neutral-950 rounded-[22px] relative">
                {/* Holographic light scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
                
                {/* Top Corner Decors */}
                <span className="absolute top-4 left-4 text-[7px] text-neutral-700 font-bold tracking-widest">// LEVEL_4_ACCESS</span>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowOwnerDetails(false)}
                  className="absolute top-4 right-4 text-neutral-500 hover:text-white hover:rotate-90 transition-all duration-300 cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Cyber Card Header */}
                <div className="text-center pt-2 mb-6">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-purple-400 font-black mb-1">
                    SHADOW GARDEN OPERATIVE ID
                  </p>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Owner Contact Info
                  </h3>
                </div>

                {/* ID Card Layout - Photo & General Info */}
                <div className="flex flex-col sm:flex-row gap-5 items-center pb-5 border-b border-neutral-900/80 mb-5 relative z-10">
                  {/* Photo Section */}
                  <div className="relative group shrink-0 w-28 h-28 sm:w-24 sm:h-24">
                    {/* Futuristic target corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-purple-500" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-purple-500" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-purple-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-purple-500" />
                    
                    {/* Live red vertical target scan laser overlay */}
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-[bounce_2.5s_infinite] pointer-events-none z-10" />

                    <div className="w-full h-full rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 pr-px">
                      <img 
                        src={ownerIdPhoto} 
                        alt="Adrian Gabionza Portrait ID" 
                        className="w-full h-full object-cover filter brightness-[1.1] contrast-[1.05]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute -bottom-2 translate-y-0.5 left-1/2 -translate-x-1/2 bg-purple-950 border border-purple-500 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-purple-400 whitespace-nowrap shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      VERIFIED OWNER
                    </div>
                  </div>

                  {/* Identity Badges */}
                  <div className="text-center sm:text-left flex-1 space-y-2 mt-2 sm:mt-0">
                    <div>
                      <span className="text-[7px] text-neutral-500 font-bold block mb-px">UPLINK_IDENTITY_REG</span>
                      <h4 className="text-white text-base font-black tracking-tight uppercase">
                        Adrian Gabionza
                      </h4>
                    </div>
                    <div>
                      <span className="text-[7px] text-neutral-500 font-bold block mb-px">AFFILIATION</span>
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1">
                        <Shield size={10} className="inline" />
                        Shadow Project Commander
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Rows Details */}
                <div className="space-y-3 relative z-10 text-[11px]">
                  
                  {/* Contact Number Callout */}
                  <div className="bg-purple-950/20 border border-purple-500/20 px-4 py-3.5 rounded-xl hover:border-purple-500/35 transition-colors group">
                    <span className="text-[7.5px] text-purple-400 font-extrabold block uppercase tracking-widest mb-1">
                      MOBILE VOICE COMMS
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-extrabold font-mono text-sm tracking-widest flex items-center gap-2">
                        <Phone size={13} className="text-purple-400 animate-pulse" />
                        0993 618 8535
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('09936188535');
                          setCopiedText('PHONE');
                          setTimeout(() => setCopiedText(null), 2000);
                        }}
                        className={`p-1.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                          copiedText === 'PHONE' 
                            ? 'border-green-500/50 bg-green-950/30 text-green-400' 
                            : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 group-hover:text-white'
                        }`}
                      >
                        {copiedText === 'PHONE' ? (
                          <span className="text-[8px] px-1 font-black flex items-center gap-1 uppercase">
                            <Check size={10} /> Copied
                          </span>
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mail Comms */}
                  <div className="bg-neutral-900/60 border border-neutral-900 px-4 py-3 rounded-xl flex items-center justify-between hover:border-neutral-850 transition-colors">
                    <div>
                      <span className="text-[7px] text-neutral-500 font-bold block uppercase mb-1">EMAIL TRANSMITTER</span>
                      <span className="text-zinc-300 font-bold font-mono">
                        adriangabionza1990@gmail.com
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('adriangabionza1990@gmail.com');
                        setCopiedText('EMAIL');
                        setTimeout(() => setCopiedText(null), 2000);
                      }}
                      className={`p-1.5 rounded border transition-colors cursor-pointer ${
                        copiedText === 'EMAIL' 
                          ? 'border-green-500/40 bg-green-950/20 text-green-400' 
                          : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {copiedText === 'EMAIL' ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                {/* Holographic Footer */}
                <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between text-[8px] text-neutral-500">
                  <span>DEPLOYED VIA SHADOW PROJECT COMMAND</span>
                  <span className="text-emerald-500 font-bold animate-pulse">● UPLINK ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

