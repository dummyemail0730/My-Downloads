import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Filter, ExternalLink, ChevronDown, ChevronUp, Globe, Info, AlertTriangle, Play, Download, BookOpen, MessageSquare, ShieldCheck } from 'lucide-react';
import { MOE_CATEGORIES, MoeSite, MoeCategory } from '../data/everythingMoe';

interface MoePortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoePortal({ isOpen, onClose }: MoePortalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('anime_streaming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('Any');
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);

  // Get active category
  const activeCategory = useMemo(() => {
    return MOE_CATEGORIES.find(c => c.id === activeCategoryId) || MOE_CATEGORIES[0];
  }, [activeCategoryId]);

  // Extract all unique tags in the active category for the filter dropdown
  const allCategoryTags = useMemo(() => {
    const tagsSet = new Set<string>();
    activeCategory.sites.forEach(site => {
      site.tags.forEach(tag => tagsSet.add(tag));
    });
    return ['Any', ...Array.from(tagsSet)];
  }, [activeCategory]);

  // Filter sites based on search query and tag filter
  const filteredSites = useMemo(() => {
    return activeCategory.sites.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = tagFilter === 'Any' || site.tags.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [activeCategory, searchQuery, tagFilter]);

  // Handle category change (reset query and filters)
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setSearchQuery('');
    setTagFilter('Any');
    setExpandedSiteId(null);
  };

  if (!isOpen) return null;

  // Icon mapping for categories to render alongside tabs
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'anime_streaming': return <Play size={14} className="text-purple-400 shrink-0" />;
      case 'download': return <Download size={14} className="text-pink-400 shrink-0" />;
      case 'manga': return <BookOpen size={14} className="text-fuchsia-400 shrink-0" />;
      case 'light_novels': return <BookOpen size={14} className="text-indigo-400 shrink-0" />;
      case 'community': return <MessageSquare size={14} className="text-teal-400 shrink-0" />;
      case 'torrents': return <Globe size={14} className="text-emerald-400 shrink-0" />;
      default: return <Globe size={14} className="text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 font-sans select-none overflow-hidden">
      {/* Dark Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-md z-10"
      />

      {/* Main Portal UI Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative w-full max-w-4xl h-[90vh] sm:h-[85vh] bg-[#0c0c12]/95 border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.25),0_0_20px_rgba(0,0,0,0.8)] flex flex-col z-20 font-sans"
      >
        {/* Decorative Neon top strip */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 shadow-[0_1px_10px_rgba(168,85,247,0.5)]" />

        {/* Header section */}
        <header className="px-6 py-5 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Globe size={18} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-md sm:text-lg font-black uppercase tracking-wider text-white leading-tight">Universal Portal</h2>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">Index & Directory Aggregator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-purple-500/50 transition-all cursor-pointer shadow-md"
            title="Close Portal"
          >
            <X size={16} />
          </button>
        </header>

        {/* Tab Selection Row (Horizontal Scrollable) */}
        <div className="px-4 py-2 border-b border-neutral-900 bg-[#09090e] shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
          {MOE_CATEGORIES.map(category => {
            const isActive = category.id === activeCategoryId;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all shrink-0 flex items-center gap-2 cursor-pointer
                  ${isActive
                    ? 'bg-purple-950/40 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800/80 hover:text-white hover:border-neutral-700'
                  }
                `}
              >
                {getCategoryIcon(category.id)}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Notice alert section */}
        {activeCategory.notice && (
          <div className="px-6 py-2 bg-purple-950/15 border-b border-purple-500/10 flex items-center gap-2.5 text-[11px] text-purple-300 font-mono select-none">
            <Info size={12} className="text-purple-400 shrink-0" />
            <span className="truncate uppercase tracking-wider">{activeCategory.notice}</span>
          </div>
        )}

        {/* Filter controls row */}
        <div className="px-6 py-3 border-b border-neutral-900 bg-neutral-950/40 flex flex-col sm:flex-row gap-3 items-center shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder={`Search ${activeCategory.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#07070b] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/60 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tag filter dropdown */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter size={13} className="text-neutral-500" />
            <select
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="h-9 px-3 bg-[#07070b] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/60 transition-all cursor-pointer font-mono"
            >
              {allCategoryTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sites List Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#08080c]/50 no-scrollbar space-y-3">
          {filteredSites.length > 0 ? (
            filteredSites.map((site, index) => {
              const isExpanded = expandedSiteId === site.id;
              // Generate dynamic starting initials for neat visual representation
              const initials = site.name.slice(0, 2).toUpperCase();
              
              return (
                <div
                  key={site.id}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden
                    ${isExpanded
                      ? 'bg-purple-950/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/80 hover:border-neutral-700/80'
                    }
                  `}
                >
                  {/* Top Header Row (Clickable to Toggle Expand) */}
                  <div
                    onClick={() => setExpandedSiteId(isExpanded ? null : site.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Left Numeric index */}
                      <span className="font-mono text-xs font-bold text-neutral-500 w-5">
                        {index + 1}.
                      </span>

                      {/* Site Avatar / Logo Icon Placeholder with dynamic subtle color gradients */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0 select-none shadow-inner">
                        {initials}
                      </div>

                      {/* Site Title and Tag Pills */}
                      <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2.5">
                        <h4 className="text-sm font-black text-white truncate leading-tight tracking-wide">{site.name}</h4>
                        {/* Dynamic tags inside pills */}
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                          {site.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-neutral-950/70 border border-purple-500/25 rounded text-[8px] font-bold font-mono tracking-wider text-purple-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expand Trigger Icon */}
                    <div className="text-neutral-500 hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded Content View (No URL shown in plain text!) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className="px-12 pb-4 pt-1 border-t border-neutral-900/50 text-xs text-neutral-400 leading-relaxed font-mono space-y-4">
                          <p>{site.description}</p>
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-900 select-none">
                            <div className="flex items-center gap-4">
                              {site.rating && (
                                <div>
                                  <span className="text-[9px] uppercase text-neutral-500 block leading-none">RATING</span>
                                  <span className="text-xs font-black text-purple-400 mt-1 block">{site.rating} / 10</span>
                                </div>
                              )}
                              <div>
                                <span className="text-[9px] uppercase text-neutral-500 block leading-none">STATUS</span>
                                <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  ONLINE
                                </span>
                              </div>
                            </div>

                            {/* Secure Visit Button - DOES NOT show the site URL in plain text */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(site.url, '_blank', 'noopener,noreferrer');
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase text-[10px] tracking-widest rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                            >
                              <span>LAUNCH PORTAL</span>
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-neutral-500 font-mono text-xs select-none space-y-2">
              <AlertTriangle size={24} className="mx-auto text-purple-400 opacity-60" />
              <p className="uppercase tracking-wider">No indexes match your criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setTagFilter('Any'); }}
                className="text-purple-400 underline cursor-pointer hover:text-purple-300 transition-colors uppercase text-[10px]"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Status bar */}
        <footer className="px-6 py-3 border-t border-neutral-900 bg-[#09090e] flex items-center justify-between text-[10px] font-mono text-neutral-500 select-none shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-purple-400" />
            <span className="uppercase">ENCRYPTED CONNECTIVE ROUTING ACTIVE</span>
          </div>
          <div>
            <span>TOTAL INDEXED: {MOE_CATEGORIES.reduce((acc, cat) => acc + cat.sites.length, 0)}</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
