import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

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

export default function Contact() {
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
    // Simulate API call (replace with actual endpoint)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // On success:
    setStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  const inputClass = (field) =>
    `w-full bg-[rgba(7,17,31,0.8)] border rounded-xl px-4 py-3 text-white placeholder-[#475569] text-sm transition-all duration-300 outline-none focus:ring-1 ${errors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
      : "border-[rgba(37,99,235,0.2)] focus:border-[#2563EB] focus:ring-[rgba(37,99,235,0.3)]"
    }`;

  return (
    <section
      id="contact"
      className="relative py-10 md:py-20 bg-[#02050D] overflow-hidden"
      aria-label="Contact"
    >
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7C3AED] opacity-[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 sm:p-14 mb-16 border border-[rgba(37,99,235,0.2)] text-center relative overflow-hidden"
          style={{ background: "rgba(7,17,31,0.9)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2563EB] to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#2563EB] opacity-[0.04] blur-[80px] pointer-events-none" />

          <span
            className="section-label mb-4 mx-auto"
            style={{ justifyContent: "center" }}
          >
            LET'S CONNECT
          </span>
          <h2 className="text-4xl sm:text-5xl font-space font-bold text-white mb-4 relative z-10">
            Have a Project in <span className="gradient-text">Mind?</span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto mb-8 relative z-10">
            I'm always open to discussing new projects, creative ideas or
            opportunities to be part of your vision.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8 relative z-10">
            <a
              href="mailto:ankitdas@example.com"
              className="flex items-center gap-3 glass-light rounded-xl px-5 py-3 border border-[rgba(37,99,235,0.2)] hover:border-[rgba(37,99,235,0.5)] transition-all group"
              aria-label="Email Ankit Das"
            >
              <div className="w-9 h-9 rounded-lg bg-[rgba(37,99,235,0.15)] flex items-center justify-center group-hover:bg-[rgba(37,99,235,0.25)] transition-colors">
                <Mail className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-xs text-[#94A3B8]">Email</p>
                <p className="text-sm font-medium text-white">
                  ankitdas@example.com
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 glass-light rounded-xl px-5 py-3 border border-[rgba(37,99,235,0.2)]">
              <div className="w-9 h-9 rounded-lg bg-[rgba(37,99,235,0.15)] flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-xs text-[#94A3B8]">Phone</p>
                <p className="text-sm font-medium text-white">
                  +91 XXXXX XXXXX
                </p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={() =>
              document
                .getElementById("contact-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Let's Talk</span>
            <ArrowRight className="w-4 h-4 relative z-10" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          id="contact-form"
          className="max-w-2xl mx-auto"
        >
          <div
            className="glass rounded-2xl p-8 sm:p-10 border border-[rgba(37,99,235,0.2)]"
            style={{ background: "rgba(7,17,31,0.9)" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />

            <h3 className="text-2xl font-space font-bold text-white mb-2">
              Send a Message
            </h3>
            <p className="text-[#94A3B8] text-sm mb-8">
              Fill out the form below and I'll get back to you as soon as
              possible.
            </p>

            {/* Success State */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-xl p-4 mb-6"
                role="alert"
              >
                <CheckCircle2
                  className="w-5 h-5 text-[#10B981] flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm text-[#10B981] font-medium">
                  Message sent successfully! I'll reply within 24 hours.
                </p>
              </motion.div>
            )}

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#94A3B8] mb-1.5"
                  >
                    Full Name{" "}
                    <span aria-hidden="true" className="text-red-400">
                      *
                    </span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ankit Das"
                    className={inputClass("name")}
                    aria-required="true"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />

                  {errors.name && (
                    <p
                      id="name-error"
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#94A3B8] mb-1.5"
                  >
                    Email Address{" "}
                    <span aria-hidden="true" className="text-red-400">
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ankitdas082006@gmail.com"
                    className={inputClass("email")}
                    aria-required="true"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />

                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-red-400 text-xs mt-1 flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[#94A3B8] mb-1.5"
                >
                  Subject{" "}
                  <span aria-hidden="true" className="text-red-400">
                    *
                  </span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Project Inquiry"
                  className={inputClass("subject")}
                  aria-required="true"
                  aria-describedby={
                    errors.subject ? "subject-error" : undefined
                  }
                />

                {errors.subject && (
                  <p
                    id="subject-error"
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[#94A3B8] mb-1.5"
                >
                  Message{" "}
                  <span aria-hidden="true" className="text-red-400">
                    *
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  rows={5}
                  className={`${inputClass("message")} resize-none`}
                  aria-required="true"
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />

                {errors.message && (
                  <p
                    id="message-error"
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                    {errors.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={status !== "loading" ? { scale: 1.02 } : undefined}
                whileTap={status !== "loading" ? { scale: 0.98 } : undefined}
                aria-busy={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin relative z-10"
                      aria-hidden="true"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send
                      className="w-4 h-4 relative z-10"
                      aria-hidden="true"
                    />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
