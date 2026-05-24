import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, FolderOpen, ExternalLink, X, Link as LinkIcon, CheckCircle, Activity, Sparkles, Lock, Unlock, ShieldAlert, Trash2, Pencil, Check, Send, Wrench, Smile, User } from 'lucide-react';
import shadowBg from '../assets/images/shadow_master_atomic_1779279129608.png';
import shadowChibiAvatar from '../assets/images/shadow_eminence_chibi_1779532936009.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from '../constants';

export default function ShadowProject({ onEnter, hasPlayed, onShowShadowLore }: { onEnter: () => void; hasPlayed?: boolean; onShowShadowLore: () => void }) {
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

  // Security Lockout and Authentication State trackers
  const [passwordAttempts, setPasswordAttempts] = useState(() => {
    const saved = localStorage.getItem('shadow_admin_password_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('shadow_admin_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutUntil && lockoutUntil > currentTime) {
      interval = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);
        if (now >= lockoutUntil) {
          // Lockout naturally expired
          setLockoutUntil(null);
          localStorage.removeItem('shadow_admin_lockout_until');
          setPasswordAttempts(0);
          localStorage.removeItem('shadow_admin_password_attempts');
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutUntil, currentTime]);

  // Tab dynamic state
  const [activeTab, setActiveTab] = useState<'uplink' | 'linked'>('uplink');
  const [unlinkTrigger, setUnlinkTrigger] = useState(0);

  // --- SUGGESTIONS STATE ---
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string; date: string; category: string; status: string }>>(() => {
    const saved = localStorage.getItem('shadow_suggestions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = [
      { id: 's1', text: 'Add automatic shadow driver updater utility', date: 'MAY 20, 2026', category: 'UTILITY', status: 'NEW' },
      { id: 's2', text: 'Integrate fallback mirror link if Google Drive is in heavy usage limit', date: 'MAY 18, 2026', category: 'NETWORK', status: 'PENDING' },
      { id: 's3', text: 'Increase sound bite rate for live TV/anime audio channel', date: 'MAY 15, 2026', category: 'MEDIA', status: 'RESOLVED' },
    ];
    localStorage.setItem('shadow_suggestions', JSON.stringify(defaults));
    return defaults;
  });

  const [newSuggestionText, setNewSuggestionText] = useState('');
  const [newSuggestionCategory, setNewSuggestionCategory] = useState('SYSTEM');
  const [newSuggestionStatus, setNewSuggestionStatus] = useState('NEW');

  // Suggestion deletion security authentication
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

  // Interactive Shadow Chibi Chat Room States
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'shadow'; time: string }>>([
    { id: 'm1', text: "Oy kumusta tol! Ako nga pala si Shadow, yung assistant ni Adrian dito. Chill lang tayo.", sender: 'shadow', time: '11:59 PM' },
    { id: 'm2', text: "Tanong ka lang kahit ano, pre. Pwede Tagalog, Taglish, o English, kahit ano trip mo mapag-usapan!", sender: 'shadow', time: '12:00 AM' }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isShadowTyping, setIsShadowTyping] = useState(false);
  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<'chat' | 'stats'>('chat');

  // Shout Out Box States
  const [shoutMessage, setShoutMessage] = useState('');
  const [shoutName, setShoutName] = useState('');
  const [shouts, setShouts] = useState<Array<{
    id: string;
    name: string;
    message: string;
    time: string;
    timestamp: number;
    avatar: string;
    avatarBg: string;
    likes: number;
    likedByUser?: boolean;
  }>>(() => {
    const saved = localStorage.getItem('shadow_shout_outs_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 's1',
        name: 'Alpha [Seven Shadows]',
        message: 'All core database nodes are completely secured under Shadow\'s direct command. No Cult of Diablos influence detected. 🔮🖤',
        time: '2m ago',
        timestamp: Date.now() - 2 * 60 * 1000,
        avatar: '👑',
        avatarBg: 'bg-purple-950/85 border border-purple-500/35 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]',
        likes: 12
      },
      {
        id: 's2',
        name: 'Beta [Seven Shadows]',
        message: 'Completed volume 14 of the Shadow Chronicles! Lord Shadow\'s peerless brilliance must be recorded beautifully! 📖✨',
        time: '5m ago',
        timestamp: Date.now() - 5 * 60 * 1000,
        avatar: '✍️',
        avatarBg: 'bg-amber-950/85 border border-amber-500/35 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        likes: 9
      },
      {
        id: 's3',
        name: 'Gamma [Seven Shadows]',
        message: 'Mitsugoshi Company has secured additional golden reserves. The grand supply chain grows silently in the night. 💰🍷',
        time: '12m ago',
        timestamp: Date.now() - 12 * 60 * 1000,
        avatar: '💸',
        avatarBg: 'bg-pink-950/85 border border-pink-500/35 text-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.2)]',
        likes: 8
      },
      {
        id: 's4',
        name: 'Delta [Seven Shadows]',
        message: 'BUG HATING TIME! Delta crush all weak codes! SMASH SMASH! Master said I did a good job! 🐺⚔️',
        time: '18m ago',
        timestamp: Date.now() - 18 * 60 * 1000,
        avatar: '🐺',
        avatarBg: 'bg-emerald-950/85 border border-emerald-500/35 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
        likes: 15
      },
      {
        id: 's5',
        name: 'Epsilon [Seven Shadows]',
        message: 'Calibrating our slime-suit compression and magic density to absolute precision. Peak operational performance! 🎻🎶',
        time: '25m ago',
        timestamp: Date.now() - 25 * 60 * 1000,
        avatar: '🎹',
        avatarBg: 'bg-orange-950/85 border border-orange-500/35 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.2)]',
        likes: 7
      }
    ];
  });

  const handleLikeShout = (id: string) => {
    const updated = shouts.map(s => {
      if (s.id === id) {
        const liked = !s.likedByUser;
        return {
          ...s,
          likes: liked ? s.likes + 1 : s.likes - 1,
          likedByUser: liked
        };
      }
      return s;
    });
    setShouts(updated);
    localStorage.setItem('shadow_shout_outs_v3', JSON.stringify(updated));
  };

  const handlePostShout = (e: FormEvent) => {
    e.preventDefault();
    if (!shoutMessage.trim()) return;

    const avatars = ['🔮', '👑', '🗡️', '🎩', '🦅', '🐺', '📖', '💸', '🎻', '🖤', '🌌', '☠️', '🍷'];
    const backgrounds = [
      'bg-purple-950/80 border border-purple-500/20 text-purple-400',
      'bg-blue-950/80 border border-blue-500/20 text-blue-400',
      'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400',
      'bg-orange-950/80 border border-orange-500/20 text-orange-400',
      'bg-pink-950/80 border border-pink-500/20 text-pink-400',
      'bg-amber-950/80 border border-amber-500/20 text-amber-500',
    ];

    const randomIdx = Math.floor(Math.random() * avatars.length);
    const randomBgIdx = Math.floor(Math.random() * backgrounds.length);

    const nameToUse = shoutName.trim() || 'Anonymous Operative';
    
    const newShout = {
      id: `shout-${Date.now()}`,
      name: nameToUse,
      message: shoutMessage.trim(),
      time: 'now',
      timestamp: Date.now(),
      avatar: avatars[randomIdx],
      avatarBg: backgrounds[randomBgIdx],
      likes: 0,
      likedByUser: false
    };

    const updated = [newShout, ...shouts];
    setShouts(updated);
    localStorage.setItem('shadow_shout_outs_v3', JSON.stringify(updated));
    setShoutMessage('');
    setShoutName('');
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isShadowTyping, activeWorkspaceSubTab]);

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
    <div className="min-h-[200vh] w-full flex flex-col bg-black text-white relative overflow-y-auto no-scrollbar scroll-smooth">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none">
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
            setIsSuggestionModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-black transition-all active:scale-[0.98] shadow-lg border cursor-pointer select-none bg-neutral-900 border-purple-500/40 text-purple-450 hover:bg-neutral-850 hover:border-purple-400"
          id="suggestion-system-btn"
        >
          <Sparkles size={11} className="text-purple-450 animate-pulse" />
          <span>Suggestions DB</span>
        </button>

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
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;
                  if (isLocked) {
                    setPasswordError('Too many unsuccessful login attempts. Please try again in 5 minutes.');
                    return;
                  }

                  const normalizedInput = passwordInput.trim().toLowerCase();
                  let isMatch = false;

                  try {
                    const msgBuffer = new TextEncoder().encode(normalizedInput);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    if (hashHex === '9811036de8c2a393d542fb081e5107ce7944d2ed3ba7a421812db1c65c7dcd8d') {
                      isMatch = true;
                    }
                  } catch (err) {
                    // Fallback verification using basic obscuration in case subtle crypto is unavailable
                    if (btoa(normalizedInput) === 'a2dhYjA3MzA=') {
                      isMatch = true;
                    }
                  }

                  if (isMatch) {
                    setIsAuthenticated(true);
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordInput('');
                    setIsModalOpen(true);
                    
                    // Reset security tracker
                    setPasswordAttempts(0);
                    setLockoutUntil(null);
                    localStorage.removeItem('shadow_admin_password_attempts');
                    localStorage.removeItem('shadow_admin_lockout_until');
                  } else {
                    const nextAttempts = passwordAttempts + 1;
                    setPasswordAttempts(nextAttempts);
                    localStorage.setItem('shadow_admin_password_attempts', nextAttempts.toString());
                    setPasswordInput('');

                    if (nextAttempts >= 3) {
                      const lockTime = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
                      setLockoutUntil(lockTime);
                      localStorage.setItem('shadow_admin_lockout_until', lockTime.toString());
                      setPasswordError('Too many unsuccessful login attempts. Please try again in 5 minutes.');
                    } else {
                      const remaining = 3 - nextAttempts;
                      setPasswordError(`INVALID DECRYPTION KEY. (attempts remaining: ${remaining}/3)`);
                    }
                  }
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={passwordInput}
                    disabled={lockoutUntil !== null && Date.now() < lockoutUntil}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder={lockoutUntil !== null && Date.now() < lockoutUntil ? "LOCKED OUT" : "ENTER PASSCODE"}
                    className={`w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em] ${lockoutUntil !== null && Date.now() < lockoutUntil ? 'opacity-45 cursor-not-allowed border-red-950 text-neutral-600' : ''}`}
                    autoFocus
                    required={!(lockoutUntil !== null && Date.now() < lockoutUntil)}
                  />
                  {(() => {
                    const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;
                    const errorMsg = isLocked ? 'Too many unsuccessful login attempts. Please try again in 5 minutes.' : passwordError;
                    
                    if (!errorMsg) return null;
                    return (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] text-red-500 font-bold uppercase tracking-widest text-center mt-2.5 leading-relaxed px-1"
                      >
                        ☠ {errorMsg} ☠
                      </motion.p>
                    );
                  })()}
                </div>

                <button 
                  type="submit"
                  disabled={lockoutUntil !== null && Date.now() < lockoutUntil}
                  className={`w-full py-2.5 border font-black uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                    lockoutUntil !== null && Date.now() < lockoutUntil
                      ? 'bg-neutral-900/40 border-neutral-850 text-neutral-600 cursor-not-allowed'
                      : 'bg-red-950/40 hover:bg-red-900/50 border-red-900/40 text-red-400'
                  }`}
                >
                  {lockoutUntil !== null && Date.now() < lockoutUntil ? 'TACTICAL UPLINK BLOCKED' : 'DECRYPT & AUTHENTICATE'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Delete Authentication Modal */}
      <AnimatePresence>
        {showDeletePasswordModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-red-500/20 w-full max-w-sm rounded-[1.8rem] shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-35" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-red-500/30 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-red-500/30 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-red-500/30 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-red-500/30 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-red-500 w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Purge Authorization</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeletePasswordModal(false);
                    setDeletePasswordError('');
                    setDeletePasswordInput('');
                    setDeleteItemId(null);
                  }}
                  className="p-1 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Close purge prompt"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Icon & Message */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-900/40 flex items-center justify-center mx-auto mb-3">
                  <Lock className="text-red-500 w-5 h-5" />
                </div>
                <h4 className="text-[11px] uppercase tracking-[0.22em] font-black text-white mb-1.5">Authorization Key Required</h4>
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 leading-relaxed">
                  Deleting suggestions from persistent store requires verification. Enter admin password below.
                </p>
              </div>

              {/* Password submission form */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const normalizedInput = deletePasswordInput.trim().toLowerCase();
                  let isMatch = false;

                  try {
                    const msgBuffer = new TextEncoder().encode(normalizedInput);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    if (hashHex === '9811036de8c2a393d542fb081e5107ce7944d2ed3ba7a421812db1c65c7dcd8d') {
                      isMatch = true;
                    }
                  } catch (err) {
                    if (btoa(normalizedInput) === 'a2dhYjA3MzA=') {
                      isMatch = true;
                    }
                  }

                  if (isMatch) {
                    const updated = suggestions.filter(s => s.id !== deleteItemId);
                    setSuggestions(updated);
                    localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
                    
                    setShowDeletePasswordModal(false);
                    setDeletePasswordError('');
                    setDeletePasswordInput('');
                    setDeleteItemId(null);
                  } else {
                    setDeletePasswordInput('');
                    setDeletePasswordError('INVALID PASSWORD. ACCESS TO DELETION TERMINATED.');
                  }
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={deletePasswordInput}
                    onChange={(e) => {
                      setDeletePasswordInput(e.target.value);
                      if (deletePasswordError) setDeletePasswordError('');
                    }}
                    placeholder="ENTER PASSWORD"
                    className="w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em]"
                    autoFocus
                    required
                  />
                  {deletePasswordError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8.5px] text-red-500 font-bold uppercase tracking-widest text-center mt-2.5 leading-relaxed px-1"
                    >
                      ☠ {deletePasswordError} ☠
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowDeletePasswordModal(false);
                      setDeletePasswordError('');
                      setDeletePasswordInput('');
                      setDeleteItemId(null);
                    }}
                    className="flex-1 py-2.5 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800 text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer select-none active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-900/40 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer select-none active:scale-95"
                  >
                    Confirm
                  </button>
                </div>
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

      {/* Suggestions Database Console Modal */}
      <AnimatePresence>
        {isSuggestionModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto w-full" id="suggestion-database-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-4xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono flex flex-col max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-900 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold uppercase tracking-[0.2em] text-white">
                      Tactical Suggestions Console
                    </h3>
                    <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold mt-0.5">
                      // DIRECT DATABASE UPLINK SECURED
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSuggestionModalOpen(false)}
                  className="p-1.5 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main Content Area: Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 overflow-y-auto no-scrollbar pb-4 flex-1">
                
                {/* Left Column: Form */}
                <div className="lg:col-span-5 flex flex-col gap-5 border-r border-neutral-900/65 pr-0 lg:pr-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-extrabold mb-1">
                      Log New Suggestion
                    </h4>
                    <p className="text-[8px] uppercase tracking-wider text-neutral-500 leading-normal">
                      Input diagnostic recommendation, categorized and tracked securely in the local browser state directory.
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSuggestionText.trim()) return;

                      const newSugg = {
                        id: 's_' + Date.now(),
                        text: newSuggestionText.trim(),
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
                        category: newSuggestionCategory,
                        status: newSuggestionStatus
                      };

                      const updated = [newSugg, ...suggestions];
                      setSuggestions(updated);
                      localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
                      
                      // Reset inputs
                      setNewSuggestionText('');
                      setNewSuggestionCategory('SYSTEM');
                      setNewSuggestionStatus('NEW');
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                        Suggestion Prompt / Code Draft
                      </label>
                      <textarea
                        value={newSuggestionText}
                        onChange={(e) => setNewSuggestionText(e.target.value)}
                        placeholder="ENTER SUGGESTED SYSTEM OPTIMIZATION..."
                        rows={4}
                        required
                        className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white p-3 rounded-xl resize-none outline-none transition-all placeholder:text-neutral-700 placeholder:text-[9.5px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[9px] uppercase font-bold tracking-[0.20em] transition-all hover:brightness-110 active:scale-95 cursor-pointer rounded-xl flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Send size={11} className="animate-pulse" />
                      <span>Send Suggestion</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Listing Table */}
                <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
                  <div className="flex justify-between items-center bg-neutral-900/40 p-3 rounded-xl border border-neutral-900/65">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-extrabold">
                        Database Memory Index ({suggestions.length})
                      </h4>
                      <p className="text-[8px] uppercase tracking-wider text-neutral-500 mt-0.5">
                        Synced suggestions entries persistent to user space.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 max-h-[350px]">
                    {suggestions.length === 0 ? (
                      <div className="h-44 border border-dashed border-neutral-900 text-neutral-600 rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-2">
                        <ShieldAlert size={20} className="opacity-40 animate-pulse text-purple-400" />
                        <span className="text-[9px] uppercase tracking-widest font-bold">DIRECTORY ARCHIVES VACANT</span>
                        <span className="text-[8px] uppercase tracking-wider opacity-60">Log recommendations above to begin live data feed.</span>
                      </div>
                    ) : (
                      suggestions.map((item) => (
                        <div 
                          key={item.id}
                          className="border border-neutral-900/60 hover:border-purple-500/20 bg-neutral-950 p-4 rounded-xl relative group transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1.5 flex-1 select-none">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-purple-950/30 border border-purple-500/20 text-purple-400 font-mono text-[7.5px] uppercase tracking-widest rounded text-[7.5px]">
                                  {item.category}
                                </span>
                                <span 
                                  className={`px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-widest rounded border cursor-pointer select-none text-[7.5px] ${
                                    item.status === 'NEW' 
                                      ? 'bg-purple-500/10 border-purple-500/35 text-purple-400 font-extrabold animate-pulse'
                                      : item.status === 'PENDING'
                                      ? 'bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold'
                                      : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-bold'
                                  }`}
                                  onClick={() => {
                                    const nextStatus = item.status === 'NEW' ? 'PENDING' : item.status === 'PENDING' ? 'RESOLVED' : 'NEW';
                                    const updated = suggestions.map(s => s.id === item.id ? { ...s, status: nextStatus } : s);
                                    setSuggestions(updated);
                                    localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
                                  }}
                                  title="Click to cycle status"
                                >
                                  STATUS: {item.status}
                                </span>
                                <span className="text-[7.5px] font-mono text-neutral-500 uppercase font-black uppercase">
                                  {item.date}
                                </span>
                              </div>

                              <p className="text-[10px] text-neutral-200 leading-relaxed font-sans uppercase break-words text-left">
                                {item.text}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setDeleteItemId(item.id);
                                  setDeletePasswordInput('');
                                  setDeletePasswordError('');
                                  setShowDeletePasswordModal(true);
                                }}
                                className="p-1.5 hover:bg-red-955/40 hover:text-red-400 text-neutral-500 border border-transparent hover:border-red-900/30 rounded-lg transition-all cursor-pointer ml-1 animate-none flex items-center justify-center"
                                title="Purge suggestion item"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer cancel controls */}
              <div className="flex items-center justify-center pt-4 border-t border-neutral-900 mt-4 shrink-0">
                <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-500 text-center">
                  SHADOW SUGGESTIONS SYSTEM GATEWAY // PE PLATFORM
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section 1: Hero Entry Lounge (Takes min-h-screen) */}
      <div className="min-h-screen w-full relative z-10 flex flex-col justify-between">
        {/* Centered text container to constraint screen stretch */}
        <div className="max-w-7xl xl:max-w-[1360px] mx-auto w-full px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-24 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full my-auto">
            
            {/* Main Column: Shadow Project Info */}
            <div className="lg:col-span-12 lg:max-w-4xl flex flex-col text-left">
              <motion.h2 
                initial={skip ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={skip ? { duration: 0 } : { 
                  type: "spring",
                  stiffness: 300,
                  damping: 12,
                  delay: 0.2
                }}
                className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-4 text-white select-none"
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
                className="inline-block self-start px-3 py-1 bg-neutral-900 border border-neutral-800 text-purple-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-3 md:mb-5 font-bold"
              >
                By: Adrian Gabionza // V.1.0
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
                className="space-y-4 mb-8"
              >
                <h3 className="text-[13px] sm:text-xl md:text-2xl font-black uppercase tracking-tight text-purple-400 max-w-2xl leading-snug">
                  {"WE LURK IN THE SHADOWS TO SERVE THE LIGHT CONFIGURATIONS.".split(" ").map((word, i) => (
                    <motion.span
                      key={`header-${i}`}
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
                </h3>
                <p className="text-sm md:text-base font-bold uppercase tracking-tight text-neutral-400 max-w-2xl leading-relaxed">
                  {"To survive in the tech world, one must operate from the shadows—lurking in the background while ensuring systems run at their absolute best. When a computer crashes or performance drops, diagnostics are already in motion. The tools are ready. The technical toolkits are prepared to troubleshoot any issue.".split(" ").map((word, i) => (
                    <motion.span
                      key={`body-${i}`}
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
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4">
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
                  className="group flex items-center justify-center gap-4 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
                >
                  Enter Archive
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
                </motion.button>
                
                <motion.button 
                  initial={skip ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={skip ? { duration: 0 } : { 
                    duration: 5.0, 
                    ease: "easeInOut", 
                    delay: 3.2 
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onShowShadowLore}
                  className="group flex items-center justify-center gap-4 px-8 py-3 bg-purple-950/40 border border-purple-500/40 text-purple-300 font-black uppercase tracking-widest text-xs hover:bg-purple-900/60 hover:border-purple-400 transition-all duration-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
                >
                  Access Shadow Master Tutorials
                  <Sparkles size={16} className="text-purple-400 group-hover:rotate-12 transition-transform duration-300 animate-pulse" />
                </motion.button>
              </div>
            </div>



          </div>
        </div>

        {/* Scroll Indicator helper for Section 2 - Vertical and aligned to Left Hand Side */}
        <motion.div 
          initial={skip ? { opacity: 0.9 } : { opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={skip ? { duration: 0 } : { delay: 4.2, duration: 1.5 }}
          className="absolute left-4 md:left-6 bottom-10 md:bottom-14 flex flex-col items-center gap-3 group cursor-pointer z-30"
          onClick={() => {
            const nextSection = document.getElementById('operational-specs');
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-3"
          >
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-purple-500/30 to-purple-500/70" />
            
            <div className="w-6 h-6 rounded-full border border-purple-500/40 bg-purple-950/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-colors group-hover:border-purple-400">
              <ChevronRight size={11} className="rotate-90" />
            </div>
            
            <span 
              className="hidden md:inline-block text-[16.5px] font-mono tracking-[0.15em] text-purple-400 font-extrabold uppercase select-none"
              style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            >
              SCROLL DOWN
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Section 2: Shout Out Box - Shadow Garden Coded Network */}
      <div id="operational-specs" className="w-full flex flex-col justify-center py-4.5 md:py-6 border-t border-neutral-900 bg-neutral-950/70 backdrop-blur-sm relative z-10 pl-2 pr-4 md:pl-3 max-w-[602px] mr-auto">
        <div className="border border-purple-500/25 rounded-none p-3 md:p-3.5 bg-neutral-950/90 shadow-[0_0_30px_rgba(168,85,247,0.06)] relative overflow-hidden">
          
          {/* Neon background glows */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
 
          {/* Header */}
          <div className="text-center mb-3 relative z-10">
            <div className="flex items-center justify-center gap-1.2 mb-0.5 flex-wrap">
              <span className="text-sm filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🔮</span>
              <span className="text-[10px] text-amber-500 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">⭐</span>
              <h3 className="text-[17px] md:text-[19px] font-black tracking-widest bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-sans">
                SHOUT OUT BOX
              </h3>
              <span className="text-sm filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🖤</span>
              <span className="text-sm filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🍷</span>
            </div>
            <p className="text-[11px] md:text-[12px] text-neutral-400 font-sans tracking-wide">
              Whisper secret messages into the abyss. We operate in the dark! 💜
            </p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 relative z-10">
            {/* Left Panel: DECRYPTED TRANSMISSIONS List */}
            <div className="md:col-span-7 flex flex-col h-full min-h-[170px] md:border-r md:border-neutral-900/80 md:pr-3">
              <div className="flex items-center gap-2 mb-1 border-b border-neutral-900 pb-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-300 uppercase select-none">
                  DECRYPTED ARCHIVES
                </span>
                <span className="px-1 py-0.5 bg-purple-600/25 border border-purple-500/30 text-purple-400 text-[9px] font-bold font-mono rounded-none leading-none shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                  {shouts.length} SECURE LOGS
                </span>
              </div>
 
              {/* Scrollable List Container (Perfect compact heights for clean vertical sizing in horizontal layout) */}
              <div className="flex-1 overflow-y-auto pr-1 max-h-[170px] space-y-1.5 scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent">
                {shouts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-2.5 border border-dashed border-neutral-900 rounded-none bg-neutral-950/40">
                    <span className="text-base mb-1">🌌</span>
                    <p className="text-[11px] uppercase font-mono text-neutral-600 tracking-wider">No active transmissions.</p>
                  </div>
                ) : (
                  shouts.map((shout) => (
                    <div 
                      key={shout.id}
                      className="p-1 px-2 rounded-none bg-neutral-900/30 hover:bg-neutral-900/50 border border-neutral-950 hover:border-purple-500/15 transition-all duration-300 flex items-start gap-2 group relative"
                    >
                      {/* Robust Avatar Card - Sharp Corners */}
                      <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 text-sm shadow-sm ${shout.avatarBg}`}>
                        {shout.avatar}
                      </div>
 
                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-10 text-left">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="font-sans font-extrabold text-[12.5px] text-purple-300 tracking-wide">
                            {shout.name}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest font-bold">
                            {shout.time === 'now' ? shout.time : getRelativeTime(shout.timestamp)}
                          </span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-neutral-300 whitespace-pre-wrap select-text font-sans">
                          {shout.message}
                        </p>
                      </div>
 
                      {/* Smaller Like Action Bubble - Sharp layout styled elegantly */}
                      <button 
                        onClick={() => handleLikeShout(shout.id)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1 py-0.5 rounded-none border text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer ${
                          shout.likedByUser 
                             ? 'bg-purple-950/95 border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)] scale-105' 
                            : 'bg-neutral-950 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-300'
                        }`}
                      >
                        <span className={`text-[10px] transition-transform duration-300 ${shout.likedByUser ? 'scale-110 filter drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]' : 'group-hover:scale-115'}`}>🖤</span>
                        <span>{shout.likes}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
 
            {/* Right Panel: SEND A SHOUT OUT Form */}
            <form onSubmit={handlePostShout} className="md:col-span-5 flex flex-col text-left">
              <div className="mb-1.5 flex justify-between items-center border-b border-neutral-900 pb-0.5">
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-300 uppercase">
                  INITIALIZE CIPHER
                </span>
              </div>
 
              {/* Textarea container with doubled font size */}
              <div className="relative mb-1.5">
                <textarea
                  value={shoutMessage}
                  onChange={(e) => setShoutMessage(e.target.value.substring(0, 300))}
                  placeholder="Whisper your coded transmission here..."
                  maxLength={300}
                  className="w-full h-13 text-left text-[12.5px] placeholder:text-neutral-500 text-neutral-100 bg-neutral-950 border border-neutral-900 focus:border-purple-500/25 p-1.5 pr-8 rounded-none outline-none transition-all no-scrollbar resize-none font-sans leading-relaxed"
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-1 right-2 font-mono text-[9px] text-neutral-500 tracking-wider">
                  {shoutMessage.length}/300
                </div>
 
                {/* Left side smile icon indicator */}
                <div className="absolute bottom-1 left-2 text-neutral-600">
                  <Smile size={12} className="opacity-60" />
                </div>
              </div>
 
              {/* Add Emoji Panel */}
              <div className="mb-1.5">
                <div className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-500 mb-1 text-left">
                  SELECT RUNES (EMOJI)
                </div>
                <div className="flex flex-wrap gap-1 justify-start">
                  {[
                    { char: '🔥', label: 'abyss flame' },
                    { char: '🖤', label: 'shadow heart' },
                    { char: '🔮', label: 'mystery essence' },
                    { char: '🗡️', label: 'magic blade' },
                    { char: '🐺', label: 'beast power' },
                    { char: '⭐', label: 'theatrical star' },
                    { char: '✨', label: 'abyssal spark' },
                    { char: '🕶️', label: 'shades' },
                    { char: '🍷', label: 'gamma sherry' },
                    { char: '💯', label: 'max magical force' }
                  ].map((emoji) => (
                    <button
                      key={emoji.char}
                      type="button"
                      onClick={() => {
                        if (shoutMessage.length + emoji.char.length <= 300) {
                          setShoutMessage(prev => prev + emoji.char);
                        }
                      }}
                      className="w-[21px] h-[21px] rounded-none bg-neutral-900 hover:bg-neutral-800 border border-neutral-900/60 hover:border-purple-500/25 flex items-center justify-center text-[11px] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title={emoji.label}
                    >
                      {emoji.char}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Add Emoticons Panel */}
              <div className="mb-1.5">
                <div className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-500 mb-1 text-left">
                  RUNIC SPELLS (EMOTICONS)
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    '(🔮_🔮)',
                    '(◣_◢)',
                    '(づ￣³￣)づ',
                    '(•‿•)',
                    '🚀✨',
                    '⚔️🖤'
                  ].map((emoticon) => (
                    <button
                      key={emoticon}
                      type="button"
                      onClick={() => {
                        if (shoutMessage.length + emoticon.length <= 300) {
                          setShoutMessage(prev => prev + ' ' + emoticon + ' ');
                        }
                      }}
                      className="px-1 py-[3px] rounded-none bg-neutral-900 hover:bg-neutral-800 border border-neutral-900/60 hover:border-purple-500/25 text-[10px] font-mono text-neutral-400 hover:text-purple-300 text-center truncate hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {emoticon}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Your Name Input (Codename) */}
              <div className="mb-1.5 text-left">
                <div className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-500 mb-1 flex items-center gap-1">
                  <User size={10} className="text-neutral-500" />
                  <span>OPERATIVE ALIAS (OPTIONAL)</span>
                </div>
                <input
                  type="text"
                  value={shoutName}
                  onChange={(e) => setShoutName(e.target.value.substring(0, 30))}
                  placeholder="e.g. Operative No. 104"
                  className="w-full text-left text-[12px] placeholder:text-neutral-500 text-neutral-100 bg-neutral-950 border border-neutral-900 focus:border-purple-500/25 p-1.5 rounded-none outline-none transition-all font-sans"
                />
              </div>
 
              {/* Post Button */}
              <button
                type="submit"
                disabled={!shoutMessage.trim()}
                className={`w-full py-1.5 rounded-none font-mono text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer ${
                  shoutMessage.trim()
                    ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:brightness-110 active:scale-[0.98] shadow-[0_0_10px_rgba(168,85,247,0.35)] text-white'
                    : 'bg-neutral-900 text-neutral-600 border border-neutral-950 cursor-not-allowed'
                }`}
              >
                <span>🔮</span>
                <span>Send to shadows</span>
              </button>
 
              <div className="mt-1 text-[9px] text-neutral-500 uppercase tracking-widest text-center font-mono">
                Stay disguised in the deep shadows. 💜
              </div>
            </form>
          </div>
 
          {/* Direct Archive portal shortcut inside card */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 p-1.5 rounded-none border border-purple-500/20 bg-purple-950/10 font-sans">
            <p className="text-[12px] font-medium uppercase tracking-wider text-neutral-300 text-center sm:text-left leading-relaxed">
              All technician files and curated tools are organized cleanly within the main database.
            </p>
            <button 
              onClick={onEnter}
              className="w-full sm:w-auto px-3 py-1 hover:brightness-110 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[11px] uppercase font-bold tracking-widest shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap rounded-none"
            >
              Access Portal Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
