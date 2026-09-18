import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import developerPortrait from "../assets/ankit.jpg";
import { useData } from "../context/DataContext";

export default function About() {
  const { aboutMe, projects, certificates, categories } = useData();

  if (!aboutMe) return null; // Wait for data to load

  const terminalData = aboutMe.terminal_data || [];
  const stats = aboutMe.stats_data || [];
  const learning = aboutMe.learning_data || [];
  const whatIDo = aboutMe.what_i_do || [];
  const journeyTitle = aboutMe.journey_title || "My Journey";
  const whatIDoTitle = aboutMe.what_i_do_title || "What I Do";
  const journeyText = aboutMe.journey_text || "";
  const lightbulbTitle = aboutMe.lightbulb_title || "";
  const lightbulbSub = aboutMe.lightbulb_subtitle || "";
  const portraitImage = aboutMe.portrait_image || developerPortrait;

  return (
    <section
      id="about"
      className="relative pt-4 pb-12 md:py-20 bg-[#02050D] overflow-hidden"
      aria-label="About me"
    >
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[#2563EB] opacity-5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#7C3AED] opacity-5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="section-label mb-3" style={{ color: "#00BFFF", letterSpacing: "0.1em" }}>
            GET TO KNOW ME
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-space font-bold text-white mb-4">
            About <span className="text-[#A855F7]">Me</span>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl">
            Passionate about turning ideas into real world solutions through <span className="text-[#2563EB]">code</span> and <span className="text-[#A855F7]">creativity</span>.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-8 items-center mb-16">

          {/* Left Column: Terminal & Lightbulb */}
          <div className="space-y-6">
            {/* Terminal Window */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden bg-[#050B14] border border-[rgba(37,99,235,0.2)] shadow-[0_0_40px_rgba(37,99,235,0.15)] relative"
            >
              {/* Top border glow */}
              <div className="absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-50" />
              
              {/* Terminal Header */}
              <div className="bg-[#0A1120] px-4 py-3.5 border-b border-[rgba(37,99,235,0.15)] flex items-center justify-between">
                <span className="font-mono text-[11px] sm:text-sm text-[#94A3B8] flex items-center gap-1.5">
                  <span className="text-[#00BFFF]">user</span>
                  <span className="text-[#475569]">@</span>
                  <span className="text-[#A855F7]">ankit.dev</span>
                  <span className="text-[#475569]">:~$</span>
                  <span className="text-[#10B981] ml-1 font-semibold">whoami</span>
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>

              <div className="p-5 sm:p-7 font-mono text-xs sm:text-base space-y-5">
                {terminalData.filter(item => !item.hidden).map((item, i) => {
                  const Icon = Icons[item.icon] || Icons.Circle;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-6 group"
                    >
                      <div className="flex items-center gap-2.5 text-[#00BFFF] w-36 shrink-0 group-hover:text-[#2563EB] transition-colors">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 filter drop-shadow-[0_0_8px_rgba(0,191,255,0.5)]" />
                        <span className="font-bold tracking-wide">{item.label}</span>
                      </div>
                      <div className="hidden sm:block text-[#475569] font-bold">:</div>
                      <div className="text-[#E2E8F0] pl-6 sm:pl-0 font-medium leading-relaxed group-hover:text-white transition-colors">{item.value}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Lightbulb Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-start gap-4 p-5 rounded-xl glass border border-[rgba(168,85,247,0.2)]"
            >
              <div className="p-3 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.3)] shrink-0">
                <Icons.Lightbulb className="w-6 h-6 text-[#A855F7]" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">{lightbulbTitle}</p>
                <p className="text-sm text-[#94A3B8]" dangerouslySetInnerHTML={{ __html: lightbulbSub }}></p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Hub */}
          <div className="relative h-[500px] sm:h-[600px] flex items-center justify-center mt-12 lg:mt-0">
            {/* Neon Ring Background (Responsive sizes) */}
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border-[3px] sm:border-[4px] border-[rgba(168,85,247,0.4)] shadow-[0_0_40px_rgba(168,85,247,0.3)] opacity-60" />
            <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#00BFFF] shadow-[0_0_30px_rgba(0,191,255,0.3)] opacity-70 animate-spin-slow" />
            
            {/* Inner rotating dash ring */}
            <div className="absolute w-[260px] h-[260px] sm:w-[350px] sm:h-[350px] rounded-full border border-dashed border-[#2563EB] opacity-40 animate-[spin-slow_25s_linear_infinite_reverse]" />

            {/* Main Portrait */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 1.5 }}
              className="relative z-10 w-[220px] h-[280px] sm:w-[280px] sm:h-[360px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(37,99,235,0.4)] group"
            >
              <img src={portraitImage} alt="Developer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02050D] via-[rgba(2,5,13,0.2)] to-transparent" />
            </motion.div>

            {/* Floating Glass Panels */}

            {/* Top Left: What I Do */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute top-4 left-[-10px] sm:top-10 sm:left-0 xl:-left-12 z-20 p-3 sm:p-4 rounded-xl glass border border-[rgba(37,99,235,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-float backdrop-blur-md bg-[rgba(7,17,31,0.6)]"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3 text-white">
                <Icons.Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFFF]" />
                <span className="font-semibold text-xs sm:text-sm">{whatIDoTitle}</span>
              </div>
              <ul className="text-[10px] sm:text-xs text-[#94A3B8] space-y-1.5 sm:space-y-2">
                {whatIDo.filter(item => item.trim() !== "").map((item, i) => (
                  <li key={i} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#00BFFF]" /> {item}</li>
                ))}
              </ul>
            </motion.div>

            {/* Top Right: My Journey */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="absolute top-[-10px] right-[-10px] sm:top-4 sm:right-0 xl:-right-10 z-20 p-3 sm:p-4 rounded-xl glass border border-[rgba(168,85,247,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-float w-40 sm:w-48 backdrop-blur-md bg-[rgba(7,17,31,0.6)]"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center justify-between mb-2 text-white">
                <span className="font-semibold text-xs sm:text-sm">{journeyTitle}</span>
                <Icons.Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A855F7]" />
              </div>
              <p className="text-[9px] sm:text-[0.65rem] text-[#94A3B8] leading-relaxed whitespace-pre-wrap">
                {journeyText}
              </p>
            </motion.div>

            {/* Bottom Right: Learning */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-4 right-[-10px] sm:bottom-10 sm:right-0 xl:-right-16 z-20 p-4 sm:p-5 rounded-xl glass border border-[rgba(37,99,235,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-48 sm:w-60 backdrop-blur-md bg-[rgba(7,17,31,0.6)]"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4 text-white">
                <Icons.GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00BFFF]" />
                <span className="font-semibold text-xs sm:text-sm">Currently Learning</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {learning.filter(item => !item.hidden).map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-[9px] sm:text-[0.65rem] mb-1">
                      <span className="text-[#CBD5E1]">{item.name}</span>
                      <span className="text-[#00BFFF] font-bold">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-gradient-to-r from-[#2563EB] to-[#00BFFF] relative"
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-4 bg-white opacity-30 blur-[2px]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>



      </div>
    </section>
  );
}
