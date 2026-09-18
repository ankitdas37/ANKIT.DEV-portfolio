import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Calendar, Tag, Share2,
  Link2, BookOpen, ChevronRight, ExternalLink
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useState } from "react";

/* ── Anchor copy helper ──────────────────────────────────────────── */
function CopyAnchorBtn({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copy link to this section"
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.25)] text-[10px] text-[#A855F7] hover:text-white hover:bg-[rgba(124,58,237,0.3)] align-middle"
    >
      {copied ? "✓ Copied!" : "🔗 §"}
    </button>
  );
}

/* ── Block Link Button ───────────────────────────────────────────── */
function BlockLink({ link, label }) {
  if (!link) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.25)] text-[#06B6D4] text-sm font-semibold hover:bg-[rgba(6,182,212,0.18)] hover:text-white transition-all group/link"
    >
      <span>🔗</span>
      <span>{label || "Visit Link"}</span>
      <svg className="w-3.5 h-3.5 opacity-60 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

/* ── Content Block Renderer ──────────────────────────────────────── */
function renderContent(content) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <p className="text-[#94A3B8] leading-relaxed text-base">
        No content available for this post yet.
      </p>
    );
  }

  return content.map((block, idx) => {
    const anchorId = `block-${idx}`;

    switch (block.type) {
      case "paragraph":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <p className="text-[#94A3B8] leading-[1.85] text-base mb-2">
              {block.text}
            </p>
            <BlockLink link={block.link} label={block.linkLabel} />
            {block.link && <div className="mb-4" />}
            {!block.link && <div className="mb-4" />}
          </div>
        );
      case "heading":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <h2 className="text-2xl font-space font-bold text-white mt-10 mb-2 leading-tight inline">
              {block.text}
              <CopyAnchorBtn id={anchorId} />
            </h2>
            <BlockLink link={block.link} label={block.linkLabel} />
            <div className="mb-2" />
          </div>
        );
      case "subheading":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <h3 className="text-lg font-space font-semibold text-[#C4B5FD] mt-8 mb-2 leading-snug inline">
              {block.text}
              <CopyAnchorBtn id={anchorId} />
            </h3>
            <BlockLink link={block.link} label={block.linkLabel} />
            <div className="mb-1" />
          </div>
        );
      case "image":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 my-10">
            <figure>
              <div className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <img
                  src={block.src}
                  alt={block.caption || "Blog image"}
                  className="w-full object-cover max-h-[480px]"
                  style={{ display: "block" }}
                />
              </div>
              {block.caption && (
                <figcaption className="text-center text-xs text-[#475569] mt-3 italic">
                  {block.caption}
                </figcaption>
              )}
            </figure>
            <BlockLink link={block.link} label={block.linkLabel} />
          </div>
        );
      case "quote":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <blockquote className="my-8 pl-5 border-l-4 border-[#7C3AED] bg-[rgba(124,58,237,0.06)] rounded-r-xl py-4 pr-4">
              <p className="text-[#C4B5FD] italic leading-relaxed text-base">
                "{block.text}"
              </p>
              {block.author && (
                <cite className="text-xs text-[#64748B] mt-2 block not-italic">
                  — {block.author}
                </cite>
              )}
            </blockquote>
            <BlockLink link={block.link} label={block.linkLabel} />
          </div>
        );
      case "code":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28 my-8">
            {block.lang && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] rounded-t-xl border-b-0">
                <span className="text-xs font-mono text-[#A855F7] font-bold uppercase tracking-widest">
                  {block.lang}
                </span>
              </div>
            )}
            <pre className={`bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] ${block.lang ? "rounded-b-xl rounded-tr-xl" : "rounded-xl"} p-5 overflow-x-auto`}>
              <code className="text-sm font-mono text-[#E2E8F0] leading-relaxed whitespace-pre">
                {block.text}
              </code>
            </pre>
            <BlockLink link={block.link} label={block.linkLabel} />
          </div>
        );
      case "list":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <ul className="mb-4 space-y-2 pl-1">
              {(block.items || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#94A3B8] text-base leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-2.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <BlockLink link={block.link} label={block.linkLabel} />
          </div>
        );
      case "divider":
        return (
          <div key={idx} id={anchorId} className="my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] opacity-50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] opacity-30" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] opacity-50" />
            </div>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>
        );
      case "richtext":
        return (
          <div key={idx} id={anchorId} className="group/block scroll-mt-28">
            <div
              className="blog-richtext mb-4"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
            <BlockLink link={block.link} label={block.linkLabel} />
          </div>
        );
      default:
        return null;
    }
  });
}


