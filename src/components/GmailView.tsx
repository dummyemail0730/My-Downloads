import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Inbox,
  Send,
  Star,
  FileText,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  Reply,
  Archive,
  MailOpen,
  LogOut,
  AlertTriangle,
  X,
  Paperclip,
  ChevronLeft,
  Check,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { initAuth, googleSignIn, googleSignOut, getAccessToken, setAccessToken } from '../lib/googleAuth';
import GoogleSignInButton from './GoogleSignInButton';
import {
  ParsedEmail,
  GmailLabel,
  getGmailProfile,
  listGmailLabels,
  listGmailMessages,
  sendGmailMessage,
  createGmailDraft,
  modifyGmailLabels,
  trashGmailMessage,
  untrashGmailMessage,
  deleteGmailMessage,
} from '../utils/gmailApi';

interface PendingConfirmation {
  title: string;
  description: string;
  details?: string[];
  confirmLabel: string;
  variant: 'danger' | 'primary';
  onConfirm: () => Promise<void>;
}

const SYSTEM_LABELS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox },
  { id: 'STARRED', label: 'Starred', icon: Star },
  { id: 'SENT', label: 'Sent', icon: Send },
  { id: 'DRAFT', label: 'Drafts', icon: FileText },
  { id: 'TRASH', label: 'Trash', icon: Trash2 },
];

