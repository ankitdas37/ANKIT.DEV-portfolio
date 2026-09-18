import { motion } from "framer-motion";
import { Mail, ArrowRight, ExternalLink, Download } from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  XIcon,
  FacebookIcon,
} from "../components/SocialIcons";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import heroBg3d from "../assets/hero-bg-3d.jpg";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

const codeSymbols = ["</>", "{}", "[]", "()", "=>", "&&", "||", "!="];

const socialLinks = [
  { icon: GithubIcon, href: "https://github.com/ankitdas37", label: "GitHub" },
  {
    icon: LinkedinIcon,
    href: "https://www.linkedin.com/in/ankit-das-434594340?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    label: "LinkedIn",
  },
  {
    icon: InstagramIcon,
    href: "https://www.instagram.com/the.ankit.das?stkn=Z3l6MzRiZDR3czF1",
    label: "Instagram",
  },
  {
    icon: XIcon,
    href: "https://x.com/AnkitDa01860054",
    label: "X",
  }, {
    icon: FacebookIcon,
    href: "https://www.facebook.com/share/19WD6GKBGo/",
    label: "Facebook",
  },
  { icon: Mail, href: "mailto:ankitdas082006@gmail.com", label: "Email" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Hero() {
  const navigate = useNavigate();
  const { aboutMe } = useData();

  const handleDownloadCV = (e) => {
    e.preventDefault();
    if (!aboutMe?.cv_url) return;
    // Use backend proxy so the file always downloads as "Ankit_Das_CV_Resume.pdf"
    // Works instantly on mobile and PC — no blob tricks, no CORS issues.
    const link = document.createElement("a");
    link.href = `${import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:5000'}'}/api/cv/download`;
    link.download = "Ankit_Das_CV_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg3d}
          alt="Futuristic developer workspace"
          className="w-full h-full object-cover object-center"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          loading="eager"
        />

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02050D] via-[rgba(2,5,13,0.85)] via-50% to-[rgba(2,5,13,0.35)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050D] via-transparent to-[rgba(2,5,13,0.3)]" />
        {/* Ambient blue/purple glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[#2563EB] opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#7C3AED] opacity-8 blur-[100px]" />
      </div>

      {/* Floating Particles */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#2563EB]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating code symbols */}
        {codeSymbols.slice(0, 5).map((sym, i) => (
          <motion.div
            key={sym}
            className="absolute font-mono text-xs font-bold text-[#2563EB] opacity-20"
            style={{
              left: `${65 + (i % 3) * 12}%`,
              top: `${15 + i * 12}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: 4 + i,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {sym}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-2xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border border-[rgba(0,191,255,0.3)] mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BFFF]"></span>
              </span>
              <span className="text-xs font-space font-medium text-[#00BFFF] tracking-widest uppercase">
                Welcome to my small universe
              </span>
            </motion.div>

            {/* Label */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mb-6"
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-[#00BFFF]"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <span className="section-label" style={{ color: "#00BFFF", letterSpacing: "0.1em" }}>
                HELLO, I'M
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="mb-4">
              <h1 className="font-space font-bold leading-none flex flex-wrap gap-x-4 gap-y-2">
                <span
                  className="text-white drop-shadow-md"
                  style={{
                    fontSize: "clamp(3rem, 12vw, 5.5rem)",
                    lineHeight: 1.05,
                  }}
                >
                  Ankit
                </span>
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#7C3AED] drop-shadow-lg"
                  style={{
                    fontSize: "clamp(3rem, 12vw, 5.5rem)",
                    lineHeight: 1.05,
                  }}
                >
                  Das
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl font-space font-medium text-[#94A3B8] mb-6"
            >
              Computer Science & Engineering <br className="hidden sm:block" />
              Student & Small Developer
            </motion.p>

            {/* Description */}
            <motion.div
              variants={itemVariants}
              className="mb-8 border-l-2 border-[#2563EB] pl-4 max-w-lg"
            >
              <p
                className="text-[#94A3B8] leading-relaxed"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1.05rem)" }}
              >
                Before you try to become the best, <br />
                take a moment to understand who are you? <br /> and what is your goal?
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12 w-full max-w-md sm:max-w-none"
            >
              <motion.button
                onClick={() =>
                  document
                    .getElementById("projects")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-primary w-full sm:w-auto justify-center shrink-0 !py-3.5 !rounded-xl shadow-[0_8px_30px_rgba(37,99,235,0.25)] border border-[rgba(255,255,255,0.1)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="whitespace-nowrap font-bold text-[15px]">Explore My Work</span>
                <ArrowRight
                  className="w-4 h-4 ml-1.5 relative z-10 shrink-0"
                  aria-hidden="true"
                />
              </motion.button>

              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto">
                <motion.button
                  onClick={() => navigate("/contact")}
                  className="btn-outline w-full sm:w-auto justify-center shrink-0 !py-3.5 !rounded-xl bg-[rgba(255,255,255,0.03)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="whitespace-nowrap font-semibold text-[15px] text-white">Contact Me</span>
                  <ExternalLink className="w-4 h-4 ml-1.5 shrink-0 opacity-70 text-white" aria-hidden="true" />
                </motion.button>

                <motion.button
                  onClick={handleDownloadCV}
                  className="sm:hidden btn-outline w-full justify-center shrink-0 !py-3.5 !rounded-xl bg-[rgba(0,191,255,0.05)] backdrop-blur-md border-[rgba(0,191,255,0.2)] text-[#00BFFF] hover:bg-[rgba(0,191,255,0.1)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Download className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap font-semibold text-[15px]">Resume</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-1.5 sm:p-0 rounded-2xl sm:rounded-none bg-[rgba(255,255,255,0.02)] sm:bg-transparent border border-[rgba(255,255,255,0.05)] sm:border-none w-fit">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-lg glass-light border border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-white hover:border-[rgba(0,191,255,0.4)] hover:bg-[rgba(0,191,255,0.1)] hover:shadow-[0_0_20px_rgba(0,191,255,0.2)] transition-all duration-300"
                    whileHover={{ scale: 1.1, translateY: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
                  </motion.a>
                ))}
              </div>
              <div className="hidden sm:block h-px flex-1 max-w-16 bg-gradient-to-r from-[rgba(37,99,235,0.5)] to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#02050D] to-transparent pointer-events-none" />
    </section>
  );
}
