import { GithubIcon, LinkedinIcon, InstagramIcon } from "../SocialIcons";

export default function ContactFooter() {
  return (
    <div className="glass bg-gradient-to-r from-[rgba(124,58,237,0.1)] to-[rgba(37,99,235,0.05)] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-white font-medium text-sm">Let's build something amazing together! 🚀</p>
      <div className="flex items-center gap-3">
        <a href="https://github.com/ankitdas" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#2563EB] transition-colors"><GithubIcon className="w-4 h-4" /></a>
        <a href="https://linkedin.com/in/ankitdas" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#00BFFF] transition-colors"><LinkedinIcon className="w-4 h-4" /></a>
        <a href="https://instagram.com/ankitdas" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#EC4899] transition-colors"><InstagramIcon className="w-4 h-4" /></a>
      </div>
      <p className="text-[#94A3B8] text-xs font-mono">© 2024 Ankit Das. All rights reserved. {"</>"}</p>
    </div>
  );
}
