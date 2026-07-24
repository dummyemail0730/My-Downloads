import React, { useState, useEffect, useRef, MouseEvent, PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, RotateCcw, User, Copy, Check, X, Shield, Mail, Github, Phone, ChevronLeft, Key, Terminal, Wrench, Lock, Unlock, AlertTriangle, ArrowLeft, Eye, EyeOff, Clock, ArrowRight, ShieldCheck, Clipboard, Calendar, Mic, MicOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SoftwareView from './components/SoftwareView';
import AnimeView from './components/AnimeView';
import MusicView from './components/MusicView';
import ToolsView from './components/ToolsView';
import ExpertiseView from './components/ExpertiseView';
import SupportView from './components/SupportView';
import ShadowProject from './components/ShadowProject';
import LoadingScreen from './components/LoadingScreen';
import ShadowLoreView from './components/ShadowLoreView';
import RedirectLoader from './components/RedirectLoader';
import LogUpdateModal from './components/LogUpdateModal';
import shadowBg from './assets/images/shadow_master_atomic_1779279129608.png';
import ownerIdPhoto from './assets/images/owner_id_photo_1779279731967.png';
import shadowChibiAvatar from './assets/images/shadow_eminence_chibi_1779532936009.png';
import shadowChibiSticker from './assets/images/shadow_chibi_avatar_1779438320279.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from './constants';

// TABS config for sidebar tabs
const TABS = [
  { id: 'SOFTWARE', label: 'Software' },
  { id: 'ANIME', label: 'Anime' },
  { id: 'GAMES', label: 'Music' },
  { id: 'TOOLS', label: 'Tools' }
];

// Helper to extract passcode from messages for guest auto-login shortcut
const extractPasscode = (text: string): string | null => {
  if (!text) return null;
  // 1. Check for text inside backticks first, e.g. `ABC12345`
  const backtickMatch = text.match(/`([^`]+)`/);
  if (backtickMatch && backtickMatch[1]) {
    return backtickMatch[1].trim();
  }
  // 2. Look for pattern like "password: CODE" or "passcode: CODE" or "G.S-..."
  const codeLabelMatch = text.match(/(?:password|passcode|key|code):\s*([a-zA-Z0-9\-]+)/i);
  if (codeLabelMatch && codeLabelMatch[1]) {
    return codeLabelMatch[1].trim();
  }
  // 3. Look for 8-char uppercase alphanumeric sequence
  const wordMatch = text.match(/\b([A-Z0-9]{8})\b/);
  if (wordMatch && wordMatch[1]) {
    return wordMatch[1].trim();
  }
  return null;
};

// A small interactive button component to copy code to clipboard with success feedback
const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: any) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
    } catch (err) {
      console.warn("Clipboard copy blocked:", err);
    }
    try {
      (window as any).lastShadowCopiedText = code;
      localStorage.setItem('copied_passcode_buffer', code);
    } catch (err) {
      console.error("Cache copy error:", err);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy passcode to clipboard"}
      className="ml-1 p-1 hover:bg-purple-900/45 text-purple-400 hover:text-purple-200 rounded transition-all cursor-pointer inline-flex items-center justify-center active:scale-90"
    >
      {copied ? (
        <Check size={10.5} className="text-emerald-400" />
      ) : (
        <Copy size={10.5} />
      )}
    </button>
  );
};

// Render the chat bubbles inserting the copy button right next to the detected passcode
const renderMessageContent = (msgText: string, sender: string) => {
  if (sender !== 'bot') return msgText;
  const code = extractPasscode(msgText);
  if (!code) return msgText;

  const index = msgText.indexOf(code);
  if (index === -1) return msgText;

  const before = msgText.substring(0, index);
  const after = msgText.substring(index + code.length);

  return (
    <span>
      {before}
      <span className="inline-flex items-center gap-0.5 bg-[#0e0a24] border border-purple-500/40 text-purple-300 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold select-all shadow-[0_0_8px_rgba(168,85,247,0.25)]">
        {code}
        <CopyCodeButton code={code} />
      </span>
      {after}
    </span>
  );
};

export default function App() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [audioApproved, setAudioApproved] = useState<boolean | null>(true);

  // Soundtrack / Background audio states
  const STATIC_PLAYLIST = [
    { id: '1zUW4zza5mVJYG2DETaSEHVPUq26mLPqT', name: 'Our Garden Theme', desc: 'Custom requested page background track', type: 'drive' as const },
    { id: 'ATHTNyLK2TM', name: 'School Life', desc: 'Main soundtrack of this page', type: 'youtube' as const },
    { id: 'T9MLjIsfUOU', name: 'Xado Theme Orchestral', desc: 'Pre-load soundtrack frequency', type: 'youtube' as const },
    { id: '9iQVgj4z-I4', name: 'Shadow Garden Lofi Chill', desc: 'Background ambiance of the shadows', type: 'youtube' as const }
  ];

  const [customTracks, setCustomTracks] = useState<Array<{ id: string; name: string; desc: string; type?: 'youtube' | 'drive' }>>(() => {
    try {
      const saved = localStorage.getItem('shadow_custom_tracks_data');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const playlist = [...STATIC_PLAYLIST, ...customTracks];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('shadow_soundtrack_active_index');
      return saved ? Number(saved) : 0;
    } catch (_) {
      return 0;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [localAudioActive, setLocalAudioActive] = useState(false);

  useEffect(() => {
    if (audioApproved === true) {
      setLocalAudioActive(true);
      setIsPlaying(true);
    } else if (audioApproved === false) {
      setLocalAudioActive(false);
      setIsPlaying(false);
    }
  }, [audioApproved]);

  useEffect(() => {
    // Purge legacy persistent chat_boss_mode from localStorage & sessionStorage so refreshing starts with a fresh guest state
    localStorage.removeItem('chat_boss_mode');
    sessionStorage.removeItem('chat_boss_mode');
  }, []);

  // Disable F12, Right-click, and DevTools keyboard shortcuts globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Prevent F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // 2. Prevent Ctrl+Shift+I / Cmd+Opt+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }

      // 3. Prevent Ctrl+Shift+J / Cmd+Opt+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }

      // 4. Prevent Ctrl+Shift+C / Cmd+Opt+C (Element Selector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // 5. Prevent Ctrl+U / Cmd+Opt+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // 6. Prevent Ctrl+Shift+K / Cmd+Opt+K (Firefox/Safari Console/Network)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k' || e.keyCode === 75)) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  const activeTrack = playlist[currentTrackIndex] || playlist[0] || STATIC_PLAYLIST[0];

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [guestPasscode, setGuestPasscode] = useState('');
  const [guestAuthError, setGuestAuthError] = useState('');
  
  const [availablePasscodes, setAvailablePasscodes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('chatbot_generated_passwords');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  const handleDirectGuestLogin = (code: string) => {
    const enteredOriginal = code.trim();
    const enteredLower = enteredOriginal.toLowerCase();
    
    // Check match criteria
    const isGeneratedMatch = generatedGuestPasscode && (enteredOriginal === generatedGuestPasscode || enteredLower === generatedGuestPasscode.toLowerCase());
    
    let isChatbotMatch = false;
    let matchedChatbotCode: string | null = null;
    try {
      const chatbotRaw = localStorage.getItem('chatbot_generated_passwords');
      if (chatbotRaw) {
        const chatbotCodes: string[] = JSON.parse(chatbotRaw);
        const found = chatbotCodes.find(c => 
          c && (enteredOriginal === c || enteredLower === c.toLowerCase())
        );
        if (found) {
          isChatbotMatch = true;
          matchedChatbotCode = found;
        }
      }
    } catch (err) {
      console.error(err);
    }

    if (enteredLower === 'guest' || isGeneratedMatch || isChatbotMatch) {
      setIsAuthorized(true);
      setIsGuestMode(true);
      const now = Date.now();
      setGuestLoginTime(now);
      localStorage.setItem('guest_login_time', now.toString());
      localStorage.setItem('is_guest_mode', 'true');

      // Consume (remove) the used chatbot password so it cannot be used again
      if (isChatbotMatch && matchedChatbotCode) {
        try {
          const chatbotRaw = localStorage.getItem('chatbot_generated_passwords');
          if (chatbotRaw) {
            const chatbotCodes: string[] = JSON.parse(chatbotRaw);
            const updatedList = chatbotCodes.filter(c => c !== matchedChatbotCode);
            localStorage.setItem('chatbot_generated_passwords', JSON.stringify(updatedList));
            setAvailablePasscodes(updatedList);
          }
        } catch (err) {
          console.error("Failed to update chatbot_generated_passwords after login", err);
        }
      }

      setShowGuestPopup(false);
      setGuestAuthError('');
      return true;
    }
    return false;
  };
  
  // Custom Chatbox for NBN States
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
  }>>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Yo! Welcome sa ShadowTech. Ako si **Shadow**, assistant mo dito. Tanong ka lang, got you covered, pre! 😎",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Custom pointer drag states for the floating chathead
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Only drag with left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isPointerDownRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = { ...dragOffset };
    hasDraggedRef.current = false;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: globalThis.PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      // Small threshold to ignore tiny accidental movements
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDraggedRef.current = true;
      }
      setDragOffset({
        x: startOffsetRef.current.x + dx,
        y: startOffsetRef.current.y + dy
      });
    };

    const handleWindowPointerUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;

      // If we didn't drag past threshold, toggle floating chat open/closed
      if (!hasDraggedRef.current) {
        setIsFloatingChatOpen(prev => !prev);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [dragOffset]);

  // Synchronize and persist chatbot dialogue live to localStorage under user number
  useEffect(() => {
    let userNumStr = localStorage.getItem('shadow_user_number');
    if (!userNumStr) {
      userNumStr = 'User 01';
    }
    const numPart = userNumStr.replace(/\D/g, '');
    const formattedUser = 'User ' + numPart.padStart(2, '0');
    try {
      localStorage.setItem(`shadow_chat_history_${formattedUser}`, JSON.stringify(chatMessages));
      // Dispatch sync update event so that open admin consoles can immediately update lists
      window.dispatchEvent(new Event('shadow_sync_update'));
    } catch (e) {
      console.error("Failed to save chat history to local storage", e);
    }
  }, [chatMessages]);

  // Load chat history of current user on startup if exists
  useEffect(() => {
    // Pre-fetch Google Drive Music Library in background as soon as portal initializes
    fetch('/api/music/library')
      .then(res => res.json())
      .then(data => {
        if (data && data.tracks && data.tracks.length > 0) {
          try {
            localStorage.setItem('shadow_gdrive_tracks', JSON.stringify(data.tracks));
          } catch (e) {}
        }
      })
      .catch(err => console.warn('Background portal music sync:', err));

    let userNumStr = localStorage.getItem('shadow_user_number');
    if (userNumStr) {
      const numPart = userNumStr.replace(/\D/g, '');
      const formattedUser = 'User ' + numPart.padStart(2, '0');
      const saved = localStorage.getItem(`shadow_chat_history_${formattedUser}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed.map((m: any) => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
            })));
          }
        } catch (e) {
          console.error("Failed to restore saved chat messages", e);
        }
      }
    }
  }, []);

  // Speech to Text state and refs
  const [isListening, setIsListening] = useState(false);
  const [speechHelperText, setSpeechHelperText] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechHelperText("Speech recognition not supported in this browser.");
      setTimeout(() => setSpeechHelperText(''), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fil-PH'; // Native fil-PH handles English & Tagalog perfectly

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechHelperText("Listening... Magsalita na po.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput((prev) => prev ? prev + ' ' + transcript : transcript);
          setSpeechHelperText(`Narinig: "${transcript}"`);
          setTimeout(() => setSpeechHelperText(''), 3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechHelperText("Paki-allow po ng mic permission.");
        } else {
          setSpeechHelperText(`Error: ${event.error}`);
        }
        setTimeout(() => setSpeechHelperText(''), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
    setSpeechHelperText('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Chat scroll anchor ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  const [generatedGuestPasscode, setGeneratedGuestPasscode] = useState<string | null>(() => {
    return localStorage.getItem('generated_guest_passcode') || null;
  });
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [showGuestPasscode, setShowGuestPasscode] = useState(false);
  const [isChatBossMode, setIsChatBossMode] = useState<boolean>(false);
  const [showLogUpdateModal, setShowLogUpdateModal] = useState(false);

  const [generatedGuestPasscodeDuration, setGeneratedGuestPasscodeDuration] = useState<number>(() => {
    const stored = localStorage.getItem('generated_guest_passcode_duration');
    return stored ? parseInt(stored, 10) : 90; // Fallback to 90 minutes
  });
  const [generatedGuestPasscodeTime, setGeneratedGuestPasscodeTime] = useState<number | null>(() => {
    const stored = localStorage.getItem('generated_guest_passcode_time');
    return stored ? parseInt(stored, 10) : null;
  });
  const [guestLoginTime, setGuestLoginTime] = useState<number | null>(() => {
    const stored = localStorage.getItem('guest_login_time');
    return stored ? parseInt(stored, 10) : null;
  });
  const [guestSessionExpired, setGuestSessionExpired] = useState(false);

  // Periodic background polling for configurations to synchronize data dynamically across tabs and devices
  useEffect(() => {
    const fetchConfigs = () => {
      fetch('/api/configs')
        .then(res => {
          if (!res.ok) throw new Error('Response error');
          return res.json();
        })
        .then(data => {
          if (!data) return;
          
          let hasAnyDiff = false;
          
          // Verify and sync console link if different
          if (data.admin_console_link) {
            const currentVal = localStorage.getItem('admin_console_link');
            if (currentVal !== data.admin_console_link) {
              if ((window as any)._origSetItem) {
                (window as any)._origSetItem.call(localStorage, 'admin_console_link', data.admin_console_link);
              } else {
                localStorage.setItem('admin_console_link', data.admin_console_link);
              }
              hasAnyDiff = true;
            }
          }

          const syncKeys = [
            'custom_projects',
            'custom_anime',
            'custom_games',
            'shadow_master_tutorials',
            'custom_tools',
            'deleted_item_ids',
            'user_suggestions',
            'user_appointments',
            'user_shout_outs',
            'user_activity_logs'
          ];

          const payloadToUpload: Record<string, any> = {};
          let needsUpload = false;

          let deletedIds: string[] = [];
          try {
            const serverDeleted = data.deleted_item_ids;
            const localDeletedStr = localStorage.getItem('deleted_item_ids');
            const localDeleted = localDeletedStr ? JSON.parse(localDeletedStr) : [];
            const combined = new Set([
              ...(Array.isArray(serverDeleted) ? serverDeleted : []),
              ...(Array.isArray(localDeleted) ? localDeleted : [])
            ]);
            deletedIds = Array.from(combined).map(String);
          } catch (e) {}

          syncKeys.forEach(key => {
            const localKeyName = (key === 'user_suggestions') ? 'shadow_suggestions' :
                                 (key === 'user_appointments') ? 'shadow_appointments' :
                                 (key === 'user_shout_outs') ? 'shadow_shout_outs_v3' :
                                 (key === 'user_activity_logs') ? 'shadow_user_movements' : key;

            if (key === 'deleted_item_ids') {
              const serverVal = data.deleted_item_ids || [];
              const localValStr = localStorage.getItem('deleted_item_ids');
              let localVal: any[] = [];
              try {
                if (localValStr && localValStr.startsWith('[')) {
                  localVal = JSON.parse(localValStr);
                }
              } catch (e) {}

              const serverSet = new Set((Array.isArray(serverVal) ? serverVal : []).map(String));
              const localSet = new Set((Array.isArray(localVal) ? localVal : []).map(String));
              const mergedSet = new Set([...serverSet, ...localSet]);
              
              const mergedList = Array.from(mergedSet);
              const mergedStr = JSON.stringify(mergedList);

              if (localValStr !== mergedStr || JSON.stringify(serverVal) !== mergedStr) {
                if ((window as any)._origSetItem) {
                  (window as any)._origSetItem.call(localStorage, 'deleted_item_ids', mergedStr);
                } else {
                  localStorage.setItem('deleted_item_ids', mergedStr);
                }
                payloadToUpload.deleted_item_ids = mergedList;
                needsUpload = true;
                hasAnyDiff = true;
              }
              return;
            }

            const serverVal = data[key];
            if (serverVal !== undefined && serverVal !== null) {
              const currentLocalStr = localStorage.getItem(localKeyName);
              
              let localVal: any = null;
              try {
                if (currentLocalStr && (currentLocalStr.startsWith('[') || currentLocalStr.startsWith('{'))) {
                  localVal = JSON.parse(currentLocalStr);
                }
              } catch (e) {}

              const isServerEmpty = Array.isArray(serverVal) && serverVal.length === 0;
              const isLocalEmpty = !localVal || (Array.isArray(localVal) && localVal.length === 0);

              if (isServerEmpty && !isLocalEmpty) {
                // Keep local values and schedule an upload to re-seed the restarted/reset server
                payloadToUpload[key] = localVal;
                needsUpload = true;
              } else {
                const serverList = Array.isArray(serverVal) ? serverVal : [];
                const localList = Array.isArray(localVal) ? localVal : [];

                const map = new Map();
                
                // Add server items (excluding deleted items)
                serverList.forEach((item: any) => {
                  if (item) {
                    const id = item.id !== undefined ? String(item.id) : String(item.name || item.title || '');
                    if (id && !deletedIds.includes(id)) {
                      map.set(id, item);
                    }
                  }
                });

                // Add local items that do not exist yet on server
                localList.forEach((item: any) => {
                  if (item) {
                     const id = item.id !== undefined ? String(item.id) : String(item.name || item.title || '');
                     if (id && !deletedIds.includes(id) && !map.has(id)) {
                       map.set(id, item);
                     }
                  }
                });

                let mergedList = Array.from(map.values());
                if (localKeyName === 'shadow_user_movements') {
                  mergedList = mergedList.filter((log: any) => !(log.text && log.text.toLowerCase().includes('kgab0730')));
                }
                const mergedStr = JSON.stringify(mergedList);

                if (currentLocalStr !== mergedStr) {
                  if ((window as any)._origSetItem) {
                    (window as any)._origSetItem.call(localStorage, localKeyName, mergedStr);
                  } else {
                    localStorage.setItem(localKeyName, mergedStr);
                  }
                  hasAnyDiff = true;
                }

                if (JSON.stringify(serverVal) !== mergedStr) {
                  payloadToUpload[key] = mergedList;
                  needsUpload = true;
                }
              }
            }
          });

          if (needsUpload) {
            fetch('/api/configs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payloadToUpload)
            }).catch(err => console.error('Failed to restore configs to server:', err));
          }

          if (hasAnyDiff) {
            // Dispatch dynamic update event to tell all mount instances to reload from localStorage
            window.dispatchEvent(new Event('shadow_sync_update'));
          }
        })
        .catch(err => {
          // Silent fallback for transient fetch errors during background polling
        });
    };

    fetchConfigs();
    const pollInterval = setInterval(fetchConfigs, 1000); // Check every 1 second for instant replication

    // Listen to native browser tab-to-tab localStorage modification events
    const handleStorageSync = (e: StorageEvent) => {
      const syncKeys = [
        'admin_console_link',
        'custom_projects',
        'custom_anime',
        'custom_games',
        'shadow_master_tutorials',
        'custom_tools',
        'deleted_item_ids'
      ];
      if (e.key && syncKeys.includes(e.key)) {
        window.dispatchEvent(new Event('shadow_sync_update'));
      }
    };
    window.addEventListener('storage', handleStorageSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  // Sync session structures
  useEffect(() => {
    try {
      // 1. Process custom_projects
      const saved = localStorage.getItem('custom_projects');
      let projectsList = saved ? JSON.parse(saved) : [...STATIC_PROJECTS];
      if (Array.isArray(projectsList)) {
        // Filter out Episode 16 and Episode 18 from custom projects list as requested by the user
        projectsList = projectsList.filter((p: any) => {
          const normTitle = p.title?.toLowerCase() || '';
          return !normTitle.includes('episode 16') && !normTitle.includes('episode 18');
        });

        // Merge static projects if they are not in projectsList to prevent blank initialization
        const existingIds = new Set(projectsList.map((p: any) => p.id));
        for (const staticProj of STATIC_PROJECTS) {
          if (!existingIds.has(staticProj.id)) {
            projectsList.push(staticProj);
          }
        }

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
            projectsList[targetIdx].title = 'G.S. W11 ISO / TINYCORE11';
          } else {
            projectsList.push({
              id: '1',
              title: 'G.S. W11 ISO / TINYCORE11',
              description: customDesc || 'all-in-one, bootable Windows Preinstallation Environment (WinPE)',
              link: customLink || 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing'
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
          if (!projectsList[msofficeIdx].link || projectsList[msofficeIdx].link.includes('1PQ2CG9r')) {
            projectsList[msofficeIdx].link = 'https://drive.google.com/file/d/1JOkYke7BPH_i8A6biBkw3hclsnAwFrOv/view?usp=sharing';
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

        // Force update the tool ID '7' to match MEMTEST86 (replacing NOVA DASHBOARD) if it exists with older content
        const memtestIdx = toolsList.findIndex((t: any) => t.id === '7');
        if (memtestIdx !== -1) {
          const t = toolsList[memtestIdx];
          if (t.name !== 'MEMTEST86' || t.category !== 'MEMORY') {
            toolsList[memtestIdx] = {
              ...t,
              name: 'MEMTEST86',
              category: 'MEMORY',
              description: 'The absolute standard for system memory diagnostics and RAM stability testing.'
            };
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

    if (guestLoginTime) {
      localStorage.setItem('guest_login_time', guestLoginTime.toString());
    } else {
      localStorage.removeItem('guest_login_time');
    }
  }, [guestLoginTime]);

  // Guest active session watchdog timer
  useEffect(() => {
    if (!isAuthorized || !isGuestMode || !guestLoginTime || !generatedGuestPasscodeDuration) {
      setGuestSessionExpired(false);
      return;
    }

    const checkExpiration = () => {
      const elapsed = Date.now() - guestLoginTime;
      if (elapsed >= generatedGuestPasscodeDuration * 60 * 1000) {
        setGuestSessionExpired(true);
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [isAuthorized, isGuestMode, guestLoginTime, generatedGuestPasscodeDuration]);

  const getGuestTimeRemainingStr = () => {
    if (!guestLoginTime || !generatedGuestPasscodeDuration) return '';
    const elapsed = Date.now() - guestLoginTime;
    const remaining = Math.max(0, (generatedGuestPasscodeDuration * 60 * 1000) - elapsed);
    const totalSeconds = Math.floor(remaining / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsGuestMode(false);
    setGuestLoginTime(null);
    setGuestSessionExpired(false);
    localStorage.removeItem('guest_login_time');
    localStorage.setItem('is_guest_mode', 'false');
    sessionStorage.removeItem('is_authorized');
    sessionStorage.removeItem('is_admin_mode');
  };

  const handleSessionExpiredLogout = () => {
    handleLogout();
  };

  // Clear any legacy authorized states or stored session marks on mount to require guest and admin login on every reset / re-entry
  useEffect(() => {
    localStorage.removeItem('shadow_sys_authorized');
    localStorage.removeItem('guest_login_time');
    localStorage.setItem('is_guest_mode', 'false');
    sessionStorage.removeItem('is_authorized');
    sessionStorage.removeItem('is_admin_mode');
  }, []);

  const handleSetGeneratedGuestPasscode = (code: string | null) => {
    setGeneratedGuestPasscode(code);
    if (code) {
      const now = Date.now();
      setGeneratedGuestPasscodeTime(now);
      localStorage.setItem('generated_guest_passcode_time', now.toString());
      localStorage.setItem('generated_guest_passcode', code);
    } else {
      setGeneratedGuestPasscodeTime(null);
      localStorage.removeItem('generated_guest_passcode_time');
      localStorage.removeItem('generated_guest_passcode');
    }
  };

  // Sync remaining key codes/settings to stay persist-safe
  useEffect(() => {
    localStorage.setItem('is_guest_mode', isGuestMode.toString());
  }, [isGuestMode]);

  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SOFTWARE');
  const [activeTabLoggedFirst, setActiveTabLoggedFirst] = useState(false);
  useEffect(() => {
    if (!activeTabLoggedFirst) {
      setActiveTabLoggedFirst(true);
      return;
    }
    if ((window as any).logUserMovement) {
      (window as any).logUserMovement('navigation', `Switched category tab to: "${activeTab}"`);
    }
  }, [activeTab]);
  const [showArchive, setShowArchive] = useState(false);
  const [showShadowLoreOnly, setShowShadowLoreOnly] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [copiedText, setCopiedText] = useState<'EMAIL' | 'KEY' | 'PHONE' | null>(null);
  const [showSupportPage, setShowSupportPage] = useState(false);
  const [autoOpenAppointment, setAutoOpenAppointment] = useState(false);

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
    (window as any).logUserMovement = (type: 'chat' | 'navigation' | 'modal' | 'action', text: string) => {
      try {
        // If the text contains the admin passcode/password, do not include it in history.
        if (text && text.toLowerCase().includes('kgab0730')) {
          return;
        }

        const isChat = (type === 'chat');
        const hasInteractedBefore = localStorage.getItem('shadow_chatbot_interacted') === 'true';

        // History starts ONLY when they interact with chatbot.
        // If they have not interacted and this is not a chat interaction, ignore it.
        if (!isChat && !hasInteractedBefore) {
          return;
        }

        // If this is a chat message, make sure they are flagged as interacted
        if (isChat) {
          localStorage.setItem('shadow_chatbot_interacted', 'true');
        }

        // Resolve the Guest User number
        let userNumStr = localStorage.getItem('shadow_user_number');
        if (!userNumStr) {
          let maxNum = 0;
          try {
            const existingStr = localStorage.getItem('shadow_user_movements');
            const existing = existingStr ? JSON.parse(existingStr) : [];
            const regex = /(?:User|USER)\s*(\d+)/i;
            existing.forEach((l: any) => {
              if (l.text) {
                const match = regex.exec(l.text);
                if (match) {
                  const val = parseInt(match[1], 10);
                  if (val > maxNum) maxNum = val;
                }
              }
            });
          } catch (e) {
            console.error(e);
          }
          const nextNum = maxNum + 1;
          userNumStr = 'User ' + String(nextNum).padStart(2, '0');
          localStorage.setItem('shadow_user_number', userNumStr);
        }

        // Format trace message with User number
        const formattedText = `[${userNumStr}] ${text}`;

        const existingStr = localStorage.getItem('shadow_user_movements');
        const parsedExisting = existingStr ? JSON.parse(existingStr) : [];
        const existing = Array.isArray(parsedExisting)
          ? parsedExisting.filter((log: any) => !(log.text && log.text.toLowerCase().includes('kgab0730')))
          : [];
        const newLog = {
          id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000000),
          type,
          text: formattedText,
          user: userNumStr,
          date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase()
        };
        const updated = [newLog, ...existing].slice(0, 300);
        localStorage.setItem('shadow_user_movements', JSON.stringify(updated));
        
        // Dispatch event so that open instances react immediately
        window.dispatchEvent(new Event('shadow_sync_update'));

        // Background push to make changes immediately permanent on the server database
        const payloadToUpload = {
          admin_console_link: localStorage.getItem('admin_console_link') || 'https://drive.google.com',
          user_suggestions: JSON.parse(localStorage.getItem('shadow_suggestions') || '[]'),
          user_appointments: JSON.parse(localStorage.getItem('shadow_appointments') || '[]'),
          user_shout_outs: JSON.parse(localStorage.getItem('shadow_shout_outs_v3') || '[]'),
          user_activity_logs: updated
        };
        fetch('/api/configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToUpload)
        }).catch(err => console.error("Auto-sync log save error:", err));

      } catch (e) {
        console.error("Failed to log activity:", e);
      }
    };
    return () => {
      delete (window as any).triggerRedirectLoader;
      delete (window as any).logUserMovement;
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
        return <MusicView isAdmin={!isGuestMode} />;
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
            className="w-full bg-[#110c26]/90 border-2 border-purple-500/80 rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_60px_rgba(168,85,247,0.55),0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-xl overflow-hidden p-6 md:p-10"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-sm bg-[#0d091e]/95 border-2 border-purple-500/85 rounded-[2rem] p-6 md:p-8 shadow-[0_0_90px_rgba(168,85,247,0.75),0_0_30px_rgba(139,92,246,0.4)] relative overflow-hidden"
              >
                {/* Active Corner Brackets to match style */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-br-xl" />

                <div className="flex justify-between items-center mb-5 pb-3 border-b border-purple-950/40">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <h3 className="text-xs font-black tracking-[0.2em] uppercase font-mono text-purple-200">
                      GUEST LOGIN
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



                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const enteredOriginal = guestPasscode.trim();
                    const enteredLower = enteredOriginal.toLowerCase();
                    const isGeneratedMatch = generatedGuestPasscode && (enteredOriginal === generatedGuestPasscode || enteredLower === generatedGuestPasscode.toLowerCase());
                    
                    // Retrieve/validate any passwords generated dynamically by the chatbot internally/regionally
                    let isChatbotMatch = false;
                    let matchedChatbotCode: string | null = null;
                    try {
                      const chatbotRaw = localStorage.getItem('chatbot_generated_passwords');
                      if (chatbotRaw) {
                        const chatbotCodes: string[] = JSON.parse(chatbotRaw);
                        const found = chatbotCodes.find(code =>
                          code && (enteredOriginal === code || enteredLower === code.toLowerCase())
                        );
                        if (found) {
                          isChatbotMatch = true;
                          matchedChatbotCode = found;
                        }
                      }
                    } catch (err) {
                      console.error("Failed to parse chatbot_generated_passwords", err);
                    }

                    // Query our backend to see if this code was registered globally on the server (works across all browsers and outside the studio)
                    let isServerMatch = false;
                    try {
                      const apiResponse = await fetch('/api/validate-passcode', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ passcode: enteredOriginal })
                      });
                      const apiData = await apiResponse.json();
                      if (apiData.valid) {
                        isServerMatch = true;
                      }
                    } catch (err) {
                      console.error("Failed to validate passcode on server-side", err);
                    }

                    if (enteredLower === 'guest' || isGeneratedMatch || isChatbotMatch || isServerMatch) {
                      setIsAuthorized(true);
                      setIsGuestMode(true);
                      if (isGeneratedMatch || isChatbotMatch || isServerMatch) {
                        const now = Date.now();
                        setGuestLoginTime(now);
                      }
                      
                      // Consume (remove) the used chatbot password locally
                      if (isChatbotMatch && matchedChatbotCode) {
                        try {
                          const chatbotRaw = localStorage.getItem('chatbot_generated_passwords');
                          if (chatbotRaw) {
                            const chatbotCodes: string[] = JSON.parse(chatbotRaw);
                            const updatedList = chatbotCodes.filter(c => c !== matchedChatbotCode);
                            localStorage.setItem('chatbot_generated_passwords', JSON.stringify(updatedList));
                            setAvailablePasscodes(updatedList);
                          }
                        } catch (err) {
                          console.error("Failed to update chatbot_generated_passwords after login", err);
                        }
                      }

                      setShowGuestPopup(false);
                      setGuestAuthError('');
                    } else {
                      setGuestAuthError('INVALID GUEST PASSPHRASE. LOGIN FAILED.');
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
                        className="w-full text-center text-sm font-mono bg-black hover:bg-neutral-900/45 focus:bg-black border border-neutral-800 focus:border-purple-500/60 text-purple-400 p-3 pr-20 rounded-xl outline-none transition-all placeholder:text-neutral-800/60 tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          let pastedText = '';
                          try {
                            // Try the standard clipboard API
                            pastedText = await navigator.clipboard.readText();
                          } catch (err) {
                            // Securely fall back without console warning noise inside iframe sandbox
                          }

                          // 1. Fallback to global window copy-buffer if populated
                          if (!pastedText && (window as any).lastShadowCopiedText) {
                            pastedText = (window as any).lastShadowCopiedText;
                          }

                          // 2. Fallback to local storage copy-buffer if populated
                          if (!pastedText) {
                            const cached = localStorage.getItem('copied_passcode_buffer');
                            if (cached) pastedText = cached;
                          }

                          // 3. Fallback to parsing latest active passcode from the chatbot registry
                          if (!pastedText) {
                            try {
                              const chatbotRaw = localStorage.getItem('chatbot_generated_passwords');
                              if (chatbotRaw) {
                                const chatbotCodes: string[] = JSON.parse(chatbotRaw);
                                if (chatbotCodes && chatbotCodes.length > 0) {
                                  pastedText = chatbotCodes[chatbotCodes.length - 1];
                                }
                              }
                            } catch (_) {}
                          }

                          // 4. Fallback to generatedGuestPasscode variable
                          if (!pastedText && generatedGuestPasscode) {
                            pastedText = generatedGuestPasscode;
                          }

                          if (pastedText && pastedText.trim()) {
                            setGuestPasscode(pastedText.trim());
                            if (guestAuthError) setGuestAuthError('');
                          } else {
                            // Show helpful guidance instructing them on manual paste (browser standard)
                            setGuestAuthError("SECURITY: PROCESS BLOCKED BY BROWSER PERMISSIONS. PLEASE NATIVELY PRESS CTRL+V OR LONG-PRESS TO PASTE.");
                          }
                        }}
                        className="absolute right-10 text-neutral-500 hover:text-purple-400 transition-colors p-1.5 rounded cursor-pointer z-10"
                        title="Paste passcode"
                      >
                        <Clipboard size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGuestPasscode(!showGuestPasscode)}
                        className="absolute right-3 text-neutral-500 hover:text-purple-400 transition-colors p-1.5 rounded cursor-pointer z-10"
                        title={showGuestPasscode ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showGuestPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 active:scale-98 text-white font-mono text-[9px] font-extrabold tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    >
                      <Unlock size={10} />
                      GUEST LOGIN
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



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

        <div className="w-full max-w-lg relative z-20 flex flex-col items-center gap-3 sm:gap-4 px-4">
          <AnimatePresence mode="wait">
            {showOverrideInput && (
              <motion.div
                key="access-card"
                initial={{ opacity: 0, scale: 0.96, y: -15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full bg-[#0f0b21]/85 border-2 border-purple-500/80 rounded-[2.2rem] p-8 md:p-10 shadow-[0_0_80px_rgba(168,85,247,0.75),0_0_30px_rgba(139,92,246,0.4)] backdrop-blur-xl relative overflow-hidden"
              >
                {/* Active Corner Brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] rounded-br-xl" />

                {/* X Close top-right button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowOverrideInput(false);
                    setAuthError('');
                  }}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer z-50"
                  title="Close"
                >
                  <X size={16} />
                </button>

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

                <p className="text-[10px] md:text-[11px] text-neutral-400 tracking-wide leading-relaxed text-center mb-6 font-mono">
                  Type in your secure verification passcode. If authentic, the root system loading screen will be initiated.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const entered = passcode.trim();
                    
                    const deleteUserHistory = () => {
                      try {
                        const shadowUserNum = localStorage.getItem('shadow_user_number');
                        if (shadowUserNum) {
                          const numPart = shadowUserNum.replace(/\D/g, '');
                          const formattedUser = 'User ' + numPart.padStart(2, '0');
                          
                          const existingStr = localStorage.getItem('shadow_user_movements');
                          if (existingStr) {
                            const logs = JSON.parse(existingStr);
                            if (Array.isArray(logs)) {
                              const updated = logs.filter((log: any) => {
                                let logUser = log.user;
                                if (!logUser && log.text) {
                                  const match = /\[(?:User|USER)\s*(\d+)\]/i.exec(log.text);
                                  if (match) logUser = 'User ' + match[1];
                                }
                                if (!logUser) return true;
                                const logNumPart = logUser.replace(/\D/g, '');
                                const formattedLogUser = 'User ' + logNumPart.padStart(2, '0');
                                return formattedLogUser !== formattedUser;
                              });
                              localStorage.setItem('shadow_user_movements', JSON.stringify(updated));
                              window.dispatchEvent(new Event('shadow_sync_update'));
                              
                              // sync to backend server config
                              const payloadToUpload = {
                                admin_console_link: localStorage.getItem('admin_console_link') || 'https://drive.google.com',
                                user_suggestions: JSON.parse(localStorage.getItem('shadow_suggestions') || '[]'),
                                user_appointments: JSON.parse(localStorage.getItem('shadow_appointments') || '[]'),
                                user_shout_outs: JSON.parse(localStorage.getItem('shadow_shout_outs_v3') || '[]'),
                                user_activity_logs: updated
                              };
                              fetch('/api/configs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payloadToUpload)
                              }).catch(err => console.error("Auto-sync clean save error:", err));
                            }
                          }
                        }
                      } catch (cleanErr) {
                        console.error("Clean error on admin entry:", cleanErr);
                      }
                    };

                    try {
                      const msgBuffer = new TextEncoder().encode(entered);
                      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                      const hashArray = Array.from(new Uint8Array(hashBuffer));
                      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                      
                      if (hashHex === 'cf7a14191ac01a39913eadfae86c9e032ec7bd69fe01d452113f54ea6eef68ef') {
                        setIsAuthorized(true);
                        setIsGuestMode(false);
                        setAuthError('');
                        sessionStorage.setItem('is_authorized', 'true');
                        sessionStorage.setItem('is_admin_mode', 'true');
                        deleteUserHistory();
                      } else {
                        setAuthError('INVALID SECURITY PASSPHRASE. LINK DENIED.');
                        setPasscode('');
                      }
                    } catch (err) {
                      // Fallback verification using basic obscuration in case subtle crypto is unavailable
                      if (btoa(entered) === 'S0dhYjA3MzA=') {
                        setIsAuthorized(true);
                        setIsGuestMode(false);
                        setAuthError('');
                        sessionStorage.setItem('is_authorized', 'true');
                        sessionStorage.setItem('is_admin_mode', 'true');
                        deleteUserHistory();
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
                        className="w-full text-center text-sm font-mono bg-black hover:bg-neutral-900/45 focus:bg-black border border-neutral-800 focus:border-purple-500/60 text-purple-400 p-3 pr-20 rounded-xl outline-none transition-all placeholder:text-neutral-800 tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          let pastedText = '';
                          try {
                            // Try the standard clipboard API
                            pastedText = await navigator.clipboard.readText();
                          } catch (err) {
                            // Securely fall back without console warning noise inside iframe sandbox
                          }

                          // 1. Fallback to global window copy-buffer if populated
                          if (!pastedText && (window as any).lastShadowCopiedText) {
                            pastedText = (window as any).lastShadowCopiedText;
                          }

                          // 2. Fallback to local storage copy-buffer if populated
                          if (!pastedText) {
                            const cached = localStorage.getItem('copied_passcode_buffer');
                            if (cached) pastedText = cached;
                          }

                          if (pastedText && pastedText.trim()) {
                            setPasscode(pastedText.trim());
                            if (authError) setAuthError('');
                          } else {
                            setAuthError("SECURITY: PROCESS BLOCKED BY BROWSER PERMISSIONS. PLEASE NATIVELY PRESS CTRL+V OR LONG-PRESS TO PASTE.");
                          }
                        }}
                        className="absolute right-10 text-neutral-500 hover:text-purple-400 transition-colors p-1.5 rounded cursor-pointer z-10"
                        title="Paste passcode"
                      >
                        <Clipboard size={14} />
                      </button>
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
                      <span>CLOSE</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {!showOverrideInput && (
              <motion.div
                key="chatbot-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-[74%] min-[360px]:w-[78%] min-[400px]:w-[80%] sm:w-full max-w-[245px] min-[360px]:max-w-[275px] min-[400px]:max-w-[315px] sm:max-w-[380px] h-[430px] min-[360px]:h-[455px] min-[400px]:h-[485px] sm:h-[515px] bg-[#1d1f2b] border-2 border-purple-500/70 rounded-[2rem] shadow-[0_0_60px_rgba(168,85,247,0.65),0_0_20px_rgba(139,92,246,0.35),0_15px_50px_rgba(147,51,234,0.25)] flex flex-col overflow-visible relative font-sans text-white backdrop-blur-md"
              >
                {/* Left Side vertical glowing banner (Visible on Mobile + Desktop) */}
                <div className="absolute -left-6 min-[350px]:-left-8 sm:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-3 select-none pointer-events-none z-30 w-8">
                  {/* Ambient Cyber Light Nodes travelling vertically */}
                  <div className="absolute inset-x-0 h-40 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex items-center justify-center">
                    <motion.div
                      animate={{ y: [-80, 80] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                      className="w-1.5 h-1.5 rounded-full bg-gradient-to-t from-fuchsia-400 to-purple-500 blur-[1px] absolute"
                    />
                    <motion.div
                      animate={{ y: [80, -80] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1.5 }}
                      className="w-1 h-1 rounded-full bg-pink-400 blur-[0.5px] absolute"
                    />
                  </div>

                  {/* Behind-the-line Rotating Cyber Magic Seal */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center opacity-40 select-none pointer-events-none">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full text-purple-500/40 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4, 4" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.75" />
                      <polygon points="50,18 78,68 22,68" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <polygon points="50,82 78,32 22,32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    </motion.svg>
                  </div>

                  <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-ping" />
                  <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-b from-purple-500/20 via-purple-500 to-pink-500/80 animate-pulse" />
                  
                  {/* Vertically gliding banner - Eminence in Shadow Slime magic style */}
                  <motion.div
                    animate={{ 
                      y: [-120, -80, 80, 120],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                      duration: 5.5, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2" 
                      style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                    >
                      <span className="text-[8.5px] min-[360px]:text-[10.5px] sm:text-[13px] lg:text-[15px] font-mono font-black tracking-[0.25em] min-[360px]:tracking-[0.35em] bg-gradient-to-b from-white via-purple-300 to-fuchsia-400 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_0_12px_rgba(168,85,247,0.95)] animate-[pulse_1.5s_infinite]">
                        USE PASSWORD IN CHAT TO ENTER
                      </span>
                      <Key className="text-fuchsia-400 rotate-90 stroke-[3] drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </motion.div>

                  <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-t from-purple-500/20 via-purple-500 to-pink-500/80 animate-pulse" />
                  <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899] animate-ping" />
                </div>

                {/* Right Side vertical glowing banner (Visible on Mobile + Desktop) */}
                <div className="absolute -right-6 min-[350px]:-right-8 sm:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-3 select-none pointer-events-none z-30 w-8">
                  {/* Ambient Cyber Light Nodes travelling vertically */}
                  <div className="absolute inset-x-0 h-40 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex items-center justify-center">
                    <motion.div
                      animate={{ y: [80, -80] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-1.5 h-1.5 rounded-full bg-gradient-to-t from-pink-400 to-purple-500 blur-[1px] absolute"
                    />
                    <motion.div
                      animate={{ y: [-80, 80] }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: "linear", delay: 1 }}
                      className="w-1 h-1 rounded-full bg-fuchsia-400 blur-[0.5px] absolute"
                    />
                  </div>

                  {/* Behind-the-line Rotating Cyber Magic Seal (Counter Rotating) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center opacity-40 select-none pointer-events-none">
                    <motion.svg
                      animate={{ rotate: -360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full text-pink-500/40 drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]"
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3, 3" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="12, 4" />
                      <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="0.75" />
                      <line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.75" />
                      <polygon points="50,22 76,41 66,73 34,73 24,41" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="0.75" />
                    </motion.svg>
                  </div>

                  <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899] animate-ping" />
                  <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-b from-pink-500/20 via-pink-500 to-purple-500/80 animate-pulse" />
                  
                  {/* Vertically gliding banner - Eminence in Shadow Slime magic style (Staggered) */}
                  <motion.div
                    animate={{ 
                      y: [-120, -80, 80, 120],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                      duration: 5.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className="flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2" 
                      style={{ writingMode: 'vertical-lr' }}
                    >
                      <span className="text-[8.5px] min-[360px]:text-[10.5px] sm:text-[13px] lg:text-[15px] font-mono font-black tracking-[0.25em] min-[360px]:tracking-[0.35em] bg-gradient-to-b from-white via-purple-300 to-fuchsia-400 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_0_12px_rgba(168,85,247,0.95)] animate-[pulse_1.5s_infinite]">
                        USE PASSWORD IN CHAT TO ENTER
                      </span>
                      <Key className="text-fuchsia-400 -rotate-90 stroke-[3] drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </motion.div>

                  <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-t from-pink-500/20 via-pink-500 to-purple-500/80 animate-pulse" />
                  <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-ping" />
                </div>

                {/* Chatbot Header */}
                <div className="bg-[#151722] p-4 flex items-center justify-between border-b border-[#252838] select-none shrink-0 rounded-t-[2rem] relative">
                  <div className="flex items-center">
                    {/* Floating Circular Chathead character that goes beyond the chatbox with clean rounded-full overflow-hidden */}
                    <div className="absolute -top-4 -left-4 z-30 select-none group">
                      <div className="relative flex items-center justify-center">
                        {/* Outer shining border frame of the avatar (glowing circle matching design mockups perfectly) */}
                        <div className="w-[82px] h-[82px] rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 p-[3px] shadow-[0_4px_22px_rgba(168,85,247,0.6)] relative">
                          <div className="w-full h-full rounded-full bg-[#12101e] border-2 border-white overflow-hidden flex items-center justify-center relative shadow-inner">
                            {/* The Circular Shadow Chibi (Sticker) perfectly clipped to absolute circle, dropping white corners */}
                            <img
                              src={shadowChibiSticker}
                              alt="Shadow Avatar Circular"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover scale-[1.05] transform group-hover:scale-112 transition-transform duration-300"
                            />
                          </div>
                        </div>

                        {/* Online Status Badge sitting on the bottom-right of the circular ring */}
                        <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-[#42b783] border-2 border-[#151722] rounded-full flex items-center justify-center shadow-lg">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
                        </span>
                      </div>
                    </div>

                    {/* Chatbot Title and online label, indented generously to match the floating avatar */}
                    <div className="pl-20 sm:pl-24 text-left">
                      <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-widest leading-none font-sans filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        Shadow
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Online</span>
                        {isChatBossMode && (
                          <span className="ml-2.5 text-[9px] text-purple-400 font-extrabold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-950/40 animate-pulse">
                            Boss Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option to clear chat & Guest Login trigger removed */}
                </div>

                {/* Messages Body Scroll Area */}
                <div className="flex-1 bg-[#101119] p-4 overflow-y-auto space-y-4 scroll-smooth">
                  {chatMessages.map((msg, msgIndex) => {
                    const isLastBotMsg = msg.sender === 'bot' && msgIndex === chatMessages.map(m => m.sender).lastIndexOf('bot');
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-500/40 bg-[#12101e] shrink-0 mt-0.5 shadow-sm flex items-center justify-center">
                          <img
                            src={shadowChibiSticker}
                            alt="Shadow Chathead"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transform scale-[1.05]"
                          />
                        </div>
                      )}
                      
                      <div className="relative max-w-[80%] select-text flex flex-col items-start">
                        <div
                          className={`p-3 rounded-2xl text-[11.5px] leading-relaxed font-medium tracking-wide w-full ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 text-white rounded-tr-none shadow-md'
                              : 'bg-[#1b1c25] border border-[#262835] text-slate-100 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {renderMessageContent(msg.text, msg.sender)}
                        </div>

                        {/* Guest Login button under bot bubbles which have a passcode */}
                        {msg.sender === 'bot' && (() => {
                          const code = extractPasscode(msg.text);
                          if (code) {
                            return (
                              <button
                                type="button"
                                id="guest-login-modal-btn"
                                onClick={() => {
                                  setGuestAuthError('');
                                  setGuestPasscode('');
                                  setShowGuestPopup(true);
                                }}
                                className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 border border-purple-500/25 text-white font-sans text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-md transition-all cursor-pointer select-none"
                              >
                                <Unlock size={11} className="text-purple-200" />
                                <span>GUEST LOGIN</span>
                              </button>
                            );
                          }
                          return null;
                        })()}

                        {/* Book Appointment button */}
                        {msg.sender === 'bot' && (msg.isAppointmentRequest || msg.text.toLowerCase().includes('schedule') || msg.text.toLowerCase().includes('appointment') || msg.text.toLowerCase().includes('matingnan po natin ang computer ninyo')) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isAuthorized) {
                                setIsAuthorized(true);
                                setIsGuestMode(true);
                              }
                              setShowArchive(false);
                              setAutoOpenAppointment(true);
                            }}
                            className="mt-2.5 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/20 text-white font-mono text-[9px] sm:text-[10px] uppercase font-black tracking-wider rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95 select-none"
                          >
                            <Calendar size={11} className="text-emerald-100 animate-pulse" />
                            <span>BOOK APPOINTMENT</span>
                          </button>
                        )}

                        {/* Log Update button for Owner/Boss queries */}
                        {isLastBotMsg && isChatBossMode && (
                          <button
                            type="button"
                            onClick={() => setShowLogUpdateModal(true)}
                            className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.45)] hover:shadow-[0_0_22px_rgba(168,85,247,0.6)] transition-all duration-300 cursor-pointer border border-purple-400/30 active:scale-95 select-none"
                          >
                            <Terminal className="w-3.5 h-3.5 animate-pulse" />
                            <span>LOG UPDATE</span>
                          </button>
                        )}


                        {/* Golden coin emoji next to user bubbles as in reference image */}
                        {msg.sender === 'user' && (
                          <div className="absolute -right-2 top-2 bg-[#fcd34d] text-neutral-900 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm select-none">
                            🪙
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                  {/* Typing Indicator */}
                  {chatLoading && (
                    <div className="flex items-start gap-2.5 justify-start">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-500/40 bg-[#12101e] shrink-0 mt-0.5 shadow-sm flex items-center justify-center animate-pulse">
                        <img
                          src={shadowChibiSticker}
                          alt="Shadow Chathead typing"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transform scale-[1.05]"
                        />
                      </div>
                      <div className="bg-[#1b1c25] border border-[#262835] p-3 rounded-2xl rounded-tl-none text-[11px] text-zinc-400 flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  {/* Empty Element for Auto-Scroller Pin */}
                  <div ref={chatEndRef} />
                </div>





                {/* Suggestions / Hot Chips for easier interactive navigation - Always visible */}
                <div className="px-4 pb-2.5 pt-1 bg-[#101119] flex flex-wrap gap-1.5 justify-center shrink-0">
                  {[
                    "Anong mayroon dito?",
                    "Hingi ng passcode, pre"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setChatInput(chip);
                      }}
                      className="px-2.5 py-1 bg-[#1b1c25] hover:bg-purple-950/40 border border-[#262835] hover:border-purple-500/30 text-zinc-300 hover:text-white rounded-lg text-[10px] font-medium transition-all duration-200 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Form Input Footer */}
                <div className="bg-[#151722] p-3 border-t border-[#252838] flex flex-col gap-2 shrink-0 rounded-b-[2rem]">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!chatInput.trim() || chatLoading) return;

                      const userMsgText = chatInput;
                      setChatInput('');

                      let enteredTextClean = userMsgText.trim();
                      let isPasscodeMatched = false;
                      try {
                        const msgBuffer = new TextEncoder().encode(enteredTextClean);
                        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                        if (hashHex === 'cf7a14191ac01a39913eadfae86c9e032ec7bd69fe01d452113f54ea6eef68ef') {
                          isPasscodeMatched = true;
                        }
                      } catch (e) {
                        console.error(e);
                      }

                      let currentBossState = isChatBossMode;
                      if (isPasscodeMatched || userMsgText.toLowerCase().trim() === 'kgab0730') {
                        setIsChatBossMode(true);
                        currentBossState = true;
                      }

                      // Append user message
                      const userMsg = {
                        id: `user-${Date.now()}`,
                        sender: 'user' as const,
                        text: userMsgText,
                        timestamp: new Date()
                      };
                      setChatMessages((prev) => [...prev, userMsg]);
                      if ((window as any).logUserMovement) {
                        (window as any).logUserMovement('chat', `Typed in chatbot: "${userMsgText}"`);
                      }
                      setChatLoading(true);

                      const normText = userMsgText.toLowerCase().trim();
                      const physicalHW = [
                        "ram", "memory", "ddr4", "ddr5", "ddr3",
                        "motherboard", "mobo", "mainboard", "board", "board-level",
                        "cpu", "processor", "intel", "ryzen", "amd", "i5", "i7", "i9", "ryzen 5", "ryzen 7",
                        "gpu", "video card", "videocard", "graphics card", "nvidia", "rtx", "gtx", "radeon",
                        "power supply", "psu", "power cord", "charger",
                        "hard drive", "hdd", "ssd", "m.2", "nvme",
                        "fan", "cooler", "heatsink", "liquid cooling", "fan motor", "cooling fan",
                        "screen", "monitor", "display", "panel", "lcd",
                        "keyboard", "mouse", "headset", "speaker", "webcam", "camera", "microphone", "mic",
                        "case", "chassis", "tower", "cables", "wire"
                      ];

                      const isHardwareWord = physicalHW.some(hw => {
                        return normText === hw || 
                               normText.includes(" " + hw + " ") || 
                               normText.startsWith(hw + " ") || 
                               normText.endsWith(" " + hw) || 
                               normText.includes("-" + hw) || 
                               normText.includes(hw + "-") ||
                               normText.includes(" " + hw) ||
                               normText.includes(hw + " ");
                      });

                      const isHwRepairQuery = normText.includes("hardware repair") || 
                        normText.includes("hardware na sira") || 
                        normText.includes("ayusin ang hardware") || 
                        normText.includes("paggawa ng hardware") || 
                        normText.includes("ayusin ang ram") ||
                        normText.includes("nag aayos kayo ng ram") ||
                        normText.includes("nag aayos kayo ng gpu") ||
                        (normText.includes("hardware") && (normText.includes("repair") || normText.includes("ayos") || normText.includes("sira") || normText.includes("gawa") || normText.includes("palit") || normText.includes("unbox"))) ||
                        (isHardwareWord && (
                          normText.includes("repair") || 
                          normText.includes("ayos") || 
                          normText.includes("sira") || 
                          normText.includes("gawa") || 
                          normText.includes("palit") || 
                          normText.includes("linis") || 
                          normText.includes("basag") ||
                          normText.includes("burnt") ||
                          normText.includes("sunog") ||
                          normText.includes("kabit") ||
                          normText.includes("isaksak") ||
                          normText.includes("pundido") ||
                          normText.includes("basa") ||
                          normText.includes("water damage") ||
                          normText.includes("ipagawa") ||
                          normText.includes("mag-ayos") ||
                          normText.includes("magaayos") ||
                          normText.includes("magpagawa") ||
                          normText.includes("pagawa") ||
                          normText.includes("papalitan") ||
                          normText.includes("palitan")
                        ));

                      if (normText.includes("cpu")) {
                        setTimeout(() => {
                          setChatMessages((prev) => [
                            ...prev,
                            {
                              id: `bot-${Date.now()}`,
                              sender: 'bot' as const,
                              text: "Teka pre, computer ba ang tinutukoy mo? Kasi ang CPU, part lang siya ng computer at hindi kami nag-aayos ng physical hardware. Online repair lang ang gawa namin dito. Ano ba ang problema ng PC mo, pre? 💻⚡",
                              timestamp: new Date()
                            }
                          ]);
                          setChatLoading(false);
                        }, 500);
                        return;
                      }

                      if (isHwRepairQuery) {
                        setTimeout(() => {
                          setChatMessages((prev) => [
                            ...prev,
                            {
                              id: `bot-${Date.now()}`,
                              sender: 'bot' as const,
                              text: "Pasensya na, pre, pero hindi kami nag-o-offer ng hardware repair. Tanging online repair services lamang ang iniaalok namin—ibig sabihin ay inaayos namin ang inyong PC online kaya hindi kami pwedeng makasama ninyo nang personal o pumunta dyan habang ginagawa ito. 💻⚡",
                              timestamp: new Date()
                            }
                          ]);
                          setChatLoading(false);
                        }, 500);
                        return;
                      }

                      try {
                        const response = await fetch('/api/shadow-chat', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ 
                            message: userMsgText,
                            isBossMode: currentBossState,
                            history: chatMessages.slice(-10).map(msg => ({
                              sender: msg.sender,
                              text: msg.text
                            }))
                          })
                        });
                        const data = await response.json();
                        
                        // Dynamically discover and cache chatbot-generated passwords
                        const discoveredCodes = new Set<string>();
                        if (data.generatedPasscodes && Array.isArray(data.generatedPasscodes)) {
                          data.generatedPasscodes.forEach((code: any) => {
                            if (code && typeof code === 'string') {
                              discoveredCodes.add(code);
                            }
                          });
                        }
                        if (data.text) {
                          // Extract backticked expressions (e.g. `code`)
                          const backtickRegex = /`([^`]+)`/g;
                          let match;
                          while ((match = backtickRegex.exec(data.text)) !== null) {
                            if (match[1] && match[1].trim()) {
                              discoveredCodes.add(match[1].trim());
                            }
                          }

                          // Regex extraction fallback for plain words following password/passcode/key/code
                          const lines = data.text.split('\n');
                          lines.forEach((line: string) => {
                            const pwMatch = line.match(/(?:password|passcode|key|code):\s*(\S+)/i);
                            if (pwMatch && pwMatch[1]) {
                              // clean backticks, quotes, punctuation, or spaces
                              const candidate = pwMatch[1]
                                .replace(/[`'".,\/#!$%\^&\*;:{}=\-_~()?\s]+$/, '')
                                .replace(/^[`'"]+/, '');
                              if (candidate && candidate.length >= 6) {
                                discoveredCodes.add(candidate);
                              }
                            }
                          });
                        }

                        if (discoveredCodes.size > 0) {
                          try {
                            const savedRaw = localStorage.getItem('chatbot_generated_passwords');
                            let savedList: string[] = [];
                            if (savedRaw) {
                              savedList = JSON.parse(savedRaw);
                            }
                            discoveredCodes.forEach(code => {
                              if (!savedList.includes(code)) {
                                savedList.push(code);
                              }
                              // Put into instant-copy fallback buffers for paste button resilience!
                              try {
                                (window as any).lastShadowCopiedText = code;
                                localStorage.setItem('copied_passcode_buffer', code);
                              } catch (_) {}
                            });
                            localStorage.setItem('chatbot_generated_passwords', JSON.stringify(savedList));
                            setAvailablePasscodes(savedList);
                          } catch (err) {
                            console.error("Error storing chatbot-generated passwords:", err);
                          }
                        }
                        
                        // Append bot reply
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            id: `bot-${Date.now()}`,
                            sender: 'bot' as const,
                            text: data.text || data.error || `Yo! Chat is a bit busy, but you said: "${userMsgText}"`,
                            timestamp: new Date(),
                            isAppointmentRequest: data.isAppointmentRequest || false
                          }
                        ]);
                      } catch (err: any) {
                        console.error("Chatback Proxy Error, running client-side offline brain fallback:", err);
                        
                        // Run identical offline responder fallback
                        const norm = userMsgText.toLowerCase().trim();
                        let replyText = "Yo chong, chill muna tayo dito. Ano ba maitutulong ko sa system mo ngayon? Sabihin mo lang sa akin, pre! 😎";
                        
                        const isNeg = 
                          norm.includes("why") || 
                          norm.includes("bakit") || 
                          norm.includes("dont") || 
                          norm.includes("don't") || 
                          norm.includes("wag") || 
                          norm.includes("huwag") || 
                          norm.includes("stupid") || 
                          norm.includes("bobo") || 
                          norm.includes("did not") || 
                          norm.includes("didn't") || 
                          norm.includes("not asking") || 
                          norm.includes("without") || 
                          norm.includes("dodge") || 
                          norm.includes("other output") ||
                          norm.includes("complaint") ||
                          norm.includes("bubu");

                        const hasReq = 
                          norm.includes("hingi") || 
                          norm.includes("pahingi") || 
                          norm.includes("bigyan") || 
                          norm.includes("get") || 
                          norm.includes("give") || 
                          norm.includes("generate") || 
                          norm.includes("makuha") || 
                          norm.includes("pwede makahingi") || 
                          norm.includes("pasilip") || 
                          norm.includes("request") || 
                          norm.includes("papasok") || 
                          norm.includes("access") || 
                          norm.includes("enter") || 
                          norm.includes("maka-enter") || 
                          norm.includes("makaenter") || 
                          norm.includes("paano makapasok") || 
                          norm.includes("ano ang");

                        const hasPW = 
                          norm.includes("passcode") || 
                          norm.includes("password") || 
                          norm.includes("key") || 
                          norm.includes("code");

                        const isCodeWanted = !isNeg && (
                          (hasPW && hasReq) ||
                          norm === "passcode" ||
                          norm === "password" ||
                          norm === "code" ||
                          norm === "key" ||
                          norm === "open"
                        );

                        if (isCodeWanted) {
                          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                          let code = "";
                          for (let i = 0; i < 8; i++) {
                            code += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          replyText = `Eto po yung password, lods: \`${code}\``;
                          
                          // Save generated code to guest's valid passcode list
                          try {
                            const savedRaw = localStorage.getItem('chatbot_generated_passwords');
                            let savedList: string[] = [];
                            if (savedRaw) {
                              savedList = JSON.parse(savedRaw);
                            }
                            if (!savedList.includes(code)) {
                              savedList.push(code);
                            }
                            localStorage.setItem('chatbot_generated_passwords', JSON.stringify(savedList));
                            setAvailablePasscodes(savedList);
                            // Put into instant-copy fallback buffers for paste button resilience!
                            (window as any).lastShadowCopiedText = code;
                            localStorage.setItem('copied_passcode_buffer', code);
                          } catch (e) {
                            console.error("Client fallback save secret err", e);
                          }
                        }

                        const nonServiceKeywords = [
                          "printer", "scanner", "photocopy", "xerox", "copier", "ink", "iphone", "android", "samsung", 
                          "phone screen", "mobile", "cellphone", "ipad", "tablet", "water damage", "nabasa", "mabasa",
                          "hinge", "basag na screen", "crack na casing", "dent", "dent repair", "soldering", "reball",
                          "motherboard short", "macbook battery", "macbook display", "ps5", "xbox", "nintendo", "switch", 
                          "console", "lens", "joystick"
                        ];
                        const servicesKeywords = [
                          "sira", "broken", "pc won't", "boot", "black screen", "blue screen", "bsod", "slow", "lag", "hang", 
                          "overheat", "overheating", "init", "mainit", "mabilis uminit", "cpu temp", "gpu temp", "crash", 
                          "virus", "malware", "bios", "mbr", "gpt", "partition", "deleted", "recover", "restoration", "lost file",
                          "clone", "cloning", "backup", "system image", "os image", "iso image", "windows image", "backup image", "windows install", "reformat", "format", "password reset", 
                          "reset password", "forgot password", "unblock", "lock screen", "assemble", "build pc", "parts", 
                          "compatibility", "compatible", "upgrade", "thermal", "pindot", "ayaw mag-open", "ayaw bumukas", 
                          "no power", "restart", "restarting"
                        ];

                        const isNoHelpOfPC = 
                          norm === "wala" || 
                          norm === "wala naman" || 
                          norm === "no" || 
                          norm === "none" || 
                          norm === "all good" ||
                          norm === "ok naman" ||
                          norm === "okay naman" ||
                          norm === "walang problema" ||
                          norm === "ayos lang" ||
                          norm === "goods lang" ||
                          norm === "goods naman" ||
                          norm.startsWith("wala ") ||
                          norm.includes("no problem") ||
                          norm.includes("wala naman problema") ||
                          norm.startsWith("no ") ||
                          (norm.includes("wala") && !norm.includes("virus") && !norm.includes("file") && !norm.includes("recover") && !norm.includes("sira"));

                        const isConfusedInClient = 
                          norm.includes("dko lam") || 
                          norm.includes("dko alam") || 
                          norm.includes("di ko alam") || 
                          norm.includes("hindi ko alam") || 
                          norm.includes("diko alam") || 
                          norm.includes("di ko maintindihan") || 
                          norm.includes("diko maintindihan") || 
                          norm.includes("ano ba yan") || 
                          norm.includes("ano yan") || 
                          norm.includes("di ko magets") || 
                          norm.includes("dko magets");

                        const isNonServiceInClient = nonServiceKeywords.some(keyword => norm.includes(keyword));
                        const physicalHardwareWords = [
                          "ram", "memory", "ddr4", "ddr5", "ddr3",
                          "motherboard", "mobo", "mainboard", "board",
                          "cpu", "processor", "intel", "ryzen", "amd", "i5", "i7", "i9", "ryzen 5", "ryzen 7",
                          "gpu", "video card", "videocard", "graphics card", "nvidia", "rtx", "gtx", "radeon",
                          "power supply", "psu", "power cord", "charger",
                          "hard drive", "hdd", "ssd", "m.2", "nvme",
                          "fan", "cooler", "heatsink", "liquid cooling", "fan motor", "cooling fan",
                          "screen", "monitor", "display", "panel", "lcd",
                          "keyboard", "mouse", "headset", "speaker", "webcam", "camera", "microphone", "mic",
                          "case", "chassis", "tower", "cables", "wire"
                        ];

                        const hasPhysicalHardwareWord = physicalHardwareWords.some(hw => {
                          return norm === hw || norm.includes(" " + hw + " ") || norm.startsWith(hw + " ") || norm.endsWith(" " + hw) || norm.includes("-" + hw) || norm.includes(hw + "-");
                        });

                        const isHardwareRepair = norm.includes("hardware repair") || 
                          norm.includes("hardware na sira") || 
                          norm.includes("ayusin ang hardware") || 
                          norm.includes("paggawa ng hardware") || 
                          norm.includes("ayusin ang ram") ||
                          norm.includes("nag aayos kayo ng ram") ||
                          (norm.includes("hardware") && (norm.includes("repair") || norm.includes("ayos") || norm.includes("sira") || norm.includes("gawa") || norm.includes("palit") || norm.includes("unbox"))) ||
                          (hasPhysicalHardwareWord && (
                            norm.includes("repair") || 
                            norm.includes("ayos") || 
                            norm.includes("sira") || 
                            norm.includes("gawa") || 
                            norm.includes("palit") || 
                            norm.includes("linis") || 
                            norm.includes("basag") ||
                            norm.includes("burnt") ||
                            norm.includes("sunog") ||
                            norm.includes("kabit") ||
                            norm.includes("isaksak") ||
                            norm.includes("pundido") ||
                            norm.includes("basa") ||
                            norm.includes("water damage") ||
                            norm.includes("ipagawa") ||
                            norm.includes("mag-ayos") ||
                            norm.includes("magaayos") ||
                            norm.includes("magpagawa") ||
                            norm.includes("pagawa") ||
                            norm.includes("papalitan") ||
                            norm.includes("palitan")
                          ));
                        const isServiceInClient = servicesKeywords.some(keyword => norm.includes(keyword)) || norm.includes("repair") || norm.includes("repairing") || norm.includes("ayusin");
                        
                        const isAppointmentInClient = [
                          "appointment", "schedule", "magpasched", "magpa-schedule", "book", "booking", 
                          "mag-book", "reserve", "reservation", "slot", "pabook", "sched", "calendar", "kailan ka pwede"
                        ].some(keyword => norm.includes(keyword));

                        const isImageGenerationRequest = 
                          (norm.includes("gawa ka") && (norm.includes("image") || norm.includes("larawan") || norm.includes("drawing") || norm.includes("picture") || norm.includes("photo") || norm.includes("sining") || norm.includes("gupit"))) ||
                          (norm.includes("create") && (norm.includes("image") || norm.includes("picture") || norm.includes("photo") || norm.includes("drawing") || norm.includes("logo") || norm.includes("avatar"))) ||
                          (norm.includes("generate") && (norm.includes("image") || norm.includes("picture") || norm.includes("photo") || norm.includes("drawing") || norm.includes("logo") || norm.includes("avatar"))) ||
                          norm.includes("draw") ||
                          norm.includes("drawing");

                        let isReplyAppointment = false;

                        if (isImageGenerationRequest) {
                          let subject = "image";
                          const match = norm.match(/(?:gawa ka|create|generate|draw|painting of|picture of|photo of)\s+(?:ng\s+)?([a-z0-9\s\-]+?)\s+(?:image|picture|photo|drawing|draw)/i) 
                                        || norm.match(/(?:gawa ka|create|generate|draw)\s+(?:ng\s+)?([a-z0-9\s\-]+)/i);
                          if (match && match[1]) {
                            const cleanSubj = match[1].trim();
                            if (cleanSubj.length > 2 && cleanSubj.length < 30 && cleanSubj !== "ng" && cleanSubj !== "ka") {
                              subject = `${cleanSubj} image`;
                            }
                          }
                          replyText = `Pasensya na po, wala po akong capability na gumawa ng ${subject}, ako ay chatbot lamang. 😅 Pero kung may tanong po kayo tungkol sa system o PC diagnostics, sabihan niyo lang po ako!`;
                        } else if (isCodeWanted) {
                          // code logic already handled above or can be left or handled here cleanly.
                          // Since we processed code in the original block, we'll keep the chain consistent
                        } else if (norm.includes("cpu")) {
                          replyText = "Teka pre, computer ba ang tinutukoy mo? Kasi ang CPU, part lang siya ng computer at hindi kami nag-aayos ng physical hardware. Online repair lang ang gawa namin dito. Ano ba ang problema ng PC mo, pre? 💻⚡";
                        } else if (isHardwareRepair) {
                           replyText = "Pasensya na, pre, pero hindi kami nag-o-offer ng hardware repair. Tanging online repair services lamang ang iniaalok namin—ibig sabihin ay inaayos namin ang inyong PC online kaya hindi kami pwedeng makasama ninyo nang personal o pumunta dyan habang ginagawa ito. 💻⚡";
                         } else if (isAppointmentInClient) {
                          replyText = "Ayos pre! Pwedeng-pwede tayong mag-schedule ng appointment para matingnan natin ang computer mo sa aming Portal. I-click mo lang 'tong button sa ibaba para mag-set up at mag-book agad ng slot! 📅⚡";
                          isReplyAppointment = true;
                        } else if (isNoHelpOfPC) {
                          replyText = "Sige pre, okay lang! Pero baka may napapansin ka namang kakaiba o problema sa computer mo tulad ng lag, overheating, o boot issues para ma-check natin kung pasok sa high-level diagnostics natin? 😎";
                        } else if (isConfusedInClient) {
                          replyText = "Ayos lang 'yan, pre! Hindi mo kailangang malaman yung mga teknikal na terms na yan. Ano ba yung mismong napapansin mong nagiging sakit ng ulo o problema sa computer mo ngayon para malaman natin kung active digital services natin ang makakasolve dyan? 👊";
                        } else if (isNonServiceInClient) {
                          replyText = "Naku pre, pasensya na pero hindi natin siniservicuhan yung ganyang uri ng request (tulad ng screen replacement, mobile phone repairs, hinges, water damage, or game consoles). Focus tayo sa core digital configurations at expertise natin! 👊";
                        } else if (isServiceInClient) {
                          if (norm.includes("blue screen") || norm.includes("bsod")) {
                            replyText = "Hala, sakit nga sa ulo nyan, pre. Silipin natin baka makuha sa driver conflict o system recovery. 👊";
                          } else if (norm.includes("slow") || norm.includes("lag") || norm.includes("hang")) {
                            replyText = "Bumibigat ba system natin? Tingnan natin kung kailangan lang ng kaunting systems cleaning at optimization, bro. 😎";
                          } else if (norm.includes("overheat") || norm.includes("init") || norm.includes("temp")) {
                            replyText = "Mainit ba nang mabilis? Check natin baka kailangan ng thermal repasting o silipin natin yung processes na kumakain ng resources. 🛡️";
                          } else if (norm.includes("boot") || norm.includes("bumukas") || norm.includes("power") || norm.includes("start")) {
                            replyText = "Ayaw ba sumindi o mag-boot nang maayos, lods? Tsek natin baka sa boot configuration o BIOS setting lang, gawan natin ng paraan! ⚡";
                          } else if (norm.includes("password") || norm.includes("lock")) {
                            replyText = "Naka-lock out ba, pre? Check natin kung paano natin ma-reset at ma-recover ng ligtas nang di nawawala yung files mo. 😇";
                          } else if (norm.includes("virus") || norm.includes("malware")) {
                            replyText = "May hinalang virus ba, pre? Silipin natin kung paano natin malilinis at mase-secure ulit yung os nyan. 🛡️";
                          } else if (norm.includes("recover") || norm.includes("restoration") || norm.includes("deleted") || norm.includes("lost")) {
                            replyText = "Nawawalan ng files, bro? Check natin kung pwedeng ma-recover or restore yan, subukan nating gawan ng paraan! 😎";
                          } else if (norm.includes("assemble") || norm.includes("build") || norm.includes("parts")) {
                            replyText = "Mag-aassemble ba or upgrade ng components? Pwede nating silipin at tsek yung hardware compatibility nyan, pre. 👊";
                          } else {
                            const friendlyOptions = [
                              "Check natin pre, baka magawan natin ng paraan yan! 😎",
                              "Silipin natin kung anong kailangang diskarte dyan, lods. Check natin! 👊",
                              "Hala sige pre, tsek natin baka sakaling makuha natin sa mabilisang troubleshooting.",
                              "Tingnan natin kung paano natin matutulungan yang unit mo, bro. Try natin gawan ng paraan! ⚡",
                              "Sige pre, silipin natin baka may mabilisang system diagnostics dyan."
                            ];
                            let sum = 0;
                            for (let i = 0; i < norm.length; i++) {
                              sum += norm.charCodeAt(i);
                            }
                            replyText = friendlyOptions[sum % friendlyOptions.length];
                          }
                        } else if (
                          norm.includes("anong meron") ||
                          norm.includes("anong mayroon") ||
                          norm.includes("what is this") ||
                          norm.includes("what do you do") ||
                          norm.includes("what does this") ||
                          norm.includes("offer") ||
                          norm.includes("service") ||
                          norm.includes("services") ||
                          norm.includes("repair") ||
                          norm.includes("computer")
                        ) {
                          replyText = "Tumutulong kami sa system configurations, PC repairs, tsaka general diagnostics, pre! Check natin baka magawan natin ng paraan sa system mo. ⚡";
                        } else if (
                          norm.includes("sino ka") ||
                          norm.includes("sino si shadow") ||
                          norm.includes("who is shadow") ||
                          norm.includes("who are you") ||
                          norm.includes("identity")
                        ) {
                          replyText = "Ako si Shadow, ang iyong malupit na expert tech assistant, pre! Nandito ako para umalalay sa computer repairs at technical expertise nyo. 😎";
                        } else if (
                          norm.includes("download") || 
                          norm.includes("files") || 
                          norm.includes("archive") || 
                          norm.includes("w10") || 
                          norm.includes("w11") || 
                          norm.includes("windows") || 
                          norm.includes("office") || 
                          norm.includes("tutorial") ||
                          norm.includes("lesson")
                        ) {
                          replyText = "Focus tayo sa active systems repair, PC builds, at configurations expertise natin, pre. Tanong ka lang sa mga expert services na inaalok namin! 🛡️";
                        } else if (
                          norm.includes("musta") ||
                          norm.includes("how are you") ||
                          norm.includes("kumusta")
                        ) {
                          replyText = "Solid naman, bro! Kumusta rin sayo ngayon? Chill lang dito, kumusta ang araw mo? 😎";
                        } else if (
                          norm.includes("ngek") ||
                          norm.includes("nyek") ||
                          norm.includes("grabe") ||
                          norm.includes("haha") ||
                          norm.includes("lmao") ||
                          norm.includes("lol")
                        ) {
                          replyText = "Ngek talaga, pre! Sobrang wacky ng system loops minsan eh no? Pero wag ka mag-alala, chill lang tayo dito. 😂";
                        } else if (
                          norm.includes("hello") ||
                          norm.includes("hi") ||
                          norm.includes("yo") ||
                          norm.includes("hey") ||
                          norm.includes("hoy")
                        ) {
                          replyText = "Yo, pre! Kumusta? Chill lang muna dito. Paano kita matutulungan ngayon? 😎";
                        }

                        setChatMessages((prev) => [
                          ...prev,
                          {
                            id: `bot-fallback-${Date.now()}`,
                            sender: 'bot' as const,
                            text: replyText,
                            timestamp: new Date(),
                            isAppointmentRequest: isReplyAppointment
                          }
                        ]);
                      } finally {
                        setChatLoading(false);
                      }
                    }}
                    className="flex flex-col gap-1.5"
                  >
                    {speechHelperText && (
                      <div className="text-[10px] text-zinc-400 font-mono text-center mb-0.5 animate-pulse bg-zinc-900/60 rounded py-1 px-2 border border-[#242938]/40 self-center">
                        🎙️ {speechHelperText}
                      </div>
                    )}
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={isListening ? "Magsalita na po..." : "Type your message..."}
                          className="w-full bg-[#101119] border border-[#242938] text-[11.5px] text-white pl-3.5 pr-10 py-2.5 rounded-xl outline-none focus:border-[#42b783]/40 placeholder:text-zinc-500 font-sans tracking-wide"
                        />
                        <button
                          type="button"
                          onClick={toggleListening}
                          title={isListening ? "Stop listening" : "Speech to Text"}
                          className={`absolute right-2 px-1.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                            isListening 
                              ? "text-red-400 hover:text-red-300 bg-red-500/10 animate-pulse" 
                              : "text-zinc-500 hover:text-white hover:bg-[#1c2030]"
                          }`}
                        >
                          {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={chatLoading}
                        className="px-5 py-2.5 bg-[#42b783] hover:bg-[#52d399] active:scale-98 disabled:opacity-50 text-white font-bold text-xs rounded-xl tracking-wider transition-all duration-150 cursor-pointer shadow-[0_3px_10px_rgba(66,183,131,0.2)] flex items-center justify-center shrink-0 uppercase"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                  {/* Credits alignment matching Silver Techpx */}
                  <div className="text-center select-none pt-0.5">
                    <span className="text-[9px] font-bold tracking-widest text-[#42b783]/85 font-mono">
                      POWERED BY <span className="text-[#52d399] uppercase">Gemini 3.5</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Integrated Admin Login button positioned strictly beneath the cards in-flow */}
          {!showOverrideInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="z-40 select-none pb-2 mt-1 sm:mt-2 shrink-0"
            >
              <button
                onClick={() => {
                  setAuthError('');
                  setShowOverrideInput(true);
                }}
                className="px-4 py-2.5 bg-neutral-900/60 hover:bg-[#1f1a40]/60 border border-neutral-800 hover:border-purple-500/40 text-neutral-400 hover:text-white rounded-xl font-mono text-[9px] uppercase font-bold tracking-[0.18em] flex items-center gap-2 transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer"
              >
                <Lock size={11} className="text-purple-400" />
                <span>ADMIN LOG IN</span>
              </button>
            </motion.div>
          )}
        </div>
        
        {/* Boss Logs Portal Update Modal */}
        <LogUpdateModal
          isOpen={showLogUpdateModal}
          onClose={() => setShowLogUpdateModal(false)}
        />
      </div>
    );
  }

  const renderChatbot = (isFloating: boolean = false) => {
    return (
      <motion.div
        key={isFloating ? "chatbot-card-floating" : "chatbot-card"}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={
          isFloating
            ? "absolute bottom-20 right-0 md:bottom-auto md:right-[80px] md:top-1/2 md:-translate-y-1/2 z-[999] w-[280px] sm:w-[330px] h-[390px] sm:h-[450px] bg-[#1d1f2b] border-2 border-purple-500/70 rounded-[1.75rem] shadow-[0_0_40px_rgba(168,85,247,0.5),0_0_15px_rgba(139,92,246,0.3),0_10px_40px_rgba(147,51,234,0.2)] flex flex-col overflow-visible font-sans text-white backdrop-blur-md"
            : "w-[74%] min-[360px]:w-[78%] min-[400px]:w-[80%] sm:w-full max-w-[245px] min-[360px]:max-w-[275px] min-[400px]:max-w-[315px] sm:max-w-[380px] h-[430px] min-[360px]:h-[455px] min-[400px]:h-[485px] sm:h-[515px] bg-[#1d1f2b] border-2 border-purple-500/70 rounded-[2rem] shadow-[0_0_60px_rgba(168,85,247,0.65),0_0_20px_rgba(139,92,246,0.35),0_15px_50px_rgba(147,51,234,0.25)] flex flex-col overflow-visible relative font-sans text-white backdrop-blur-md"
        }
      >
        {!isFloating && (
          <>
            {/* Left Side vertical glowing banner (Visible on Mobile + Desktop) */}
            <div className="absolute -left-6 min-[350px]:-left-8 sm:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-3 select-none pointer-events-none z-30 w-8">
              {/* Ambient Cyber Light Nodes travelling vertically */}
              <div className="absolute inset-x-0 h-40 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex items-center justify-center">
                <motion.div
                  animate={{ y: [-80, 80] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-t from-fuchsia-400 to-purple-500 blur-[1px] absolute"
                />
                <motion.div
                  animate={{ y: [80, -80] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  className="w-1 h-1 rounded-full bg-pink-400 blur-[0.5px] absolute"
                />
              </div>

              {/* Behind-the-line Rotating Cyber Magic Seal */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center opacity-40 select-none pointer-events-none">
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full text-purple-500/40 drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4, 4" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.75" />
                  <polygon points="50,18 78,68 22,68" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <polygon points="50,82 78,32 22,32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.75" />
                </motion.svg>
              </div>

              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-ping" />
              <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-b from-purple-500/20 via-purple-500 to-pink-500/80 animate-pulse" />
              
              {/* Vertically gliding banner - Eminence in Shadow Slime magic style */}
              <motion.div
                animate={{ 
                  y: [-120, -80, 80, 120],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 5.5, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
                className="flex flex-col items-center"
              >
                <div 
                  className="flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2" 
                  style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                >
                  <span className="text-[8.5px] min-[360px]:text-[10.5px] sm:text-[13px] lg:text-[15px] font-mono font-black tracking-[0.25em] min-[360px]:tracking-[0.35em] bg-gradient-to-b from-white via-purple-300 to-fuchsia-400 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_0_12px_rgba(168,85,247,0.95)] animate-[pulse_1.5s_infinite]">
                    USE PASSWORD IN CHAT TO ENTER
                  </span>
                  <Key className="text-fuchsia-400 rotate-90 stroke-[3] drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </motion.div>

              <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-t from-purple-500/20 via-purple-500 to-pink-500/80 animate-pulse" />
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899] animate-ping" />
            </div>

            {/* Right Side vertical glowing banner (Visible on Mobile + Desktop) */}
            <div className="absolute -right-6 min-[350px]:-right-8 sm:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 sm:gap-3 select-none pointer-events-none z-30 w-8">
              {/* Ambient Cyber Light Nodes travelling vertically */}
              <div className="absolute inset-x-0 h-40 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex items-center justify-center">
                <motion.div
                  animate={{ y: [80, -80] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-t from-pink-400 to-purple-500 blur-[1px] absolute"
                />
                <motion.div
                  animate={{ y: [-80, 80] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "linear", delay: 1 }}
                  className="w-1 h-1 rounded-full bg-fuchsia-400 blur-[0.5px] absolute"
                />
              </div>

              {/* Behind-the-line Rotating Cyber Magic Seal (Counter Rotating) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-28 h-28 lg:w-36 lg:h-36 flex items-center justify-center opacity-40 select-none pointer-events-none">
                <motion.svg
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full text-pink-500/40 drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3, 3" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="12, 4" />
                  <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.75" />
                  <polygon points="50,22 76,41 66,73 34,73 24,41" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="0.75" />
                </motion.svg>
              </div>

              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-pink-500 shadow-[0_0_12px_#ec4899] animate-ping" />
              <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-b from-pink-500/20 via-pink-500 to-purple-500/80 animate-pulse" />
              
              {/* Vertically gliding banner - Eminence in Shadow Slime magic style (Staggered) */}
              <motion.div
                animate={{ 
                  y: [-120, -80, 80, 120],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 5.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.8
                }}
                className="flex flex-col items-center"
              >
                <div 
                  className="flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2" 
                  style={{ writingMode: 'vertical-lr' }}
                >
                  <span className="text-[8.5px] min-[360px]:text-[10.5px] sm:text-[13px] lg:text-[15px] font-mono font-black tracking-[0.25em] min-[360px]:tracking-[0.35em] bg-gradient-to-b from-white via-purple-300 to-fuchsia-400 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_0_12px_rgba(168,85,247,0.95)] animate-[pulse_1.5s_infinite]">
                    USE PASSWORD IN CHAT TO ENTER
                  </span>
                  <Key className="text-fuchsia-400 -rotate-90 stroke-[3] drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </motion.div>

              <div className="w-[1.2px] sm:w-[1.5px] h-10 min-[360px]:h-14 sm:h-20 bg-gradient-to-t from-pink-500/20 via-pink-500 to-purple-500/80 animate-pulse" />
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7] animate-ping" />
            </div>
          </>
        )}

        {/* Chatbot Header */}
        <div className={`bg-[#151722] ${isFloating ? 'p-3 rounded-t-[1.75rem]' : 'p-4 rounded-t-[2rem]'} flex items-center justify-between border-b border-[#252838] select-none shrink-0 relative animate-none`}>
          <div className="flex items-center">
            {/* Floating Circular Chathead character that goes beyond the chatbox with clean rounded-full overflow-hidden */}
            <div className={`absolute ${isFloating ? '-top-3.5 -left-3.5' : '-top-4 -left-4'} z-30 select-none group`}>
              <div className="relative flex items-center justify-center">
                {/* Outer shining border frame of the avatar (glowing circle matching design mockups perfectly) */}
                <div className={`${isFloating ? 'w-[64px] h-[64px]' : 'w-[82px] h-[82px]'} rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 p-[2.5px] shadow-[0_4px_18px_rgba(168,85,247,0.5)] relative`}>
                  <div className="w-full h-full rounded-full bg-[#12101e] border-2 border-white overflow-hidden flex items-center justify-center relative shadow-inner">
                    {/* The Circular Shadow Chibi (Sticker) perfectly clipped to absolute circle, dropping white corners */}
                    <img
                      src={shadowChibiSticker}
                      alt="Shadow Avatar Circular"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-[1.05] transform group-hover:scale-112 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Online Status Badge sitting on the bottom-right of the circular ring */}
                <span className={`absolute ${isFloating ? 'bottom-0.5 right-0.5 w-3.5 h-3.5' : 'bottom-1 right-1 w-4.5 h-4.5'} bg-[#42b783] border-2 border-[#151722] rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
                </span>
              </div>
            </div>

            {/* Chatbot Title and online label, indented generously to match the floating avatar */}
            <div className={`${isFloating ? 'pl-16' : 'pl-20 sm:pl-24'} text-left`}>
              <h3 className={`${isFloating ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-extrabold text-white uppercase tracking-widest leading-none font-sans filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
                Shadow
              </h3>
              <div className={`flex items-center gap-1.5 ${isFloating ? 'mt-1' : 'mt-2'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Online</span>
                {isChatBossMode && (
                  <span className={`ml-2.5 ${isFloating ? 'text-[8px] px-1 py-0' : 'text-[9px] px-1.5 py-0.5'} text-purple-400 font-extrabold uppercase tracking-wider font-mono rounded border border-purple-500/30 bg-purple-950/40 animate-pulse`}>
                    Boss Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {isFloating && (
            <button
              type="button"
              onClick={() => setIsFloatingChatOpen(false)}
              className="text-neutral-500 hover:text-purple-400 p-1 hover:bg-neutral-900/40 rounded-lg transition-colors cursor-pointer relative z-50 ml-auto flex items-center justify-center"
              title="Close Chat"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Messages Body Scroll Area */}
        <div className={`flex-1 bg-[#101119] ${isFloating ? 'p-3 space-y-3' : 'p-4 space-y-4'} overflow-y-auto scroll-smooth`}>
          {chatMessages.map((msg, msgIndex) => {
            const isLastBotMsg = msg.sender === 'bot' && msgIndex === chatMessages.map(m => m.sender).lastIndexOf('bot');
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className={`${isFloating ? 'w-6 h-6' : 'w-7 h-7'} rounded-full overflow-hidden border border-purple-500/40 bg-[#12101e] shrink-0 mt-0.5 shadow-sm flex items-center justify-center`}>
                    <img
                      src={shadowChibiSticker}
                      alt="Shadow Chathead"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform scale-[1.05]"
                    />
                  </div>
                )}
                
                <div className="relative max-w-[80%] select-text flex flex-col items-start">
                  <div
                    className={`${isFloating ? 'p-2 rounded-xl text-[10.5px] leading-relaxed' : 'p-3 rounded-2xl text-[11.5px] leading-relaxed'} font-medium tracking-wide w-full ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 text-white rounded-tr-none shadow-md'
                        : 'bg-[#1b1c25] border border-[#262835] text-slate-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {renderMessageContent(msg.text, msg.sender)}
                  </div>

                  {/* Guest Login button under bot bubbles which have a passcode */}
                  {msg.sender === 'bot' && !isFloating && (() => {
                    const code = extractPasscode(msg.text);
                    if (code) {
                      return (
                        <button
                          type="button"
                          id="guest-login-modal-btn"
                          onClick={() => {
                            setGuestAuthError('');
                            setGuestPasscode('');
                            setShowGuestPopup(true);
                          }}
                          className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 border border-purple-500/25 text-white font-sans text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-md transition-all cursor-pointer select-none"
                        >
                          <Unlock size={11} className="text-purple-200" />
                          <span>GUEST LOGIN</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  {/* Book Appointment button */}
                  {msg.sender === 'bot' && (msg.isAppointmentRequest || msg.text.toLowerCase().includes('schedule') || msg.text.toLowerCase().includes('appointment') || msg.text.toLowerCase().includes('matingnan po natin ang computer ninyo')) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthorized) {
                          setIsAuthorized(true);
                          setIsGuestMode(true);
                        }
                        setShowArchive(false);
                        setAutoOpenAppointment(true);
                      }}
                      className="mt-2.5 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/20 text-white font-mono text-[9px] sm:text-[10px] uppercase font-black tracking-wider rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-95 select-none"
                    >
                      <Calendar size={11} className="text-emerald-100 animate-pulse" />
                      <span>BOOK APPOINTMENT</span>
                    </button>
                  )}

                  {/* Log Update button for Owner/Boss queries */}
                  {isLastBotMsg && isChatBossMode && (
                    <button
                      type="button"
                      onClick={() => setShowLogUpdateModal(true)}
                      className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.45)] hover:shadow-[0_0_22px_rgba(168,85,247,0.6)] transition-all duration-300 cursor-pointer border border-purple-400/30 active:scale-95 select-none"
                    >
                      <Terminal className="w-3.5 h-3.5 animate-pulse" />
                      <span>LOG UPDATE</span>
                    </button>
                  )}

                  {/* Golden coin emoji next to user bubbles as in reference image */}
                  {msg.sender === 'user' && (
                    <div className={`absolute ${isFloating ? '-right-1.5 top-1.5 w-3.5 h-3.5 text-[8.5px]' : '-right-2 top-2 w-4 h-4 text-[10px]'} bg-[#fcd34d] text-neutral-900 rounded-full flex items-center justify-center shadow-sm select-none`}>
                      🪙
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {chatLoading && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className={`${isFloating ? 'w-6 h-6' : 'w-7 h-7'} rounded-full overflow-hidden border border-purple-500/40 bg-[#12101e] shrink-0 mt-0.5 shadow-sm flex items-center justify-center animate-pulse`}>
                <img
                  src={shadowChibiSticker}
                  alt="Shadow Chathead typing"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform scale-[1.05]"
                />
              </div>
              <div className={`bg-[#1b1c25] border border-[#262835] ${isFloating ? 'p-2 rounded-xl text-[10px]' : 'p-3 rounded-2xl text-[11px]'} text-zinc-400 flex items-center gap-1 shadow-sm`}>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Empty Element for Auto-Scroller Pin */}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestions / Hot Chips for easier interactive navigation - Always visible */}
        <div className={`${isFloating ? 'px-3 pb-2 pt-0.5 gap-1' : 'px-4 pb-2.5 pt-1 gap-1.5'} bg-[#101119] flex flex-wrap justify-center shrink-0`}>
          {[
            "Anong mayroon dito?",
            "Hingi ng passcode, pre"
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setChatInput(chip);
              }}
              className={`${isFloating ? 'px-2 py-0.5 text-[9px] rounded-md' : 'px-2.5 py-1 text-[10px] rounded-lg'} bg-[#1b1c25] hover:bg-purple-950/40 border border-[#262835] hover:border-purple-500/30 text-zinc-300 hover:text-white font-medium transition-all duration-200 cursor-pointer`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Form Input Footer */}
        <div className={`bg-[#151722] ${isFloating ? 'p-2.5 rounded-b-[1.75rem]' : 'p-3 rounded-b-[2rem]'} border-t border-[#252838] flex flex-col gap-2 shrink-0`}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim() || chatLoading) return;

              const userMsgText = chatInput;
              setChatInput('');

              let enteredTextClean = userMsgText.trim();
              let isPasscodeMatched = false;
              try {
                const msgBuffer = new TextEncoder().encode(enteredTextClean);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                if (hashHex === 'cf7a14191ac01a39913eadfae86c9e032ec7bd69fe01d452113f54ea6eef68ef') {
                  isPasscodeMatched = true;
                }
              } catch (e) {
                console.error(e);
              }

              let currentBossState = isChatBossMode;
              if (isPasscodeMatched || userMsgText.toLowerCase().trim() === 'kgab0730') {
                setIsChatBossMode(true);
                currentBossState = true;
              }

              // Append user message
              const userMsg = {
                id: `user-${Date.now()}`,
                sender: 'user' as const,
                text: userMsgText,
                timestamp: new Date()
              };
              setChatMessages((prev) => [...prev, userMsg]);
              if ((window as any).logUserMovement) {
                (window as any).logUserMovement('chat', `Typed in chatbot: "${userMsgText}"`);
              }
              setChatLoading(true);

              const normText = userMsgText.toLowerCase().trim();
              const physicalHW = [
                "ram", "memory", "ddr4", "ddr5", "ddr3",
                "motherboard", "mobo", "mainboard", "board", "board-level",
                "cpu", "processor", "intel", "ryzen", "amd", "i5", "i7", "i9", "ryzen 5", "ryzen 7",
                "gpu", "video card", "videocard", "graphics card", "nvidia", "rtx", "gtx", "radeon",
                "power supply", "psu", "power cord", "charger",
                "hard drive", "hdd", "ssd", "m.2", "nvme",
                "fan", "cooler", "heatsink", "liquid cooling", "fan motor", "cooling fan",
                "screen", "monitor", "display", "panel", "lcd",
                "keyboard", "mouse", "headset", "speaker", "webcam", "camera", "microphone", "mic",
                "case", "chassis", "tower", "cables", "wire"
              ];

              const isHardwareWord = physicalHW.some(hw => {
                return normText === hw || 
                       normText.includes(" " + hw + " ") || 
                       normText.startsWith(hw + " ") || 
                       normText.endsWith(" " + hw) || 
                       normText.includes("-" + hw) || 
                       normText.includes(hw + "-") ||
                       normText.includes(" " + hw) ||
                       normText.includes(hw + " ");
              });

              const isHwRepairQuery = normText.includes("hardware repair") || 
                normText.includes("hardware na sira") || 
                normText.includes("ayusin ang hardware") || 
                normText.includes("paggawa ng hardware") || 
                normText.includes("ayusin ang ram") ||
                normText.includes("nag aayos kayo ng ram") ||
                normText.includes("nag aayos kayo ng gpu") ||
                (normText.includes("hardware") && (normText.includes("repair") || normText.includes("ayos") || normText.includes("sira") || normText.includes("gawa") || normText.includes("palit") || normText.includes("unbox"))) ||
                (isHardwareWord && (
                  normText.includes("repair") || 
                  normText.includes("ayos") || 
                  normText.includes("sira") || 
                  normText.includes("gawa") || 
                  normText.includes("palit") || 
                  normText.includes("linis") || 
                  normText.includes("basag") ||
                  normText.includes("burnt") ||
                  normText.includes("sunog") ||
                  normText.includes("kabit") ||
                  normText.includes("isaksak") ||
                  normText.includes("pundido") ||
                  normText.includes("basa") ||
                  normText.includes("water damage") ||
                  normText.includes("ipagawa") ||
                  normText.includes("mag-ayos") ||
                  normText.includes("magaayos") ||
                  normText.includes("magpagawa") ||
                  normText.includes("pagawa") ||
                  normText.includes("upgrade") ||
                  normText.includes("palitan") ||
                  normText.includes("kabitan") ||
                  normText.includes("cleaning") ||
                  normText.includes("thermal paste") ||
                  normText.includes("overheat") ||
                  normText.includes("mainit")
                ));

              try {
                const response = await fetch('/api/shadow-chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    message: userMsgText,
                    isBossMode: currentBossState,
                    history: chatMessages.slice(-10).map(msg => ({
                      role: msg.sender === 'user' ? 'user' : 'model',
                      parts: [{ text: msg.text }]
                    }))
                  })
                });

                const data = await response.json();
                const replyText = data.text || data.reply;
                
                // Dynamically discover and cache chatbot-generated passwords
                if (replyText) {
                  const codesFound: string[] = [];
                  const pattern = /\b[A-Z0-9]{8}\b/g;
                  let m;
                  while ((m = pattern.exec(replyText)) !== null) {
                    const candidate = m[0];
                    if (candidate !== "SECURITY" && candidate !== "DATABASE" && candidate !== "TERMINAL" && candidate !== "PASSWORD") {
                      codesFound.push(candidate);
                    }
                  }

                  if (codesFound.length > 0) {
                    try {
                      const savedRaw = localStorage.getItem('chatbot_generated_passwords');
                      let savedList: string[] = [];
                      if (savedRaw) {
                        savedList = JSON.parse(savedRaw);
                      }
                      codesFound.forEach(code => {
                        if (!savedList.includes(code)) {
                          savedList.push(code);
                        }
                      });
                      localStorage.setItem('chatbot_generated_passwords', JSON.stringify(savedList));
                      setAvailablePasscodes(savedList);
                      
                      // Also push this newly discovered passcode to the backend config dynamically!
                      const payload = {
                        admin_console_link: localStorage.getItem('admin_console_link') || 'https://drive.google.com',
                        user_suggestions: JSON.parse(localStorage.getItem('shadow_suggestions') || '[]'),
                        user_appointments: JSON.parse(localStorage.getItem('shadow_appointments') || '[]'),
                        user_shout_outs: JSON.parse(localStorage.getItem('shadow_shout_outs_v3') || '[]'),
                        user_activity_logs: JSON.parse(localStorage.getItem('shadow_user_movements') || '[]'),
                        chatbot_passcodes: savedList
                      };
                      fetch('/api/configs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      }).catch(err => console.error("Config background passcode sync error:", err));

                    } catch (err) {
                      console.error("Error storing chatbot-generated passwords:", err);
                    }
                  }
                }

                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: replyText || 'Dito lang ako, pre. Tanong ka lang.',
                    timestamp: new Date()
                  }
                ]);

              } catch (error) {
                console.error('Chat error:', error);
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: `bot-err-${Date.now()}`,
                    sender: 'bot',
                    text: 'Pasensya ka na pre, nagka-error sa gateway connection ko. Ulitin natin mamaya.',
                    timestamp: new Date()
                  }
                ]);
              } finally {
                setChatLoading(false);
              }
            }}
            className="flex items-center gap-2"
          >
            <div className={`relative flex-1 flex items-center bg-[#101119] ${isFloating ? 'rounded-lg px-2 py-1' : 'rounded-xl px-3 py-1.5'} border border-[#252838] focus-within:border-purple-500/50 transition-all min-w-0`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isListening ? "Magsalita na po..." : "Type your message..."}
                disabled={chatLoading}
                className="flex-1 bg-transparent text-white font-medium text-xs outline-none placeholder:text-zinc-500/80 min-w-0 pr-8"
              />
              <button
                type="button"
                onClick={async () => {
                  if (isListening) {
                    setIsListening(false);
                    if ((window as any).recognitionInstance) {
                      try {
                        (window as any).recognitionInstance.stop();
                      } catch (_) {}
                    }
                    return;
                  }

                  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRec) {
                    alert("Speech recognition is not supported in this browser.");
                    return;
                  }

                  try {
                    const rec = new SpeechRec();
                    rec.continuous = false;
                    rec.interimResults = false;
                    rec.lang = 'fil-PH';

                    rec.onstart = () => {
                      setIsListening(true);
                    };

                    rec.onresult = (event: any) => {
                      const transcript = event.results[0][0].transcript;
                      if (transcript) {
                        setChatInput(transcript);
                      }
                    };

                    rec.onerror = () => {
                      setIsListening(false);
                    };

                    rec.onend = () => {
                      setIsListening(false);
                    };

                    (window as any).recognitionInstance = rec;
                    rec.start();
                  } catch (err) {
                    console.error("Speech recognition error:", err);
                    setIsListening(false);
                  }
                }}
                className={`absolute right-2 p-1.5 rounded-lg transition-all cursor-pointer select-none ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={isListening ? "Stop listening" : "Speech to Text"}
              >
                {isListening ? <MicOff size={11} /> : <Mic size={11} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={chatLoading}
              className={`${isFloating ? 'px-3.5 py-2 text-[10.5px] rounded-lg' : 'px-5 py-2.5 text-xs rounded-xl'} bg-[#42b783] hover:bg-[#52d399] active:scale-98 disabled:opacity-50 text-white font-bold tracking-wider transition-all duration-150 cursor-pointer shadow-[0_3px_10px_rgba(66,183,131,0.2)] flex items-center justify-center shrink-0 uppercase`}
            >
              Send
            </button>
          </form>
          {/* Credits alignment matching Silver Techpx */}
          <div className="text-center select-none pt-0.5">
            <span className="text-[9px] font-bold tracking-widest text-[#42b783]/85 font-mono">
              POWERED BY <span className="text-[#52d399] uppercase">Gemini 3.5</span>
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (appLoading) {
    return <LoadingScreen onComplete={() => setAppLoading(false)} isAudioAllowed={audioApproved === true} />;
  }

  return (
    <div ref={mainContainerRef} className="min-h-screen w-full relative">
      {/* Hidden Persistent Theme Audio Stream */}
      {isPlaying && localAudioActive && (
        activeTrack.type === 'drive' ? (
          <>
            {/* HTML5 Direct Audio Stream (Highly reliable for native playback/loop) */}
            <audio
              key={`audio-global-${activeTrack.id}`}
              autoPlay
              loop
              controls={false}
              style={{ display: 'none' }}
            >
              <source src={`https://drive.google.com/uc?export=download&id=${activeTrack.id}`} type="audio/mp3" />
              <source src={`https://docs.google.com/uc?export=download&id=${activeTrack.id}`} type="audio/mp3" />
              <source src={`https://drive.google.com/uc?export=open&id=${activeTrack.id}`} type="audio/mp3" />
            </audio>
            {/* Embedded sandboxed Drive preview for general content handling */}
            <iframe
              key={`iframe-global-${activeTrack.id}`}
              src={`https://drive.google.com/file/d/${activeTrack.id}/preview`}
              allow="autoplay; encrypted-media"
              title="Global Theme OST"
              style={{
                position: 'fixed',
                width: '320px',
                height: '240px',
                top: '-2000px',
                left: '-2000px',
                pointerEvents: 'none',
                opacity: 0.001,
                zIndex: -9999
              }}
              referrerPolicy="no-referrer"
            />
          </>
        ) : (
          <iframe
            key={`iframe-global-${activeTrack.id}`}
            src={`https://www.youtube.com/embed/${activeTrack.id}?autoplay=1&mute=0&playlist=${activeTrack.id}&loop=1&controls=0&showinfo=0&disablekb=1&modestbranding=1`}
            allow="autoplay; encrypted-media"
            title="Global Theme OST"
            style={{
              position: 'fixed',
              width: '320px',
              height: '240px',
              top: '-2000px',
              left: '-2000px',
              pointerEvents: 'none',
              opacity: 0.001,
              zIndex: -9999
            }}
            referrerPolicy="no-referrer"
          />
        )
      )}

      {/* Render Active Screen Content */}
      {(() => {
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
                  onLogout={handleLogout}
                  onSupportClick={() => {
                    setShowSupportPage(true);
                  }}
                  generatedGuestPasscode={generatedGuestPasscode}
                  setGeneratedGuestPasscode={handleSetGeneratedGuestPasscode}
                  generatedGuestPasscodeDuration={generatedGuestPasscodeDuration}
                  setGeneratedGuestPasscodeDuration={(duration: number) => {
                    setGeneratedGuestPasscodeDuration(duration);
                    localStorage.setItem('generated_guest_passcode_duration', duration.toString());
                  }}
                  isAdmin={!isGuestMode}
                  autoOpenAppointment={autoOpenAppointment}
                  onAppointmentOpened={() => setAutoOpenAppointment(false)}
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
                  <a 
                    href="https://everythingmoe.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors pointer-events-auto"
                    title="Open EverythingMoe"
                  >
                    <Folder className="text-purple-400" size={20} strokeWidth={2.5} />
                  </a>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xs sm:text-lg md:text-xl font-black uppercase tracking-wide leading-none text-white">Digital Archive</h1>
                      {isGuestMode ? (
                        <div className="px-2 py-0.5 bg-purple-950/80 border border-purple-500/50 rounded-md flex items-center gap-1.5 animate-pulse text-[8px] sm:text-[9px] font-mono text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          <Clock size={10} className="text-purple-400" />
                          <span>GUEST ACCESS: ACTIVE</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 rounded-md flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse">
                          <ShieldCheck size={10} className="text-emerald-400" />
                          <span>ADMIN PRIVILEGES // MASTER</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-neutral-400 leading-none mt-1">Digital Archive // 2026 Edition</p>
                  </div>
                </div>
                <div className="flex flex-col items-end pointer-events-auto">
                  <button 
                    onClick={() => {
                      setShowArchive(false);
                    }}
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
                  onHomeClick={() => {
                    setShowArchive(false);
                  }}
                  onShowOwnerClick={() => setShowOwnerDetails(true)}
                  onSupportClick={() => setShowSupportPage(true)}
                />
  
                {/* Content Area */}
                <main className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
                  {!['GAMES', 'ANIME'].includes(activeTab) && (
                    <div className="p-4 md:p-6 border-b border-neutral-900 flex items-center justify-between bg-zinc-900/45 shrink-0">
                      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wide leading-none text-white">
                        {TABS.find(t => t.id === activeTab)?.label?.toUpperCase() || activeTab.replace('_', ' ')}
                      </h2>
                    </div>
                  )}
  
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
                              alt="Ian Collantes Portrait ID" 
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
                              Ian Collantes
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
  
            {/* Guest Session Expired Popup Modal */}
            <AnimatePresence>
              {guestSessionExpired && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 font-mono select-none" id="guest-session-expired-modal">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neutral-950 border border-red-500/50 w-full max-w-sm rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-6 text-white text-center flex flex-col items-center relative"
                  >
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/30 rounded-tl-xl pointer-events-none" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/30 rounded-tr-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/30 rounded-bl-xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/30 rounded-br-xl pointer-events-none" />
  
                    {/* Glowing Clock/Warning Icon */}
                    <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/40 flex items-center justify-center mb-4 text-red-400 relative">
                      <Clock size={24} className="animate-pulse" />
                    </div>
  
                    {/* Title & Description */}
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-2 font-mono">
                      TIME UP // ACCESS EXPIRED
                    </h3>
                    
                    <p className="text-[10px] uppercase tracking-wider text-neutral-300 leading-normal max-w-xs mb-6 font-semibold font-mono">
                      Your guest access key has reached its manual duration limit of {generatedGuestPasscodeDuration} minutes.
                      <span className="block text-purple-400 font-extrabold mt-2 tracking-widest text-[9px]">CONTACT ADMIN TO CONTINUE ACCESS</span>
                    </p>
  
                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleSessionExpiredLogout}
                      className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/45 border border-red-500/60 hover:border-red-400 text-red-200 hover:text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>DISCONNECT GATEWAY</span>
                      <ArrowRight size={10} />
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Global Redirect Interceptor Loader modal */}
      <RedirectLoader
        isOpen={redirectLoaderState.isOpen}
        targetUrl={redirectLoaderState.targetUrl}
        itemTitle={redirectLoaderState.itemTitle}
        onClose={() => setRedirectLoaderState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Boss Logs Portal Update Modal */}
      <LogUpdateModal
        isOpen={showLogUpdateModal}
        onClose={() => setShowLogUpdateModal(false)}
      />

      {/* Floating Circular Chathead with image 1 as picture - placed in the middle right part of the main page, fully draggable */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          right: '24px',
          top: '40%'
        }}
        className="fixed z-[9999] select-none flex flex-col items-end touch-none"
      >
        {/* The floating chatbot card (Image 2 UI Box) shown conditionally */}
        <AnimatePresence>
          {isFloatingChatOpen && renderChatbot(true)}
        </AnimatePresence>

        {/* Circular Chathead Button (using image 1) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onDragStart={(e) => e.preventDefault()}
          className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 p-[3px] shadow-[0_4px_25px_rgba(168,85,247,0.7)] flex items-center justify-center cursor-pointer overflow-visible group transition-all duration-300 border-2 border-white/10 hover:border-white/30"
          title="Chat with Shadow"
        >
          {/* Click me tooltip badge on top of the chathead */}
          {!isFloatingChatOpen && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.5)] animate-bounce select-none whitespace-nowrap">
              click me
              <div className="absolute -bottom-[3.5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 border-r border-b border-purple-400/60 rotate-45" />
            </div>
          )}

          {/* Circular picture frame perfectly wrapping image 1 */}
          <div className="w-full h-full rounded-full bg-[#12101e] border-2 border-white overflow-hidden flex items-center justify-center relative shadow-inner pointer-events-none">
            <img
              src={shadowChibiSticker}
              alt="Shadow Chathead Avatar"
              referrerPolicy="no-referrer"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-cover scale-[1.05] transform group-hover:scale-112 transition-transform duration-300 select-none pointer-events-none"
            />
          </div>

          {/* Online status indicator ring bottom-right of the circle */}
          <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#42b783] border-2 border-[#12101e] rounded-full flex items-center justify-center shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
          </span>

          {/* Glowing pulse ring behind the button */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-[8px] -z-10 group-hover:bg-purple-500/35 transition-colors duration-300 animate-pulse" />
        </motion.button>
      </div>
    </div>
  );
}

