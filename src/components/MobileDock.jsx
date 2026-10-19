import { useState, useEffect } from "react";
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

  // Auto-dim / subtle float on fast scroll to prevent blocking reading
  const [scrollingDown, setScrollingDown] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let timer = null;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY + 15 && currentY > 150) {
        setScrollingDown(true);
      } else if (currentY < lastY - 10 || currentY < 100) {
        setScrollingDown(false);
      }
      lastY = currentY;

      clearTimeout(timer);
      timer = setTimeout(() => {
        setScrollingDown(false);
      }, 900);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const dockItems = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      color: "#38BDF8",
      action: () => (isHome ? document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }) : navigate("/")),
    },
    {
      id: "about",
      icon: User,
      label: "About",
      color: "#818CF8",
      action: () => (isHome ? document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) : navigate("/")),
    },
    {
      id: "projects",
      icon: FolderGit2,
      label: "Projects",
      color: "#A855F7",
      action: () => navigate("/projects"),
    },
    {
      id: "blog",
      icon: BookOpen,
      label: "Blog",
      color: "#EC4899",
      action: () => navigate("/blog"),
    },
    {
      id: "contact",
      icon: Mail,
      label: "Contact",
      color: "#10B981",
      action: () => navigate("/contact"),
    },
  ];

  const isActive = (id) => {
    if (id === "projects") return location.pathname === "/projects";
    if (id === "blog") return location.pathname.startsWith("/blog");
    if (id === "contact") return location.pathname === "/contact";
    return isHome && activeSection === id;
  };

  return (
    <motion.aside
      initial={{ y: 80, opacity: 0 }}
      animate={{
        y: scrollingDown ? 12 : 0,
        opacity: scrollingDown ? 0.7 : 1,
        scale: scrollingDown ? 0.96 : 1,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50 lg:hidden w-[94vw] max-w-[390px] pointer-events-auto"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="relative flex items-center justify-between gap-1 p-1.5 rounded-[1.8rem] bg-[rgba(6,10,24,0.85)] backdrop-blur-2xl border border-[rgba(124,58,237,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(124,58,237,0.18)]">
        {/* Subtle top shimmer highlight */}
        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-[rgba(168,85,247,0.5)] to-transparent pointer-events-none" />

        {dockItems.map(({ id, icon: Icon, label, color, action }) => {
          const active = isActive(id);
          return (
            <motion.button
              key={id}
              onClick={action}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-colors duration-200 outline-none select-none min-h-[50px]"
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active Morphing Background Pill */}
              {active && (
                <motion.div
                  layoutId="mobile-dock-active-pill"
                  className="absolute inset-0 rounded-2xl border border-[rgba(168,85,247,0.4)] pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.28) 0%, rgba(37,99,235,0.22) 100%)",
                    boxShadow: "0 4px 18px rgba(124,58,237,0.35), inset 0 1px 1px rgba(255,255,255,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon Container with subtle scale on active */}
              <motion.div
                animate={{
                  scale: active ? 1.15 : 1,
                  y: active ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <Icon
                  className="w-5 h-5 transition-colors duration-200"
                  style={{
                    color: active ? "#F8FAFC" : "#64748B",
                    filter: active ? `drop-shadow(0 0 8px ${color})` : "none",
                  }}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Label */}
              <span
                className="text-[9.5px] mt-1 relative z-10 font-bold tracking-tight transition-colors duration-200 leading-none"
                style={{
                  color: active ? "#F8FAFC" : "#64748B",
                }}
              >
                {label}
              </span>

              {/* Glowing active pip indicator */}
              {active && (
                <motion.span
                  layoutId="mobile-dock-active-pip"
                  className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}