export default function GmailView() {
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getAccessToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string>('');

  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [activeLabel, setActiveLabel] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');

  const [messages, setMessages] = useState<ParsedEmail[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeThreadId, setComposeThreadId] = useState<string | undefined>(undefined);

  // Mandatory confirmation dialog state
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusBanner({ text, type });
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleUnauthorized = () => {
    setAccessToken(null);
    setNeedsAuth(true);
    setProfileEmail('');
    setMessages([]);
    setSelectedEmail(null);
  };

  const loadMailbox = useCallback(
    async (labelId = activeLabel, query = submittedQuery, pageToken?: string, append = false) => {
      const token = getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        if (!profileEmail) {
          const profile = await getGmailProfile(token);
          setProfileEmail(profile.emailAddress);
        }

        const [fetchedLabels, fetchedMsgs] = await Promise.all([
          !append ? listGmailLabels(token) : Promise.resolve(null),
          listGmailMessages(token, {
            labelIds: query.trim() ? undefined : [labelId],
            q: query.trim() || undefined,
            maxResults: 20,
            pageToken,
          }),
        ]);

        if (fetchedLabels) {
          setLabels(fetchedLabels);
        }

        if (append) {
          setMessages((prev) => [...prev, ...fetchedMsgs.messages]);
        } else {
          setMessages(fetchedMsgs.messages);
          setSelectedEmail(null);
        }
        setNextPageToken(fetchedMsgs.nextPageToken);
      } catch (err: any) {
        console.error('Gmail load error:', err);
        if (err?.status === 401 || String(err?.message).includes('401')) {
          handleUnauthorized();
          setAuthError('Your Google session expired. Please sign in with Google again.');
        } else {
          showStatus(err?.message || 'Failed to load Gmail messages.', 'error');
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeLabel, submittedQuery, profileEmail]
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (_user, token) => {
        if (token) {
          setNeedsAuth(false);
          loadMailbox('INBOX', '');
        } else {
          setNeedsAuth(true);
        }
      },
      () => {
        if (!getAccessToken()) {
          setNeedsAuth(true);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setNeedsAuth(false);
        await loadMailbox('INBOX', '');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    handleUnauthorized();
  };

  const handleSelectLabel = (labelId: string) => {
    setActiveLabel(labelId);
    setSearchQuery('');
    setSubmittedQuery('');
    loadMailbox(labelId, '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    loadMailbox(activeLabel, searchQuery);
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    setIsExecutingAction(true);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err: any) {
      if (err?.status === 401 || String(err?.message).includes('401')) {
        setPendingConfirm(null);
        handleUnauthorized();
        setAuthError('Session expired. Please sign in again.');
      } else {
        showStatus(err?.message || 'Operation failed.', 'error');
      }
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Mutating / Destructive Operations (ALL require explicit confirmation dialog)
  const requestSendEmail = () => {
    if (!composeTo.trim()) {
      showStatus('Please enter at least one recipient email address.', 'error');
      return;
    }
    setPendingConfirm({
      title: 'Confirm Send Email',
      description: `Send this email from ${profileEmail || 'your Gmail account'}?`,
      details: [
        `To: ${composeTo.trim()}`,
        `Subject: ${composeSubject.trim() || '(No Subject)'}`,
        `Message preview: ${composeBody.trim().slice(0, 120)}${composeBody.trim().length > 120 ? '...' : ''}`,
      ],
      confirmLabel: 'Send Email',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await sendGmailMessage(token, {
          to: composeTo.trim(),
          subject: composeSubject.trim() || '(No Subject)',
          body: composeBody,
          threadId: composeThreadId,
        });
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeThreadId(undefined);
        showStatus('Email sent successfully!');
        loadMailbox(activeLabel, submittedQuery);
      },
    });
  };

  const requestSaveDraft = () => {
    setPendingConfirm({
      title: 'Confirm Save Draft',
      description: 'Save this message to your Gmail Drafts folder?',
      details: [
        `To: ${composeTo.trim() || '(No recipient)'}`,
        `Subject: ${composeSubject.trim() || '(No Subject)'}`,
      ],
      confirmLabel: 'Save Draft',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await createGmailDraft(token, {
          to: composeTo.trim(),
          subject: composeSubject.trim() || '(No Subject)',
          body: composeBody,
          threadId: composeThreadId,
        });
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeThreadId(undefined);
        showStatus('Draft saved to Gmail.');
        if (activeLabel === 'DRAFT') {
          loadMailbox(activeLabel, submittedQuery);
        }
      },
    });
  };

  const requestTrashEmail = (email: ParsedEmail) => {
    setPendingConfirm({
      title: 'Move Email to Trash?',
      description: 'Are you sure you want to move this email to Trash?',
      details: [`Subject: ${email.subject}`, `From: ${email.from}`],
      confirmLabel: 'Move to Trash',
      variant: 'danger',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await trashGmailMessage(token, email.id);
        setMessages((prev) => prev.filter((m) => m.id !== email.id));
        if (selectedEmail?.id === email.id) setSelectedEmail(null);
        showStatus('Email moved to Trash.');
      },
    });
  };

  const requestUntrashEmail = (email: ParsedEmail) => {
    setPendingConfirm({
      title: 'Restore Email from Trash?',
      description: 'Restore this email back from Trash?',
      details: [`Subject: ${email.subject}`, `From: ${email.from}`],
      confirmLabel: 'Restore Email',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await untrashGmailMessage(token, email.id);
        setMessages((prev) => prev.filter((m) => m.id !== email.id));
        if (selectedEmail?.id === email.id) setSelectedEmail(null);
        showStatus('Email restored from Trash.');
      },
    });
  };

  const requestDeleteForever = (email: ParsedEmail) => {
    setPendingConfirm({
      title: 'Permanently Delete Email?',
      description: 'This will permanently delete this email and cannot be undone.',
      details: [`Subject: ${email.subject}`, `From: ${email.from}`],
      confirmLabel: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await deleteGmailMessage(token, email.id);
        setMessages((prev) => prev.filter((m) => m.id !== email.id));
        if (selectedEmail?.id === email.id) setSelectedEmail(null);
        showStatus('Email permanently deleted.');
      },
    });
  };

  const requestToggleRead = (email: ParsedEmail) => {
    const markAsRead = email.isUnread;
    setPendingConfirm({
      title: markAsRead ? 'Mark Email as Read?' : 'Mark Email as Unread?',
      description: `Update read status for "${email.subject}"?`,
      confirmLabel: markAsRead ? 'Mark Read' : 'Mark Unread',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await modifyGmailLabels(
          token,
          email.id,
          markAsRead ? [] : ['UNREAD'],
          markAsRead ? ['UNREAD'] : []
        );
        const updateItem = (m: ParsedEmail) =>
          m.id === email.id
            ? {
                ...m,
                isUnread: !markAsRead,
                labelIds: markAsRead
                  ? m.labelIds.filter((l) => l !== 'UNREAD')
                  : [...m.labelIds, 'UNREAD'],
              }
            : m;
        setMessages((prev) => prev.map(updateItem));
        if (selectedEmail?.id === email.id) {
          setSelectedEmail(updateItem(selectedEmail));
        }
        showStatus(markAsRead ? 'Marked as read.' : 'Marked as unread.');
      },
    });
  };

  const requestToggleStar = (email: ParsedEmail) => {
    const addStar = !email.isStarred;
    setPendingConfirm({
      title: addStar ? 'Star Email?' : 'Remove Star?',
      description: `${addStar ? 'Add star to' : 'Remove star from'} "${email.subject}"?`,
      confirmLabel: addStar ? 'Add Star' : 'Remove Star',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await modifyGmailLabels(
          token,
          email.id,
          addStar ? ['STARRED'] : [],
          addStar ? [] : ['STARRED']
        );
        const updateItem = (m: ParsedEmail) =>
          m.id === email.id
            ? {
                ...m,
                isStarred: addStar,
                labelIds: addStar
                  ? [...m.labelIds, 'STARRED']
                  : m.labelIds.filter((l) => l !== 'STARRED'),
              }
            : m;
        setMessages((prev) => prev.map(updateItem));
        if (selectedEmail?.id === email.id) {
          setSelectedEmail(updateItem(selectedEmail));
        }
        showStatus(addStar ? 'Starred email.' : 'Removed star.');
      },
    });
  };

  const requestArchiveEmail = (email: ParsedEmail) => {
    setPendingConfirm({
      title: 'Archive Email?',
      description: `Remove "${email.subject}" from Inbox and archive it?`,
      confirmLabel: 'Archive Email',
      variant: 'primary',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');
        await modifyGmailLabels(token, email.id, [], ['INBOX']);
        if (activeLabel === 'INBOX') {
          setMessages((prev) => prev.filter((m) => m.id !== email.id));
          if (selectedEmail?.id === email.id) setSelectedEmail(null);
        }
        showStatus('Email archived.');
      },
    });
  };

  const handleReply = (email: ParsedEmail) => {
    const senderMatch = email.from.match(/<([^>]+)>/);
    const replyAddress = senderMatch ? senderMatch[1] : email.from;
    setComposeTo(replyAddress);
    setComposeSubject(email.subject.toLowerCase().startsWith('re:') ? email.subject : `Re: ${email.subject}`);
    setComposeBody(`\n\n--- On ${email.date}, ${email.from} wrote: ---\n${email.textBody || email.snippet}`);
    setComposeThreadId(email.threadId);
    setIsComposeOpen(true);
  };

  const formatShortDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const userLabels = labels.filter((l) => l.type === 'user');

  // Auth Gate Screen
  if (needsAuth) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 bg-neutral-950 text-neutral-100">
        <div className="max-w-md w-full bg-neutral-900/70 border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Mail size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-wider text-white">Gmail Workspace</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Connect your Google account to read, search, organize, compose, and send emails directly inside ShadowTech.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 text-left">
              {authError}
            </div>
          )}

          <div className="flex justify-center pt-1">
            <GoogleSignInButton onClick={handleLogin} loading={isLoggingIn} />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500 pt-2">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Access tokens stay strictly in memory for this session</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-900 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Mail size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Gmail Console</h2>
            <p className="text-[11px] font-mono text-purple-300/80 truncate max-w-[220px] sm:max-w-xs">
              {profileEmail || 'Connected via Google Workspace'}
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md min-w-[200px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search mail (e.g. from:boss, subject:invoice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 transition-colors select-text"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setComposeTo('');
              setComposeSubject('');
              setComposeBody('');
              setComposeThreadId(undefined);
              setIsComposeOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-950/60 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Compose</span>
          </button>

          <button
            onClick={() => loadMailbox(activeLabel, submittedQuery)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Inbox"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleSignOut}
            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Disconnect Google Account"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {statusBanner && (
        <div
          className={`px-4 py-2 text-xs font-semibold border-b flex items-center justify-between shrink-0 ${
            statusBanner.type === 'error'
              ? 'bg-red-950/70 border-red-500/40 text-red-200'
              : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button onClick={() => setStatusBanner(null)} className="p-0.5 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Labels Column */}
        <aside className="w-full md:w-52 border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-900/30 p-2.5 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
          {SYSTEM_LABELS.map((item) => {
            const Icon = item.icon;
            const labelObj = labels.find((l) => l.id === item.id);
            const unread = labelObj?.messagesUnread || 0;
            const isActive = activeLabel === item.id && !submittedQuery;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectLabel(item.id)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-950/70 text-white border border-purple-500/50 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={14} className={isActive ? 'text-purple-400' : 'text-neutral-500'} />
                  <span>{item.label}</span>
                </span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-600 text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}

          {userLabels.length > 0 && (
            <div className="hidden md:block pt-3 mt-2 border-t border-neutral-900 space-y-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
                Labels
              </p>
              {userLabels.map((lbl) => {
                const isActive = activeLabel === lbl.id && !submittedQuery;
                return (
                  <button
                    key={lbl.id}
                    onClick={() => handleSelectLabel(lbl.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-950/60 text-purple-200 border border-purple-500/40 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Tag size={12} className="text-purple-400 shrink-0" />
                      <span className="truncate">{lbl.name}</span>
                    </span>
                    {(lbl.messagesUnread || 0) > 0 && (
                      <span className="text-[10px] font-mono text-purple-300">{lbl.messagesUnread}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Message List Column */}
        <section
          className={`${
            selectedEmail ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-96 border-r border-neutral-900 flex-col min-h-0 bg-neutral-950`}
        >
          <div className="px-4 py-2.5 border-b border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <span>
              {submittedQuery ? `Search: "${submittedQuery}"` : activeLabel} ({messages.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-neutral-500 font-mono">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No messages found in this view.
              </div>
            ) : (
              messages.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const senderName = email.from.replace(/<[^>]+>/, '').replace(/"/g, '').trim() || email.from;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-950/40 border-l-2 border-l-purple-500'
                        : 'hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-xs truncate ${
                          email.isUnread ? 'font-black text-white' : 'font-medium text-neutral-300'
                        }`}
                      >
                        {senderName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {email.isStarred && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        <span className="text-[10px] font-mono text-neutral-500">
                          {formatShortDate(email.internalDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {email.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      )}
                      <p
                        className={`text-xs truncate ${
                          email.isUnread ? 'font-bold text-purple-200' : 'text-neutral-300'
                        }`}
                      >
                        {email.subject}
                      </p>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2">{email.snippet}</p>
                  </div>
                );
              })
            )}

            {nextPageToken && (
              <div className="p-3 text-center">
                <button
                  onClick={() => loadMailbox(activeLabel, submittedQuery, nextPageToken, true)}
                  disabled={isLoadingMore}
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-purple-300 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Email Reader Pane */}
        <section
          className={`${
            selectedEmail ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col min-h-0 bg-neutral-950/80 overflow-hidden`}
        >
          {!selectedEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <Mail size={40} className="mb-3 text-neutral-700" />
              <p className="text-sm font-bold text-neutral-400">Select an email to read</p>
              <p className="text-xs text-neutral-600 mt-1">
                Read, reply, archive, or compose emails directly from your Gmail account.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Email Action Bar */}
              <div className="px-4 py-2.5 border-b border-neutral-900 bg-neutral-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="lg:hidden flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>

                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => handleReply(selectedEmail)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Reply size={13} />
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => requestToggleStar(selectedEmail)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    title={selectedEmail.isStarred ? 'Unstar' : 'Star'}
                  >
                    <Star
                      size={13}
                      className={selectedEmail.isStarred ? 'text-amber-400 fill-amber-400' : ''}
                    />
                    <span>{selectedEmail.isStarred ? 'Starred' : 'Star'}</span>
                  </button>

                  <button
                    onClick={() => requestToggleRead(selectedEmail)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <MailOpen size={13} />
                    <span>{selectedEmail.isUnread ? 'Mark Read' : 'Mark Unread'}</span>
                  </button>

                  {activeLabel === 'INBOX' && (
                    <button
                      onClick={() => requestArchiveEmail(selectedEmail)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Archive size={13} />
                      <span>Archive</span>
                    </button>
                  )}

                  {activeLabel === 'TRASH' ? (
                    <>
                      <button
                        onClick={() => requestUntrashEmail(selectedEmail)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => requestDeleteForever(selectedEmail)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete Forever</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => requestTrashEmail(selectedEmail)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Trash</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email Headers */}
              <div className="p-4 sm:p-5 border-b border-neutral-900 space-y-2 shrink-0 select-text">
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {selectedEmail.subject}
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                  <div>
                    <span className="font-bold text-purple-300">From: </span>
                    <span>{selectedEmail.from}</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">{selectedEmail.date}</span>
                </div>
                {selectedEmail.to && (
                  <div className="text-xs text-neutral-400">
                    <span className="font-bold text-neutral-500">To: </span>
                    <span>{selectedEmail.to}</span>
                  </div>
                )}
                {selectedEmail.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedEmail.attachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5"
                      >
                        <Paperclip size={12} className="text-purple-400" />
                        <span>{att.filename}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 select-text">
                {selectedEmail.htmlBody ? (
                  <iframe
                    title="Email Content"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    srcDoc={`<!DOCTYPE html><html><head><style>body{font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.6;color:#111;background:#fff;margin:0;padding:16px;word-break:break-word;}img{max-width:100%;height:auto;}a{color:#6d28d9;}</style></head><body>${selectedEmail.htmlBody}</body></html>`}
                    className="w-full h-full min-h-[360px] rounded-xl bg-white border border-neutral-800"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-200 leading-relaxed">
                    {selectedEmail.textBody || selectedEmail.snippet}
                  </pre>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-neutral-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
            >
              <div className="px-5 py-3.5 bg-purple-950/70 border-b border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={17} className="text-purple-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">New Message</h3>
                </div>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-purple-300 mb-1">To</label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 select-text"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-purple-300 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 select-text"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-purple-300 mb-1">Message</label>
                  <textarea
                    rows={8}
                    placeholder="Write your message..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-purple-500 resize-y select-text"
                  />
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={requestSaveDraft}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer"
                >
                  Save Draft
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={requestSendEmail}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory User Confirmation Dialog for Mutating / Destructive Operations */}
      <AnimatePresence>
        {pendingConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-neutral-900 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
            >
              <div className="px-5 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl border ${
                    pendingConfirm.variant === 'danger'
                      ? 'bg-red-950/60 border-red-500/40 text-red-400'
                      : 'bg-purple-950/60 border-purple-500/40 text-purple-400'
                  }`}
                >
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  {pendingConfirm.title}
                </h3>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed">{pendingConfirm.description}</p>
                {pendingConfirm.details && pendingConfirm.details.length > 0 && (
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-[11px] font-mono text-neutral-400 select-text">
                    {pendingConfirm.details.map((line, i) => (
                      <div key={i} className="truncate">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 py-3.5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isExecutingAction}
                  onClick={() => setPendingConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExecutingAction}
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 ${
                    pendingConfirm.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {isExecutingAction ? 'Processing...' : pendingConfirm.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
