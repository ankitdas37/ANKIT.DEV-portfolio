import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight, Search, BookOpen, Share2 } from "lucide-react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function BlogPage() {
  const { blogPosts: allPosts } = useData();
  const navigate = useNavigate();
  const blogPosts = allPosts.filter(p => !p.hidden);
  const ALL_TAGS = ["All", ...Array.from(new Set(blogPosts.map((p) => p.tag)))];
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = blogPosts.filter((p) => {
    const matchTag = activeTag === "All" || p.tag === activeTag;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
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
    <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative">

      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#7C3AED] opacity-[0.04] blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label mb-4 mx-auto" style={{ justifyContent: "center" }}>
            BLOG
          </span>
          <h1 className="text-5xl sm:text-6xl font-space font-bold text-white mb-4">
            Thoughts &amp; <span className="gradient-text">Writings</span>
          </h1>
          <p className="text-[#64748B] max-w-xl mx-auto leading-relaxed">
            I write about what I learn — React, CSS tricks, honest project breakdowns,
            and real dev-life stories. No fluff, just value.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { label: "Posts", value: blogPosts.length },
              { label: "Topics", value: ALL_TAGS.length - 1 },
              { label: "Avg. Read", value: "6 min" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-space font-bold gradient-text">{value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Search + Filter bar ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] focus:bg-[rgba(168,85,247,0.05)] transition-all text-sm"
            />
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTag === tag
                    ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-white hover:border-[rgba(168,85,247,0.3)]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Posts Grid ─────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-[#475569]"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No posts found</p>
            <p className="text-sm mt-1">Try a different search or tag</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group relative flex flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.04)] transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Inner top glow on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${post.tagColor}, transparent)` }}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Emoji + tag */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ color: post.tagColor, background: `${post.tagColor}1A` }}
                    >
                      {post.tag}
                    </span>
                    <span className="text-3xl">{post.emoji}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-space font-bold text-white leading-snug mb-3 group-hover:text-[#A855F7] transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 flex-1 mb-6">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center gap-3 text-[10px] text-[#475569]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleShare(e, post)} 
                        className="text-[#64748B] hover:text-white transition-colors p-1"
                        title="Share Post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="flex items-center gap-1 text-[10px] font-bold transition-opacity duration-300"
                        style={{ color: post.tagColor }}
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

        {/* ── Coming soon banner ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 rounded-2xl border border-dashed border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.04)] p-8 text-center"
        >
          <p className="text-2xl mb-2">✍️</p>
          <h3 className="text-white font-space font-bold text-lg mb-1">More posts coming soon</h3>
          <p className="text-[#64748B] text-sm">
            I publish new articles regularly. Follow me on{" "}
            <a
              href="https://github.com/ankitdas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A855F7] hover:underline"
            >
              GitHub
            </a>{" "}
            to stay updated.
          </p>
        </motion.div>

      </div>
    </main>
  );
}
