import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export default function QuoteCard() {
  return (
    <div className="glass bg-[rgba(7,17,31,0.5)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
      <div className="text-6xl font-serif text-[#7C3AED] leading-none opacity-50 relative top-2">"</div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-white sm:text-lg font-medium mb-2">Great things in business are never done by one person. They're done by a team of people.</p>
        <p className="text-[#A855F7] text-xs sm:text-sm font-mono">- Steve Jobs</p>
      </div>
      
      {/* Decorative Mail graphic */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 hidden md:block">
        <div className="flex items-center gap-4">
          <Send className="w-6 h-6 text-[#2563EB]" />
          <div className="w-16 border-t-2 border-dashed border-[#2563EB]" />
          <Mail className="w-10 h-10 text-[#7C3AED]" />
        </div>
      </div>
    </div>
  );
}
