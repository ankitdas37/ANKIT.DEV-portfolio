import { motion } from "framer-motion";
import { Code, Monitor, GraduationCap, Rocket, BookOpen, Star, Trophy, Target, Award, CheckCircle2 } from "lucide-react";
import { useData } from "../context/DataContext";

const getIcon = (iconName) => {
  if (!iconName) return <Star className="w-5 h-5" />;
  switch (iconName.toLowerCase().trim()) {
    case "code": return <Code className="w-5 h-5" />;
    case "monitor": return <Monitor className="w-5 h-5" />;
    case "graduation": return <GraduationCap className="w-5 h-5" />;
    case "rocket": return <Rocket className="w-5 h-5" />;
    case "book": return <BookOpen className="w-6 h-6" />;
    case "trophy": return <Trophy className="w-6 h-6" />;
    case "certificate": return <Award className="w-6 h-6" />;
    case "target": return <Target className="w-6 h-6" />;
    case "star": return <Star className="w-5 h-5" />;
    default: 
      return <span className="text-xl leading-none">{iconName}</span>;
  }
};

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 5 + 5,
  delay: Math.random() * 3,
}));

export default function Education() {
  const { education } = useData();
  
  if (!education) return null;
  
  const { 
    timeline: educationTimeline = [], 
    highlights: educationHighlights = {}, 
    subjects: educationSubjects = [], 
    stats: educationStats = [], 
    quote_text = "Learning is a journey that never ends.", 
    quote_author = "Ankit Das" 
  } = education;

  return (
    <section id="education" className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden" aria-label="Education">
      {/* Active Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Gradients */}
        <div className="absolute top-20 left-0 w-[500px] h-[500px] rounded-full bg-[#7C3AED] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-[#06B6D4] opacity-[0.05] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#3B82F6] opacity-[0.03] blur-[150px]" />

        {/* Floating Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#00BFFF]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.8, 0.1],
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Centered Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="section-label mb-3 mx-auto"
            style={{ justifyContent: "center" }}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            MY ACADEMIC JOURNEY
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white mb-4">
            My <span className="gradient-text">Education</span>
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base max-w-2xl mx-auto">
            Education is not the learning of facts, but the training of the mind to think.
          </p>
        </motion.div>

        {/* Main Grid Layout: Timeline + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-16">
          
          {/* Left: Timeline */}
          <div className="lg:w-2/3 relative">
            <div className="relative py-4 w-full flex flex-col items-center">
              
              {/* Central Glowing Line (Left on mobile, center on desktop) */}
              <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-1 md:w-1.5 bg-gradient-to-b from-[rgba(139,92,246,0.3)] via-[rgba(6,182,212,0.8)] to-[rgba(236,72,153,0.3)] rounded-full" />
              <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-4 md:w-8 bg-[rgba(6,182,212,0.25)] blur-md md:blur-xl rounded-full" />

              {/* Timeline Nodes */}
              <div className="w-full space-y-20 lg:space-y-28 relative z-10">
                {educationTimeline.map((item, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`relative flex items-center justify-between w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
                    >
                      {/* Empty space for the other side */}
                      <div className="w-5/12 hidden md:block" />

                      {/* Center Node (Left on mobile) */}
                      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center border-2 z-20 relative group hover:scale-110 transition-transform cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                             style={{ borderColor: item.color, backgroundColor: 'rgba(7,17,31,0.95)' }}>
                          <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: item.color }} />
                          <div className="absolute w-10 h-10 rounded-full opacity-60 blur-md" style={{ backgroundColor: item.color }} />
                          <div style={{ color: item.color }} className="relative z-10 drop-shadow-[0_0_10px_currentColor]">
                            {getIcon(item.icon)}
                          </div>
                        </div>
                        {/* Connecting Line to Card (Desktop) */}
                        <div className={`hidden md:block absolute w-12 xl:w-16 h-1 z-10 ${isLeft ? 'right-full' : 'left-full'}`}
                             style={{ background: `linear-gradient(${isLeft ? '270deg' : '90deg'}, ${item.color}, transparent)` }} />
                      </div>

                      {/* Content Card */}
                      <div className="w-full md:w-5/12 pl-16 md:pl-0 z-10">
                        <div 
                          className="glass rounded-2xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-300"
                          style={{ border: `1px solid ${item.color}60`, backgroundColor: 'rgba(7,17,31,0.6)', boxShadow: `0 10px 40px -10px ${item.color}40` }}
                        >
                          {/* Year Tab */}
                          <div className="absolute -top-px -left-px rounded-tl-2xl rounded-br-2xl px-4 py-1 sm:px-5 sm:py-1.5 text-[10px] sm:text-xs font-bold shadow-sm"
                               style={{ backgroundColor: `${item.color}40`, color: item.color, borderRight: `1px solid ${item.color}60`, borderBottom: `1px solid ${item.color}60` }}>
                            {item.year}
                          </div>
                          
                          {/* Glow effect (Always from left on mobile, alternating on desktop) */}
                          <div className={`absolute inset-0 opacity-15 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${isLeft ? 'md:bg-[radial-gradient(circle_at_100%_50%,var(--tw-gradient-stops))]' : ''}`}
                               style={{ backgroundImage: `radial-gradient(circle at 0% 50%, ${item.color}, transparent 70%)` }} />

                          <div className="p-5 sm:p-6 pt-10 sm:pt-10">
                            <h3 className="text-white font-space font-bold text-lg sm:text-xl mb-1 leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm font-medium mb-4 sm:mb-5" style={{ color: item.color }}>{item.subtitle}</p>
                            <ul className="space-y-2.5 sm:space-y-3">
                              {item.achievements.map((ach, i) => (
                                <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-[#E2E8F0] font-medium leading-tight">
                                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0" style={{ color: item.color, filter: `drop-shadow(0 0 5px ${item.color})` }} />
                                  <span>{ach}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:w-1/3 flex flex-col gap-6 pt-4">
            
            {/* Quote Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass rounded-2xl p-6 border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.05)] relative overflow-hidden group shadow-[0_0_30px_rgba(124,58,237,0.1)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7C3AED] to-[#00BFFF]" />
              <div className="text-[#7C3AED] text-4xl font-serif leading-none mb-2 opacity-50 group-hover:opacity-100 transition-opacity">"</div>
              <p className="text-white font-medium text-lg mb-4 whitespace-pre-wrap">{quote_text}</p>
              <p className="text-[#94A3B8] text-sm text-right">— {quote_author}</p>
            </motion.div>

            {/* Academic Highlights */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-[rgba(0,191,255,0.4)] bg-[rgba(7,17,31,0.6)] relative overflow-hidden shadow-[0_0_30px_rgba(0,191,255,0.1)] hover:shadow-[0_0_40px_rgba(0,191,255,0.2)] transition-shadow"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,191,255,0.15)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Star className="w-5 h-5 text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.8)]" />
                <h3 className="text-white font-space font-bold text-lg">Education Highlights</h3>
              </div>
              <div className="space-y-4 relative z-10">
                {Array.isArray(educationHighlights) ? (
                  educationHighlights.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-[#94A3B8] capitalize flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] shadow-[0_0_5px_#00BFFF]" />
                        {item.label}
                      </span>
                      <div className="flex-1 border-b border-dashed border-[rgba(255,255,255,0.2)] mx-3 opacity-50" />
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))
                ) : (
                  Object.entries(educationHighlights).map(([key, value]) => {
                    const labels = {
                      currentLevel: "Current Level",
                      stream: "Stream",
                      board: "University/Board",
                      yearOfStudy: "Year of Study",
                      cgpa: "CGPA / Percentage",
                      graduation: "Graduation"
                    };
                    return (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-[#94A3B8] capitalize flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] shadow-[0_0_5px_#00BFFF]" />
                          {labels[key]}
                        </span>
                        <div className="flex-1 border-b border-dashed border-[rgba(255,255,255,0.2)] mx-3 opacity-50" />
                        <span className="text-white font-medium text-right">{value}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Subjects Focus */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-[rgba(139,92,246,0.4)] bg-[rgba(7,17,31,0.6)] shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(139,92,246,0.15)] to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <BookOpen className="w-5 h-5 text-[#8B5CF6] drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                <h3 className="text-white font-space font-bold text-lg">Subjects Focus</h3>
              </div>
              <div className="flex flex-wrap gap-2.5 relative z-10">
                {educationSubjects.map((subject, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 rounded-lg text-[0.7rem] font-medium border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] text-[#E2E8F0] hover:text-white hover:border-[rgba(139,92,246,0.8)] hover:bg-[rgba(139,92,246,0.3)] hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-default"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Banner Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass rounded-2xl p-6 md:p-8 border border-[rgba(37,99,235,0.3)] bg-[rgba(7,17,31,0.8)] flex flex-wrap justify-between items-center gap-6 md:gap-4 relative overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(124,58,237,0.1)] via-transparent to-[rgba(37,99,235,0.1)] pointer-events-none" />
          
          {educationStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4 w-[calc(50%-1rem)] md:w-auto relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] shrink-0 shadow-lg"
                   style={{ color: ['#2563EB', '#00BFFF', '#F59E0B', '#7C3AED', '#10B981'][i % 5] }}>
                {getIcon(stat.icon)}
              </div>
              <div>
                <h4 className="text-white text-xl md:text-2xl font-bold font-space drop-shadow-md">{stat.value}</h4>
                <p className="text-[#94A3B8] text-[0.65rem] md:text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
              {/* Divider between items (hidden on mobile, last one hidden) */}
              {i < educationStats.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-[rgba(255,255,255,0.1)] ml-4" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
