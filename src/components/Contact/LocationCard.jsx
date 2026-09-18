import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function LocationCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="absolute top-0 sm:-top-8 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 glass bg-[rgba(7,17,31,0.8)] border border-[rgba(124,58,237,0.3)] rounded-2xl px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
    >
      <div className="w-8 h-8 rounded-full bg-[rgba(124,58,237,0.2)] flex items-center justify-center border border-[rgba(124,58,237,0.5)] relative">
        <MapPin className="w-4 h-4 text-[#A855F7]" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#07111F]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider">Based in</span>
        <span className="text-xs font-bold text-white flex items-center gap-1">India <span className="text-[10px]">🇮🇳</span></span>
      </div>
    </motion.div>
  );
}
