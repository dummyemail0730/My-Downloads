import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, MessageSquare, Calendar, Clipboard, Download, Terminal, Settings } from 'lucide-react';

interface LogUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogUpdateModal({ isOpen, onClose }: LogUpdateModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'suggestions' | 'appointments' | 'shoutouts' | 'downloads' | 'changes'>('suggestions');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shoutouts, setShoutouts] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);

  // Reload statistics and logs whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      try {
        const rawSugg = JSON.parse(localStorage.getItem('shadow_suggestions') || '[]');
        const rawApts = JSON.parse(localStorage.getItem('shadow_appointments') || '[]');
        const rawShouts = JSON.parse(localStorage.getItem('shadow_shout_outs_v3') || '[]');
        const rawMovements = JSON.parse(localStorage.getItem('shadow_user_movements') || '[]');

        setSuggestions(rawSugg);
        setAppointments(rawApts);
        setShoutouts(rawShouts);

        // Filter out downloads
        const dl = rawMovements.filter((l: any) => {
          const txt = (l.text || '').toLowerCase();
          return txt.includes('downloaded') || txt.includes('streamed') || txt.includes('download');
        });
        setDownloads(dl);

        // Filter out admin console changes & navigation actions
        const chg = rawMovements.filter((l: any) => {
          const txt = (l.text || '').toLowerCase();
          const isDl = txt.includes('downloaded') || txt.includes('streamed') || txt.includes('download');
          return !isDl && (l.type === 'action' || l.type === 'navigation' || txt.includes('console') || txt.includes('sync_update'));
        });
        setChanges(chg);
      } catch (e) {
        console.error('Error loading log data:', e);
      }
    }
  }, [isOpen]);

  const handleRefresh = () => {
    try {
      const rawSugg = JSON.parse(localStorage.getItem('shadow_suggestions') || '[]');
      const rawApts = JSON.parse(localStorage.getItem('shadow_appointments') || '[]');
      const rawShouts = JSON.parse(localStorage.getItem('shadow_shout_outs_v3') || '[]');
      const rawMovements = JSON.parse(localStorage.getItem('shadow_user_movements') || '[]');

      setSuggestions(rawSugg);
      setAppointments(rawApts);
      setShoutouts(rawShouts);

      const dl = rawMovements.filter((l: any) => {
        const txt = (l.text || '').toLowerCase();
        return txt.includes('downloaded') || txt.includes('streamed') || txt.includes('download');
      });
      setDownloads(dl);

      const chg = rawMovements.filter((l: any) => {
        const txt = (l.text || '').toLowerCase();
        const isDl = txt.includes('downloaded') || txt.includes('streamed') || txt.includes('download');
        return !isDl && (l.type === 'action' || l.type === 'navigation' || txt.includes('console') || txt.includes('sync_update'));
      });
      setChanges(chg);
    } catch(e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop filter blur-md */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#0c0a1a] border border-purple-500/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] z-10 flex flex-col font-sans"
        >
          {/* Neon Border Glow Panel */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600 shadow-[0_1px_15px_#a855f7]" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-purple-950 bg-[#110e26] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-purple-900/40 p-2 rounded-lg border border-purple-500/30">
                <Settings className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-wider text-purple-200 uppercase font-mono">
                  Boss Logs & Update Core
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Real-time database updates & visitor activity telemetry
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg border border-purple-500/20 bg-purple-950/20 text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 transition-all cursor-pointer active:scale-95"
                title="Refresh Logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-purple-500/20 bg-purple-950/20 text-zinc-400 hover:bg-purple-900/30 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Master Tabs Controller */}
          <div className="border-b border-purple-950/80 bg-[#121029] p-2 overflow-x-auto flex gap-1 scrollbar-none shrink-0 select-none">
            {[
              { id: 'suggestions', label: 'Suggestions', count: suggestions.length, icon: Clipboard, color: 'text-purple-400 border-purple-500/20 bg-purple-950/25' },
              { id: 'appointments', label: 'Appointments', count: appointments.length, icon: Calendar, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/25' },
              { id: 'shoutouts', label: 'Shoutout Box', count: shoutouts.length, icon: MessageSquare, color: 'text-pink-400 border-pink-500/20 bg-pink-950/25' },
              { id: 'downloads', label: 'Archive Downloads', count: downloads.length, icon: Download, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/25' },
              { id: 'changes', label: 'Console Changes', count: changes.length, icon: Terminal, color: 'text-amber-400 border-amber-500/20 bg-amber-950/25' },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-purple-950/30'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-sans font-black ${
                    isActive ? 'bg-purple-500/35 text-purple-200' : 'bg-neutral-900 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main List Area Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#0a0815] space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3 min-h-full"
              >
                {activeSubTab === 'suggestions' && (
                  <>
                    {suggestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-center">
                        <Clipboard className="w-10 h-10 text-purple-500/40 mb-3" />
                        <p className="text-xs font-black text-purple-400/80 uppercase">Suggestions is currently empty</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Check back later once visitors submit ideas</p>
                      </div>
                    ) : (
                      suggestions.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-xl border border-purple-900/60 bg-[#110e25] flex flex-col gap-2 hover:border-purple-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-black tracking-wider uppercase bg-purple-900/30 text-purple-300 border border-purple-500/10">
                              {item.category || 'GENERAL'}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-sans leading-relaxed break-words bg-zinc-950/40 p-2.5 rounded-lg border border-purple-950/30">
                            {item.text}
                          </p>
                          {item.status && (
                            <div className="flex items-center gap-1.5 self-end">
                              <span className="text-[9px] text-zinc-500 font-mono">Status:</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${
                                item.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                                item.status === 'REJECTED' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                                'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}

                {activeSubTab === 'appointments' && (
                  <>
                    {appointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-center">
                        <Calendar className="w-10 h-10 text-cyan-500/40 mb-3" />
                        <p className="text-xs font-black text-cyan-400/80 uppercase">No active appointments</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Visitors haven't booked system services yet</p>
                      </div>
                    ) : (
                      appointments.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="p-4 rounded-xl border border-cyan-900/50 bg-[#0d1425] flex flex-col gap-3 hover:border-cyan-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-cyan-300">
                                {item.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/60 text-cyan-400 border border-cyan-900 font-mono uppercase font-bold">
                                {item.contact || 'No Email/Phone'}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {item.date}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-zinc-950/40 p-2 rounded border border-cyan-950/60">
                              <span className="text-cyan-500 text-[9px] block uppercase font-bold tracking-wider mb-0.5">CPU/GPU Specs:</span>
                              <span className="text-zinc-300 block overflow-x-auto truncate">{item.specs}</span>
                            </div>
                            <div className="bg-zinc-950/40 p-2 rounded border border-cyan-950/60">
                              <span className="text-cyan-500 text-[9px] block uppercase font-bold tracking-wider mb-0.5">Primary Issue:</span>
                              <span className="text-zinc-300 block overflow-x-auto truncate">{item.problem}</span>
                            </div>
                          </div>

                          {item.description && (
                            <div className="bg-zinc-950/30 p-2.5 rounded-lg border border-cyan-950/40 text-[11px] text-zinc-300 font-sans leading-relaxed">
                              <span className="text-cyan-400 text-[9px] font-mono block uppercase font-bold mb-1">Additional description:</span>
                              {item.description}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-cyan-950/55 text-[9px] font-mono">
                            <span className="text-zinc-500">ID: {item.id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-500">Status:</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                item.status === 'COMPLETED' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                                item.status === 'CANCELLED' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                                'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20'
                              }`}>
                                {item.status || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {activeSubTab === 'shoutouts' && (
                  <>
                    {shoutouts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-center">
                        <MessageSquare className="w-10 h-10 text-pink-500/40 mb-3" />
                        <p className="text-xs font-black text-pink-400/80 uppercase">Guestbook is currently silent</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Be the first to post a custom admin greeting</p>
                      </div>
                    ) : (
                      shoutouts.map((shout: any, idx: number) => (
                        <div
                          key={shout.id || idx}
                          className="p-3 rounded-xl border border-pink-900/50 bg-[#170a1e] flex flex-col gap-1.5 hover:border-pink-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-black text-pink-300">
                              {shout.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono bg-zinc-950/40 px-1.5 py-0.5 rounded">
                              {shout.time || shout.date || 'Lately'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 font-sans break-words bg-zinc-950/40 p-2.5 rounded border border-pink-950/30">
                            {shout.message}
                          </p>
                        </div>
                      ))
                    )}
                  </>
                )}

                {activeSubTab === 'downloads' && (
                  <>
                    {downloads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-center">
                        <Download className="w-10 h-10 text-emerald-500/40 mb-3" />
                        <p className="text-xs font-black text-emerald-400/80 uppercase">No Download Telemetry Captured</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Logs start accumulating when users download archives</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[50vh]">
                        {downloads.map((dl: any, idx: number) => (
                          <div
                            key={dl.id || idx}
                            className="p-2.5 rounded-lg border border-emerald-900/40 bg-[#071711] flex items-center justify-between gap-4 font-mono text-[11px]"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                              <span className="text-zinc-100 truncate">{dl.text || 'File downloaded'}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800">
                                {dl.user || 'Guest'}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {dl.date || 'n/a'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeSubTab === 'changes' && (
                  <>
                    {changes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 font-mono text-center">
                        <Terminal className="w-10 h-10 text-amber-500/40 mb-3" />
                        <p className="text-xs font-black text-amber-400/80 uppercase">No Admin Console Changes On-disk</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Actions in the secure dashboard will generate on-disk logs</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {changes.map((log: any, idx: number) => (
                          <div
                            key={log.id || idx}
                            className="p-2.5 rounded-lg border border-amber-950/40 bg-[#16120b] flex items-center justify-between gap-4 font-mono text-[11px]"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span className="text-zinc-200 truncate">{log.text || 'System Event'}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] text-amber-400 bg-amber-950/60 px-1 rounded border border-amber-900">
                                {log.user || 'Admin'}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {log.date || 'n/a'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 bg-[#0a0816] border-t border-purple-950 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Core: 4c46b102 | State: PERSISTENT</span>
            <span className="text-purple-400/80 animate-pulse">Boss Adrian Portal</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
