import { motion } from 'motion/react';
import { PHOTOS } from '../constants';
import { Camera, MapPin } from 'lucide-react';

export default function PhotosView() {
  return (
    <div className="h-full border-b border-neutral-900 grid grid-cols-2 lg:grid-cols-3 bg-neutral-950">
      {PHOTOS.map((photo, idx) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="border-r border-b border-neutral-900 relative group overflow-hidden bg-neutral-950"
        >
          <div className="aspect-square overflow-hidden bg-neutral-900">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105 opacity-80 hover:opacity-100"
            />
          </div>
          <div className="p-4 bg-neutral-900/45 border-t border-neutral-900 flex items-end justify-between transition-all duration-300 group-hover:bg-neutral-900 text-neutral-300">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-tighter font-black text-neutral-500 group-hover:text-purple-400 mb-1 transition-colors">
                <Camera size={10} />
                {photo.id.padStart(3, '0')}
              </div>
              <h4 className="font-black uppercase tracking-tighter text-sm text-neutral-100 group-hover:text-white">{photo.caption}</h4>
              <div className="flex items-center gap-1 text-[8px] font-mono mt-0.5 text-neutral-500 group-hover:text-neutral-400">
                <MapPin size={8} />
                {photo.location.toUpperCase()}
              </div>
            </div>
            <div className="font-mono text-[8px] font-bold border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 group-hover:border-purple-500/50 group-hover:text-purple-300 transition-colors">
              RAW
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
