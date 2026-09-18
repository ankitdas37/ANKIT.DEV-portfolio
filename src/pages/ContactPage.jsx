import { useEffect, useState, useRef, useMemo } from "react";
import { motion, useAnimationFrame, AnimatePresence } from "framer-motion";
import { Mail, Phone, Send, MapPin, User, AtSign, Briefcase, MessageSquare, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, FacebookIcon, XIcon } from "../components/SocialIcons";
import globeImg from "../assets/globe.jpg";

import { useData } from "../context/DataContext";

// ─── Data & Helpers ────────────────────────────────────────────────────────
const iconMap = {
  Email: Mail,
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
  Phone: Phone,
  Facebook: FacebookIcon,
  X: XIcon
};

function validate(data) {
  const e = {};
  if (!data.name.trim()) e.name = "Name is required";
  if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = "Valid email is required";

  if (!data.phone.trim()) {
    e.phone = "Phone is required";
  } else if (data.phoneCode === "+91") {
    if (!/^[6-9]\d{9}$/.test(data.phone)) e.phone = "Indian number must start with 6-9 and be 10 digits";
  } else {
    if (!/^\d{10}$/.test(data.phone)) e.phone = "Valid 10-digit number required";
  }

  if (!data.subject.trim()) e.subject = "Subject is required";
  if (data.message.trim().length < 5) e.message = "Message must be at least 5 chars";
  return e;
}