/* ── Share Button ──────────────────────────────────────────────── */
function ShareBtn({ post }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#475569] mr-1">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#1DA1F2] hover:border-[rgba(29,161,242,0.3)] transition-all"
        title="Share on Twitter"
      >
        {/* Twitter/X SVG */}
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#0A66C2] hover:border-[rgba(10,102,194,0.3)] transition-all"
        title="Share on LinkedIn"
      >
        {/* LinkedIn SVG */}
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <button
        onClick={copy}
        className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#A855F7] hover:border-[rgba(168,85,247,0.3)] transition-all"
        title="Copy link"
      >
        {copied ? (
          <span className="text-[10px] font-bold text-[#10B981] px-1">Copied!</span>
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

/* ── Related Post Card ─────────────────────────────────────────── */
function RelatedCard({ post, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group cursor-pointer p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(124,58,237,0.35)] hover:bg-[rgba(124,58,237,0.04)] transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{post.emoji}</span>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full"
          style={{ color: post.tagColor, background: `${post.tagColor}1A` }}
        >
          {post.tag}
        </span>
      </div>
      <h4 className="text-sm font-space font-semibold text-white leading-snug group-hover:text-[#A855F7] transition-colors line-clamp-2 mb-2">
        {post.title}
      </h4>
      <p className="text-xs text-[#64748B] flex items-center gap-1">
        <Clock className="w-3 h-3" /> {post.readTime}
      </p>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { blogPosts } = useData();

  const post = blogPosts.find((p) => p.slug === slug && !p.hidden);
  const visiblePosts = blogPosts.filter(p => !p.hidden);
  const related = visiblePosts.filter((p) => p.slug !== slug && p.tag === post?.tag).slice(0, 3);
  const otherRelated = visiblePosts.filter(
    (p) => p.slug !== slug && p.tag !== post?.tag
  ).slice(0, Math.max(0, 3 - related.length));
  const relatedPosts = [...related, ...otherRelated].slice(0, 3);

  if (!post) {
    return (
      <main className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📭</p>
          <h1 className="text-2xl font-space font-bold text-white mb-2">Post Not Found</h1>
          <p className="text-[#64748B] mb-6">This blog post doesn't exist or was removed.</p>
          <button
            onClick={() => navigate("/blog")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Back to Blog
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#02050D] relative overflow-x-hidden">
      {/* ── Ambient glows ── */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.035] blur-[200px] pointer-events-none"
        style={{ background: post.tagColor }} />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.03] blur-[160px] pointer-events-none" />

      {/* ── Back nav bar ── */}
      <div className="sticky top-0 z-50 bg-[rgba(2,5,13,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.05)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#475569]">
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/")}>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/blog")}>Blog</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#94A3B8] truncate max-w-[180px]">{post.title}</span>
          </div>

          <ShareBtn post={post} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24">
        <div className="grid lg:grid-cols-[1fr_300px] gap-14 items-start">

          {/* ── Article ─────────────────────────────────────────── */}
          <article>

            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              {/* Tag + emoji */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ color: post.tagColor, background: `${post.tagColor}1A` }}
                >
                  <Tag className="w-3 h-3" />
                  {post.tag}
                </span>
                <span className="text-3xl">{post.emoji}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-space font-bold text-white leading-tight mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-[#64748B] leading-relaxed mb-8">
                {post.excerpt}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-1.5 text-sm text-[#475569]">
                  <Calendar className="w-4 h-4" />
                  {post.date || "Unknown"}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#475569]">
                  <Clock className="w-4 h-4" />
                  {post.readTime || "Unknown"}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#475569]">
                  <BookOpen className="w-4 h-4" />
                  Article
                </div>
              </div>
            </motion.div>

            {/* ── Content Blocks ───────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="prose-content"
            >
              {renderContent(post.content)}
            </motion.div>

            {/* ── Post footer ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-14 pt-8 border-t border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#475569] mb-1">Written by</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-xs font-bold text-white">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Ankit</p>
                      <p className="text-xs text-[#64748B]">Developer · Writer</p>
                    </div>
                  </div>
                </div>
                <ShareBtn post={post} />
              </div>
            </motion.div>

          </article>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Reading progress indicator */}
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">About This Post</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: `${post.tagColor}18` }}>
                      {post.emoji}
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Category</p>
                      <p className="text-sm font-semibold" style={{ color: post.tagColor }}>{post.tag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Read Time</p>
                      <p className="text-sm font-semibold text-white">{post.readTime || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#64748B]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Published</p>
                      <p className="text-sm font-semibold text-white">{post.date || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">Related Posts</p>
                  <div className="space-y-3">
                    {relatedPosts.map((rp) => (
                      <RelatedCard
                        key={rp.id}
                        post={rp}
                        onClick={() => navigate(`/blog/${rp.slug}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl border border-dashed border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.04)] p-5 text-center">
                <p className="text-xl mb-2">✍️</p>
                <p className="text-xs font-bold text-white mb-1">More posts coming</p>
                <p className="text-xs text-[#64748B] mb-3">I publish regularly about dev life, React, and more.</p>
                <button
                  onClick={() => navigate("/blog")}
                  className="w-full py-2 rounded-xl bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] text-[#A855F7] text-xs font-bold hover:bg-[rgba(168,85,247,0.25)] transition-all"
                >
                  View All Posts
                </button>
              </div>

            </div>
          </aside>

        </div>

        {/* ── Mobile: Related posts ─────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <div className="lg:hidden mt-14">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Related Posts</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <RelatedCard
                  key={rp.id}
                  post={rp}
                  onClick={() => navigate(`/blog/${rp.slug}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
