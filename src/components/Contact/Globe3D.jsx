import globeImg from "../../assets/globe.jpg";
import { motion } from "framer-motion";

export default function Globe3D() {
  return (
    <>
      {/* Base rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square border border-[rgba(37,99,235,0.1)] rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square border border-[rgba(124,58,237,0.1)] rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse" }} />
      
      {/* Globe Image Container */}
      <div className="relative w-full max-w-[400px] aspect-square rounded-full flex items-center justify-center pointer-events-auto">
         <div className="absolute inset-0 rounded-full border-2 border-[rgba(37,99,235,0.2)] shadow-[0_0_80px_rgba(37,99,235,0.4)_inset] z-10 pointer-events-none" />
         
         <img 
           src={globeImg} 
           alt="Digital Globe" 
           className="w-[95%] h-[95%] object-cover rounded-full mix-blend-screen opacity-95 shadow-[0_0_50px_rgba(124,58,237,0.4)]"
           style={{
             maskImage: "radial-gradient(circle, black 60%, transparent 100%)",
             WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 100%)"
           }}
         />
      </div>
      
      {/* Animated SVG connecting lines (hidden on small screens) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-0" style={{ overflow: 'visible' }}>
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1 }}
          d="M 250,50 Q 350,-20 450,40" 
          fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4 4"
        />
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          d="M 300,150 Q 380,100 450,150" 
          fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 4"
        />
         <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.4 }}
          d="M 300,250 Q 380,250 450,260" 
          fill="none" stroke="#00BFFF" strokeWidth="1.5" strokeDasharray="4 4"
        />
         <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.6 }}
          d="M 250,350 Q 350,400 450,370" 
          fill="none" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 4"
        />
      </svg>
    </>
  );
}
