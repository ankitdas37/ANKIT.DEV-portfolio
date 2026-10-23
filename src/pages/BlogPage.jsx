import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight, Search, BookOpen, Share2, Sparkles, X, Tag } from "lucide-react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Helper to extract clean array of tags
const getPostTags = (p) => {
  if (!p) return [];
  if (Array.isArray(p.tags) && p.tags.length > 0) return p.tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof p.tag === "string" && p.tag.trim()) {
    return p.tag.split(",").map(t => t.trim()).filter(Boolean);
  }
  return [];
};

export default function BlogPage() {
  const { blogPosts: allPosts } = useData();
  const navigate = useNavigate();
  const blogPosts = allPosts.filter(p => !p.hidden);

  const ALL_TAGS = useMemo(() => {
    const set = new Set();
    blogPosts.forEach(p => {
      getPostTags(p).forEach(t => set.add(t));
    });
    return ["All", ...Array.from(set)];
  }, [blogPosts]);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = blogPosts.filter((p) => {
    const postTags = getPostTags(p);
    const matchTag = activeTag === "All" || postTags.some(t => t.toLowerCase() === activeTag.toLowerCase()) || (typeof p.tag === 'string' && p.tag.toLowerCase().includes(activeTag.toLowerCase()));
    const matchSearch =
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      postTags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  const handleShare = async (e, post) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/blog/${post.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Read this post: ${post.title}`,
          url: postUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(postUrl);
          toast.success("Link copied to clipboard!", { icon: '📋' });
        }
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard!", { icon: '📋' });
    }
  };

  return (
    <main className="min-h-screen pt-24 xs:pt-28 sm:pt-32 pb-28 sm:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">

      {/* Lightweight Ambient Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.06) 0%, transparent 45%)
          `,
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          {/* Cyber Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-transparent border border-violet-500/25 mb-3.5 sm:mb-4 text-[10px] xs:text-[11px] font-mono font-semibold tracking-wider text-[#A855F7] uppercase shadow-[0_0_15px_rgba(168,85,247,0.12)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>DEV JOURNAL &amp; ARTICLES</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-space font-extrabold text-white mb-3 sm:mb-4 tracking-tight leading-[1.18]">
            Thoughts &amp; <span className="bg-gradient-to-r from-[#00BFFF] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">Writings</span>
          </h1>

          <p className="text-xs xs:text-sm sm:text-base text-slate-400 max-w-md sm:max-w-xl mx-auto leading-relaxed px-2">
            Curated articles on modern frontend engineering, UI architecture, performance tricks, and honest dev-life breakdowns.
          </p>

          {/* Interactive Glass Telemetry Stats Strip */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4 max-w-xs xs:max-w-sm sm:max-w-md mx-auto mt-6 sm:mt-8">
            {[
              {
                label: "Articles",
                value: blogPosts.length,
                gradient: "from-[#00BFFF] to-[#38BDF8]",
              },
              {
                label: "Topics",
                value: Math.max(0, ALL_TAGS.length - 1),
                gradient: "from-[#A855F7] to-[#C084FC]",
              },
              {
                label: "Avg. Read",
                value: blogPosts.length > 0 ? "5 min" : "~5 min",
                gradient: "from-[#10B981] to-[#34D399]",
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileTap={{ scale: 0.95 }}
                className="group relative flex flex-col items-center justify-center py-2.5 xs:py-3.5 px-2 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] transition-all duration-300 backdrop-blur-md shadow-sm"
              >
                <p className={`text-xl xs:text-2xl sm:text-3xl font-space font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent tracking-tight`}>
                  {item.value}
                </p>
                <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Search + Filter bar ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-xl mx-auto"
        >
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search posts by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/[0.03] focus:ring-1 focus:ring-cyan-500/25 transition-all text-xs sm:text-sm shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tag filters (Swipeable on mobile) */}
          {ALL_TAGS.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {ALL_TAGS.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <motion.button
                    key={tag}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveTag(tag)}
                    className={`shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#00BFFF] to-[#7C3AED] text-white shadow-[0_0_15px_rgba(0,191,255,0.35)] border border-cyan-400/40 font-bold"
                        : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-slate-400 hover:text-white hover:border-[rgba(255,255,255,0.15)]"
                    }`}
                  >
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Posts Grid or Interactive Empty States ─────────── */}
        {filtered.length === 0 ? (
          blogPosts.length === 0 ? (
            /* State when no posts are published yet */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto py-10 px-5 sm:px-8 rounded-2xl sm:rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.05] via-slate-900/40 to-transparent backdrop-blur-xl text-center shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 text-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>

              <h2 className="text-lg xs:text-xl font-space font-extrabold text-white mb-2">
                Articles in the Pipeline
              </h2>
              <p className="text-xs xs:text-sm text-slate-400 leading-relaxed mb-6">
                Currently drafting deep-dive engineering case studies, React 19 benchmarks, and UI micro-interaction breakdowns.
              </p>

              {/* Upcoming Topics Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 mb-7">
                {[
                  "⚛️ React Internals",
                  "⚡ 60FPS UI Physics",
                  "🧠 AI & Vector Graphs",
                  "🛠️ Fullstack TypeScript",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Action */}
              <a
                href="https://github.com/ankitdas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs xs:text-sm font-bold text-white bg-gradient-to-r from-[#00BFFF] via-[#7C3AED] to-[#A855F7] hover:opacity-95 shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all active:scale-95"
              >
                <span>Follow on GitHub for Updates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ) : (
            /* State when search/filter has 0 matches */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-[#A855F7] flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-white font-space font-bold text-base mb-1">No articles matched</h3>
              <p className="text-slate-400 text-xs mb-5">
                No posts found for "{search || activeTag}". Try searching another keyword or reset filters.
              </p>
              <button
                onClick={() => { setSearch(""); setActiveTag("All"); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Reset Filters
              </button>
            </motion.div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group relative flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.04)] transition-all duration-300 cursor-pointer overflow-hidden shadow-sm"
              >
                {/* Inner top glow on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${post.tagColor || "#A855F7"}, transparent)` }}
                />

                <div className="p-4 xs:p-5 sm:p-6 flex flex-col flex-1">
                  {/* Emoji + tags */}
                  <div className="flex items-center justify-between mb-3.5 sm:mb-4 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getPostTags(post).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-current/20"
                          style={{ color: post.tagColor || "#A855F7", background: `${post.tagColor || "#A855F7"}15` }}
                        >
                          {t}
                        </span>
                      ))}
                      {getPostTags(post).length === 0 && (
                        <span
                          className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-current/20"
                          style={{ color: post.tagColor || "#A855F7", background: `${post.tagColor || "#A855F7"}15` }}
                        >
                          Article
                        </span>
                      )}
                    </div>
                    <span className="text-2xl sm:text-3xl shrink-0">{post.emoji || "📝"}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-space font-bold text-white leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1 mb-3 sm:mb-4">
                    {post.excerpt}
                  </p>

                  {/* Image container styled like Project Page */}
                  <div className="relative w-full aspect-video rounded-md sm:rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] mb-3 sm:mb-4 shadow-[0_5px_15px_rgba(0,0,0,0.5)] mt-auto bg-[#0A0F1E]">
                    {/* Glowing platform under image */}
                    <div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 blur-xl transition-all duration-500 opacity-50 group-hover:opacity-100"
                      style={{ backgroundColor: post.tagColor || '#7C3AED' }}
                    />
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#0c1427] via-[#090d1a] to-[#050811] ${post.image ? 'hidden' : 'flex'}`}>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 border text-xl"
                        style={{
                          backgroundColor: `${post.tagColor || '#7C3AED'}20`,
                          borderColor: `${post.tagColor || '#7C3AED'}40`
                        }}
                      >
                        {post.emoji ? <span>{post.emoji}</span> : <BookOpen className="w-5 h-5" style={{ color: post.tagColor || '#7C3AED' }} />}
                      </div>
                      <span className="text-white text-xs font-space font-bold line-clamp-1">{post.title}</span>
                      <span className="text-[10px] text-[#64748B] font-mono mt-0.5">Article Cover</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] via-transparent to-transparent opacity-60 pointer-events-none" />

                    {/* Tag overlay badges */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 sm:gap-1.5">
                      {getPostTags(post).slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-[rgba(0,0,0,0.65)] backdrop-blur-md rounded border border-[rgba(255,255,255,0.12)] text-[0.55rem] sm:text-[0.6rem] font-medium text-white flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: post.tagColor || '#00BFFF' }} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {post.date || "Recent"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {post.readTime || "5 min"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleShare(e, post)} 
                        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 active:scale-90"
                        title="Share Post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="flex items-center gap-1 text-[11px] font-bold"
                        style={{ color: post.tagColor || "#00BFFF" }}
                      >
                        Read <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* ── Coming soon banner (shown when posts exist) ────── */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 sm:mt-16 rounded-2xl border border-dashed border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.04)] p-6 sm:p-8 text-center"
          >
            <p className="text-2xl mb-2">✍️</p>
            <h3 className="text-white font-space font-bold text-base sm:text-lg mb-1">More posts coming soon</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              I publish new articles regularly. Follow me on{" "}
              <a
                href="https://github.com/ankitdas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A855F7] hover:underline font-semibold"
              >
                GitHub
              </a>{" "}
              to stay updated.
            </p>
          </motion.div>
        )}

      </div>
    </main>
  );
}
