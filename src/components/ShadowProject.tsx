import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, FolderOpen, BookOpen, ExternalLink, X, Link as LinkIcon, CheckCircle, Activity, Sparkles, Lock, Unlock, ShieldAlert, Trash2, Pencil, Check, Send, Wrench, Smile, User, Music, Volume2, VolumeX, Plus, Play, Pause, SkipForward, SkipBack, MessageSquare, Heart, Cpu, ShieldCheck, Wallet, Copy, QrCode, Smartphone, Calendar, Clock } from 'lucide-react';
import shadowBg from '../assets/images/shadow_master_atomic_1779279129608.png';
import shadowChibiAvatar from '../assets/images/shadow_eminence_chibi_1779532936009.png';
import shadowClockTower from '../assets/images/shadow_clock_tower_1779250710506.png';
import shadowGardenLogo from '../assets/images/shadow_garden_logo_1779199904393.png';
import { PROJECTS as STATIC_PROJECTS, TOOLS as STATIC_TOOLS } from '../constants';

export default function ShadowProject({ onEnter, hasPlayed, onShowShadowLore, isAudioAllowed = false, onLogout }: { onEnter: () => void; hasPlayed?: boolean; onShowShadowLore: () => void; isAudioAllowed?: boolean; onLogout?: () => void }) {
  const skip = hasPlayed;
  
  // Custom Google Drive / File link state
  const [consoleLink, setConsoleLink] = useState(() => {
    return localStorage.getItem('admin_console_link') || 'https://drive.google.com';
  });

  // Soundtrack Control states
  const STATIC_PLAYLIST = [
    { id: 'ATHTNyLK2TM', name: 'School Life', desc: 'Main soundtrack of this page' },
    { id: 'T9MLjIsfUOU', name: 'Eminence Theme Orchestral', desc: 'Pre-load soundtrack frequency' },
    { id: '9iQVgj4z-I4', name: 'Shadow Garden Lofi Chill', desc: 'Background ambiance of the shadows' }
  ];

  const [customTracks, setCustomTracks] = useState<Array<{ id: string; name: string; desc: string }>>(() => {
    const saved = localStorage.getItem('shadow_custom_tracks_data');
    return saved ? JSON.parse(saved) : [];
  });

  const playlist = [...STATIC_PLAYLIST, ...customTracks];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Reset active soundtrack to "School Life" (index 0) on load/reload and play instantly
  useEffect(() => {
    localStorage.setItem('shadow_soundtrack_active_index', '0');
    setCurrentTrackIndex(0);
    setLocalAudioActive(true);
    setIsPlaying(true);
  }, []);

  // Play state. If audio initially allowed, auto-play. Otherwise wait for user interaction or trigger on play click.
  const [isPlaying, setIsPlaying] = useState(isAudioAllowed);
  const [isSounddeckExpanded, setIsSounddeckExpanded] = useState(false);
  const [soundtrackInput, setSoundtrackInput] = useState('');
  const [localAudioActive, setLocalAudioActive] = useState(isAudioAllowed);

  // Sync state if parent allows audio later
  useEffect(() => {
    if (isAudioAllowed) {
      setLocalAudioActive(true);
      setIsPlaying(true);
    }
  }, [isAudioAllowed]);

  const activeTrack = playlist[currentTrackIndex] || playlist[0] || STATIC_PLAYLIST[0];

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIdx);
    localStorage.setItem('shadow_soundtrack_active_index', String(nextIdx));
    setLocalAudioActive(true);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIdx);
    localStorage.setItem('shadow_soundtrack_active_index', String(prevIdx));
    setLocalAudioActive(true);
    setIsPlaying(true);
  };

  const handleSelectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    localStorage.setItem('shadow_soundtrack_active_index', String(idx));
    setLocalAudioActive(true);
    setIsPlaying(true);
  };

  const parseYoutubeId = (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    try {
      const match = trimmed.match(/(?:v=|embed\/|youtu\.be\/|\/v\/|y\/|watch\?v=)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleInjectTrack = (e: FormEvent) => {
    e.preventDefault();
    const id = parseYoutubeId(soundtrackInput);
    if (!id) {
      alert("UNABLE TO RESOLVE COG-LINK URL // Re-evaluate YouTube details.");
      return;
    }

    setTrackInputPayload(soundtrackInput);
    setIsInjectingTrack(true);
    setInjectingTrackProgress(0);
  };

  const handlePurgeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTracks.filter(t => t.id !== id);
    setCustomTracks(updated);
    localStorage.setItem('shadow_custom_tracks_data', JSON.stringify(updated));
    
    // Calculate new index
    if (activeTrack.id === id) {
      setCurrentTrackIndex(0);
      localStorage.setItem('shadow_soundtrack_active_index', '0');
    } else {
      const remainingTracks = [...STATIC_PLAYLIST, ...updated];
      const newIdx = remainingTracks.findIndex(t => t.id === activeTrack.id);
      if (newIdx !== -1) {
        setCurrentTrackIndex(newIdx);
        localStorage.setItem('shadow_soundtrack_active_index', String(newIdx));
      } else {
        setCurrentTrackIndex(0);
        localStorage.setItem('shadow_soundtrack_active_index', '0');
      }
    }
  };
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
  const [activeTab, setActiveTab] = useState<'uplink' | 'linked' | 'tutorials'>('uplink');
  const [unlinkTrigger, setUnlinkTrigger] = useState(0);
  const [isAdminSuggestionsOpen, setIsAdminSuggestionsOpen] = useState(false);

  // --- TUTORIALS STATE ---
  const [tutorials, setTutorials] = useState<Array<{ id: string; title: string; category: string; description: string; url: string; system?: boolean }>>(() => {
    const saved = localStorage.getItem('shadow_master_tutorials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [newTutorialTitle, setNewTutorialTitle] = useState('');
  const [newTutorialCategory, setNewTutorialCategory] = useState('CPU/POWER');
  const [newTutorialDesc, setNewTutorialDesc] = useState('');
  const [newTutorialUrl, setNewTutorialUrl] = useState('');
  const [isAddingTutorial, setIsAddingTutorial] = useState(false);

  // --- APPOINTMENTS STATE ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isFiledAppointmentsDropdownOpen, setIsFiledAppointmentsDropdownOpen] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [showAppointmentSuccess, setShowAppointmentSuccess] = useState(false);
  const [appointmentProgress, setAppointmentProgress] = useState(0);
  const [appointmentStage, setAppointmentStage] = useState('');
  const [appointmentToSubmit, setAppointmentToSubmit] = useState<{ id: string; name: string; contact: string; specs: string; problem: string; description: string; date: string; status: string } | null>(null);
  const [aptActiveTab, setAptActiveTab] = useState<'book' | 'view'>('book');
  
  const [aptName, setAptName] = useState('');
  const [aptContact, setAptContact] = useState('');
  const [aptSpecs, setAptSpecs] = useState('');
  const [aptCpu, setAptCpu] = useState('Intel Core i7-13700K');
  const [aptCpuBrand, setAptCpuBrand] = useState<'Intel' | 'AMD'>('Intel');
  const [aptMobo, setAptMobo] = useState('ASUS ROG Series');
  const [aptGpu, setAptGpu] = useState('NVIDIA GeForce RTX 4070');
  const [aptRam, setAptRam] = useState('16GB DDR5');
  const [aptStep, setAptStep] = useState(1);
  const [aptProblem, setAptProblem] = useState('Slow Performance & Freezing');
  const [aptExplain, setAptExplain] = useState('');
  const [appointmentValidationError, setAppointmentValidationError] = useState<string | null>(null);

  // --- SUGGESTIONS STATE ---
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isShoutBoxOpen, setIsShoutBoxOpen] = useState(false);
  const [shoutSuccessCountdown, setShoutSuccessCountdown] = useState<number | null>(null);
  const [isSendingSuggestion, setIsSendingSuggestion] = useState(false);
  const [showSuggestionSuccess, setShowSuggestionSuccess] = useState(false);
  const [sendingSuggestionProgress, setSendingSuggestionProgress] = useState(0);
  const [sendingSuggestionStage, setSendingSuggestionStage] = useState('');
  const [suggestionToSubmit, setSuggestionToSubmit] = useState<{ text: string; category: string; status: string } | null>(null);

  // --- ADDITIONAL SIMULATOR STATES ---
  const [isSendingUplink, setIsSendingUplink] = useState(false);
  const [sendingUplinkProgress, setSendingUplinkProgress] = useState(0);
  const [uplinkToSubmit, setUplinkToSubmit] = useState<{ gameTitle: string; category: string; description: string; linkType: string; gameFile: string } | null>(null);

  const [isPostingShout, setIsPostingShout] = useState(false);
  const [postingShoutProgress, setPostingShoutProgress] = useState(0);
  const [shoutPayload, setShoutPayload] = useState<{ text: string; nameToUse: string; avatars: string[]; backgrounds: string[] } | null>(null);

  const [isInjectingTrack, setIsInjectingTrack] = useState(false);
  const [injectingTrackProgress, setInjectingTrackProgress] = useState(0);
  const [trackInputPayload, setTrackInputPayload] = useState<string>('');

  const [isDecryptingKey, setIsDecryptingKey] = useState(false);
  const [decryptingKeyProgress, setDecryptingKeyProgress] = useState(0);
  const [pendingDecryptPayload, setPendingDecryptPayload] = useState<{ normalizedInput: string } | null>(null);

  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  const [verifyingDeleteProgress, setVerifyingDeleteProgress] = useState(0);
  const [pendingDeletePayload, setPendingDeletePayload] = useState<{ normalizedInput: string } | null>(null);

  const [isEnteringArchive, setIsEnteringArchive] = useState(false);
  const [enteringArchiveProgress, setEnteringArchiveProgress] = useState(1);

  const [isAccessingTutorials, setIsAccessingTutorials] = useState(false);
  const [accessingTutorialsProgress, setAccessingTutorialsProgress] = useState(1);

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
      },
      {
        id: 's6',
        name: 'Zeta [Seven Shadows]',
        message: 'Exploring the outer wild borders. No cult traces found in the east, only quiet ruins waiting for Master\'s word. 🐱✨',
        time: '35m ago',
        timestamp: Date.now() - 35 * 60 * 1000,
        avatar: '🐱',
        avatarBg: 'bg-teal-950/85 border border-teal-500/35 text-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.2)]',
        likes: 5
      },
      {
        id: 's7',
        name: 'Eta [Seven Shadows]',
        message: 'Master\'s ancient formulas are decrypted. The research lab completed the new cyber defense protocol. 🧪🧠',
        time: '50m ago',
        timestamp: Date.now() - 50 * 60 * 1000,
        avatar: '🧪',
        avatarBg: 'bg-indigo-950/85 border border-indigo-500/35 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.2)]',
        likes: 11
      }
    ];
  });

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

  const [appointments, setAppointments] = useState<Array<{ id: string; name: string; contact: string; specs: string; problem: string; description: string; date: string; status: string }>>(() => {
    const saved = localStorage.getItem('shadow_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure legacy fields don't crash, map them if legacy found
        if (parsed && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id || 'ap-' + Math.random(),
            name: item.name || 'Anonymous',
            contact: item.contact || item.email || 'N/A',
            specs: item.specs || item.location || 'Core i7 13700H, 16GB RAM, RTX 4060, Windows 11',
            problem: item.problem || item.purpose || 'Slow Performance & Freezing',
            description: item.description || item.purpose || 'No additional explanation provided.',
            date: item.date || '2026-05-28',
            status: item.status || 'PENDING'
          }));
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = [
      { id: 'ap-1', name: 'Alpha', contact: 'alpha@shadow-garden.net', specs: 'Intel Core i9-13900K, 64GB DDR5, NVMe Gen4 2TB', problem: 'Slow Performance & Freezing', description: 'The compilation of system files is taking more than 5 minutes due to IO storage bottle-necks.', date: '2026-05-28', status: 'CONFIRMED' },
      { id: 'ap-2', name: 'Sherry Barnett', contact: 'sherry@academic.net', specs: 'AMD Ryzen 7 5800X, 32GB RAM, AMD RX 6700XT', problem: 'Windows / OS Boot Failure', description: 'System hangs on the BIOS screen with an unidentified artifact verification failure code.', date: '2026-05-27', status: 'PENDING' }
    ];
    localStorage.setItem('shadow_appointments', JSON.stringify(defaults));
    return defaults;
  });

  const [newSuggestionText, setNewSuggestionText] = useState('');
  const [newSuggestionCategory, setNewSuggestionCategory] = useState('SYSTEM');
  const [newSuggestionStatus, setNewSuggestionStatus] = useState('NEW');

  // Sustain/Donation section states
  const [copiedAddressLanding, setCopiedAddressLanding] = useState<string | null>(null);
  const [hardwareBoostLanding, setHardwareBoostLanding] = useState<number>(74);
  const [isGcashModalOpenLanding, setIsGcashModalOpenLanding] = useState(false);
  const [copiedFieldLanding, setCopiedFieldLanding] = useState<string | null>(null);

  // Suggestion deletion security authentication
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

  // Shoutout deletion security authentication
  const [deleteShoutId, setDeleteShoutId] = useState<string | null>(null);
  const [showDeleteShoutPasswordModal, setShowDeleteShoutPasswordModal] = useState(false);
  const [deleteShoutPasswordInput, setDeleteShoutPasswordInput] = useState('');
  const [deleteShoutPasswordError, setDeleteShoutPasswordError] = useState('');
  const [isVerifyingDeleteShout, setIsVerifyingDeleteShout] = useState(false);
  const [verifyingDeleteShoutProgress, setVerifyingDeleteShoutProgress] = useState(0);
  const [pendingDeleteShoutPayload, setPendingDeleteShoutPayload] = useState<{ normalizedInput: string } | null>(null);

  // Interactive Shadow Chibi Chat Room States
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'shadow'; time: string }>>([
    { id: 'm1', text: "Oy kumusta tol! Ako nga pala si Shadow, yung assistant ni Cid dito. Chill lang tayo.", sender: 'shadow', time: '11:59 PM' },
    { id: 'm2', text: "Tanong ka lang kahit ano, pre. Pwede Tagalog, Taglish, o English, kahit ano trip mo mapag-usapan!", sender: 'shadow', time: '12:00 AM' }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isShadowTyping, setIsShadowTyping] = useState(false);
  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<'chat' | 'stats'>('chat');

  // Shout Out Box States
  const [shoutMessage, setShoutMessage] = useState('');
  const [shoutName, setShoutName] = useState('');
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [tempName, setTempName] = useState('');

  const [offenseCount, setOffenseCount] = useState<number>(() => {
    const saved = localStorage.getItem('shout_offense_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [banUntil, setBanUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('shout_ban_until');
    return saved ? parseInt(saved, 10) : null;
  });

  const [isCommentingBanned, setIsCommentingBanned] = useState<boolean>(() => {
    const savedBanUntil = localStorage.getItem('shout_ban_until');
    if (savedBanUntil) {
      const until = parseInt(savedBanUntil, 10);
      if (Date.now() < until) {
        return true;
      } else {
        localStorage.removeItem('shout_ban_until');
        localStorage.removeItem('shout_commenting_banned');
        localStorage.setItem('shout_offense_count', '0');
        return false;
      }
    }
    return localStorage.getItem('shout_commenting_banned') === 'true';
  });

  const [banTimeRemaining, setBanTimeRemaining] = useState<string>('');
  const [shoutValidationError, setShoutValidationError] = useState<string | null>(null);
  const [suggestionValidationError, setSuggestionValidationError] = useState<string | null>(null);
  const [nameValidationError, setNameValidationError] = useState<string | null>(null);
  const [warningPopup, setWarningPopup] = useState<{ title: string; message: string; violationNumber: number } | null>(null);
  const [banPasscodeInput, setBanPasscodeInput] = useState<string>('');
  const [banPasscodeError, setBanPasscodeError] = useState<string | null>(null);

  // Suggestion sending simulator (5-seconds)
  useEffect(() => {
    if (!isSendingSuggestion || !suggestionToSubmit) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setSendingSuggestionProgress(progress);

      if (progress < 15) {
        setSendingSuggestionStage('ESTABLISHING SECURE COLD HANDSHAKE...');
      } else if (progress < 40) {
        setSendingSuggestionStage('GENERATING ROTATIONAL COGNITIVE SHIELD...');
      } else if (progress < 65) {
        setSendingSuggestionStage('ENCRYPTING SUGGESTION BUFFER...');
      } else if (progress < 85) {
        setSendingSuggestionStage('DISPATCHING ATOMIC SYSTEM PACKETS...');
      } else if (progress < 100) {
        setSendingSuggestionStage('FINISHING TRANSACTION UPLINK...');
      } else {
        setSendingSuggestionStage('TRANSMISSION SUCCESSFUL // DATA VERIFIED!');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          const newSugg = {
            id: 's_' + Date.now(),
            text: suggestionToSubmit.text,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
            category: suggestionToSubmit.category,
            status: suggestionToSubmit.status
          };

          setSuggestions(prev => {
            const updated = [newSugg, ...prev];
            localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
            return updated;
          });

          // Reset everything successfully
          setNewSuggestionText('');
          setNewSuggestionCategory('SYSTEM');
          setNewSuggestionStatus('NEW');
          setSuggestionToSubmit(null);
          setIsSendingSuggestion(false);
          setSendingSuggestionProgress(0);
          setSendingSuggestionStage('');
          setSuggestionValidationError(null);
          // Highlight that the suggestion has been sent
          setShowSuggestionSuccess(true);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isSendingSuggestion, suggestionToSubmit]);

  // Appointment scheduling simulator (4-seconds)
  useEffect(() => {
    if (!isSubmittingAppointment || !appointmentToSubmit) return;

    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setAppointmentProgress(progress);

      if (progress < 15) {
        setAppointmentStage('DIAGNOSING SYSTEM LOGS & CONTEXT...');
      } else if (progress < 40) {
        setAppointmentStage('ISOLATING DEVICE DRIVER DISCREPANCIES...');
      } else if (progress < 70) {
        setAppointmentStage('DETERMINING SYSTEM RESOLUTION PATHWAY...');
      } else if (progress < 90) {
        setAppointmentStage('SUBMITTING SUPPORT TICKET TO HQ ARCHIVES...');
      } else {
        setAppointmentStage('TICKET SECURED // ACTION DISPATCH ACTIVE!');
      }

      if (elapsed >= duration) {
        clearInterval(interval);

        setTimeout(() => {
          const newApt = {
            id: 'ap-' + Date.now(),
            name: appointmentToSubmit.name,
            contact: appointmentToSubmit.contact,
            specs: appointmentToSubmit.specs,
            problem: appointmentToSubmit.problem,
            description: appointmentToSubmit.description,
            date: appointmentToSubmit.date,
            status: 'PENDING'
          };

          setAppointments(prev => {
            const updated = [newApt, ...prev];
            localStorage.setItem('shadow_appointments', JSON.stringify(updated));
            return updated;
          });

          // Reset forms
          setAptName('');
          setAptContact('');
          setAptSpecs('');
          setAptCpu('Intel Core i7-13700K');
          setAptCpuBrand('Intel');
          setAptMobo('ASUS ROG Series');
          setAptGpu('NVIDIA GeForce RTX 4070');
          setAptRam('16GB DDR5');
          setAptStep(1);
          setAptProblem('Slow Performance & Freezing');
          setAptExplain('');
          
          setAppointmentToSubmit(null);
          setIsSubmittingAppointment(false);
          setAppointmentProgress(0);
          setAppointmentStage('');
          setAppointmentValidationError(null);
          setShowAppointmentSuccess(true);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isSubmittingAppointment, appointmentToSubmit]);

  // Uplink sending simulator (5-seconds)
  useEffect(() => {
    if (!isSendingUplink || !uplinkToSubmit) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setSendingUplinkProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          const trimTitle = uplinkToSubmit.gameTitle;
          const { category, description, linkType, gameFile } = uplinkToSubmit;

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
          } else if (category === 'ANIME') {
            const saved = localStorage.getItem('custom_anime');
            let animeList = [];
            try {
              animeList = saved ? JSON.parse(saved) : [];
            } catch (e) {}
            
            const existingIdx = animeList.findIndex((a: any) => a.title.toLowerCase() === trimTitle.toLowerCase());
            
            const updatedAnime = {
              id: existingIdx !== -1 ? animeList[existingIdx].id : String(Date.now()),
              title: trimTitle,
              description: description,
              protocol: linkType,
              link: gameFile
            };

            let updatedList;
            if (existingIdx !== -1) {
              updatedList = [...animeList];
              updatedList[existingIdx] = updatedAnime;
            } else {
              updatedList = [updatedAnime, ...animeList];
            }

            localStorage.setItem('custom_anime', JSON.stringify(updatedList));
          } else if (category === 'GAMES') {
            const saved = localStorage.getItem('custom_games');
            let gamesList = [];
            try {
              gamesList = saved ? JSON.parse(saved) : [];
            } catch (e) {}
            
            const existingIdx = gamesList.findIndex((g: any) => g.title.toLowerCase() === trimTitle.toLowerCase());
            
            const updatedGame = {
              id: existingIdx !== -1 ? gamesList[existingIdx].id : String(Date.now()),
              title: trimTitle,
              description: description,
              protocol: linkType,
              link: gameFile
            };

            let updatedList;
            if (existingIdx !== -1) {
              updatedList = [...gamesList];
              updatedList[existingIdx] = updatedGame;
            } else {
              updatedList = [updatedGame, ...gamesList];
            }

            localStorage.setItem('custom_games', JSON.stringify(updatedList));
          } else if (category === 'TUTORIALS') {
            const saved = localStorage.getItem('shadow_master_tutorials');
            const tutorialsList = saved ? JSON.parse(saved) : [];
            
            const existingIdx = tutorialsList.findIndex((t: any) => t.title.toLowerCase() === trimTitle.toLowerCase());
            
            const updatedTut = {
              id: existingIdx !== -1 ? tutorialsList[existingIdx].id : `custom-tut-${Date.now()}`,
              title: trimTitle.toUpperCase(),
              category: linkType.toUpperCase() === 'EXT' ? 'MISC GUIDE' : linkType.toUpperCase(),
              description: description || 'Custom resource linked by user profile.',
              url: gameFile
            };

            let updatedList;
            if (existingIdx !== -1) {
              updatedList = [...tutorialsList];
              updatedList[existingIdx] = updatedTut;
            } else {
              updatedList = [updatedTut, ...tutorialsList];
            }

            localStorage.setItem('shadow_master_tutorials', JSON.stringify(updatedList));
            setTutorials(updatedList);
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

          localStorage.setItem('admin_console_link', gameFile);
          setConsoleLink(gameFile);

          // Reset inputs / state
          setGameTitle('');
          setCategory('SOFTWARE');
          setDescription('');
          setGameFile('');
          setSelectedDriveUrl('CUSTOM_URL');
          setUplinkToSubmit(null);
          setIsSendingUplink(false);
          setSendingUplinkProgress(0);

          // Show success message
          setSuccessStatus('PROTOCOL SYNCHRONIZED SUCCESSFULLY');
          setTimeout(() => {
            setSuccessStatus(null);
            setIsModalOpen(false);
          }, 1200);

        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isSendingUplink, uplinkToSubmit]);

  // Shoutout sending simulator (5-seconds)
  useEffect(() => {
    if (!isPostingShout || !shoutPayload) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setPostingShoutProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          const { text, nameToUse, avatars, backgrounds } = shoutPayload;

          const randomIdx = Math.floor(Math.random() * avatars.length);
          const randomBgIdx = Math.floor(Math.random() * backgrounds.length);
          
          const newShout = {
            id: `shout-${Date.now()}`,
            name: nameToUse,
            message: text,
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
          
          // Reset fields
          setShoutMessage('');
          setShoutValidationError(null);
          setIsPostingShout(false);
          setPostingShoutProgress(0);
          setShoutPayload(null);
          setShoutSuccessCountdown(20);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPostingShout, shoutPayload, shouts]);

  // Track injection simulator (5-seconds)
  useEffect(() => {
    if (!isInjectingTrack || !trackInputPayload) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setInjectingTrackProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          const id = parseYoutubeId(trackInputPayload);
          if (!id) {
            alert("UNABLE TO RESOLVE COG-LINK URL // Re-evaluate YouTube details.");
            setIsInjectingTrack(false);
            setInjectingTrackProgress(0);
            setTrackInputPayload('');
            return;
          }

          const allCurrent = [...STATIC_PLAYLIST, ...customTracks];
          const matchIdx = allCurrent.findIndex(t => t.id === id);
          if (matchIdx !== -1) {
            setCurrentTrackIndex(matchIdx);
            localStorage.setItem('shadow_soundtrack_active_index', String(matchIdx));
            setLocalAudioActive(true);
            setIsPlaying(true);
            setSoundtrackInput('');
            setIsInjectingTrack(false);
            setInjectingTrackProgress(0);
            setTrackInputPayload('');
            return;
          }

          const newTrack = {
            id,
            name: `User Frequency Audio [${id.substring(0, 4)}]`,
            desc: `Injected frequencies: ${id}`
          };
          const updated = [newTrack, ...customTracks];
          setCustomTracks(updated);
          localStorage.setItem('shadow_custom_tracks_data', JSON.stringify(updated));
          
          const newIdx = STATIC_PLAYLIST.length;
          setCurrentTrackIndex(newIdx);
          localStorage.setItem('shadow_soundtrack_active_index', String(newIdx));
          setLocalAudioActive(true);
          setIsPlaying(true);

          setSoundtrackInput('');
          setIsInjectingTrack(false);
          setInjectingTrackProgress(0);
          setTrackInputPayload('');
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isInjectingTrack, trackInputPayload, customTracks]);

  // Passcode decryption simulator (5-seconds)
  useEffect(() => {
    if (!isDecryptingKey || !pendingDecryptPayload) return;

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setDecryptingKeyProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);

        setTimeout(async () => {
          const normalizedInput = pendingDecryptPayload.normalizedInput;
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

          setIsDecryptingKey(false);
          setDecryptingKeyProgress(0);
          setPendingDecryptPayload(null);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isDecryptingKey, pendingDecryptPayload, passwordAttempts]);

  // Deletion passcode verification simulator (5-seconds)
  useEffect(() => {
    if (!isVerifyingDelete || !pendingDeletePayload) return;

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setVerifyingDeleteProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);

        setTimeout(async () => {
          const normalizedInput = pendingDeletePayload.normalizedInput;
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

          setIsVerifyingDelete(false);
          setVerifyingDeleteProgress(0);
          setPendingDeletePayload(null);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isVerifyingDelete, pendingDeletePayload, suggestions, deleteItemId]);

  // Shoutout deletion passcode verification simulator (5-seconds)
  useEffect(() => {
    if (!isVerifyingDeleteShout || !pendingDeleteShoutPayload) return;

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setVerifyingDeleteShoutProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);

        setTimeout(async () => {
          const normalizedInput = pendingDeleteShoutPayload.normalizedInput;
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
            const updated = shouts.filter(s => s.id !== deleteShoutId);
            setShouts(updated);
            localStorage.setItem('shadow_shout_outs_v3', JSON.stringify(updated));
            
            setShowDeleteShoutPasswordModal(false);
            setDeleteShoutPasswordError('');
            setDeleteShoutPasswordInput('');
            setDeleteShoutId(null);
          } else {
            setDeleteShoutPasswordInput('');
            setDeleteShoutPasswordError('INVALID PASSWORD. ACCESS TO DELETION TERMINATED.');
          }

          setIsVerifyingDeleteShout(false);
          setVerifyingDeleteShoutProgress(0);
          setPendingDeleteShoutPayload(null);
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isVerifyingDeleteShout, pendingDeleteShoutPayload, shouts, deleteShoutId]);

  // Reset shout success countdown when modal closes
  useEffect(() => {
    if (!isShoutBoxOpen) {
      setShoutSuccessCountdown(null);
    }
  }, [isShoutBoxOpen]);

  // Shoutout success 20-second automatic close countdown
  useEffect(() => {
    if (shoutSuccessCountdown === null) return;
    if (!isShoutBoxOpen) {
      setShoutSuccessCountdown(null);
      return;
    }
    if (shoutSuccessCountdown <= 0) {
      setIsShoutBoxOpen(false);
      setShoutSuccessCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setShoutSuccessCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [shoutSuccessCountdown, isShoutBoxOpen]);

  // Store callbacks in refs to avoid restarting simulator on dependency change
  const onEnterRef = useRef(onEnter);
  const onShowShadowLoreRef = useRef(onShowShadowLore);

  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    onShowShadowLoreRef.current = onShowShadowLore;
  }, [onShowShadowLore]);

  // Entering Archive simulator (5-seconds)
  useEffect(() => {
    if (!isEnteringArchive) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(1, Math.min(100, Math.floor((elapsed / duration) * 100)));
      setEnteringArchiveProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          setIsEnteringArchive(false);
          setEnteringArchiveProgress(1);
          onEnterRef.current();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isEnteringArchive]);

  // Accessing Tutorials simulator (5-seconds)
  useEffect(() => {
    if (!isAccessingTutorials) return;

    const startTime = Date.now();
    const duration = 5000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(1, Math.min(100, Math.floor((elapsed / duration) * 100)));
      setAccessingTutorialsProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        setTimeout(() => {
          setIsAccessingTutorials(false);
          setAccessingTutorialsProgress(1);
          onShowShadowLoreRef.current();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isAccessingTutorials]);

  useEffect(() => {
    if (!isCommentingBanned) return;

    let savedBanUntil = localStorage.getItem('shout_ban_until');
    if (!savedBanUntil) {
      const future = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('shout_ban_until', future.toString());
      setBanUntil(future);
      savedBanUntil = future.toString();
    }

    const updateCountdown = () => {
      const until = parseInt(localStorage.getItem('shout_ban_until') || '0', 10);
      const remainingMs = until - Date.now();
      if (remainingMs <= 0) {
        setIsCommentingBanned(false);
        setBanUntil(null);
        setOffenseCount(0);
        localStorage.setItem('shout_offense_count', '0');
        localStorage.removeItem('shout_ban_until');
        localStorage.removeItem('shout_commenting_banned');
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        setBanTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isCommentingBanned]);

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

  const checkRestrictionsText = (text: string): boolean => {
    const textLower = text.toLowerCase();
    
    // Convert leetspeak/evasion representations to standard chars
    let normalized = textLower
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/\$/g, 's')
      .replace(/@/g, 'a');

    // Remove any special characters/punctuation/spaces for strict substring checks
    const stripped = normalized.replace(/[^a-z]/g, '');

    const badWords = [
      'fuck', 'shit', 'bitch', 'asshole', 'crap', 'dick', 'pussy', 'bastard', 'puta',
      'gago', 'gaga', 'tarantado', 'ulol', 'ulul', 'pakshet', 'pakyu', 'tangina', 'putangina',
      'fucker', 'bullshit', 'shet', 'kingina', 'kupal', 'damuho', 'lolo mo', 'pwet', 'puke', 'titi',
      'kantot', 'suck', 'cum', 'whore', 'slut', 'tang ina', 'putang ina', 'king ina', 'hayop',
      'tanginanyo', 'tangina nyo', 'tang ina nyo'
    ];
    
    const sexualWords = [
      'sex', 'orgasm', 'porn', 'naked', 'vulgar', 'nude', 'erotic', 'lust', 'penis', 'vagina',
      'sexx', 'hentai', 'milf', 'lewd', 'kantot', 'blowjob', 'clit', 'horny'
    ];
    
    const negativeWords = [
      'hate', 'sucks', 'terrible', 'worst', 'ugly', 'fail', 'stupid', 'trash',
      'garbage', 'useless', 'boring', 'horrible', 'disgusting', 'weak', 'panget', 'pangit',
      'bobo', 'tanga', 'walang kwenta', 'basura', 'corny', 'bulok'
    ];

    // Helper: returns true if any phrase matches
    const containsMatches = (list: string[]): boolean => {
      return list.some(word => {
        const wordLower = word.toLowerCase();
        // 1. Literal word boundary check on the original text
        const regex = new RegExp(`\\b${wordLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(textLower)) return true;

        // 2. Direct substring check on the original text
        if (textLower.includes(wordLower)) return true;

        // 3. Direct substring check on the leetspeak normalized text (e.g., if "f*ck" gets checked or "f_u_c_k")
        if (normalized.includes(wordLower)) return true;

        // 4. Substring check after stripping all non-alphabetic chars
        const wordStripped = wordLower.replace(/[^a-z]/g, '');
        if (wordStripped && stripped.includes(wordStripped)) return true;

        return false;
      });
    };

    return containsMatches(badWords) || containsMatches(sexualWords) || containsMatches(negativeWords);
  };

  const handlePostShout = (e: FormEvent) => {
    e.preventDefault();
    if (!shoutMessage.trim()) return;

    // Reset error
    setShoutValidationError(null);

    // If banned, prevent posting completely
    if (isCommentingBanned) {
      setShoutValidationError('TRANSMISSION BLOCKED: YOUR POSTING PRIVILEGES HAVE BEEN REVOKED.');
      return;
    }

    const text = shoutMessage.trim();
    const nameToUse = shoutName.trim() || 'Anonymous Operative';

    // 1. Sentence limit check: maximum 3 sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 3) {
      setShoutValidationError('TRANSMISSION BLOCKED: MESSAGE LIMIT EXCEEDED. MAXIMUM OF 3 SENTENCES ALLOWED.');
      return;
    }

    // 2. Validate both comment and name for profanity, negative words, and sexual words
    if (checkRestrictionsText(text) || checkRestrictionsText(nameToUse)) {
      const nextOffense = offenseCount + 1;
      setOffenseCount(nextOffense);
      localStorage.setItem('shout_offense_count', nextOffense.toString());

      if (nextOffense === 1) {
        setWarningPopup({
          title: "Comment not posted.",
          message: "Your message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.",
          violationNumber: 1
        });
        setShoutValidationError(
          `Comment not posted.\n\nYour message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.`
        );
      } else if (nextOffense === 2) {
        setWarningPopup({
          title: "Action Required:",
          message: "Final Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.",
          violationNumber: 2
        });
        setShoutValidationError(
          `Action Required:\n\nFinal Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.`
        );
      } else {
        const banPeriod = 24 * 60 * 60 * 1000; // 24 hours
        const activeBanUntil = Date.now() + banPeriod;
        setBanUntil(activeBanUntil);
        localStorage.setItem('shout_ban_until', activeBanUntil.toString());
        setIsCommentingBanned(true);
        localStorage.setItem('shout_commenting_banned', 'true');
        setWarningPopup({
          title: "Commenting privileges suspended.",
          message: "Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.",
          violationNumber: 3
        });
        setShoutValidationError(
          `Commenting privileges suspended.\n\nDue to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.`
        );
      }
      return;
    }

    const avatars = ['🔮', '👑', '🗡️', '🎩', '🦅', '🐺', '📖', '💸', '🎻', '🖤', '🌌', '☠️', '🍷'];
    const backgrounds = [
      'bg-purple-950/80 border border-purple-500/20 text-purple-400',
      'bg-blue-950/80 border border-blue-500/20 text-blue-400',
      'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400',
      'bg-orange-950/80 border border-orange-500/20 text-orange-400',
      'bg-pink-950/80 border border-pink-500/20 text-pink-400',
      'bg-amber-950/80 border border-amber-500/20 text-amber-500',
    ];

    setShoutPayload({
      text,
      nameToUse,
      avatars,
      backgrounds
    });
    setIsPostingShout(true);
    setPostingShoutProgress(0);
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
    localStorage.removeItem('custom_anime');
    localStorage.removeItem('custom_games');
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

    const savedAnime = localStorage.getItem('custom_anime');
    let customAnimeList = [];
    try {
      customAnimeList = savedAnime ? JSON.parse(savedAnime) : [];
    } catch (e) {}

    const savedGames = localStorage.getItem('custom_games');
    let customGamesList = [];
    try {
      customGamesList = savedGames ? JSON.parse(savedGames) : [];
    } catch (e) {}

    const savedTuts = localStorage.getItem('shadow_master_tutorials');
    let customTuts = [];
    try {
      customTuts = savedTuts ? JSON.parse(savedTuts) : [];
    } catch (e) {}

    return [
      ...linkedProjects.map((p: any) => ({
        id: p.id,
        type: 'SOFTWARE',
        name: p.title,
        description: p.description,
        link: p.link,
        protocol: p.tags?.[0] || 'EXT'
      })),
      ...customAnimeList.map((a: any) => ({
        id: a.id,
        type: 'ANIME',
        name: a.title,
        description: a.description,
        link: a.link,
        protocol: a.protocol || 'EXT'
      })),
      ...customGamesList.map((g: any) => ({
        id: g.id,
        type: 'GAMES',
        name: g.title,
        description: g.description,
        link: g.link,
        protocol: g.protocol || 'EXT'
      })),
      ...customTuts.map((t: any) => ({
        id: t.id,
        type: 'TUTORIALS',
        name: t.title,
        description: t.description,
        link: t.url || t.link,
        protocol: t.category || 'EXT'
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

  const handleUnlink = (id: string, type: string) => {
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
    } else if (type === 'ANIME') {
      const saved = localStorage.getItem('custom_anime');
      if (saved) {
        const animeList = JSON.parse(saved);
        const updatedList = animeList.filter((a: any) => a.id !== id);
        localStorage.setItem('custom_anime', JSON.stringify(updatedList));
      }
    } else if (type === 'GAMES') {
      const saved = localStorage.getItem('custom_games');
      if (saved) {
        const gamesList = JSON.parse(saved);
        const updatedList = gamesList.filter((g: any) => g.id !== id);
        localStorage.setItem('custom_games', JSON.stringify(updatedList));
      }
    } else if (type === 'TUTORIALS') {
      const saved = localStorage.getItem('shadow_master_tutorials');
      if (saved) {
        const tutorialsList = JSON.parse(saved);
        const updatedList = tutorialsList.filter((t: any) => t.id !== id);
        localStorage.setItem('shadow_master_tutorials', JSON.stringify(updatedList));
        setTutorials(updatedList);
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
    const targetType = editCategoryValue.trim().toUpperCase(); // 'SOFTWARE', 'ANIME', 'GAMES', 'TUTORIALS', or 'TOOL'
    const originalType = type.trim().toUpperCase(); // 'SOFTWARE', 'ANIME', 'GAMES', 'TUTORIALS', or 'TOOL'

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
      } else if (originalType === 'ANIME') {
        const saved = localStorage.getItem('custom_anime');
        let animeList = [];
        try {
          animeList = saved ? JSON.parse(saved) : [];
        } catch (e) {}
        const existingIdx = animeList.findIndex((a: any) => a.id === id);
        const itemObj = {
          id,
          title: editNameValue.trim(),
          description: editDescValue.trim(),
          protocol: editProtocolValue.trim(),
          link: editLinkValue.trim()
        };
        if (existingIdx !== -1) {
          animeList[existingIdx] = itemObj;
        } else {
          animeList.push(itemObj);
        }
        localStorage.setItem('custom_anime', JSON.stringify(animeList));
      } else if (originalType === 'GAMES') {
        const saved = localStorage.getItem('custom_games');
        let gamesList = [];
        try {
          gamesList = saved ? JSON.parse(saved) : [];
        } catch (e) {}
        const existingIdx = gamesList.findIndex((g: any) => g.id === id);
        const itemObj = {
          id,
          title: editNameValue.trim(),
          description: editDescValue.trim(),
          protocol: editProtocolValue.trim(),
          link: editLinkValue.trim()
        };
        if (existingIdx !== -1) {
          gamesList[existingIdx] = itemObj;
        } else {
          gamesList.push(itemObj);
        }
        localStorage.setItem('custom_games', JSON.stringify(gamesList));
      } else if (originalType === 'TUTORIALS') {
        const saved = localStorage.getItem('shadow_master_tutorials');
        const tutorialsList = saved ? JSON.parse(saved) : [];
        const existingIdx = tutorialsList.findIndex((t: any) => t.id === id);
        if (existingIdx !== -1) {
          tutorialsList[existingIdx].title = editNameValue.trim().toUpperCase();
          tutorialsList[existingIdx].category = editProtocolValue.trim().toUpperCase();
          tutorialsList[existingIdx].description = editDescValue.trim();
          tutorialsList[existingIdx].url = editLinkValue.trim();
          localStorage.setItem('shadow_master_tutorials', JSON.stringify(tutorialsList));
          setTutorials(tutorialsList);
        } else {
          const newTut = {
            id,
            title: editNameValue.trim().toUpperCase(),
            category: editProtocolValue.trim().toUpperCase(),
            description: editDescValue.trim(),
            url: editLinkValue.trim()
          };
          tutorialsList.push(newTut);
          localStorage.setItem('shadow_master_tutorials', JSON.stringify(tutorialsList));
          setTutorials(tutorialsList);
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
      } else if (originalType === 'ANIME') {
        const saved = localStorage.getItem('custom_anime');
        if (saved) {
          const animeList = JSON.parse(saved);
          const updatedList = animeList.filter((a: any) => a.id !== id);
          localStorage.setItem('custom_anime', JSON.stringify(updatedList));
        }
      } else if (originalType === 'GAMES') {
        const saved = localStorage.getItem('custom_games');
        if (saved) {
          const gamesList = JSON.parse(saved);
          const updatedList = gamesList.filter((g: any) => g.id !== id);
          localStorage.setItem('custom_games', JSON.stringify(updatedList));
        }
      } else if (originalType === 'TUTORIALS') {
        const saved = localStorage.getItem('shadow_master_tutorials');
        if (saved) {
          const tutorialsList = JSON.parse(saved);
          const updatedList = tutorialsList.filter((t: any) => t.id !== id);
          localStorage.setItem('shadow_master_tutorials', JSON.stringify(updatedList));
          setTutorials(updatedList);
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
      } else if (targetType === 'ANIME') {
        const saved = localStorage.getItem('custom_anime');
        let animeList = [];
        try {
          animeList = saved ? JSON.parse(saved) : [];
        } catch (e) {}
        const editName = editNameValue.trim();
        const existingIdx = animeList.findIndex((a: any) => a.title.toLowerCase().trim() === editName.toLowerCase());
        const newAnime = {
          id: existingIdx !== -1 ? animeList[existingIdx].id : String(Date.now()),
          title: editName,
          description: editDescValue.trim(),
          protocol: editProtocolValue.trim(),
          link: editLinkValue.trim()
        };
        if (existingIdx !== -1) {
          animeList[existingIdx] = newAnime;
        } else {
          animeList.push(newAnime);
        }
        localStorage.setItem('custom_anime', JSON.stringify(animeList));
      } else if (targetType === 'GAMES') {
        const saved = localStorage.getItem('custom_games');
        let gamesList = [];
        try {
          gamesList = saved ? JSON.parse(saved) : [];
        } catch (e) {}
        const editName = editNameValue.trim();
        const existingIdx = gamesList.findIndex((g: any) => g.title.toLowerCase().trim() === editName.toLowerCase());
        const newGame = {
          id: existingIdx !== -1 ? gamesList[existingIdx].id : String(Date.now()),
          title: editName,
          description: editDescValue.trim(),
          protocol: editProtocolValue.trim(),
          link: editLinkValue.trim()
        };
        if (existingIdx !== -1) {
          gamesList[existingIdx] = newGame;
        } else {
          gamesList.push(newGame);
        }
        localStorage.setItem('custom_games', JSON.stringify(gamesList));
      } else if (targetType === 'TUTORIALS') {
        const saved = localStorage.getItem('shadow_master_tutorials');
        const tutorialsList = saved ? JSON.parse(saved) : [];
        const editName = editNameValue.trim();
        const existingIdx = tutorialsList.findIndex((t: any) => t.title.toLowerCase().trim() === editName.toLowerCase());

        const updatedTut = {
          id: existingIdx !== -1 ? tutorialsList[existingIdx].id : `custom-tut-${Date.now()}`,
          title: editName.toUpperCase(),
          category: editProtocolValue.trim().toUpperCase(),
          description: editDescValue.trim(),
          url: editLinkValue.trim()
        };

        if (existingIdx !== -1) {
          tutorialsList[existingIdx] = updatedTut;
        } else {
          tutorialsList.push(updatedTut);
        }
        localStorage.setItem('shadow_master_tutorials', JSON.stringify(tutorialsList));
        setTutorials(tutorialsList);
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

    setUplinkToSubmit({
      gameTitle: trimTitle,
      category,
      description,
      linkType,
      gameFile
    });
    setIsSendingUplink(true);
    setSendingUplinkProgress(0);
  };

  return (
    <div className="min-h-[200vh] w-full flex flex-col bg-black text-white relative overflow-y-auto no-scrollbar scroll-smooth">
      {/* Hidden YouTube Theme Audio Stream */}
      {isPlaying && localAudioActive && (
        <iframe
          key={activeTrack.id}
          src={`https://www.youtube.com/embed/${activeTrack.id}?autoplay=1&mute=0&playlist=${activeTrack.id}&loop=1&controls=0&showinfo=0&disablekb=1&modestbranding=1`}
          allow="autoplay; encrypted-media"
          title="Landing Page Shadow Theme OST"
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
      )}

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
        className="absolute top-8 right-8 md:top-12 md:right-12 z-30 flex items-center gap-2 flex-wrap justify-end"
      >
        <button
          onClick={() => {
            setIsAppointmentModalOpen(true);
            setAptStep(1);
          }}
          className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-black transition-all active:scale-[0.98] shadow-lg border cursor-pointer select-none bg-neutral-900 border-purple-500/40 text-purple-450 hover:bg-neutral-850 hover:border-purple-400"
          id="appointment-scheduler-btn"
        >
          <Calendar size={11} className="text-purple-450 animate-pulse" />
          <span>Appointment</span>
        </button>



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
            setTempName(shoutName || '');
            setNameValidationError(null);
            setIsNamePromptOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-black transition-all active:scale-[0.98] shadow-lg border cursor-pointer select-none bg-neutral-900 border-purple-500/40 text-purple-450 hover:bg-neutral-850 hover:border-purple-400"
          id="shout-box-toggle-btn"
        >
          <MessageSquare size={11} className="text-purple-450 animate-pulse" />
          <span>Shout Out Box</span>
        </button>

        <button 
          onClick={() => {
            if (isAuthenticated) {
              setIsModalOpen(true);
            } else {
              setShowPasswordModal(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-black transition-all active:scale-[0.98] shadow-lg border cursor-pointer select-none ${
            isAuthenticated 
              ? 'bg-neutral-900 border-emerald-500/50 text-emerald-400 hover:bg-neutral-850 hover:border-emerald-400' 
              : 'bg-neutral-900 border-purple-500/40 text-purple-450 hover:bg-neutral-850 hover:border-purple-400'
          }`}
          id="google-drive-link-btn"
        >
          {isAuthenticated ? (
            <Unlock size={11} className="text-emerald-400 animate-pulse" />
          ) : (
            <Lock size={11} className="text-purple-450 animate-pulse" />
          )}
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
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#0b061a] border-2 border-purple-500/30 w-full max-w-sm rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.25)] relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-purple-500/40 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-purple-500/40 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-purple-500/40 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-purple-500/40 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <Lock className="text-purple-400 w-3.5 h-3.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Access Restricted</span>
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
                <div className="w-12 h-12 rounded-full bg-purple-950/20 border border-purple-900/40 flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="text-purple-400 w-6 h-6" />
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
                  setPendingDecryptPayload({ normalizedInput });
                  setIsDecryptingKey(true);
                  setDecryptingKeyProgress(0);
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={passwordInput}
                    disabled={isDecryptingKey || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder={isDecryptingKey ? "DECRYPTING..." : (lockoutUntil !== null && Date.now() < lockoutUntil ? "LOCKED OUT" : "ENTER PASSCODE")}
                    className={`w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em] ${(lockoutUntil !== null && Date.now() < lockoutUntil) || isDecryptingKey ? 'opacity-45 cursor-not-allowed border-purple-950 text-neutral-600' : ''}`}
                    autoFocus
                    required={!isDecryptingKey && !(lockoutUntil !== null && Date.now() < lockoutUntil)}
                  />
                  {(() => {
                    const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;
                    const errorMsg = isLocked ? 'Too many unsuccessful login attempts. Please try again in 5 minutes.' : passwordError;
                    
                    if (!errorMsg || isDecryptingKey) return null;
                    return (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] text-purple-400 font-bold uppercase tracking-widest text-center mt-2.5 leading-relaxed px-1"
                      >
                        🔮 {errorMsg} 🔮
                      </motion.p>
                    );
                  })()}
                </div>

                {isDecryptingKey ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    {/* Circular Progress Loader */}
                    <div className="relative flex items-center justify-center w-14 h-14 mx-auto">
                      {/* Outer rotating ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                      
                      {/* Inner SVG Circular Progress */}
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-neutral-900"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        {/* Foreground Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-purple-500 transition-all duration-100 ease-out"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 * (1 - decryptingKeyProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center text showing percentage */}
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className="text-[8px] font-black text-purple-400 leading-none">
                          {decryptingKeyProgress}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[7.5px] font-mono text-purple-400 font-extrabold uppercase tracking-widest mt-1">DISSOLVING SHA256 LAYERS...</span>
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={lockoutUntil !== null && Date.now() < lockoutUntil}
                    className={`w-full py-2.5 border font-black uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                      lockoutUntil !== null && Date.now() < lockoutUntil
                        ? 'bg-neutral-900/40 border-neutral-850 text-neutral-600 cursor-not-allowed'
                        : 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-900/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                    }`}
                  >
                    {lockoutUntil !== null && Date.now() < lockoutUntil ? 'TACTICAL UPLINK BLOCKED' : 'DECRYPT & AUTHENTICATE'}
                  </button>
                )}
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
              className="bg-[#0b061a] border-2 border-purple-500/30 w-full max-w-sm rounded-[1.8rem] shadow-[0_0_40px_rgba(168,85,247,0.25)] relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-35" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-purple-500/40 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-purple-500/40 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-purple-500/40 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-purple-500/40 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-purple-400 w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Purge Authorization</span>
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
                <div className="w-12 h-12 rounded-full bg-purple-950/20 border border-purple-900/40 flex items-center justify-center mx-auto mb-3">
                  <Lock className="text-purple-400 w-5 h-5" />
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
                  setPendingDeletePayload({ normalizedInput });
                  setIsVerifyingDelete(true);
                  setVerifyingDeleteProgress(0);
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={deletePasswordInput}
                    disabled={isVerifyingDelete}
                    onChange={(e) => {
                      setDeletePasswordInput(e.target.value);
                      if (deletePasswordError) setDeletePasswordError('');
                    }}
                    placeholder={isVerifyingDelete ? "AUTHLOCKED..." : "ENTER PASSWORD"}
                    className={`w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em] ${isVerifyingDelete ? 'opacity-45 cursor-not-allowed text-neutral-600' : ''}`}
                    autoFocus
                    required={!isVerifyingDelete}
                  />
                  {deletePasswordError && !isVerifyingDelete && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8.5px] text-purple-400 font-bold uppercase tracking-widest text-center mt-2.5 leading-relaxed px-1"
                    >
                      🔮 {deletePasswordError} 🔮
                    </motion.p>
                  )}
                </div>

                {isVerifyingDelete ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    {/* Circular Progress Loader */}
                    <div className="relative flex items-center justify-center w-14 h-14 mx-auto">
                      {/* Outer rotating ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                      
                      {/* Inner SVG Circular Progress */}
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-neutral-900"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        {/* Foreground Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-purple-500 transition-all duration-100 ease-out"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 * (1 - verifyingDeleteProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center text showing percentage */}
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className="text-[8px] font-black text-purple-400 leading-none">
                          {verifyingDeleteProgress}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[7.5px] font-mono text-purple-400 font-extrabold uppercase tracking-widest mt-1">VERIFYING DELETION CRITERIA...</span>
                  </div>
                ) : (
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
                      className="flex-1 py-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/40 text-purple-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer select-none active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secure Delete Shoutout Authentication Modal */}
      <AnimatePresence>
        {showDeleteShoutPasswordModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#0b061a] border-2 border-purple-500/30 w-full max-w-sm rounded-[1.8rem] shadow-[0_0_40px_rgba(168,85,247,0.25)] relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
            >
              {/* Grid overlay decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-35" />
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-purple-500/40 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-purple-500/40 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-purple-500/40 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-purple-500/40 rounded-br-lg pointer-events-none" />

              {/* Close Button UI */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-purple-400 w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Purge Shoutout</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteShoutPasswordModal(false);
                    setDeleteShoutPasswordError('');
                    setDeleteShoutPasswordInput('');
                    setDeleteShoutId(null);
                  }}
                  className="p-1 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Close purge prompt"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Icon & Message */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-purple-950/20 border border-purple-900/40 flex items-center justify-center mx-auto mb-3">
                  <Lock className="text-purple-400 w-5 h-5" />
                </div>
                <h4 className="text-[11px] uppercase tracking-[0.22em] font-black text-white mb-1.5">Authorization Key Required</h4>
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 leading-relaxed">
                  Deleting shoutouts from persistent store requires verification. Enter admin password below.
                </p>
              </div>

              {/* Password submission form */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const normalizedInput = deleteShoutPasswordInput.trim().toLowerCase();
                  setPendingDeleteShoutPayload({ normalizedInput });
                  setIsVerifyingDeleteShout(true);
                  setVerifyingDeleteShoutProgress(0);
                }}
                className="space-y-4 relative z-10"
              >
                <div>
                  <input 
                    type="password"
                    value={deleteShoutPasswordInput}
                    disabled={isVerifyingDeleteShout}
                    onChange={(e) => {
                      setDeleteShoutPasswordInput(e.target.value);
                      if (deleteShoutPasswordError) setDeleteShoutPasswordError('');
                    }}
                    placeholder={isVerifyingDeleteShout ? "AUTHLOCKED..." : "ENTER PASSWORD"}
                    className={`w-full text-center rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-white font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all placeholder:text-neutral-700 font-semibold uppercase tracking-[0.15em] ${isVerifyingDeleteShout ? 'opacity-45 cursor-not-allowed text-neutral-600' : ''}`}
                    autoFocus
                    required={!isVerifyingDeleteShout}
                  />
                  {deleteShoutPasswordError && !isVerifyingDeleteShout && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8.5px] text-purple-400 font-bold uppercase tracking-widest text-center mt-2.5 leading-relaxed px-1"
                    >
                      🔮 {deleteShoutPasswordError} 🔮
                    </motion.p>
                  )}
                </div>

                {isVerifyingDeleteShout ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    {/* Circular Progress Loader */}
                    <div className="relative flex items-center justify-center w-14 h-14 mx-auto">
                      {/* Outer rotating ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                      
                      {/* Inner SVG Circular Progress */}
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-neutral-900"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        {/* Foreground Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-purple-500 transition-all duration-100 ease-out"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 * (1 - verifyingDeleteShoutProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center text showing percentage */}
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className="text-[8px] font-black text-purple-400 leading-none">
                          {verifyingDeleteShoutProgress}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[7.5px] font-mono text-purple-400 font-extrabold uppercase tracking-widest mt-1">VERIFYING DELETION CRITERIA...</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowDeleteShoutPasswordModal(false);
                        setDeleteShoutPasswordError('');
                        setDeleteShoutPasswordInput('');
                        setDeleteShoutId(null);
                      }}
                      className="flex-1 py-2.5 bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800 text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer select-none active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/40 text-purple-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer select-none active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    >
                      Confirm
                    </button>
                  </div>
                )}
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
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono"
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
              <div className="flex border-b border-neutral-900 mb-5 relative z-10 gap-x-1 sm:gap-x-2 justify-start w-full overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('uplink')}
                  className={`pb-2.5 px-2.5 font-mono text-[8.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.05em] md:tracking-[0.12em] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'uplink'
                      ? 'border-purple-500 text-purple-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [01] UPLINK PROTOCOL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('linked')}
                  className={`pb-2.5 px-2.5 font-mono text-[8.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.05em] md:tracking-[0.12em] font-bold border-b-2 transition-all cursor-pointer relative whitespace-nowrap ${
                    activeTab === 'linked'
                      ? 'border-purple-500 text-purple-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [02] LINKED DIRECTORY
                  {getLinkedItems().length > 0 && (
                    <span className="ml-1 px-1 py-0.5 bg-purple-600 text-white font-black text-[7.5px] sm:text-[8.5px] rounded-full font-mono">
                      {getLinkedItems().length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tutorials')}
                  className={`pb-2.5 px-2.5 font-mono text-[8.5px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.05em] md:tracking-[0.12em] font-bold border-b-2 transition-all cursor-pointer relative whitespace-nowrap ${
                    activeTab === 'tutorials'
                      ? 'border-purple-500 text-purple-400 font-extrabold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  [03] SHADOW TUTORIALS
                  {tutorials.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-neutral-900 border border-purple-500/30 text-purple-400 font-black text-[7.5px] sm:text-[8.5px] rounded-full font-mono">
                      {tutorials.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'uplink' && (
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
                          <option value="ANIME" className="bg-neutral-950 text-white">ANIME DIRECTORY [02]</option>
                          <option value="TUTORIALS" className="bg-neutral-950 text-white">TUTORIALS DIRECTORY [03]</option>
                          <option value="TOOLS" className="bg-neutral-950 text-white">END-USER UTILITIES [04]</option>
                          <option value="GAMES" className="bg-neutral-950 text-white">GAMES DIRECTORY [05]</option>
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
                        {['G: DRIVE', 'FB', 'EXT'].map((opt) => (
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
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-neutral-900 mt-6 gap-3.5 font-mono">
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => setIsAdminSuggestionsOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/40 text-purple-400 hover:text-purple-300 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={11} className="text-purple-400 animate-pulse" />
                        <span>SUGGESTIONS</span>
                        {suggestions.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-black rounded font-mono leading-none">
                            {suggestions.length}
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {isSendingUplink ? (
                      <div className="flex items-center gap-3 px-6 py-1.5 font-mono">
                        {/* Circular Progress Loader */}
                        <div className="relative flex items-center justify-center w-10 h-10">
                          {/* Outer rotating ring */}
                          <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                          
                          {/* Inner SVG Circular Progress */}
                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 80 80">
                            {/* Background Track */}
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-neutral-900"
                              strokeWidth="5"
                              fill="transparent"
                            />
                            {/* Foreground Progress */}
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-purple-500 transition-all duration-100 ease-out"
                              strokeWidth="5"
                              fill="transparent"
                              strokeDasharray="213.6"
                              strokeDashoffset={213.6 * (1 - sendingUplinkProgress / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          
                          {/* Center text showing percentage */}
                          <div className="absolute flex flex-col items-center justify-center font-mono">
                            <span className="text-[7px] font-black text-purple-400 leading-none">
                              {sendingUplinkProgress}%
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.15em] text-purple-400 font-bold animate-pulse">TRANSMITTING UPLINK...</span>
                      </div>
                    ) : (
                      <button 
                        type="submit"
                        className="w-full sm:w-auto relative group flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-750 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 text-center font-mono"
                      >
                        <Sparkles size={12} className="text-white group-hover:rotate-12 transition-transform" />
                        SYNC UPLINK PROTOCOL
                      </button>
                    )}
                  </div>

                </form>
              )}

              {activeTab === 'linked' && (
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
                                  : item.type === 'ANIME'
                                  ? 'bg-rose-950/20 text-rose-450 border border-rose-900/30'
                                  : item.type === 'GAMES'
                                  ? 'bg-sky-950/20 text-sky-400 border border-sky-900/30'
                                  : item.type === 'TUTORIALS'
                                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
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
                                      <option value="SOFTWARE" className="bg-neutral-950 text-white">SOFTWARE DIRECTORY [01]</option>
                                      <option value="ANIME" className="bg-neutral-950 text-white">ANIME DIRECTORY [02]</option>
                                      <option value="TUTORIALS" className="bg-neutral-950 text-white">TUTORIALS DIRECTORY [03]</option>
                                      <option value="TOOL" className="bg-neutral-950 text-white">END-USER UTILITIES [04]</option>
                                      <option value="GAMES" className="bg-neutral-950 text-white">GAMES DIRECTORY [05]</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 font-mono">PROTOCOL TYPE</label>
                                    <input
                                      type="text"
                                      value={editProtocolValue}
                                      onChange={(e) => setEditProtocolValue(e.target.value)}
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-white outline-none focus:border-purple-500 font-mono"
                                      placeholder="e.g. EXT, G: DRIVE, FB"
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
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-neutral-900 mt-2 shrink-0 gap-3 w-full font-mono">
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => setIsAdminSuggestionsOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/40 text-purple-400 hover:text-purple-300 rounded-xl font-mono text-[9px] uppercase tracking-[0.15em] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={11} className="text-purple-400 animate-pulse" />
                        <span>SUGGESTIONS</span>
                        {suggestions.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-black rounded font-mono leading-none">
                            {suggestions.length}
                          </span>
                        )}
                      </button>
                    </div>
                    
                    <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-500">
                      SECURE TERMINAL DIRECTORY INDEX
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'tutorials' && (
                <div className="space-y-4 relative z-10 flex flex-col h-[340px] text-left">
                  {/* Tutorial Links Header / Add Tutorial Trigger */}
                  <div className="flex items-center justify-between font-mono pb-2 border-b border-neutral-900 shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-purple-400 font-extrabold flex items-center gap-1.5">
                      <BookOpen size={11} className="text-purple-400 animate-pulse" />
                      <span>// SYSTEM REFERENCE DIRECTORY</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingTutorial(!isAddingTutorial)}
                      className="px-2 py-1 bg-purple-950/20 border border-purple-500/20 hover:border-purple-500 hover:bg-purple-950/40 text-[8px] text-purple-400 hover:text-purple-300 rounded font-black tracking-widest uppercase transition-all select-none cursor-pointer flex items-center gap-1"
                    >
                      {isAddingTutorial ? 'Cancel' : '+ File Link'}
                    </button>
                  </div>

                  {isAddingTutorial ? (
                    /* Add Tutorial Form */
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newTutorialTitle || !newTutorialUrl) return;
                        const newTut = {
                          id: `custom-tut-${Date.now()}`,
                          title: newTutorialTitle.toUpperCase(),
                          category: newTutorialCategory.toUpperCase(),
                          description: newTutorialDesc || 'Custom resource linked by user profile.',
                          url: newTutorialUrl
                        };
                        const updated = [...tutorials, newTut];
                        setTutorials(updated);
                        
                        // Save to localStorage (only the non-system ones)
                        const customOnly = updated.filter(t => !t.system);
                        localStorage.setItem('shadow_master_tutorials', JSON.stringify(customOnly));
                        
                        // Reset forms
                        setNewTutorialTitle('');
                        setNewTutorialDesc('');
                        setNewTutorialUrl('');
                        setIsAddingTutorial(false);
                      }}
                      className="flex-1 overflow-y-auto pr-1 space-y-3.5 font-mono"
                    >
                      <div>
                        <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1 block">
                          [01] TUTORIAL TITLE OR PROTOCOL NAME
                        </label>
                        <input
                          type="text"
                          value={newTutorialTitle}
                          onChange={(e) => setNewTutorialTitle(e.target.value)}
                          placeholder="e.g. ULTIMATE WINDOWS OS LATENCY SLIGHT ENGINE"
                          className="w-full rounded-xl bg-neutral-950 border border-neutral-850 p-2.5 text-white font-mono text-[10.5px] uppercase tracking-wider focus:border-purple-500 outline-none placeholder:text-neutral-700 font-semibold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1 block">
                            [02] CATEGORY TAG
                          </label>
                          <select
                            value={newTutorialCategory}
                            onChange={(e) => setNewTutorialCategory(e.target.value)}
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-850 p-2 text-white font-mono text-[10.5px] focus:border-purple-500 outline-none cursor-pointer font-semibold"
                          >
                            <option value="CPU/POWER">CPU/POWER</option>
                            <option value="RAM OC">RAM OC</option>
                            <option value="OS OPTIMIZATION">OS OPTIMIZATION</option>
                            <option value="OS OVERRIDES">OS OVERRIDES</option>
                            <option value="STORAGE DISKS">STORAGE DISKS</option>
                            <option value="MISC GUIDE">MISC GUIDE</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1 block">
                            [03] RESOURCE DESTINATION URL
                          </label>
                          <input
                            type="url"
                            value={newTutorialUrl}
                            onChange={(e) => setNewTutorialUrl(e.target.value)}
                            placeholder="https://example.com/guide.md"
                            className="w-full rounded-xl bg-neutral-950 border border-neutral-850 p-2 text-white font-mono text-[10.5px] focus:border-purple-500 outline-none placeholder:text-neutral-700 font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1 block">
                          [04] SUMMARY OR BRIEF BRIEF
                        </label>
                        <textarea
                          value={newTutorialDesc}
                          onChange={(e) => setNewTutorialDesc(e.target.value)}
                          placeholder="Summary of memory addresses, registry paths, or execution bounds..."
                          rows={2}
                          className="w-full rounded-xl bg-neutral-950 border border-neutral-850 p-2.5 text-white font-mono text-[10px] focus:border-purple-500 outline-none placeholder:text-neutral-700 resize-none font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-755 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all font-mono shadow-md cursor-pointer"
                      >
                        SUBMIT SHADOW TUTORIAL DATA PACKET
                      </button>
                    </form>
                  ) : (
                    /* Tutorials List */
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 font-mono scrollbar-thin scrollbar-thumb-purple-500/10 hover:scrollbar-thumb-purple-500/30">
                      {tutorials.length === 0 ? (
                        <div className="py-12 px-4 rounded-2xl bg-neutral-900/10 border border-dashed border-neutral-900 flex flex-col items-center justify-center text-center">
                          <span className="text-xl mb-1.5 opacity-60">📁</span>
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">
                            REFERENCE DIRECTORY EMPTY
                          </span>
                          <p className="text-[8px] text-neutral-655 max-w-[280px] leading-normal font-sans text-neutral-500 uppercase font-bold tracking-wide">
                            No linked manuals found in index. Register custom reference files with '+ FILE LINK'.
                          </p>
                        </div>
                      ) : (
                        tutorials.map((tut) => (
                          <div 
                            key={tut.id}
                            className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-900/80 hover:border-neutral-800 transition-all flex flex-col font-mono relative group"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[7px] font-bold tracking-widest px-1.5 py-0.5 bg-purple-950/20 text-purple-400 border border-purple-900/25 rounded uppercase">
                                  {tut.category}
                                </span>
                                {tut.system && (
                                  <span className="text-[6.5px] font-black tracking-wider px-1 bg-neutral-950/60 text-neutral-500 border border-neutral-900 rounded select-none">
                                    SYSTEM
                                  </span>
                                )}
                              </div>
                              
                              {!tut.system && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = tutorials.filter(t => t.id !== tut.id);
                                    setTutorials(filtered);
                                    const customOnly = filtered.filter(t => !t.system);
                                    localStorage.setItem('shadow_master_tutorials', JSON.stringify(customOnly));
                                  }}
                                  className="text-[7.5px] text-red-500 hover:text-red-400 uppercase tracking-wider font-extrabold cursor-pointer select-none transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>

                            <h4 className="text-[10px] sm:text-[10.5px] font-extrabold tracking-wide text-white mb-1 uppercase">
                              {tut.title}
                            </h4>
                            
                            <p className="text-[9px] text-neutral-400 leading-normal mb-2 font-sans">
                              {tut.description}
                            </p>

                            <a
                              href={tut.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="self-start text-[8px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest inline-flex items-center gap-1 border-b border-dashed border-purple-400/30 hover:border-purple-300/60 pb-0.5 no-underline cursor-pointer"
                            >
                              INITIALIZE EDUCATION DECODER <ExternalLink size={9} />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tutorials Footer Cancel / Back Indicator */}
                  <div className="flex items-center justify-end pt-4 border-t border-neutral-900 mt-2 shrink-0 w-full font-mono">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-500 text-right w-full">
                      MASTER INSTRUCTION DIRECTIVES
                    </span>
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
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono flex flex-col max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl pointer-events-none" />

              {/* Success Toast Overlay inside Suggestion Modal */}
              <AnimatePresence>
                {showSuggestionSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 inset-y-0 bg-neutral-950/98 z-50 flex flex-col items-center justify-center text-center p-6 gap-5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                      <CheckCircle className="text-purple-500 w-20 h-20 animate-bounce relative z-10" />
                    </div>
                    <div>
                      <h4 className="text-purple-400 font-mono font-black uppercase text-base tracking-[0.3em] mb-2">SUCCESS</h4>
                      <p className="text-neutral-200 font-sans text-xs max-w-sm mx-auto leading-relaxed">
                        successfully sent to admin console suggestion box
                      </p>
                      <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-widest mt-2">
                        TRANSMISSION STABILIZED // SYSTEM PACKETS ARCHIVED
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuggestionSuccess(false);
                        setIsSuggestionModalOpen(false);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)] mt-3"
                    >
                      Acknowledge
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  onClick={() => {
                    if (isSendingSuggestion) return;
                    setIsSuggestionModalOpen(false);
                  }}
                  disabled={isSendingSuggestion}
                  className={`p-1.5 border border-neutral-850 rounded-lg transition-all ${
                    isSendingSuggestion 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer'
                  }`}
                  title={isSendingSuggestion ? "Transmission active" : "Close console"}
                >
                  {isSendingSuggestion ? <Lock size={16} className="text-purple-400 animate-pulse" /> : <X size={16} />}
                </button>
              </div>

              {/* Main Content Area: Single Column Form */}
              <div className="flex flex-col gap-6 relative z-10 overflow-y-auto no-scrollbar pb-4 flex-1">
                
                {/* Single Column: Form */}
                <div className="w-full flex flex-col gap-5">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-extrabold mb-1">
                      Log New Suggestion
                    </h4>
                    <p className="text-[8px] uppercase tracking-wider text-neutral-500 leading-normal">
                      Input diagnostic recommendation, categorized and tracked securely in the local browser state directory.
                    </p>
                  </div>

                  {isSendingSuggestion ? (
                    /* Holographic Tactical Circular Loading Animation (5 Seconds) */
                    <div className="flex flex-col items-center justify-center py-12 my-auto relative">
                      {/* Circular Progress Loader */}
                      <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                        
                        {/* Inner SVG Circular Progress */}
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                          {/* Background Track */}
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            className="stroke-neutral-900"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          {/* Foreground Progress */}
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            className="stroke-purple-500 transition-all duration-100 ease-out"
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray="213.6"
                            strokeDashoffset={213.6 * (1 - sendingSuggestionProgress / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        {/* Center text showing percentage */}
                        <div className="absolute flex flex-col items-center justify-center font-mono">
                          <span className="text-[10px] font-black text-purple-400 leading-none">
                            {sendingSuggestionProgress}%
                          </span>
                          <span className="text-[5.5px] text-neutral-500 tracking-widest uppercase mt-0.5 font-extrabold">
                            TX
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : isCommentingBanned ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-500/35 bg-red-955/20 text-center rounded-2xl space-y-4 my-auto min-h-[220px]">
                      <div className="w-12 h-12 bg-red-955/40 rounded-full border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
                        <span className="text-xl">☠️</span>
                      </div>
                      <h4 className="text-red-400 font-mono font-black text-xs tracking-[0.1em] uppercase">Suggestions Suppressed</h4>
                      <p className="text-[10px] text-neutral-300 font-sans leading-relaxed px-2">
                        Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post suggestions has been removed. If you believe this is an error, please contact support.
                      </p>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSuggestionText.trim()) return;

                        if (isCommentingBanned) {
                          setSuggestionValidationError('TRANSMISSION BLOCKED: YOUR POSTING PRIVILEGES HAVE BEEN REVOKED.');
                          return;
                        }

                        const text = newSuggestionText.trim();
                        if (checkRestrictionsText(text)) {
                          const nextOffense = offenseCount + 1;
                          setOffenseCount(nextOffense);
                          localStorage.setItem('shout_offense_count', nextOffense.toString());

                          if (nextOffense === 1) {
                            setWarningPopup({
                              title: "Comment not posted.",
                              message: "Your message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.",
                              violationNumber: 1
                            });
                            setSuggestionValidationError(
                              `Suggestion not posted.\n\nYour message includes language that violates our community guidelines. Please ensure your future submissions are respectful and free of profanity. This is your first warning; please note that we track repeated violations.`
                            );
                          } else if (nextOffense === 2) {
                            setWarningPopup({
                              title: "Action Required:",
                              message: "Final Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.",
                              violationNumber: 2
                            });
                            setSuggestionValidationError(
                              `Action Required:\n\nFinal Warning.\nYour recent suggestion was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your privileges.`
                            );
                          } else {
                            const banPeriod = 24 * 60 * 60 * 1000; // 24 hours
                            const activeBanUntil = Date.now() + banPeriod;
                            setBanUntil(activeBanUntil);
                            localStorage.setItem('shout_ban_until', activeBanUntil.toString());
                            setIsCommentingBanned(true);
                            localStorage.setItem('shout_commenting_banned', 'true');
                            setWarningPopup({
                              title: "Commenting privileges suspended.",
                              message: "Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.",
                              violationNumber: 3
                            });
                            setSuggestionValidationError(
                              `Commenting privileges suspended.\n\nDue to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.`
                            );
                          }
                          return;
                        }

                        // Start 5 second simulated transmission uplink
                        setSuggestionToSubmit({
                          text: text,
                          category: newSuggestionCategory,
                          status: newSuggestionStatus
                        });
                        setIsSendingSuggestion(true);
                        setSendingSuggestionProgress(0);
                        setSendingSuggestionStage('ESTABLISHING SECURE COLD HANDSHAKE...');
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                          Suggestion Prompt / Code Draft
                        </label>
                        <textarea
                          value={newSuggestionText}
                          onChange={(e) => {
                            setNewSuggestionText(e.target.value);
                            if (suggestionValidationError) setSuggestionValidationError(null);
                          }}
                          placeholder="ENTER SUGGESTED SYSTEM OPTIMIZATION..."
                          rows={4}
                          required
                          className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white p-3 rounded-xl resize-none outline-none transition-all placeholder:text-neutral-700 placeholder:text-[9.5px]"
                        />
                      </div>

                      {suggestionValidationError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-955/35 border border-red-500/35 text-red-200 text-[10px] font-sans rounded-xl flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        >
                          <span className="text-xs shrink-0">⚠️</span>
                          <span className="leading-normal font-semibold whitespace-pre-line">{suggestionValidationError}</span>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[9px] uppercase font-bold tracking-[0.20em] transition-all hover:brightness-110 active:scale-95 cursor-pointer rounded-xl flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Send size={11} className="animate-pulse" />
                        <span>Send Suggestion</span>
                      </button>
                    </form>
                  )}
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

      {/* Appointment Booking Console Modal */}
      <AnimatePresence>
        {isAppointmentModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto w-full" id="appointment-scheduler-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono flex flex-col max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl pointer-events-none" />

              {/* Success Toast Overlay inside Appointment Modal */}
              <AnimatePresence>
                {showAppointmentSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 inset-y-0 bg-neutral-950/98 z-50 flex flex-col items-center justify-center text-center p-6 gap-5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                      <CheckCircle className="text-purple-500 w-20 h-20 animate-bounce relative z-10" />
                    </div>
                    <div>
                      <h4 className="text-purple-400 font-mono font-black uppercase text-base tracking-[0.3em] mb-2">DIAGNOSTIC TICKET LOGGED</h4>
                      <p className="text-neutral-200 font-sans text-xs max-w-sm mx-auto leading-relaxed">
                        Your PC problem has been reported successfully. Dispatch officers have allocated cognitive bandwidth for resolution!
                      </p>
                      <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-widest mt-3">
                        DIAGNOSIS INITIATED // TICKETS DATABASE SYNCHRONIZED
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAppointmentSuccess(false);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:brightness-110 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)] mt-2"
                    >
                      Acknowledge Ticket
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-900 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-400">
                    <Calendar className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold uppercase tracking-[0.2em] text-white">
                      PC Diagnostics Console
                    </h3>
                    <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold mt-0.5">
                      // DIRECT TROUBLESHOOTING TELEMETRY SECURED
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isSubmittingAppointment) return;
                    setIsAppointmentModalOpen(false);
                  }}
                  disabled={isSubmittingAppointment}
                  className={`p-1.5 border border-neutral-850 rounded-lg transition-all ${
                    isSubmittingAppointment 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer'
                  }`}
                  title={isSubmittingAppointment ? "Transmission active" : "Close console"}
                >
                  {isSubmittingAppointment ? <Lock size={16} className="text-purple-400 animate-pulse" /> : <X size={16} />}
                </button>
              </div>

              {/* Tabs selector */}
              <div className="flex gap-2 mb-6 border-b border-neutral-900 pb-4 shrink-0 relative z-10">
                <button
                  onClick={() => setAptActiveTab('book')}
                  disabled={isSubmittingAppointment}
                  className={`px-4 py-2 border rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    aptActiveTab === 'book'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-black'
                      : 'bg-neutral-950/50 border-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Log Ticket
                </button>
                <button
                  onClick={() => setAptActiveTab('view')}
                  disabled={isSubmittingAppointment}
                  className={`px-4 py-2 border rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                    aptActiveTab === 'view'
                      ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-black'
                      : 'bg-neutral-950/50 border-neutral-900 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>Active Tickets</span>
                  <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-850 text-neutral-500 text-[8px] rounded font-bold leading-normal">
                    {appointments.length}
                  </span>
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-col gap-6 relative z-10 overflow-y-auto no-scrollbar pb-4 flex-1">
                
                {aptActiveTab === 'book' ? (
                  <div className="w-full flex flex-col gap-5">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-extrabold mb-1">
                        Submit Diagnostic Report
                      </h4>
                      <p className="text-[8px] uppercase tracking-wider text-neutral-500 leading-normal">
                        Submit your hardware or software issue details to dispatch immediate troubleshooting.
                      </p>
                    </div>

                    {isSubmittingAppointment ? (
                      /* Simulated progress bar */
                      <div className="flex flex-col items-center justify-center py-12 my-auto relative">
                        <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
                          <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-neutral-900"
                              strokeWidth="3.5"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-purple-500 transition-all duration-100 ease-out"
                              strokeWidth="3.5"
                              fill="transparent"
                              strokeDasharray="213.6"
                              strokeDashoffset={213.6 * (1 - appointmentProgress / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center font-mono">
                            <span className="text-xs font-black text-purple-300 leading-none">
                              {appointmentProgress}%
                            </span>
                          </div>
                        </div>

                        <div className="text-center mt-6">
                          <span className="text-[10px] tracking-[0.2em] text-neutral-300 uppercase font-bold block animate-pulse mb-1">
                            {appointmentStage}
                          </span>
                          <span className="text-[8px] tracking-widest text-purple-300/60 uppercase font-black block">
                            TRANSMITTING DIAGNOSTICS TELEMETRY SOCKETS
                          </span>
                        </div>
                      </div>
                    ) : (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAppointmentValidationError(null);

                          const name = aptName.trim();
                          const contact = aptContact.trim();
                          
                          // Compile specifications string from dropdown selections
                          const specs = `CPU: ${aptCpu} | GPU: ${aptGpu} | MOBO: ${aptMobo} | RAM: ${aptRam}`;
                          const problem = aptProblem;
                          const description = aptExplain.trim();

                          if (!name) {
                            setAppointmentValidationError('VALIDATION ERROR: Name / Alias is required.');
                            setAptStep(1);
                            return;
                          }

                          if (!contact) {
                            setAppointmentValidationError('VALIDATION ERROR: Contact Information (email, discord, phone) is required.');
                            setAptStep(1);
                            return;
                          }

                          if (!specs) {
                            setAppointmentValidationError('VALIDATION ERROR: Please select your computer specifications in Step 2.');
                            setAptStep(2);
                            return;
                          }

                          if (!description) {
                            setAppointmentValidationError('VALIDATION ERROR: Please explain your PC problem in the diagnostics chat box.');
                            setAptStep(3);
                            return;
                          }

                          const todayStr = new Date().toISOString().substring(0, 10);

                          setAppointmentToSubmit({
                            id: 'ap-' + Date.now(),
                            name,
                            contact,
                            specs,
                            problem,
                            description,
                            date: todayStr,
                            status: 'PENDING'
                          });
                          setIsSubmittingAppointment(true);
                          setAppointmentProgress(0);
                          setAppointmentStage('DIAGNOSING SYSTEM LOGS & CONTEXT...');
                        }}
                        className="space-y-4"
                      >
                        {/* Progressive Stepper Indicator at the Top */}
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mb-4 font-mono text-[9px]">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                              aptStep >= 1 ? 'bg-purple-600 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                            }`}>1</span>
                            <span className={aptStep === 1 ? 'text-purple-400 font-extrabold' : 'text-neutral-500'}>COMMS</span>
                          </div>
                          <div className="h-[1px] flex-grow bg-neutral-900 mx-3" />
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                              aptStep >= 2 ? 'bg-purple-600 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                            }`}>2</span>
                            <span className={aptStep === 2 ? 'text-purple-400 font-extrabold' : 'text-neutral-500'}>HARDWARE SPECS</span>
                          </div>
                          <div className="h-[1px] flex-grow bg-neutral-900 mx-3" />
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                              aptStep >= 3 ? 'bg-purple-600 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                            }`}>3</span>
                            <span className={aptStep === 3 ? 'text-purple-400 font-extrabold' : 'text-neutral-500'}>DIAGNOSTIC REPORT</span>
                          </div>
                        </div>

                        {/* STEP 1: COMMS INFO */}
                        {aptStep === 1 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                            <div className="space-y-4 bg-neutral-950/40 p-5 border border-neutral-900/60 rounded-2xl">
                              <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block mb-1">
                                // SECTION 01: OPERATOR DIGITAL IDENTITY
                              </span>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    Your Name / Alias
                                  </label>
                                  <input
                                    type="text"
                                    value={aptName}
                                    onChange={(e) => {
                                      setAptName(e.target.value);
                                      if (appointmentValidationError) setAppointmentValidationError(null);
                                    }}
                                    placeholder="e.g. Sherry Barnett"
                                    required
                                    className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder:text-neutral-700 placeholder:text-[9.5px]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    Contact Information
                                  </label>
                                  <input
                                    type="text"
                                    value={aptContact}
                                    onChange={(e) => {
                                      setAptContact(e.target.value);
                                      if (appointmentValidationError) setAppointmentValidationError(null);
                                    }}
                                    placeholder="e.g. email, discord, or phone"
                                    required
                                    className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/10 text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder:text-neutral-700 placeholder:text-[9.5px]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Verification state warnings */}
                            {appointmentValidationError && (
                              <motion.div 
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2.5 bg-red-955/35 border border-red-500/35 text-red-200 text-[9.5px] font-sans rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                              >
                                <span className="text-xs">⚠️</span>
                                <span>{appointmentValidationError}</span>
                              </motion.div>
                            )}

                            {/* Lower navigations */}
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-900 mt-2">
                              <span className="text-[7.5px] font-mono text-neutral-500 tracking-wider">SECURE DIAGNOSTICS SYSTEM // PHASE 1 OF 3</span>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  if (!aptName.trim()) {
                                    setAppointmentValidationError('VALIDATION ERROR: Your Name / Alias is required to proceed.');
                                    return;
                                  }
                                  if (!aptContact.trim()) {
                                    setAppointmentValidationError('VALIDATION ERROR: Contact information is required to proceed.');
                                    return;
                                  }
                                  setAppointmentValidationError(null);
                                  setAptStep(2);
                                }}
                                className="px-5 py-2.5 bg-neutral-900 border border-purple-500/60 text-purple-300 hover:text-purple-200 hover:bg-neutral-850 font-mono text-[9px] uppercase font-bold tracking-[0.15em] transition-all rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                              >
                                <span>Proceed to Specs</span>
                                <ChevronRight size={12} className="text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 2: HARDWARE SPECIFICATION PICKER */}
                        {aptStep === 2 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                            <div className="bg-neutral-950/40 p-4 border border-neutral-900 rounded-2xl space-y-4">
                              <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block mb-1">
                                // SECTION 02: HARDWARE SPECIFICATION TELEMETRY
                              </span>

                              {/* Matrix configuration choices */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* CPU Model Text Override */}
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    Processor Model (CPU Specs)
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={aptCpu}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setAptCpu(val);
                                        if (val.toLowerCase().includes('amd') || val.toLowerCase().includes('ryzen')) {
                                          setAptCpuBrand('AMD');
                                        } else if (val.toLowerCase().includes('intel') || val.toLowerCase().includes('core') || val.toLowerCase().includes('i7') || val.toLowerCase().includes('i9')) {
                                          setAptCpuBrand('Intel');
                                        }
                                      }}
                                      placeholder="e.g. AMD Ryzen 7 7800X3D"
                                      className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder:text-neutral-700 font-semibold"
                                      required
                                    />
                                    <div className="absolute right-3.5 top-2.5 flex items-center select-none pointer-events-none">
                                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase border font-mono transition-colors ${
                                        aptCpu.toLowerCase().includes('amd') || aptCpu.toLowerCase().includes('ryzen')
                                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                                          : 'bg-blue-950/40 border-blue-500/50 text-blue-400'
                                      }`}>
                                        {aptCpu.toLowerCase().includes('amd') || aptCpu.toLowerCase().includes('ryzen') ? 'AMD EXPO' : 'INTEL XMP'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Motherboard selects */}
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    Motherboard Platform Option
                                  </label>
                                  <select
                                    value={aptMobo}
                                    onChange={(e) => setAptMobo(e.target.value)}
                                    className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                                  >
                                    <option value="ASUS ROG Strix / Maximus">ASUS ROG Strix / Maximus Series [PREMIUM]</option>
                                    <option value="MSI MAG / MPG / PRO">MSI MAG / MPG Series [MILITARY STABILITY]</option>
                                    <option value="Gigabyte AORUS Elite">Gigabyte AORUS Elite Series [STURDY THERMALS]</option>
                                    <option value="ASRock Steel Legend">ASRock Steel Legend [OUTSTANDING VALVE]</option>
                                    <option value="NZXT N7 Series">NZXT N7 Minimalist Series [MATTE DESIGN]</option>
                                    <option value="Custom OEM Motherboard">Custom OEM / Retro board</option>
                                  </select>
                                </div>

                                {/* GPU selects */}
                                <div>
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    Graphics Processing Unit (GPU Option)
                                  </label>
                                  <select
                                    value={aptGpu}
                                    onChange={(e) => setAptGpu(e.target.value)}
                                    className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                                  >
                                    <option value="NVIDIA GeForce RTX 4090">NVIDIA GeForce RTX 4090 (24GB Ultimate Rig)</option>
                                    <option value="NVIDIA GeForce RTX 4080 / 4070 Ti">NVIDIA GeForce RTX 4080 / 4070 Ti (16GB/12GB AD104)</option>
                                    <option value="NVIDIA GeForce RTX 4060 / 30 Series">NVIDIA GeForce RTX 4060 / 30 Series (Popular standard)</option>
                                    <option value="AMD Radeon RX 7900 XTX">AMD Radeon RX 7900 XTX (24GB extreme raw power)</option>
                                    <option value="AMD Radeon RX 7800 XT / 6700">AMD Radeon RX 7800 XT / 6700 XT (Valued gaming setup)</option>
                                    <option value="Intel Arc A770 / A750">Intel Arc A770 / A750 Series (Modern AV1 codec)</option>
                                    <option value="Integrated core graphics">Integrated Core Graphics (No dedicated GPU Acceleration)</option>
                                  </select>
                                </div>

                                {/* RAM Select */}
                                <div className="md:col-span-2">
                                  <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                    System RAM Specification
                                  </label>
                                  <select
                                    value={aptRam}
                                    onChange={(e) => setAptRam(e.target.value)}
                                    className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                                  >
                                    <option value="16GB DDR5 High-Speed">16GB DDR5 High-Speed (2x8GB Dual Sync)</option>
                                    <option value="32GB DDR5 Dual Channel">32GB DDR5 Large Capacity (2x16GB Gamer choice)</option>
                                    <option value="64GB DDR5 Workstation">64GB DDR5 Professional Workstation (2x32GB Sync)</option>
                                    <option value="128GB DDR5 Quad Sync">128GB DDR5 Rendering Machine (4x32GB Quad Drive)</option>
                                    <option value="16GB DDR4 Legacy Sync">16GB DDR4 Legacy Standard (2x8GB Reliable)</option>
                                    <option value="32GB DDR4 Large Buffer">32GB DDR4 High Buffer Capacity (2x16GB Legacy Power)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Preview Banner of compiled spec */}
                              <div className="p-3 bg-neutral-900/65 border border-neutral-850 rounded-xl space-y-1">
                                <span className="text-[7.5px] font-mono tracking-widest text-neutral-500 uppercase block font-black">
                                  ⚡ Telemetry Pipeline Generated Specifications
                                </span>
                                <div className="text-[10px] font-mono text-purple-300 font-extrabold flex flex-wrap items-center gap-1.5 leading-snug">
                                  <span>{aptCpu}</span>
                                  <span className="text-neutral-700">//</span>
                                  <span>{aptMobo}</span>
                                  <span className="text-neutral-700">//</span>
                                  <span>{aptGpu}</span>
                                  <span className="text-neutral-700">//</span>
                                  <span>{aptRam}</span>
                                </div>
                              </div>
                            </div>

                            {appointmentValidationError && (
                              <motion.div 
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2.5 bg-red-955/35 border border-red-500/35 text-red-200 text-[9.5px] font-sans rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                              >
                                <span className="text-xs">⚠️</span>
                                <span>{appointmentValidationError}</span>
                              </motion.div>
                            )}

                            {/* Nav controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-900 mt-2">
                              <button
                                type="button"
                                onClick={() => setAptStep(1)}
                                className="px-4 py-2 bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-neutral-200 font-mono text-[9px] uppercase font-bold tracking-widest transition-all rounded-xl cursor-pointer"
                              >
                                &lt; Back to Comms
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  // Compile specs automatically
                                  const compiledSpecsString = `CPU: ${aptCpu} | GPU: ${aptGpu} | MOBO: ${aptMobo} | RAM: ${aptRam}`;
                                  setAptSpecs(compiledSpecsString);
                                  setAppointmentValidationError(null);
                                  setAptStep(3);
                                }}
                                className="px-5 py-2.5 bg-neutral-900 border border-purple-500/60 text-purple-300 hover:text-purple-200 hover:bg-neutral-855 font-mono text-[9px] uppercase font-bold tracking-[0.15em] transition-all rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                              >
                                <span>Proceed to Issue</span>
                                <ChevronRight size={12} className="text-purple-400" />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 3: PROBLEM CATEGORY & CHAT EXPLAIN BOX */}
                        {aptStep === 3 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                            <div className="bg-neutral-950/40 p-4 border border-neutral-900 rounded-2xl space-y-4">
                              <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block mb-1">
                                // SECTION 03: TELEMETRY CONTEXT & DIAGNOSIS LOGS
                              </span>

                              <div>
                                <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                  PC Problem Category
                                </label>
                                <select
                                  value={aptProblem}
                                  onChange={(e) => setAptProblem(e.target.value)}
                                  className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all cursor-pointer"
                                >
                                  <option value="Slow Performance & Freezing">Slow Performance & Freezing // DRIVER LAG</option>
                                  <option value="Windows / OS Boot Failure">Windows / OS Boot Failure // BIOS BRICK</option>
                                  <option value="Overheating & Loud Noises">Overheating & Loud Noises // THERMAL THROTTLE</option>
                                  <option value="Virus / Malware Discovered">Virus / Malware Discovered // SEGMENT CORRUPTION</option>
                                  <option value="WiFi / Ethernet Connection Dropping">WiFi / Ethernet Connection Dropping // PACKET DROP</option>
                                  <option value="Blue Screen of Death (BSOD)">Blue Screen of Death (BSOD) // KERNEL PANIC</option>
                                  <option value="Other / Unidentified Critical Issue">Other / Unidentified Critical Issue // GENERAL ERROR</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-black mb-1.5">
                                  Explain further (Diagnostics Chat Box)
                                </label>
                                <textarea
                                  value={aptExplain}
                                  onChange={(e) => {
                                    setAptExplain(e.target.value);
                                    if (appointmentValidationError) setAppointmentValidationError(null);
                                  }}
                                  placeholder="Describe what happened, any error messages, or steps that led to this error in detail..."
                                  rows={4}
                                  required
                                  className="w-full text-xs font-mono bg-neutral-900/60 border border-neutral-850 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder:text-neutral-700 placeholder:text-[9.5px] resize-none"
                                />
                              </div>
                            </div>

                            {appointmentValidationError && (
                              <motion.div 
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-2.5 bg-red-955/35 border border-red-500/35 text-red-200 text-[9.5px] font-sans rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                              >
                                <span className="text-xs">⚠️</span>
                                <span>{appointmentValidationError}</span>
                              </motion.div>
                            )}

                            {/* Nav controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-900 mt-2">
                              <button
                                type="button"
                                onClick={() => setAptStep(2)}
                                className="px-4 py-2 bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-neutral-200 font-mono text-[9px] uppercase font-bold tracking-widest transition-all rounded-xl cursor-pointer"
                              >
                                &lt; Back to Specs
                              </button>
                              
                              <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-mono text-[9px] uppercase font-bold tracking-[0.15em] transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                              >
                                <Send size={11} className="animate-pulse" />
                                <span>Submit Report // Dispatch</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </form>
                    )}
                  </div>
                ) : (
                  /* List of scheduled appointments */
                  <div className="w-full flex-1 flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-neutral-300 font-extrabold mb-1">
                        Active Diagnostic Tickets
                      </h4>
                      <p className="text-[8px] uppercase tracking-wider text-neutral-500 leading-normal">
                        Verify active problems mapped in direct support logs. All records here are strictly stored locally.
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[45vh] scrollbar-thin scrollbar-thumb-purple-500/20 hover:scrollbar-thumb-purple-500/40">
                      {appointments.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/40">
                          <span className="text-xl mb-1 text-neutral-600 animate-pulse">🕰️</span>
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                            NO SECURE ACTIVE RESOURCING TICKENS LOADED
                          </span>
                        </div>
                      ) : (
                        appointments.map((apt) => (
                          <div 
                            key={apt.id}
                            className="bg-neutral-950/90 border border-neutral-900 rounded-2xl p-4 relative overflow-hidden text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                          >
                            <div className="space-y-2">
                              {/* Headers and secure token badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-white">{apt.name}</span>
                                <span className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[7px] font-bold tracking-widest uppercase rounded">
                                  ID: {apt.id.substring(0, 12).toUpperCase()}
                                </span>
                                <span className="px-1.5 py-0.5 bg-yellow-950/40 border border-yellow-500/35 text-amber-400 text-[7px] font-bold tracking-widest uppercase rounded leading-none">
                                  ● {apt.status}
                                </span>
                              </div>

                              <div className="text-[10px] text-neutral-400 space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-neutral-500 text-[8px]">CONTACT INFO:</span>
                                  <span className="text-neutral-300 font-sans">{apt.contact || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-neutral-500 text-[8px]">COMPUTER SPECIFICATION:</span>
                                  <span className="text-neutral-300 font-sans">{apt.specs}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-neutral-500 text-[8px]">TEMPORAL:</span>
                                  <span className="text-neutral-300">{apt.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-neutral-500 text-[8px]">PROBLEM:</span>
                                  <span className="text-purple-400 tracking-wide font-black uppercase text-[8.5px]">{apt.problem}</span>
                                </div>
                                <div className="mt-1.5 p-2 bg-neutral-900/60 border border-neutral-850 rounded-lg text-[9px] text-neutral-300 font-sans whitespace-pre-wrap">
                                  {apt.description}
                                </div>
                              </div>
                            </div>

                            {/* Actions / cancel button */}
                            <button
                              onClick={() => {
                                const filtered = appointments.filter(item => item.id !== apt.id);
                                setAppointments(filtered);
                                localStorage.setItem('shadow_appointments', JSON.stringify(filtered));
                              }}
                              className="px-3 py-1.5 md:self-center font-mono text-[8.5px] bg-red-955/25 border border-red-500/35 hover:border-red-500 text-red-400 hover:bg-neutral-900 transition-all uppercase tracking-widest font-extrabold cursor-pointer rounded-lg shrink-0 self-start"
                            >
                              Revoke Ticket
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer cancel controls */}
              <div className="flex items-center justify-center pt-4 border-t border-neutral-900 mt-4 shrink-0">
                <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-500 text-center">
                  PC DIAGNOSTIC PORTAL GATEWAY // PE PLATFORM
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Suggestion View Modal */}
      <AnimatePresence>
        {isAdminSuggestionsOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto w-full" id="admin-suggestions-view-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-neutral-950 border-2 border-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl relative z-50 overflow-hidden p-6 md:p-8 text-white font-mono flex flex-col max-h-[85vh]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-900 relative z-10 font-mono">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-purple-950/40 border border-purple-500/30">
                    <Sparkles size={13} className="text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-extrabold block">ADMIN CONSOLE</span>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 block">SYSTEM USER SUGGESTIONS REGISTRY</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminSuggestionsOpen(false)}
                  className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-neutral-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Suggestions List Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 font-mono mb-5 relative z-10 max-h-[50vh]">
                {suggestions.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 bg-neutral-900/20 rounded-2xl font-mono">
                    <Sparkles className="text-neutral-500 w-9 h-9 mb-2 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 font-mono">NO SUGGESTIONS IN MEMORY</span>
                    <p className="text-[8px] uppercase tracking-wider text-neutral-400 mt-1 max-w-xs font-mono">
                      System optimization recommendations logged by network operators will materialize here.
                    </p>
                  </div>
                ) : (
                  suggestions.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-900 hover:border-purple-500/25 flex flex-col gap-2.5 transition-all relative group text-left"
                    >
                      <div className="flex items-start justify-between gap-3 w-full">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2 font-mono">
                            <span className="px-1.5 py-0.5 bg-purple-950/40 border border-purple-500/20 text-purple-400 font-mono text-[7.5px] uppercase tracking-widest rounded-md font-bold">
                              {item.category}
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                const statuses = ['NEW', 'PENDING', 'RESOLVED'];
                                const nextIdx = (statuses.indexOf(item.status) + 1) % statuses.length;
                                const nextStatus = statuses[nextIdx];
                                const updated = suggestions.map(s => s.id === item.id ? { ...s, status: nextStatus } : s);
                                setSuggestions(updated);
                                localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
                              }}
                              className={`px-2 py-0.5 font-mono text-[7.5px] uppercase tracking-widest rounded border cursor-pointer select-none font-extrabold transition-all hover:brightness-110 active:scale-95 ${
                                item.status === 'NEW' 
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse'
                                  : item.status === 'PENDING'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}
                              title="Click to advance status"
                            >
                              STATUS: {item.status}
                            </button>
                            <span className="text-[8px] text-neutral-500 font-bold ml-auto">{item.date}</span>
                          </div>
                          <p className="text-xs text-[#ececec] leading-relaxed font-sans pl-2 border-l-2 border-purple-500/30 bg-neutral-950/20 py-1">
                            {item.text}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = suggestions.filter(s => s.id !== item.id);
                            setSuggestions(updated);
                            localStorage.setItem('shadow_suggestions', JSON.stringify(updated));
                          }}
                          className="p-1.5 hover:bg-red-955/40 hover:text-red-400 text-neutral-500 border border-transparent hover:border-red-900/35 rounded-lg transition-all cursor-pointer self-start shrink-0"
                          title="Purge suggestion record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer cancel controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-neutral-900 shrink-0 gap-3 font-mono">
                <span className="text-[8px] uppercase tracking-[0.12em] text-neutral-500">
                  SECURE CONTROL PANEL // PERSISTENT STORE SYSTEM
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Operative Name Prompt Modal */}
      <AnimatePresence>
        {isNamePromptOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 w-full" id="shout-box-name-prompt-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#0b061a] border-2 border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(168,85,247,0.25)] text-white relative flex flex-col gap-4 overflow-hidden"
            >
              {/* Corner tech accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500/55 pointer-events-none rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500/55 pointer-events-none rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500/55 pointer-events-none rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500/55 pointer-events-none rounded-br" />
              
              {/* Background scanlines grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-purple-400 animate-pulse" />
                  <span className="font-extrabold font-mono text-sm tracking-[0.2em] uppercase text-purple-400">CREATE AN ALIAS / NICKNAME</span>
                </div>
                <button
                  onClick={() => setIsNamePromptOpen(false)}
                  className="p-1 hover:bg-neutral-900 text-neutral-500 hover:text-white transition-all rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body message */}
              <div className="text-left relative z-10 flex flex-col gap-2">
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Please designate an active name or custom code name. This tag will serve as your ID within our encrypted peer shoutbox block.
                </p>

                {/* Input block */}
                <div className="mt-2 text-left">
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-500 block mb-1">
                    OPERATIVE ALIAS / ID TAG
                  </span>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                      setTempName(e.target.value.substring(0, 30));
                      if (nameValidationError) setNameValidationError(null);
                    }}
                    placeholder="e.g. Operative No. 104"
                    className="w-full text-left text-[13px] placeholder:text-neutral-700 text-neutral-100 bg-neutral-950 border border-neutral-900 focus:border-purple-500/40 p-3 rounded-none outline-none transition-all font-sans leading-relaxed tracking-wide"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const finalName = tempName.trim() || 'Anonymous Operative';
                        if (checkRestrictionsText(finalName)) {
                          const nextOffense = offenseCount + 1;
                          setOffenseCount(nextOffense);
                          localStorage.setItem('shout_offense_count', nextOffense.toString());

                          if (nextOffense === 1) {
                            setWarningPopup({
                              title: "Comment not posted.",
                              message: "Your message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.",
                              violationNumber: 1
                            });
                            setNameValidationError(
                              `Comment not posted.\n\nYour message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.`
                            );
                          } else if (nextOffense === 2) {
                            setWarningPopup({
                              title: "Action Required:",
                              message: "Final Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.",
                              violationNumber: 2
                            });
                            setNameValidationError(
                              `Action Required:\n\nFinal Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.`
                            );
                          } else {
                            const banPeriod = 24 * 60 * 60 * 1000;
                            const activeBanUntil = Date.now() + banPeriod;
                            setBanUntil(activeBanUntil);
                            localStorage.setItem('shout_ban_until', activeBanUntil.toString());
                            setIsCommentingBanned(true);
                            localStorage.setItem('shout_commenting_banned', 'true');
                            setWarningPopup({
                              title: "Commenting privileges suspended.",
                              message: "Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.",
                              violationNumber: 3
                            });
                            setNameValidationError(
                              `Commenting privileges suspended.\n\nDue to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.`
                            );
                            setTimeout(() => {
                              setIsNamePromptOpen(false);
                            }, 5000);
                          }
                          return;
                        }

                        setNameValidationError(null);
                        setShoutName(finalName);
                        setIsNamePromptOpen(false);
                        setIsShoutBoxOpen(true);
                      }
                    }}
                  />
                  <div className="mt-1 flex justify-between text-[8px] font-mono text-neutral-600 tracking-wider mb-2">
                    <span>MAX 30 CHARS</span>
                    <span>{tempName.length}/30</span>
                  </div>

                  {/* Name Restriction Warning Error display */}
                  {nameValidationError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-red-950/35 border border-red-500/35 text-red-105 text-[11px] font-sans rounded-xl flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    >
                      <span className="text-sm shrink-0">⚠️</span>
                      <span className="leading-relaxed font-semibold whitespace-pre-line">{nameValidationError}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex gap-2 relative z-10 mt-2">
                <button
                  type="button"
                  onClick={() => setIsNamePromptOpen(false)}
                  className="flex-1 py-2 px-3 bg-neutral-950 border border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer rounded-none"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalName = tempName.trim() || 'Anonymous Operative';
                    if (checkRestrictionsText(finalName)) {
                      const nextOffense = offenseCount + 1;
                      setOffenseCount(nextOffense);
                      localStorage.setItem('shout_offense_count', nextOffense.toString());

                      if (nextOffense === 1) {
                        setWarningPopup({
                          title: "Comment not posted.",
                          message: "Your message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.",
                          violationNumber: 1
                        });
                        setNameValidationError(
                          `Comment not posted.\n\nYour message includes language that violates our community guidelines. Please ensure your future comments are respectful and free of profanity. This is your first warning; please note that we track repeated violations.`
                        );
                      } else if (nextOffense === 2) {
                        setWarningPopup({
                          title: "Action Required:",
                          message: "Final Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.",
                          violationNumber: 2
                        });
                        setNameValidationError(
                          `Action Required:\n\nFinal Warning.\nYour recent comment was flagged for inappropriate language. This is your second violation. Please be advised that one more instance of profanity or disparaging remarks will result in the immediate suspension of your commenting privileges.`
                        );
                      } else {
                        const banPeriod = 24 * 60 * 60 * 1000;
                        const activeBanUntil = Date.now() + banPeriod;
                        setBanUntil(activeBanUntil);
                        localStorage.setItem('shout_ban_until', activeBanUntil.toString());
                        setIsCommentingBanned(true);
                        localStorage.setItem('shout_commenting_banned', 'true');
                        setWarningPopup({
                          title: "Commenting privileges suspended.",
                          message: "Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.",
                          violationNumber: 3
                        });
                        setNameValidationError(
                          `Commenting privileges suspended.\n\nDue to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.`
                        );
                        setTimeout(() => {
                          setIsNamePromptOpen(false);
                        }, 5000);
                      }
                      return;
                    }

                    setNameValidationError(null);
                    setShoutName(finalName);
                    setIsNamePromptOpen(false);
                    setIsShoutBoxOpen(true);
                  }}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-mono text-[10px] uppercase font-bold tracking-wider shadow-md transition-all cursor-pointer rounded-none"
                >
                  INITIALIZE UPLINK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shout Out Box Modal */}
      <AnimatePresence>
        {isShoutBoxOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto w-full" id="shout-box-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#0b061a] border-2 border-purple-500/25 w-full max-w-4xl rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] relative z-50 overflow-hidden p-5 md:p-8 text-white font-sans flex flex-col max-h-[92vh]"
            >
              {/* Neon background glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-25" />

              {/* Close Button at top right of modal */}
              <button
                onClick={() => setIsShoutBoxOpen(false)}
                className="absolute top-4 right-4 p-1.5 border border-purple-950 bg-neutral-950 hover:border-purple-500/30 hover:bg-purple-950/20 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer z-20"
              >
                <X size={16} />
              </button>

              {/* Header Title & Subtitle */}
              <div className="text-center mb-5 relative z-10 shrink-0">
                <div className="flex items-center justify-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xl filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🔮</span>
                  <span className="text-sm text-amber-500 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">⭐</span>
                  <h3 className="text-xl md:text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-sans uppercase">
                    SHOUT OUT BOX
                  </h3>
                  <span className="text-xl filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🖤</span>
                  <span className="text-xl filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">🍷</span>
                </div>
                <p className="text-xs md:text-sm text-neutral-400 font-sans tracking-wide">
                  Whisper secret messages into the abyss. We operate in the dark! 💜
                </p>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10 overflow-y-auto no-scrollbar pb-3 flex-1 min-h-[300px]">
                
                {/* Left Panel: DECRYPTED ARCHIVES */}
                <div className="md:col-span-7 flex flex-col h-full md:border-r md:border-neutral-900/80 md:pr-4">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-neutral-900 shrink-0">
                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-300 uppercase select-none">
                      DECRYPTED ARCHIVES
                    </span>
                    <span className="px-1.5 py-0.5 bg-purple-600/25 border border-purple-500/30 text-purple-400 text-[9px] font-bold font-mono rounded-none leading-none shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                      {shouts.length} SECURE LOGS
                    </span>
                  </div>

                  {/* Scrollable list of archives with a fixed height viewport so scrolling is explicitly guaranteed */}
                  <div className="h-[290px] md:h-[430px] overflow-y-auto pr-1.5 space-y-2 scrollbar-thin scrollbar-thumb-purple-500/30 hover:scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                    {shouts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-900 rounded-none bg-neutral-950/40">
                        <span className="text-2xl mb-2 animate-pulse">🌌</span>
                        <p className="text-xs uppercase font-mono text-neutral-600 tracking-wider">No active transmissions.</p>
                      </div>
                    ) : (
                      shouts.map((shout) => (
                        <div 
                          key={shout.id}
                          className="p-2 px-3 rounded-xl bg-neutral-900/25 hover:bg-neutral-900/40 border border-neutral-950 hover:border-purple-500/10 transition-all duration-300 flex items-start gap-3 group relative"
                        >
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base shadow-inner border ${shout.avatarBg}`}>
                            {shout.avatar}
                          </div>
 
                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-24 text-left">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="font-sans font-extrabold text-[13px] text-purple-300 tracking-wide">
                                {shout.name}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                                {shout.time === 'now' ? shout.time : getRelativeTime(shout.timestamp)}
                              </span>
                            </div>
                            <p className="text-[12.5px] leading-relaxed text-neutral-300 whitespace-pre-wrap font-sans">
                              {shout.message}
                            </p>
                          </div>
 
                          {/* Delete action */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteShoutId(shout.id);
                              setShowDeleteShoutPasswordModal(true);
                            }}
                            className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-lg border border-red-500/25 hover:border-red-500/60 hover:bg-red-950/20 bg-neutral-950 text-red-400 hover:text-red-300 transition-all duration-300 cursor-pointer"
                            title="Delete transmission"
                          >
                            <Trash2 size={11} className="transition-transform duration-300 hover:scale-110" />
                          </button>

                          {/* Like action */}
                          <button 
                            onClick={() => handleLikeShout(shout.id)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-none border text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer ${
                              shout.likedByUser 
                                ? 'bg-purple-950/95 border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)] scale-105' 
                                : 'bg-neutral-950 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-355'
                            }`}
                          >
                            <span className={`text-[10px] transition-transform duration-300 ${shout.likedByUser ? 'scale-110 filter drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'}`}>🖤</span>
                            <span>{shout.likes}</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Panel: Form with ban capability and validation error warnings */}
                <div className="md:col-span-5 flex flex-col justify-between h-full min-h-[380px]">
                  {shoutSuccessCountdown !== null ? (
                    <motion.div 
                      key="shout-success-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center p-6 border-2 border-purple-500/20 bg-purple-950/10 text-center rounded-2xl space-y-5 my-auto"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="w-16 h-16 bg-purple-900/40 rounded-full border border-purple-500/30 flex items-center justify-center relative z-10 animate-bounce">
                          <CheckCircle className="text-purple-400 w-9 h-9" />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-purple-400 font-mono font-black text-xs tracking-[0.2em] uppercase mb-2">
                          DISPATCH CONFIRMED
                        </h4>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed px-1">
                          Your secret message has successfully bypassed security intercepts and been logged to the shadow database.
                        </p>
                      </div>

                      <div className="w-full bg-neutral-950 border border-neutral-900 p-3 rounded-xl flex flex-col items-center justify-center font-mono text-[10px] space-y-1.5">
                        <span className="text-purple-500 font-extrabold uppercase tracking-widest animate-pulse">
                          Auto-Closing Interface
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <span>Returning to system hub in</span>
                          <span className="text-purple-400 font-black text-xs px-1.5 py-0.5 bg-purple-950/50 border border-purple-500/10 rounded leading-none">
                            {shoutSuccessCountdown}s
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsShoutBoxOpen(false)}
                        className="px-5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer text-center font-mono active:scale-95"
                      >
                        CLOSE NOW
                      </button>
                    </motion.div>
                  ) : isCommentingBanned ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-500/35 bg-red-950/20 text-center rounded-2xl space-y-4 my-auto">
                      <div className="w-14 h-14 bg-red-950/40 rounded-full border border-red-500/30 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
                        <span className="text-2xl">☠️</span>
                      </div>
                      <h4 className="text-red-400 font-mono font-black text-xs tracking-[0.15em] uppercase">Commenting privileges suspended.</h4>
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed px-2 whitespace-pre-line">
                        Due to repeated violations of our community guidelines regarding profanity and harassment, your ability to post comments has been removed. If you believe this is an error, please contact support.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePostShout} className="flex flex-col text-left justify-between h-full">
                      <div>
                        <div className="mb-2 pb-1 border-b border-neutral-900 flex justify-between items-center shrink-0">
                          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-neutral-300 uppercase">
                            INITIALIZE CIPHER
                          </span>
                          <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                            LIMIT: MAX 3 SENTENCES
                          </span>
                        </div>
 
                        {/* Textarea */}
                        <div className="relative mb-3">
                          <textarea
                            value={shoutMessage}
                            onChange={(e) => {
                              setShoutMessage(e.target.value.substring(0, 300));
                              if (shoutValidationError) setShoutValidationError(null);
                            }}
                            placeholder="Whisper your coded transmission here... (Maximum 3 sentences only, negative comments & profanity are restricted)"
                            maxLength={300}
                            className="w-full h-40 text-left text-[14px] placeholder:text-neutral-600 text-neutral-100 bg-neutral-950 border border-neutral-900 focus:border-purple-500/35 p-3 pr-8 rounded-none outline-none transition-all no-scrollbar resize-none font-sans leading-relaxed"
                          />
                          
                          {/* Character Counter */}
                          <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-neutral-600 tracking-wider">
                            {shoutMessage.length}/300
                          </div>
 
                          {/* Left smiley icon decoration */}
                          <div className="absolute bottom-2.5 left-3 text-neutral-600">
                            <Smile size={13} className="opacity-50" />
                          </div>
                        </div>

                        {/* Restriction Error Message display */}
                        {shoutValidationError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3 p-3 bg-red-950/30 border border-red-500/35 text-red-200 text-xs font-sans rounded-xl flex items-start gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                          >
                            <span className="text-sm shrink-0">⚠️</span>
                            <span className="leading-relaxed font-semibold whitespace-pre-line">{shoutValidationError}</span>
                          </motion.div>
                        )}

                        {/* Submit Button & Footer message (Now below the textarea/chatbox) */}
                        <div className="mb-4 flex flex-col items-center w-full">
                          {isPostingShout ? (
                            <div className="flex items-center gap-3 py-1 font-mono">
                              {/* Circular Progress Loader */}
                              <div className="relative flex items-center justify-center w-10 h-10">
                                {/* Outer rotating ring */}
                                <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                                
                                {/* Inner SVG Circular Progress */}
                                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 80 80">
                                  {/* Background Track */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="34"
                                    className="stroke-neutral-900"
                                    strokeWidth="5"
                                    fill="transparent"
                                  />
                                  {/* Foreground Progress */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="34"
                                    className="stroke-purple-500 transition-all duration-100 ease-out"
                                    strokeWidth="5"
                                    fill="transparent"
                                    strokeDasharray="213.6"
                                    strokeDashoffset={213.6 * (1 - postingShoutProgress / 100)}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                
                                {/* Center text showing percentage */}
                                <div className="absolute flex flex-col items-center justify-center font-mono">
                                  <span className="text-[7.5px] font-black text-purple-400 leading-none">
                                    {postingShoutProgress}%
                                  </span>
                                </div>
                              </div>
                              <span className="text-[8px] uppercase tracking-[0.15em] text-purple-400 font-bold animate-pulse">DISPATCHING TRANSMISSION...</span>
                            </div>
                          ) : (
                            <button
                              type="submit"
                              disabled={!shoutMessage.trim()}
                              className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:brightness-110 active:scale-[0.98] shadow-[0_0_10px_rgba(168,85,247,0.35)] text-white font-mono text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
                            >
                              <span>🔮</span>
                              <span>Send to shadows</span>
                            </button>
                          )}
 
                          <div className="mt-1.5 text-[9px] text-neutral-500 uppercase tracking-widest text-center font-mono">
                            Stay disguised in the deep shadows. 💜
                          </div>
                        </div>

                        {/* Runes selection row/wrap (Moved down) */}
                        <div className="mb-1">
                          <div className="text-[9px] font-mono tracking-[0.2em] uppercase text-neutral-500 mb-1.5 text-left">
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
                              { char: '💯', label: 'max magical force' },
                              { char: '😈', label: 'mischievous devil' },
                              { char: '😎', label: 'cool operative' },
                              { char: '😏', label: 'smug mastermind' },
                              { char: '🤫', label: 'silent whisperer' },
                              { char: '🧐', label: 'critical intellect' },
                              { char: '💀', label: 'dead cold' },
                              { char: '👽', label: 'mysterious presence' },
                              { char: '👾', label: 'cyber code' },
                              { char: '🤖', label: 'autonomous bot' },
                              { char: '😜', label: 'wild play' }
                            ].map((emoji) => (
                              <button
                                key={emoji.char}
                                type="button"
                                onClick={() => {
                                  if (shoutMessage.length + emoji.char.length <= 300) {
                                    setShoutMessage(prev => prev + emoji.char);
                                    if (shoutValidationError) setShoutValidationError(null);
                                  }
                                }}
                                className="w-7 h-7 rounded-none bg-neutral-900 hover:bg-neutral-800 border border-neutral-900/60 hover:border-purple-500/25 flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title={emoji.label}
                              >
                                {emoji.char}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Bottom bar inside modal card */}
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2 border border-purple-500/20 bg-purple-950/10 shrink-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-300 text-center sm:text-left leading-relaxed">
                  All technician files and curated tools are organized cleanly within the main database.
                </p>
                <button 
                  onClick={() => {
                    setIsShoutBoxOpen(false);
                    onEnter();
                  }}
                  className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-mono text-[11px] uppercase font-bold tracking-widest shadow-md transition-all cursor-pointer whitespace-nowrap rounded-none"
                >
                  Access Portal Now
                </button>
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
                <span className="text-purple-500">Tech.</span>
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
                By: Cid Kagenou // V.1.0
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
                  {"To survive in the tech world, one must operate from the shadows—lurking in the background while ensuring systems run at their absolute best. When a computer crashes or performance drops, diagnostics are already in motion. The technical toolkits are prepared to troubleshoot any issue.".split(" ").map((word, i) => (
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

              <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                {/* Enter Archive Action Container */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <motion.button 
                    initial={skip ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={skip ? { duration: 0 } : { 
                      duration: 5.0, 
                      ease: "easeInOut", 
                      delay: 3.0 
                    }}
                    whileHover={{ scale: (isEnteringArchive || isAccessingTutorials) ? 1 : 1.02 }}
                    whileTap={{ scale: (isEnteringArchive || isAccessingTutorials) ? 1 : 0.98 }}
                    onClick={() => {
                      setIsEnteringArchive(true);
                      setEnteringArchiveProgress(1);
                    }}
                    disabled={isEnteringArchive || isAccessingTutorials}
                    className={`group flex items-center justify-center gap-4 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs transition-all duration-200 cursor-pointer w-full sm:w-auto ${
                      (isEnteringArchive || isAccessingTutorials) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-200'
                    }`}
                  >
                    Enter Archive
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
                  </motion.button>

                  {isEnteringArchive && (
                    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                      {/* Outer rotating dashed purple ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-spin [animation-duration:12s]" />
                      
                      {/* Inner SVG Circular Progress */}
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-neutral-950/85"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        {/* Foreground Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-purple-500 transition-all duration-100 ease-out"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 * (1 - enteringArchiveProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center text showing percentage and TX label */}
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className="text-[10px] font-black text-purple-400 leading-none">
                          {enteringArchiveProgress}%
                        </span>
                        <span className="text-[5px] font-black text-purple-500/60 tracking-wider uppercase leading-none mt-0.5">TX</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Access Tutorials Action Container */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <motion.button 
                    initial={skip ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={skip ? { duration: 0 } : { 
                      duration: 5.0, 
                      ease: "easeInOut", 
                      delay: 3.2 
                    }}
                    whileHover={{ scale: (isEnteringArchive || isAccessingTutorials) ? 1 : 1.02 }}
                    whileTap={{ scale: (isEnteringArchive || isAccessingTutorials) ? 1 : 0.98 }}
                    onClick={() => {
                      setIsAccessingTutorials(true);
                      setAccessingTutorialsProgress(1);
                    }}
                    disabled={isEnteringArchive || isAccessingTutorials}
                    className={`group flex items-center justify-center gap-4 px-8 py-3 bg-purple-950/40 border border-purple-500/40 text-purple-300 font-black uppercase tracking-widest text-xs transition-all duration-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer w-full sm:w-auto ${
                      (isEnteringArchive || isAccessingTutorials) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-purple-900/60 hover:border-purple-400'
                    }`}
                  >
                    Access Shadow Master Tutorials
                    <Sparkles size={16} className="text-purple-400 group-hover:rotate-12 transition-transform duration-300 animate-pulse" />
                  </motion.button>

                  {isAccessingTutorials && (
                    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                      {/* Outer rotating dashed purple ring */}
                      <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/30 animate-spin [animation-duration:12s]" />
                      
                      {/* Inner SVG Circular Progress */}
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 80 80">
                        {/* Background Track */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-neutral-950/85"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        {/* Foreground Progress */}
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-purple-500 transition-all duration-100 ease-out"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 * (1 - accessingTutorialsProgress / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center text showing percentage and TX label */}
                      <div className="absolute flex flex-col items-center justify-center font-mono">
                        <span className="text-[10px] font-black text-purple-400 leading-none">
                          {accessingTutorialsProgress}%
                        </span>
                        <span className="text-[5px] font-black text-purple-500/60 tracking-wider uppercase leading-none mt-0.5">TX</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Section 2: Why Sustain the Shadows (Sustain/Donation Space) */}
      <div className="w-full relative z-10 border-t border-neutral-900 bg-neutral-950/80 backdrop-blur-md py-16 px-6 md:px-12">
        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          
          {/* Header Ribbon */}
          <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-neutral-900">
            <div>
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-purple-400 font-extrabold">// SYSTEM_SUSTENANCE</span>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-white to-purple-300">
                WHY SUSTAIN THE SHADOWS?
              </h2>
            </div>
          </div>

          {/* Core Manifesto Text (Fulfill user prompt text requirement perfectly, compressed ~30%) */}
          <div className="bg-neutral-950/80 border border-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-5 text-neutral-300 leading-relaxed font-sans text-sm md:text-base relative overflow-hidden shadow-inner font-sans">
            <div className="absolute top-0 right-0 p-3 select-none pointer-events-none opacity-5 font-mono text-[90px] font-black leading-none uppercase text-purple-500">
              SHDW
            </div>
            
            <div className="space-y-4 text-left">
              <p className="font-extrabold text-white text-lg md:text-xl border-l-2 border-purple-500 pl-4 tracking-tight leading-snug">
                True innovation cannot be bound by standard hardware. To construct tomorrow's digital frameworks, mundane tools are no longer sufficient.
              </p>

              <p className="leading-relaxed opacity-90 pl-4 border-l-2 border-transparent">
                Currently, an optimized, remote-access environment combined with advanced AI creation arrays operates from the shadows to design and deploy elite models with maximum efficiency. Your support directly upgrades our core infrastructure, shattering hardware bottlenecks.
              </p>

              <p className="font-medium text-purple-200 pl-4 border-l-2 border-purple-500/40">
                Supporting this page does not merely fund code. It directly sustains a technician operating from the shadows to keep our local community connected, functional, and secure.
              </p>
            </div>
          </div>



          {/* Support Shadow Button & GCash Trigger */}
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <button
              onClick={() => setIsGcashModalOpenLanding(true)}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl border border-purple-500/50 hover:border-purple-400 font-mono text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] cursor-pointer flex items-center gap-2 px-6 active:scale-95 overflow-hidden"
            >
              <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
              <span>Click to support Shadow Garden</span>
              <Heart className="w-4 h-4 text-purple-300 fill-purple-300 group-hover:scale-120 transition-transform" />
            </button>
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-2">// DIRECT GCASH CONDUIT SECURE GATEWAY</p>
          </div>

          {/* GCash Details Popup Modal */}
          <AnimatePresence>
            {isGcashModalOpenLanding && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsGcashModalOpenLanding(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                {/* Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ type: "spring", damping: 25, stiffness: 180 }}
                  className="relative w-full max-w-md bg-neutral-950 border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.4)] font-mono text-neutral-200 z-10 p-1"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-sky-400 to-indigo-600" />
                  
                  <div className="p-6 md:p-8 bg-neutral-950 rounded-[22px] relative space-y-5">
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setIsGcashModalOpenLanding(false)}
                      className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>

                    {/* Cyber Header */}
                    <div className="text-center pt-2 space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950/45 border border-sky-500/30 rounded-full text-[9px] text-sky-400 font-extrabold tracking-wider uppercase">
                        <Smartphone size={10} className="text-sky-400" />
                        <span>GCash Secure Conduit</span>
                      </div>
                      <h3 className="text-base font-black text-white tracking-wide uppercase mt-1">
                        SUPPORT RECIPIENT
                      </h3>
                    </div>

                    {/* QR Screen Wrapper */}
                    <div className="border border-dashed border-purple-500/25 p-5 rounded-2xl bg-neutral-900/30 flex flex-col items-center justify-center relative group select-none">
                      <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-purple-500/40 rounded-tl" />
                      <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-purple-500/40 rounded-tr" />
                      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-purple-500/40 rounded-bl" />
                      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-purple-500/40 rounded-br" />
                      
                      {/* Outer glowing target scan effect */}
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-[bounce_3s_infinite] pointer-events-none" />

                      <QrCode className="w-16 h-16 text-purple-400 opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300" strokeWidth={1.5} />
                      
                      <span className="text-[9px] text-neutral-400 uppercase tracking-widest mt-2.5">
                        SCAN QR OR COPY INFO BELOW
                      </span>
                    </div>

                    {/* Fields Table */}
                    <div className="space-y-3">
                      {/* Recipient Account Name */}
                      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">ACCOUNT NAME</span>
                          <span className="text-xs font-black text-white uppercase tracking-wide">ADRIAN G.</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('ADRIAN G.');
                            setCopiedFieldLanding('name');
                            setTimeout(() => setCopiedFieldLanding(null), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 hover:border-purple-500 hover:text-white text-neutral-400 bg-neutral-900/60"
                        >
                          {copiedFieldLanding === 'name' ? (
                            <>
                              <Check size={10} className="text-emerald-400" />
                              <span className="text-emerald-400">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Recipient GCash Number */}
                      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">GCASH MOBILE NUMBER</span>
                          <span className="text-xs font-black text-purple-400 tracking-wider">0993 618 8535</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('09936188535');
                            setCopiedFieldLanding('number');
                            setTimeout(() => setCopiedFieldLanding(null), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 hover:border-purple-500 hover:text-white text-neutral-400 bg-neutral-900/60"
                        >
                          {copiedFieldLanding === 'number' ? (
                            <>
                              <Check size={10} className="text-emerald-400" />
                              <span className="text-emerald-400">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Footer Warning / Guide */}
                    <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-purple-300 leading-relaxed font-sans font-medium">
                        Funds directly sponsor advanced cloud development resources, remote servers, and shadow tech tool maintenance.
                      </p>
                    </div>

                    {/* ID badge bottom ribbon */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[8px] text-neutral-500 uppercase tracking-widest">
                      <span>SECURE_ID: #4c46-GCASH</span>
                      <div className="flex items-center gap-1 text-emerald-500">
                        <ShieldCheck size={9} />
                        <span>ACTIVE</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Bottom Watermark */}
          <div className="text-center pt-6 border-t border-neutral-900/80">
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest max-w-sm mx-auto">
              COGNITIVE SUITE HARDWARE INTERFACE // SECURE SECRECY LEVEL 4
            </p>
          </div>

        </div>
      </div>

      {/* Floating Tactical Soundtrack & Equalizer Module */}
      <div className="fixed bottom-8 right-8 z-40 font-mono text-[10px] select-none flex flex-col items-end gap-3 pointer-events-auto">
        <AnimatePresence>
          {isSounddeckExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-neutral-950/95 backdrop-blur-md border-2 border-purple-500/30 rounded-2xl p-4 w-[310px] shadow-[0_0_25px_rgba(168,85,247,0.2)] text-white relative flex flex-col gap-3.5 overflow-hidden"
            >
              {/* Grid backdrop and corners */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25 pointer-events-none" />
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple-500/40 pointer-events-none rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple-500/40 pointer-events-none rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple-500/40 pointer-events-none rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple-500/40 pointer-events-none rounded-br-lg" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2 relative z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className={`w-1.5 h-1.5 bg-purple-500 rounded-full block ${isPlaying ? 'animate-ping' : ''}`} />
                    <span className="absolute -inset-0.5 bg-purple-500/30 rounded-full blur-[2px]" />
                  </div>
                  <span className="font-extrabold uppercase tracking-[0.2em] text-purple-400">SPECTRUM SOUNDDECK</span>
                </div>
                <button
                  onClick={() => setIsSounddeckExpanded(false)}
                  className="p-1 hover:bg-neutral-900 text-neutral-500 hover:text-white transition-all rounded cursor-pointer"
                  title="Minimize player"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Status & Sim tracking lines */}
              <div className="bg-neutral-950 border border-neutral-900 p-2.5 rounded-lg flex flex-col gap-1.5 relative z-10">
                <div className="flex justify-between items-center text-[8px] text-neutral-500 tracking-wider text-left">
                  <span>SIGNAL CODE: SHADOW</span>
                  <span className="text-purple-500 font-bold">{isPlaying ? 'TRANSMITTING' : 'MUTED'}</span>
                </div>
                <div className="truncate text-[10px] font-black tracking-widest text-neutral-100 uppercase animate-pulse text-left">
                  ⚔ {activeTrack.name}
                </div>
                <div className="text-[8px] text-neutral-400 font-sans uppercase break-all font-medium leading-normal text-left">
                  {activeTrack.desc}
                </div>

                {/* Simulated tracking line */}
                <div className="h-1 bg-neutral-900 overflow-hidden relative rounded-full mt-1.5 w-full">
                  <motion.div
                    animate={isPlaying ? { x: ["-100%", "100%"] } : { x: "0%" }}
                    transition={isPlaying ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
                    className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>

              {/* Equalizer animation & Controls row */}
              <div className="flex items-center justify-between px-1 relative z-10 shrink-0">
                {/* Embedded style tag for equalizers */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes eq-bar-pulse {
                    0%, 100% { height: 15%; }
                    50% { height: 75%; }
                  }
                `}} />
                
                {/* Visualizer bars */}
                <div className="flex items-end gap-1 h-5 overflow-hidden w-12 select-none">
                  {[0.7, 0.4, 0.9, 0.5, 0.8].map((speed, i) => (
                    <div
                      key={i}
                      style={{
                        animation: isPlaying ? `eq-bar-pulse ${speed}s ease-in-out infinite` : 'none',
                        height: isPlaying ? '15%' : '20%',
                      }}
                      className="w-[3px] bg-purple-500/80 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Main Playback controller row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevTrack}
                    className="p-1.5 rounded-lg border border-neutral-900 hover:border-purple-500/20 bg-neutral-950 text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                    title="Previous track"
                  >
                    <SkipBack size={12} />
                  </button>

                  <button
                    onClick={() => {
                      if (!localAudioActive) {
                        setLocalAudioActive(true);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    className={`p-2.5 rounded-full border shadow-md active:scale-95 transition-all duration-300 cursor-pointer ${
                      isPlaying
                        ? 'bg-purple-650 hover:bg-purple-500 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-purple-400'
                    }`}
                    title={isPlaying ? 'Mute' : 'Play'}
                  >
                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} className="ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-1.5 rounded-lg border border-neutral-900 hover:border-purple-500/20 bg-neutral-950 text-neutral-400 hover:text-white active:scale-95 transition-all cursor-pointer"
                    title="Next track"
                  >
                    <SkipForward size={12} />
                  </button>
                </div>

                {/* Audio Mode indicator */}
                <button
                  type="button"
                  onClick={() => {
                    if (!localAudioActive) setLocalAudioActive(true);
                    setIsPlaying(!isPlaying);
                  }}
                  className="p-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-neutral-400 hover:text-white transition-all rounded flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Volume2 size={11} className="text-purple-400 animate-pulse" />
                      <span className="text-[7.5px] font-black text-purple-400 uppercase">ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX size={11} className="text-neutral-500" />
                      <span className="text-[7.5px] font-bold text-neutral-500 uppercase">MUTED</span>
                    </>
                  )}
                </button>
              </div>

              {/* Playlist Select list */}
              <div className="border-t border-neutral-900/60 pt-2 flex flex-col gap-1 z-10 max-h-[110px] overflow-y-auto pr-1 no-scrollbar text-left font-mono">
                <span className="text-[7.5px] uppercase tracking-[0.15em] text-neutral-500 pt-0.5 pb-1 block font-bold">FREQUENCY LIST ({playlist.length} FEEDS)</span>
                {playlist.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleSelectTrack(idx)}
                    className={`w-full p-2 text-left rounded-lg border text-[9px] flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 group relative ${
                      idx === currentTrackIndex
                        ? 'bg-purple-950/20 border-purple-500/35 text-purple-300 font-extrabold shadow-[inset_0_0_8px_rgba(168,85,247,0.1)]'
                        : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 hover:border-neutral-800'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="truncate uppercase font-bold text-[9px]">
                        {idx === currentTrackIndex ? '🔮 ' : ''}{item.name}
                      </div>
                      <div className="truncate text-[7.5px] text-neutral-500 font-sans">
                        {item.desc}
                      </div>
                    </div>
                    
                    {/* Trash button for custom playlist entries */}
                    {idx >= STATIC_PLAYLIST.length && (
                      <button
                        onClick={(e) => handlePurgeTrack(item.id, e)}
                        className="p-1 hover:bg-red-955/40 text-neutral-600 hover:text-red-400 rounded-md transition-all self-center opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer border border-transparent hover:border-red-900/20"
                        title="Purge custom signal"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom stream controller */}
              <form onSubmit={handleInjectTrack} className="border-t border-neutral-900/60 pt-2.5 flex flex-col gap-1.5 z-10 shrink-0 text-left">
                <span className="text-[7.5px] uppercase tracking-[0.15em] text-neutral-500 font-bold">INJECT CUSTOM SOUNDTRACK VIA YT LINK</span>
                <div className="flex gap-1.5 items-center justify-between">
                  <input
                    type="text"
                    value={soundtrackInput}
                    disabled={isInjectingTrack}
                    onChange={(e) => setSoundtrackInput(e.target.value)}
                    placeholder={isInjectingTrack ? "INJECTING SIGNAL..." : "Paste YT Link or Video ID"}
                    className={`flex-1 bg-neutral-950 text-[9px] font-sans text-neutral-100 placeholder:text-neutral-600 outline-none border border-neutral-900 focus:border-purple-500/30 px-2 py-1.5 transition-all text-left uppercase ${isInjectingTrack ? 'opacity-40 cursor-not-allowed' : ''}`}
                  />
                  {isInjectingTrack ? (
                    <div className="flex items-center gap-1.5 px-2">
                      {/* Circular Progress Loader */}
                      <div className="relative flex items-center justify-center w-6 h-6">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-purple-500/20 animate-spin [animation-duration:10s]" />
                        
                        {/* Inner SVG Circular Progress */}
                        <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 80 80">
                          {/* Background Track */}
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            className="stroke-neutral-900"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          {/* Foreground Progress */}
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            className="stroke-purple-500 transition-all duration-100 ease-out"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray="213.6"
                            strokeDashoffset={213.6 * (1 - injectingTrackProgress / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        {/* Center text showing percentage */}
                        <span className="absolute text-[5.5px] font-black text-purple-400 font-mono">
                          {injectingTrackProgress}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!soundtrackInput.trim()}
                      className={`px-3 py-1.5 flex items-center gap-1 border font-bold uppercase tracking-wider text-[8px] transition-all cursor-pointer ${
                        soundtrackInput.trim()
                          ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/40 text-purple-300'
                          : 'bg-neutral-900/20 border-neutral-950 text-neutral-600 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={10} />
                      <span>INJECT</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Capsule trigger button */}
        <motion.button
          onClick={() => {
            setIsSounddeckExpanded(!isSounddeckExpanded);
            // Ensure soundtrack plays in response to clicking the trigger button
            if (!isPlaying || !localAudioActive) {
              setLocalAudioActive(true);
              setIsPlaying(true);
              setCurrentTrackIndex(0);
              localStorage.setItem('shadow_soundtrack_active_index', '0');
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2.5 px-4 py-2.5 border-2 shadow-2xl transition-all select-none rounded-full cursor-pointer font-bold uppercase tracking-[0.15em] text-[10px] relative overflow-hidden ${
            isSounddeckExpanded 
              ? 'bg-purple-950/90 text-purple-400 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
              : 'bg-neutral-950 text-neutral-300 hover:text-white border-neutral-800 hover:border-purple-500/30 shadow-[0_0_15px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Pulsing indicator light */}
          {!isSounddeckExpanded && isPlaying && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
          )}

          {/* Equalizer or Static Music note */}
          {isPlaying ? (
            <div className="flex items-end gap-[2px] h-3 overflow-hidden select-none w-3">
              <div className="w-[1.5px] bg-purple-400 rounded-full animate-[eq-bar-pulse_0.8s_ease-in-out_infinite]" />
              <div className="w-[1.5px] bg-purple-400 rounded-full animate-[eq-bar-pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
              <div className="w-[1.5px] bg-purple-400 rounded-full animate-[eq-bar-pulse_0.7s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
            </div>
          ) : (
            <Music size={12} className={isSounddeckExpanded ? "text-purple-400" : "text-neutral-500"} />
          )}

          <div className="flex items-center gap-1.5 font-semibold text-[9.5px]">
            <span>{isSounddeckExpanded ? 'SOUND CONSOLE ENABLED' : (isPlaying ? `OST: ${activeTrack.name.substring(0, 11)}..` : 'SOUND DECK OFF')}</span>
          </div>
        </motion.button>
      </div>

      {/* Community Violation Warning popup */}
      <AnimatePresence>
        {warningPopup && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f071f] border-2 border-red-500/35 rounded-2xl p-6 md:p-8 max-w-md w-full text-white font-sans relative shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-[50px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-[50px] pointer-events-none" />

              {/* Warning symbol */}
              <div className="w-14 h-14 bg-red-950/40 rounded-full border border-red-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
                <span className="text-2xl">⚠️</span>
              </div>

              {/* Title Section */}
              <h3 className="text-lg md:text-xl font-black tracking-wider uppercase bg-gradient-to-r from-red-400 via-orange-400 to-pink-500 bg-clip-text text-transparent mb-4 font-sans whitespace-pre-line leading-snug">
                {warningPopup.title}
              </h3>

              {/* Message text with newline rendering support */}
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans font-medium whitespace-pre-line px-1 mb-6 max-h-48 overflow-y-auto no-scrollbar">
                {warningPopup.message}
              </p>

              {/* Warning Counter Indicator */}
              <div className="w-full bg-neutral-950/70 border border-neutral-900 rounded-xl px-4 py-2.5 mb-6 flex justify-between items-center">
                <span className="text-[10px] font-mono tracking-[0.1em] text-neutral-500 uppercase font-black">Violation Tracker:</span>
                <span className={`text-[10px] font-mono tracking-wider font-extrabold uppercase px-2 py-0.5 rounded ${
                  warningPopup.violationNumber === 1 
                    ? 'bg-amber-950/40 border border-amber-500/25 text-amber-500' 
                    : warningPopup.violationNumber === 2 
                    ? 'bg-orange-950/40 border border-orange-500/25 text-orange-400' 
                    : 'bg-red-950/40 border border-red-500/35 text-red-400'
                }`}>
                  {warningPopup.violationNumber === 3 ? 'BANNED' : `Warning ${warningPopup.violationNumber} / 2`}
                </span>
              </div>

              {/* Acknowledge/Dismiss CTAs */}
              <button
                type="button"
                onClick={() => setWarningPopup(null)}
                className={`w-full py-2.5 text-xs text-white uppercase font-mono font-black tracking-widest transition-all duration-300 active:scale-[0.98] shadow-md cursor-pointer ${
                  warningPopup.violationNumber === 3
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-gradient-to-r from-purple-650 to-indigo-650 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                }`}
              >
                {warningPopup.violationNumber === 3 ? 'I ACCEPT CONSEQUENCES' : 'I UNDERSTAND & DESIST'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
