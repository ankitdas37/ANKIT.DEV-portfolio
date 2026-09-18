import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GithubIcon } from "../components/SocialIcons";
import { useData } from "../context/DataContext";
import toast from "react-hot-toast";

export default function Projects() {
  const { projects } = useData();
  const navigate = useNavigate();

  const featuredProjects = projects
    .filter(p => p.featured && !p.hidden)
    .sort((a, b) => a.featured_order - b.featured_order);

  return (
    <section
      id="projects"
      className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden"
      aria-label="Projects"
    >

      {/* Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#7C3AED] opacity-[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-14 text-center sm:text-left"
        >
          <span className="section-label mb-3 mx-auto sm:mx-0" style={{ justifyContent: "center" }}>
            FEATURED PROJECTS
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white">
            My Recent <span className="gradient-text">Work</span>
          </h2>
        </motion.div>

        {/* Projects Grid (Horizontal Carousel on Mobile, Grid on Desktop) */}
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 pb-8 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {featuredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#94A3B8]">
              <p>No featured projects found. Add some from the Admin Panel.</p>
            </div>
          )}
          {featuredProjects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              onClick={() => navigate(`/project/${project.id}`)}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center group glass rounded-2xl overflow-hidden border border-[rgba(37,99,235,0.15)] hover:border-[rgba(37,99,235,0.4)] card-hover cursor-pointer"
              style={{
                background: "rgba(7,17,31,0.9)",
              }}
              whileHover={{
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 30px ${project.color}22`,
              }}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-52 overflow-hidden">
                <img
                  src={project.image}
                  alt={`${project.title} preview`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,17,31,0.9)] via-[rgba(7,17,31,0.3)] to-transparent" />

                {/* Color indicator */}
                <div
                  className="absolute top-4 right-4 w-3 h-3 rounded-full"
                  style={{
                    background: project.color,
                    boxShadow: `0 0 10px ${project.color}`,
                  }}
                  aria-hidden="true"
                />

                {/* Hover action buttons removed as requested */}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 flex flex-col h-[calc(100%-10rem)] sm:h-[calc(100%-13rem)]">
                {/* Top accent */}
                <div
                  className="h-0.5 rounded-full mb-3 w-10 sm:mb-4 sm:w-12"
                  style={{
                    background: `linear-gradient(90deg, ${project.color}, transparent)`,
                  }}
                />

                <h3 className="text-lg sm:text-xl font-space font-bold text-white mb-1.5 sm:mb-2 group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {project.description}
                </p>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 mt-auto">
                  {(Array.isArray(project.tech)
                    ? project.tech
                    : typeof project.tech === "string"
                      ? project.tech.split(",").map((t) => t.trim()).filter(Boolean)
                      : []
                  ).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium font-mono"
                      style={{
                        background: `${project.color}15`,
                        color: project.color,
                        border: `1px solid ${project.color}30`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Bottom links */}
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(37,99,235,0.1)]">
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
                    className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white transition-colors font-medium"
                    aria-label={`${project.title} GitHub repository`}
                  >
                    <GithubIcon className="w-4 h-4" aria-hidden="true" />
                    Code
                  </a>
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
                    className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-[#00BFFF] transition-colors font-medium"
                    aria-label={`${project.title} live demo`}
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    Live Demo
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Projects Button (Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-16 flex justify-center px-4 sm:px-0"
        >
          <Link
            to="/projects"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-xl sm:rounded-full bg-gradient-to-r from-[#2563EB] to-[#00BFFF] text-white font-bold text-base shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(0,191,255,0.6)] hover:scale-105 transition-all duration-300"
            aria-label="View all projects page"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl sm:rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <span className="relative z-10 tracking-wide">View All Projects</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
