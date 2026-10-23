import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Clock, Calendar, Tag, Share2,
  Link2, ChevronRight, ChevronDown, Copy, Check,
  Heart, AlertCircle, Info, Lightbulb, ArrowUp, Bookmark,
  ExternalLink, Hash, X, Mail, Type, Sliders,
  RotateCcw, Filter, Menu, BookOpen, Zap, Eye,
  Globe, Play, Image as ImageIcon, Sparkles, User
} from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "../components/SocialIcons";
import { useData } from "../context/DataContext";
import { blogPosts as defaultBlogPosts } from "../data/portfolio";
import { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/* ── Helper to extract clean text from React / AST children ──────── */
const extractText = (node) => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node.props && node.props.children) return extractText(node.props.children);
  return "";
};

/* ── Helper to create URL-safe IDs for headings and TOC ──────────── */
const slugifyText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

/* ── Scroll Progress Ring ─────────────────────────────────────────── */
function ScrollProgressRing({ progress }) {
  const radius = 10;
  const stroke = 2.5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative w-7 h-7 flex items-center justify-center" title={`${Math.round(progress)}% read`}>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle stroke="rgba(56,189,248,0.15)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <circle
          stroke="url(#ringGrad)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.2s ease" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[7px] font-bold text-sky-300 font-mono">{Math.round(progress)}%</span>
    </div>
  );
}

