import { useState, useMemo } from "react";
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
  AlertCircle
} from "lucide-react";
import { learnedSkills } from "../data/portfolio";
import { useData } from "../context/DataContext";

export default function Certificates() {
  const { certificates } = useData();
  const [filter, setFilter] = useState("All Certificates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
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

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      if (cert.hidden) return false;
      const certCats = Array.isArray(cert.category) ? cert.category : (cert.category ? [cert.category] : []);
      const matchesCategory = filter === "All Certificates" || certCats.includes(filter);
      const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            cert.organization.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filter, searchQuery, certificates]);

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
      className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden"
      aria-label="Certificates and achievements"
    >
      {/* Background Glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#7C3AED] opacity-[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.05] blur-[120px] pointer-events-none" />

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
                {filteredCertificates.map((cert) => (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-[75vw] max-w-[280px] sm:w-auto shrink-0 snap-center group relative flex flex-col glass bg-[rgba(7,17,31,0.8)] rounded-[20px] border border-[rgba(37,99,235,0.15)] overflow-hidden"
                  >
                    {/* Glowing Platform Accent */}
                    <div className="absolute top-0 inset-x-0 h-1" style={{ background: cert.color, opacity: 0.8 }} />
                    <div className="absolute top-0 inset-x-0 h-32 blur-[40px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40" style={{ background: cert.color }} />

                    {/* Certificate Preview Box (3D representation) */}
                    <div className="relative pt-5 px-4 pb-1 z-10 flex flex-col items-center justify-center flex-grow">
                      {/* Year badge */}
                      <div className="absolute top-3 left-4 text-[10px] font-bold text-white opacity-80 bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded">
                        {cert.date}
                      </div>

                      <div className="mt-3 relative w-full aspect-[4/3] rounded-xl border border-[rgba(255,255,255,0.1)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] p-4 flex flex-col justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden">
                        
                        {cert.image ? (
                          <>
                            <img 
                              src={cert.image} 
                              alt={cert.title} 
                              className="absolute inset-0 w-full h-full object-cover cursor-pointer" 
                              onClick={() => setSelectedImage(cert.image)}
                            />
                            <div className="absolute inset-0 bg-[rgba(2,5,13,0.3)] pointer-events-none" />
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
                          <Award className="w-5 h-5 opacity-80" style={{ color: cert.color }} />
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
                        <span className="text-[11px] font-semibold text-white">{cert.organization}</span>
                        <div className="flex items-center gap-1 text-[9px] text-[#10B981] font-medium bg-[rgba(16,185,129,0.1)] px-1.5 py-0.5 rounded-full border border-[rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 border-t border-[rgba(37,99,235,0.15)] mt-auto relative z-10 bg-[rgba(0,0,0,0.2)]">
                      <button 
                        onClick={() => cert.image ? setSelectedImage(cert.image) : showToast("No image available to view")}
                        className="flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold text-[#A855F7] hover:text-white hover:bg-[rgba(168,85,247,0.15)] transition-colors border-r border-[rgba(37,99,235,0.15)]"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button 
                        onClick={() => cert.link ? window.open(cert.link, "_blank", "noopener,noreferrer") : showToast("Coming soon!")}
                        className="flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold text-[#10B981] hover:text-white hover:bg-[rgba(16,185,129,0.15)] transition-colors"
                      >
                        Verify
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[101]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Certificate Full View"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
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
