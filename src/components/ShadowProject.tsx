import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, FolderOpen, ExternalLink, X, Link as LinkIcon, CheckCircle, Activity, Sparkles, Lock, Unlock, ShieldAlert, Trash2 } from 'lucide-react';
import shadowBg from '../assets/images/shadow_background_1779198051469.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from '../constants';

export default function ShadowProject({ onEnter, hasPlayed }: { onEnter: () => void; hasPlayed?: boolean }) {
  const skip = hasPlayed;
  
  // Custom Google Drive / File link state
  const [consoleLink, setConsoleLink] = useState(() => {
    return localStorage.getItem('admin_console_link') || 'https://drive.google.com';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // High-fidelity Admin Console Form States (Pre-populated matching user's reference image!)
  const [gameTitle, setGameTitle] = useState('Utorrent');
  const [category, setCategory] = useState('SOFTWARE');
  const [description, setDescription] = useState('Utorrent installer.exe');
  const [gameFile, setGameFile] = useState('https://drive.google.com/file/d/1Lz');
  const [linkType, setLinkType] = useState('EXT'); // GITHUB | FB | EXT
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Decryption Passcode states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Tab dynamic state
  const [activeTab, setActiveTab] = useState<'uplink' | 'linked'>('uplink');
  const [unlinkTrigger, setUnlinkTrigger] = useState(0);

  const getLinkedItems = () => {
    // Read from localStorage with fallback to predefined list
    const savedProjects = localStorage.getItem('custom_projects');
    const projectsList = savedProjects ? JSON.parse(savedProjects) : STATIC_PROJECTS;
    const mergedProjects = projectsList.map((proj: any) => {
      const staticProj = STATIC_PROJECTS.find(p => p.id === proj.id);
      if (staticProj) {
        const isDbPlaceholder = proj.description?.includes('database') || proj.tags?.includes('C++');
        return {
          ...staticProj,
          description: isDbPlaceholder ? staticProj.description : (proj.description || staticProj.description),
          link: proj.link || staticProj.link,
          tags: isDbPlaceholder ? staticProj.tags : (proj.tags || staticProj.tags)
        };
      }
      return proj;
    });
    const linkedProjects = mergedProjects.filter((p: any) => p.link);

    const savedTools = localStorage.getItem('custom_tools');
    const toolsList = savedTools ? JSON.parse(savedTools) : STATIC_TOOLS;
    const mergedTools = toolsList.map((tool: any) => {
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
    const linkedTools = mergedTools.filter((t: any) => t.link);

    return [
      ...linkedProjects.map((p: any) => ({
        id: p.id,
        type: 'SOFTWARE',
        name: p.title,
        description: p.description,
        link: p.link,
        protocol: p.tags?.[0] || 'EXT'
      })),
      ...linkedTools.map((t: any) => ({
        id: t.id,
        type: 'TOOL',
        name: t.name,
        description: t.description,
        link: t.link,
        protocol: t.category || 'EXT'
      }))
    ];
  };

  const handleUnlink = (id: string, type: 'SOFTWARE' | 'TOOL') => {
    if (type === 'SOFTWARE') {
      const saved = localStorage.getItem('custom_projects');
      if (saved) {
        const projectsList = JSON.parse(saved);
        const existingIdx = projectsList.findIndex((p: any) => p.id === id);
        if (existingIdx !== -1) {
          const isStatic = STATIC_PROJECTS.some(p => p.id === id);
          let updatedList;
          if (isStatic) {
            updatedList = [...projectsList];
            delete updatedList[existingIdx].link;
          } else {
            updatedList = projectsList.filter((p: any) => p.id !== id);
          }
          localStorage.setItem('custom_projects', JSON.stringify(updatedList));
        }
      }
    } else {
      const saved = localStorage.getItem('custom_tools');
      if (saved) {
        const toolsList = JSON.parse(saved);
        const existingIdx = toolsList.findIndex((t: any) => t.id === id);
        if (existingIdx !== -1) {
          const isStatic = STATIC_TOOLS.some(t => t.id === id);
          let updatedList;
          if (isStatic) {
            updatedList = [...toolsList];
            delete updatedList[existingIdx].link;
          } else {
            updatedList = toolsList.filter((t: any) => t.id !== id);
          }
          localStorage.setItem('custom_tools', JSON.stringify(updatedList));
        }
      }
    }
    setUnlinkTrigger(prev => prev + 1);
    setSuccessStatus('UPLINK DISCONNECTED');
    setTimeout(() => {
      setSuccessStatus(null);
    }, 850);
  };

  const handleUpdateProtocol = (e: FormEvent) => {
    e.preventDefault();
    
    const trimTitle = gameTitle.trim();
    if (!trimTitle) return;

    if (category === 'SOFTWARE') {
      const saved = localStorage.getItem('custom_projects');
      const projectsList = saved ? JSON.parse(saved) : STATIC_PROJECTS;
      
      const existingIdx = projectsList.findIndex((p: any) => p.title.toLowerCase() === trimTitle.toLowerCase());
      
      const updatedProject = {
        id: existingIdx !== -1 ? projectsList[existingIdx].id : String(Date.now()),
        title: trimTitle,
        description: description,
        tags: [linkType],
        link: gameFile
      };

      let updatedList;
      if (existingIdx !== -1) {
        updatedList = [...projectsList];
        updatedList[existingIdx] = updatedProject;
      } else {
        updatedList = [updatedProject, ...projectsList];
      }

      localStorage.setItem('custom_projects', JSON.stringify(updatedList));
    } else {
      const saved = localStorage.getItem('custom_tools');
      const toolsList = saved ? JSON.parse(saved) : STATIC_TOOLS;
      
      const existingIdx = toolsList.findIndex((t: any) => t.name.toLowerCase() === trimTitle.toLowerCase());

      const updatedTool = {
        id: existingIdx !== -1 ? toolsList[existingIdx].id : String(Date.now()),
        name: trimTitle,
        description: description,
        category: linkType,
        link: gameFile
      };

      let updatedList;
      if (existingIdx !== -1) {
        updatedList = [...toolsList];
        updatedList[existingIdx] = updatedTool;
      } else {
        updatedList = [updatedTool, ...toolsList];
      }

      localStorage.setItem('custom_tools', JSON.stringify(updatedList));
    }

    // Save global default target link
    localStorage.setItem('admin_console_link', gameFile);
    setConsoleLink(gameFile);

    // Show nice synchronized notification
    setSuccessStatus('PROTOCOL SYNCHRONIZED SUCCESSFULLY');
    
    // Auto-close with delay
    setTimeout(() => {
      setSuccessStatus(null);
      setIsModalOpen(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col p-8 md:p-12 bg-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img 
          src={shadowBg} 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Upper-right Configurable Google Drive Button Group */}
      <motion.div 
        initial={skip ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={skip ? { duration: 0 } : { delay: 1.0, duration: 0.6, ease: "easeOut" }}
        className="absolute top-8 right-8 md:top-12 md:right-12 z-30 flex items-center gap-2"
      >
        <button 
          onClick={() => {
            if (isAuthenticated) {
              setIsModalOpen(true);
            } else {
              setShowPasswordModal(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] font-black transition-all active:scale-[0.98] shadow-lg border cursor-pointer select-none ${
            isAuthenticated 
              ? 'bg-neutral-900 border-emerald-500/50 text-emerald-400 hover:bg-neutral-850 hover:border-emerald-400' 
              : 'bg-black text-white hover:bg-neutral-800 border-black'
          }`}
          id="google-drive-link-btn"
        >
          {isAuthenticated ? <Unlock size={12} className="text-emerald-400 animate-pulse" /> : <Lock size={12} className="text-neutral-400" />}
          <span>Admin Console</span>
          <ExternalLink size={10} className="opacity-60" />
        </button>

        {isAuthenticated && (
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setIsModalOpen(false);
            }}
            className="p-2 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-mono text-[9px] uppercase tracking-wider font-bold transition-all rounded"
            title="Lock Console"
          >
            Lock
          </button>
        )}
      </motion.div>

      {/* Secure Passcode Decryption Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#08090b] border-2 border-neutral-800/80 w-full max-w-sm rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.04)] relative z-50 overflow-hidden p-6 md:p-8 text-neutral-200 font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-500/30 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-500/30 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-500/30 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-500/30 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <Lock className="text-red-500/85 w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Access Restricted</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordInput('');
                  }}
                  className="p-1 hover:bg-neutral-950 text-neutral-500 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Close secure prompt"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Icon & Message */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="text-red-500 w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-neutral-300 mb-1">Decryption Key Required</h4>
                <p className="text-[9px] uppercase tracking-wider text-neutral-500 leading-relaxed">
                  Enter admin passcode to authorize tactical cog-uplink connection.
                </p>
              </div>

              {/* Password submission form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordInput === 'KGab0730') {
                    setIsAuthenticated(true);
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordInput('');
                    setIsModalOpen(true);
                  } else {
                    setPasswordError('INVALID DECRYPTION KEY');
                    setPasswordInput('');
                  }
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="ENTER PASSCODE"
                    className="w-full text-center rounded-xl bg-neutral-950/80 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-red-500/85 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-neutral-800 font-semibold uppercase tracking-[0.15em]"
                    autoFocus
                    required
                  />
                  {passwordError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] text-red-500 font-bold uppercase tracking-widest text-center mt-2.5"
                    >
                      ☠ {passwordError} ☠
                    </motion.p>
                  )}
                  <p className="text-[8px] text-neutral-600 uppercase text-center mt-3 tracking-wider">
                    Hint: Use passcode <span className="text-neutral-400 font-bold font-mono">KGab0730</span> to authorize
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all cursor-pointer select-none active:scale-95"
                >
                  DECRYPT & AUTHENTICATE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Tactical Uplink Console (Original, cybernetic double-column editor) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#08090b] border-2 border-neutral-800/60 w-full max-w-xl rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.06)] relative z-50 overflow-hidden p-6 md:p-8 text-neutral-200 font-mono"
            >
              {/* Interactive Holographic style overrides */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan-line {
                  0% { transform: translateY(-20px); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { transform: translateY(340px); opacity: 0; }
                }
                @keyframes infinite-glitch {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .animate-scan {
                  animation: scan-line 6s linear infinite;
                }
                .animate-infinite-loading {
                  animation: infinite-glitch 2s ease-in-out infinite;
                }
              `}} />

              {/* Futuristic Grid Overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl pointer-events-none" />

              {/* Success Toast Overlay inside Modal */}
              <AnimatePresence>
                {successStatus && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 inset-y-0 bg-[#08090b]/98 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 gap-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse" />
                      <CheckCircle className="text-cyan-400 w-20 h-20 animate-bounce relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-cyan-400 font-black uppercase text-lg tracking-[0.4em] mb-1">{successStatus}</h3>
                      <p className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest max-w-md mx-auto">
                        Data packets synchronized // Virtual memory addresses mapped successfully
                      </p>
                    </div>
                    <div className="h-[2px] w-32 bg-cyan-950 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-cyan-400 w-full animate-infinite-loading" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header Interface */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-neutral-900 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                    <Activity size={14} className="text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                      <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-black">TACTICAL COG-UPLINK</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-[#555a64] mt-0.5">CONSOLE TERMINAL v2.5 // SECURITY: RESTRICTED</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[9px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    LINK: COMPATIBLE
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 hover:bg-neutral-950 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-neutral-800"
                    title="Close console uplink"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-neutral-900 mb-5 relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveTab('uplink')}
                  className={`pb-2.5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'uplink'
                      ? 'border-cyan-400 text-cyan-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [01] LINK UPLINK PROTOCOL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('linked')}
                  className={`pb-2.5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-all cursor-pointer relative ${
                    activeTab === 'linked'
                      ? 'border-cyan-400 text-cyan-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [02] VIEW LINKED DIRECTORY
                  {getLinkedItems().length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-cyan-500 text-black font-black text-[9px] rounded-full">
                      {getLinkedItems().length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'uplink' ? (
                /* Configuration Terminal Form (Single Column Original UI) */
                <form onSubmit={handleUpdateProtocol} className="space-y-4 relative z-10">
                  
                  {/* PROGRAM ID */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1.5 block">
                      [01] PROGRAM OR GAME ID
                    </label>
                    <input 
                      type="text" 
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="e.g. UTORRENT"
                      className="w-full rounded-xl bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-cyan-500/90 focus:ring-1 focus:ring-cyan-500/20 outline-none uppercase transition-all placeholder:text-neutral-700 font-semibold"
                      required
                    />
                  </div>

                  {/* CATEGORY & PROTOCOL TYPE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1.5 block">
                        [02] TARGET MEMORY CATEGORY
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 p-3 pr-10 text-white font-mono text-xs focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer hover:bg-[#0e0f12]"
                        >
                          <option value="SOFTWARE">SOFTWARE DIRECTORY [01]</option>
                          <option value="TOOLS">END-USER UTILITIES [04]</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-neutral-500">
                          <ChevronRight size={13} className="rotate-90 text-cyan-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1.5 block">
                        [03] PROTOCOL TYPE
                      </label>
                      <div className="flex bg-neutral-950/80 border border-neutral-800 rounded-xl p-1 gap-1 h-[42px] items-center">
                        {['GITHUB', 'FB', 'EXT'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setLinkType(opt)}
                            className={`flex-1 text-center py-1.5 font-mono text-[9px] font-black uppercase tracking-widest rounded-lg transition-all select-none cursor-pointer ${
                              linkType === opt 
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' 
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1.5 block">
                      [04] BINARY OR CONTEXT SHORT DESCRIPTION
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide details about installer and system dependencies..."
                      rows={2}
                      className="w-full rounded-xl bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all resize-none placeholder:text-neutral-700"
                      required
                    />
                  </div>

                  {/* FILE LINK */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1.5 block">
                      [05] FILE LINK (DRIVE FILE / DOWNLOAD)
                    </label>
                    <div className="relative flex items-center">
                      <LinkIcon size={13} className="text-neutral-600 absolute left-3.5" />
                      <input 
                        type="text" 
                        value={gameFile}
                        onChange={(e) => setGameFile(e.target.value)}
                        placeholder="File destination URL"
                        className="w-full rounded-xl bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 pl-10 pr-3 py-3 text-white font-mono text-xs focus:border-cyan-500/90 outline-none transition-all placeholder:text-neutral-700 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Cancel / Sync Footer Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-neutral-900 mt-6 gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] hover:text-white transition-all cursor-pointer text-center text-neutral-400"
                    >
                      ABORT TRANSIT
                    </button>
                    
                    <button 
                      type="submit"
                      className="w-full sm:w-auto relative group flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
                    >
                      <Sparkles size={12} className="text-black group-hover:rotate-12 transition-transform" />
                      SYNC UPLINK PROTOCOL
                    </button>
                  </div>

                </form>
              ) : (
                /* Linked Directory List */
                <div className="space-y-4 relative z-10 flex flex-col h-[340px]">
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 select-none">
                    {getLinkedItems().length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800/80 rounded-2xl">
                        <LinkIcon className="text-neutral-700 w-10 h-10 mb-2 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">No active links registered</span>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-600 mt-1 max-w-xs">
                          Uplink a software directory program or end-user utility to populate terminal memory.
                        </p>
                      </div>
                    ) : (
                      getLinkedItems().map((item) => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-cyan-500/30 transition-all group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                item.type === 'SOFTWARE' 
                                  ? 'bg-[#1e1a12] text-[#f59e0b] border border-[#f59e0b]/20' 
                                  : 'bg-[#12222a] text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {item.type}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                {item.protocol}
                              </span>
                              <h4 className="text-xs uppercase font-black tracking-tight text-white truncate max-w-[160px]">
                                {item.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-neutral-500 truncate max-w-[340px] mb-1.5">
                              {item.description}
                            </p>
                            <span 
                              className="text-[9px] text-cyan-500/80 hover:text-cyan-400 hover:underline cursor-pointer break-all block font-medium"
                              onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                            >
                              {item.link}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-cyan-400 font-mono text-[9px] uppercase tracking-wider font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1"
                              title="Go to file destination"
                            >
                              Open <ExternalLink size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnlink(item.id, item.type as any)}
                              className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-neutral-500 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                              title="Sever uplink"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Cancel Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-900 mt-2 shrink-0">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-[#555a64]">
                      SECURE TERMINAL DIRECTORY INDEX
                    </span>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl font-mono text-[9px] uppercase tracking-[0.15em] hover:text-white transition-all cursor-pointer text-center text-neutral-400"
                    >
                      DISCONNECT CONSOLE
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center max-w-4xl relative z-10">
        <div>
          <motion.h2 
            initial={skip ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={skip ? { duration: 0 } : { 
              type: "spring",
              stiffness: 300,
              damping: 12,
              delay: 0.2
            }}
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-6"
          >
            Shadow<br />
            <span className="text-gray-200">Project.</span>
          </motion.h2>

          <motion.div 
            initial={skip ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={skip ? { duration: 0 } : { 
              duration: 0.8,
              delay: 0.8,
              ease: "easeOut"
            }}
            className="inline-block px-3 py-1 bg-black text-white font-mono text-[10px] uppercase tracking-[0.3em] mb-4 md:mb-6 font-bold"
          >
            By: Ian Gabionza // V.1.0
          </motion.div>

          <motion.div 
            initial={skip ? "visible" : "hidden"}
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: skip ? 0 : 0.04,
                  delayChildren: skip ? 0 : 1.4
                }
              }
            }}
            className="text-lg md:text-xl font-bold uppercase tracking-tight text-gray-400 max-w-2xl leading-tight mb-6"
          >
            {"As an aspiring and dedicated PC technician, I am committed to getting systems running at their absolute best. I have the diagnostic tools and technical toolkits ready to troubleshoot the issue. To ensure a complete setup, I also provide access to a curated selection of essential software and utility files.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 5 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={skip ? { duration: 0 } : undefined}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          <motion.button 
            initial={skip ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={skip ? { duration: 0 } : { 
              duration: 5.0, 
              ease: "easeInOut", 
              delay: 3.0 
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="group flex items-center gap-4 px-8 py-3 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all duration-1500 ease-in-out"
          >
            Enter Archive
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-1000" />
          </motion.button>
        </div>
      </div>

      {/* Bottom Info */}
      <motion.div 
        initial={skip ? { opacity: 0.4 } : { opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={skip ? { duration: 0 } : { delay: 4.5, duration: 2 }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20"
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Last Modified: MAY 2026</span>
      </motion.div>
    </div>
  );
}
