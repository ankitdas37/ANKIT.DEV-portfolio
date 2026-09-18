import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, Code2, Rocket, ArrowRight, Users } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="relative py-10 md:py-20 overflow-hidden bg-[#030510]" aria-label="Contact Call to Action">
      {/* Background Particles / Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-[20%] w-1.5 h-1.5 rounded-full bg-[#38BDF8]"
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-[25%] w-1.5 h-1.5 rounded-full bg-[#38BDF8]"
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-[30%] w-1.5 h-1.5 rounded-full bg-[#A855F7]"
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-40 right-[15%] w-1.5 h-1.5 rounded-full bg-[#A855F7]"
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0F172A] bg-[rgba(15,23,42,0.5)] mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shadow-[0_0_8px_#0EA5E9]" />
          <span className="text-[#0EA5E9] text-[11px] font-bold tracking-widest uppercase">Let's Connect</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-space font-extrabold text-white mb-6 tracking-tight"
        >
          Have a Project <span className="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">in Mind?</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#94A3B8] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-12"
        >
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision. Let's build something great together.
        </motion.p>

        {/* Step-by-Step Workflow Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 relative"
        >
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.3)] to-transparent -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="relative z-10 flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 gap-4 md:gap-0 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(6,10,22,0.8)] backdrop-blur-md hover:border-[rgba(56,189,248,0.4)] transition-all duration-300 group"
          >
            <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#030510] border border-[rgba(56,189,248,0.3)] flex items-center justify-center font-mono text-[9px] md:text-[10px] text-[#38BDF8] font-bold group-hover:bg-[#38BDF8] group-hover:text-white transition-colors">01</div>
            
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)] flex items-center justify-center md:mb-4 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-shadow">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#38BDF8]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">Plan Together</h3>
              <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed">We discuss your vision and requirements to map out the perfect collaborative strategy.</p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="relative z-10 flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 gap-4 md:gap-0 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(6,10,22,0.8)] backdrop-blur-md hover:border-[rgba(124,58,237,0.4)] transition-all duration-300 group"
          >
            <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#030510] border border-[rgba(124,58,237,0.3)] flex items-center justify-center font-mono text-[9px] md:text-[10px] text-[#A855F7] font-bold group-hover:bg-[#A855F7] group-hover:text-white transition-colors">02</div>
            
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center md:mb-4 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-shadow">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#A855F7]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">Collaborate & Create</h3>
              <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed">We create the project together, collaborating closely at every stage of development.</p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            whileHover={{ y: -3 }}
            className="relative z-10 flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 gap-4 md:gap-0 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(6,10,22,0.8)] backdrop-blur-md hover:border-[rgba(52,211,153,0.4)] transition-all duration-300 group"
          >
            <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#030510] border border-[rgba(52,211,153,0.3)] flex items-center justify-center font-mono text-[9px] md:text-[10px] text-[#34D399] font-bold group-hover:bg-[#34D399] group-hover:text-white transition-colors">03</div>
            
            <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] flex items-center justify-center md:mb-4 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-shadow">
              <Rocket className="w-5 h-5 md:w-6 md:h-6 text-[#34D399]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">Publish</h3>
              <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed">We successfully publish the collaborative project, optimized and ready to scale.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/start-project"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300"
          >
            Let's Talk <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
