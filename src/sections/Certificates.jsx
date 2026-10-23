import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Calendar, 
  Clock, 
  Star, 
  Search, 
  Eye, 
  ExternalLink,
  CheckCircle2,
  BookOpen,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Maximize2
} from "lucide-react";
import { learnedSkills } from "../data/portfolio";
import { useData } from "../context/DataContext";

// Helper: Convert any URL (including Cloudinary PDF) to a crisp page-1 image preview
const getCertificatePreviewUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf?");
  if (isPdf && url.includes("cloudinary.com")) {
    let preview = url.replace(/\.pdf($|\?.*)/i, ".jpg$1");
    if (!preview.includes("pg_1") && preview.includes("/upload/")) {
      preview = preview.replace("/upload/", "/upload/pg_1,w_1200,f_auto,q_auto/");
    }
    return preview;
  }
  return url;
};

export default function Certificates() {
  const { certificates } = useData();
  const [filter, setFilter] = useState("All Certificates");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalData, setModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const categories = useMemo(() => {
    const cats = new Set(["All Certificates"]);
    certificates.forEach(cert => {
      if (cert.hidden) return;
      const certCats = Array.isArray(cert.category) ? cert.category : (cert.category ? [cert.category] : []);
      certCats.forEach(cat => {
        if (cat.trim()) cats.add(cat.trim());
      });
    });
    return Array.from(cats);
  }, [certificates]);

  // Sort strictly by admin-controlled cert_order (1st, 2nd, etc.)
  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      const orderA = a.cert_order !== undefined && a.cert_order !== null ? Number(a.cert_order) : 9999;
      const orderB = b.cert_order !== undefined && b.cert_order !== null ? Number(b.cert_order) : 9999;
      if (orderA !== orderB) return orderA - orderB;
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
    });
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return sortedCertificates.filter((cert) => {
      if (cert.hidden) return false;
      const certCats = Array.isArray(cert.category) ? cert.category : (cert.category ? [cert.category] : []);
      const matchesCategory = filter === "All Certificates" || certCats.includes(filter);
      const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cert.organization.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filter, searchQuery, sortedCertificates]);

  // Open enhanced modal for multi-image & PDF viewing
  const openModal = (cert, initialIndex = 0) => {
    const rawImages = Array.isArray(cert.images) && cert.images.length > 0 
      ? cert.images 
      : (cert.image ? [cert.image] : []);
    
    const pdfUrl = cert.pdf_url || (typeof cert.image === "string" && cert.image.toLowerCase().endsWith(".pdf") ? cert.image : "");
    const hasPdf = Boolean(pdfUrl);

    // If no raw images but PDF exists, generate preview
    const imagesList = rawImages.length > 0 
      ? rawImages.map(getCertificatePreviewUrl) 
      : (hasPdf ? [getCertificatePreviewUrl(pdfUrl)] : []);

    if (imagesList.length === 0 && !hasPdf) {
      showToast("No image preview available for this certificate.");
      return;
    }

    setModalData({
      cert,
      images: imagesList,
      activeIndex: Math.min(initialIndex, Math.max(0, imagesList.length - 1)),
      isPdfMode: false,
      hasPdf,
      pdfUrl
    });
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!modalData) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setModalData(null);
      if (e.key === "ArrowLeft" && modalData.images.length > 1) {
        setModalData(prev => prev ? {
          ...prev,
          activeIndex: (prev.activeIndex - 1 + prev.images.length) % prev.images.length
        } : null);
      }
      if (e.key === "ArrowRight" && modalData.images.length > 1) {
        setModalData(prev => prev ? {
          ...prev,
          activeIndex: (prev.activeIndex + 1) % prev.images.length
        } : null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalData]);

  const totalCerts = certificates.filter(c => !c.hidden).length;
  const platforms = new Set(certificates.filter(c => !c.hidden).map(c => c.organization)).size;
  const totalHours = certificates.filter(c => !c.hidden).reduce((acc, c) => acc + (Number(c.hours) || 0), 0);

  const dynamicStats = [
    { icon: "Award", value: `${totalCerts}+`, label: "Certificates" },
    { icon: "Calendar", value: `${platforms}+`, label: "Platforms" },
    { icon: "Clock", value: `${totalHours}+`, label: "Hours Learned" },
    { icon: "Star", value: "100%", label: "Dedication" }
  ];

  return (
    <section
      id="certificates"
      className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden section-contain"
      aria-label="Certificates and achievements"
    >
      {/* Background Glow */}
      <div 
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-xs font-mono font-bold tracking-widest text-[#94A3B8] uppercase">
                    MY ACHIEVEMENTS
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-space font-bold text-white mb-4">
                  My <span className="text-[#7C3AED]">Certificates</span>
                </h2>
                <p className="text-[#94A3B8]">
                  These certificates represent my commitment to learning<br className="hidden sm:block" />
                  and growing as a developer.
                </p>
              </motion.div>

              {/* Top Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 sm:gap-8 bg-[rgba(7,17,31,0.6)] backdrop-blur-md border border-[rgba(37,99,235,0.15)] rounded-2xl p-4 sm:p-6"
              >
                {dynamicStats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center text-center">
                    <div className="mb-2">
                      {stat.icon === "Award" && <Award className="w-5 h-5 text-[#A855F7]" />}
                      {stat.icon === "Calendar" && <Calendar className="w-5 h-5 text-[#A855F7]" />}
                      {stat.icon === "Clock" && <Clock className="w-5 h-5 text-[#A855F7]" />}
                      {stat.icon === "Star" && <Star className="w-5 h-5 text-[#A855F7]" />}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1 leading-none">{stat.value}</div>
                    <div className="text-[10px] sm:text-[11px] text-[#94A3B8] tracking-wide font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Filters & Search Row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div className="flex overflow-x-auto snap-x gap-2 w-full md:w-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`shrink-0 snap-start px-4 py-2 text-[10px] sm:text-xs font-medium rounded-xl transition-all duration-300 border ${
                      filter === cat
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        : "bg-[rgba(7,17,31,0.6)] text-[#94A3B8] border-[rgba(37,99,235,0.15)] hover:border-[rgba(37,99,235,0.4)] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input 
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[rgba(7,17,31,0.6)] border border-[rgba(37,99,235,0.2)] rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </motion.div>

            {/* Certificates Grid (Horizontal Swipe on Mobile) */}
            <motion.div layout className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <AnimatePresence mode="popLayout">
                {filteredCertificates.map((cert) => {
                  const rawImages = Array.isArray(cert.images) && cert.images.length > 0 
                    ? cert.images 
                    : (cert.image ? [cert.image] : []);
                  const pdfUrl = cert.pdf_url || (typeof cert.image === "string" && cert.image.toLowerCase().endsWith(".pdf") ? cert.image : "");
                  const hasPdf = Boolean(pdfUrl);
                  const primaryPreview = getCertificatePreviewUrl(rawImages[0] || cert.image || pdfUrl);
                  const imageCount = rawImages.length;

                  return (
                    <motion.div
                      key={cert.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="w-[75vw] max-w-[280px] sm:w-auto shrink-0 snap-center group relative flex flex-col glass bg-[rgba(7,17,31,0.8)] rounded-[20px] border border-[rgba(37,99,235,0.15)] hover:border-[rgba(37,99,235,0.4)] transition-all overflow-hidden"
                    >
                      {/* Glowing Platform Accent */}
                      <div className="absolute top-0 inset-x-0 h-1" style={{ background: cert.color || "#10B981", opacity: 0.8 }} />
                      <div className="absolute top-0 inset-x-0 h-32 blur-[40px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: cert.color || "#10B981" }} />

                      {/* Certificate Preview Box (3D representation) */}
                      <div className="relative pt-5 px-4 pb-1 z-10 flex flex-col items-center justify-center flex-grow">
                        {/* Year badge & Document/Photo Badges */}
                        <div className="absolute top-3 left-4 right-4 flex items-center justify-between gap-1 z-20 pointer-events-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-white opacity-90 bg-[rgba(255,255,255,0.12)] px-2 py-0.5 rounded shadow">
                              {cert.date}
                            </span>
                            {imageCount > 1 && (
                              <span className="text-[9px] font-bold text-purple-300 bg-purple-900/60 border border-purple-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                                <ImageIcon className="w-2.5 h-2.5" /> {imageCount}
                              </span>
                            )}
                          </div>
                          {hasPdf && (
                            <span className="text-[9px] font-bold text-red-300 bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                              <FileText className="w-2.5 h-2.5 text-red-400" /> PDF
                            </span>
                          )}
                        </div>

                        <div 
                          className="mt-3 relative w-full aspect-[4/3] rounded-xl border border-[rgba(255,255,255,0.1)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden cursor-pointer"
                          onClick={() => openModal(cert, 0)}
                        >
                          {primaryPreview ? (
                            <>
                              <img 
                                src={primaryPreview} 
                                alt={cert.title} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,5,13,0.5)] via-transparent to-transparent pointer-events-none" />
                              
                              {/* Hover overlay hint */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xl">
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> View Certificate
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* 3D Glass Frame Inner Border */}
                              <div className="absolute inset-1 border border-[rgba(255,255,255,0.1)] rounded-lg pointer-events-none" />
                              
                              <div className="text-center w-full px-2 relative z-10">
                                <h4 className="text-[12px] font-bold text-white leading-snug mb-1">{cert.title}</h4>
                                <div className="text-[9px] text-[#94A3B8] font-mono mt-1">Certificate</div>
                              </div>
                              
                              {/* Pedestal style glowing line */}
                              <div className="absolute bottom-4 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent z-10" />
                            </>
                          )}
                          
                          <div className="absolute bottom-2 right-3 z-10">
                            <Award className="w-5 h-5 opacity-80" style={{ color: cert.color || "#10B981" }} />
                          </div>
                        </div>
                        
                        {/* Categories / Tags */}
                        <div className="flex flex-wrap gap-1.5 w-full mt-4">
                          {(Array.isArray(cert.category) ? cert.category : (cert.category ? [cert.category] : [])).map(cat => (
                            <span key={cat} className="text-[9px] px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#94A3B8] font-mono uppercase tracking-wider">
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Platform & Verified badge */}
                        <div className="flex items-center justify-between w-full mt-3 mb-2">
                          <span className="text-[11px] font-semibold text-white truncate max-w-[65%]">{cert.organization}</span>
                          <div className="flex items-center gap-1 text-[9px] text-[#10B981] font-medium bg-[rgba(16,185,129,0.1)] px-1.5 py-0.5 rounded-full border border-[rgba(16,185,129,0.2)] shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 border-t border-[rgba(37,99,235,0.15)] mt-auto relative z-10 bg-[rgba(0,0,0,0.2)]">
                        <button 
                          onClick={() => openModal(cert, 0)}
                          className="flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold text-[#A855F7] hover:text-white hover:bg-[rgba(168,85,247,0.15)] transition-colors border-r border-[rgba(37,99,235,0.15)]"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button 
                          onClick={() => {
                            if (cert.link) {
                              window.open(cert.link, "_blank", "noopener,noreferrer");
                            } else if (pdfUrl) {
                              window.open(pdfUrl, "_blank", "noopener,noreferrer");
                            } else {
                              showToast("Credential verification link coming soon!");
                            }
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold text-[#10B981] hover:text-white hover:bg-[rgba(16,185,129,0.15)] transition-colors"
                        >
                          Verify
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Bottom Quote Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-gradient-to-r from-[rgba(124,58,237,0.15)] to-[rgba(37,99,235,0.05)] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5 sm:p-6 relative overflow-hidden"
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.5)] relative z-10">
                <Star className="w-6 h-6 text-[#A855F7]" />
              </div>
              <div className="relative z-10 text-center sm:text-left">
                <p className="text-white font-medium text-sm sm:text-base mb-1">
                  "The more you learn, the more you earn."
                </p>
                <p className="text-[#94A3B8] text-xs sm:text-sm">
                  Continuous learning is my superpower.
                </p>
              </div>
              
              {/* Decorative graphic in banner */}
              <div className="absolute right-10 bottom-0 opacity-30 pointer-events-none hidden sm:block">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-lg rotate-[30deg] blur-[15px]" />
              </div>
            </motion.div>

          </div>

          {/* Sidebar Column (Right) */}
          <div className="hidden xl:flex xl:col-span-4 flex-col gap-6">
            
            {/* Achievement Unlocked 3D Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass bg-[rgba(7,17,31,0.7)] border border-[rgba(37,99,235,0.15)] rounded-[24px] p-6 relative overflow-hidden group flex flex-col items-center text-center xl:text-left xl:items-start"
            >
              <div className="flex items-center gap-2 mb-6 xl:w-full">
                <Award className="w-4 h-4 text-[#A855F7]" />
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Achievement Unlocked</h3>
              </div>

              {/* 3D Star Display */}
              <div className="relative w-full max-w-[240px] xl:max-w-none aspect-square flex items-center justify-center mb-8 mx-auto">
                <div className="absolute inset-0 bg-[#2563EB] opacity-10 blur-[50px] rounded-full" />
                
                {/* Outer Ring */}
                <div className="absolute w-full h-full border border-[rgba(37,99,235,0.2)] rounded-full border-b-[rgba(37,99,235,0.8)] border-r-[rgba(37,99,235,0.5)] transform rotate-45 transition-transform duration-1000 group-hover:rotate-180" />
                
                {/* 3D Glass Medal */}
                <div className="relative w-3/4 h-3/4 rounded-[20px] bg-gradient-to-b from-[rgba(124,58,237,0.2)] via-[rgba(7,17,31,0.8)] to-[rgba(37,99,235,0.1)] border-t border-l border-[rgba(168,85,247,0.5)] border-r border-b border-[rgba(0,0,0,0.8)] flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.8),_inset_0_2px_10px_rgba(168,85,247,0.3)] transform transition-transform duration-700 hover:rotate-2 hover:scale-105 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.9),_0_0_40px_rgba(124,58,237,0.3)] z-10 backdrop-blur-md">
                  
                  {/* Inner glowing star */}
                  <Star className="w-20 h-20 text-[#A855F7] filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" fill="url(#star-gradient)" strokeWidth={1.5} />
                  
                  {/* SVG Gradient Definition */}
                  <svg width="0" height="0" className="absolute">
                    <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop stopColor="#A855F7" offset="0%" />
                      <stop stopColor="#7C3AED" offset="100%" />
                    </linearGradient>
                  </svg>

                  {/* Base slot detail */}
                  <div className="absolute bottom-4 w-1/3 h-1 bg-[rgba(255,255,255,0.2)] rounded-full" />
                </div>

                {/* Pedestal Base (Below Medal) */}
                <div className="absolute -bottom-2 w-4/5 h-10 rounded-[100%] border border-[rgba(37,99,235,0.3)] bg-gradient-to-t from-[rgba(37,99,235,0.1)] to-transparent shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center z-0" >
                  <div className="w-3/4 h-6 rounded-[100%] border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.05)]" />
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-2 xl:w-full">Keep Learning, Keep Growing!</h4>
              <p className="text-xs text-[#94A3B8] xl:w-full leading-relaxed">
                Every certificate is a step towards becoming a <span className="text-[#A855F7] font-semibold">better version</span> of myself.
              </p>
            </motion.div>


          </div>

        </div>
      </div>

      {/* Enhanced Lightbox & PDF Viewer Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalData(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
          >
            <div 
              className="relative w-full max-w-5xl flex flex-col gap-3 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[rgba(15,23,42,0.85)] border border-[rgba(255,255,255,0.1)] backdrop-blur-lg shadow-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
                    #{modalData.cert.cert_order || 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {modalData.cert.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {modalData.cert.organization} · {modalData.cert.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Toggle between Image & PDF viewer if PDF exists */}
                  {modalData.hasPdf && (
                    <button
                      type="button"
                      onClick={() => setModalData(m => ({ ...m, isPdfMode: !m.isPdfMode }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        modalData.isPdfMode
                          ? "bg-purple-600 text-white border-purple-500 shadow-md"
                          : "bg-[rgba(255,255,255,0.06)] text-[#94A3B8] hover:text-white border-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {modalData.isPdfMode ? (
                        <>
                          <ImageIcon className="w-3.5 h-3.5" /> View as Image
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-red-400" /> Interactive PDF View
                        </>
                      )}
                    </button>
                  )}

                  {/* Direct PDF Download / Open link */}
                  {modalData.hasPdf && (
                    <a
                      href={modalData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Open or Download Original PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  )}

                  {/* Verification Link */}
                  {modalData.cert.link && (
                    <a
                      href={modalData.cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      Verify <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setModalData(null)}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors ml-1"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Media Body */}
              <div className="relative w-full rounded-2xl bg-[rgba(2,5,13,0.7)] border border-[rgba(255,255,255,0.08)] overflow-hidden flex items-center justify-center min-h-[50vh] max-h-[75vh] p-2 sm:p-4 shadow-2xl">
                {modalData.isPdfMode && modalData.pdfUrl ? (
                  /* Interactive PDF Embed */
                  <iframe
                    src={`${modalData.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                    className="w-full h-[70vh] rounded-xl border border-white/10 bg-[#07111F]"
                    title={`PDF of ${modalData.cert.title}`}
                  />
                ) : (
                  /* Image Carousel Preview */
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {modalData.images.length > 0 && (
                        <motion.img
                          key={modalData.activeIndex}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                          src={modalData.images[modalData.activeIndex]}
                          alt={`${modalData.cert.title} - Page ${modalData.activeIndex + 1}`}
                          className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
                        />
                      )}
                    </AnimatePresence>

                    {/* Navigation Arrows for Multi-image */}
                    {modalData.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setModalData(m => ({
                            ...m,
                            activeIndex: (m.activeIndex - 1 + m.images.length) % m.images.length
                          }))}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all shadow-xl hover:scale-105"
                          title="Previous (Left Arrow)"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalData(m => ({
                            ...m,
                            activeIndex: (m.activeIndex + 1) % m.images.length
                          }))}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all shadow-xl hover:scale-105"
                          title="Next (Right Arrow)"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Page Counter Badge */}
                        <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-semibold shadow-lg">
                          Page {modalData.activeIndex + 1} of {modalData.images.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Thumbnail Strip (if multiple images) */}
              {!modalData.isPdfMode && modalData.images.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 max-w-full">
                  {modalData.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalData(m => ({ ...m, activeIndex: idx }))}
                      className={`relative w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        idx === modalData.activeIndex
                          ? "border-emerald-400 scale-105 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                          : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-mono text-center">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full bg-[rgba(7,17,31,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] shadow-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-sm font-semibold text-white">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
