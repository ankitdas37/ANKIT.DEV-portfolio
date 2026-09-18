import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Code2, ArrowRight, Send, Shield } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./SocialIcons";
import { useNavigate } from "react-router-dom";

const quickLinks = [
  { label: "Home", href: null, id: "home", color: "#7C3AED" },
  { label: "About", href: null, id: "about", color: "#2563EB" },
  { label: "Projects", href: "/projects", id: null, color: "#10B981" },
  { label: "Blog", href: "/blog", id: null, color: "#EC4899" },
  { label: "Contact", href: "/contact", id: null, color: "#F59E0B" },
];

const socialLinks = [
  { icon: GithubIcon, href: "https://github.com/ankitdas37", label: "GitHub" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/ankit-das-434594340?utm_source=share_via&utm_content=profile&utm_medium=member_android", label: "LinkedIn" },
  { icon: InstagramIcon, href: "https://www.instagram.com/the.ankit.das?stkn=Z3l6MzRiZDR3czF1", label: "Instagram" },
  { icon: Mail, href: "mailto:ankitdas082006@gmail.com", label: "Email" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickLink = (link) => {
    if (link.href) navigate(link.href);
    else scrollTo(link.id);
  };

  return (
    <footer
      className="relative bg-[#050B16] border-t border-[#172033] overflow-hidden"
      role="contentinfo"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[#7C3AED] opacity-[0.03] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="pt-12 md:pt-16 pb-8 md:pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-6 h-6 text-[#2563EB]" aria-hidden="true" />
              <span className="font-space font-bold text-xl">
                <span className="text-white">ANKIT</span>
                <span className="text-[#2563EB]">.DEV</span>
              </span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6 max-w-xs">
              Building the future with code. Passionate about creating impactful
              digital experiences.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3" aria-label="Social media links">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg glass-light border border-[rgba(37,99,235,0.2)] text-[#94A3B8] hover:text-[#00BFFF] hover:border-[rgba(0,191,255,0.4)] transition-all duration-300"
                  whileHover={{ scale: 1.15, translateY: -2 }}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-space font-bold text-white mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB]" />
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1 md:flex md:flex-col md:space-y-1">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleQuickLink(link)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-white transition-all duration-300 group hover:bg-[rgba(255,255,255,0.04)]"
                    >
                      {/* Left color bar */}
                      <span
                        className="w-0.5 h-4 rounded-full flex-shrink-0 opacity-30 group-hover:opacity-100 transition-all duration-300"
                        style={{ background: link.color }}
                      />
                      {/* Glowing dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: link.color, boxShadow: `0 0 6px ${link.color}` }}
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200 font-medium">
                        {link.label}
                      </span>
                      <ArrowRight
                        className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                        style={{ color: link.color }}
                      />
                    </button>
                  </li>
                ))}

                {/* Admin Panel */}
                <li className="col-span-2 md:col-span-1 pt-2 mt-1">
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#A855F7] border border-transparent hover:border-[rgba(168,85,247,0.25)] hover:bg-[rgba(168,85,247,0.07)] transition-all duration-300 group"
                    aria-label="Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Admin Panel</span>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A855F7] opacity-0 group-hover:opacity-100 shadow-[0_0_6px_#A855F7] transition-opacity duration-300" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-space font-bold text-white mb-2 text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F59E0B]" />
              Subscribe
            </h3>
            <p className="text-sm text-[#94A3B8] mb-5 leading-relaxed">
              Get updates about my latest projects and blogs.
            </p>
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#10B981] font-medium"
              >
                ✓ You're subscribed!
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} aria-label="Newsletter subscription">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-[rgba(7,17,31,0.8)] border border-[rgba(37,99,235,0.2)] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#2563EB] transition-colors"
                    aria-label="Email for newsletter"
                  />
                  <motion.button
                    type="submit"
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-lg text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Subscribe to newsletter"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(37,99,235,0.3)] to-transparent" />

        {/* Bottom bar */}
        <div className="pt-6 pb-28 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#64748B]">
            © 2026 Ankit Das/BASRIC. All Rights Reserved.
          </p>
          <p className="text-sm text-[#64748B]">
            Made with{" "}
            <span aria-label="love" role="img">❤️</span>{" "}
            and lots of{" "}
            <span aria-label="coffee" role="img">☕</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
