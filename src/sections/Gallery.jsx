import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, X, Folder, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "../context/DataContext";

export default function Gallery() {
  const { gallery } = useData();
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // Filter hidden folders
  const visibleFolders = gallery?.filter(f => !f.hidden) || [];
  
  // Get currently active folder and its visible images
  const activeFolder = visibleFolders.find(f => f.id === activeFolderId);
  const visibleImages = activeFolder?.images?.filter(img => !img.hidden) || [];

  // Handle Lightbox Keyboard Navigation
  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowLeft") setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : visibleImages.length - 1));
      if (e.key === "ArrowRight") setSelectedPhotoIndex(prev => (prev < visibleImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, visibleImages.length]);

  if (!visibleFolders || visibleFolders.length === 0) return null;

  return (
    <section id="gallery" className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden" aria-label="Gallery and Achievements">

      {/* Unique Animated Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Deep background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(15,23,42,0.6)] via-[#02050D] to-[#02050D]" />

        {/* Animated Aurora Blobs */}
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1, 1.3, 1],
            x: ['-10%', '10%', '-5%', '15%', '-10%'],
            y: ['-10%', '15%', '5%', '-10%', '-10%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-[40%_60%_70%_30%] bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] opacity-[0.06] blur-[100px] sm:blur-[140px] mix-blend-screen"
        />

        <motion.div
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1, 1.3, 1.1, 1.4, 1],
            x: ['10%', '-10%', '15%', '-5%', '10%'],
            y: ['10%', '-15%', '-5%', '10%', '10%'],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-[60%_40%_30%_70%] bg-gradient-to-tl from-[#06B6D4] to-[#3B82F6] opacity-[0.05] blur-[100px] sm:blur-[140px] mix-blend-screen"
        />

        <motion.div
          animate={{
            rotate: [0, -90, -180, -270, -360],
            scale: [1.2, 1, 1.3, 1.1, 1.2],
            x: ['0%', '20%', '-20%', '10%', '0%'],
            y: ['20%', '0%', '-20%', '10%', '20%'],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] rounded-[30%_70%_50%_50%] bg-gradient-to-b from-[#F59E0B] to-[#EC4899] opacity-[0.04] blur-[100px] sm:blur-[120px] mix-blend-screen"
        />

        {/* Diagonal Light Rays */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.015)_49%,rgba(255,255,255,0.015)_51%,transparent_55%)] bg-[length:20px_20px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Centered Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span
            className="section-label mb-3 mx-auto"
            style={{ justifyContent: "center" }}
          >
            <Camera className="w-4 h-4 mr-2 text-[#EC4899]" />
            MY ACHIEVEMENTS
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white mb-4">
            My <span className="gradient-text" style={{ backgroundImage: 'linear-gradient(90deg, #3B82F6, #EC4899)' }}>Gallery</span>
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base max-w-2xl mx-auto">
            A visual journey of my accomplishments, projects, and memorable moments.
          </p>
        </motion.div>

        {/* Dynamic Content View */}
        <AnimatePresence mode="wait">
          {!activeFolderId ? (
            <motion.div
              key="folders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {visibleFolders.map((folder) => {
                const imgCount = folder.images?.filter(i => !i.hidden).length || 0;
                return (
                  <div
                    key={folder.id}
                    tabIndex={0}
                    onClick={() => setActiveFolderId(folder.id)}
                    onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveFolderId(folder.id); } }}
                    className="w-[75vw] max-w-[280px] sm:w-auto shrink-0 snap-center group cursor-pointer flex flex-col p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 focus:outline-none"
                  >
                    {folder.coverImage ? (
                      <div className="w-full h-32 sm:h-48 rounded-xl mb-3 sm:mb-4 overflow-hidden border border-[rgba(255,255,255,0.05)] relative">
                        <img src={folder.coverImage} alt={folder.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,5,13,0.9)] to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: `${folder.color || '#2563EB'}40`, color: folder.color || '#2563EB' }}>
                          <Folder className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: `${folder.color || '#2563EB'}20`, color: folder.color || '#2563EB' }}>
                        <Folder className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-space font-bold text-white mb-1 group-hover:text-[#8B5CF6] transition-colors">{folder.title}</h3>
                    <p className="text-xs sm:text-sm text-[#64748B]">{imgCount} {imgCount === 1 ? 'Item' : 'Items'}</p>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="images"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <button
                  tabIndex={0}
                  onClick={() => setActiveFolderId(null)}
                  onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") setActiveFolderId(null); }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors focus:outline-none focus:text-white group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Albums
                </button>
                <h3 className="text-2xl font-space font-bold text-white mt-4">{activeFolder?.title}</h3>
              </div>

              {visibleImages.length === 0 ? (
                <div className="text-center py-20 bg-[rgba(255,255,255,0.01)] rounded-2xl border border-[rgba(255,255,255,0.03)]">
                  <ImageIcon className="w-12 h-12 text-[#475569] mx-auto mb-3 opacity-50" />
                  <p className="text-[#64748B]">This folder is empty.</p>
                </div>
              ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {visibleImages.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      tabIndex={0}
                      onClick={() => setSelectedPhotoIndex(index)}
                      onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedPhotoIndex(index); } }}
                      className="w-[60vw] max-w-[240px] sm:w-auto shrink-0 snap-center group cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#02050D] rounded-2xl"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-square sm:aspect-square rounded-2xl overflow-hidden bg-[rgba(7,17,31,0.5)] border border-[rgba(255,255,255,0.05)] mb-3 transition-transform duration-300 group-hover:-translate-y-2 group-focus:-translate-y-2">
                        <div className="absolute inset-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-focus:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center bg-[rgba(7,17,31,0.8)]">
                            <ImageIcon className="w-12 h-12 text-[#94A3B8] opacity-20" />
                          </div>
                        </div>
                        {/* Glowing Border on Hover */}
                        <div className="absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ borderColor: activeFolder?.color || '#8B5CF6', filter: `drop-shadow(0 0 10px ${activeFolder?.color || '#8B5CF6'})` }} />
                      </div>
                      {/* Content Below */}
                      <div className="px-2">
                        <h3 className="text-white font-space font-bold text-lg leading-tight transition-colors duration-300 group-hover:text-[#8B5CF6] group-focus:text-[#8B5CF6]">
                          {item.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && visibleImages[selectedPhotoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhotoIndex(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative w-full flex items-center justify-center group/lightbox">
                {/* Left Arrow */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : visibleImages.length - 1)); }}
                  className="absolute left-0 sm:-left-12 p-3 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/lightbox:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <img
                  src={visibleImages[selectedPhotoIndex].image}
                  alt={visibleImages[selectedPhotoIndex].title}
                  className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain border border-[rgba(255,255,255,0.1)] shadow-2xl"
                />

                {/* Right Arrow */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(prev => (prev < visibleImages.length - 1 ? prev + 1 : 0)); }}
                  className="absolute right-0 sm:-right-12 p-3 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/lightbox:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-white font-space font-bold text-xl inline-block">
                  {visibleImages[selectedPhotoIndex].title}
                </h3>
                <p className="text-[#94A3B8] text-sm mt-1">Image {selectedPhotoIndex + 1} of {visibleImages.length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