/* ── Interactive Code Block with Terminal Chrome & Copy ───────────── */
function CodeBlock({ codeText, lang, anchorId }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    toast.success("Code copied to clipboard!", { icon: "📋" });
    setTimeout(() => setCopied(false), 2200);
  };

  const detectedLang = (lang || "code").toLowerCase();
  const lineCount = codeText.split("\n").length;

  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group/code my-6 rounded-2xl overflow-hidden border bg-[#040810] shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
      style={{
        borderColor: isHovered ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.08)",
        boxShadow: isHovered ? "0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(56,189,248,0.07)" : undefined,
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]"
        style={{ background: isHovered ? "rgba(56,189,248,0.04)" : "rgba(255,255,255,0.03)" }}
      >
        <div className="flex items-center gap-2">
          <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block cursor-default shadow-[0_0_6px_rgba(255,95,86,0.5)]" />
          <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block cursor-default shadow-[0_0_6px_rgba(255,189,46,0.5)]" />
          <motion.span whileHover={{ scale: 1.3 }} className="w-3 h-3 rounded-full bg-[#27C93F] inline-block cursor-default shadow-[0_0_6px_rgba(39,201,63,0.5)]" />
          <span className="ml-3 font-mono text-[11px] font-semibold tracking-wider uppercase" style={{ color: isHovered ? "#38BDF8" : "#64748b" }}>
            {detectedLang}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">{lineCount} lines</span>
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${copied
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "text-slate-400 hover:text-sky-300 bg-white/[0.04] hover:bg-sky-500/10 border-white/[0.06] hover:border-sky-500/30"
              }`}
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm font-mono leading-relaxed text-slate-200">
        <pre className="whitespace-pre">
          <code>{codeText}</code>
        </pre>
      </div>
    </motion.div>
  );
}

/* ── MDN-Style Callout Box ────────────────────────────────────────── */
function SmartCallout({ text, link, label, anchorId }) {
  const isWarning =
    text.startsWith("🚨") ||
    text.toLowerCase().includes("warning") ||
    text.toLowerCase().includes("important") ||
    text.toLowerCase().includes("caution");
  const isTip =
    text.startsWith("💡") ||
    text.startsWith("✨") ||
    text.toLowerCase().includes("tip");

  let borderColor = "border-sky-500/40";
  let bgGradient = "from-sky-950/40 via-sky-950/20 to-transparent";
  let iconBg = "bg-sky-500/20 text-sky-300";
  let title = "Note";
  let IconComponent = Info;

  if (isWarning) {
    borderColor = "border-amber-500/40";
    bgGradient = "from-amber-950/40 via-amber-950/20 to-transparent";
    iconBg = "bg-amber-500/20 text-amber-300";
    title = "Warning";
    IconComponent = AlertCircle;
  } else if (isTip) {
    borderColor = "border-emerald-500/40";
    bgGradient = "from-emerald-950/40 via-emerald-950/20 to-transparent";
    iconBg = "bg-emerald-500/20 text-emerald-300";
    title = "Tip";
    IconComponent = Lightbulb;
  }

  return (
    <div
      id={anchorId}
      className={`my-6 p-4 sm:p-5 rounded-xl border-l-4 ${borderColor} bg-gradient-to-r ${bgGradient} border border-white/[0.06] backdrop-blur-md relative overflow-hidden shadow-lg`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
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

/* ── Content Block Renderer (for array-based content) ─────────────── */
function renderBlockContent(content) {
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

        const isCodeLooking =
          (text.includes("const ") || text.includes("function ") || text.includes("import ")) &&
          text.includes("\n");
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
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold hover:bg-sky-500/20 transition-all"
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
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 mt-12 mb-4 pt-4 border-t border-white/[0.06]">
            <h2 className="text-xl sm:text-2xl font-space font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-sky-400 to-[#7C3AED] inline-block" />
              <span>{block.text}</span>
            </h2>
          </div>
        );

      case "subheading":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 mt-8 mb-3">
            <h3 className="text-lg font-space font-semibold text-slate-200 flex items-center gap-2">
              <span className="text-sky-400 font-mono text-sm">#</span>
              <span>{block.text}</span>
            </h3>
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
          <figure key={idx} id={anchorId} className="group/block scroll-mt-28 my-8">
            <div className="rounded-2xl overflow-hidden border border-white/[0.1] shadow-xl bg-[#070b16]">
              <img
                src={block.src}
                alt={block.caption || "Article illustration"}
                className="w-full object-cover max-h-[500px]"
              />
            </div>
            {block.caption && (
              <figcaption className="text-center text-xs text-slate-400 mt-2.5 font-mono italic">
                ▲ {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case "quote":
        return (
          <blockquote
            key={idx}
            id={anchorId}
            className="group/block scroll-mt-28 my-7 pl-5 border-l-4 border-sky-400 bg-sky-950/20 rounded-r-xl py-3 pr-4 text-slate-200"
          >
            <p className="text-base sm:text-lg italic leading-relaxed">
              "{block.text}"
            </p>
            {block.author && (
              <cite className="text-xs text-slate-400 mt-2 block not-italic font-mono">
                — {block.author}
              </cite>
            )}
          </blockquote>
        );

      case "list":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 my-5">
            <ul className="space-y-2 pl-2">
              {(block.items || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "divider":
        return (
          <div key={idx} id={anchorId} className="my-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        );

      default:
        return null;
    }
  });
}

/* ── MDN Documentation Left Sidebar Component ─────────────────────── */
function DocsSidebar({
  filterQuery,
  setFilterQuery,
  tocItems,
  activeSection,
  onNavigate,
  onSectionClick,
}) {
  const [isTocOpen, setIsTocOpen] = useState(true);
  const activeItemRef = useRef(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSection]);

  // Filter TOC items by search query
  const filteredTocItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return tocItems;
    return tocItems.filter((item) => item.text.toLowerCase().includes(q));
  }, [tocItems, filterQuery]);

  return (
    <div className="flex flex-col h-full text-slate-300 select-none">
      {/* ── Sticky Top Filter Input (MDN Style) ── */}
      <div className="sticky top-0 z-20 pb-3 bg-[#070b16] border-b border-white/[0.06]">
        <div className="relative flex items-center">
          <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-sky-500/[0.04] focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          <AnimatePresence>
            {filterQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setFilterQuery("")}
                className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-white"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {filterQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 overflow-hidden"
            >
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" />
                {filteredTocItems.length} {filteredTocItems.length === 1 ? "match" : "matches"}
              </span>
              <button
                onClick={() => setFilterQuery("")}
                className="text-sky-400 hover:underline"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable Sidebar Tree ── */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-5 pr-1"
        data-lenis-prevent
      >
        {/* SECTION 1: On this page (Current Article Structure) */}
        {filteredTocItems.length > 0 && (
          <div>
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-sky-400" />
                <span>On this page</span>
              </span>
              <span className="flex items-center gap-1">
                <motion.span
                  key={filteredTocItems.length}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25"
                >
                  {filteredTocItems.length}
                </motion.span>
                <motion.div animate={{ rotate: isTocOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </motion.div>
              </span>
            </button>

            <AnimatePresence>
              {isTocOpen && (
                <motion.nav
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-1.5 space-y-0.5 border-l-2 border-white/[0.06] ml-3 pl-2 overflow-hidden"
                >
                  {filteredTocItems.map((item, idx) => {
                    const isActive = activeSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        ref={isActive ? activeItemRef : null}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.025 }}
                        onClick={() => onSectionClick(item.id)}
                        className={`relative w-full text-left text-xs py-1.5 px-2 rounded-lg transition-all duration-200 flex items-center gap-2 group/toc ${item.isSub ? "pl-5" : "font-medium"
                          }`}
                        style={{
                          color: isActive ? "#38BDF8" : undefined,
                          background: isActive ? "rgba(56,189,248,0.1)" : undefined,
                        }}
                        whileHover={{ x: 2 }}
                      >
                        {/* Active Glow Bar */}
                        {isActive && (
                          <motion.span
                            layoutId="toc-active-bar"
                            className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        {/* Active pulse dot */}
                        {isActive && (
                          <span className="relative flex shrink-0 h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400" />
                          </span>
                        )}
                        <span className={`truncate transition-colors ${isActive ? "text-sky-300 font-semibold" : "text-slate-400 group-hover/toc:text-slate-200"}`}>
                          {item.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Sidebar Footer ── */}
      <div className="pt-3 border-t border-white/[0.06] space-y-1">
        <Link
          to="/blog"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>Back to All Articles</span>
        </Link>
      </div>
    </div>
  );
}

/* ── Right Sidebar: Article Intel, Author, Media, Links & Recommendations ── */
function ArticleDetailsSidebar({
  post,
  author,
  authors = [],
  readingTime,
  viewCount,
  demoUrl,
  githubUrl,
  docsUrl,
  videoUrl,
  postLinks,
  otherPosts,
  tags,
  coverImage,
  setLightbox,
  setShareOpen,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Article link copied!", { icon: "🔗" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-4 text-slate-300 select-none pb-6">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Article Overview</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-semibold uppercase">
          {tags[0] || post.tag || "Guide"}
        </span>
      </div>

      {/* ── Cover Image Thumbnail Preview (Clickable) ── */}
      {coverImage && (
        <div
          onClick={() => setLightbox(coverImage)}
          className="group/thumb relative rounded-xl overflow-hidden border border-white/10 shadow-lg cursor-zoom-in bg-[#040812]"
          title="Click to view full cover image"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white font-mono">
              <span className="truncate max-w-[170px] font-medium text-slate-200">{post.title}</span>
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-black/60 border border-white/15 text-[9px] text-sky-300">🔍 View</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Article Quick Specs ── */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Published
          </span>
          <span className="font-semibold text-slate-200 font-mono text-[11px]">{post.date || "Recent"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Read Time
          </span>
          <span className="font-semibold text-slate-200 font-mono text-[11px]">{readingTime || post.readTime || "5 min read"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" /> Total Views
          </span>
          <span className="font-semibold text-sky-300 font-mono text-[11px]">{viewCount.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> Status
          </span>
          <span className="font-semibold text-emerald-400 font-mono text-[11px]">Live &amp; Verified</span>
        </div>
      </div>

      {/* ── Author Profile Card(s) ── */}
      {(() => {
        const authorList = (Array.isArray(authors) && authors.length > 0) ? authors : (author ? [author] : []);
        if (authorList.length === 0) return null;
        return (
          <div className="space-y-3">
            {authorList.map((aut, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 to-[#7C3AED] shadow-md shrink-0">
                    {aut.avatar ? (
                      <img src={aut.avatar} alt={aut.name} className="w-full h-full rounded-[10px] object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-[10px] bg-[#070b16] flex items-center justify-center font-bold text-white text-xs font-space">
                        {aut.name ? aut.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "AD"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                        {authorList.length > 1 ? (idx === 0 ? "Lead Author" : "Co-Author") : "Author"}
                      </p>
                      {aut.isTeam && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Team
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{aut.name || "Ankit Das"}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{aut.role || "Full Stack Developer"}</p>
                  </div>
                </div>

                {aut.bio && (
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {aut.bio}
                  </p>
                )}

                {/* Social Links Row */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                  {aut.github && (
                    <a
                      href={aut.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="GitHub"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {aut.linkedin && (
                    <a
                      href={aut.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="LinkedIn"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {aut.email && (
                    <a
                      href={`mailto:${aut.email}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link
                    to="/contact"
                    className="ml-auto text-[10px] font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                  >
                    <span>Contact</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Multiple Action Links ── */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Links</span>
        </div>
        <div className="space-y-1.5">
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500/15 to-[#7C3AED]/15 border border-sky-500/30 hover:border-sky-400 transition-all group"
            >
              <span className="flex items-center gap-2 truncate">
                <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Live Demo</span>
              </span>
              <ExternalLink className="w-3 h-3 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 transition-all group"
            >
              <span className="flex items-center gap-2 truncate">
                <GithubIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="truncate">Source Code</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>
          )}
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400 transition-all group"
            >
              <span className="flex items-center gap-2 truncate">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Documentation</span>
              </span>
              <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
            </a>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20 hover:border-red-400 transition-all group"
            >
              <span className="flex items-center gap-2 truncate">
                <Play className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">Watch Video</span>
              </span>
              <ExternalLink className="w-3 h-3 text-red-400 shrink-0" />
            </a>
          )}
          {postLinks.map((lnk, idx) => (
            <a
              key={idx}
              href={lnk.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all group"
            >
              <span className="flex items-center gap-2 truncate">
                <Link2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{lnk.label || lnk.url}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
            </a>
          ))}
        </div>

        {/* Copy Link & Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── Referred / Recommended Other Articles ── */}
      {otherPosts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>Recommended Articles</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">{otherPosts.length} posts</span>
          </div>

          <div className="space-y-1.5">
            {otherPosts.map((op) => (
              <Link
                key={op.id}
                to={`/blog/${op.slug || op.id}`}
                className="group block p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-sky-500/30 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0 p-1 rounded-lg bg-white/[0.03] border border-white/5">
                    {op.emoji || "📝"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                      {op.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                      <span className="text-slate-400">{op.tag || "Article"}</span>
                      <span>•</span>
                      <span>{op.readTime || "5 min"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/blog"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-3 h-3 text-sky-400" />
          </Link>
        </div>
      )}

      {/* ── Article Tags ── */}
      {tags.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-sky-400" />
            <span>Article Tags</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-300"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main BlogPostDetailPage Component ───────────────────────────── */
export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { blogPosts: apiPosts } = useData();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerTab, setMobileDrawerTab] = useState("toc"); // "toc" | "info"
  const [mobileTocExpanded, setMobileTocExpanded] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [viewCount] = useState(() => Math.floor(Math.random() * 800) + 120);
  const articleRef = useRef(null);

  // Reader Customization Preferences
  const [readerFontSize, setReaderFontSize] = useState(null);
  const [readerFontFamily, setReaderFontFamily] = useState(null);
  const [readerAccentColor, setReaderAccentColor] = useState(null);
  const [showReaderCustomizer, setShowReaderCustomizer] = useState(false);

  // Merge API posts with default fallback posts so full developer guides are accessible
  const allPosts = useMemo(() => {
    const map = new Map();
    defaultBlogPosts.forEach((p) => {
      const key = p.slug || String(p.id);
      map.set(key, p);
    });
    (apiPosts || []).forEach((p) => {
      const key = p.slug || String(p.id);
      map.set(key, p);
    });
    return Array.from(map.values()).filter((p) => !p.hidden);
  }, [apiPosts]);

  // Current Post Lookup
  const post = useMemo(() => {
    return allPosts.find((p) => p.slug === slug || String(p.id) === slug);
  }, [allPosts, slug]);

  const accentColor = readerAccentColor || post?.tagColor || "#00BFFF";

  // Author info
  const author = useMemo(() => {
    if (!post?.author) {
      return {
        name: "Ankit Das",
        role: "Full Stack Engineer",
        avatar: "",
        bio: "Building scalable full-stack web applications with React, Node.js, and cloud systems. Passionate about clean code, developer workflows, and system architecture guides.",
        github: "https://github.com/ankitdas",
        linkedin: "https://linkedin.com/in/ankitdas",
        twitter: "",
        email: "ankitdas@example.com",
      };
    }
    if (typeof post.author === "string") {
      try {
        return JSON.parse(post.author);
      } catch {
        return { name: post.author, role: "Author" };
      }
    }
    return post.author;
  }, [post]);

  // Authors list (supports single or multiple authors)
  const authors = useMemo(() => {
    let list = post?.authors;
    if (typeof list === "string") {
      try { list = JSON.parse(list); } catch { list = []; }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    if (author) return [author];
    return [{
      name: "Ankit Das",
      role: "Full Stack Engineer",
      avatar: "",
      bio: "Building scalable full-stack web applications with React, Node.js, and cloud systems.",
      github: "https://github.com/ankitdas",
      linkedin: "https://linkedin.com/in/ankitdas",
      twitter: "",
      email: "ankitdas@example.com",
    }];
  }, [post, author]);

  // Post external links / resources
  const postLinks = useMemo(() => {
    if (!post?.links) return [];
    let list = post.links;
    if (typeof list === "string") {
      try {
        list = JSON.parse(list);
      } catch {
        list = [];
      }
    }
    return Array.isArray(list)
      ? list.filter((l) => l && typeof l.url === "string" && l.url.trim())
      : [];
  }, [post]);

  // Post styling preferences
  const postStyling = useMemo(() => {
    if (!post?.styling) {
      return { fontSize: "standard", fontFamily: "inter", layoutWidth: "standard", lineHeight: "comfortable" };
    }
    let s = post.styling;
    if (typeof s === "string") {
      try {
        s = JSON.parse(s);
      } catch {
        s = {};
      }
    }
    return {
      fontSize: s?.fontSize || "standard",
      fontFamily: s?.fontFamily || "inter",
      layoutWidth: s?.layoutWidth || "standard",
      lineHeight: s?.lineHeight || "comfortable",
    };
  }, [post]);

  const activeFontSize = readerFontSize || postStyling.fontSize;
  const activeFontFamily = readerFontFamily || postStyling.fontFamily;

  // Extract Table of Contents items
  const tocItems = useMemo(() => {
    if (!post) return [];
    if (post.markdown && typeof post.markdown === "string") {
      const items = [];
      const lines = post.markdown.split("\n");
      lines.forEach((line, idx) => {
        const h2 = line.match(/^##\s+(.+)$/);
        const h3 = line.match(/^###\s+(.+)$/);
        if (h2) {
          const rawText = h2[1].replace(/[*_`#]/g, "").trim();
          items.push({
            id: slugifyText(rawText) || `heading-${idx}`,
            text: rawText,
            isSub: false,
          });
        } else if (h3) {
          const rawText = h3[1].replace(/[*_`#]/g, "").trim();
          items.push({
            id: slugifyText(rawText) || `heading-${idx}`,
            text: rawText,
            isSub: true,
          });
        }
      });
      if (items.length > 0) return items;
    }
    if (Array.isArray(post.content)) {
      return post.content
        .map((block, idx) => {
          if (block.type === "heading" || block.type === "subheading") {
            const rawText = block.text || "";
            return {
              id: slugifyText(rawText) || `block-${idx}`,
              text: rawText,
              isSub: block.type === "subheading",
            };
          }
          return null;
        })
        .filter(Boolean);
    }
    return [];
  }, [post]);

  // Post tags
  const tags = useMemo(() => {
    if (!post) return [];
    if (Array.isArray(post.tags)) return post.tags;
    if (post.tag) return post.tag.split(",").map((t) => t.trim()).filter(Boolean);
    return [];
  }, [post]);

  // Project-like action links & cover image
  const coverImage = post?.image || null;
  const demoUrl =
    post?.demo ||
    post?.demoUrl ||
    post?.liveUrl ||
    (postLinks.find((l) => l.type === "demo" || l.label?.toLowerCase().includes("demo") || l.label?.toLowerCase().includes("live"))?.url) ||
    (post?.title?.toLowerCase().includes("uptimerobot") ? "https://uptimerobot.com" : null);

  const githubUrl =
    post?.github ||
    post?.githubUrl ||
    (postLinks.find((l) => l.type === "github" || l.label?.toLowerCase().includes("github") || l.label?.toLowerCase().includes("code") || l.label?.toLowerCase().includes("source"))?.url) ||
    (author?.github || "https://github.com/ankitdas37");

  const docsUrl =
    post?.docsUrl ||
    (postLinks.find((l) => l.type === "docs" || l.label?.toLowerCase().includes("doc") || l.label?.toLowerCase().includes("guide"))?.url) ||
    (post?.title?.toLowerCase().includes("uptimerobot") ? "https://uptimerobot.com" : null);

  const videoUrl =
    post?.youtubeUrl ||
    post?.videoUrl ||
    (postLinks.find((l) => l.type === "video" || l.label?.toLowerCase().includes("video") || l.label?.toLowerCase().includes("youtube"))?.url) ||
    null;

  // Related / Referred other articles (for Right Sidebar and recommendations)
  const otherPosts = useMemo(() => {
    if (!post) return [];
    const currentKey = post.slug || String(post.id);
    const postTag = (post.tag || (Array.isArray(post.tags) && post.tags[0]) || "").toLowerCase();

    // 1. Manually curated / recommended articles from Admin
    let recommendedKeys = [];
    if (post.recommendedPosts) {
      if (Array.isArray(post.recommendedPosts)) {
        recommendedKeys = post.recommendedPosts.map((k) => String(k));
      } else if (typeof post.recommendedPosts === "string") {
        try {
          const parsed = JSON.parse(post.recommendedPosts);
          if (Array.isArray(parsed)) recommendedKeys = parsed.map((k) => String(k));
        } catch { }
      }
    }

    const curated = [];
    recommendedKeys.forEach((k) => {
      const match = allPosts.find(
        (p) => (p.slug === k || String(p.id) === k) && (p.slug || String(p.id)) !== currentKey
      );
      if (match && !curated.some((c) => (c.slug || String(c.id)) === (match.slug || String(match.id)))) {
        curated.push(match);
      }
    });

    // 2. Prioritize articles with similar tag/category
    const related = allPosts.filter((p) => {
      const key = p.slug || String(p.id);
      if (key === currentKey) return false;
      if (curated.some((c) => (c.slug || String(c.id)) === key)) return false;
      const pTag = (p.tag || (Array.isArray(p.tags) && p.tags[0]) || "").toLowerCase();
      return pTag && postTag && pTag === postTag;
    });

    // 3. Remainder of articles
    const others = allPosts.filter((p) => {
      const key = p.slug || String(p.id);
      if (key === currentKey) return false;
      if (curated.some((c) => (c.slug || String(c.id)) === key)) return false;
      if (related.some((r) => (r.slug || String(r.id)) === key)) return false;
      return true;
    });

    return [...curated, ...related, ...others].slice(0, 5);
  }, [allPosts, post]);

  // Handle escape key to close modals
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setShareOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Scroll spy & progress calculation (throttled with rAF for 120fps smooth scroll)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const nextProgress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
            setScrollProgress((prev) => (Math.abs(prev - nextProgress) >= 0.5 ? nextProgress : prev));
          }

          if (tocItems.length > 0) {
            for (let i = tocItems.length - 1; i >= 0; i--) {
              const el = document.getElementById(tocItems[i].id);
              if (el && el.getBoundingClientRect().top <= 140) {
                setActiveSection((prev) => (prev === tocItems[i].id ? prev : tocItems[i].id));
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  // Track estimated reading progress
  useEffect(() => {
    if (!articleRef.current) return;
    const words = articleRef.current.innerText?.split(/\s+/).length || 0;
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  }, [post]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success("Link copied!", { icon: "🔗" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSectionClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileDrawerOpen(false);
  };

  // Previous & Next posts
  const postIndex = allPosts.findIndex((p) => p.slug === slug || String(p.id) === slug);
  const prevPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
  const nextPost = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;

  if (!post) {
    return (
      <main className="min-h-screen bg-[#02050D] flex items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md p-10 rounded-3xl border border-white/[0.08] bg-white/[0.02]"
        >
          <span className="text-5xl mb-5 block">🔍</span>
          <h1 className="text-3xl font-space font-extrabold text-white mb-3">
            Article Not Found
          </h1>
          <p className="text-slate-400 text-sm mb-7">
            The blog post you're looking for doesn't exist or may have been moved.
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-[#7C3AED] text-white font-bold text-sm hover:opacity-90 transition-all"
          >
            ← Back to Blog
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-200 relative selection:bg-sky-500/30 selection:text-white">
      {/* ── Reading Progress Bar (+ glow dot at tip) ────── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.04] z-[100] overflow-visible">
        <div
          className="h-full transition-all duration-100 relative"
          style={{
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, #38BDF8, ${accentColor}, #EC4899)`,
            boxShadow: `0 0 14px rgba(56,189,248,0.9), 0 0 30px rgba(56,189,248,0.4)`,
          }}
        >
          {/* Glowing tip */}
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full translate-x-1/2"
            style={{
              background: accentColor,
              boxShadow: `0 0 12px ${accentColor}, 0 0 24px ${accentColor}88`,
            }}
          />
        </div>
      </div>

      {/* ── Sticky Top Navigation Bar (MDN Breadcrumb Style) ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070b16]/95 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3" style={{ borderBottom: scrollProgress > 5 ? `1px solid rgba(56,189,248,0.1)` : undefined }}>
          {/* Left: Mobile Drawer Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Button */}
            <button
              onClick={() => {
                setMobileDrawerTab("toc");
                setMobileDrawerOpen(true);
              }}
              className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
              title="Open documentation menu"
            >
              <Menu className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold hidden xs:inline">Menu</span>
            </button>

            {/* Back Link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs shrink-0 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline font-medium">All Articles</span>
            </Link>

            {/* Breadcrumb path */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 truncate max-w-md">
              <span>/</span>
              <Link to="/blog" className="hover:text-slate-300 transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-slate-400 font-mono text-[11px] uppercase">
                {tags[0] || post.tag || "Guide"}
              </span>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-slate-200 font-medium truncate">
                {post.title}
              </span>
            </div>
          </div>

          {/* Right: Actions (Aa Reader Customizer, Bookmark, Share) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
            {/* Typography Customizer */}
            <button
              onClick={() => setShowReaderCustomizer(!showReaderCustomizer)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${showReaderCustomizer || readerFontSize || readerFontFamily
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm"
                : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              title="Customize reading font & size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold hidden sm:inline">Aa</span>
            </button>

            {/* Typography Customizer Popover */}
            <AnimatePresence>
              {showReaderCustomizer && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-72 p-4 rounded-2xl bg-[#080d1a]/95 border border-sky-500/30 backdrop-blur-2xl shadow-2xl space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white font-space flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-sky-400" /> Reader Appearance
                    </span>
                    {(readerFontSize || readerFontFamily || readerAccentColor) && (
                      <button
                        onClick={() => {
                          setReaderFontSize(null);
                          setReaderFontFamily(null);
                          setReaderAccentColor(null);
                        }}
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Reset
                      </button>
                    )}
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Text Size
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px]">
                      {[
                        { id: "compact", label: "A-", name: "15px" },
                        { id: "standard", label: "A", name: "17px" },
                        { id: "large", label: "A+", name: "19px" },
                        { id: "xlarge", label: "A++", name: "21px" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setReaderFontSize(s.id)}
                          className={`py-1.5 rounded-lg font-bold transition-all ${activeFontSize === s.id
                            ? "bg-sky-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                            }`}
                          title={s.name}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Font Style
                    </label>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {[
                        { id: "inter", label: "Inter (Sans)" },
                        { id: "space", label: "Space (Tech)" },
                        { id: "merriweather", label: "Merriweather" },
                        { id: "mono", label: "JetBrains (Code)" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setReaderFontFamily(f.id)}
                          className={`px-2.5 py-1.5 rounded-lg font-medium text-left truncate border transition-all ${activeFontFamily === f.id
                            ? "bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                            }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Accent Color */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Accent Color
                      </label>
                      <span className="text-[10px] font-mono font-bold" style={{ color: accentColor }}>
                        {accentColor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { id: post?.tagColor || "#00BFFF", label: "Default" },
                        { id: "#00BFFF", label: "Cyan" },
                        { id: "#7C3AED", label: "Purple" },
                        { id: "#10B981", label: "Emerald" },
                        { id: "#38BDF8", label: "Sky" },
                        { id: "#F59E0B", label: "Amber" },
                        { id: "#EC4899", label: "Rose" },
                        { id: "#6366F1", label: "Indigo" },
                      ].map((c) => {
                        const isSelected = accentColor.toLowerCase() === c.id.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            onClick={() => setReaderAccentColor(c.id)}
                            className={`w-6 h-6 rounded-lg border transition-transform ${
                              isSelected
                                ? "scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.7)] ring-1 ring-white/70 z-10"
                                : "border-white/20 hover:scale-110 opacity-70 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: c.id }}
                            title={c.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookmark button */}
            <button
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast(isBookmarked ? "Bookmark removed" : "Article bookmarked!", {
                  icon: isBookmarked ? "🗑️" : "🔖",
                });
              }}
              className={`p-2 rounded-xl border transition-all ${isBookmarked
                ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              title="Bookmark article"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Scroll Progress Ring */}
            <ScrollProgressRing progress={scrollProgress} />

            {/* Share button */}
            <motion.button
              onClick={() => setShareOpen((o) => !o)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 hover:border-sky-500/30 transition-all"
              title="Share article"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Share</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Main Documentation Layout ────────────────────── */}
      <div className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col">
        {/* ════════════════════════════════════════════════════
            LEFT SIDEBAR — MDN Style Tree Navigation (Fixed)
        ════════════════════════════════════════════════════ */}
        <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-72 xl:w-80 border-r border-white/[0.08] bg-[#070b16] z-30 flex-col overflow-hidden py-4 px-3">
          {/* Subtle top glow beacon */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
          />
          <DocsSidebar
            filterQuery={filterQuery}
            setFilterQuery={setFilterQuery}
            tocItems={tocItems}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </aside>

        {/* ════════════════════════════════════════════════════
            RIGHT SIDEBAR — Article Details & Recommendations (Fixed)
        ════════════════════════════════════════════════════ */}
        <aside className="hidden xl:flex fixed right-0 top-14 bottom-0 w-80 2xl:w-88 border-l border-white/[0.08] bg-[#070b16] z-30 flex-col overflow-hidden py-4 px-3.5">
          {/* Subtle top glow beacon */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
          />
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1" data-lenis-prevent>
            <ArticleDetailsSidebar
              post={post}
              author={author}
              authors={authors}
              readingTime={readingTime}
              viewCount={viewCount}
              demoUrl={demoUrl}
              githubUrl={githubUrl}
              docsUrl={docsUrl}
              videoUrl={videoUrl}
              postLinks={postLinks}
              otherPosts={otherPosts}
              tags={tags}
              coverImage={coverImage}
              setLightbox={setLightbox}
              setShareOpen={setShareOpen}
            />
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════
            MAIN CONTENT AREA — Centered Article View
        ════════════════════════════════════════════════════ */}
        <main
          className="flex-1 min-w-0 w-full lg:pl-72 xl:pl-80 xl:pr-80 2xl:pr-88 px-3.5 sm:px-8 xl:px-10 py-5 sm:py-8 lg:py-10 pb-28 sm:pb-32 lg:pb-16"
        >
          <div
            className={`mx-auto transition-all duration-300 ${postStyling.layoutWidth === "wide"
              ? "max-w-4xl"
              : postStyling.layoutWidth === "ultrawide"
                ? "max-w-5xl"
                : "max-w-3xl"
              }`}
          >
            {/* ── Top Docs Header ────────────────────────── */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 pb-8 border-b border-white/[0.08]"
            >
              {/* Category Pill + Stats Row */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-sky-500/10"
                  style={{ borderColor: `${accentColor}40` }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: accentColor }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: accentColor }} />
                  </span>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    {tags[0] || post.tag || "Developer Guide"}
                  </span>
                  {post.emoji && <span className="text-sm">{post.emoji}</span>}
                </motion.div>

                {/* Quick stats pills */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 text-[11px] text-slate-500"
                >
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{viewCount.toLocaleString()}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{readingTime || post.readTime || "5 min"}</span>
                  </span>
                </motion.div>
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-space font-extrabold text-white tracking-tight leading-[1.15] mb-4"
              >
                {post.title}
              </motion.h1>

              {/* Excerpt / Summary */}
              {post.excerpt && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-base sm:text-lg text-slate-400 leading-relaxed mb-6"
                >
                  {post.excerpt}
                </motion.p>
              )}

              {/* Metadata strip: Author, Date, Read Time, Tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06] text-xs text-slate-400"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Author chip */}
                  <div className="flex items-center gap-2 group cursor-default">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-[#7C3AED] p-0.5 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    >
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#070b16] flex items-center justify-center font-bold text-white text-[9px]">
                          {author.name
                            ? author.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                            : "AD"}
                        </div>
                      )}
                    </motion.div>
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {author.name}
                    </span>
                  </div>

                  <span className="text-slate-600">•</span>

                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{post.date || "Recent"}</span>
                  </span>

                  <span className="text-slate-600">•</span>

                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{post.readTime || `${readingTime} min read`}</span>
                  </span>
                </div>
              </motion.div>

              {/* Tag Badges */}
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex flex-wrap items-center gap-1.5 mt-4"
                >
                  {tags.map((t, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + idx * 0.06 }}
                      whileHover={{ scale: 1.08, y: -1 }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition-colors cursor-default"
                    >
                      <Tag className="w-2.5 h-2.5 text-sky-400" />
                      {t}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* ── Cover Page Frame (like Project Details Page) ── */}
              {coverImage && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.5 }}
                  className="relative my-7 rounded-2xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] group/cover cursor-zoom-in"
                  onClick={() => setLightbox(coverImage)}
                  title="Click to view full cover image"
                >
                  {/* Subtle ambient glow behind frame */}
                  <div
                    className="absolute inset-[-10%] rounded-full blur-[100px] opacity-20 pointer-events-none"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Browser Chrome Header */}
                  <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)] relative z-10 backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    </div>
                    <div className="flex-1 mx-2 sm:mx-4 h-6 rounded-lg bg-[rgba(255,255,255,0.05)] border border-white/5 flex items-center px-3 justify-between">
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        {window.location.origin}/blog/{post.slug || post.id}
                      </span>
                      <span className="text-[10px] text-sky-400 font-mono hidden sm:inline uppercase tracking-wider font-semibold">
                        Article Cover
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono hidden xs:flex items-center gap-1">
                      <span>Click to expand 🔍</span>
                    </div>
                  </div>

                  {/* Image Body with subtle hover zoom */}
                  <div className="relative w-full max-h-[460px] overflow-hidden bg-[#040812]">
                    <img
                      src={coverImage}
                      alt={post.title}
                      className="w-full h-auto object-cover max-h-[460px] group-hover/cover:scale-[1.015] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b16]/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-slate-200 font-mono flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity shadow-lg">
                      <span>Full Preview 🔍</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Multiple Links & Share Bar (like Project Details Page) ── */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="flex flex-wrap items-center justify-between gap-3 my-6 p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-lg backdrop-blur-md"
              >
                {/* Left Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Live Demo Button */}
                  {demoUrl && (
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white overflow-hidden transition-all shadow-lg active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, #7C3AED)`,
                        boxShadow: `0 4px 20px ${accentColor}40`,
                      }}
                    >
                      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {/* Source Code / GitHub Button */}
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-95 shadow-sm"
                    >
                      <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Source Code</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}

                  {/* Docs / Reference Guide Button */}
                  {docsUrl && (
                    <a
                      href={docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}

                  {/* Video Tutorial / Demo Button */}
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      <span>Watch Video</span>
                    </a>
                  )}

                  {/* Extra Post Links from Database */}
                  {postLinks.map((lnk, idx) => (
                    <a
                      key={idx}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-400 transition-all active:scale-95"
                    >
                      <Link2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{lnk.label || lnk.url}</span>
                      <ExternalLink className="w-3 h-3 text-sky-400" />
                    </a>
                  ))}
                </div>

                {/* Right: Share Button (Hero style) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#C084FC] bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.3)] hover:bg-[rgba(168,85,247,0.22)] hover:border-[rgba(168,85,247,0.5)] transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </motion.div>

              {/* ── Mobile In-Page TOC Quick-Jump Accordion ── */}
              {tocItems.length > 0 && (
                <div className="lg:hidden my-5 rounded-2xl bg-[#080d1a]/80 border border-white/[0.08] overflow-hidden shadow-lg backdrop-blur-md">
                  <button
                    onClick={() => setMobileTocExpanded(!mobileTocExpanded)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span className="font-space font-bold text-white">Jump to Section</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {tocItems.length} topics
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        mobileTocExpanded ? "rotate-180 text-sky-400" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileTocExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/[0.06] p-2.5 max-h-64 overflow-y-auto no-scrollbar space-y-1 bg-black/25"
                      >
                        {tocItems.map((item) => {
                          const isActive = activeSection === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                handleSectionClick(item.id);
                                setMobileTocExpanded(false);
                              }}
                              className={`w-full text-left text-xs py-2 px-2.5 rounded-xl transition-all flex items-center gap-2 ${
                                item.isSub ? "pl-5 text-slate-400" : "font-medium text-slate-300"
                              } ${
                                isActive
                                  ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                                  : "hover:bg-white/[0.04] hover:text-white"
                              }`}
                            >
                              <span className="text-sky-400 font-mono text-[11px]">#</span>
                              <span className="truncate">{item.text}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.header>

            {/* ── Article Content ────────────────────────── */}
            <motion.article
              ref={articleRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`transition-all duration-300 ${activeFontFamily === "space"
                ? "font-['Space_Grotesk',sans-serif]"
                : activeFontFamily === "merriweather"
                  ? "font-['Merriweather',serif]"
                  : activeFontFamily === "mono"
                    ? "font-['JetBrains_Mono',monospace]"
                    : "font-['Inter',sans-serif]"
                } ${activeFontSize === "compact"
                  ? "text-[15px] sm:text-base leading-[1.7]"
                  : activeFontSize === "large"
                    ? "text-[19px] sm:text-xl leading-[1.95]"
                    : activeFontSize === "xlarge"
                      ? "text-[21px] sm:text-2xl leading-[2.05]"
                      : "text-[16px] sm:text-[17px] leading-[1.85]"
                }`}
            >
              {post.markdown ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // MDN Style Tables
                    table: ({ children }) => (
                      <div className="my-8 overflow-x-auto rounded-xl border border-slate-800 bg-[#070b16] shadow-xl">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-[#0e1726] border-b border-slate-700/80 text-sky-300 font-space font-bold uppercase text-[11px] sm:text-xs tracking-wider">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-5 py-3.5 text-sky-300 font-bold whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    tr: ({ children }) => (
                      <tr className="border-b border-slate-800/80 hover:bg-white/[0.03] transition-colors odd:bg-transparent even:bg-white/[0.015]">
                        {children}
                      </tr>
                    ),
                    td: ({ children }) => (
                      <td className="px-5 py-3.5 text-slate-300 text-xs sm:text-[13px] leading-relaxed align-top font-sans">
                        {children}
                      </td>
                    ),

                    // Inline & Block Code
                    pre: ({ children }) => <>{children}</>,
                    code: ({ inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      if (!inline && (match || codeString.includes("\n"))) {
                        return (
                          <CodeBlock
                            codeText={codeString}
                            lang={match ? match[1] : "code"}
                          />
                        );
                      }
                      return (
                        <code
                          className="font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded text-xs sm:text-[13px]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },

                    // MDN Style Callout Boxes for Blockquotes
                    blockquote: ({ children }) => {
                      const rawText = extractText(children);
                      const isWarning = /warning|caution|alert|🚨|important/i.test(rawText);
                      const isTip = /tip|hint|💡|✨/i.test(rawText);

                      if (isWarning) {
                        return (
                          <div className="my-6 p-4 sm:p-5 rounded-xl border-l-4 border-amber-400 bg-amber-950/25 border border-amber-500/20 text-slate-200 shadow-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed [&>p]:my-1 text-amber-100/90">
                                {children}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (isTip) {
                        return (
                          <div className="my-6 p-4 sm:p-5 rounded-xl border-l-4 border-emerald-400 bg-emerald-950/25 border border-emerald-500/20 text-slate-200 shadow-lg">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed [&>p]:my-1 text-emerald-100/90">
                                {children}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Default MDN Note style
                      return (
                        <div className="my-6 p-4 sm:p-5 rounded-xl border-l-4 border-sky-400 bg-sky-950/30 border border-sky-500/20 text-slate-200 shadow-lg">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed [&>p]:my-1 text-sky-100/90">
                              {children}
                            </div>
                          </div>
                        </div>
                      );
                    },

                    // Headings with Anchor Links
                    h1: ({ children }) => {
                      const text = extractText(children);
                      if (
                        post?.title &&
                        (text.includes(post.title.substring(0, 15)) ||
                          post.title.includes(text.substring(0, 15)))
                      ) {
                        return null; // avoid duplicating the header title
                      }
                      return (
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-space font-extrabold text-white border-b border-white/10 pb-4 mt-10 mb-6 scroll-mt-24">
                          {children}
                        </h1>
                      );
                    },

                    h2: ({ children }) => {
                      const text = extractText(children);
                      const hId = slugifyText(text);
                      return (
                        <div className="group mt-12 mb-4 scroll-mt-24 pt-4 border-t border-white/[0.06]">
                          <h2
                            id={hId}
                            className="text-xl sm:text-2xl md:text-3xl font-space font-bold text-white flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-sky-400 to-[#7C3AED] inline-block" />
                              <span>{children}</span>
                            </span>
                            <a
                              href={`#${hId}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(hId);
                                if (el)
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                navigator.clipboard.writeText(
                                  `${window.location.origin}${window.location.pathname}#${hId}`
                                );
                                toast.success("Section link copied!", {
                                  icon: "🔗",
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-sky-400 transition-opacity p-1 text-sm font-mono"
                              title="Copy section link"
                            >
                              #
                            </a>
                          </h2>
                        </div>
                      );
                    },

                    h3: ({ children }) => {
                      const text = extractText(children);
                      const hId = slugifyText(text);
                      return (
                        <div className="group mt-8 mb-3 scroll-mt-24">
                          <h3
                            id={hId}
                            className="text-base sm:text-lg md:text-xl font-space font-semibold text-slate-100 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-sky-400 font-mono text-sm">
                                #
                              </span>
                              <span>{children}</span>
                            </span>
                            <a
                              href={`#${hId}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(hId);
                                if (el)
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                navigator.clipboard.writeText(
                                  `${window.location.origin}${window.location.pathname}#${hId}`
                                );
                                toast.success("Section link copied!", {
                                  icon: "🔗",
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-sky-400 transition-opacity p-1 text-xs font-mono"
                              title="Copy section link"
                            >
                              #
                            </a>
                          </h3>
                        </div>
                      );
                    },

                    p: ({ children }) => (
                      <p className="my-5 text-slate-300 leading-relaxed">
                        {children}
                      </p>
                    ),

                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4 decoration-sky-400/40 hover:decoration-sky-300 transition-colors"
                      >
                        {children}
                      </a>
                    ),

                    img: ({ src, alt, ...props }) => {
                      const isBadge =
                        src?.includes("shields.io") ||
                        src?.includes("badge") ||
                        (alt && alt.toLowerCase().includes("badge"));
                      if (isBadge) {
                        return (
                          <img
                            src={src}
                            alt={alt || "badge"}
                            className="inline-block my-1.5 mr-2 h-6 object-contain align-middle hover:scale-105 transition-transform"
                            {...props}
                          />
                        );
                      }
                      return (
                        <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#070b16]">
                          <img
                            src={src}
                            alt={alt}
                            className="w-full h-auto object-cover max-h-[600px]"
                            {...props}
                          />
                          {alt && alt !== "image" && (
                            <p className="text-center text-xs text-slate-400 py-2.5 border-t border-white/5 bg-white/[0.02] font-mono">
                              ▲ {alt}
                            </p>
                          )}
                        </div>
                      );
                    },

                    hr: () => (
                      <hr className="my-10 border-none h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    ),

                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 my-5 space-y-2 text-slate-300 leading-relaxed">
                        {children}
                      </ul>
                    ),

                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 my-5 space-y-2 text-slate-300 leading-relaxed">
                        {children}
                      </ol>
                    ),
                  }}
                >
                  {post.markdown}
                </ReactMarkdown>
              ) : (
                renderBlockContent(post.content)
              )}
            </motion.article>

            {/* ── Previous & Next Guides Navigation ────── */}
            <div className="grid sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-white/[0.08]">
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.slug || prevPost.id}`}
                  className="group p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-sky-500/30 transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 group-hover:text-sky-400">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono uppercase text-[11px]">Previous Guide</span>
                  </div>
                  <p className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {prevPost.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  to={`/blog/${nextPost.slug || nextPost.id}`}
                  className="group p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-sky-500/30 transition-all text-right sm:ml-auto w-full"
                >
                  <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 mb-1 group-hover:text-sky-400">
                    <span className="font-mono uppercase text-[11px]">Next Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {nextPost.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* ── Share Bar ─────────────────── */}
            <div className="mt-10 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Share this article:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 transition-all"
                  title="Share on X"
                >
                  <XIcon className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-all"
                  title="Share on LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-sky-400 hover:border-sky-400/40 transition-all"
                  title="Copy link"
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>More sharing options</span>
              </button>
            </div>

            {/* ── All Authors / Contributors Section ──────────────────────── */}
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
                <User className="w-4 h-4 text-sky-400" />
                <h3 className="font-space font-bold text-sm text-white uppercase tracking-wider">
                  {authors.length > 1 ? `Article Contributors (${authors.length})` : "About the Author"}
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {authors.map((aut, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/15 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-[#7C3AED] to-[#EC4899] p-0.5 shrink-0 shadow-lg">
                        {aut.avatar ? (
                          <img
                            src={aut.avatar}
                            alt={aut.name}
                            className="w-full h-full rounded-[14px] object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-[14px] bg-[#070b16] flex items-center justify-center font-bold text-white text-lg">
                            {aut.name
                              ? aut.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                              : "AD"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <h4 className="font-space font-bold text-base sm:text-lg text-white">
                                {aut.name}
                              </h4>
                              {aut.isTeam && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Team
                                </span>
                              )}
                              {authors.length > 1 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  {idx === 0 ? "Lead" : "Co-Author"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-sky-400 font-mono">
                              {aut.role || "Author & Contributor"}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            {aut.github && (
                              <a
                                href={aut.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                title="GitHub"
                              >
                                <GithubIcon className="w-4 h-4" />
                              </a>
                            )}
                            {aut.linkedin && (
                              <a
                                href={aut.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                title="LinkedIn"
                              >
                                <LinkedinIcon className="w-4 h-4" />
                              </a>
                            )}
                            {aut.email && (
                              <a
                                href={`mailto:${aut.email}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                title="Email"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                          {aut.bio ||
                            "Writing about software architecture, development practices, and modern web applications."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Curated Recommendations / Next Reads (Especially valuable for mobile readers) ── */}
            {otherPosts && otherPosts.length > 0 && (
              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="font-space font-bold text-sm text-white uppercase tracking-wider">
                      Recommended Next Reads
                    </h3>
                  </div>
                  <Link
                    to="/blog"
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {otherPosts.slice(0, 4).map((rel) => {
                    const relKey = rel.slug || rel.id;
                    return (
                      <Link
                        key={relKey}
                        to={`/blog/${relKey}`}
                        className="group p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-semibold uppercase">
                              {rel.tag || (Array.isArray(rel.tags) && rel.tags[0]) || "Guide"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{rel.readTime || "5 min"}</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-space font-bold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-2 mb-1.5">
                            {rel.title}
                          </h4>
                          {rel.excerpt && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {rel.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold mt-3 pt-2 border-t border-white/[0.04] group-hover:translate-x-1 transition-transform">
                          <span>Read Article</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile Slide-Over Drawer for Docs Sidebar & Overview ─────── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="relative w-84 max-w-[88vw] sm:w-96 h-full bg-[#070b16] border-r border-white/[0.1] p-4 flex flex-col z-10 shadow-2xl"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    {mobileDrawerTab === "toc" ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-space font-bold text-xs sm:text-sm text-white block truncate">
                      {post.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mobileDrawerTab === "toc" ? "Table of Contents" : "Article Intel & Links"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] shrink-0"
                  title="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Tab Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3 shrink-0">
                <button
                  onClick={() => setMobileDrawerTab("toc")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mobileDrawerTab === "toc"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Contents ({tocItems.length})</span>
                </button>
                <button
                  onClick={() => setMobileDrawerTab("info")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mobileDrawerTab === "info"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Overview</span>
                  {(demoUrl || githubUrl || docsUrl || postLinks.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </button>
              </div>

              {/* Drawer Tab Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5" data-lenis-prevent>
                {mobileDrawerTab === "toc" ? (
                  <DocsSidebar
                    filterQuery={filterQuery}
                    setFilterQuery={setFilterQuery}
                    tocItems={tocItems}
                    activeSection={activeSection}
                    onNavigate={() => setMobileDrawerOpen(false)}
                    onSectionClick={(id) => {
                      handleSectionClick(id);
                      setMobileDrawerOpen(false);
                    }}
                  />
                ) : (
                  <ArticleDetailsSidebar
                    post={post}
                    author={author}
                    authors={authors}
                    readingTime={readingTime}
                    viewCount={viewCount}
                    demoUrl={demoUrl}
                    githubUrl={githubUrl}
                    docsUrl={docsUrl}
                    videoUrl={videoUrl}
                    postLinks={postLinks}
                    otherPosts={otherPosts}
                    tags={tags}
                    coverImage={coverImage}
                    setLightbox={(img) => {
                      setLightbox(img);
                      setMobileDrawerOpen(false);
                    }}
                    setShareOpen={(val) => {
                      setShareOpen(val);
                      setMobileDrawerOpen(false);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Rich Share Modal (like Project Details Page) ────── */}
      <AnimatePresence>
        {shareOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md bg-[#070b16] border border-white/[0.12] rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-space font-bold text-white">Share Article</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{post.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big Copy Link Bar */}
              <div className="p-4 pb-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 transition-all group text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${linkCopied ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/15 text-purple-300"
                      }`}
                  >
                    {linkCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{linkCopied ? "Link Copied!" : "Copy Link"}</span>
                      {linkCopied && (
                        <span className="text-[10px] text-emerald-400 font-mono font-normal">
                          Copied to clipboard
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {window.location.href}
                    </p>
                  </div>
                </button>
              </div>

              {/* Social Channels Grid */}
              <div className="p-4 grid grid-cols-3 gap-2.5">
                {[
                  {
                    label: "WhatsApp",
                    color: "#25D366",
                    bg: "rgba(37,211,102,0.12)",
                    url: `https://wa.me/?text=${encodeURIComponent(
                      post.title + " - Read this article: " + window.location.href
                    )}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Twitter / X",
                    color: "#FFFFFF",
                    bg: "rgba(255,255,255,0.08)",
                    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      post.title
                    )}&url=${encodeURIComponent(window.location.href)}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.858L1.542 2.25h6.774l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: "LinkedIn",
                    color: "#0A66C2",
                    bg: "rgba(10,102,194,0.12)",
                    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href
                    )}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Facebook",
                    color: "#1877F2",
                    bg: "rgba(24,119,242,0.12)",
                    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Telegram",
                    color: "#26A5E4",
                    bg: "rgba(38,165,228,0.12)",
                    url: `https://t.me/share/url?url=${encodeURIComponent(
                      window.location.href
                    )}&text=${encodeURIComponent(post.title)}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Reddit",
                    color: "#FF4500",
                    bg: "rgba(255,69,0,0.12)",
                    url: `https://reddit.com/submit?url=${encodeURIComponent(
                      window.location.href
                    )}&title=${encodeURIComponent(post.title)}`,
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                    ),
                  },
                ].map(({ label, color, bg, icon, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/15 transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
                      style={{ backgroundColor: bg, color }}
                    >
                      {icon}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </a>
                ))}
              </div>

              {/* Native Share button */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <div className="p-4 pt-1">
                  <button
                    onClick={() => {
                      navigator.share({ title: post.title, url: window.location.href });
                      setShareOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition-all"
                  >
                    <span>More options...</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lightbox Modal for Cover Image (like Project Details Page) ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              src={lightbox}
              alt={post.title}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-5xl max-h-[85vh] w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl font-bold"
              title="Close full view"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed Floating Mobile Bottom Quick Action Dock ───────────────────── */}
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 lg:hidden pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mx-auto max-w-md bg-[#070b16]/95 backdrop-blur-2xl border border-white/[0.14] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(56,189,248,0.1)] p-1.5 flex items-center justify-between gap-1 pointer-events-auto"
        >
          {/* 1. Contents / TOC Button */}
          <button
            onClick={() => {
              setMobileDrawerTab("toc");
              setMobileDrawerOpen(true);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
              mobileDrawerOpen && mobileDrawerTab === "toc"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Table of Contents"
          >
            <BookOpen className="w-4 h-4 mb-0.5 text-sky-400" />
            <span className="text-[10px] font-semibold tracking-tight">Contents</span>
          </button>

          {/* 2. Overview / Links Button */}
          <button
            onClick={() => {
              setMobileDrawerTab("info");
              setMobileDrawerOpen(true);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 relative ${
              mobileDrawerOpen && mobileDrawerTab === "info"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Article Intel & Links"
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-purple-400" />
            <span className="text-[10px] font-semibold tracking-tight">Overview</span>
            {(demoUrl || githubUrl || docsUrl || postLinks.length > 0) && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
            )}
          </button>

          {/* 3. Primary Action Button (Demo or Code or Docs) */}
          {(demoUrl || githubUrl || docsUrl) && (
            <a
              href={demoUrl || githubUrl || docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[1.1] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs text-white transition-all active:scale-95 shadow-md"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #7C3AED)`,
              }}
              title={demoUrl ? "Open Live Demo" : githubUrl ? "View Source Code" : "Read Docs"}
            >
              {demoUrl ? (
                <Globe className="w-3.5 h-3.5 shrink-0" />
              ) : githubUrl ? (
                <GithubIcon className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate max-w-[64px]">
                {demoUrl ? "Demo" : githubUrl ? "Code" : "Docs"}
              </span>
            </a>
          )}

          {/* 4. Share Button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all active:scale-95"
            title="Share Article"
          >
            <Share2 className="w-4 h-4 mb-0.5 text-sky-400" />
            <span className="text-[10px] font-semibold tracking-tight">Share</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