// ─── Animated Particle Background ─────────────────────────────────────────
function ParticleBackground() {
  const particles = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 8,
    driftX: (Math.random() - 0.5) * 4,
    driftY: (Math.random() - 0.5) * 4,
  })), []);

  const floaters = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: ["#7C3AED", "#2563EB", "#38BDF8", "#818CF8", "#F472B6"][Math.floor(Math.random() * 5)],
    dur: Math.random() * 10 + 8,
    delay: Math.random() * 6,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Static stars */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
            x: [0, p.driftX, 0],
            y: [0, p.driftY, 0],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Coloured floating orb particles */}
      {floaters.map(f => (
        <motion.div
          key={`f${f.id}`}
          className="absolute rounded-full blur-sm"
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size * 3, height: f.size * 3, backgroundColor: f.color }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.8, 1.4, 0.8],
            x: [0, (Math.random() - 0.5) * 60, 0],
            y: [0, (Math.random() - 0.5) * 60, 0],
          }}
          transition={{ duration: f.dur, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(124,58,237,0.18)" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Large ambient blobs - animated, much brighter */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, delay: 4, ease: "easeInOut" }}
      />

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.4)] to-transparent"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phoneCode: "+91", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && value && !/^\d*$/.test(value)) return;
    if (name === "phone" && value.length > 10) return;

    setForm(p => ({ ...p, [name]: value }));

    if (name === "email") {
      if (value.length > 0 && !/\S+@\S+\.\S+/.test(value)) {
        setErrors(p => ({ ...p, email: "Invalid email format" }));
      } else {
        setErrors(p => ({ ...p, email: false }));
      }
    } else {
      if (errors[name]) setErrors(p => ({ ...p, [name]: false }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    
    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to submit message");

      setStatus("success");
      setForm({ name: "", email: "", phoneCode: form.phoneCode, phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
      setStatus("idle");
    }
  };

  const fieldClass = (name) =>
    `w-full border ${errors[name] ? "border-red-500/70 bg-[rgba(239,68,68,0.05)]" : focused === name ? "border-[rgba(124,58,237,0.8)] bg-[rgba(124,58,237,0.1)] shadow-[0_0_20px_rgba(124,58,237,0.2)]" : "border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.05)]"} rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-[#94A3B8] text-xs sm:text-sm outline-none transition-all duration-200`;

  const inputProps = (name) => ({
    name, value: form[name], onChange,
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.7), rgba(37,99,235,0.5), rgba(124,58,237,0.3))", padding: "1px" }}>
        <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(10,16,36,0.97)" }} />
      </div>

      <div className="relative p-4 sm:p-6 z-10">
        {/* Pulsing top bar */}
        <motion.div
          className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#7C3AED] via-[#38BDF8] to-[#7C3AED] rounded-t-2xl"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-[rgba(124,58,237,0.25)]">
          <motion.div
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.4)] flex items-center justify-center"
            animate={{ boxShadow: ["0 0 5px rgba(124,58,237,0.2)", "0 0 15px rgba(124,58,237,0.5)", "0 0 5px rgba(124,58,237,0.2)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C3AED]" />
          </motion.div>
          <span className="text-white font-bold text-xs sm:text-sm font-space">Send Me a Message</span>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                className="w-16 h-16 bg-gradient-to-tr from-[#10B981] to-[#38BDF8] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-xl font-space font-bold text-white mt-2">Our Team Will Contact You! 🎉</h2>
              <p className="text-[#94A3B8] max-w-[250px] mx-auto text-xs leading-relaxed">
                Thank you for your message. We'll get back to you shortly.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-6 px-6 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors text-xs font-bold"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={onSubmit} 
              noValidate 
              className="space-y-3"
            >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C3AED]" />
                <input {...inputProps("name")} type="text" placeholder="Your Name" className={`${fieldClass("name")} pl-9`} />
              </div>
              {errors.name && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{errors.name}</p>}
            </div>
            <div>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C3AED]" />
                <input {...inputProps("email")} type="email" placeholder="Your Email" className={`${fieldClass("email")} pl-9`} />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <div className="w-[100px] flex-shrink-0 relative">
              <select {...inputProps("phoneCode")} className={`${fieldClass("phoneCode")} px-2 appearance-none text-center cursor-pointer relative z-10 bg-transparent`}>
                <option value="+91" className="bg-[#050818]">IN (+91)</option>
                <option value="+1" className="bg-[#050818]">US (+1)</option>
                <option value="+44" className="bg-[#050818]">UK (+44)</option>
                <option value="+61" className="bg-[#050818]">AU (+61)</option>
                <option value="+81" className="bg-[#050818]">JP (+81)</option>
                <option value="+49" className="bg-[#050818]">DE (+49)</option>
                <option value="+33" className="bg-[#050818]">FR (+33)</option>
                <option value="+86" className="bg-[#050818]">CN (+86)</option>
                <option value="+971" className="bg-[#050818]">AE (+971)</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C3AED]" />
                <input {...inputProps("phone")} type="text" placeholder="Phone (10 digits)" className={`${fieldClass("phone")} pl-9`} />
              </div>
              {errors.phone && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C3AED]" />
              <input {...inputProps("subject")} type="text" placeholder="Subject" className={`${fieldClass("subject")} pl-9`} />
            </div>
            {errors.subject && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{errors.subject}</p>}
          </div>

          <div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3.5 w-3.5 h-3.5 text-[#7C3AED]" />
              <textarea {...inputProps("message")} rows={4} placeholder="Your Message..." className={`${fieldClass("message")} pl-9 resize-none`} />
            </div>
            {errors.message && <p className="text-red-400 text-[10px] mt-1 ml-1 font-medium">{errors.message}</p>}
          </div>

          <motion.button
            type="submit" disabled={status === "loading"}
            whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(124,58,237,0.7)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #7C3AED 100%)", backgroundSize: "200% 200%" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #7C3AED 100%)", backgroundSize: "200% 200%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="relative z-10 flex items-center gap-2">
              {status === "loading"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                : <><span>Send Message</span><Send className="w-4 h-4" /></>}
            </span>
          </motion.button>
        </motion.form>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Location Badge ───────────────────────────────────────────────────────
function LocationBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-xl relative overflow-hidden"
      style={{ background: "rgba(6,10,22,0.85)", border: "1px solid rgba(124,58,237,0.4)" }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), transparent)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <div className="relative w-9 h-9 rounded-full flex items-center justify-center border border-[rgba(124,58,237,0.6)]"
        style={{ background: "rgba(124,58,237,0.2)" }}>
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <MapPin className="w-4 h-4 text-[#A855F7]" />
        </motion.div>
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#030510]"
          style={{ backgroundColor: "#34D399" }}
          animate={{ boxShadow: ["0 0 0 rgba(52,211,153,0)", "0 0 8px rgba(52,211,153,0.8)", "0 0 0 rgba(52,211,153,0)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="relative">
        <p className="text-[9px] text-[#A855F7] uppercase tracking-widest font-mono font-bold">Based In</p>
        <p className="text-white font-bold text-sm flex items-center gap-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">India <span>🇮🇳</span></p>
        <p className="text-[#94A3B8] text-[10px] font-mono">GMT +5:30</p>
      </div>
    </motion.div>
  );
}

// ─── Globe ────────────────────────────────────────────────────────────────
function GlobeCenter() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative flex flex-col items-center w-full"
    >
      {/* Location badge */}
      <div className="mb-4 z-20 relative"><LocationBadge /></div>

      {/* Globe container */}
      <div className="relative w-full max-w-[260px] sm:max-w-[400px] mx-auto mt-6 sm:mt-0">
        {/* Orbital rings */}
        {[1.14, 1.06].map((scale, i) => (
          <motion.div key={i}
            className="absolute inset-0 rounded-full border pointer-events-none"
            style={{
              transform: `scale(${scale})`,
              top: `${-(scale - 1) * 50}%`, left: `${-(scale - 1) * 50}%`,
              width: `${scale * 100}%`, height: `${scale * 100}%`,
              borderColor: i === 0 ? "rgba(37,99,235,0.2)" : "rgba(124,58,237,0.15)",
              position: "absolute",
            }}
            animate={{ rotate: [0, i === 0 ? 360 : -360] }}
            transition={{ duration: i === 0 ? 20 : 14, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Pulsing outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none -m-4"
          animate={{
            boxShadow: [
              "0 0 40px rgba(37,99,235,0.3), 0 0 80px rgba(124,58,237,0.2)",
              "0 0 80px rgba(37,99,235,0.6), 0 0 120px rgba(124,58,237,0.4)",
              "0 0 40px rgba(37,99,235,0.3), 0 0 80px rgba(124,58,237,0.2)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Globe image */}
        <div className="relative aspect-square rounded-full overflow-hidden border-2 border-[rgba(37,99,235,0.35)]">
          <img src={globeImg} alt="Earth Globe" className="w-full h-full object-cover rounded-full"
            style={{
              maskImage: "radial-gradient(circle, black 60%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 100%)",
              filter: "brightness(1.1) saturate(1.3) contrast(1.05)",
            }}
          />
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, transparent 50%, rgba(124,58,237,0.08) 100%)" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Animated platform rings */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] space-y-1 pointer-events-none">
          {[{ w: "100%", color: "rgba(37,99,235,0.7)", shadow: "rgba(37,99,235,0.5)" },
          { w: "80%", color: "rgba(124,58,237,0.5)", shadow: "rgba(124,58,237,0.3)" },
          { w: "60%", color: "rgba(37,99,235,0.3)", shadow: "rgba(37,99,235,0.15)" }].map((ring, i) => (
            <motion.div key={i}
              className="mx-auto h-2.5 rounded-[50%] border-t-2"
              style={{ width: ring.w, borderColor: ring.color }}
              animate={{
                boxShadow: [
                  `0 -4px 12px ${ring.shadow}`,
                  `0 -8px 25px ${ring.shadow}`,
                  `0 -4px 12px ${ring.shadow}`,
                ]
              }}
              transition={{ duration: 2.5 + i, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Animated SVG connection lines to right */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none hidden xl:block" viewBox="0 0 400 420" style={{ overflow: "visible" }}>
          {[
            { d: "M 370,65  C 430,55  470,60  510,65", color: "#7C3AED", delay: 1.0 },
            { d: "M 378,130 C 440,120 475,125 510,130", color: "#818CF8", delay: 1.3 },
            { d: "M 382,200 C 445,195 478,200 510,200", color: "#38BDF8", delay: 1.6 },
            { d: "M 376,268 C 440,265 476,268 510,268", color: "#F472B6", delay: 1.9 },
            { d: "M 360,335 C 425,338 468,337 510,337", color: "#34D399", delay: 2.2 },
          ].map((line, i) => (
            <motion.path key={i}
              d={line.d} fill="none" stroke={line.color} strokeWidth="1.5" strokeDasharray="4 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 1.5, delay: line.delay, repeat: Infinity, repeatDelay: 4 }}
            />
          ))}
          {/* Pulsing dots at card ends */}
          {[65, 130, 200, 268, 337].map((cy, i) => (
            <motion.circle key={i} cx={512} cy={cy} r={5}
              fill={["#7C3AED", "#818CF8", "#38BDF8", "#F472B6", "#34D399"][i]}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 0] }}
              transition={{ duration: 1, delay: [1.0, 1.3, 1.6, 1.9, 2.2][i] + 1.3, repeat: Infinity, repeatDelay: 4 }}
            />
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Contact Card ─────────────────────────────────────────────────────────
function ContactCard({ card, index }) {
  const Icon = iconMap[card.type] || Send;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={card.link} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 py-3 sm:py-3.5 transition-all duration-300 relative overflow-hidden group"
      style={{
        background: hovered ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))` : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: `1px solid ${hovered ? card.color : `rgba(255,255,255,0.05)`}`,
        borderTopColor: hovered ? card.color : `rgba(255,255,255,0.15)`,
        boxShadow: hovered ? `0 10px 30px ${card.glow.replace("0.3", "0.2")}` : "0 5px 15px rgba(0,0,0,0.2)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Animated gradient highlight on hover */}
      {hovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          style={{ background: `radial-gradient(circle at right, ${card.color}, transparent 60%)` }}
        />
      )}

      {/* Icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
        style={{
          background: `linear-gradient(135deg, ${card.color}20, ${card.color}05)`,
          border: `1px solid ${card.color}40`,
          boxShadow: `inset 0 0 10px ${card.color}20, 0 0 15px ${card.color}20`
        }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: card.color, filter: `drop-shadow(0 0 5px ${card.color})` }} />
        {hovered && (
          <motion.div className="absolute inset-0 rounded-full" style={{ backgroundColor: card.color }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.2, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-space font-bold text-[13px] sm:text-sm tracking-wide">{card.label}</p>
        <p className="text-[#94A3B8] text-[11px] sm:text-xs truncate font-medium">{card.value}</p>
      </div>

      {/* Action btn */}
      <motion.div
        className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-3.5 py-1.5 sm:py-2 rounded-full border transition-all duration-300 flex-shrink-0 shadow-lg"
        style={{
          backgroundColor: hovered ? card.color : "rgba(255,255,255,0.03)",
          borderColor: hovered ? card.color : "rgba(255,255,255,0.1)",
          color: hovered ? "#fff" : "#CBD5E1",
        }}
      >
        <span className="relative z-10">{card.action}</span> 
        <ArrowRight className={`w-3 h-3 relative z-10 transition-transform duration-300 ${hovered ? "translate-x-0.5" : ""}`} />
      </motion.div>
    </motion.a>
  );
}

// ─── Quote Card ───────────────────────────────────────────────────────────
function QuoteCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ background: "rgba(6,10,22,0.75)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <div className="flex items-center gap-6 p-6 sm:p-8">
        <div className="text-6xl font-serif text-[#7C3AED] opacity-40 leading-none flex-shrink-0 -mt-2">"</div>
        <div>
          <p className="text-white font-medium text-sm sm:text-base leading-relaxed drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            Great things in business are never done by one person.<br />
            They're done by a team of people.
          </p>
          <p className="text-[#A855F7] text-xs font-mono mt-2 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]">– Steve Jobs</p>
        </div>
        {/* Deco */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 opacity-20 pointer-events-none">
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <Send className="w-6 h-6 text-[#38BDF8]" />
          </motion.div>
          <div className="w-14 border-t-2 border-dashed border-[#38BDF8]" />
          <Mail className="w-10 h-10 text-[#7C3AED]" />
        </div>
      </div>
    </motion.div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { contactLinks } = useData();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-screen bg-[#050818] relative overflow-hidden" style={{ fontFamily: "inherit" }}>
      {/* Active animated background */}
      <ParticleBackground />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-10">

        {/* Hero */}
        <motion.div className="mb-6 sm:mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"
              animate={{ boxShadow: ["0 0 0 rgba(168,85,247,0)", "0 0 12px rgba(168,85,247,1)", "0 0 0 rgba(168,85,247,0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[#CBD5E1] text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Let's Connect</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-space font-extrabold text-white leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Get In{" "}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#38BDF8] to-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              style={{ backgroundSize: "200% auto" }}
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              Touch
            </motion.span>
          </h1>
          <p className="text-[#E2E8F0] mt-2 sm:mt-3 max-w-md text-xs sm:text-sm leading-relaxed drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] font-medium">
            I'm always open to discussing new opportunities, collaborations, or just a friendly chat. Feel free to reach out!
          </p>
        </motion.div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] gap-6 sm:gap-8 items-center lg:items-stretch">
          {/* Left */}
          <div className="w-full lg:max-w-[360px] order-1"><ContactForm /></div>
          
          {/* Center */}
          <div className="w-full lg:w-[400px] xl:w-[460px] flex items-center justify-center order-2 py-4 sm:py-0"><GlobeCenter /></div>
          
          {/* Right */}
          <div className="w-full order-3">
            <div className="flex flex-col gap-3">
              {contactLinks?.filter(c => !c.hidden).map((card, i) => (
                <div key={card.id || i} className="w-full">
                  <ContactCard card={card} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 space-y-3">
          <QuoteCard />
        </div>
      </div>
    </main>
  );
}
