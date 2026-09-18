import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { useData } from "../context/DataContext";

const PLATFORM_COLORS = {
  LinkedIn: "#0A66C2",
  Direct:   "#10B981",
  College:  "#8B5CF6",
};

function StarRow({ count = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { testimonials: allTestimonials } = useData();
  const testimonials = allTestimonials.filter(t => t.verified && !t.hidden);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  /* ── Auto-advance every 5 s ───────────────────────────── */
  useEffect(() => {
    if (paused || !testimonials || testimonials.length === 0) return;
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, active, testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const go = (dir) => {
    setPaused(true);
    setActive((a) => (a + dir + testimonials.length) % testimonials.length);
    setTimeout(() => setPaused(false), 8000);
  };

  const t = testimonials[active] || testimonials[0];
  if (!t) return null;

  return (
    <section
      className="relative py-10 md:py-20 bg-[#050B16] overflow-hidden"
      aria-label="Testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#7C3AED] opacity-[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#2563EB] opacity-[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label mb-3 mx-auto" style={{ justifyContent: "center" }}>
            TESTIMONIALS
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white">
            What Others <span className="gradient-text">Say</span>
          </h2>
          <p className="mt-4 text-[#64748B] text-sm tracking-wide">
            Real words from real people I've worked with
          </p>
        </motion.div>

        {/* ── Main featured card ────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative rounded-2xl border border-[rgba(124,58,237,0.25)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm p-8 sm:p-10 overflow-hidden"
              role="article"
            >
              {/* Inner glow corner */}
              <div
                className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-10 blur-[60px] pointer-events-none"
                style={{ background: PLATFORM_COLORS[t.platform] ?? "#7C3AED" }}
              />

              {/* Top row: stars + platform badge */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <StarRow count={t.stars} />
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border"
                  style={{
                    color: PLATFORM_COLORS[t.platform] ?? "#7C3AED",
                    borderColor: `${PLATFORM_COLORS[t.platform] ?? "#7C3AED"}44`,
                    background: `${PLATFORM_COLORS[t.platform] ?? "#7C3AED"}11`,
                  }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified · {t.platform}
                </span>
              </div>

              {/* Animated quote icon */}
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 0.5 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-5"
              >
                <Quote className="w-9 h-9 text-[#7C3AED]" />
              </motion.div>

              {/* Quote text */}
              <blockquote className="text-lg sm:text-xl text-[#CBD5E1] leading-relaxed mb-8 italic">
                "{t.quote}"
              </blockquote>

              {/* Author row */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center font-space font-bold text-sm text-white flex-shrink-0 ring-2 ring-white/10`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-space font-bold text-white flex items-center gap-1.5">
                    {t.name}
                    <BadgeCheck className="w-4 h-4 text-[#2563EB]" />
                  </p>
                  <p className="text-sm text-[#64748B]">{t.role}</p>
                  <p className="text-xs text-[#475569] mt-0.5">{t.relation} · {t.date}</p>
                </div>
              </div>

              {/* Progress bar */}
              {!paused && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-[rgba(124,58,237,0.15)] w-full">
                  <motion.div
                    key={active}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Controls ──────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.08)] transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPaused(true); setActive(i); setTimeout(() => setPaused(false), 8000); }}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-7 h-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
                      : "w-2 h-2 bg-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.6)]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.08)] transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Mini preview cards ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {testimonials.map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => { setPaused(true); setActive(i); setTimeout(() => setPaused(false), 8000); }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`text-left rounded-xl p-4 border transition-all duration-300 cursor-pointer ${
                i === active
                  ? "border-[rgba(124,58,237,0.5)] bg-[rgba(124,58,237,0.08)]"
                  : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.04)]"
              }`}
              aria-pressed={i === active}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              <p className="text-xs text-[#94A3B8] line-clamp-2 mb-3 italic leading-relaxed">
                "{t.quote.substring(0, 80)}…"
              </p>

              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                  <p className="text-[10px] text-[#64748B] truncate">{t.role}</p>
                </div>
                <span
                  className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    color: PLATFORM_COLORS[t.platform] ?? "#7C3AED",
                    background: `${PLATFORM_COLORS[t.platform] ?? "#7C3AED"}18`,
                  }}
                >
                  {t.platform}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
