import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../context/DataContext";

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { skills } = useData();

  // Filter out hidden skills
  const visibleSkills = (skills || []).filter(s => !s.hidden);

  // Derive categories dynamically from skills
  const categoriesSet = new Set();
  visibleSkills.forEach(s => {
    if (Array.isArray(s.categories)) {
      s.categories.forEach(c => categoriesSet.add(c));
    }
  });
  
  const skillCategories = Array.from(categoriesSet).map(c => ({
    id: c.toLowerCase().replace(/\s+/g, '-'),
    label: c,
    count: visibleSkills.filter(s => (s.categories || []).includes(c)).length
  }));

  const displaySkills =
    activeCategory === "all"
      ? visibleSkills
      : visibleSkills.filter(s => (s.categories || []).map(c => c.toLowerCase().replace(/\s+/g, '-')).includes(activeCategory));

  return (
    <section
      id="skills"
      className="relative py-10 md:py-20 bg-[#050B16] overflow-hidden"
      aria-label="Skills"
    >
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#2563EB] opacity-[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span
            className="section-label mb-3 mx-auto"
            style={{ justifyContent: "center" }}
          >
            MY SKILLS
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white mt-2">
            Technologies I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-[#94A3B8] mt-4 max-w-xl mx-auto">
            A curated collection of technologies and tools I use to build modern
            digital experiences.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          aria-label="Skill categories"
        >
          <button
            className={`skill-tab ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
            role="tab"
            aria-selected={activeCategory === "all"}
            id="tab-all"
          >
            All
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              className={`skill-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
              role="tab"
              aria-selected={activeCategory === cat.id}
              id={`tab-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {displaySkills.map((skill, i) => (
              <motion.div
                key={skill.id || skill.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group relative glass rounded-xl p-4 flex flex-col items-center gap-3 border border-[rgba(37,99,235,0.15)] hover:border-[rgba(37,99,235,0.5)] cursor-default card-hover"
                style={{
                  background: "rgba(7,17,31,0.8)",
                }}
                whileHover={{
                  boxShadow: `0 0 20px ${skill.color}33, 0 8px 30px rgba(0,0,0,0.3)`,
                }}
                role="listitem"
                aria-label={skill.name}
              >
                {/* Icon */}
                <div
                  className="text-3xl group-hover:scale-110 transition-transform duration-300 h-10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {skill.icon && skill.icon.startsWith('http') ? <img src={skill.icon} alt={skill.name} className="w-10 h-10 object-contain" /> : skill.icon}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-[#CBD5E1] group-hover:text-white transition-colors text-center">
                  {skill.name}
                </span>

                {/* Skill bar */}
                <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #2563EB, ${skill.color})`,
                    }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                </div>

                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${skill.color}0A 0%, transparent 70%)`,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Categories breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {skillCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="glass-light rounded-xl p-4 text-center border border-[rgba(37,99,235,0.1)] hover:border-[rgba(37,99,235,0.4)] transition-all group"
            >
              <p className="text-2xl font-space font-bold gradient-text">
                {cat.count}
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">{cat.label}</p>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
