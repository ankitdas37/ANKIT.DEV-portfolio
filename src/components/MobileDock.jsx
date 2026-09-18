import { motion } from "framer-motion";
import { Home, User, FolderGit2, BookOpen, Mail } from "lucide-react";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { useNavigate, useLocation } from "react-router-dom";

const sectionIds = ["home", "about", "projects", "blog", "contact"];

export default function MobileDock() {
  const activeSection = useScrollSpy(sectionIds);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const dockItems = [
    { id: "home",     icon: Home,       label: "Home",     action: () => isHome ? document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }) : navigate("/") },
    { id: "about",    icon: User,       label: "About",    action: () => isHome ? document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) : navigate("/") },
    { id: "projects", icon: FolderGit2, label: "Projects", action: () => navigate("/projects") },
    { id: "blog",     icon: BookOpen,   label: "Blog",     action: () => navigate("/blog") },
    { id: "contact",  icon: Mail,       label: "Contact",  action: () => navigate("/contact") },
  ];

  const isActive = (id) => {
    if (id === "projects") return location.pathname === "/projects";
    if (id === "blog")     return location.pathname === "/blog";
    if (id === "contact")  return location.pathname === "/contact";
    return isHome && activeSection === id;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[92vw] max-w-sm"
    >
      <div className="flex justify-between items-center gap-1 p-2 rounded-[2rem] bg-[rgba(8,12,25,0.7)] backdrop-blur-2xl border border-[rgba(124,58,237,0.3)] shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
        {dockItems.map(({ id, icon: Icon, label, action }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={action}
              className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 outline-none min-w-[52px]"
              aria-label={label}
            >
              {active && (
                <motion.div
                  layoutId="mobile-dock-active"
                  className="absolute inset-0 bg-gradient-to-r from-[rgba(124,58,237,0.3)] to-[rgba(37,99,235,0.3)] rounded-xl border border-[rgba(124,58,237,0.4)] shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors duration-300 ${
                  active ? "text-[#A855F7]" : "text-[#64748B]"
                }`}
              />
              <span
                className={`text-[9px] mt-1 relative z-10 font-semibold transition-colors duration-300 ${
                  active ? "text-[#A855F7]" : "text-[#475569]"
                }`}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-2 w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]"
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
