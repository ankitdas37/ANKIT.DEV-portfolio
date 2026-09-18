export default function ContactHero() {
  return (
    <div className="mb-12 text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        <span className="text-xs font-mono font-bold tracking-widest text-[#94A3B8] uppercase">
          LET'S CONNECT
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-space font-bold text-white mb-4">
        Get In <span className="text-[#7C3AED]">Touch</span>
      </h1>
      <p className="text-[#94A3B8] max-w-md mx-auto lg:mx-0">
        I'm always open to discussing new opportunities, collaborations, or just a friendly chat. Feel free to reach out!
      </p>
    </div>
  );
}
