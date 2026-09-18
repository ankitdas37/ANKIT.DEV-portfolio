import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Search, ChevronRight, ChevronLeft, Layout, Shield, Zap, Monitor, Code, Share2 } from "lucide-react";
import { GithubIcon } from "../components/SocialIcons";
import { useData } from "../context/DataContext";
import toast from "react-hot-toast";
export default function ProjectsPage() {
  const { projects, categories } = useData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Only show visible (non-hidden) projects on the public page
  const visibleProjects = projects.filter(p => !p.hidden);

  // Build dynamic category list: "All" + categories from DB
  const filterTabs = ["All", ...categories.map(c => c.name)];

  // Live stats derived from visible projects
  const totalProjects  = visibleProjects.length;
  const uniqueTechs    = new Set(
    visibleProjects.flatMap(p =>
      Array.isArray(p.tech)
        ? p.tech
        : typeof p.tech === "string"
          ? p.tech.split(",").map(t => t.trim()).filter(Boolean)
          : []
    )
  ).size;
  const deployedCount  = visibleProjects.filter(p => p.demo && p.demo.trim()).length;
  const deployedPct    = totalProjects > 0 ? Math.round((deployedCount / totalProjects) * 100) : 0;

  // Use project.projectType as the category for filtering
  const processedProjects = visibleProjects.map((p, index) => ({
    ...p,
    number: String(index + 1).padStart(2, "0"),
  }));

  const filteredProjects = processedProjects.filter((p) => {
    const matchesCategory = activeCategory === "All" || (Array.isArray(p.projectType) ? p.projectType.includes(activeCategory) : p.projectType === activeCategory);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleShare = async (e, project) => {
    e.stopPropagation();
    const projectUrl = `${window.location.origin}/project/${project.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: `Check out this project: ${project.title}`,
          url: projectUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(projectUrl);
          toast.success("Link copied to clipboard!", { icon: '📋' });
        }
      }
    } else {
      navigator.clipboard.writeText(projectUrl);
      toast.success("Link copied to clipboard!", { icon: '📋' });
    }
  };

  // Pagination Logic
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-[#02050D] pt-24 pb-12 font-sans overflow-x-hidden relative">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#7C3AED] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-80 h-80 rounded-full bg-[#2563EB] opacity-[0.04] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Hero Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10 mb-8 lg:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00BFFF] animate-pulse" />
              <span className="text-[#00BFFF] text-sm tracking-widest font-medium uppercase font-space">My Work</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-space text-white mb-4 sm:mb-6">
              My <span className="text-[#2563EB]">Projects</span>
            </h1>
            <p className="text-[#94A3B8] text-lg mb-2">Here are some of the projects I've built.</p>
            <p className="text-[#94A3B8] text-lg">
              Each project is a step towards becoming a <span className="text-[#2563EB]">better developer</span>.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Stat Cards — live data */}
            <motion.div
              key={totalProjects}
              initial={{ scale: 0.9, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center border border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.05)] w-[calc(50%-0.375rem)] sm:w-32"
            >
              <div className="text-[#7C3AED] mb-2"><Layout className="w-6 h-6 sm:w-8 sm:h-8" /></div>
              <h3 className="text-white text-xl sm:text-2xl font-bold font-space">{totalProjects}+</h3>
              <p className="text-[#94A3B8] text-[0.55rem] sm:text-[0.65rem] uppercase text-center mt-1">Projects Completed</p>
            </motion.div>
            <motion.div
              key={`tech-${uniqueTechs}`}
              initial={{ scale: 0.9, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.05)] w-[calc(50%-0.375rem)] sm:w-32"
            >
              <div className="text-[#2563EB] mb-2"><Code className="w-6 h-6 sm:w-8 sm:h-8" /></div>
              <h3 className="text-white text-xl sm:text-2xl font-bold font-space">{uniqueTechs}+</h3>
              <p className="text-[#94A3B8] text-[0.55rem] sm:text-[0.65rem] uppercase text-center mt-1">Technologies Used</p>
            </motion.div>
            <motion.div
              key={`dep-${deployedPct}`}
              initial={{ scale: 0.9, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.05)] w-[calc(50%-0.375rem)] sm:w-32"
            >
              <div className="text-[#10B981] mb-2"><Monitor className="w-6 h-6 sm:w-8 sm:h-8" /></div>
              <h3 className="text-white text-xl sm:text-2xl font-bold font-space">{deployedPct}%</h3>
              <p className="text-[#94A3B8] text-[0.55rem] sm:text-[0.65rem] uppercase text-center mt-1">Projects Deployed</p>
            </motion.div>
            <div className="glass rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)] w-[calc(50%-0.375rem)] sm:w-32">
              <div className="text-[#F59E0B] mb-2"><svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></div>
              <h3 className="text-white text-lg sm:text-xl font-bold font-space">Learning</h3>
              <p className="text-[#94A3B8] text-[0.55rem] sm:text-[0.65rem] uppercase text-center mt-1">Never Stops</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 w-full md:w-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filterTabs.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`snap-center shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                    : "bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)] hover:text-white border border-[rgba(255,255,255,0.05)]"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
            <input
              type="text"
              placeholder="Search Projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 lg:mb-16 overflow-x-auto snap-x snap-mandatory pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence mode="popLayout">
            {currentProjects.map((project, i) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative glass rounded-2xl overflow-hidden border border-[rgba(37,99,235,0.15)] bg-[rgba(7,17,31,0.6)] flex flex-col hover:border-[rgba(37,99,235,0.4)] transition-all duration-500 cursor-pointer snap-center shrink-0 w-[75vw] sm:w-[300px] md:w-auto self-stretch"
                style={{
                  boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02)`,
                }}
                whileHover={{
                  y: -5,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 40px ${project.color}30, inset 0 0 0 1px ${project.color}50`,
                }}
              >
                {/* Glow effect matching project color */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${project.color}15, transparent 70%)` }} />

                {/* Number & Badge */}
                <div className="flex justify-between items-center p-3 sm:p-5 pb-2 sm:pb-3">
                  <span className="text-2xl sm:text-3xl font-space font-bold text-[rgba(255,255,255,0.1)] group-hover:text-[rgba(255,255,255,0.3)] transition-colors duration-300">
                    {project.number}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1 sm:gap-2 max-w-[60%]">
                    {Array.isArray(project.projectType) ? project.projectType.map(pt => (
                      <span key={pt} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.55rem] sm:text-[0.6rem] font-medium uppercase tracking-wider border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] whitespace-nowrap">
                        {pt}
                      </span>
                    )) : (
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.55rem] sm:text-[0.6rem] font-medium uppercase tracking-wider border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] whitespace-nowrap">
                        {project.projectType || "Project"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-3 sm:px-5 flex-1 flex flex-col">
                  {/* Title & Desc */}
                  <h3 className="text-base sm:text-lg font-space font-bold text-white mb-1 sm:mb-2 group-hover:text-[#00BFFF] transition-colors line-clamp-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-[#94A3B8] text-[0.65rem] sm:text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Image container styled like a laptop/screen */}
                  <div className="relative w-full aspect-video rounded-md sm:rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] mb-3 sm:mb-5 shadow-[0_5px_15px_rgba(0,0,0,0.5)] mt-auto">
                    {/* Glowing platform under image */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 blur-xl transition-all duration-500 opacity-50 group-hover:opacity-100" style={{ backgroundColor: project.color }} />
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] via-transparent to-transparent opacity-60" />

                    {/* Tech icons overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 sm:gap-1.5">
                      {(Array.isArray(project.tech)
                        ? project.tech
                        : typeof project.tech === "string"
                          ? project.tech.split(",").map((t) => t.trim()).filter(Boolean)
                          : []
                      ).map((tech) => (
                        <span key={tech} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-[rgba(0,0,0,0.6)] backdrop-blur-md rounded border border-[rgba(255,255,255,0.1)] text-[0.5rem] sm:text-[0.55rem] font-medium text-white flex items-center gap-1">
                          {tech === "React" && <span className="text-[#61DAFB]">⚛</span>}
                          {tech === "Tailwind CSS" && <span className="text-[#06B6D4]">💨</span>}
                          {tech === "Node.js" && <span className="text-[#339933]">🟢</span>}
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Bottom Actions */}
                <div className="p-2.5 px-3 sm:p-3 sm:px-5 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] flex items-center justify-between gap-1.5 sm:gap-2">
                  <a 
                    href={project.demo || "#"} 
                    target={project.demo ? "_blank" : undefined}
                    rel="noopener noreferrer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!project.demo) {
                        e.preventDefault();
                        toast("Live Demo coming soon!", { icon: '🚀' });
                      }
                    }} 
                    className="flex-1 text-center py-1.5 sm:py-2 rounded bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[0.65rem] sm:text-xs font-medium transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    Live Demo <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </a>
                  <a 
                    href={project.github || "#"} 
                    target={project.github ? "_blank" : undefined} 
                    rel="noopener noreferrer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!project.github) {
                        e.preventDefault();
                        toast("GitHub link coming soon!", { icon: '🚧' });
                      }
                    }} 
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white text-[0.65rem] sm:text-xs font-medium transition-colors border border-[rgba(255,255,255,0.1)] flex items-center gap-1" title="GitHub">
                    <GithubIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </a>
                  <button onClick={(e) => handleShare(e, project)} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white transition-colors border border-[rgba(255,255,255,0.1)] flex items-center gap-1" title="Share Project">
                    <Share2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-20">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded flex items-center justify-center border border-[rgba(255,255,255,0.1)] transition-colors ${currentPage === 1 ? 'bg-[rgba(255,255,255,0.03)] text-[#64748B] cursor-not-allowed' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button 
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                    currentPage === pageNumber 
                      ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                      : 'border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded flex items-center justify-center border border-[rgba(255,255,255,0.1)] transition-colors ${currentPage === totalPages ? 'bg-[rgba(255,255,255,0.03)] text-[#64748B] cursor-not-allowed' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.1)]'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-[rgba(255,255,255,0.05)] flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden bg-[rgba(7,17,31,0.6)]">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#7C3AED] rounded-full blur-[100px] opacity-10 pointer-events-none" />

          <div className="flex items-center gap-4 lg:w-1/3">
            <div className="w-12 h-12 rounded-xl bg-[rgba(124,58,237,0.1)] flex items-center justify-center border border-[rgba(124,58,237,0.2)] shrink-0">
              <Code className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-white font-medium text-sm sm:text-base">Every project is a new challenge and an opportunity to <span className="text-[#00BFFF]">learn something new.</span></p>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-wrap lg:flex-nowrap justify-between gap-4">
            <div className="flex items-center gap-3 w-[calc(50%-0.5rem)] lg:w-auto">
              <div className="text-[#10B981]"><Code className="w-5 h-5" /></div>
              <div>
                <h4 className="text-white text-sm font-bold">Clean Code</h4>
                <p className="text-[#94A3B8] text-[0.65rem]">Readable & Scalable</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-[calc(50%-0.5rem)] lg:w-auto">
              <div className="text-[#2563EB]"><Monitor className="w-5 h-5" /></div>
              <div>
                <h4 className="text-white text-sm font-bold">Responsive</h4>
                <p className="text-[#94A3B8] text-[0.65rem]">All Devices Friendly</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-[calc(50%-0.5rem)] lg:w-auto">
              <div className="text-[#00BFFF]"><Zap className="w-5 h-5" /></div>
              <div>
                <h4 className="text-white text-sm font-bold">Performance</h4>
                <p className="text-[#94A3B8] text-[0.65rem]">Optimized & Fast</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-[calc(50%-0.5rem)] lg:w-auto">
              <div className="text-[#F59E0B]"><Shield className="w-5 h-5" /></div>
              <div>
                <h4 className="text-white text-sm font-bold">Security</h4>
                <p className="text-[#94A3B8] text-[0.65rem]">Data Protection</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center absolute right-4 bottom-[-10px] opacity-20 pointer-events-none">
            <Code className="w-32 h-32 text-white" />
          </div>
        </div>

      </div>
    </main>
  );
}
