import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, FolderOpen, ExternalLink, X, Link as LinkIcon, CheckCircle, Activity, Sparkles, Lock, Unlock, ShieldAlert, Trash2, Pencil, Check } from 'lucide-react';
import shadowBg from '../assets/images/shadow_background_1779198051469.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from '../constants';

export default function ShadowProject({ onEnter, hasPlayed }: { onEnter: () => void; hasPlayed?: boolean }) {
  const skip = hasPlayed;
  
  // Custom Google Drive / File link state
  const [consoleLink, setConsoleLink] = useState(() => {
    return localStorage.getItem('admin_console_link') || 'https://drive.google.com';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<{ id: string; type: string } | null>(null);
  const [editLinkValue, setEditLinkValue] = useState('');
  const [editNameValue, setEditNameValue] = useState('');
  const [editDescValue, setEditDescValue] = useState('');
  const [editProtocolValue, setEditProtocolValue] = useState('EXT');
  const [editCategoryValue, setEditCategoryValue] = useState('SOFTWARE');
  
  // High-fidelity Admin Console Form States (Pre-populated matching user's reference image!)
  const [gameTitle, setGameTitle] = useState('');
  const [category, setCategory] = useState('SOFTWARE');
  const [description, setDescription] = useState('');
  const [gameFile, setGameFile] = useState('');
  const [linkType, setLinkType] = useState('EXT'); // GITHUB | FB | EXT
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Google Drive Accounts dropdown list - strictly Primary G-Drive and Secondary G-Drive Mirror
  const driveAccounts = [
    { name: 'PRIMARY G-DRIVE // MAIN CLOUD', url: 'https://drive.google.com/file/d/1Lz' },
    { name: 'SECONDARY G-DRIVE // CLOUD MIRROR', url: 'https://drive.google.com/file/d/1O_MSOfficeLTSC2021' },
  ];
  const [selectedDriveUrl, setSelectedDriveUrl] = useState<string>('CUSTOM_URL');

  // Decryption Passcode states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Tab dynamic state
  const [activeTab, setActiveTab] = useState<'uplink' | 'linked'>('uplink');
  const [unlinkTrigger, setUnlinkTrigger] = useState(0);

  const handleAbortTransit = () => {
    // 1. Reset all form input states
    setGameTitle('');
    setCategory('SOFTWARE');
    setDescription('');
    setGameFile('');
    setLinkType('EXT');
    setSelectedDriveUrl('CUSTOM_URL');
    setSuccessStatus(null);
    
    // 2. Clear all custom entries signed up or configured in localStorage
    localStorage.removeItem('custom_projects');
    localStorage.removeItem('custom_tools');
    localStorage.removeItem('admin_console_link');
    
    // Reset core reference link
    setConsoleLink('https://drive.google.com');

    // 3. Close the admin console and return to the home screen
    setIsModalOpen(false);
    setActiveTab('uplink');
  };

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
          title: proj.title || staticProj.title,
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

  const renderGoogleDriveDiagnostic = (url: string, setUrlValue?: (val: string) => void) => {
    const trimmed = url.trim();
    if (!trimmed) return null;

    const isDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
    if (!isDrive) return null;

    // Detect sharing structure
    const isPublicLooking = trimmed.includes('usp=sharing') || trimmed.includes('/view') || trimmed.includes('/open?id=') || trimmed.includes('export=download');
    
    // Extract file or folder ID
    let type = 'RESOURCE';
    let fileId = '';
    if (trimmed.includes('/file/d/')) {
      type = 'FILE';
      const parts = trimmed.split('/file/d/');
      if (parts[1]) {
        fileId = parts[1].split('/')[0];
      }
    } else if (trimmed.includes('/folders/')) {
      type = 'FOLDER';
      const parts = trimmed.split('/folders/');
      if (parts[1]) {
        fileId = parts[1].split('?')[0].split('/')[0];
      }
    } else if (trimmed.includes('/document/d/')) {
      type = 'DOC';
      const parts = trimmed.split('/document/d/');
      if (parts[1]) {
        fileId = parts[1].split('/')[0];
      }
    } else if (trimmed.includes('/spreadsheets/d/')) {
      type = 'SHEET';
      const parts = trimmed.split('/spreadsheets/d/');
      if (parts[1]) {
        fileId = parts[1].split('/')[0];
      }
    }

    const hasPrivateIndicator = trimmed.includes('/edit');
    const directDlLink = fileId && type === 'FILE' ? `https://docs.google.com/uc?export=download&id=${fileId}` : '';

    return (
      <div className="mt-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-left select-none animate-fadeIn transition-all">
        <div className="flex items-start gap-3">
          <div className="px-1.5 py-0.5 bg-black text-white font-mono text-[8px] font-black rounded uppercase tracking-wider mt-0.5 shrink-0">
            DRIVE ASSIST
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-black font-extrabold uppercase text-[10px] tracking-wide block mb-0.5">
              Google Drive Link Diagnostic
            </span>
            <p className="text-[9px] uppercase tracking-wider text-neutral-600 leading-none font-mono">
              DETECTED STATUS: <strong className="text-black">{type} SHARE LINK ID MATCHED</strong>
            </p>
            
            {/* Checklist items */}
            <div className="mt-3 space-y-2 border-t border-neutral-200 pt-2.5 font-mono text-[9px] uppercase tracking-wider text-[#555a64]">
              {/* Permission check */}
              <div className="flex items-start gap-1.5 text-neutral-700">
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1" />
                <p className="leading-tight">
                  🔑 <strong>Is Access Public?</strong> Google Drive files are strictly restricted by default. Ensure sharing is switched to <strong className="text-black font-bold">"Anyone with the link"</strong>!
                </p>
              </div>
              
              {/* Guidance checklist */}
              <div className="pl-4 space-y-1 text-neutral-500 font-medium list-none text-[8.5px]">
                <div>• In Drive, click <strong className="text-neutral-700 font-black">"SHARE"</strong> on your driver/utility file.</div>
                <div>• Change access from <strong className="text-neutral-700">"RESTRICTED"</strong> to <strong className="text-neutral-700 font-bold bg-amber-100/50 px-1 py-0.5 rounded border border-amber-200">"ANYONE WITH THE LINK"</strong>.</div>
                <div>• Copy the link and confirm it is pasted here.</div>
              </div>

              {hasPrivateIndicator && (
                <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-1.5">
                  <ShieldAlert size={12} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-extrabold text-[8.5px] block leading-none">⚠️ CONTAINS WORKSPACE EDIT TAG</span>
                    <p className="text-[8px] font-medium leading-normal mt-1 uppercase text-neutral-600">
                      This link contains "/edit" pointing to the file editor. Shared items are best linked using the sharing/viewer link form.
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Download Converter Button */}
              {directDlLink && setUrlValue && trimmed !== directDlLink && (
                <div className="mt-3 pt-1 border-t border-neutral-200">
                   <button
                    type="button"
                    onClick={() => {
                      setUrlValue(directDlLink);
                    }}
                    className="w-full text-center py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 hover:border-neutral-500 text-black font-black uppercase text-[8px] tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm font-mono active:scale-[0.98]"
                  >
                    <Sparkles size={9} className="animate-pulse" />
                    CONVERT TO DIRECT DOWNLOAD SYSTEM LINK ⚡
                  </button>
                  <p className="text-[7.5px] text-neutral-400 mt-1 leading-normal text-center font-mono">
                    Bypasses the Google Drive web previewer and downloads the driver package directly!
                  </p>
                </div>
              )}
            </div>

            {/* Test Link Button */}
            <div className="mt-3 flex justify-end">
              <a
                href={trimmed}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-neutral-900 text-white hover:text-neutral-200 font-bold uppercase text-[8px] tracking-widest rounded-lg cursor-pointer font-mono shadow-sm transition-colors"
              >
                <ExternalLink size={9} />
                <span>Test Link Open (Bypass Sandbox popup block)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
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

  const handleSaveLink = (id: string, type: string) => {
    const targetType = editCategoryValue.trim().toUpperCase(); // 'SOFTWARE' or 'TOOL'
    const originalType = type.trim().toUpperCase(); // 'SOFTWARE' or 'TOOL'

    if (targetType === originalType) {
      // Regular save in place
      if (originalType === 'SOFTWARE') {
        const saved = localStorage.getItem('custom_projects');
        const projectsList = saved ? JSON.parse(saved) : [...STATIC_PROJECTS];
        
        const existingIdx = projectsList.findIndex((p: any) => p.id === id);
        if (existingIdx !== -1) {
          projectsList[existingIdx].title = editNameValue.trim();
          projectsList[existingIdx].description = editDescValue.trim();
          projectsList[existingIdx].tags = [editProtocolValue.trim()];
          projectsList[existingIdx].link = editLinkValue.trim();
          localStorage.setItem('custom_projects', JSON.stringify(projectsList));
        } else {
          const staticProj = STATIC_PROJECTS.find(p => p.id === id);
          const baseProj = staticProj || { id, title: '', description: '', tags: [] };
          const newProj = {
            ...baseProj,
            title: editNameValue.trim(),
            description: editDescValue.trim(),
            tags: [editProtocolValue.trim()],
            link: editLinkValue.trim()
          };
          projectsList.push(newProj);
          localStorage.setItem('custom_projects', JSON.stringify(projectsList));
        }
      } else {
        const saved = localStorage.getItem('custom_tools');
        const toolsList = saved ? JSON.parse(saved) : [...STATIC_TOOLS];
        
        const existingIdx = toolsList.findIndex((t: any) => t.id === id);
        if (existingIdx !== -1) {
          toolsList[existingIdx].name = editNameValue.trim();
          toolsList[existingIdx].description = editDescValue.trim();
          toolsList[existingIdx].category = editProtocolValue.trim();
          toolsList[existingIdx].link = editLinkValue.trim();
          localStorage.setItem('custom_tools', JSON.stringify(toolsList));
        } else {
          const staticTool = STATIC_TOOLS.find(t => t.id === id);
          const baseTool = staticTool || { id, name: '', description: '', category: 'EXT' };
          const newTool = {
            ...baseTool,
            name: editNameValue.trim(),
            description: editDescValue.trim(),
            category: editProtocolValue.trim(),
            link: editLinkValue.trim()
          };
          toolsList.push(newTool);
          localStorage.setItem('custom_tools', JSON.stringify(toolsList));
        }
      }
    } else {
      // Category change (relocation)
      // 1. Remove from original category list
      if (originalType === 'SOFTWARE') {
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

      // 2. Add as fresh custom entry to target category list
      if (targetType === 'SOFTWARE') {
        const saved = localStorage.getItem('custom_projects');
        const projectsList = saved ? JSON.parse(saved) : [...STATIC_PROJECTS];
        const editName = editNameValue.trim();
        const existingIdx = projectsList.findIndex((p: any) => p.title.toLowerCase().trim() === editName.toLowerCase());
        
        if (existingIdx !== -1) {
          projectsList[existingIdx].title = editName;
          projectsList[existingIdx].description = editDescValue.trim();
          projectsList[existingIdx].tags = [editProtocolValue.trim()];
          projectsList[existingIdx].link = editLinkValue.trim();
        } else {
          const newProj = {
            id: String(Date.now()), // Brand new ID for the relocated item
            title: editName,
            description: editDescValue.trim(),
            tags: [editProtocolValue.trim()],
            link: editLinkValue.trim()
          };
          projectsList.push(newProj);
        }
        localStorage.setItem('custom_projects', JSON.stringify(projectsList));
      } else {
        const saved = localStorage.getItem('custom_tools');
        const toolsList = saved ? JSON.parse(saved) : [...STATIC_TOOLS];
        const editName = editNameValue.trim();
        const existingIdx = toolsList.findIndex((t: any) => t.name.toLowerCase().trim() === editName.toLowerCase());
        
        if (existingIdx !== -1) {
          toolsList[existingIdx].name = editName;
          toolsList[existingIdx].description = editDescValue.trim();
          toolsList[existingIdx].category = editProtocolValue.trim();
          toolsList[existingIdx].link = editLinkValue.trim();
        } else {
          const newTool = {
            id: String(Date.now()), // Brand new ID for the relocated item
            name: editName,
            description: editDescValue.trim(),
            category: editProtocolValue.trim(),
            link: editLinkValue.trim()
          };
          toolsList.push(newTool);
        }
        localStorage.setItem('custom_tools', JSON.stringify(toolsList));
      }
    }
    
    setEditingItemId(null);
    setEditNameValue('');
    setEditDescValue('');
    setEditProtocolValue('EXT');
    setEditCategoryValue('SOFTWARE');
    setEditLinkValue('');
    setUnlinkTrigger(prev => prev + 1);
    setSuccessStatus('ITEM UPDATED SUCCESSFULLY');
    setTimeout(() => {
      setSuccessStatus(null);
    }, 1000);
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
    <div className="h-full flex flex-col p-8 md:p-12 bg-black text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img 
          src={shadowBg} 
          alt="Background" 
          className="w-full h-full object-cover filter brightness-[0.4]"
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
              : 'bg-neutral-900 text-white hover:bg-neutral-850 border-neutral-800'
          }`}
          id="google-drive-link-btn"
        >
          {isAuthenticated ? <Unlock size={12} className="text-emerald-400 animate-pulse" /> : <Lock size={12} className="text-neutral-450" />}
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-sm rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-500/20 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-500/20 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-500/20 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-500/20 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <Lock className="text-red-500 w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Access Restricted</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordInput('');
                  }}
                  className="p-1 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Close secure prompt"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Icon & Message */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-900/40 flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="text-red-500 w-6 h-6" />
                </div>
                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-white mb-1">Decryption Key Required</h4>
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 leading-relaxed">
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
                    className="w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em]"
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
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-900/40 text-red-400 font-black uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all cursor-pointer select-none active:scale-95"
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
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
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-30" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl pointer-events-none" />

              {/* Success Toast Overlay inside Modal */}
              <AnimatePresence>
                {successStatus && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 inset-y-0 bg-neutral-950/98 z-50 flex flex-col items-center justify-center text-center p-6 gap-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                      <CheckCircle className="text-purple-500 w-20 h-20 animate-bounce relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-purple-400 font-black uppercase text-lg tracking-[0.4em] mb-1">{successStatus}</h3>
                      <p className="text-neutral-455 font-mono text-[10px] uppercase tracking-widest max-w-md mx-auto">
                        Data packets synchronized // Virtual memory addresses mapped successfully
                      </p>
                    </div>
                    <div className="h-[2px] w-32 bg-neutral-900 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-purple-500 w-full animate-infinite-loading" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header Interface */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-neutral-900 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-purple-950/30 border border-purple-500/20">
                    <Activity size={14} className="text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                      <span className="text-xs uppercase tracking-[0.25em] text-purple-400 font-black">TACTICAL COG-UPLINK</span>
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-0.5 animate-pulse">CONSOLE TERMINAL v2.5 // SECURITY: RESTRICTED</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-[9px] uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LINK: COMPATIBLE
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 hover:bg-neutral-900 text-neutral-455 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-neutral-800"
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
                      ? 'border-purple-500 text-purple-400 font-extrabold'
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
                      ? 'border-purple-500 text-purple-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [02] VIEW LINKED DIRECTORY
                  {getLinkedItems().length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-purple-600 text-white font-black text-[9px] rounded-full">
                      {getLinkedItems().length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'uplink' ? (
                /* Configuration Terminal Form (Single Column Original UI) */
                <form onSubmit={handleUpdateProtocol} className="space-y-4 relative z-10 w-full text-left">
                  
                  {/* PROGRAM ID */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-1.5 block">
                      [01] PROGRAM OR GAME ID
                    </label>
                    <input 
                      type="text" 
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="e.g. UTORRENT"
                      className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 outline-none uppercase transition-all placeholder:text-neutral-700 font-semibold text-left"
                      required
                    />
                  </div>

                  {/* CATEGORY & PROTOCOL TYPE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-1.5 block">
                        [02] TARGET MEMORY CATEGORY
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-3 pr-10 text-white font-mono text-xs focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer hover:bg-neutral-850 text-left"
                        >
                          <option value="SOFTWARE" className="bg-neutral-950 text-white">SOFTWARE DIRECTORY [01]</option>
                          <option value="TOOLS" className="bg-neutral-950 text-white">END-USER UTILITIES [04]</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-purple-400">
                          <ChevronRight size={13} className="rotate-90 text-purple-450" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-1.5 block">
                        [03] PROTOCOL TYPE
                      </label>
                      <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1 h-[42px] items-center">
                        {['GITHUB', 'FB', 'EXT'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setLinkType(opt)}
                            className={`flex-1 text-center py-1.5 font-mono text-[9px] font-black uppercase tracking-widest rounded-lg transition-all select-none cursor-pointer ${
                              linkType === opt 
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold' 
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
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-1.5 block">
                      [04] BINARY OR CONTEXT SHORT DESCRIPTION
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide details about installer and system dependencies..."
                      rows={2}
                      className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 outline-none transition-all resize-none placeholder:text-neutral-700 text-left"
                      required
                    />
                  </div>

                  {/* FILE LINK */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-400 block">
                      [05] FILE LINK (DRIVE FILE / DOWNLOAD)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Select Drive Dropdown */}
                      <div className="relative sm:col-span-5">
                        <select
                          value={selectedDriveUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedDriveUrl(val);
                            if (val !== 'CUSTOM_URL') {
                              setGameFile(val);
                            }
                          }}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-800 p-3 pr-10 text-white font-mono text-xs focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer hover:bg-neutral-850 font-semibold uppercase text-left"
                        >
                          {driveAccounts.map((account, index) => (
                            <option key={index} value={account.url} className="text-white bg-neutral-950 uppercase">
                              {account.name}
                            </option>
                          ))}
                          <option value="CUSTOM_URL" className="text-purple-400 bg-neutral-950 font-black uppercase">
                            ⚙ [CUSTOM URL / MANUAL INPUT]
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-purple-400">
                          <ChevronRight size={13} className="rotate-90 text-purple-450" />
                        </div>
                      </div>

                      {/* Display / edit input URL based on selection */}
                      <div className="relative flex items-center sm:col-span-7">
                        <LinkIcon size={13} className="text-neutral-555 absolute left-3.5" />
                        <input 
                          type="text" 
                          value={gameFile}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGameFile(val);
                            // If user edits the text, check if it matches any pre-existing drive account URL, 
                            // otherwise switch to CUSTOM_URL
                            const matchedAccount = driveAccounts.find(acc => acc.url === val);
                            if (matchedAccount) {
                              setSelectedDriveUrl(val);
                            } else {
                              setSelectedDriveUrl('CUSTOM_URL');
                            }
                          }}
                          placeholder="Enter your file destination URL (e.g. Google Drive link)"
                          className="w-full rounded-xl border bg-neutral-900 border-neutral-800 focus:border-purple-500 placeholder:text-neutral-700 pl-10 pr-3 py-3 text-white font-mono text-xs outline-none transition-all font-semibold text-left"
                          required
                        />
                      </div>
                    </div>
                    {renderGoogleDriveDiagnostic(gameFile, setGameFile)}
                  </div>

                  {/* Cancel / Sync Footer Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-neutral-900 mt-6 gap-4 font-mono">
                    <button 
                      type="button"
                      onClick={handleAbortTransit}
                      className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 hover:text-white transition-all cursor-pointer text-center"
                    >
                      ABORT TRANSIT
                    </button>
                    
                    <button 
                      type="submit"
                      className="w-full sm:w-auto relative group flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-750 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 text-center font-mono"
                    >
                      <Sparkles size={12} className="text-white group-hover:rotate-12 transition-transform" />
                      SYNC UPLINK PROTOCOL
                    </button>
                  </div>

                </form>
              ) : (
                /* Linked Directory List */
                <div className="space-y-4 relative z-10 flex flex-col h-[340px]">
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 select-none font-mono">
                    {getLinkedItems().length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 bg-neutral-900/40 rounded-2xl font-mono">
                        <LinkIcon className="text-neutral-500 w-10 h-10 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">No active links registered</span>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 mt-1 max-w-xs font-mono">
                          Uplink a software directory program or end-user utility to populate terminal memory.
                        </p>
                      </div>
                    ) : (
                      getLinkedItems().map((item) => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-neutral-800 transition-all group"
                        >
                          <div className="min-w-0 flex-1 w-full text-left">
                            <div className="flex items-center gap-2 mb-1 flex-wrap font-mono">
                              <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                item.type === 'SOFTWARE' 
                                  ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30' 
                                  : 'bg-purple-950/20 text-purple-400 border border-purple-900/30'
                              }`}>
                                {item.type}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                                {item.protocol}
                              </span>
                              <h4 className="text-xs uppercase font-extrabold tracking-tight text-white truncate max-w-[160px]">
                                {item.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate max-w-[340px] mb-1.5 font-mono">
                              {item.description}
                            </p>
                            
                            {editingItemId?.id === item.id && editingItemId?.type === item.type ? (
                              <div className="mt-2 p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-2.5 w-full text-left font-mono">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">ITEM NAME / TITLE</label>
                                    <input
                                      type="text"
                                      value={editNameValue}
                                      onChange={(e) => setEditNameValue(e.target.value)}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-white outline-none focus:border-purple-500"
                                      placeholder="Name / Title"
                                      autoFocus
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">TARGET MEMORY CATEGORY</label>
                                    <select
                                      value={editCategoryValue}
                                      onChange={(e) => setEditCategoryValue(e.target.value)}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-1.5 py-[5px] text-[10px] uppercase font-bold text-purple-400 outline-none focus:border-purple-500 font-mono cursor-pointer md:py-1"
                                    >
                                      <option value="SOFTWARE" className="bg-neutral-950 text-white">SOFTWARE DIRECTORY</option>
                                      <option value="TOOL" className="bg-neutral-950 text-white">END-USER UTILITY</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">PROTOCOL TYPE</label>
                                    <input
                                      type="text"
                                      value={editProtocolValue}
                                      onChange={(e) => setEditProtocolValue(e.target.value)}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-white outline-none focus:border-purple-500 font-mono"
                                      placeholder="e.g. EXT, GITHUB, FB"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">DESCRIPTION</label>
                                  <input
                                    type="text"
                                    value={editDescValue}
                                    onChange={(e) => setEditDescValue(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[10.5px] text-neutral-300 outline-none focus:border-purple-500 font-mono"
                                    placeholder="Enter short description..."
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">FILE DESTINATION URL</label>
                                  <input
                                    type="text"
                                    value={editLinkValue}
                                    onChange={(e) => setEditLinkValue(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-[10.5px] font-mono text-white outline-none focus:border-purple-500"
                                    placeholder="Enter URL link..."
                                  />
                                  {renderGoogleDriveDiagnostic(editLinkValue, setEditLinkValue)}
                                </div>
                                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-neutral-800 font-mono">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveLink(item.id, item.type)}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-750 text-white text-[9px] uppercase tracking-wider font-extrabold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Check size={10} /> Save Changes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-[9px] uppercase tracking-wider font-extrabold rounded-md flex items-center gap-1 cursor-pointer transition-colors border border-neutral-800"
                                  >
                                    <X size={10} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <a 
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-purple-400 hover:text-purple-350 hover:underline cursor-pointer break-all block font-medium font-mono"
                              >
                                {item.link}
                              </a>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                            {!(editingItemId?.id === item.id && editingItemId?.type === item.type) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItemId({ id: item.id, type: item.type });
                                    setEditNameValue(item.name || '');
                                    setEditDescValue(item.description || '');
                                    setEditProtocolValue(item.protocol || 'EXT');
                                    setEditCategoryValue(item.type);
                                    setEditLinkValue(item.link || '');
                                  }}
                                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-[9px] uppercase tracking-wider font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1"
                                  title="Edit item attributes"
                                >
                                  <Pencil size={10} /> Edit
                                </button>
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-[9px] uppercase tracking-wider font-bold transition-all rounded-lg cursor-pointer flex items-center gap-1 no-underline"
                                  title="Go to file destination"
                                >
                                  Open <ExternalLink size={10} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleUnlink(item.id, item.type as any)}
                                  className="p-1.5 hover:bg-red-955/40 hover:text-red-400 text-neutral-500 border border-transparent hover:border-red-900/30 rounded-lg transition-all cursor-pointer"
                                  title="Sever uplink"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Cancel Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-900 mt-2 shrink-0">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-500">
                      SECURE TERMINAL DIRECTORY INDEX
                    </span>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-300 hover:text-white transition-all cursor-pointer text-center"
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
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-6 text-white"
          >
            Shadow<br />
            <span className="text-purple-500">Project.</span>
          </motion.h2>

          <motion.div 
            initial={skip ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={skip ? { duration: 0 } : { 
              duration: 0.8,
              delay: 0.8,
              ease: "easeOut"
            }}
            className="inline-block px-3 py-1 bg-neutral-900 border border-neutral-800 text-purple-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-4 md:mb-6 font-bold"
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
            className="text-lg md:text-xl font-bold uppercase tracking-tight text-neutral-400 max-w-2xl leading-tight mb-6"
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
            className="group flex items-center gap-4 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all duration-200"
          >
            Enter Archive
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
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
