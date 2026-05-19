import { motion } from 'motion/react';
import { PHOTOS } from '../constants';
import { Camera, MapPin } from 'lucide-react';

export default function ISOView() {
  return (
    <div className="h-full border-b border-black grid grid-cols-2 lg:grid-cols-3">
      {PHOTOS.map((photo, idx) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="border-r border-b border-black relative group overflow-hidden bg-white"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
            />
          </div>
          <div className="p-4 bg-white border-t border-black flex items-end justify-between transition-colors group-hover:bg-black group-hover:text-white">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-tighter font-black opacity-30 group-hover:opacity-100 mb-1">
                <Camera size={10} />
                {photo.id.padStart(3, '0')}
              </div>
              <h4 className="font-black uppercase tracking-tighter text-sm">{photo.caption}</h4>
              <div className="flex items-center gap-1 text-[8px] font-mono mt-0.5 opacity-50 group-hover:opacity-80">
                <MapPin size={8} />
                {photo.location.toUpperCase()}
              </div>
            </div>
            <div className="font-mono text-[8px] font-bold border border-black px-1.5 py-0.5 group-hover:border-white">
              RAW
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
