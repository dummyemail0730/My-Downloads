import { motion } from 'motion/react';
import { TRACKS } from '../constants';
import { Play } from 'lucide-react';

export default function MusicView() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-black p-4 bg-black text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center text-black">
            <Play size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">AI MUSIC</h3>
            <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Sonic explorations archive</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-2xl font-mono font-bold tracking-tighter">{TRACKS.length.toString().padStart(2, '0')}</span>
          <p className="text-[8px] uppercase font-black opacity-40">Records</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {TRACKS.map((track, idx) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-4 hover:bg-black hover:text-white transition-all group border-b border-black cursor-pointer bg-white"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                #{(idx + 1).toString().padStart(3, '0')}
              </span>
              <div>
                <div className="font-black uppercase tracking-tight text-md leading-none mb-1">{track.title}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-50 group-hover:opacity-80">
                  {track.artist} // {track.genre}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-[10px] font-bold uppercase tracking-tighter">
              <div className="px-2 py-0.5 border border-black group-hover:border-white transition-colors">
                {track.duration}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
