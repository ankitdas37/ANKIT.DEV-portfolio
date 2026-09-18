import { useMemo } from "react";
import { motion } from "framer-motion";
import { useData } from "../context/DataContext";

export default function StatsBar() {
  const { projects, infoItems } = useData();

  /* Patch the "Projects" info item with live visible count */
  const liveInfoItems = useMemo(() => {
    const visibleCount = projects.filter(p => !p.hidden).length;
    return (infoItems || [])
      .filter(item => !item.hidden)
      .map(item =>
        item.title === "Projects"
          ? { ...item, value: `${visibleCount}+` }
          : item
      );
  }, [projects, infoItems]);

  return (
    <section
      className="relative pt-2 pb-6 md:py-6 bg-transparent z-20 -mt-4 md:-mt-8"
      aria-label="Quick information"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl overflow-hidden border border-[rgba(37,99,235,0.2)] shadow-[0_0_40px_rgba(37,99,235,0.08)] relative"
        >
          {/* Top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-60 z-10" />

          {/* Grid layout: 2 columns on mobile (last item spans 2), 5 cols on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-[1px] bg-[rgba(37,99,235,0.15)] relative z-0">
            {liveInfoItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center justify-center gap-2.5 py-7 px-4 bg-[rgba(7,17,31,0.95)] hover:bg-[rgba(15,28,52,0.95)] transition-colors duration-300 ${
                  index === liveInfoItems.length - 1 && liveInfoItems.length % 2 !== 0 
                    ? "col-span-2 md:col-span-1" 
                    : ""
                }`}
              >
                <motion.span
                  className="text-3xl sm:text-2xl mb-1 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 3,
                    delay: index * 0.5,
                    repeat: Infinity,
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </motion.span>
                <p className="text-[10px] sm:text-xs font-mono font-bold text-[#00BFFF] uppercase tracking-[0.2em] text-center">
                  {item.title}
                </p>
                <motion.p
                  key={item.value}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm sm:text-base font-space font-bold text-white text-center leading-tight"
                >
                  {item.value}
                </motion.p>
                <p className="text-[10px] sm:text-xs text-[#94A3B8] text-center leading-relaxed">
                  {item.sub}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-40 z-10" />
        </motion.div>
      </div>
    </section>
  );
}


