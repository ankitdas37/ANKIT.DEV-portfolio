import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Blog() {
  const navigate = useNavigate();
  const { blogPosts: allPosts } = useData();
  const blogPosts = allPosts.filter(p => !p.hidden && p.showOnHome).sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));

  if (!blogPosts || blogPosts.length === 0) return null;

  const featured = blogPosts[0];
  const recent = blogPosts.slice(1, 4);

  return (
    <section id="blog" className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-[#7C3AED] opacity-[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14 text-center sm:text-left"
        >
          <span className="section-label mb-3 mx-auto sm:mx-0" style={{ display: "flex", justifyContent: "center" }}>
            BLOG
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white">
            Thoughts &amp; <span className="gradient-text">Writings</span>
          </h2>
          <p className="mt-3 text-[#64748B] text-sm max-w-md mx-auto sm:mx-0">
            I write about what I learn — React, CSS, project breakdowns, and honest dev life stories.
          </p>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-5 gap-5 lg:gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* ── Featured post (left, large) ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(`/blog/${featured.slug}`)}
            className="w-[85vw] max-w-[340px] lg:max-w-none lg:w-auto shrink-0 snap-center lg:col-span-3 group relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.05)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.3)] transition-all duration-500 cursor-pointer overflow-hidden"
          >
            {/* Top highlight line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Cover Image or Emoji */}
            {featured.image ? (
              <div className="absolute inset-0">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,5,13,1)] via-[rgba(2,5,13,0.6)] to-[rgba(2,5,13,0.2)]" />
              </div>
            ) : (
              <div
                className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 blur-[90px] transition-opacity duration-700 pointer-events-none"
                style={{ background: featured.tagColor }}
              />
            )}

            <div className="p-8 sm:p-10 h-full flex flex-col relative z-10">
              {/* Top row */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md"
                  style={featured.image ? { color: "#fff", background: "rgba(255,255,255,0.15)" } : { color: featured.tagColor, background: `${featured.tagColor}20` }}
                >
                  {featured.tag}
                </span>
                {!featured.image && <span className="text-5xl">{featured.emoji}</span>}
              </div>

              <h3 className="text-2xl sm:text-3xl font-space font-bold text-white leading-snug mb-4 group-hover:text-[#A855F7] transition-colors">
                {featured.title}
              </h3>

              <p className="text-[#94A3B8] leading-relaxed mb-8 flex-1">
                {featured.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {featured.date || "Unknown"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {featured.readTime || "Unknown"}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#A855F7] group-hover:gap-3 transition-all">
                  Read post <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Recent posts (right, stacked) ────────────────── */}
          <div className="w-[85vw] max-w-[340px] lg:max-w-none lg:w-auto shrink-0 snap-center lg:col-span-2 flex flex-col gap-4">
            {recent.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group relative flex gap-4 p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.05)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(124,58,237,0.2)] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Ambient side glow */}
                {!post.image && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: post.tagColor }} />
                )}
                
                {/* Image or Emoji */}
                {post.image ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.05)]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${post.tagColor}18` }}
                  >
                    {post.emoji}
                  </div>
                )}

                <div className="min-w-0 flex flex-col justify-between">
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest mb-1 block"
                      style={{ color: post.tagColor }}
                    >
                      {post.tag}
                    </span>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#A855F7] transition-colors">
                      {post.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.date || "Unknown"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* View All Posts Button (Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16 flex justify-center px-4 sm:px-0"
        >
          <button
            onClick={() => navigate("/blog")}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-xl sm:rounded-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white font-bold text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl sm:rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <span className="relative z-10 tracking-wide">View All Posts</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
