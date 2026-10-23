import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Calendar, Tag, Share2,
  Link2, BookOpen, ChevronRight, Copy, Check,
  Heart, ThumbsUp, Sparkles, AlertCircle, Info,
  Lightbulb, ArrowUp, Bookmark, MessageSquare,
  ExternalLink
} from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "../components/SocialIcons";
import { useData } from "../context/DataContext";
import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";

/* ── Interactive Mac-Style Code Block with Copy ──────────────────── */
function CodeBlock({ codeText, lang, anchorId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    toast.success("Code copied to clipboard!", { icon: "📋" });
    setTimeout(() => setCopied(false), 2200);
  };

  const detectedLang = (lang || "code").toLowerCase();

  return (
    <div id={anchorId} className="group/code my-7 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#070b16] shadow-[0_15px_40px_rgba(0,0,0,0.55)]">
      {/* Mac Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block" />
          <span className="ml-3 font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {detectedLang}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all active:scale-95"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Content */}
      <div className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm font-mono leading-relaxed text-slate-200">
        <pre className="whitespace-pre">
          <code>{codeText}</code>
        </pre>
      </div>
    </div>
  );
}

/* ── Smart Callout Box for Highlights, Warnings & Tips ──────────── */
function SmartCallout({ text, link, label, anchorId }) {
  const isWarning = text.startsWith("🚨") || text.toLowerCase().includes("warning") || text.toLowerCase().includes("important");
  const isTip = text.startsWith("💡") || text.toLowerCase().includes("tip") || text.startsWith("✨");
  const isNote = text.startsWith("📌") || text.startsWith("📝") || text.toLowerCase().includes("note");

  let borderColor = "border-violet-500/30";
  let bgGradient = "from-violet-500/[0.08] via-purple-500/[0.04] to-transparent";
  let iconBg = "bg-violet-500/20 text-violet-300";
  let IconComponent = Info;

  if (isWarning) {
    borderColor = "border-amber-500/40";
    bgGradient = "from-amber-500/[0.1] via-orange-500/[0.04] to-transparent";
    iconBg = "bg-amber-500/20 text-amber-300";
    IconComponent = AlertCircle;
  } else if (isTip) {
    borderColor = "border-emerald-500/40";
    bgGradient = "from-emerald-500/[0.1] via-teal-500/[0.04] to-transparent";
    iconBg = "bg-emerald-500/20 text-emerald-300";
    IconComponent = Lightbulb;
  }

  return (
    <div id={anchorId} className={`my-6 p-4 sm:p-5 rounded-2xl border ${borderColor} bg-gradient-to-r ${bgGradient} backdrop-blur-md relative overflow-hidden shadow-lg`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {text}
          </p>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
            >
              <span>{label || "Read more"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Content Block Renderer ──────────────────────────────────────── */
function renderContent(content) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <p className="text-slate-400 leading-relaxed text-base">
        No content available for this post yet.
      </p>
    );
  }

  return content.map((block, idx) => {
    const anchorId = `block-${idx}`;

    switch (block.type) {
      case "paragraph": {
        const text = block.text || "";
        const isCallout =
          text.startsWith("🚨") ||
          text.startsWith("📌") ||
          text.startsWith("💡") ||
          text.startsWith("✨") ||
          text.startsWith("Important:") ||
          text.startsWith("Warning:") ||
          text.startsWith("Note:");

        if (isCallout) {
          return (
            <SmartCallout
              key={idx}
              anchorId={anchorId}
              text={text}
              link={block.link}
              label={block.linkLabel}
            />
          );
        }

        // Code-like detection (if user pasted raw multi-line code into paragraph)
        const isCodeLooking = (text.includes("const ") || text.includes("function ") || text.includes("import ")) && text.includes("\n");
        if (isCodeLooking) {
          return (
            <CodeBlock
              key={idx}
              anchorId={anchorId}
              codeText={text}
              lang={text.includes("import ") ? "javascript" : "code"}
            />
          );
        }

        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 mb-5">
            <p className="text-slate-300 leading-[1.85] text-base sm:text-[17px]">
              {text}
            </p>
            {block.link && (
              <a
                href={block.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all"
              >
                <span>🔗 {block.linkLabel || "Reference Link"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      }

      case "heading":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 mt-12 mb-4 pt-4 border-t border-white/[0.05]">
            <h2 className="text-2xl sm:text-3xl font-space font-bold text-white tracking-tight flex items-center gap-2 group/h">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-[#7C3AED] inline-block" />
              <span>{block.text}</span>
            </h2>
            {block.link && (
              <a
                href={block.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 mt-2 hover:underline"
              >
                {block.linkLabel || "Learn more"} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );

      case "subheading":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 mt-8 mb-3">
            <h3 className="text-lg sm:text-xl font-space font-semibold text-[#C4B5FD] flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">#</span>
              <span>{block.text}</span>
            </h3>
            {block.link && (
              <a
                href={block.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 mt-1 hover:underline"
              >
                {block.linkLabel || "Details"} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );

      case "code":
        return (
          <CodeBlock
            key={idx}
            anchorId={anchorId}
            codeText={block.text}
            lang={block.lang}
          />
        );

      case "image":
        return (
          <figure key={idx} id={anchorId} className="group/block scroll-mt-28 my-9">
            <div className="rounded-2xl overflow-hidden border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#070b16]">
              <img
                src={block.src}
                alt={block.caption || "Article illustration"}
                className="w-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            {block.caption && (
              <figcaption className="text-center text-xs text-slate-400 mt-2.5 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case "quote":
        return (
          <blockquote key={idx} id={anchorId} className="group/block scroll-mt-28 my-8 pl-5 sm:pl-6 border-l-4 border-[#7C3AED] bg-gradient-to-r from-[#7C3AED]/10 to-transparent rounded-r-2xl py-4 pr-4">
            <p className="text-lg sm:text-xl font-space italic text-[#C4B5FD] leading-relaxed">
              "{block.text}"
            </p>
            {block.author && (
              <cite className="text-xs text-slate-400 mt-2 block not-italic font-sans">
                — <span className="text-white font-semibold">{block.author}</span>
              </cite>
            )}
          </blockquote>
        );

      case "list":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 my-5">
            <ul className="space-y-2.5 pl-1">
              {(block.items || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "divider":
        return (
          <div key={idx} id={anchorId} className="my-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          </div>
        );

      default:
        return null;
    }
  });
}

/* ── Main BlogPostDetailPage Component ───────────────────────────── */
export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { blogPosts } = useData();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [claps, setClaps] = useState(14);
  const [hasClapped, setHasClapped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const post = useData().blogPosts.find(
    (p) => p.slug === slug || String(p.id) === slug
  );

  // Other posts for "Related Reads"
  const relatedPosts = useData().blogPosts
    .filter((p) => p.id !== post?.id && !p.hidden)
    .slice(0, 2);

  // Extract Headings for Table of Contents
  const tocItems = useMemo(() => {
    if (!post || !Array.isArray(post.content)) return [];
    return post.content
      .map((block, idx) => {
        if (block.type === "heading" || block.type === "subheading") {
          return {
            id: `block-${idx}`,
            text: block.text,
            isSub: block.type === "subheading",
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [post]);

  // Scroll Progress and Active Section Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }

      setShowScrollTop(window.scrollY > 400);

      // Track active heading
      if (tocItems.length > 0) {
        for (let i = tocItems.length - 1; i >= 0; i--) {
          const el = document.getElementById(tocItems[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 140) {
              setActiveSection(tocItems[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  const handleClap = () => {
    setClaps((c) => c + 1);
    setHasClapped(true);
    toast("Thank you for your reaction!", { icon: "👏" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this article: ${post.title}`,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!", { icon: "🔗" });
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!", { icon: "🔗" });
    }
  };

  if (!post) {
    return (
      <main className="min-h-screen bg-[#02050D] flex items-center justify-center px-4 text-center">
        <div className="max-w-md p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
          <span className="text-4xl mb-4 block">🔍</span>
          <h1 className="text-2xl font-space font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            The blog post you're looking for doesn't exist or may have been moved.
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#7C3AED] text-white font-semibold text-sm"
          >
            Back to Blog Directory
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#02050D] text-slate-200 relative selection:bg-cyan-500/30 selection:text-white pb-36">

      {/* ── Top Reading Progress Bar ────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.05] z-[100]">
        <div
          className="h-full bg-gradient-to-r from-[#00BFFF] via-[#7C3AED] to-[#EC4899] transition-all duration-75 shadow-[0_0_12px_rgba(0,191,255,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Ambient Glows ───────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-[550px] h-[550px] rounded-full opacity-[0.04] blur-[180px] pointer-events-none"
        style={{ background: post.tagColor || "#7C3AED" }}
      />
      <div className="fixed bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      {/* ── Sticky Reading Navigation Bar ────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#02050D]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All Articles</span>
          </button>

          {/* Breadcrumb / Title Snippet */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 truncate max-w-md">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-slate-300 font-medium truncate">{post.title}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
              title="Bookmark article"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">

        {/* ── Main Grid: Article Content + Sticky Sidebar ────────── */}
        <div className="grid lg:grid-cols-[1fr_310px] gap-10 lg:gap-14 items-start">

          {/* ══════════ LEFT COLUMN: THE ARTICLE ══════════ */}
          <article className="min-w-0">

            {/* Category Tag + Emoji */}
            <div className="flex items-center gap-2.5 mb-5">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  color: post.tagColor || "#00BFFF",
                  backgroundColor: `${post.tagColor || "#00BFFF"}18`,
                  borderColor: `${post.tagColor || "#00BFFF"}35`,
                }}
              >
                {post.tag || "Technology"}
              </span>
              <span className="text-2xl">{post.emoji || "📝"}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-space font-extrabold text-white leading-[1.2] tracking-tight mb-5">
              {post.title}
            </h1>

            {/* Lead Excerpt */}
            {post.excerpt && (
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-6 pl-4 border-l-2 border-cyan-500/50">
                {post.excerpt}
              </p>
            )}

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-white/[0.08] text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-[#7C3AED] to-[#EC4899] p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#070b16] flex items-center justify-center font-bold text-white text-xs">
                    AD
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white leading-snug">Ankit Das</p>
                  <p className="text-[11px] text-slate-500">Full Stack Engineer</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {post.date || "Recent"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  {post.readTime || "5 min read"}
                </span>
              </div>
            </div>

            {/* ── Hero Cover Image (styled like Project Page) ──── */}
            {post.image && (
              <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[460px] rounded-2xl overflow-hidden border border-white/10 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-[#070b16] group">
                <div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-6 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: post.tagColor || "#7C3AED" }}
                />
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050D]/80 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
            )}

            {/* ── Main Article Content Blocks ──────────────────── */}
            <div className="prose-content">
              {renderContent(post.content)}
            </div>

            {/* ── Interactive Reaction & Claps Bar ─────────────── */}
            <div className="my-12 p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClap}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-purple-500/15 border border-pink-500/30 text-pink-400 hover:text-white hover:border-pink-500/60 transition-all active:scale-95 shadow-md"
                >
                  <Heart className={`w-4 h-4 ${hasClapped ? "fill-pink-500 text-pink-500 animate-bounce" : ""}`} />
                  <span className="font-bold text-sm">{claps}</span>
                  <span className="text-xs font-medium">Claps</span>
                </button>
                <span className="text-xs text-slate-500">Found this helpful? Leave a reaction!</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 mr-1">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 transition-all"
                  title="Share on Twitter"
                >
                  <XIcon className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-all"
                  title="Share on LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-all"
                  title="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Author Bio Box ──────────────────────────────── */}
            <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md mb-14">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-[#7C3AED] to-[#EC4899] p-0.5 shrink-0 shadow-lg">
                  <div className="w-full h-full rounded-[14px] bg-[#070b16] flex items-center justify-center font-bold text-white text-xl">
                    AD
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-space font-bold text-lg text-white">Ankit Das</h3>
                      <p className="text-xs text-cyan-400 font-mono">Full Stack Developer & Writer</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <a href="https://github.com/ankitdas" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <a href="https://linkedin.com/in/ankitdas" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Building scalable, full-stack web applications with React, Node.js, and cloud systems. Passionate about clean code, UI micro-interactions, and real-world engineering guides.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Related Reads ───────────────────────────────── */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/[0.08]">
                <h3 className="font-space font-bold text-xl text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Related Articles</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {relatedPosts.map((rPost) => (
                    <div
                      key={rPost.id}
                      onClick={() => {
                        navigate(`/blog/${rPost.slug}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/[0.04] transition-all cursor-pointer shadow-sm"
                    >
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">
                        {rPost.tag}
                      </span>
                      <h4 className="font-space font-bold text-white text-base group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug mb-2">
                        {rPost.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {rPost.excerpt}
                      </p>
                      <span className="text-xs font-semibold text-violet-400 group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform">
                        Read post →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </article>

          {/* ══════════ RIGHT COLUMN: STICKY TOC & SIDEBAR ══════════ */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Table of Contents Widget */}
              {tocItems.length > 0 && (
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      ON THIS PAGE
                    </h4>
                  </div>
                  <nav className="space-y-1 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                    {tocItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            const el = document.getElementById(item.id);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-2 ${
                            item.isSub ? "pl-5 text-slate-400" : "font-medium"
                          } ${
                            isActive
                              ? "bg-cyan-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-400"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="truncate">{item.text}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Sidebar Author Widget */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  WRITTEN BY
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-[#7C3AED] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#070b16] flex items-center justify-center font-bold text-white text-xs">
                      AD
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Ankit Das</p>
                    <p className="text-[11px] text-cyan-400">Full Stack Engineer</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Writing about React, backend architecture, and modern developer tooling.
                </p>
                <button
                  onClick={() => navigate("/contact")}
                  className="w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                  Get in Touch
                </button>
              </div>

              {/* Newsletter / Stay Connected */}
              <div className="p-5 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/[0.04] text-center">
                <span className="text-2xl mb-2 block">⚡</span>
                <p className="font-space font-bold text-sm text-white mb-1">Enjoying this guide?</p>
                <p className="text-xs text-slate-400 mb-4">
                  Check out more projects and dev articles on my portfolio.
                </p>
                <button
                  onClick={() => navigate("/projects")}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-[#7C3AED] text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
                >
                  Explore My Projects
                </button>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {/* ── Floating Back to Top Button ──────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-3 rounded-2xl bg-[#070b16]/90 border border-white/10 text-cyan-400 hover:text-white hover:border-cyan-400/50 shadow-2xl backdrop-blur-md z-40 transition-all hover:scale-110 active:scale-95"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
