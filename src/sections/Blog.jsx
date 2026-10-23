import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, BookOpen, Sparkles, Tag, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

// Helper to extract clean array of tags
const getPostTags = (p) => {
  if (!p) return [];
  if (Array.isArray(p.tags) && p.tags.length > 0) return p.tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof p.tag === "string" && p.tag.trim()) {
    return p.tag.split(",").map(t => t.trim()).filter(Boolean);
  }
  return [];
};

// ── Spotlight Hero Card (Ideal for single post or top featured guide) ──
function SpotlightCard({ post, navigate, priority = false }) {
  const tags = getPostTags(post);
  const tagColor = post.tagColor || "#00BFFF";
  const authorName = (typeof post.author === "object" && post.author?.name)
    ? post.author.name
    : (typeof post.author === "string" && post.author ? post.author : "Ankit Das");
  const authorAvatar = (typeof post.author === "object" && post.author?.avatar)
    ? post.author.avatar
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/blog/${post.slug || post.id}`)}
      className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.14] via-white/[0.04] to-transparent hover:from-cyan-500/50 hover:via-purple-500/35 hover:to-transparent transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-[0_20px_50px_rgba(0,191,255,0.18)]"
    >
      <div className="rounded-[23px] bg-[#070D1E]/95 backdrop-blur-xl border border-white/[0.06] p-5 sm:p-7 lg:p-8 overflow-hidden relative">
        {/* Ambient decorative blur */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-15 group-hover:opacity-35 blur-[90px] transition-opacity duration-700 pointer-events-none"
          style={{ background: tagColor }}
        />

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Media Container: Cleanly separated frame so text NEVER overlaps the image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#02050D] shadow-inner group-hover:border-cyan-500/30 transition-colors duration-500">
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading={priority ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-cyan-950/40 p-6 text-center">
                  <span className="text-5xl sm:text-6xl mb-3 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {post.emoji || "📝"}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    {post.tag || "Engineering Guide"}
                  </span>
                </div>
              )}

              {/* Floating badges on image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md bg-black/70 border border-white/15 text-white shadow-lg flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: tagColor }} />
                  {post.tag || "Article"}
                </span>
              </div>

              {post.readTime && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono backdrop-blur-md bg-black/70 border border-white/15 text-slate-300 shadow-lg flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-xs font-semibold text-white/90 font-mono flex items-center gap-1.5">
                  Click to open guide <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Text & Content Container */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              {/* Meta Row: Date & Featured badge */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2.5 font-mono">
                {post.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{post.date}</span>
                  </span>
                )}
                {post.date && <span className="text-slate-600">•</span>}
                <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-semibold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured Read</span>
                </span>
              </div>

              {/* Title with multi-stop hover gradient */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-space font-extrabold text-white leading-snug group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300 tracking-tight">
                {post.title}
              </h3>

              {/* Excerpt with line clamping to keep card clean and readable */}
              {post.excerpt && (
                <p className="mt-3 text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 font-normal">
                  {post.excerpt}
                </p>
              )}

              {/* Tag Pills */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {tags.slice(0, 4).map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-400 group-hover:border-cyan-500/20 group-hover:text-slate-300 transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Row: Author info & Action CTA */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              {/* Author pill */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-[#7C3AED] shrink-0">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#070b16] flex items-center justify-center font-bold text-white text-[11px] font-space">
                      {authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{authorName}</p>
                  <p className="text-[10px] font-mono text-slate-400">Full Stack Engineer</p>
                </div>
              </div>

              {/* CTA Action Button */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Standard Grid Card (Used when multiple articles exist) ──
function GridCard({ post, navigate, index = 0 }) {
  const tagColor = post.tagColor || "#00BFFF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      onClick={() => navigate(`/blog/${post.slug || post.id}`)}
      className="group relative flex flex-col justify-between rounded-2xl p-[1px] bg-gradient-to-b from-white/[0.1] via-white/[0.03] to-transparent hover:from-purple-500/40 hover:via-cyan-500/30 hover:to-transparent transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_15px_35px_rgba(168,85,247,0.15)] overflow-hidden"
    >
      <div className="rounded-[15px] bg-[#070D1E]/95 backdrop-blur-xl border border-white/[0.05] p-5 sm:p-6 flex flex-col h-full justify-between">
        <div>
          {/* Media Header Container */}
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/[0.08] bg-[#02050D] mb-4">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-cyan-950/40">
                <span className="text-4xl">{post.emoji || "📝"}</span>
              </div>
            )}
            {/* Tag badge on image */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md bg-black/70 border border-white/15 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor }} />
                {post.tag || "Article"}
              </span>
            </div>
            {post.readTime && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono backdrop-blur-md bg-black/70 border border-white/15 text-slate-300 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{post.readTime}</span>
                </span>
              </div>
            )}
          </div>

          {/* Meta Date */}
          {post.date && (
            <p className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span>{post.date}</span>
            </p>
          )}

          {/* Title */}
          <h4 className="text-base sm:text-lg font-space font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-2">
            {post.title}
          </h4>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Read link footer */}
        <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-purple-300 transition-colors">
          <span>Read Article</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Blog Section Component ──
export default function Blog() {
  const navigate = useNavigate();
  const { blogPosts: allPosts } = useData();
  const blogPosts = (allPosts || [])
    .filter(p => !p.hidden && p.showOnHome)
    .sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0));

  if (!blogPosts || blogPosts.length === 0) return null;

  const isSingle = blogPosts.length === 1;
  const isDouble = blogPosts.length === 2;
  const featured = blogPosts[0];
  const remaining = blogPosts.slice(1, 4);

  return (
    <section id="blog" className="relative py-12 md:py-24 bg-[#02050D] overflow-hidden section-contain">
      {/* Ambient background glow orbs */}
      <div 
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(0, 191, 255, 0.35) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12"
        >
          <div>
            {/* Cyber Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-violet-500/15 via-cyan-500/15 to-transparent border border-violet-500/30 text-[10px] xs:text-[11px] font-mono font-bold tracking-wider text-[#A855F7] uppercase mb-3 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span>DEV JOURNAL &amp; WRITINGS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-space font-extrabold text-white tracking-tight">
              Thoughts &amp; <span className="bg-gradient-to-r from-[#00BFFF] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">Writings</span>
            </h2>
            <p className="mt-2.5 text-slate-400 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
              Curated technical articles on full-stack engineering, cloud architecture, and real-world system optimization.
            </p>
          </div>

          {/* Desktop Direct Link to All Articles */}
          <button
            onClick={() => navigate("/blog")}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-400/40 hover:text-white transition-all duration-300 shrink-0 group shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Explore All Articles</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 group-hover:text-cyan-300">
              {(allPosts || []).filter(p => !p.hidden).length}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 text-cyan-400 transition-transform" />
          </button>
        </motion.div>

        {/* ── Responsive Dynamic Post Layout ── */}
        {isSingle ? (
          /* Single Featured Post: Centered wide luxury spotlight card */
          <div className="max-w-5xl mx-auto">
            <SpotlightCard post={featured} navigate={navigate} priority={true} />
          </div>
        ) : isDouble ? (
          /* Two Posts: Balanced 2-column grid */
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <GridCard post={blogPosts[0]} navigate={navigate} index={0} />
            <GridCard post={blogPosts[1]} navigate={navigate} index={1} />
          </div>
        ) : (
          /* 3+ Posts: Full Spotlight card on top + grid of remaining posts */
          <div className="space-y-8">
            <div className="max-w-5xl mx-auto">
              <SpotlightCard post={featured} navigate={navigate} priority={true} />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {remaining.map((p, idx) => (
                <GridCard key={p.id || idx} post={p} navigate={navigate} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom CTA Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 flex justify-center"
        >
          <button
            onClick={() => navigate("/blog")}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00BFFF] via-[#7C3AED] to-[#A855F7] text-white font-space font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:shadow-[0_0_40px_rgba(0,191,255,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="tracking-wide">Explore All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
