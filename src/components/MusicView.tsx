import { motion } from 'motion/react';
import { TRACKS } from '../constants';
import { Play } from 'lucide-react';
import shadowMusicBg from '../assets/images/shadow_moon_rain_1779250676888.png';

export default function MusicView() {
  return (
    <div className="h-full flex flex-col bg-neutral-950 relative overflow-hidden">
      {/* Anime Theme Ambient Background Watermark */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none">
        <img 
          src={shadowMusicBg} 
          alt="" 
          className="w-full h-full object-cover object-center scale-105 filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="border-b border-neutral-900 p-4 bg-neutral-950/85 backdrop-blur-md text-white flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-purple-400">
            <Play size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">AI MUSIC</h3>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Sonic explorations archive</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-2xl font-mono font-bold tracking-tighter text-purple-405 text-white">{TRACKS.length.toString().padStart(2, '0')}</span>
          <p className="text-[8px] uppercase font-black text-neutral-500">Records</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar bg-transparent relative z-10">
        {TRACKS.map((track, idx) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-4 hover:bg-purple-950/20 transition-all duration-300 group border-b border-neutral-900/60 cursor-pointer bg-neutral-950/45 backdrop-blur-sm text-neutral-300"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] font-bold text-neutral-600 group-hover:text-purple-400 transition-colors">
                #{(idx + 1).toString().padStart(3, '0')}
              </span>
              <div>
                <div className="font-black uppercase tracking-tight text-md leading-none mb-1 text-neutral-100 group-hover:text-white">{track.title}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 group-hover:text-neutral-400">
                  {track.artist} // {track.genre}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px] font-bold uppercase tracking-tighter">
              <div className="px-2 py-0.5 border border-neutral-800 text-neutral-400 group-hover:border-purple-500/50 group-hover:text-purple-300 rounded transition-colors bg-black/20">
                {track.duration}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
