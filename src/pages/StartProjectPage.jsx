import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, AtSign, Phone, MapPin, Briefcase, FileText, Upload, CheckCircle2, Loader2, X, Send } from "lucide-react";

function validate(data) {
  const e = {};
  if (!data.name.trim()) e.name = "Name is required";
  if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = "Valid email is required";
  if (!data.phone.trim()) e.phone = "Phone is required";
  if (!data.address.trim()) e.address = "Address is required";
  if (!data.projectTitle.trim()) e.projectTitle = "Project Title is required";
  if (data.projectDetails.trim().length < 10) e.projectDetails = "Project details must be at least 10 chars";
  return e;
}

export default function StartProjectPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", projectTitle: "", projectDetails: "" });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState(null);
  const fileInputRef = useRef(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: false }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const validExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    for (let selected of selectedFiles) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext) && !selected.type.startsWith('image/')) {
        alert(`Please upload only PDF, Image, or Word documents. (${selected.name} not allowed)`);
        continue;
      }
      validFiles.push(selected);
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index, e) => {
    e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("loading");
    
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (files.length > 0) {
        files.forEach(f => formData.append('files', f));
      }

      const res = await fetch('http://localhost:5000/api/proposals', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit proposal');

      setStatus("success");
      setForm({ name: "", email: "", phone: "", address: "", projectTitle: "", projectDetails: "" });
      setFiles([]);
    } catch (error) {
      console.error(error);
      alert('Failed to submit proposal. Please try again.');
      setStatus("idle");
    }
  };

  const fieldClass = (name) =>
    `w-full border ${errors[name] ? "border-red-500/70 bg-[rgba(239,68,68,0.05)]" : focused === name ? "border-[#0EA5E9] bg-[rgba(14,165,233,0.08)] shadow-[0_0_20px_rgba(14,165,233,0.2)]" : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.2)]"} rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder-[#64748B] text-sm outline-none transition-all duration-300`;

  const inputProps = (name) => ({
    name, value: form[name], onChange,
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  return (
    <main className="min-h-screen bg-[#02050D] relative overflow-hidden pt-20 pb-28 sm:pt-24 sm:pb-20 selection:bg-[#0EA5E9]/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full border border-[rgba(14,165,233,0.05)] border-dashed opacity-50"
        />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#0EA5E9] opacity-[0.03] blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#A855F7] opacity-[0.03] blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
            <span className="text-[#0EA5E9] text-xs font-bold tracking-widest uppercase">Let's Build It</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-space font-extrabold text-white mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#A855F7] drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">Project</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#94A3B8] max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            Fill out the details below to help me understand your vision. I'll get back to you within 24 hours with a plan of action.
          </motion.p>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden p-[1px]"
        >
          {/* Animated Gradient Border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#0EA5E9] via-[#A855F7] to-[#0EA5E9]"
            style={{ backgroundSize: "200% auto" }}
            animate={{ backgroundPosition: ["0% center", "200% center"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative bg-[#060A14] backdrop-blur-2xl rounded-[23px] p-4 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="py-16 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-tr from-[#10B981] to-[#0EA5E9] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-space font-bold text-white mt-4">Thank you for choosing us! 🎉</h2>
                  <p className="text-[#94A3B8] max-w-sm mx-auto text-base leading-relaxed">
                    Our team will contact you shortly using your email or phone number.
                  </p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="mt-8 px-8 py-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm font-bold"
                  >
                    Send Another Proposal
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
                  className="space-y-4 sm:space-y-6"
                >

              {/* Personal Info Group */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-space font-bold flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-[#0EA5E9]/20 flex items-center justify-center text-[#0EA5E9] text-xs">1</span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EA5E9]/70" />
                      <input {...inputProps("name")} type="text" placeholder="Your Name *" className={`${fieldClass("name")} pl-11`} />
                    </div>
                    {errors.name && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.name}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EA5E9]/70" />
                      <input {...inputProps("email")} type="email" placeholder="Your Email *" className={`${fieldClass("email")} pl-11`} />
                    </div>
                    {errors.email && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EA5E9]/70" />
                      <input {...inputProps("phone")} type="tel" placeholder="Phone Number *" className={`${fieldClass("phone")} pl-11`} />
                    </div>
                    {errors.phone && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.phone}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0EA5E9]/70" />
                      <input {...inputProps("address")} type="text" placeholder="Address *" className={`${fieldClass("address")} pl-11`} />
                    </div>
                    {errors.address && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.address}</p>}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 sm:my-6" />

              {/* Project Info Group */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-white font-space font-bold flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-[#A855F7]/20 flex items-center justify-center text-[#A855F7] text-xs">2</span>
                  Project Details
                </h3>

                <div>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A855F7]/70" />
                    <input {...inputProps("projectTitle")} type="text" placeholder="Project Title *" className={`${fieldClass("projectTitle")} pl-11`} />
                  </div>
                  {errors.projectTitle && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.projectTitle}</p>}
                </div>

                <div>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-[#A855F7]/70" />
                    <textarea {...inputProps("projectDetails")} rows={5} placeholder="Explain your project in detail... *" className={`${fieldClass("projectDetails")} pl-11 resize-none`} />
                  </div>
                  {errors.projectDetails && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.projectDetails}</p>}
                </div>

                {/* File Upload (Optional) */}
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,image/*,.doc,.docx" multiple />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-2 w-full border-2 border-dashed ${files.length > 0 ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.02)] hover:border-[#0EA5E9]/50 hover:bg-[#0EA5E9]/5'} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group`}
                  >
                    {files.length > 0 ? (
                      <div className="w-full flex flex-col gap-2">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-white font-bold text-xs truncate max-w-[150px] sm:max-w-[250px]">{f.name}</p>
                                <p className="text-[#64748B] text-[10px]">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button type="button" onClick={(e) => removeFile(i, e)} className="p-2 rounded-full hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-center text-[#0EA5E9] mt-2 font-semibold">Click to add more files</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#0EA5E9]/20 transition-colors">
                          <Upload className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0EA5E9] transition-colors" />
                        </div>
                        <p className="text-white font-bold text-sm mb-1 group-hover:text-[#0EA5E9] transition-colors">Attach Documents (Optional)</p>
                        <p className="text-[#64748B] text-xs">PDF, Image, or Word Doc (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit" disabled={status === "loading"}
                whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(14,165,233,0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 mt-4 rounded-xl font-space font-bold text-base text-white flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed group"
                style={{ background: "linear-gradient(90deg, #0EA5E9, #A855F7)" }}
              >
                {/* Button shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                <span className="relative z-10 flex items-center gap-2">
                  {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Project...</>
                  ) : (
                    <>Submit Project Proposal <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </span>
              </motion.button>

            </motion.form>
            )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
