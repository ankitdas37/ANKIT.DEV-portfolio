import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code2, Menu, X } from "lucide-react";
import { navLinks } from "../data/portfolio";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

const sectionIds = ["home", "about", "projects", "blog", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = useScrollSpy(sectionIds);
  const location = useLocation();
  const navigate = useNavigate();
  const { aboutMe } = useData();
  const isHomePage = location.pathname === "/";

  const handleDownloadCV = async (e) => {
    e.preventDefault();
    if (!aboutMe?.cv_url) return;
    try {
      const res = await fetch(aboutMe.cv_url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Ankit_Das_CV_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch(err) {
      window.open(aboutMe.cv_url, "_blank");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleNavClick = (e, item) => {
    e.preventDefault();
    setMenuOpen(false);
    if (item.page) {
      navigate(item.page);
    } else {
      // Scroll-spy anchor
      if (isHomePage) {
        const id = item.href.replace("#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
      }
    }
  };

  const isActive = (item) => {
    if (item.page) return location.pathname === item.page;
    const id = item.href.replace("#", "");
    return isHomePage && activeSection === id;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className={`left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          scrolled
            ? "absolute lg:fixed top-0 lg:top-4 w-full lg:w-[90%] max-w-7xl bg-transparent lg:bg-[rgba(10,15,30,0.75)] lg:backdrop-blur-xl border-transparent lg:border-[rgba(124,58,237,0.3)] shadow-none lg:shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_20px_rgba(124,58,237,0.1)] rounded-none lg:rounded-2xl py-2 lg:py-1 px-4 lg:px-2"
            : "absolute top-0 w-full bg-transparent border-b border-transparent py-2 px-4 sm:px-6 lg:px-8"
        }`}
        role="banner"
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-16 px-2 sm:px-4">

            {/* Logo */}
            <motion.a
              href="/"
              onClick={(e) => { e.preventDefault(); isHomePage ? document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }) : navigate("/"); }}
              className="flex items-center gap-2 group"
              aria-label="ANKIT.DEV home"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Code2 className="w-6 h-6 text-[#A855F7] group-hover:text-[#00BFFF] transition-colors" aria-hidden="true" />
                <div className="absolute inset-0 blur-sm bg-[#A855F7] opacity-50 group-hover:opacity-80 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-space font-bold text-xl leading-none">
                  <span className="text-white">ANKIT</span>
                  <span className="text-[#A855F7]">.DEV</span>
                </span>
                <span className="text-[0.55rem] text-[#94A3B8] font-space tracking-[0.15em] mt-1 opacity-80 uppercase hidden sm:block">
                  BASRIC
                </span>
              </div>
            </motion.a>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-1 bg-[rgba(0,0,0,0.25)] p-1.5 rounded-xl border border-[rgba(255,255,255,0.05)]"
              role="navigation"
              aria-label="Main navigation"
            >
              {navLinks.map((item) => {
                const active = isActive(item);
                return (
                  <button
                    key={item.label}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${active
                        ? "text-white"
                        : "text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-[rgba(124,58,237,0.4)] to-[rgba(37,99,235,0.4)] border border-[rgba(168,85,247,0.5)] rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side — Resume + Hamburger */}
            <div className="flex items-center gap-3">
              <motion.a
                href={aboutMe?.cv_url || "#"}
                onClick={handleDownloadCV}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#A855F7] to-[#2563EB] rounded-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-[rgba(255,255,255,0.1)] transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05, translateY: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Download Resume"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#A855F7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Download Resume</span>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
