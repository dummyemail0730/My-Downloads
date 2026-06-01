import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, RotateCcw, User, Copy, Check, X, Shield, Mail, Github, Phone, ChevronLeft, Key, Terminal, Wrench, Lock, Unlock, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import AnimeView from './components/AnimeView';
import GamesView from './components/GamesView';
import ToolsView from './components/ToolsView';
import ExpertiseView from './components/ExpertiseView';
import SupportView from './components/SupportView';
import ShadowProject from './components/ShadowProject';
import LoadingScreen from './components/LoadingScreen';
import ShadowLoreView from './components/ShadowLoreView';
import RedirectLoader from './components/RedirectLoader';
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
        p.title.toLowerCase().includes('w11 custom') ||
        p.title.toLowerCase().includes('tinycore') ||
        p.title.toLowerCase().includes('tiny11') ||
        p.title.toLowerCase().includes('tiny core')
      )
    );
    while (w11CustomIdx !== -1) {
      const customLink = projectsList[w11CustomIdx].link;
      const customDesc = projectsList[w11CustomIdx].description;
      const targetIdx = projectsList.findIndex((p: any) => p.id === '1' || p.title === 'G.S. W11 ISO');
      
      if (targetIdx !== -1) {
        if (customLink) projectsList[targetIdx].link = customLink;
        if (customDesc) projectsList[targetIdx].description = customDesc;
        // Merge the title to indicate it represents both
        projectsList[targetIdx].title = 'G.S. W11 ISO / TINYCORE11';
      } else {
        projectsList.push({
          id: '1',
          title: 'G.S. W11 ISO / TINYCORE11',
          description: customDesc || 'all-in-one, bootable Windows Preinstallation Environment (WinPE)',
          link: customLink || 'https://drive.google.com/file/d/1Lz'
        });
      }
      projectsList.splice(w11CustomIdx, 1);
      w11CustomIdx = projectsList.findIndex((p: any) => 
        p.title && p.id !== '1' && (
          p.title.toLowerCase().includes('custom os') || 
          p.title.toLowerCase().includes('w11 custom') ||
          p.title.toLowerCase().includes('tinycore') ||
          p.title.toLowerCase().includes('tiny11') ||
          p.title.toLowerCase().includes('tiny core')
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
  const [audioApproved, setAudioApproved] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestPasscode, setGuestPasscode] = useState('');
  const [guestAuthError, setGuestAuthError] = useState('');
  const [generatedGuestPasscode, setGeneratedGuestPasscode] = useState<string | null>(() => {
    return localStorage.getItem('generated_guest_passcode') || null;
  });
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [showGuestPasscode, setShowGuestPasscode] = useState(false);

  // Clear any legacy authorized states or stored session marks
  useEffect(() => {
    localStorage.removeItem('shadow_sys_authorized');
  }, []);

  // Save changes to generated Guest passcode to stay in sync
  useEffect(() => {
    if (generatedGuestPasscode) {
      localStorage.setItem('generated_guest_passcode', generatedGuestPasscode);
    } else {
      localStorage.removeItem('generated_guest_passcode');
    }
  }, [generatedGuestPasscode]);

  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SOFTWARE');
  const [showArchive, setShowArchive] = useState(false);
  const [showShadowLoreOnly, setShowShadowLoreOnly] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [copiedText, setCopiedText] = useState<'EMAIL' | 'KEY' | 'PHONE' | null>(null);
  const [showSupportPage, setShowSupportPage] = useState(false);

  const [redirectLoaderState, setRedirectLoaderState] = useState<{ isOpen: boolean; targetUrl: string; itemTitle: string }>({
    isOpen: false,
    targetUrl: '',
    itemTitle: '',
  });

  useEffect(() => {
    (window as any).triggerRedirectLoader = (url: string, title: string) => {
      setRedirectLoaderState({
        isOpen: true,
        targetUrl: url,
        itemTitle: title,
      });
    };
    return () => {
      delete (window as any).triggerRedirectLoader;
    };
  }, []);

  useEffect(() => {
    if (showArchive) {
      setIntroPlayed(true);
    }
  }, [showArchive]);

  // System Time Updater
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
      case 'ANIME':
        return <AnimeView />;
      case 'GAMES':
        return <GamesView />;
      case 'TOOLS':
        return <ToolsView />;
      case 'EXPERTISE':
        return <ExpertiseView onBack={() => setShowArchive(false)} onSupportClick={() => setShowSupportPage(true)} />;
      default:
        return <SoftwareView />;
    }
  };

  if (audioApproved === null) {
    return (
      <div className="min-h-screen w-full bg-black relative flex items-center justify-center p-4 font-sans select-none overflow-hidden text-zinc-100">
        
        {/* Full majestic background with high contrast and vivid details as requested */}
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
          <img 
            src={shadowBg} 
            alt="Shadow Master" 
            className="w-full h-full object-cover scale-100 filter brightness-100 contrast-100"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Soft dark vignettes to keep UI highly readable but keep the background image highly intense */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/50 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)] z-10" />

        <div className="w-full max-w-[580px] relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full bg-[#110c26]/90 border border-purple-500/25 rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(147,51,234,0.12)] backdrop-blur-xl overflow-hidden p-6 md:p-10"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              {/* Left Column Shield & Audio speaker Icon */}
              <div className="relative shrink-0 w-16 h-16 flex items-center justify-center mx-auto md:mx-0">
                {/* Shield SVG with neon outer violet glow */}
                <svg className="absolute inset-0 w-full h-full text-purple-500/80 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" className="text-purple-600/30" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {/* Soundwaves icon */}
                <svg className="w-7 h-7 text-purple-200 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>

              {/* Right content text column */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-xl font-bold font-sans text-white tracking-wide">
                  Care to listen to some music while you browse?
                </h3>
                
                <p className="text-[12px] leading-relaxed text-slate-300 font-sans font-medium">
                  The system detected interactive media feeds. This will play atmospheric theme music and background sounds to enhance your browsing experience.
                </p>

                <p className="text-[12px] leading-relaxed text-slate-300 font-sans font-medium">
                  Do you authorize the browser to play operational tactical background music tracks?
                </p>

                {/* Bullets List of requested permissions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9.5px] font-bold text-slate-400 tracking-wider block uppercase font-mono">Permissions Requested:</span>
                  <ul className="text-[11.5px] text-zinc-300 space-y-1 font-sans font-semibold pl-1">
                    <li className="flex items-center gap-2.5 justify-center md:justify-start">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                      <span>Audio Output (Speaker)</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Buttons Row aligned in bottom-right corner */}
            <div className="flex justify-end gap-3 mt-8 border-t border-purple-950/40 pt-5">
              <button
                onClick={() => {
                  setAudioApproved(false);
                }}
                className="px-6 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-neutral-800 text-neutral-300 font-sans text-xs font-semibold tracking-wider rounded-lg transition-all duration-200 hover:text-white cursor-pointer"
              >
                Deny
              </button>
              <button
                onClick={() => {
                  setAudioApproved(true);
                  // Play standard silent trigger logic so browser registers the audio gesture
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    if (ctx.state === 'suspended') {
                      ctx.resume();
                    }
                  } catch (e) {}
                }}
                className="px-8 py-2.5 bg-purple-700/90 hover:bg-purple-600 border border-purple-500/30 text-white font-sans text-xs font-bold tracking-wider rounded-lg shadow-[0_4px_15px_rgba(147,51,234,0.3)] hover:shadow-[0_4px_22px_rgba(147,51,234,0.45)] transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Allow Audio
              </button>
            </div>

          </motion.div>
        </div>

        {/* Small reset button in the corner identical to home screen style */}
        <div className="absolute bottom-6 right-6">
          <div className="w-8 h-8 rounded-full bg-neutral-950/60 border border-neutral-900 flex items-center justify-center opacity-40">
            <RotateCcw size={11} className="text-neutral-500" />
          </div>
        </div>

        {/* Top-right floating admin console layout as request */}
        <div className="absolute top-6 right-6 opacity-40">
          <div className="px-3 py-1.5 bg-neutral-950/60 border border-neutral-900 rounded text-[9px] font-mono flex items-center gap-1.5 tracking-wider uppercase">
            <Lock size={9} />
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full bg-black relative flex items-center justify-center p-4 font-mono select-none overflow-hidden text-white">
        {/* Guest Passcode Verification Modal Overlay */}
        <AnimatePresence>
          {showGuestPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-sm bg-[#0d091e]/95 border border-purple-500/40 rounded-[2rem] p-6 md:p-8 shadow-[0_0_80px_rgba(147,51,234,0.35)] relative overflow-hidden"
              >
                {/* Active Corner Brackets to match style */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-500/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-purple-500/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-purple-500/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-500/40 rounded-br-xl" />

                <div className="flex justify-between items-center mb-5 pb-3 border-b border-purple-950/40">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <h3 className="text-xs font-black tracking-[0.2em] uppercase font-mono text-purple-200">
                      GUEST REGISTRATION
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuestPopup(false)}
                    className="text-neutral-500 hover:text-white p-1 hover:bg-neutral-900/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-[10px] md:text-[11px] text-neutral-400 tracking-wide leading-relaxed mb-6 font-mono text-center">
                  Gaining limited guest privileges requires standard terminal validation.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const enteredOriginal = guestPasscode.trim();
                    const enteredLower = enteredOriginal.toLowerCase();
                    const isGeneratedMatch = generatedGuestPasscode && (enteredOriginal === generatedGuestPasscode || enteredLower === generatedGuestPasscode.toLowerCase());
                    
                    if (enteredLower === 'guest' || isGeneratedMatch) {
                      setIsAuthorized(true);
                      setShowGuestPopup(false);
                      setGuestAuthError('');
                    } else {
                      setGuestAuthError('INVALID GUEST PASSPHRASE. DECRYPTION FAILED.');
                      setGuestPasscode('');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-2.5 text-center">
                      ENTER GUEST SECURITY PASSPHRASE
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showGuestPasscode ? "text" : "password"}
                        autoFocus
                        placeholder="••••••••"
                        value={guestPasscode}
                        onChange={(e) => {
                          setGuestPasscode(e.target.value);
                          if (guestAuthError) setGuestAuthError('');
                        }}
                        className="w-full text-center text-sm font-mono bg-black hover:bg-neutral-900/45 focus:bg-black border border-neutral-800 focus:border-purple-500/60 text-purple-400 p-3 pr-11 rounded-xl outline-none transition-all placeholder:text-neutral-800/60 tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGuestPasscode(!showGuestPasscode)}
                        className="absolute right-3 text-neutral-500 hover:text-purple-400 transition-colors p-1.5 rounded cursor-pointer z-10"
                        title={showGuestPasscode ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showGuestPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div className="text-[8px] uppercase font-bold tracking-[0.12em] text-neutral-500 mt-2 text-center">
                      HINT: <span className="text-purple-400 select-all">guest</span>
                      {generatedGuestPasscode && (
                        <>
                          {' '}OR{' '}
                          <span className="text-purple-400 select-all">{generatedGuestPasscode}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {guestAuthError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] text-red-400 text-center font-bold tracking-wider leading-relaxed px-2 py-1.5 bg-red-950/10 border border-red-900/30 rounded-lg font-mono"
                    >
                      {guestAuthError}
                    </motion.p>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowGuestPopup(false)}
                      className="flex-1 py-2.5 bg-transparent border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/30 text-neutral-400 hover:text-neutral-200 font-mono text-[9px] uppercase font-bold tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-98 text-white font-mono text-[9px] font-extrabold tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    >
                      <Unlock size={10} />
                      DECRYPT ACCESS
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Absolute ADMIN LOG IN & GUEST LOGIN Buttons at the bottom left corner as requested */}
        <div className="absolute bottom-6 left-6 z-50 ml-4 mb-2 flex items-center gap-3">
          <button
            onClick={() => {
              setAuthError('');
              setShowOverrideInput(!showOverrideInput);
            }}
            className="px-4 py-2.5 bg-neutral-900/40 hover:bg-[#1f1a40]/60 border border-neutral-800 hover:border-purple-500/40 text-neutral-400 hover:text-white rounded-xl font-mono text-[9px] uppercase font-bold tracking-[0.18em] flex items-center gap-2 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer"
          >
            <Lock size={11} className="text-purple-400" />
            <span>ADMIN LOG IN</span>
          </button>

          <button
            onClick={() => {
              setGuestAuthError('');
              setGuestPasscode('');
              setShowGuestPopup(true);
            }}
            className="px-4 py-2.5 bg-purple-700/80 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-400/55 text-white rounded-xl font-mono text-[9px] uppercase font-bold tracking-[0.18em] flex items-center gap-2 transition-all duration-300 backdrop-blur-md shadow-[0_4px_15px_rgba(147,51,234,0.15)] hover:shadow-[0_4px_22px_rgba(147,51,234,0.35)] cursor-pointer"
          >
            <User size={11} className="text-purple-200" />
            <span>GUEST LOGIN</span>
          </button>
        </div>

        {/* Immersive background matching the theme */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <img 
            src={shadowBg} 
            alt="Shadow Master" 
            className="w-full h-full object-cover scale-102"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/75 z-10" />
        
        {/* Micro-grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10" />

        {/* Outer glowing ambient atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none z-10" />

        <div className="w-full max-w-lg relative z-20 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!showOverrideInput ? (
              <motion.div
                key="maintenance-card"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full bg-[#0f0b21]/80 border border-purple-500/25 rounded-[2.2rem] p-8 md:p-10 shadow-[0_0_60px_rgba(147,51,234,0.15)] backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center"
              >
                {/* Wrench Icon wrapped in a glowing violet Hexagon */}
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-purple-500/35 fill-purple-950/20 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                    <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                  <Wrench className="w-9 h-9 text-purple-300 relative z-10 animate-pulse" strokeWidth={1.5} />
                </div>

                {/* Display Title */}
                <h2 className="text-xl md:text-2xl font-bold font-sans text-white tracking-wide mb-1 select-none">
                  System Under Maintenance
                </h2>

                {/* Symmetrical divider with a center circle */}
                <div className="flex items-center justify-center w-full gap-2 my-5 opacity-50">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-purple-500/30 flex-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/60 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                  <div className="h-[1px] bg-gradient-to-l from-transparent via-purple-500/30 to-purple-500/30 flex-1" />
                </div>

                {/* Main description matching original typography */}
                <p className="text-[12px] md:text-xs text-neutral-300 font-sans leading-relaxed text-center mb-8 font-medium">
                  We are currently performing scheduled maintenance to improve your experience. <br className="hidden sm:inline" />Please check back later.
                </p>

                {/* OK Button with nice purple styling - clicking OK keep user on maintenance state */}
                <button
                  onClick={() => {
                    // Do nothing or notify standby mode when admin console link is hidden
                    setAuthError('');
                  }}
                  className="px-12 py-2.5 bg-purple-700/80 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-400/55 text-white font-sans text-xs font-semibold tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(147,51,234,0.2)] hover:shadow-[0_4px_22px_rgba(147,51,234,0.35)] active:scale-95 cursor-pointer"
                >
                  OK
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="access-card"
                initial={{ opacity: 0, scale: 0.96, y: -15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full bg-[#0f0b21]/80 border border-purple-500/30 rounded-[2.2rem] p-8 md:p-10 shadow-[0_0_60px_rgba(147,51,234,0.2)] backdrop-blur-xl relative overflow-hidden"
              >
                {/* Active Corner Brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-500/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500/40 rounded-br-xl" />

                {/* Lock icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-purple-500/35 fill-purple-950/20 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                      <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <Lock className="w-7 h-7 text-purple-300 relative z-10 animate-pulse" />
                  </div>
                </div>

                <h2 className="text-sm md:text-base font-black text-center text-white tracking-[0.2em] font-mono mb-2 uppercase">
                  DECRYPT HARDWARE LINK
                </h2>

                <p className="text-[10px] md:text-[11px] text-neutral-400 tracking-wide leading-relaxed text-center mb-6">
                  Type in your secure verification passcode. If authentic, the root system loading screen will be initiated.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const entered = passcode.trim();
                    try {
                      const msgBuffer = new TextEncoder().encode(entered);
                      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                      const hashArray = Array.from(new Uint8Array(hashBuffer));
                      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                      
                      if (hashHex === 'cf7a14191ac01a39913eadfae86c9e032ec7bd69fe01d452113f54ea6eef68ef') {
                        setIsAuthorized(true);
                        setAuthError('');
                      } else {
                        setAuthError('INVALID SECURITY PASSPHRASE. LINK DENIED.');
                        setPasscode('');
                      }
                    } catch (err) {
                      // Fallback verification using basic obscuration in case subtle crypto is unavailable
                      if (btoa(entered) === 'S0dhYjA3MzA=') {
                        setIsAuthorized(true);
                        setAuthError('');
                      } else {
                        setAuthError('INVALID SECURITY PASSPHRASE. LINK DENIED.');
                        setPasscode('');
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-2.5 text-center">
                      ENTER ACCESS PASSCODE
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type={showAdminPasscode ? "text" : "password"}
                        autoFocus
                        placeholder="••••••••"
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          if (authError) setAuthError('');
                        }}
                        className="w-full text-center text-sm font-mono bg-black hover:bg-neutral-900/45 focus:bg-black border border-neutral-800 focus:border-purple-500/60 text-purple-400 p-3 pr-11 rounded-xl outline-none transition-all placeholder:text-neutral-800 tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                        className="absolute right-3 text-neutral-500 hover:text-purple-400 transition-colors p-1.5 rounded cursor-pointer z-10"
                        title={showAdminPasscode ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showAdminPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>



                  {authError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] text-red-400 text-center font-bold tracking-wider leading-relaxed px-2 py-1.5 bg-red-950/10 border border-red-900/30 rounded-lg font-mono"
                    >
                      {authError}
                    </motion.p>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-98 text-white font-mono text-[10px] font-extrabold tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Unlock size={11} />
                      <span>INITIALIZE TERMINAL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOverrideInput(false);
                        setAuthError('');
                      }}
                      className="w-full py-2 bg-transparent border border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/30 text-neutral-500 hover:text-neutral-300 font-mono text-[9px] uppercase font-bold tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={10} />
                      <span>BACK TO ALERT</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (appLoading) {
    return <LoadingScreen onComplete={() => setAppLoading(false)} isAudioAllowed={audioApproved === true} />;
  }

  if (showShadowLoreOnly) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 overflow-y-auto no-scrollbar relative flex flex-col font-mono text-neutral-300">
        {/* Simple top bar with Back button */}
        <div className="h-24 border-b border-neutral-900 bg-neutral-950/95 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50">
          <button 
            onClick={() => setShowShadowLoreOnly(false)}
            className="flex items-center gap-2 md:gap-3 group transition-all duration-300 text-purple-400 hover:text-white"
          >
            <div className="w-16 h-16 rounded-xl bg-purple-950/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/80 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] shrink-0">
              <ArrowLeft className="w-7 h-7" />
            </div>
            <span className="font-mono text-xs md:text-sm lg:text-base font-black uppercase tracking-widest block cursor-pointer text-purple-400/90 group-hover:text-white transition-colors duration-300">
              return_home
            </span>
          </button>
          
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-purple-400 font-bold uppercase">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
            SHADOW_TUTORIAL_LIBRARY
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <ShadowLoreView />
        </div>

        {/* Global Redirect Interceptor Loader modal */}
        <RedirectLoader
          isOpen={redirectLoaderState.isOpen}
          targetUrl={redirectLoaderState.targetUrl}
          itemTitle={redirectLoaderState.itemTitle}
          onClose={() => setRedirectLoaderState(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    );
  }

  if (showSupportPage) {
    return <SupportView onBack={() => setShowSupportPage(false)} />;
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
            isAudioAllowed={audioApproved === true}
            onLogout={() => setIsAuthorized(false)}
            onSupportClick={() => {
              setShowSupportPage(true);
            }}
            generatedGuestPasscode={generatedGuestPasscode}
            setGeneratedGuestPasscode={setGeneratedGuestPasscode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-hidden relative">
        {/* Ambient Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none">
          <img 
            src={shadowBg} 
            alt="" 
            className="w-full h-full object-cover filter brightness-[0.5]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header Section */}
          <header className="h-24 border-b border-neutral-900 flex items-center justify-between px-4 md:px-8 bg-neutral-950/95 backdrop-blur-md shrink-0 sm:pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-default hover:bg-neutral-800 transition-colors pointer-events-auto">
              <Folder className="text-purple-400" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xs sm:text-lg md:text-xl font-black uppercase tracking-tighter leading-none text-white">Digital Archive</h1>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 leading-none mt-1">Design & Development / 2026 Edition</p>
            </div>
          </div>
          <div className="flex flex-col items-end pointer-events-auto">
            <button 
              onClick={() => setShowArchive(false)}
              className="flex items-center gap-2 md:gap-3 group transition-all duration-300 text-purple-400 hover:text-white"
            >
              <div className="w-16 h-16 rounded-xl bg-purple-950/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/80 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.55)] shrink-0">
                <ArrowLeft className="w-7 h-7" />
              </div>
              <span className="font-mono text-xs md:text-sm lg:text-base font-black uppercase tracking-widest block cursor-pointer text-purple-400/90 group-hover:text-white transition-colors duration-300">
                Return_Home
              </span>
            </button>
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
            onShowOwnerClick={() => setShowOwnerDetails(true)}
            onSupportClick={() => setShowSupportPage(true)}
          />
 
          {/* Content Area */}
          <main className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
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
                        alt="Cid Kagenou Portrait ID" 
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
                        Cid Kagenou
                      </h4>
                    </div>
                    <div>
                      <span className="text-[7px] text-neutral-500 font-bold block mb-px">AFFILIATION</span>
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1">
                        <Shield size={10} className="inline" />
                        Shadow Tech Commander
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
                        cidkagenou@gmail.com
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('cidkagenou@gmail.com');
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
                  <span>DEPLOYED VIA SHADOW TECH COMMAND</span>
                  <span className="text-emerald-500 font-bold animate-pulse">● UPLINK ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Redirect Interceptor Loader modal */}
      <RedirectLoader
        isOpen={redirectLoaderState.isOpen}
        targetUrl={redirectLoaderState.targetUrl}
        itemTitle={redirectLoaderState.itemTitle}
        onClose={() => setRedirectLoaderState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

