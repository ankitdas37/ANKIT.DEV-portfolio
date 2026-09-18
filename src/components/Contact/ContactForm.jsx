import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle2, Loader2 } from "lucide-react";

function validate(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Enter a valid email";
  if (!data.subject.trim()) errors.subject = "Subject is required";
  if (!data.message.trim()) errors.message = "Message is required";
  else if (data.message.trim().length < 20)
    errors.message = "Message must be at least 20 characters";
  return errors;
}

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("loading");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  const inputClass = (field) =>
    `w-full bg-[rgba(7,17,31,0.6)] border rounded-xl px-4 py-3 text-white placeholder-[#475569] text-sm transition-all duration-300 outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
        : "border-[rgba(37,99,235,0.2)] focus:border-[#2563EB] focus:ring-[rgba(37,99,235,0.3)]"
    }`;

  return (
    <div className="glass bg-[rgba(7,17,31,0.7)] rounded-[24px] p-6 sm:p-8 border border-[rgba(37,99,235,0.15)] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent opacity-50" />
      
      <div className="flex items-center gap-3 mb-8 border-b border-[rgba(255,255,255,0.05)] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#2563EB]" />
        </div>
        <h3 className="text-lg font-space font-bold text-white">Send Me a Message</h3>
      </div>

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-xl p-4 mb-6"
        >
          <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
          <p className="text-xs text-[#10B981] font-medium">Message sent successfully!</p>
        </motion.div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={inputClass("name")}
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={inputClass("email")}
            />
          </div>
        </div>

        <div className="mb-4">
          <input
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className={inputClass("subject")}
          />
        </div>

        <div className="mb-6">
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message..."
            rows={4}
            className={`${inputClass("message")} resize-none`}
          />
        </div>

        <motion.button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60"
          whileHover={status !== "loading" ? { scale: 1.02 } : undefined}
          whileTap={status !== "loading" ? { scale: 0.98 } : undefined}
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <>Send Message <Send className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>
    </div>
  );
}
