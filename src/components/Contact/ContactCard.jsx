import { motion } from "framer-motion";

export default function ContactCard({ card, index }) {
  const Icon = card.icon;

  return (
    <motion.a
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
      href={card.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between glass bg-[rgba(7,17,31,0.6)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-x-2"
      style={{
        boxShadow: `0 0 0 rgba(0,0,0,0)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = card.color;
        e.currentTarget.style.boxShadow = `0 0 20px ${card.color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
        e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors border"
          style={{ 
            backgroundColor: `${card.color}15`,
            borderColor: `${card.color}30`
          }}
        >
          <Icon className="w-5 h-5" style={{ color: card.color }} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5">{card.label}</h4>
          <p className="text-xs text-[#94A3B8]">{card.value}</p>
        </div>
      </div>
      
      <div 
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
        style={{
          backgroundColor: `${card.color}10`,
          borderColor: `${card.color}30`,
          color: card.color
        }}
      >
        {card.action} <span>→</span>
      </div>
    </motion.a>
  );
}
