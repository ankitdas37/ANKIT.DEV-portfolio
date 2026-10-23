import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LayoutDashboard, FolderGit2, Image, Award,
  MessageSquare, BookOpen, Plus, Trash2, LogOut,
  Eye, EyeOff, Save, Shield, ChevronRight, X, Edit2,
  UploadCloud, Loader2, Tags, Tag, ArrowLeft, Folder, Info, UserCircle, Cpu, Star, ArrowUp, ArrowDown, FileText, Mail, SplitSquareHorizontal, GraduationCap, CheckCircle2, Share2, DownloadCloud,
  Menu, ExternalLink, Users, UserPlus, Globe, Search, Sparkles, Check, CheckCircle,
  Type, Sliders, Palette, ClipboardPaste, Maximize2, Table as TableIcon, Copy
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon, XIcon } from "../components/SocialIcons";
import { useData } from "../context/DataContext";
import imageCompression from "browser-image-compression";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import mammoth from "mammoth";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const ADMIN_PASSWORD = "ankit@admin";

const apiFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("admin_token");
  const headers = {
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

const TABS = [
  { id: "quickinfo",  label: "Quick Info",  icon: Info },
  { id: "aboutme",    label: "About Me",    icon: UserCircle },
  { id: "cv",         label: "My CV",       icon: DownloadCloud },
  { id: "education",  label: "My Education",icon: GraduationCap },
  { id: "skills",     label: "Skills",      icon: Cpu },
  { id: "projects",   label: "Projects",    icon: FolderGit2 },
  { id: "team_profiles", label: "Team Profiles", icon: Users },
  { id: "featured",   label: "Home Page (Featured)", icon: Star },
  { id: "categories", label: "Categories",  icon: Tags },
  { id: "gallery",    label: "Gallery",     icon: Image },
  { id: "certificates",label: "Certificates",icon: Award },
  { id: "testimonials",label: "Testimonials",icon: MessageSquare },
  { id: "blog",       label: "Blog Posts",  icon: BookOpen },
  { id: "proposals",  label: "Proposals",   icon: FileText },
  { id: "messages",   label: "Messages",    icon: Mail },
  { id: "contact_links", label: "Contact Links", icon: Share2 },
];

/* ─── Small reusable components ─────────────────────────── */
/* ─── Modern Reusable Color Picker & Presets Controller ────────── */
function ColorPickerControl({
  label = "Color",
  name,
  value,
  onChange,
  presets = ["#3B82F6", "#7C3AED", "#10B981", "#06B6D4", "#F59E0B", "#EC4899", "#6366F1", "#EF4444"],
}) {
  // Safely extract string hex from value if it's an object or non-string
  let rawColor = value;
  if (rawColor && typeof rawColor === "object") {
    rawColor = rawColor.target?.value || rawColor.value || "";
  }
  const currentColor = typeof rawColor === "string" && rawColor.trim() ? rawColor.trim() : "#3B82F6";
  const isValidHex = /^#[0-9A-Fa-f]{6}$/i.test(currentColor);
  const pickerValue = isValidHex ? currentColor : "#3B82F6";

  const handleValChange = (valOrEvent) => {
    let stringVal = "#3B82F6";
    if (typeof valOrEvent === "string") {
      stringVal = valOrEvent;
    } else if (valOrEvent && valOrEvent.target && typeof valOrEvent.target.value === "string") {
      stringVal = valOrEvent.target.value;
    }

    if (onChange) {
      if (name) {
        // Create an event object with toString so both (e) => e.target.value and (hex) => hex work seamlessly
        const syntheticEvent = {
          target: { name, value: stringVal },
          name,
          value: stringVal,
          toString: () => stringVal,
        };
        onChange(syntheticEvent);
      } else {
        onChange(stringVal);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{label}</label>
          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{typeof rawColor === 'string' ? rawColor : "Auto"}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          {/* Color Preview Swatch Button that opens Native System Picker */}
          <div className="relative group/color shrink-0">
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => handleValChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              title="Click to pick custom color"
            />
            <div
              className="w-10 h-10 rounded-xl border border-white/20 shadow-lg flex items-center justify-center transition-all group-hover/color:scale-105 group-hover/color:border-white/40 cursor-pointer relative overflow-hidden"
              style={{ backgroundColor: pickerValue }}
            >
              <div className="w-3 h-3 rounded-full bg-black/40 border border-white/40 shadow-sm" />
            </div>
          </div>

          {/* Direct Hex Code Input */}
          <input
            type="text"
            name={name}
            value={typeof rawColor === "string" ? rawColor : ""}
            onChange={(e) => handleValChange(e.target.value)}
            placeholder="#3B82F6"
            className="w-full px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white font-mono text-xs uppercase focus:outline-none focus:border-[rgba(168,85,247,0.5)] transition-all"
          />
        </div>

        {/* Quick Presets Swatches */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {(Array.isArray(presets) ? presets : []).map((preset) => {
            const presetStr = String(preset || "");
            const isSelected = currentColor.toLowerCase() === presetStr.toLowerCase();
            return (
              <button
                key={presetStr}
                type="button"
                onClick={() => handleValChange(presetStr)}
                className={`w-5 h-5 rounded-md border transition-all ${
                  isSelected
                    ? "scale-115 border-white shadow-[0_0_8px_rgba(255,255,255,0.6)] ring-1 ring-white/60 z-10"
                    : "border-white/20 hover:scale-110 opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: presetStr }}
                title={`Select ${presetStr}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "", rows = 3 }) {
  if (type === "color") {
    return (
      <ColorPickerControl
        label={label}
        name={name}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm resize-y transition-all"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all"
        />
      )}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300 transition-all"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-blue-400 hover:bg-[rgba(59,130,246,0.2)] hover:text-blue-300 transition-all"
      title="Edit"
    >
      <Edit2 className="w-4 h-4" />
    </button>
  );
}

function VisibilityBtn({ hidden, onClick }) {
  return (
    <button
      onClick={onClick}
      title={hidden ? "Show project (currently hidden)" : "Hide project from public"}
      className={`p-2 rounded-lg transition-all border ${
        hidden
          ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-amber-400 hover:bg-[rgba(245,158,11,0.2)]"
          : "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-emerald-400 hover:bg-[rgba(16,185,129,0.2)]"
      }`}
    >
      {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function SectionCard({ title, color = "#7C3AED", children }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: color }} />
        <h3 className="font-space font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toast({ msg, type = "success", onClose }) {
  const colors = {
    success: "bg-[#10B981]",
    warning: "bg-[#F59E0B]",
    error:   "bg-[#EF4444]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-xl ${colors[type] || colors.success} text-white text-sm font-semibold shadow-2xl`}
    >
      <Save className="w-4 h-4" /> {msg}
      <button onClick={onClose}><X className="w-4 h-4 opacity-70" /></button>
    </motion.div>
  );
}

function CloudinaryUpload({ onUpload, label = "Upload", multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFileChange = async (e) => {
    let files = Array.from(e.target.files);
    if (files.length === 0) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === 'your_cloud_name_here') {
      alert("Please set your Cloudinary Cloud Name in the .env file.");
      if (e.target) e.target.value = "";
      return;
    }

    setUploading(true);
    setStatusText(files.length > 1 ? `Uploading (0/${files.length})...` : "Uploading...");
    
    try {
      let completed = 0;
      const uploadPromises = files.map(async (originalFile) => {
        let file = originalFile;
        if (file.type.startsWith("image/")) {
          try {
            const options = {
              maxSizeMB: 1.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            file = await imageCompression(file, options);
          } catch (error) {
            console.error("Image compression error:", error);
          }
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        completed += 1;
        if (files.length > 1) {
          setStatusText(`Uploading (${completed}/${files.length})...`);
        }

        if (data.secure_url) {
          return { url: data.secure_url, name: originalFile.name };
        } else {
          throw new Error(data.error?.message || "Unknown error");
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = [];
      
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulUploads.push(result.value);
        } else {
          console.error("Upload error for file:", files[index].name, result.reason);
        }
      });

      if (multiple) {
        onUpload(successfulUploads);
      } else {
        if (successfulUploads.length > 0) onUpload(successfulUploads[0].url);
      }
    } catch (err) {
      console.error("Batch upload error", err);
    } finally {
      setUploading(false);
      setStatusText("");
      if (e?.target) e.target.value = "";
    }
  };

  return (
    <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.2)] transition-all cursor-pointer text-sm font-semibold select-none">
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
      {uploading ? (statusText || "Uploading...") : label}
      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} disabled={uploading} multiple={multiple} />
    </label>
  );
}


/* ─── Markdown Editor ────────────────────────────────────── */
function MarkdownEditor({ value, onChange, placeholder, rows = 12 }) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview' | 'split'
  const isMarkdown = value && (
    value.includes('# ') || value.includes('## ') || value.includes('- ') ||
    value.includes('**') || value.includes('```') || value.includes('> ')
  );

  return (
    <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Markdown Editor</span>
          {isMarkdown && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[rgba(168,85,247,0.2)] text-[#A855F7] border border-[rgba(168,85,247,0.3)]">MD Detected</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
          {[['edit','✏️ Write'], ['split','⬛ Split'], ['preview','👁 Preview']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                mode === m ? 'bg-[rgba(168,85,247,0.3)] text-[#C084FC] border border-[rgba(168,85,247,0.4)]' : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Hint bar */}
      {mode === 'edit' && (
        <div className="px-3 py-1.5 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] flex flex-wrap gap-x-4 gap-y-0.5">
          {[['# Heading','h1'],['## Heading','h2'],['**bold**','b'],['- list item','ul'],['> quote','q'],['`code`','c'],['```\nblock\n```','pre']].map(([ex]) => (
            <span key={ex} className="text-[9px] text-[#475569] font-mono">{ex}</span>
          ))}
        </div>
      )}

      {/* Editor / Preview area */}
      <div className={`${mode === 'split' ? 'flex divide-x divide-[rgba(255,255,255,0.05)]' : ''}`}>
        {/* Editor pane */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className={`${mode === 'split' ? 'w-1/2' : 'w-full'} px-4 py-3 bg-transparent text-white text-sm font-mono leading-relaxed focus:outline-none resize-y placeholder:text-[#334155]`}
            style={{ minHeight: `${rows * 24}px` }}
          />
        )}

        {/* Preview pane */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} px-4 py-3 overflow-auto`} style={{ minHeight: `${rows * 24}px` }}>
            {value ? (
              <div className="prose prose-invert prose-sm max-w-none
                prose-p:text-[#94A3B8] prose-p:leading-relaxed prose-p:my-1
                prose-headings:text-white prose-headings:font-bold
                prose-h1:text-xl prose-h1:border-b prose-h1:border-[rgba(255,255,255,0.1)] prose-h1:pb-2 prose-h1:mb-3
                prose-h2:text-lg prose-h2:text-[#C084FC] prose-h2:mt-4 prose-h2:mb-2
                prose-h3:text-base prose-h3:text-[#38BDF8] prose-h3:mt-3 prose-h3:mb-1
                prose-strong:text-white
                prose-a:text-[#38BDF8] prose-a:no-underline hover:prose-a:underline
                prose-code:text-[#A855F7] prose-code:bg-[rgba(168,85,247,0.1)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-[rgba(0,0,0,0.4)] prose-pre:border prose-pre:border-[rgba(255,255,255,0.1)] prose-pre:rounded-lg
                prose-blockquote:border-l-[#A855F7] prose-blockquote:text-[#64748B] prose-blockquote:bg-[rgba(168,85,247,0.05)] prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r
                prose-li:text-[#94A3B8] prose-li:my-0.5
                prose-ul:my-1 prose-ol:my-1
                prose-table:text-sm prose-th:text-[#C084FC] prose-th:border-[rgba(255,255,255,0.1)] prose-td:border-[rgba(255,255,255,0.06)] prose-td:text-[#94A3B8]
                prose-hr:border-[rgba(255,255,255,0.08)]"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-[#334155] text-sm italic">Preview will appear here...</p>
            )}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
        <span className="text-[9px] text-[#334155] font-mono">
          {(value || '').split('\n').length} lines · {(value || '').length} chars
        </span>
        {isMarkdown && (
          <span className="text-[9px] text-[#475569]">
            {(value || '').split('\n').filter(l => l.startsWith('#')).length} headings ·{' '}
            {(value || '').split('\n').filter(l => l.trim().startsWith('- ')).length} list items
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Tab panels ─────────────────────────────────────────── */

const getAutoIcon = (name) => {
  let query = name.toLowerCase().replace(/[^a-z0-9+#]/g, '');
  if (query.includes('c++')) query = 'cpp';
  else if (query === 'c#') query = 'cs';
  else if (query === 'c') query = 'c';
  else if (query.includes('react')) query = 'react';
  else if (query.includes('node')) query = 'nodejs';
  else if (query.includes('tailwind')) query = 'tailwind';
  else if (query.includes('mongo')) query = 'mongodb';
  else if (query.includes('postgres')) query = 'postgres';
  else if (query.includes('mysql')) query = 'mysql';
  else if (query.includes('python')) query = 'python';
  else if (query.includes('java') && !query.includes('script')) query = 'java';
  else if (query.includes('javascript') || query === 'js') query = 'js';
  else if (query.includes('typescript') || query === 'ts') query = 'ts';
  else if (query.includes('html')) query = 'html';
  else if (query.includes('css')) query = 'css';
  else if (query.includes('github')) query = 'github';
  else if (query.includes('git')) query = 'git';
  else if (query.includes('docker')) query = 'docker';
  else if (query.includes('aws')) query = 'aws';
  else if (query.includes('linux')) query = 'linux';
  else if (query.includes('figma')) query = 'figma';
  else if (query.includes('next')) query = 'nextjs';
  else if (query.includes('vue')) query = 'vue';
  else if (query.includes('angular')) query = 'angular';
  else if (query.includes('svelte')) query = 'svelte';
  else if (query.includes('express')) query = 'express';
  else if (query.includes('spring')) query = 'spring';
  else if (query.includes('php')) query = 'php';
  else if (query.includes('laravel')) query = 'laravel';
  else if (query.includes('django')) query = 'django';
  else if (query.includes('flask')) query = 'flask';
  else if (query.includes('firebase')) query = 'firebase';
  else if (query.includes('supabase')) query = 'supabase';
  else if (query.includes('redis')) query = 'redis';
  else if (query.includes('graphql')) query = 'graphql';
  else if (query.includes('bash')) query = 'bash';
  else if (query.includes('go')) query = 'go';
  else if (query.includes('rust')) query = 'rust';
  else if (query.includes('swift')) query = 'swift';
  else if (query.includes('kotlin')) query = 'kotlin';
  else if (query.includes('dart')) query = 'dart';
  else if (query.includes('flutter')) query = 'flutter';
  else return null;

  return `https://skillicons.dev/icons?i=${query}`;
};

function SkillsTab({ showToast }) {
  const { skills, setSkills, loadingSkills } = useData();
  const blank = { name: "", icon: "", color: "#2563EB", level: 80, categories: [], hidden: false };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategoryToggle = (cat) => {
    const cats = form.categories || [];
    if (cats.includes(cat)) setForm({ ...form, categories: cats.filter(c => c !== cat) });
    else setForm({ ...form, categories: [...cats, cat] });
  };
  
  const handleCustomCategory = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      handleCategoryToggle(e.target.value.trim());
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    
    // Auto-detect icon if empty
    let finalForm = { ...form };
    if (!finalForm.icon || finalForm.icon.trim() === '') {
       const autoIcon = getAutoIcon(finalForm.name);
       if (autoIcon) finalForm.icon = autoIcon;
       else finalForm.icon = "Code2"; // Fallback
    }

    try {
      if (editingId) {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/skills/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalForm)
        });
        const saved = await res.json();
        setSkills(skills.map(s => s.id === editingId ? saved : s));
        showToast("Skill updated!");
      } else {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalForm)
        });
        const saved = await res.json();
        setSkills([saved, ...skills]);
        showToast("Skill added!");
      }
      setOpen(false);
      setForm(blank);
      setEditingId(null);
    } catch (err) {
      showToast("Error saving skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/skills/${id}`, { method: 'DELETE' });
      setSkills(skills.filter(s => s.id !== id));
      showToast("Skill deleted!");
    } catch (err) {
      showToast("Error deleting skill", "error");
    }
  };
  
  const handleToggleHide = async (skill) => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/skills/${skill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...skill, hidden: !skill.hidden })
      });
      const saved = await res.json();
      setSkills(skills.map(s => s.id === skill.id ? saved : s));
      showToast(skill.hidden ? "Skill is now visible" : "Skill is now hidden");
    } catch (err) {
      showToast("Error toggling visibility", "error");
    }
  };

  const allCategories = Array.from(new Set(skills.flatMap(s => s.categories || [])));

  if (loadingSkills) return <div className="p-8 text-[#94A3B8] flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Loading skills...</div>;

  if (open) {
    return (
      <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { setOpen(false); setForm(blank); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white transition-all text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-space font-bold text-white">{editingId ? "Edit Skill" : "New Skill"}</h2>
        </div>
        
        <SectionCard title="Basic Info" color="#A855F7">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Skill Name" name="name" value={form.name} onChange={onChange} placeholder="e.g. React" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Icon / Image</label>
              <div className="flex gap-2 items-center">
                <input type="text" name="icon" value={form.icon || ""} onChange={onChange} placeholder="Emoji (⚛️) or URL" className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#A855F7]" />
                <CloudinaryUpload onUpload={(url) => setForm({...form, icon: url})} label="Upload" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Color (Hex)</label>
               <div className="flex gap-2">
                 <input type="color" name="color" value={form.color} onChange={onChange} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0" />
                 <input type="text" name="color" value={form.color} onChange={onChange} className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#A855F7]" />
               </div>
            </div>
            <Field label="Proficiency Level (%)" name="level" type="number" value={form.level} onChange={onChange} />
          </div>
        </SectionCard>

        <SectionCard title="Categories (Multiple)" color="#10B981">
          <div className="flex flex-wrap gap-2 mb-4">
            {allCategories.map(cat => (
              <button 
                key={cat} 
                onClick={() => handleCategoryToggle(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${form.categories?.includes(cat) ? 'bg-[rgba(16,185,129,0.2)] text-[#10B981] border border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] border border-transparent hover:bg-[rgba(255,255,255,0.1)]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] mb-2">Or add a new custom category (type and press Enter):</p>
          <input 
            type="text" 
            placeholder="e.g. DevOps" 
            onKeyDown={handleCustomCategory}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#10B981]" 
          />
        </SectionCard>

        <div className="flex justify-end gap-3 sticky bottom-6 z-50">
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#2563EB] text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:opacity-90 transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Skill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-space font-bold text-white">Skills <span className="text-[#94A3B8] text-lg font-normal">({skills.length})</span></h2>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[rgba(168,85,247,0.1)] text-[#C084FC] border border-[rgba(168,85,247,0.2)] rounded-xl hover:bg-[rgba(168,85,247,0.2)] transition-all font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className={`rounded-xl border p-5 flex flex-col items-center gap-3 relative group transition-all ${skill.hidden ? 'bg-[rgba(245,158,11,0.02)] border-[rgba(245,158,11,0.1)] opacity-70' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'}`}>
            {skill.hidden && <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <VisibilityBtn hidden={skill.hidden} onClick={() => handleToggleHide(skill)} />
              <EditBtn onClick={() => { setForm(skill); setEditingId(skill.id); setOpen(true); }} />
              <DeleteBtn onClick={() => handleDelete(skill.id)} />
            </div>
            
            <div className="text-4xl mt-4 h-12 flex items-center justify-center">
              {skill.icon && typeof skill.icon === 'string' && skill.icon.startsWith('http') ? <img src={skill.icon} alt={skill.name} className="w-10 h-10 object-contain" /> : skill.icon}
            </div>
            <h3 className="text-white font-bold text-lg text-center">{skill.name}</h3>
            
            <div className="w-full flex flex-col gap-1 mt-2">
              <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${skill.level}%`, background: skill.color || '#2563EB' }} />
              </div>
              <div className="flex justify-between text-xs text-[#64748B] font-mono">
                <span>0</span>
                <span>{skill.level}%</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {(skill.categories || []).map(c => (
                <span key={c} className="text-[10px] px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[#94A3B8]">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {skills.length === 0 && (
        <div className="text-center py-20 border border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl">
          <Award className="w-12 h-12 text-[#475569] mx-auto mb-4 opacity-50" />
          <h3 className="text-white font-semibold text-lg mb-2">No skills found</h3>
          <p className="text-[#94A3B8] text-sm">Add some technologies you work with.</p>
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ showToast }) {
  const { projects, setProjects, add, remove, edit, categories, teamProfiles = [] } = useData();
  const blank = { title: "", description: "", tech: "", github: "", demo: "", youtubeUrl: "", docsUrl: "", startDate: "", duration: "", color: "#7C3AED", image: "", logo: "", projectType: [], architecture: "", screenshots: [""], notes: [""], team: [], hidden: false, featured: false, featured_order: 0, status: "", version: "", extraInfo: [] };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  // "rich" = one big textarea with ## headings + - bullets; "simple" = individual note cards
  const [notesMode, setNotesMode] = useState("rich");
  // For rich mode: the combined raw text
  const richText = notesMode === "rich" ? (form.notes || []).join('\n') : "";
  const setRichText = (val) => setForm(f => ({ ...f, notes: val ? [val] : [""] }));

  const moveProjectOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const items = [...projects];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap their array positions
    const temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;

    // Reassign project_order continuously from 1 to N
    const updatedItems = items.map((item, i) => ({
      ...item,
      project_order: i + 1,
      featured_order: item.featured ? i + 1 : (item.featured_order || 0)
    }));

    // Optimistic UI update
    setProjects(updatedItems);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updatedItems.map(i => ({ id: i.id, project_order: i.project_order })) })
      });
      const featuredItems = updatedItems.filter(p => p.featured);
      if (featuredItems.length > 0) {
        await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/featured/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: featuredItems.map((p, idx) => ({ id: p.id, featured_order: idx + 1 })) })
        }).catch(() => {});
      }
      if (res.ok) showToast("Project order updated!", "success");
      else showToast("Error updating order", "error");
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  // Directly set a project's number / position by typing a number
  const handleSetProjectOrder = async (fromIndex, targetOrder) => {
    const target = parseInt(targetOrder, 10);
    if (isNaN(target)) return;
    const clampedTarget = Math.max(1, Math.min(projects.length, target));
    const toIndex = clampedTarget - 1;
    if (fromIndex === toIndex) return;

    const items = [...projects];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    // Reassign project_order continuously from 1 to N
    const updatedItems = items.map((item, i) => ({
      ...item,
      project_order: i + 1,
      featured_order: item.featured ? i + 1 : (item.featured_order || 0)
    }));

    // Optimistic UI update
    setProjects(updatedItems);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updatedItems.map(i => ({ id: i.id, project_order: i.project_order })) })
      });
      const featuredItems = updatedItems.filter(p => p.featured);
      if (featuredItems.length > 0) {
        await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/featured/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: featuredItems.map((p, idx) => ({ id: p.id, featured_order: idx + 1 })) })
        }).catch(() => {});
      }
      if (res.ok) showToast(`Moved "${moved.title}" to #${clampedTarget}!`, "success");
      else showToast("Error updating order", "error");
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCategoryToggle = (categoryName) => {
    const currentCategories = Array.isArray(form.projectType) ? form.projectType : (form.projectType ? [form.projectType] : []);
    if (currentCategories.includes(categoryName)) {
      setForm({ ...form, projectType: currentCategories.filter(c => c !== categoryName) });
    } else {
      setForm({ ...form, projectType: [...currentCategories, categoryName] });
    }
  };

  const handleArrayAdd = (field, initialItem) => {
    setForm((f) => ({ ...f, [field]: [...(f[field] || []), initialItem] }));
  };

  const handleArrayUpdate = (field, index, value) => {
    setForm((f) => {
      const arr = [...(f[field] || [])];
      arr[index] = value;
      return { ...f, [field]: arr };
    });
  };

  const handleArrayRemove = (field, index) => {
    setForm((f) => {
      const arr = [...(f[field] || [])];
      arr.splice(index, 1);
      return { ...f, [field]: arr };
    });
  };

  const handleSave = () => {
    if (!form.title || !form.title.trim()) {
      showToast("Project Title is required!", "error");
      return;
    }
    const processedTech = typeof form.tech === 'string' ? form.tech.split(",").map((t) => t.trim()).filter(Boolean) : form.tech;
    
    // Clean up empty array items before saving and normalize screenshots
    const cleanedScreenshots = (form.screenshots || [])
      .map(s => (typeof s === 'string' ? s : s?.url || ''))
      .filter(s => typeof s === 'string' && s.trim());

    const isFeatured = Boolean(form.featured);
    let newFeaturedOrder = form.featured_order || 0;
    if (!editingId && isFeatured) {
      const maxOrder = Math.max(0, ...projects.filter(p => p.featured).map(p => p.featured_order || 0));
      newFeaturedOrder = maxOrder + 1;
    }

    const cleanedForm = {
      ...form,
      tech: processedTech,
      screenshots: cleanedScreenshots,
      notes: (form.notes || []).filter(n => typeof n === 'string' && n.trim()),
      team: (form.team || []).filter(t => t && typeof t.name === 'string' && t.name.trim()),
      image: cleanedScreenshots[0] || form.image || "",
      logo: form.logo || "",
      hidden: Boolean(form.hidden),
      featured: isFeatured,
      featured_order: newFeaturedOrder,
    };

    if (editingId) {
      const targetPos = parseInt(form.project_order, 10);
      const currentPos = projects.findIndex(p => p.id === editingId) + 1;

      edit(projects, setProjects, editingId, cleanedForm, 'projects');

      if (!isNaN(targetPos) && targetPos !== currentPos && targetPos >= 1 && targetPos <= projects.length) {
        setTimeout(() => {
          handleSetProjectOrder(currentPos - 1, targetPos);
        }, 150);
      }

      showToast(
        isFeatured
          ? "Project updated! (Showing on Home Page & Projects Page)"
          : "Project updated! (Showing on Projects Page)",
        "success"
      );
    } else {
      const targetPos = parseInt(form.project_order, 10);
      add(projects, setProjects, { ...cleanedForm, project_order: targetPos || projects.length + 1 }, 'projects');
      if (!isNaN(targetPos) && targetPos < projects.length + 1) {
        setTimeout(() => {
          handleSetProjectOrder(projects.length, targetPos);
        }, 350);
      }
      showToast(
        isFeatured
          ? "Project added to Home Page & Projects Page!"
          : "Project added to Projects Page!",
        "success"
      );
    }
    setForm(blank); setOpen(false); setEditingId(null);
  };

  const handleEditClick = (project) => {
    const rawNotes = project.notes?.length ? project.notes : [""];
    // Detect mode: if any note contains ## headings or multi-line rich content → rich mode
    const isRich = rawNotes.some(n => n.includes('##') || n.includes('\n'));
    setNotesMode(isRich ? "rich" : "rich"); // always start in rich mode for easier editing

    const loadedScreenshots = (project.screenshots?.length
      ? project.screenshots
      : (project.image ? [project.image] : [""]))
      .map(s => (typeof s === 'string' ? s : s?.url || ''))
      .filter(Boolean);

    const currentPosition = (projects.findIndex(p => p.id === project.id) + 1) || 1;

    setForm({
      ...blank,
      ...project,
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""),
      projectType: Array.isArray(project.projectType) ? project.projectType : (project.projectType ? [project.projectType] : []),
      screenshots: loadedScreenshots.length ? loadedScreenshots : [""],
      notes: rawNotes,
      team: project.team || [],
      logo: project.logo || "",
      hidden: Boolean(project.hidden),
      featured: Boolean(project.featured),
      featured_order: project.featured_order || 0,
      project_order: currentPosition,
      status: project.status || "",
      version: project.version || "",
      extraInfo: project.extraInfo || [],
    });
    setEditingId(project.id);
    setOpen(true);
  };

  const handleCancelEdit = () => {
    setForm(blank);
    setEditingId(null);
    setOpen(false);
  };

  // Toggle hidden status instantly without opening the form
  const handleToggleVisibility = async (project) => {
    const updated = { ...project, hidden: !project.hidden };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(
      updated.hidden ? "Project hidden from public." : "Project is now visible!",
      updated.hidden ? "warning" : "success"
    );
  };

  // Toggle featured status (Home Page display) instantly with 1-click
  const handleToggleFeatured = async (project) => {
    const isNowFeatured = !project.featured;
    let newOrder = project.featured_order || 0;
    if (isNowFeatured) {
      const maxOrder = Math.max(0, ...projects.filter(p => p.featured).map(p => p.featured_order || 0));
      newOrder = maxOrder + 1;
    }
    const updated = { ...project, featured: isNowFeatured, featured_order: newOrder };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(
      isNowFeatured
        ? "★ Added to Home Page (Featured)!"
        : "Removed from Home Page (still in Projects page)",
      isNowFeatured ? "success" : "info"
    );
  };

  const visibleCount  = projects.filter(p => !p.hidden).length;
  const hiddenCount   = projects.filter(p =>  p.hidden).length;
  const featuredCount = projects.filter(p => Boolean(p.featured) && !p.hidden).length;

  return (
    <div className="space-y-6">
      <SectionCard title={`All Projects (${projects.length})`} color="#2563EB">
        {/* Live counters */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {visibleCount} in Projects Page
          </span>
          <span className="px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-amber-400 font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {featuredCount} on Home Page
          </span>
          {hiddenCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-red-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {hiddenCount} hidden
            </span>
          )}
        </div>

        <div className="space-y-3">
          {projects.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
              p.hidden
                ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
            }`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col gap-1 items-center justify-center">
                  <button onClick={() => moveProjectOrder(i, 'up')} disabled={i === 0} className="text-[#64748B] hover:text-white disabled:opacity-30 p-1"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveProjectOrder(i, 'down')} disabled={i === projects.length - 1} className="text-[#64748B] hover:text-white disabled:opacity-30 p-1"><ArrowDown className="w-3 h-3" /></button>
                </div>
                
                <div className="relative flex items-center shrink-0 group/num" title="Click to write/change number position">
                  <span className="absolute left-2 text-[11px] font-bold text-[#38BDF8] pointer-events-none select-none">#</span>
                  <input
                    type="number"
                    min="1"
                    max={projects.length}
                    defaultValue={i + 1}
                    key={`proj-num-${p.id}-${i + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== i + 1) {
                        handleSetProjectOrder(i, val);
                      } else {
                        e.target.value = i + 1;
                      }
                    }}
                    className="w-12 h-8 pl-4 pr-1 text-center rounded-lg bg-[rgba(37,99,235,0.12)] hover:bg-[rgba(37,99,235,0.22)] focus:bg-[rgba(37,99,235,0.3)] border border-[rgba(56,189,248,0.25)] focus:border-[#38BDF8] text-[#38BDF8] focus:text-white font-mono font-bold text-xs outline-none transition-all shadow-[0_0_10px_rgba(37,99,235,0.15)] focus:ring-1 focus:ring-[#38BDF8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                  />
                </div>

                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    {p.hidden ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400 font-bold flex-shrink-0 border border-[rgba(239,68,68,0.3)]">HIDDEN</span>
                    ) : p.featured ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold flex items-center gap-1 flex-shrink-0 border border-[rgba(245,158,11,0.3)] shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                        <Star className="w-3 h-3 fill-amber-400" /> HOME PAGE
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(56,189,248,0.08)] text-[#38BDF8] font-medium flex-shrink-0 border border-[rgba(56,189,248,0.2)]">
                        Projects Page Only
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] truncate">{Array.isArray(p.tech) ? p.tech.join(", ") : p.tech}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(p)}
                  className={`p-2 rounded-lg border transition-all ${
                    p.featured
                      ? "bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.4)] text-amber-400 hover:bg-[rgba(245,158,11,0.25)] shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-amber-400 hover:border-[rgba(245,158,11,0.3)]"
                  }`}
                  title={p.featured ? "Featured on Home Page (click to remove)" : "Not on Home Page (click to show on Home Page)"}
                >
                  <Star className={`w-4 h-4 ${p.featured ? "fill-amber-400" : ""}`} />
                </button>
                <VisibilityBtn hidden={p.hidden} onClick={() => handleToggleVisibility(p)} />
                <EditBtn onClick={() => handleEditClick(p)} />
                <DeleteBtn onClick={() => { remove(projects, setProjects, p.id, 'projects'); showToast("Project removed!", "error"); }} />
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-center text-[#475569] text-sm py-6">No projects yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title={editingId ? "Edit Project" : "Add New Project"} color="#10B981">
        <button onClick={() => {
            if (open && editingId) handleCancelEdit();
            else setOpen((o) => !o);
          }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
          <Plus className="w-4 h-4" /> {open ? "Collapse form" : "Add project"}
        </button>
        {open && (
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="sm:col-span-2 grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Field label="Title *"       name="title"       value={form.title}       onChange={onChange} placeholder="My Awesome App" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
                  <span>Display Number</span>
                  <span className="text-[#64748B] normal-case font-normal text-[11px]">(Position #)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-bold text-[#38BDF8] select-none">#</span>
                  <input
                    type="number"
                    min="1"
                    max={projects.length + (editingId ? 0 : 1)}
                    name="project_order"
                    value={form.project_order || (editingId ? (projects.findIndex(p => p.id === editingId) + 1) : projects.length + 1)}
                    onChange={(e) => setForm(f => ({ ...f, project_order: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white font-mono font-bold text-sm focus:outline-none focus:border-[#38BDF8] transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Project Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    value={form.color || "#7C3AED"}
                    onChange={onChange}
                    className="w-11 h-10 p-1 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={form.color || ""}
                    onChange={onChange}
                    placeholder="#7C3AED"
                    className="w-28 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white font-mono text-sm uppercase placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)]"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {["#7C3AED", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: preset }))}
                        className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: preset }}
                        title={preset}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Categories</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {categories.map(cat => {
                    const currentCategories = Array.isArray(form.projectType) ? form.projectType : (form.projectType ? [form.projectType] : []);
                    const isSelected = currentCategories.includes(cat.name);
                    return (
                      <label key={cat.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${isSelected ? 'bg-[rgba(168,85,247,0.15)] border-[#A855F7] text-white' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:border-[rgba(255,255,255,0.2)]'}`}>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(cat.name)}
                        />
                        {cat.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <Field label="Tech (comma-separated)" name="tech" value={form.tech} onChange={onChange} placeholder="React, Node.js, MongoDB" />
              
              <Field label="GitHub URL"     name="github"      value={form.github}      onChange={onChange} placeholder="https://github.com/..." />
              <Field label="Live Link"      name="demo"        value={form.demo}        onChange={onChange} placeholder="https://..." />
              
              <Field label="YouTube Demo"   name="youtubeUrl"  value={form.youtubeUrl}  onChange={onChange} placeholder="https://youtube.com/..." />
              <Field label="Docs Link"      name="docsUrl"     value={form.docsUrl}     onChange={onChange} placeholder="https://docs..." />
              
              <Field label="Start Date"     name="startDate"   value={form.startDate}   onChange={onChange} placeholder="Jun 2025" />
              <Field label="Duration"       name="duration"    value={form.duration}    onChange={onChange} placeholder="2 Months" />

              {/* Logo Upload */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Website / App Logo <span className="text-[#64748B] normal-case font-normal">(shown next to project title)</span></label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="logo"
                    value={form.logo || ""}
                    onChange={onChange}
                    placeholder="https://logo-url.png or upload →"
                    className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all"
                  />
                  <CloudinaryUpload onUpload={(url) => setForm((f) => ({ ...f, logo: url }))} />
                  {form.logo && (
                    <img src={form.logo} alt="logo preview" className="w-10 h-10 rounded-lg object-contain bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Screenshots Manager */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
              <label className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span>
                  Screenshots <span className="text-xs font-normal text-[#94A3B8]">({(form.screenshots || []).filter(s => (typeof s === 'string' ? s : s?.url || '').trim()).length} added)</span>
                </span>
                <div className="flex gap-2">
                  <CloudinaryUpload 
                    label="Bulk Upload" 
                    multiple={true} 
                    onUpload={(items) => {
                      const uploadedUrls = (Array.isArray(items) ? items : [items])
                        .map(item => (typeof item === 'string' ? item : item?.url || ''))
                        .filter(u => u && typeof u === 'string' && u.trim());

                      if (uploadedUrls.length === 0) return;

                      setForm(f => {
                        const current = (f.screenshots || [])
                          .map(s => (typeof s === 'string' ? s : s?.url || ''))
                          .filter(s => s && typeof s === 'string' && s.trim());
                        
                        const updated = [...current, ...uploadedUrls];
                        return { 
                          ...f, 
                          screenshots: updated.length ? updated : [""],
                          image: f.image || updated[0] || ""
                        };
                      });
                      if (showToast) showToast(`${uploadedUrls.length} screenshot${uploadedUrls.length > 1 ? 's' : ''} uploaded!`, "success");
                    }} 
                  />
                  <button type="button" onClick={() => handleArrayAdd('screenshots', '')} className="text-xs text-[#38BDF8] hover:text-[#0EA5E9] flex items-center gap-1 font-medium px-2.5 py-1.5 rounded-lg bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)] transition-all">
                    <Plus className="w-3.5 h-3.5" /> Add URL
                  </button>
                </div>
              </label>
              <div className="space-y-3">
                {(form.screenshots || []).map((rawUrl, idx) => {
                  const url = typeof rawUrl === 'string' ? rawUrl : rawUrl?.url || '';
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-[rgba(255,255,255,0.02)] p-2 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-colors">
                      {url && typeof url === 'string' && url.startsWith('http') ? (
                        <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-[#64748B] flex-shrink-0 text-xs font-mono">
                          #{idx + 1}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <input 
                          type="text" 
                          value={url} 
                          onChange={(e) => handleArrayUpdate('screenshots', idx, e.target.value)} 
                          placeholder={`Screenshot Image URL ${idx + 1}`} 
                          className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[rgba(168,85,247,0.5)] transition-all" 
                        />
                      </div>
                      <CloudinaryUpload onUpload={(newUrl) => {
                        const urlStr = typeof newUrl === 'string' ? newUrl : newUrl?.url || '';
                        if (urlStr) handleArrayUpdate('screenshots', idx, urlStr);
                      }} />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {idx === 0 ? (
                          <span className="px-2.5 py-1 rounded-md bg-[#3B82F6]/20 text-[#38BDF8] border border-[#38BDF8]/30 text-[10px] font-bold uppercase tracking-wider">
                            Hero
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setForm(f => {
                                const list = [...(f.screenshots || [])];
                                const [moved] = list.splice(idx, 1);
                                list.unshift(moved);
                                const heroUrl = typeof moved === 'string' ? moved : moved?.url || '';
                                return { ...f, screenshots: list, image: heroUrl || f.image };
                              });
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white border border-white/10 text-[10px] font-semibold transition-all"
                            title="Set as primary Hero screenshot"
                          >
                            Set Hero
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            if ((form.screenshots || []).length <= 1) {
                              handleArrayUpdate('screenshots', 0, '');
                            } else {
                              handleArrayRemove('screenshots', idx);
                            }
                          }} 
                          className="p-2.5 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] transition-all"
                          title="Remove screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content & Notes */}
            <div className="sm:col-span-2 space-y-4">
              <Field label="Description"  name="description" value={form.description} onChange={onChange} type="textarea" placeholder="What does this project do?" />
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Architecture Details / README.md</label>
                <MarkdownEditor
                  value={form.architecture || ""}
                  onChange={(e) => setForm(f => ({ ...f, architecture: e.target.value }))}
                  placeholder={`# Project Overview\nDescribe what your project does...\n\n## Architecture\n- Frontend: React + Vite\n- Backend: Express.js\n- Database: MySQL\n\n## Key Features\n- Feature one\n- Feature two\n\n> 💡 Tip: Paste your entire README.md here for automatic detection and formatting!`}
                  rows={14}
                />
              </div>
              
              <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                {/* Header row with mode toggle */}
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Key Features / Notes</label>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                    <button
                      onClick={() => {
                        if (notesMode === 'simple') {
                          // switching to rich: join all notes into one block
                          const joined = (form.notes || []).filter(Boolean).join('\n');
                          setForm(f => ({ ...f, notes: [joined] }));
                          setNotesMode('rich');
                        }
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        notesMode === 'rich'
                          ? 'bg-[rgba(168,85,247,0.25)] text-[#C084FC] border border-[rgba(168,85,247,0.4)]'
                          : 'text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      📝 Rich Text
                    </button>
                    <button
                      onClick={() => {
                        if (notesMode === 'rich') {
                          // switching to simple: split rich text into individual lines
                          const lines = (form.notes?.[0] || '').split('\n').filter(l => l.trim());
                          setForm(f => ({ ...f, notes: lines.length ? lines : [''] }));
                          setNotesMode('simple');
                        }
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        notesMode === 'simple'
                          ? 'bg-[rgba(56,189,248,0.25)] text-[#38BDF8] border border-[rgba(56,189,248,0.4)]'
                          : 'text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      📌 Simple
                    </button>
                  </div>
                </div>

                {notesMode === 'rich' ? (
                  /* ── RICH TEXT MODE ── paste full structured block */
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.15)] text-xs text-[#94A3B8] leading-relaxed">
                      <span className="text-[#A855F7] text-base leading-none mt-0.5">💡</span>
                      <div>
                        <span className="text-[#C084FC] font-semibold">Rich Text Mode</span> — Paste your full features block using{" "}
                        <code className="text-[#A855F7] bg-[rgba(168,85,247,0.15)] px-1 rounded">## Section Title</code> headings and{" "}
                        <code className="text-[#A855F7] bg-[rgba(168,85,247,0.15)] px-1 rounded">- item</code> bullets.
                        Emojis in section titles are auto-extracted as icons (e.g.{" "}
                        <code className="text-[#A855F7] bg-[rgba(168,85,247,0.15)] px-1 rounded">## 🚀 Features</code>).
                      </div>
                    </div>
                    <textarea
                      value={richText}
                      onChange={(e) => setRichText(e.target.value)}
                      rows={16}
                      placeholder={`## 🚀 Features\n- First awesome feature\n- Second feature\n\n## 🔐 Authentication & Security\n- JWT-based authentication\n- Role-based access control\n\n## 💰 Core Module\n- Real-time balance tracking\n- Fund transfers (NEFT, RTGS, IMPS)`}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(168,85,247,0.25)] text-white text-sm font-mono leading-relaxed focus:outline-none focus:border-[rgba(168,85,247,0.6)] resize-y transition-all placeholder:text-[#334155]"
                      style={{ minHeight: '280px' }}
                    />
                    <p className="text-[10px] text-[#475569] text-right">
                      {richText.split('\n').filter(l => l.trim().startsWith('##')).length} sections ·{' '}
                      {richText.split('\n').filter(l => l.trim().match(/^[-*•]/)).length} items
                    </p>
                  </div>
                ) : (
                  /* ── SIMPLE MODE ── individual note cards */
                  <div className="space-y-3">
                    {(form.notes || []).map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="flex-1">
                          <textarea value={note} onChange={(e) => handleArrayUpdate('notes', idx, e.target.value)} rows={2} placeholder="Feature description..." className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm resize-none" />
                        </div>
                        <button onClick={() => handleArrayRemove('notes', idx)} className="p-2.5 mt-1 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => handleArrayAdd('notes', '')} className="text-xs text-[#A855F7] hover:text-[#C084FC] flex items-center gap-1 mt-1">
                      <Plus className="w-3 h-3" /> Add Note
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Team Manager */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(16,185,129,0.05)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Team Members</span>
                  {form.team?.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10B981] text-xs font-bold border border-[rgba(16,185,129,0.3)]">
                      {form.team.length} {form.team.length === 1 ? 'member' : 'members'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowProfilePicker(true)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[rgba(124,58,237,0.25)] to-[rgba(37,99,235,0.25)] hover:from-[rgba(124,58,237,0.4)] hover:to-[rgba(37,99,235,0.4)] border border-[rgba(124,58,237,0.4)] text-[#C084FC] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span>Select from Team Profiles</span>
                    {teamProfiles.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-md bg-[rgba(168,85,247,0.3)] text-white text-[10px]">
                        {teamProfiles.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('team', { name: '', role: '', photo: '', github: '', instagram: '', linkedin: '', email: '' })}
                    className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#10B981]" /> Add Custom
                  </button>
                </div>
              </div>

              {/* Profile Picker Modal */}
              {showProfilePicker && (
                <div className="p-4 rounded-xl bg-[rgba(5,10,20,0.95)] border border-[rgba(124,58,237,0.4)] shadow-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(124,58,237,0.2)] flex items-center justify-center text-[#A855F7]">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-space font-bold text-white text-sm">Add from Saved Team Profiles</h4>
                        <p className="text-[11px] text-[#94A3B8]">Pick a team profile to automatically add them with all social & contact info</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProfilePicker(false)}
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search filter for profiles */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search profiles by name, role, email..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  {/* Profile list */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1" data-lenis-prevent="true">
                    {teamProfiles.length === 0 ? (
                      <div className="text-center py-6 px-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)]">
                        <Users className="w-6 h-6 mx-auto text-[#64748B] mb-2" />
                        <p className="text-xs font-semibold text-white">No Team Profiles Saved Yet</p>
                        <p className="text-[11px] text-[#64748B] mt-1">Open the "Team Profiles" tab from the sidebar to create reusable team profiles.</p>
                      </div>
                    ) : (
                      teamProfiles
                        .filter(p => !pickerSearch || p.name?.toLowerCase().includes(pickerSearch.toLowerCase()) || p.role?.toLowerCase().includes(pickerSearch.toLowerCase()) || p.email?.toLowerCase().includes(pickerSearch.toLowerCase()))
                        .map(p => {
                          const alreadyAdded = (form.team || []).some(m => m.name?.trim().toLowerCase() === p.name?.trim().toLowerCase());
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.04)] transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {p.photo ? (
                                  <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.1)] flex-shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {p.name?.charAt(0) || "?"}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                  <p className="text-[11px] text-[#A855F7] font-medium truncate">{p.role || "Member"}</p>
                                  {p.email && <p className="text-[10px] text-[#64748B] truncate">{p.email}</p>}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  handleArrayAdd('team', {
                                    name: p.name,
                                    role: p.role || '',
                                    photo: p.photo || '',
                                    github: p.github || '',
                                    instagram: p.instagram || '',
                                    linkedin: p.linkedin || '',
                                    email: p.email || '',
                                  });
                                  showToast(`Added ${p.name} to project team!`, "success");
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0 ${
                                  alreadyAdded
                                    ? "bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] hover:bg-[rgba(16,185,129,0.25)]"
                                    : "bg-[rgba(124,58,237,0.25)] text-white hover:bg-[rgba(124,58,237,0.4)] border border-[rgba(124,58,237,0.4)]"
                                }`}
                              >
                                {alreadyAdded ? (
                                  <>
                                    <Check className="w-3 h-3" /> Added (+1)
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" /> Add
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {(form.team || []).map((member, idx) => (
                  <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)] relative group">
                    <button onClick={() => handleArrayRemove('team', idx)} className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Member Header with Preview & Quick Autofill */}
                    <div className="flex items-center gap-3 pr-12 flex-wrap">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name || "Member"} className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.15)] flex-shrink-0 shadow-md" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center text-[#A855F7] font-bold text-xs flex-shrink-0">
                          {member.name?.charAt(0) || idx + 1}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-white block">{member.name || `Member #${idx + 1}`}</span>
                        <span className="text-[10px] text-[#94A3B8]">{member.role || "Role unspecified"}</span>
                      </div>

                      {teamProfiles.length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <label className="text-[10px] text-[#64748B]">Autofill:</label>
                          <select
                            onChange={(e) => {
                              const selected = teamProfiles.find(p => String(p.id) === e.target.value);
                              if (selected) {
                                handleArrayUpdate('team', idx, {
                                  name: selected.name,
                                  role: selected.role || '',
                                  photo: selected.photo || '',
                                  github: selected.github || '',
                                  linkedin: selected.linkedin || '',
                                  instagram: selected.instagram || '',
                                  email: selected.email || '',
                                });
                                showToast(`Filled details from ${selected.name}!`, "success");
                              }
                            }}
                            defaultValue=""
                            className="text-[11px] px-2 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#94A3B8] focus:text-white cursor-pointer"
                          >
                            <option value="" disabled>Choose profile...</option>
                            {teamProfiles.map(p => (
                              <option key={p.id} value={p.id} className="bg-[#0f172a] text-white">{p.name} ({p.role || "Member"})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-12">
                      <input type="text" value={member.name} onChange={(e) => handleArrayUpdate('team', idx, { ...member, name: e.target.value })} placeholder="Name *" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                      <input type="text" value={member.role} onChange={(e) => handleArrayUpdate('team', idx, { ...member, role: e.target.value })} placeholder="Role *" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                      
                      <div className="flex gap-2 items-center sm:col-span-2">
                        <input type="text" value={member.photo} onChange={(e) => handleArrayUpdate('team', idx, { ...member, photo: e.target.value })} placeholder="Photo URL" className="flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                        <CloudinaryUpload onUpload={(url) => handleArrayUpdate('team', idx, { ...member, photo: url })} />
                      </div>
                      
                      <input type="text" value={member.github} onChange={(e) => handleArrayUpdate('team', idx, { ...member, github: e.target.value })} placeholder="GitHub URL" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                      <input type="text" value={member.linkedin} onChange={(e) => handleArrayUpdate('team', idx, { ...member, linkedin: e.target.value })} placeholder="LinkedIn URL" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                      <input type="text" value={member.instagram} onChange={(e) => handleArrayUpdate('team', idx, { ...member, instagram: e.target.value })} placeholder="Instagram URL" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                      <input type="email" value={member.email} onChange={(e) => handleArrayUpdate('team', idx, { ...member, email: e.target.value })} placeholder="Email Address" className="w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                    </div>
                  </div>
                ))}
                {(!form.team || form.team.length === 0) && (
                  <p className="text-xs text-[#64748B] italic">No team members added. Will display as "Solo Developer".</p>
                )}
              </div>
            </div>

            {/* Status & Version */}
            <Field label="Status"  name="status"  value={form.status  || ""} onChange={onChange} placeholder="Active / Completed / In Progress / Archived" />
            <Field label="Version" name="version" value={form.version || ""} onChange={onChange} placeholder="v1.0" />

            {/* Extra Info Manager */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
              <label className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">ℹ️ Extra Info Cards <span className="text-xs font-normal text-[#64748B]">(shown on the Info tab)</span></span>
                <button
                  type="button"
                  onClick={() => handleArrayAdd('extraInfo', { label: '', value: '', hidden: false })}
                  className="text-xs text-[#A855F7] hover:text-[#C084FC] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Info Card
                </button>
              </label>
              <div className="space-y-2">
                {(form.extraInfo || []).map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${item.hidden ? 'bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-60' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)]'}`}>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleArrayUpdate('extraInfo', idx, { ...item, label: e.target.value })}
                      placeholder="Label (e.g. Platform)"
                      className="w-36 flex-shrink-0 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[rgba(168,85,247,0.5)]"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleArrayUpdate('extraInfo', idx, { ...item, value: e.target.value })}
                      placeholder="Value (e.g. Web / Mobile)"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[rgba(168,85,247,0.5)]"
                    />
                    {item.hidden && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold flex-shrink-0">HIDDEN</span>}
                    <button
                      type="button"
                      title={item.hidden ? "Show" : "Hide"}
                      onClick={() => handleArrayUpdate('extraInfo', idx, { ...item, hidden: !item.hidden })}
                      className={`p-1.5 rounded-lg transition-all flex-shrink-0 border ${item.hidden ? 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-amber-400' : 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-emerald-400'}`}
                    >
                      {item.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('extraInfo', idx)}
                      className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!form.extraInfo || form.extraInfo.length === 0) && (
                  <p className="text-xs text-[#475569] italic text-center py-3">No extra info cards. Click "Add Info Card" to add custom fields like Platform, License, Client, etc.</p>
                )}
              </div>
            </div>

            {/* Home Page Featured Showcase Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.18)] hover:border-[rgba(245,158,11,0.35)] transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  form.featured 
                    ? "bg-[rgba(245,158,11,0.2)] border-[rgba(245,158,11,0.5)] text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]" 
                    : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#64748B]"
                }`}>
                  <Star className={`w-5 h-5 ${form.featured ? "fill-amber-400" : ""}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Show on Home Page (Featured Project)</p>
                    {form.featured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.2)] text-amber-300 font-bold border border-[rgba(245,158,11,0.35)]">
                        ACTIVE ON HOME PAGE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    When enabled, this project will appear in the "Featured Projects" section on the Home Page.
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    All visible projects will always appear on the public <span className="text-[#38BDF8]">/projects</span> page.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 border shrink-0 ${
                  form.featured
                    ? "bg-[rgba(245,158,11,0.3)] border-[rgba(245,158,11,0.5)] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    : "bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.15)]"
                }`}
                title="Toggle Home Page display"
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-md ${
                  form.featured ? "left-6 bg-amber-400" : "left-0.5 bg-[#64748B]"
                }`} />
              </button>
            </div>

            {/* Visibility Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="text-sm font-semibold text-white">Public Visibility</p>
                <p className="text-xs text-[#64748B] mt-0.5">Hidden projects won't appear on the public Projects page</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
                  form.hidden
                    ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]"
                    : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-md ${
                  form.hidden ? "left-0.5 bg-red-400" : "left-6 bg-emerald-400"
                }`} />
              </button>
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
              {editingId && (
                <button onClick={handleCancelEdit} className="px-6 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] text-white text-sm font-bold hover:bg-[rgba(255,255,255,0.1)] transition-all">
                  Cancel
                </button>
              )}
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? "Save Changes" : "Add Project"}
              </button>
            </div>

          </div>
        )}
      </SectionCard>
    </div>
  );
}

function TeamProfilesTab({ showToast }) {
  const { teamProfiles = [], setTeamProfiles, add, remove, edit, projects = [], setProjects } = useData();

  const blank = {
    name: "",
    role: "",
    email: "",
    photo: "",
    github: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    website: "",
    bio: "",
    skills: "",
  };

  const [form, setForm] = useState(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignMember, setAssignMember] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Filter profiles based on search
  const filteredProfiles = teamProfiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.skills?.toLowerCase().includes(q)
    );
  });

  // Calculate project occurrences
  const getAssignedProjects = (name) => {
    if (!name) return [];
    const target = name.trim().toLowerCase();
    return projects.filter((proj) =>
      Array.isArray(proj.team) && proj.team.some((m) => m.name?.trim().toLowerCase() === target)
    );
  };

  const handleOpenAdd = () => {
    setForm(blank);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name || "",
      role: p.role || "",
      email: p.email || "",
      photo: p.photo || "",
      github: p.github || "",
      linkedin: p.linkedin || "",
      instagram: p.instagram || "",
      twitter: p.twitter || "",
      website: p.website || "",
      bio: p.bio || "",
      skills: p.skills || "",
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete profile for "${p.name}"?`)) return;
    try {
      await remove(teamProfiles, setTeamProfiles, p.id, "team-profiles");
      showToast("Team profile removed successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to remove profile", "error");
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.name.trim()) {
      showToast("Member Name is required!", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role ? form.role.trim() : "",
        email: form.email ? form.email.trim() : "",
        photo: form.photo ? form.photo.trim() : "",
        github: form.github ? form.github.trim() : "",
        linkedin: form.linkedin ? form.linkedin.trim() : "",
        instagram: form.instagram ? form.instagram.trim() : "",
        twitter: form.twitter ? form.twitter.trim() : "",
        website: form.website ? form.website.trim() : "",
        bio: form.bio ? form.bio.trim() : "",
        skills: form.skills ? form.skills.trim() : "",
      };

      if (editingId) {
        await edit(teamProfiles, setTeamProfiles, editingId, payload, "team-profiles");
        showToast(`Updated profile for ${payload.name}!`, "success");
      } else {
        await add(teamProfiles, setTeamProfiles, payload, "team-profiles");
        showToast(`Created profile for ${payload.name}!`, "success");
      }
      setForm(blank);
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick Assign member to a project
  const handleAssignToProject = async () => {
    if (!assignMember || !selectedProjectId) {
      showToast("Please select a project!", "error");
      return;
    }
    const targetProject = projects.find((p) => String(p.id) === String(selectedProjectId));
    if (!targetProject) return;

    const currentTeam = Array.isArray(targetProject.team) ? [...targetProject.team] : [];
    const isAlreadyMember = currentTeam.some(
      (m) => m.name?.trim().toLowerCase() === assignMember.name.trim().toLowerCase()
    );

    if (isAlreadyMember) {
      showToast(`${assignMember.name} is already a member of "${targetProject.title}"!`, "warning");
      return;
    }

    const updatedTeam = [
      ...currentTeam,
      {
        name: assignMember.name,
        role: assignMember.role || "",
        photo: assignMember.photo || "",
        github: assignMember.github || "",
        linkedin: assignMember.linkedin || "",
        instagram: assignMember.instagram || "",
        email: assignMember.email || "",
      },
    ];

    try {
      await edit(projects, setProjects, targetProject.id, { ...targetProject, team: updatedTeam }, "projects");
      showToast(`Added ${assignMember.name} to "${targetProject.title}"!`, "success");
      setAssignMember(null);
      setSelectedProjectId("");
    } catch (err) {
      console.error(err);
      showToast("Failed to assign member to project", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Overview Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-gradient-to-r from-[rgba(124,58,237,0.12)] via-[rgba(37,99,235,0.08)] to-[rgba(16,185,129,0.08)] p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#3B82F6] to-[#10B981] flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-space font-bold text-white">Team Profiles Directory</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(124,58,237,0.25)] text-[#C084FC] text-xs font-bold border border-[rgba(124,58,237,0.4)]">
                  {teamProfiles.length} {teamProfiles.length === 1 ? "Profile" : "Profiles"}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xl">
                Create reusable profiles with roles, avatars, and social links. You can attach any profile to your portfolio projects with a single click.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Profile</span>
          </button>
        </div>

        {/* Search Bar & Quick Stats */}
        <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, email, skill..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#94A3B8] w-full sm:w-auto justify-end">
            <span>Showing <strong className="text-white">{filteredProfiles.length}</strong> of {teamProfiles.length}</span>
          </div>
        </div>
      </div>

      {/* ── Profiles Grid ────────────────────────────────────────── */}
      {filteredProfiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#A855F7]" />
          </div>
          <h3 className="text-base font-space font-bold text-white mb-1">
            {search ? "No matching profiles found" : "No Team Profiles Created Yet"}
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-6">
            {search
              ? `No profile matches your search query "${search}". Try clearing the search or checking spelling.`
              : "Start by adding team members, collaborators, designers, or co-developers. Once added here, you can seamlessly attach them to any of your projects."}
          </p>
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.06)] text-white text-xs font-semibold hover:bg-[rgba(255,255,255,0.1)] transition-all"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-xs font-bold hover:opacity-90 shadow-lg shadow-purple-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add First Team Profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => {
            const assigned = getAssignedProjects(p.name);
            const skillsList = p.skills
              ? p.skills.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group flex flex-col justify-between rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(15,23,42,0.6)] hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(15,23,42,0.85)] p-5 backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/10"
              >
                <div>
                  {/* Top Bar: Avatar, Info, Actions */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {p.photo ? (
                        <div className="relative">
                          <img
                            src={p.photo}
                            alt={p.name}
                            className="w-13 h-13 rounded-2xl object-cover object-top border-2 border-[rgba(124,58,237,0.3)] group-hover:border-[#A855F7] transition-all shadow-md flex-shrink-0"
                            style={{ width: "52px", height: "52px" }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#0B0F19]" />
                        </div>
                      ) : (
                        <div
                          className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#3B82F6] to-[#10B981] flex items-center justify-center text-white font-space font-bold text-lg shadow-md flex-shrink-0"
                          style={{ width: "52px", height: "52px" }}
                        >
                          {p.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="font-space font-bold text-white text-base truncate group-hover:text-[#C084FC] transition-colors">
                          {p.name}
                        </h3>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] text-[#C084FC] text-[11px] font-semibold truncate max-w-[180px]">
                          {p.role || "Team Member"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-blue-400 hover:bg-[rgba(59,130,246,0.2)] hover:text-blue-300 transition-all"
                        title="Edit profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300 transition-all"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  {p.bio && (
                    <p className="text-xs text-[#94A3B8] italic line-clamp-2 mb-3 bg-[rgba(255,255,255,0.02)] p-2.5 rounded-xl border border-[rgba(255,255,255,0.04)]">
                      "{p.bio}"
                    </p>
                  )}

                  {/* Skills tags */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {skillsList.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[10px] text-[#94A3B8] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {skillsList.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] text-[#64748B]">
                          +{skillsList.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Social & Contact links */}
                  <div className="flex items-center gap-2 py-2.5 border-y border-[rgba(255,255,255,0.05)] text-[#64748B] flex-wrap">
                    {p.email && (
                      <a
                        href={`mailto:${p.email}`}
                        title={p.email}
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(56,189,248,0.15)] hover:text-[#38BDF8] transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        title="GitHub"
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.15)] hover:text-white transition-all"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.linkedin && (
                      <a
                        href={p.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn"
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(10,102,194,0.15)] hover:text-[#0A66C2] transition-all"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.instagram && (
                      <a
                        href={p.instagram}
                        target="_blank"
                        rel="noreferrer"
                        title="Instagram"
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(225,48,108,0.15)] hover:text-[#E1306C] transition-all"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.twitter && (
                      <a
                        href={p.twitter}
                        target="_blank"
                        rel="noreferrer"
                        title="X / Twitter"
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.15)] hover:text-white transition-all"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        title="Website / Portfolio"
                        className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(16,185,129,0.15)] hover:text-[#10B981] transition-all"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {!p.email && !p.github && !p.linkedin && !p.instagram && !p.twitter && !p.website && (
                      <span className="text-[11px] text-[#64748B] italic">No social links added</span>
                    )}
                  </div>
                </div>

                {/* Footer: Projects list & Quick Assign button */}
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                      {assigned.length > 0 ? `In ${assigned.length} Project${assigned.length > 1 ? "s" : ""}` : "Not in any project"}
                    </p>
                    {assigned.length > 0 ? (
                      <div className="flex gap-1 overflow-x-auto no-scrollbar mt-1">
                        {assigned.slice(0, 2).map((proj) => (
                          <span
                            key={proj.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[#10B981] font-medium truncate max-w-[120px]"
                            title={proj.title}
                          >
                            {proj.title}
                          </span>
                        ))}
                        {assigned.length > 2 && (
                          <span className="text-[10px] px-1 py-0.5 text-[#64748B]">+{assigned.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#475569] italic">Ready to assign</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setAssignMember(p);
                      setSelectedProjectId("");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[rgba(124,58,237,0.15)] hover:bg-[rgba(124,58,237,0.25)] border border-[rgba(124,58,237,0.3)] text-[#C084FC] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0"
                    title="Add to a project"
                  >
                    <FolderGit2 className="w-3 h-3" />
                    <span>Assign</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Add / Edit Team Profile ───────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0B0F19] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              data-lenis-prevent="true"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.07)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                    {editingId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-space font-bold text-white text-lg">
                      {editingId ? `Edit Profile: ${form.name}` : "Create New Team Profile"}
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Save team member information for reuse across projects.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSave} className="space-y-5">
                {/* Avatar Preview & URL */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] space-y-3">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
                    Profile Picture / Avatar
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {form.photo ? (
                      <div className="relative group">
                        <img
                          src={form.photo}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-[#7C3AED] shadow-lg flex-shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, photo: "" }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove picture"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/30 to-[#2563EB]/30 border border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center text-white/50 text-2xl font-bold flex-shrink-0">
                        {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}

                    <div className="flex-1 w-full flex gap-2 items-center">
                      <input
                        type="text"
                        name="photo"
                        value={form.photo}
                        onChange={onChange}
                        placeholder="Image URL (Cloudinary or direct web link)"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-[#7C3AED]"
                      />
                      <CloudinaryUpload onUpload={(url) => setForm((f) => ({ ...f, photo: url }))} />
                    </div>
                  </div>
                </div>

                {/* Primary Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name *"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="e.g. Ankit Das"
                  />
                  <Field
                    label="Role / Designation *"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    placeholder="e.g. Lead Full Stack Developer"
                  />
                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="e.g. ankit@ankit.dev"
                  />
                  <Field
                    label="Portfolio / Website URL"
                    name="website"
                    value={form.website}
                    onChange={onChange}
                    placeholder="https://..."
                  />
                </div>

                {/* Social Profiles */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] space-y-4">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
                    Social & Platform Links
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="GitHub Profile URL"
                      name="github"
                      value={form.github}
                      onChange={onChange}
                      placeholder="https://github.com/username"
                    />
                    <Field
                      label="LinkedIn Profile URL"
                      name="linkedin"
                      value={form.linkedin}
                      onChange={onChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                    <Field
                      label="Instagram URL"
                      name="instagram"
                      value={form.instagram}
                      onChange={onChange}
                      placeholder="https://instagram.com/username"
                    />
                    <Field
                      label="Twitter / X URL"
                      name="twitter"
                      value={form.twitter}
                      onChange={onChange}
                      placeholder="https://x.com/username"
                    />
                  </div>
                </div>

                {/* Skills & Bio */}
                <div className="space-y-4">
                  <Field
                    label="Skills & Technologies"
                    name="skills"
                    value={form.skills}
                    onChange={onChange}
                    placeholder="e.g. React, Node.js, Next.js, MySQL, Tailwind CSS (comma separated)"
                  />
                  <Field
                    label="Short Bio / Note"
                    name="bio"
                    value={form.bio}
                    onChange={onChange}
                    type="textarea"
                    placeholder="Brief background or contribution description..."
                    rows={3}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.07)]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingId ? "Update Profile" : "Save Profile"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Quick Assign to Project ────────────────────────── */}
      <AnimatePresence>
        {assignMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.07)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-[#10B981]">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-space font-bold text-white text-sm">Assign to Project</h3>
                    <p className="text-xs text-[#94A3B8]">Adding {assignMember.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignMember(null)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Select Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="" disabled className="bg-[#0f172a] text-[#94A3B8]">
                    Choose a project...
                  </option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="bg-[#0f172a] text-white">
                      {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                <button
                  type="button"
                  onClick={() => setAssignMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignToProject}
                  disabled={!selectedProjectId}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryTab({ showToast }) {
  const { gallery, setGallery, add, remove, edit } = useData();

  // Navigation state
  const [activeFolderId, setActiveFolderId] = useState(null);

  // Form states
  const blankFolder = { title: "", color: "#2563EB", hidden: false, coverImage: "" };
  const [folderForm, setFolderForm] = useState(blankFolder);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [openFolderForm, setOpenFolderForm] = useState(false);

  const blankImage = { title: "", image: "", hidden: false };
  const [imageForm, setImageForm] = useState(blankImage);
  const [editingImageId, setEditingImageId] = useState(null);
  const [openImageForm, setOpenImageForm] = useState(false);

  // -- FOLDER ACTIONS --
  const handleFolderChange = (e) => setFolderForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleToggleFolderVisibility = (folder) => {
    const updated = { ...folder, hidden: !folder.hidden };
    edit(gallery, setGallery, folder.id, updated);
    showToast(updated.hidden ? "Folder hidden." : "Folder is visible!", updated.hidden ? "warning" : "success");
  };
  const handleSaveFolder = () => {
    if (!folderForm.title.trim()) return;
    if (editingFolderId) {
      edit(gallery, setGallery, editingFolderId, folderForm);
      showToast("Folder updated!", "success");
    } else {
      add(gallery, setGallery, { ...folderForm, images: [] });
      showToast("Folder added!", "success");
    }
    setFolderForm(blankFolder); setEditingFolderId(null); setOpenFolderForm(false);
  };
  const handleEditFolder = (f) => {
    setFolderForm({ title: f.title, color: f.color || "#2563EB", hidden: f.hidden || false, coverImage: f.coverImage || "" });
    setEditingFolderId(f.id);
    setOpenFolderForm(true);
  };

  // -- IMAGE ACTIONS --
  const activeFolder = gallery.find(f => f.id === activeFolderId);
  const handleImageChange = (e) => setImageForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const updateFolderImages = (newImages, msg, type="success") => {
    const updatedFolder = { ...activeFolder, images: newImages };
    edit(gallery, setGallery, activeFolderId, updatedFolder);
    if (msg) showToast(msg, type);
  };

  const handleToggleImageVisibility = (img) => {
    const newImages = activeFolder.images.map(i => i.id === img.id ? { ...i, hidden: !i.hidden } : i);
    updateFolderImages(newImages, !img.hidden ? "Image hidden." : "Image visible!", !img.hidden ? "warning" : "success");
  };

  const handleMoveImage = (index, direction) => {
    const newImages = [...activeFolder.images];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      updateFolderImages(newImages, "Image moved up!", "success");
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      updateFolderImages(newImages, "Image moved down!", "success");
    }
  };

  const handleBulkUpload = (uploads) => {
    if (!uploads || uploads.length === 0) return;
    let currentImages = activeFolder.images || [];
    let startId = currentImages.length ? Math.max(...currentImages.map(i => i.id)) + 1 : 1;
    
    const newImages = uploads.map((u, i) => ({
      id: startId + i,
      title: u.name ? u.name.split('.')[0] : `Image ${startId + i}`,
      image: u.url,
      hidden: false
    }));
    
    updateFolderImages([...currentImages, ...newImages], `${uploads.length} images added!`, "success");
  };

  const handleSaveImage = () => {
    if (!imageForm.title.trim() || !imageForm.image.trim()) return;
    if (editingImageId) {
      const newImages = activeFolder.images.map(i => i.id === editingImageId ? { ...i, ...imageForm } : i);
      updateFolderImages(newImages, "Image updated!", "success");
    } else {
      const newId = activeFolder.images?.length ? Math.max(...activeFolder.images.map(i => i.id)) + 1 : 1;
      const newImages = [...(activeFolder.images || []), { ...imageForm, id: newId }];
      updateFolderImages(newImages, "Image added!", "success");
    }
    setImageForm(blankImage); setEditingImageId(null); setOpenImageForm(false);
  };

  const handleEditImage = (img) => {
    setImageForm({ title: img.title, image: img.image, hidden: img.hidden || false });
    setEditingImageId(img.id);
    setOpenImageForm(true);
  };

  const handleDeleteImage = (id) => {
    const newImages = activeFolder.images.filter(i => i.id !== id);
    updateFolderImages(newImages, "Image removed!", "error");
  };

  // -- VIEWS --
  if (activeFolderId && activeFolder) {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveFolderId(null)} className="flex items-center gap-2 text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Folders
        </button>

        <SectionCard title={`Images in "${activeFolder.title}" (${activeFolder.images?.length || 0})`} color={activeFolder.color}>
          <div className="flex justify-end mb-4">
            <CloudinaryUpload label="Bulk Upload Images" multiple={true} onUpload={handleBulkUpload} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeFolder.images?.map((img, index) => (
              <div key={img.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${img.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
                <div className="flex flex-col gap-1 items-center justify-center">
                  <button onClick={() => handleMoveImage(index, 'up')} disabled={index === 0} className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${index === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white"}`}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleMoveImage(index, 'down')} disabled={index === activeFolder.images.length - 1} className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${index === activeFolder.images.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white"}`}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.05)] flex-shrink-0">
                  <img src={img.image} alt={img.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{img.title}</p>
                    {img.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <VisibilityBtn hidden={img.hidden} onClick={() => handleToggleImageVisibility(img)} />
                  <EditBtn onClick={() => handleEditImage(img)} />
                  <DeleteBtn onClick={() => handleDeleteImage(img.id)} />
                </div>
              </div>
            ))}
            {(!activeFolder.images || activeFolder.images.length === 0) && <p className="col-span-2 text-center text-[#475569] text-sm py-6">No images in this folder.</p>}
          </div>
        </SectionCard>

        <SectionCard title={editingImageId ? "Edit Image" : "Add Image"} color="#F59E0B">
          <button onClick={() => { setOpenImageForm(o => !o); if(editingImageId){ setEditingImageId(null); setImageForm(blankImage); } }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
            {openImageForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {openImageForm ? "Cancel" : "Add image"}
          </button>
          {openImageForm && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Title *" name="title" value={imageForm.title} onChange={handleImageChange} placeholder="Winning moment" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Image *</label>
                <div className="flex items-center gap-2">
                  <input type="text" name="image" value={imageForm.image} onChange={handleImageChange} placeholder="/src/assets/..." className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all" />
                  <CloudinaryUpload onUpload={(url) => setImageForm(f => ({ ...f, image: url }))} />
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div><p className="text-sm font-semibold text-white">Hide Image</p></div>
                <button type="button" onClick={() => setImageForm(f => ({ ...f, hidden: !f.hidden }))} className={`relative w-12 h-6 rounded-full transition-all border ${imageForm.hidden ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]" : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-${imageForm.hidden ? "red" : "emerald"}-400 shadow-md ${imageForm.hidden ? "left-0.5" : "left-6"}`} />
                </button>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button onClick={handleSaveImage} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white text-sm font-bold hover:opacity-90">
                  <Save className="w-4 h-4" /> {editingImageId ? "Save Image" : "Add Image"}
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard title={`Gallery Folders (${gallery.length})`} color="#EC4899">
        <div className="space-y-3">
          {gallery.map((g) => (
            <div key={g.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${g.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex items-center gap-3 min-w-0">
                {g.coverImage ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.1)]">
                    <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${g.color || "#EC4899"}20`, color: g.color || "#EC4899" }}>
                    <Folder className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{g.title}</p>
                    {g.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                  <p className="text-xs text-[#64748B]">{g.images?.length || 0} images</p>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <button onClick={() => setActiveFolderId(g.id)} className="px-3 py-1.5 rounded-lg bg-[rgba(168,85,247,0.1)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.2)] text-xs font-bold transition-colors">
                  Manage Images
                </button>
                <VisibilityBtn hidden={g.hidden} onClick={() => handleToggleFolderVisibility(g)} />
                <EditBtn onClick={() => handleEditFolder(g)} />
                <DeleteBtn onClick={() => { remove(gallery, setGallery, g.id); showToast("Folder removed!", "error"); }} />
              </div>
            </div>
          ))}
          {gallery.length === 0 && <p className="text-center text-[#475569] text-sm py-6">No folders yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title={editingFolderId ? "Edit Folder" : "Add Folder"} color="#F59E0B">
        <button onClick={() => { setOpenFolderForm(o => !o); if(editingFolderId){ setEditingFolderId(null); setFolderForm(blankFolder); } }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
          {openFolderForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {openFolderForm ? "Cancel" : "Add folder"}
        </button>
        {openFolderForm && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Folder Name *" name="title" value={folderForm.title} onChange={handleFolderChange} placeholder="Hackathons" />
            <Field label="Folder Color" name="color" value={folderForm.color} onChange={handleFolderChange} type="color" />
            
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Cover Image (Optional)</label>
              <div className="flex items-center gap-2">
                <input type="text" name="coverImage" value={folderForm.coverImage} onChange={handleFolderChange} placeholder="/src/assets/... (Optional)" className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all" />
                <CloudinaryUpload onUpload={(url) => setFolderForm(f => ({ ...f, coverImage: url }))} />
              </div>
            </div>
            
            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div><p className="text-sm font-semibold text-white">Hide Folder</p><p className="text-xs text-[#64748B] mt-0.5">Hides folder and all its images</p></div>
              <button type="button" onClick={() => setFolderForm(f => ({ ...f, hidden: !f.hidden }))} className={`relative w-12 h-6 rounded-full transition-all border ${folderForm.hidden ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]" : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-${folderForm.hidden ? "red" : "emerald"}-400 shadow-md ${folderForm.hidden ? "left-0.5" : "left-6"}`} />
              </button>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button onClick={handleSaveFolder} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> {editingFolderId ? "Save Folder" : "Add Folder"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function CertificatesTab({ showToast }) {
  const { certificates, setCertificates, add, remove, edit } = useData();
  const blank = { 
    title: "", 
    organization: "", 
    date: "", 
    color: "#10B981", 
    category: "Programming", 
    link: "", 
    image: "", 
    images: [], 
    pdf_url: "", 
    cert_order: 1, 
    hidden: false, 
    hours: "" 
  };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [customMediaUrl, setCustomMediaUrl] = useState("");

  // Helper to convert any URL (including Cloudinary PDF) to an image preview
  const getCertPreview = (url) => {
    if (!url || typeof url !== "string") return "";
    const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf?");
    if (isPdf && url.includes("cloudinary.com")) {
      let preview = url.replace(/\.pdf($|\?.*)/i, ".jpg$1");
      if (!preview.includes("pg_1") && preview.includes("/upload/")) {
        preview = preview.replace("/upload/", "/upload/pg_1,f_auto,q_auto/");
      }
      return preview;
    }
    return url;
  };

  // Sort certificates strictly by cert_order
  const sortedCertificates = [...certificates].sort((a, b) => {
    const orderA = a.cert_order !== undefined && a.cert_order !== null ? Number(a.cert_order) : 9999;
    const orderB = b.cert_order !== undefined && b.cert_order !== null ? Number(b.cert_order) : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Reordering: Move Up or Down
  const moveCertificateOrder = async (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sortedCertificates.length - 1) return;

    const items = [...sortedCertificates];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    const temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;

    // Reassign continuous order 1..N
    const updated = items.map((c, i) => ({
      ...c,
      cert_order: i + 1
    }));

    setCertificates(updated);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated.map(c => ({ id: c.id, cert_order: c.cert_order })) })
      });
      if (res.ok) {
        showToast("Certificate order updated!", "success");
      } else {
        showToast("Failed to save order", "error");
      }
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  // Reordering: Set position directly by typing number
  const handleSetCertificateOrder = async (fromIndex, targetOrder) => {
    const target = parseInt(targetOrder, 10);
    if (isNaN(target)) return;
    const clamped = Math.max(1, Math.min(sortedCertificates.length, target));
    const toIndex = clamped - 1;
    if (fromIndex === toIndex) return;

    const items = [...sortedCertificates];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    const updated = items.map((c, i) => ({
      ...c,
      cert_order: i + 1
    }));

    setCertificates(updated);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated.map(c => ({ id: c.id, cert_order: c.cert_order })) })
      });
      if (res.ok) {
        showToast(`Moved "${moved.title}" to position #${clamped}!`, "success");
      } else {
        showToast("Failed to save order", "error");
      }
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  const handleToggleVisibility = (cert) => {
    const updated = { ...cert, hidden: !cert.hidden };
    edit(certificates, setCertificates, cert.id, updated);
    showToast(updated.hidden ? "Certificate hidden." : "Certificate is visible!", updated.hidden ? "warning" : "success");
  };

  // Multiple media upload & management
  const handleMediaUpload = (uploaded) => {
    if (!uploaded) return;
    const newItems = Array.isArray(uploaded) ? uploaded : [{ url: uploaded, name: "" }];
    
    setForm((prev) => {
      let currentImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
      let updatedPdfUrl = prev.pdf_url;

      newItems.forEach((item) => {
        const itemUrl = typeof item === "string" ? item : item.url;
        const itemName = typeof item === "object" ? item.name || "" : "";
        const isPdf = itemUrl.toLowerCase().endsWith(".pdf") || itemName.toLowerCase().endsWith(".pdf") || itemUrl.toLowerCase().includes(".pdf?");

        if (isPdf) {
          if (!updatedPdfUrl) updatedPdfUrl = itemUrl;
          const previewImg = getCertPreview(itemUrl);
          if (!currentImages.includes(previewImg)) {
            currentImages.push(previewImg);
          }
        } else {
          if (!currentImages.includes(itemUrl)) {
            currentImages.push(itemUrl);
          }
        }
      });

      const primaryCover = currentImages[0] || prev.image || "";
      return {
        ...prev,
        images: currentImages,
        image: primaryCover,
        pdf_url: updatedPdfUrl
      };
    });
    showToast("Media uploaded and preview generated!", "success");
  };

  const handleAddMediaUrl = () => {
    const url = customMediaUrl.trim();
    if (!url) return;
    const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf?");
    const previewUrl = getCertPreview(url);

    setForm((prev) => {
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : (prev.image ? [prev.image] : []);
      if (!currentImages.includes(previewUrl)) {
        currentImages.push(previewUrl);
      }
      return {
        ...prev,
        images: currentImages,
        image: currentImages[0] || prev.image,
        pdf_url: isPdf && !prev.pdf_url ? url : prev.pdf_url
      };
    });
    setCustomMediaUrl("");
    showToast(isPdf ? "PDF added and preview generated!" : "Image added!", "success");
  };

  const handleRemoveMedia = (indexToRemove) => {
    setForm((prev) => {
      const filtered = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: filtered,
        image: filtered[0] || ""
      };
    });
  };

  const handleMakeCover = (index) => {
    setForm((prev) => {
      const images = [...(prev.images || [])];
      if (index === 0 || index >= images.length) return prev;
      const [item] = images.splice(index, 1);
      images.unshift(item);
      return {
        ...prev,
        images,
        image: images[0]
      };
    });
    showToast("Cover image set!", "success");
  };

  const handleMoveMedia = (fromIdx, direction) => {
    setForm((prev) => {
      const images = [...(prev.images || [])];
      const toIdx = direction === "left" ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= images.length) return prev;
      const temp = images[fromIdx];
      images[fromIdx] = images[toIdx];
      images[toIdx] = temp;
      return {
        ...prev,
        images,
        image: images[0]
      };
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      showToast("Title is required", "warning");
      return;
    }
    const imagesArray = Array.isArray(form.images) && form.images.length > 0 
      ? form.images 
      : (form.image ? [form.image] : []);
    const primaryImage = form.image || imagesArray[0] || (form.pdf_url ? getCertPreview(form.pdf_url) : "");

    const processedForm = {
      ...form,
      color: typeof form.color === "string" ? form.color : (form.color?.target?.value || "#10B981"),
      image: primaryImage,
      images: imagesArray,
      cert_order: Number(form.cert_order) || (editingId ? form.cert_order : certificates.length + 1),
      category: typeof form.category === "string" ? form.category.split(',').map(c => c.trim()).filter(Boolean) : form.category
    };

    if (editingId) {
      edit(certificates, setCertificates, editingId, processedForm);
      showToast("Certificate updated successfully!", "success");
    } else {
      add(certificates, setCertificates, processedForm);
      showToast("Certificate added to Home Page!", "success");
    }
    setForm(blank); 
    setEditingId(null); 
    setOpen(false);
  };

  const handleEdit = (c) => {
    const rawImages = Array.isArray(c.images) && c.images.length > 0 
      ? c.images 
      : (c.image ? [c.image] : []);
    
    setForm({ 
      title: c.title || "", 
      organization: c.organization || "", 
      date: c.date || "", 
      color: typeof c.color === "string" ? c.color : (c.color?.target?.value || "#10B981"), 
      category: Array.isArray(c.category) ? c.category.join(", ") : (c.category || ""), 
      link: c.link || "", 
      image: c.image || rawImages[0] || "", 
      images: rawImages,
      pdf_url: c.pdf_url || (typeof c.image === "string" && c.image.toLowerCase().endsWith(".pdf") ? c.image : ""),
      cert_order: c.cert_order !== undefined ? c.cert_order : (sortedCertificates.findIndex(x => x.id === c.id) + 1),
      hidden: c.hidden || false, 
      hours: c.hours || "" 
    });
    setEditingId(c.id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Instructions */}
      <SectionCard title={`Certificates (${certificates.length})`} color="#10B981">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Home Page Order:</span> Use the <span className="font-mono font-bold text-white"># Number</span> or <span className="font-mono font-bold text-white">▲ / ▼ Arrows</span> to choose which certificate appears 1st, 2nd, 3rd, etc.
          </div>
          <button
            onClick={() => {
              setOpen(true);
              setEditingId(null);
              setForm({ ...blank, cert_order: certificates.length + 1 });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-md ml-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certificate
          </button>
        </div>

        {/* Certificate List with Order Controls */}
        <div className="space-y-3">
          {sortedCertificates.map((c, i) => {
            const previewUrl = getCertPreview(c.image || (c.images && c.images[0]) || c.pdf_url);
            const isPdf = Boolean(c.pdf_url) || (typeof c.image === "string" && c.image.toLowerCase().endsWith(".pdf"));
            const imageCount = Array.isArray(c.images) && c.images.length > 0 ? c.images.length : (c.image ? 1 : 0);

            return (
              <div 
                key={c.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  c.hidden 
                    ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" 
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Up / Down Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 items-center justify-center shrink-0">
                    <button 
                      onClick={() => moveCertificateOrder(i, 'up')} 
                      disabled={i === 0} 
                      title="Move Up (Show earlier on Home)" 
                      className="text-[#64748B] hover:text-emerald-400 disabled:opacity-20 p-1 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => moveCertificateOrder(i, 'down')} 
                      disabled={i === sortedCertificates.length - 1} 
                      title="Move Down (Show later on Home)" 
                      className="text-[#64748B] hover:text-emerald-400 disabled:opacity-20 p-1 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Position Badge / Direct Number Input */}
                  <div className="relative flex items-center shrink-0 group/num" title="Type a number to change display position (1 = 1st)">
                    <span className="absolute left-2 text-[11px] font-bold text-emerald-400 pointer-events-none select-none">#</span>
                    <input
                      type="number"
                      min="1"
                      max={sortedCertificates.length}
                      defaultValue={i + 1}
                      key={`cert-order-${c.id}-${i + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val !== i + 1) {
                          handleSetCertificateOrder(i, val);
                        } else {
                          e.target.value = i + 1;
                        }
                      }}
                      className="w-12 h-8 pl-4 pr-1 text-center rounded-lg bg-[rgba(16,185,129,0.12)] hover:bg-[rgba(16,185,129,0.2)] focus:bg-[rgba(16,185,129,0.3)] border border-[rgba(16,185,129,0.3)] focus:border-emerald-400 text-emerald-400 focus:text-white font-mono font-bold text-xs outline-none transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)] focus:ring-1 focus:ring-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                    />
                  </div>

                  {/* Visual Image / PDF Thumbnail Preview */}
                  {previewUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.12)] bg-[#02050D] shadow-inner group/thumb">
                      <img 
                        src={previewUrl} 
                        alt={c.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {isPdf && (
                        <span className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[8px] font-bold text-center py-0.5 tracking-wider uppercase">
                          PDF
                        </span>
                      )}
                      {imageCount > 1 && !isPdf && (
                        <span className="absolute top-0.5 right-0.5 bg-black/80 text-white text-[8px] font-bold px-1 rounded">
                          +{imageCount}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(255,255,255,0.1)]" style={{ background: `${c.color || '#10B981'}20` }}>
                      <Award className="w-5 h-5" style={{ color: c.color || '#10B981' }} />
                    </div>
                  )}

                  {/* Title & Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                      
                      {/* Order indicator */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-emerald-400 font-mono font-bold border border-[rgba(16,185,129,0.25)]">
                        {i === 0 ? "1st on Home" : i === 1 ? "2nd on Home" : i === 2 ? "3rd on Home" : `#${i + 1} on Home`}
                      </span>

                      {/* PDF / Multi-image badges */}
                      {isPdf && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400 font-bold border border-[rgba(239,68,68,0.3)] flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5" /> PDF Document
                        </span>
                      )}

                      {imageCount > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.15)] text-purple-400 font-bold border border-[rgba(168,85,247,0.3)] flex items-center gap-1">
                          <Image className="w-2.5 h-2.5" /> {imageCount} Photos
                        </span>
                      )}

                      {c.hidden && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold border border-[rgba(245,158,11,0.3)]">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {c.organization} · {c.date} {c.hours ? `· ${c.hours} hrs` : ""}
                    </p>
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex gap-2 items-center flex-wrap self-end sm:self-center">
                  {c.link && (
                    <a 
                      href={c.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white transition-colors"
                      title="Open Certificate Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <VisibilityBtn hidden={c.hidden} onClick={() => handleToggleVisibility(c)} />
                  <EditBtn onClick={() => handleEdit(c)} />
                  <DeleteBtn onClick={() => { remove(certificates, setCertificates, c.id); showToast("Certificate removed!", "error"); }} />
                </div>
              </div>
            );
          })}
          {certificates.length === 0 && (
            <p className="text-center text-[#475569] text-sm py-8">No certificates added yet.</p>
          )}
        </div>
      </SectionCard>

      {/* Add / Edit Form Modal Card */}
      <SectionCard title={editingId ? "Edit Certificate" : "Add Certificate"} color="#06B6D4">
        <button 
          onClick={() => { 
            setOpen(o => !o); 
            if (editingId) { 
              setEditingId(null); 
              setForm(blank); 
            } 
          }} 
          className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4 hover:opacity-80 transition-opacity"
        >
          {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {open ? "Close Form" : "Add New Certificate"}
        </button>

        {open && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Certificate Title *" name="title" value={form.title} onChange={onChange} placeholder="Full Stack Web Development Professional Certificate" />
              </div>
              <Field label="Issuing Organization" name="organization" value={form.organization} onChange={onChange} placeholder="Coursera, freeCodeCamp, Udemy, University" />
              <Field label="Issue Date / Duration" name="date" value={form.date} onChange={onChange} placeholder="2026 or Jan 2026" />
              <Field label="Category (comma-separated)" name="category" value={form.category} onChange={onChange} placeholder="Programming, Full Stack, AI" />
              
              {/* Home Display Position */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Home Page Display Order (1st, 2nd...)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-[rgba(16,185,129,0.1)] px-3 py-3 rounded-xl border border-[rgba(16,185,129,0.2)]">
                    Position #{form.cert_order || 1}
                  </span>
                  <input
                    type="number"
                    min="1"
                    name="cert_order"
                    value={form.cert_order || ""}
                    onChange={onChange}
                    placeholder="1"
                    className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
              </div>

              {/* Learning Hours */}
              <Field label="Learning Hours (Optional)" name="hours" value={form.hours || ""} onChange={onChange} type="number" placeholder="50" />

              {/* Accent Color Picker */}
              <div className="sm:col-span-2">
                <ColorPickerControl
                  label="Certificate Card Accent Color"
                  name="color"
                  value={typeof form.color === "string" ? form.color : (form.color?.target?.value || "#10B981")}
                  onChange={(val) => {
                    const hex = typeof val === "string" ? val : (val?.target?.value || "#10B981");
                    setForm(f => ({ ...f, color: hex }));
                  }}
                  presets={["#10B981", "#06B6D4", "#7C3AED", "#2563EB", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6"]}
                />
              </div>

              {/* Public Verification / Credential URL */}
              <div className="sm:col-span-2">
                <Field label="Credential URL / Verification Link" name="link" value={form.link} onChange={onChange} placeholder="https://coursera.org/verify/... or https://freecodecamp.org/..." />
              </div>
            </div>

            {/* ─── Media Manager: Multiple Images & PDF Support ─── */}
            <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-400" />
                    Certificate Media: Multiple Images & PDF Document
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Upload multiple images or attach any PDF. PDFs automatically generate a high-res image preview for the homepage!
                  </p>
                </div>

                {/* Bulk Uploader (Images + PDFs) */}
                <div className="flex items-center gap-2 shrink-0">
                  <CloudinaryUpload
                    label="Upload Images or PDF"
                    multiple={true}
                    onUpload={handleMediaUpload}
                  />
                </div>
              </div>

              {/* Manual URL Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Paste direct Image URL or PDF URL..."
                  value={customMediaUrl}
                  onChange={(e) => setCustomMediaUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] text-xs focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleAddMediaUrl}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add URL
                </button>
              </div>

              {/* Dedicated PDF Document Field */}
              <div className="p-3.5 rounded-xl bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.15)] space-y-2">
                <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Original PDF Document (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    name="pdf_url"
                    value={form.pdf_url || ""}
                    onChange={onChange}
                    placeholder="https://.../certificate.pdf (Uploaded PDF or Google Drive PDF link)"
                    className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] text-xs focus:outline-none focus:border-red-400"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <CloudinaryUpload
                      label="Upload PDF"
                      multiple={false}
                      onUpload={(url) => {
                        const preview = getCertPreview(url);
                        setForm(f => {
                          const currentImgs = Array.isArray(f.images) ? [...f.images] : (f.image ? [f.image] : []);
                          if (!currentImgs.includes(preview)) currentImgs.unshift(preview);
                          return {
                            ...f,
                            pdf_url: url,
                            image: preview,
                            images: currentImgs
                          };
                        });
                        showToast("PDF attached and image preview generated!", "success");
                      }}
                    />
                    {form.pdf_url && (
                      <a
                        href={form.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-red-500/20 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Attached Media Gallery / List */}
              {Array.isArray(form.images) && form.images.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
                    Attached Media Gallery ({form.images.length} items) - Top item is Cover
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {form.images.map((imgUrl, idx) => {
                      const isCover = idx === 0;
                      const isPdf = imgUrl.toLowerCase().includes(".pdf") || (form.pdf_url && imgUrl === getCertPreview(form.pdf_url));
                      
                      return (
                        <div 
                          key={idx} 
                          className={`relative rounded-xl overflow-hidden border transition-all flex flex-col group ${
                            isCover 
                              ? "border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] bg-emerald-500/10" 
                              : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]"
                          }`}
                        >
                          {/* Image preview */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                            <img 
                              src={imgUrl} 
                              alt={`Certificate media ${idx + 1}`} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {/* Badges */}
                            <div className="absolute top-1 left-1 flex flex-col gap-1">
                              {isCover && (
                                <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  ★ COVER
                                </span>
                              )}
                              {isPdf && (
                                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                  PDF
                                </span>
                              )}
                            </div>
                            <span className="absolute top-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Quick controls */}
                          <div className="flex items-center justify-between p-1 bg-black/80 gap-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleMakeCover(idx)}
                                title="Make this the Cover image"
                                className="text-[10px] text-emerald-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-emerald-500/20 font-semibold transition-colors"
                              >
                                Set Cover
                              </button>
                            )}
                            <div className="flex items-center gap-0.5 ml-auto">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveMedia(idx, "left")}
                                  title="Move Left"
                                  className="p-1 text-[#94A3B8] hover:text-white"
                                >
                                  ◀
                                </button>
                              )}
                              {idx < form.images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveMedia(idx, "right")}
                                  title="Move Right"
                                  className="p-1 text-[#94A3B8] hover:text-white"
                                >
                                  ▶
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMedia(idx)}
                                title="Remove Image"
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="text-sm font-semibold text-white">Hide Certificate</p>
                <p className="text-xs text-[#64748B] mt-0.5">Hides this certificate from the public site</p>
              </div>
              <button 
                type="button" 
                onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))} 
                className={`relative w-12 h-6 rounded-full transition-all border ${
                  form.hidden ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]" : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-${form.hidden ? "red" : "emerald"}-400 shadow-md ${form.hidden ? "left-0.5" : "left-6"}`} />
              </button>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => { setOpen(false); setEditingId(null); setForm(blank); }}
                className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" /> {editingId ? "Save Changes" : "Publish Certificate"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function TestimonialsTab({ showToast }) {
  const { testimonials, setTestimonials, add, remove, edit } = useData();
  const blank = { quote: "", name: "", role: "", avatar: "", avatarColor: "from-[#2563EB] to-[#7C3AED]", stars: 5, platform: "Direct", relation: "", date: "", verified: false, hidden: false };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.quote.trim() || !form.name.trim()) return;
    const data = { ...form, stars: Number(form.stars) };
    if (editingId) {
      edit(testimonials, setTestimonials, editingId, data);
      showToast("Testimonial updated!", "success");
    } else {
      add(testimonials, setTestimonials, data);
      showToast("Testimonial added!", "success");
    }
    setForm(blank); setOpen(false); setEditingId(null);
  };

  const handleEdit = (t) => {
    setForm({ ...blank, ...t });
    setEditingId(t.id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleVerified = (t) => {
    edit(testimonials, setTestimonials, t.id, { ...t, verified: !t.verified });
    showToast(t.verified ? "Marked as unverified" : "Marked as verified ✓", "success");
  };

  const handleToggleHidden = (t) => {
    edit(testimonials, setTestimonials, t.id, { ...t, hidden: !t.hidden });
    showToast(t.hidden ? "Testimonial is now visible!" : "Testimonial hidden from public.", t.hidden ? "success" : "warning");
  };

  const verifiedCount = testimonials.filter(t => t.verified && !t.hidden).length;
  const hiddenCount = testimonials.filter(t => t.hidden).length;

  return (
    <div className="space-y-6">
      <SectionCard title={`Testimonials (${testimonials.length})`} color="#F59E0B">
        <div className="flex gap-4 mb-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-emerald-400 font-semibold">{verifiedCount} verified & visible</span>
          <span className="px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-amber-400 font-semibold">{hiddenCount} hidden</span>
        </div>
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className={`p-4 rounded-xl border transition-all ${t.hidden ? 'bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.1)] opacity-70' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{t.name} <span className="text-[#64748B] font-normal">— {t.role}</span></p>
                    {t.verified && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.15)] text-blue-400 font-bold border border-[rgba(37,99,235,0.2)]">
                        ✓ Verified
                      </span>
                    )}
                    {t.hidden && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>
                    )}
                    {!t.verified && !t.hidden && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(100,116,139,0.15)] text-[#94A3B8] font-bold">Not Shown</span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 italic">"{t.quote}"</p>
                  <div className="flex gap-2 mt-1 text-[10px] text-[#475569]">
                    <span>{t.platform}</span>
                    {t.relation && <span>· {t.relation}</span>}
                    {t.date && <span>· {t.date}</span>}
                    <span>· ⭐ {t.stars}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Verify / Unverify */}
                  <button
                    onClick={() => handleToggleVerified(t)}
                    title={t.verified ? "Remove verification" : "Mark as verified (shows on frontpage)"}
                    className={`p-2 rounded-lg transition-all border text-xs font-bold ${t.verified ? 'bg-[rgba(37,99,235,0.15)] border-[rgba(37,99,235,0.3)] text-blue-400 hover:bg-[rgba(37,99,235,0.25)]' : 'bg-[rgba(100,116,139,0.1)] border-[rgba(100,116,139,0.2)] text-[#64748B] hover:text-blue-400 hover:border-[rgba(37,99,235,0.3)]'}`}
                  >
                    {t.verified ? '✓' : '?'}
                  </button>
                  <VisibilityBtn hidden={t.hidden} onClick={() => handleToggleHidden(t)} />
                  <EditBtn onClick={() => handleEdit(t)} />
                  <DeleteBtn onClick={() => { remove(testimonials, setTestimonials, t.id); showToast("Testimonial removed!", "error"); }} />
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-center text-[#475569] text-sm py-6">No testimonials yet.</p>}
        </div>
        <p className="text-xs text-[#475569] mt-4">
          💡 Only <span className="text-blue-400 font-semibold">Verified</span> and <span className="text-emerald-400 font-semibold">Visible</span> testimonials will appear on the frontpage.
        </p>
      </SectionCard>

      <SectionCard title={editingId ? "Edit Testimonial" : "Add Testimonial"} color="#A855F7">
        <button onClick={() => { if (open && editingId) { setOpen(false); setForm(blank); setEditingId(null); } else setOpen(o => !o); }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
          <Plus className="w-4 h-4" /> {open ? "Collapse form" : (editingId ? "Edit testimonial" : "Add testimonial")}
        </button>
        {open && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Quote *" name="quote" value={form.quote} onChange={onChange} type="textarea" placeholder="What they said about you..." rows={4} />
            </div>
            <Field label="Name *" name="name" value={form.name} onChange={onChange} placeholder="John Doe" />
            <Field label="Role" name="role" value={form.role} onChange={onChange} placeholder="Business Owner" />
            <Field label="Avatar (initials)" name="avatar" value={form.avatar} onChange={onChange} placeholder="JD" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Stars (1–5)</label>
              <input type="range" name="stars" min={1} max={5} value={form.stars} onChange={onChange} className="w-full accent-[#F59E0B]" />
              <span className="text-xs text-[#F59E0B] font-bold">{'⭐'.repeat(Number(form.stars))}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Platform</label>
              <select name="platform" value={form.platform} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[rgba(168,85,247,0.5)]">
                <option value="Direct">Direct</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="College">College</option>
                <option value="GitHub">GitHub</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <Field label="Relation" name="relation" value={form.relation} onChange={onChange} placeholder="Client / Classmate / Mentor" />
            <Field label="Date" name="date" value={form.date} onChange={onChange} placeholder="Aug 2025" />
            <div className="sm:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.verified} onChange={(e) => setForm(f => ({ ...f, verified: e.target.checked }))} className="w-4 h-4 accent-[#2563EB]" />
                <span className="text-sm text-white font-semibold">Mark as Verified <span className="text-[#64748B] font-normal text-xs">(shows on frontpage)</span></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.hidden} onChange={(e) => setForm(f => ({ ...f, hidden: e.target.checked }))} className="w-4 h-4 accent-[#F59E0B]" />
                <span className="text-sm text-white font-semibold">Hidden</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              {editingId && (
                <button onClick={() => { setOpen(false); setForm(blank); setEditingId(null); }} className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#94A3B8] text-sm font-semibold hover:bg-[rgba(255,255,255,0.05)]">Cancel</button>
              )}
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? "Save Changes" : "Add Testimonial"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ─── Live Mac-Style Code Block Component for Markdown Preview ──────── */
function LiveCodeBlock({ codeText, lang }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#060a14] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
          <span className="ml-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {lang || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-slate-200">
        <pre className="whitespace-pre"><code>{codeText}</code></pre>
      </div>
    </div>
  );
}

/* ─── Smart Markdown Conversion Engine (ChatGPT / Word / Web Docs) ─── */
function getTurndownInstance() {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  });

  if (typeof gfm === 'function') {
    td.use(gfm);
  }

  // Preserve styled spans (for custom colors and highlights)
  td.addRule('styledSpan', {
    filter: function (node) {
      if (node.nodeName !== 'SPAN') return false;
      const style = node.getAttribute('style') || '';
      const color = node.getAttribute('color') || '';
      return Boolean(style.includes('color') || style.includes('background') || color);
    },
    replacement: function (content, node) {
      const style = node.getAttribute('style');
      const color = node.getAttribute('color');
      if (style) {
        const cleanStyle = style
          .split(';')
          .map(s => s.trim())
          .filter(s => s.startsWith('color:') || s.startsWith('background-color:') || s.startsWith('background:') || s.startsWith('font-weight:'))
          .join('; ');
        if (cleanStyle) {
          return `<span style="${cleanStyle}">${content}</span>`;
        }
      } else if (color) {
        return `<span style="color: ${color}">${content}</span>`;
      }
      return content;
    }
  });

  // Preserve font color tags
  td.addRule('fontColor', {
    filter: 'font',
    replacement: function (content, node) {
      const color = node.getAttribute('color');
      return color ? `<span style="color: ${color}">${content}</span>` : content;
    }
  });

  // Preserve mark, kbd, u, sub, sup
  td.addRule('inlineHighlights', {
    filter: ['mark', 'kbd', 'sub', 'sup', 'u'],
    replacement: function (content, node) {
      const tag = node.nodeName.toLowerCase();
      return `<${tag}>${content}</${tag}>`;
    }
  });

  return td;
}

function isRichHtmlContent(html) {
  if (!html || typeof html !== 'string') return false;
  return (
    /<table[\s>]/i.test(html) ||
    /<(pre|code)[\s>]/i.test(html) ||
    /<h[1-6][\s>]/i.test(html) ||
    /<(ul|ol|li)[\s>]/i.test(html) ||
    /<span[^>]+style=["'][^"']*(color|background)/i.test(html) ||
    /mso-|MsoNormal|OfficeDocument/i.test(html) ||
    /hljs|language-|dark:bg-|bg-token/i.test(html) ||
    /<blockquote[\s>]/i.test(html) ||
    /<p[\s>]/i.test(html)
  );
}

function extractChatGPTJsonToMarkdown(data) {
  if (!data) return "";
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  if (Array.isArray(data.messages)) {
    return data.messages.map(m => {
      const roleName = m.role === 'assistant' ? '🤖 Response' : (m.role === 'user' ? '👤 Prompt' : m.role);
      const text = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `### ${roleName}\n\n${text}\n`;
    }).join('\n---\n\n');
  }
  if (data.mapping && typeof data.mapping === 'object') {
    const nodes = Object.values(data.mapping);
    const messages = nodes
      .map(n => n.message)
      .filter(m => m && m.content && m.content.parts && m.content.parts.length > 0 && m.author?.role !== 'system')
      .map(m => {
        const role = m.author?.role === 'assistant' ? '🤖 Response' : '👤 Prompt';
        const text = m.content.parts.join('\n');
        return `### ${role}\n\n${text}\n`;
      });
    const title = data.title ? `# 💬 ${data.title}\n\n` : '';
    return title + messages.join('\n---\n\n');
  }
  if (Array.isArray(data)) {
    const hasRoles = data.every(item => item && (item.role || item.content));
    if (hasRoles) {
      return data.map(m => `### ${m.role || 'Note'}\n\n${m.content || ''}\n`).join('\n---\n\n');
    }
  }
  return "";
}

/* ─── Blog Tab (Enhanced with Author Control, Smart Paste, Styling & Beside Split View) ────── */
function BlogTab({ showToast }) {
  const { blogPosts = [], setBlogPosts, add, edit, remove, teamProfiles = [] } = useData();

  const blankAuthor = {
    isTeam: false,
    teamId: "",
    name: "",
    role: "",
    avatar: "",
    bio: "",
    github: "",
    linkedin: "",
    twitter: "",
    email: ""
  };

  const blankStyling = {
    fontSize: "standard",    // "compact" | "standard" | "large" | "xlarge"
    fontFamily: "inter",     // "inter" | "space" | "merriweather" | "mono"
    layoutWidth: "standard", // "standard" | "wide" | "ultrawide"
    lineHeight: "comfortable", // "compact" | "comfortable" | "relaxed"
  };

  const blank = {
    title: "",
    excerpt: "",
    tags: ["Tutorial"],
    tag: "Tutorial",
    tagColor: "#10B981",
    readTime: "5 min read",
    date: "",
    emoji: "📝",
    slug: "",
    image: "",
    markdown: "",
    content: [],
    author: { ...blankAuthor },
    authors: [],
    demo: "",
    github: "",
    docsUrl: "",
    youtubeUrl: "",
    recommendedPosts: [],
    links: [],
    styling: { ...blankStyling },
    showOnHome: false,
    homeOrder: 0,
    hidden: false
  };

  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [customTagInput, setCustomTagInput] = useState("");
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [showRecPicker, setShowRecPicker] = useState(false);
  const [recSearch, setRecSearch] = useState("");
  const [expandedAuthorIdx, setExpandedAuthorIdx] = useState(null);
  const [editorMode, setEditorMode] = useState("split"); // "split" | "edit" | "preview"
  const [importingFile, setImportingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const editorTextareaRef = useRef(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Helper to insert markdown or text at cursor position in textarea
  const insertTextAtCursor = (textToInsert) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      setForm(f => ({ ...f, markdown: (f.markdown || '') + '\n\n' + textToInsert }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const curVal = form.markdown || '';
    const newVal = curVal.substring(0, start) + textToInsert + curVal.substring(end);
    setForm(f => ({ ...f, markdown: newVal }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Helper to insert markdown syntax at cursor position
  const insertMarkdownSyntax = (prefix, suffix = '', defaultText = '') => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = form.markdown || '';
    const selectedText = currentVal.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setForm(f => ({ ...f, markdown: newVal }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Smart Paste Handler: intercepts paste from ChatGPT, Word, Google Docs or Web pages
  const handleSmartPaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    // 1. Detect if user pasted ChatGPT JSON export
    if (text && text.trim().startsWith('{') && text.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        const converted = extractChatGPTJsonToMarkdown(parsed);
        if (converted) {
          e.preventDefault();
          insertTextAtCursor(converted);
          showToast("🤖 Auto-detected ChatGPT JSON conversation & formatted article!", "success");
          return;
        }
      } catch {
        // Not JSON, continue
      }
    }

    // 2. Detect if clipboard contains rich HTML (ChatGPT, Word .docx, Web Docs)
    if (html && isRichHtmlContent(html)) {
      e.preventDefault();
      try {
        const td = getTurndownInstance();
        let md = td.turndown(html);
        md = md.replace(/\n{4,}/g, '\n\n');
        insertTextAtCursor(md);
        showToast("✨ Converted ChatGPT / Word formatted text into Markdown with tables & colors!", "success");
        return;
      } catch (err) {
        console.warn("Smart paste fallback:", err);
      }
    }
  };

  // Toolbar button for reading clipboard
  const handleClipboardButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            const html = await blob.text();
            if (isRichHtmlContent(html)) {
              const td = getTurndownInstance();
              const md = td.turndown(html);
              insertTextAtCursor(md);
              showToast("✨ Converted clipboard content (tables & formatting) into Markdown!", "success");
              return;
            }
          }
          if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain');
            const text = await blob.text();
            insertTextAtCursor(text);
            showToast("Pasted text from clipboard!", "info");
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        insertTextAtCursor(text);
        showToast("Pasted clipboard text!", "info");
      }
    } catch {
      showToast("Press Ctrl+V inside the editor to paste formatted content!", "info");
    }
  };

  // Helper to parse Markdown into legacy content blocks for backwards compatibility
  const markdownToBlocks = (md) => {
    if (!md || typeof md !== 'string') return [];
    const lines = md.split('\n');
    const blocks = [];
    let currentPara = [];
    let inCode = false;
    let codeLang = '';
    let codeLines = [];
    let listItems = [];

    const flushPara = () => {
      if (currentPara.length > 0) {
        blocks.push({ type: "paragraph", text: currentPara.join('\n') });
        currentPara = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        blocks.push({ type: "list", items: [...listItems] });
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCode) {
          blocks.push({ type: "code", lang: codeLang || "javascript", text: codeLines.join('\n') });
          codeLines = [];
          inCode = false;
          codeLang = '';
        } else {
          flushPara();
          flushList();
          inCode = true;
          codeLang = line.trim().replace(/^```/, '').trim();
        }
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      if (line.startsWith('# ') || line.startsWith('## ')) {
        flushPara();
        flushList();
        blocks.push({ type: "heading", text: line.replace(/^#{1,2}\s+/, '').trim() });
        continue;
      }
      if (line.startsWith('### ')) {
        flushPara();
        flushList();
        blocks.push({ type: "subheading", text: line.replace(/^###\s+/, '').trim() });
        continue;
      }

      if (line.trim() === '---' || line.trim() === '***') {
        flushPara();
        flushList();
        blocks.push({ type: "divider" });
        continue;
      }

      if (line.startsWith('> ')) {
        flushPara();
        flushList();
        blocks.push({ type: "quote", text: line.replace(/^>\s+/, '').trim() });
        continue;
      }

      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        flushPara();
        flushList();
        blocks.push({ type: "image", caption: imgMatch[1], src: imgMatch[2] });
        continue;
      }

      if (line.trim().match(/^[-*•]\s+/)) {
        flushPara();
        listItems.push(line.trim().replace(/^[-*•]\s+/, ''));
        continue;
      } else {
        flushList();
      }

      if (!line.trim()) {
        flushPara();
        continue;
      }

      currentPara.push(line);
    }

    flushPara();
    flushList();
    if (inCode && codeLines.length > 0) {
      blocks.push({ type: "code", lang: codeLang || "javascript", text: codeLines.join('\n') });
    }

    return blocks;
  };

  // Import Word (.docx / .doc), Markdown (.md / .txt), HTML or ChatGPT .json files
  const handleDocImport = async (file) => {
    if (!file) return;
    setImportingFile(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let importedText = "";

      if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        // Convert to HTML first to preserve tables and colors, then run through Turndown
        const htmlRes = await mammoth.convertToHtml({ arrayBuffer });
        if (htmlRes.value) {
          const td = getTurndownInstance();
          importedText = td.turndown(htmlRes.value);
        } else {
          const mdRes = await mammoth.convertToMarkdown({ arrayBuffer });
          importedText = mdRes.value || "";
        }
      } else if (ext === 'html' || ext === 'htm') {
        const htmlContent = await file.text();
        const td = getTurndownInstance();
        importedText = td.turndown(htmlContent);
      } else if (ext === 'json') {
        const rawText = await file.text();
        try {
          const parsed = JSON.parse(rawText);
          importedText = extractChatGPTJsonToMarkdown(parsed) || rawText;
        } catch {
          importedText = rawText;
        }
      } else {
        // .md, .markdown, .txt
        importedText = await file.text();
      }

      if (!importedText.trim()) {
        showToast("The selected file contains no readable text.", "warning");
        return;
      }

      // Auto-extract title if blank
      const lines = importedText.split('\n').map(l => l.trim()).filter(Boolean);
      let detectedTitle = "";
      const h1Line = lines.find(l => l.startsWith('# '));
      if (h1Line) {
        detectedTitle = h1Line.replace(/^#\s+/, '').trim();
      } else if (lines.length > 0) {
        detectedTitle = lines[0].replace(/^[#*_\s]+/, '').trim();
      }

      // Auto-extract excerpt if blank
      const firstPara = lines.find(l => !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('>') && !l.startsWith('```') && !l.startsWith('|') && l.length > 20);

      // Auto-calculate read time
      const wordCount = importedText.trim().split(/\s+/).length;
      const calcMinutes = Math.max(1, Math.round(wordCount / 200));
      const autoReadTime = `${calcMinutes} min read`;

      setForm(prev => ({
        ...prev,
        title: prev.title || detectedTitle || file.name.replace(/\.[^/.]+$/, ""),
        slug: prev.slug || (detectedTitle ? detectedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ""),
        excerpt: prev.excerpt || (firstPara ? firstPara.substring(0, 180) + '...' : ''),
        readTime: prev.readTime === "5 min read" ? autoReadTime : prev.readTime,
        markdown: importedText,
      }));

      showToast(`🎉 Imported "${file.name}" (${wordCount.toLocaleString()} words) with tables & formatting!`, "success");
    } catch (err) {
      console.error("Doc import error:", err);
      showToast("Failed to read file: " + (err.message || "Unknown error"), "error");
    } finally {
      setImportingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Calculate current words and estimated read time
  const currentWordCount = (form.markdown || '').trim() ? (form.markdown || '').trim().split(/\s+/).length : 0;
  const estimatedReadTime = `${Math.max(1, Math.round(currentWordCount / 200))} min read`;

  // Multiple links helpers
  const handleAddLink = (initial = { label: "", url: "", type: "demo" }) => {
    setForm(f => ({ ...f, links: [...(f.links || []), initial] }));
  };

  const handleUpdateLink = (idx, field, value) => {
    setForm(f => {
      const arr = [...(f.links || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, links: arr };
    });
  };

  const handleRemoveLink = (idx) => {
    setForm(f => {
      const arr = [...(f.links || [])];
      arr.splice(idx, 1);
      return { ...f, links: arr };
    });
  };

  const handleMoveLink = (idx, direction) => {
    const currentLinks = [...(form.links || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentLinks.length) return;
    const temp = currentLinks[idx];
    currentLinks[idx] = currentLinks[targetIdx];
    currentLinks[targetIdx] = temp;
    setForm(f => ({ ...f, links: currentLinks }));
  };

  // Multiple authors helpers (using team profiles or custom authors)
  const handleToggleTeamAuthor = (tp) => {
    const currentList = Array.isArray(form.authors) ? [...form.authors] : [];
    const existsIdx = currentList.findIndex(
      a => (a.teamId && String(a.teamId) === String(tp.id)) || (a.name && a.name.toLowerCase() === tp.name?.toLowerCase())
    );
    if (existsIdx >= 0) {
      currentList.splice(existsIdx, 1);
      const nextAuthor = currentList[0] || { ...blankAuthor };
      setForm(f => ({ ...f, authors: currentList, author: nextAuthor }));
      showToast(`Removed ${tp.name} from article authors`, "info");
    } else {
      const newAuthor = {
        isTeam: true,
        teamId: tp.id,
        name: tp.name || "",
        role: tp.role || "",
        avatar: tp.photo || "",
        email: tp.email || "",
        github: tp.github || "",
        linkedin: tp.linkedin || "",
        twitter: tp.twitter || "",
        bio: tp.bio || `Specializing in ${tp.role || "software engineering"}.`
      };
      const nextAuthors = [...currentList, newAuthor];
      setForm(f => ({ ...f, authors: nextAuthors, author: nextAuthors[0] }));
      showToast(`Added ${tp.name} as article author!`, "success");
    }
  };

  const handleAddManualAuthor = () => {
    const newAuthor = {
      ...blankAuthor,
      isTeam: false,
      name: "",
      role: "Contributor",
    };
    const nextAuthors = [...(form.authors || []), newAuthor];
    setForm(f => ({ ...f, authors: nextAuthors, author: nextAuthors[0] }));
    setExpandedAuthorIdx(nextAuthors.length - 1);
  };

  const handleRemoveAuthor = (idx) => {
    const currentList = [...(form.authors || [])];
    currentList.splice(idx, 1);
    const nextAuthor = currentList[0] || { ...blankAuthor };
    setForm(f => ({ ...f, authors: currentList, author: nextAuthor }));
    if (expandedAuthorIdx === idx) setExpandedAuthorIdx(null);
  };

  const handleMakeLeadAuthor = (idx) => {
    if (idx === 0) return;
    const currentList = [...(form.authors || [])];
    const [picked] = currentList.splice(idx, 1);
    currentList.unshift(picked);
    setForm(f => ({ ...f, authors: currentList, author: currentList[0] }));
    showToast(`Set ${picked.name || "author"} as lead author!`, "success");
  };

  const handleMoveAuthorOrder = (idx, direction) => {
    const currentList = [...(form.authors || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;
    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    setForm(f => ({ ...f, authors: currentList, author: currentList[0] }));
  };

  const handleUpdateAuthor = (idx, field, value) => {
    setForm(f => {
      const currentList = [...(f.authors || [])];
      currentList[idx] = { ...currentList[idx], [field]: value };
      return {
        ...f,
        authors: currentList,
        author: idx === 0 ? currentList[0] : f.author
      };
    });
  };

  // Recommended articles helpers
  const handleToggleRecommendedPost = (postItem) => {
    const key = postItem.slug || String(postItem.id);
    const currentRecs = Array.isArray(form.recommendedPosts) ? [...form.recommendedPosts] : [];
    const exists = currentRecs.some(k => String(k) === String(key) || String(k) === String(postItem.id) || String(k) === postItem.slug);
    let nextRecs;
    if (exists) {
      nextRecs = currentRecs.filter(k => String(k) !== String(key) && String(k) !== String(postItem.id) && String(k) !== postItem.slug);
      showToast(`Removed "${postItem.title}" from recommendations`, "info");
    } else {
      nextRecs = [...currentRecs, key];
      showToast(`Added "${postItem.title}" to recommendations!`, "success");
    }
    setForm(f => ({ ...f, recommendedPosts: nextRecs }));
  };

  const handleRemoveRecommendedPost = (targetKey) => {
    setForm(f => ({
      ...f,
      recommendedPosts: (f.recommendedPosts || []).filter(k => String(k) !== String(targetKey))
    }));
  };

  const handleMoveRecommendedPost = (idx, direction) => {
    const currentRecs = [...(form.recommendedPosts || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentRecs.length) return;
    const temp = currentRecs[idx];
    currentRecs[idx] = currentRecs[targetIdx];
    currentRecs[targetIdx] = temp;
    setForm(f => ({ ...f, recommendedPosts: currentRecs }));
  };

  // Helper to extract array of tags from any post or object
  const getPostTags = (p) => {
    if (!p) return [];
    if (Array.isArray(p.tags) && p.tags.length > 0) return p.tags.map(t => String(t).trim()).filter(Boolean);
    if (typeof p.tag === "string" && p.tag.trim()) {
      return p.tag.split(",").map(t => t.trim()).filter(Boolean);
    }
    return [];
  };

  // Resolved tags for currently open form
  const currentFormTags = Array.isArray(form.tags) && form.tags.length > 0
    ? form.tags
    : (typeof form.tag === "string" && form.tag.trim() ? form.tag.split(",").map(t => t.trim()).filter(Boolean) : []);

  // Multiple Tags Helpers
  const handleAddTag = (tagName) => {
    const trimmed = (tagName || "").trim().replace(/^#+/, "");
    if (!trimmed) return;
    if (currentFormTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Tag "${trimmed}" is already added`, "info");
      return;
    }
    const updated = [...currentFormTags, trimmed];
    setForm(f => ({ ...f, tags: updated, tag: updated.join(", ") }));
    setCustomTagInput("");
  };

  const handleToggleTag = (tagName) => {
    const trimmed = (tagName || "").trim();
    if (!trimmed) return;
    const exists = currentFormTags.some(t => t.toLowerCase() === trimmed.toLowerCase());
    let updated;
    if (exists) {
      updated = currentFormTags.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
    } else {
      updated = [...currentFormTags, trimmed];
    }
    setForm(f => ({ ...f, tags: updated, tag: updated.join(", ") }));
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = currentFormTags.filter(t => t !== tagToRemove);
    setForm(f => ({ ...f, tags: updated, tag: updated.join(", ") }));
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(customTagInput);
    }
  };

  // Save handler
  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("Article Title is required!", "warning");
      return;
    }
    setSaving(true);
    const postSlug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Generate legacy content blocks so old renderers still work
    const generatedBlocks = (form.markdown && form.markdown.trim())
      ? markdownToBlocks(form.markdown)
      : (form.content || []);

    const cleanLinks = (form.links || []).filter(l => l && typeof l.url === 'string' && l.url.trim());
    const cleanTags = currentFormTags.length > 0 ? currentFormTags : ["Tutorial"];
    const cleanAuthors = (form.authors || []).filter(a => a && (a.name?.trim() || a.teamId));
    const primaryAuthor = cleanAuthors[0] || form.author || { ...blankAuthor };
    const cleanRecs = Array.isArray(form.recommendedPosts) ? form.recommendedPosts.filter(Boolean) : [];

    const payload = {
      ...form,
      tags: cleanTags,
      tag: cleanTags.join(", "),
      slug: postSlug,
      author: primaryAuthor,
      authors: cleanAuthors.length > 0 ? cleanAuthors : [primaryAuthor],
      links: cleanLinks,
      recommendedPosts: cleanRecs,
      demo: form.demo || "",
      github: form.github || "",
      docsUrl: form.docsUrl || "",
      youtubeUrl: form.youtubeUrl || "",
      styling: form.styling || blankStyling,
      markdown: form.markdown || "",
      content: generatedBlocks,
      image: form.image || "",
      showOnHome: Boolean(form.showOnHome),
      homeOrder: parseInt(form.homeOrder) || 0,
      hidden: Boolean(form.hidden),
    };

    try {
      if (editingPostId) {
        await edit(blogPosts, setBlogPosts, editingPostId, payload, 'blog');
        showToast("Blog article updated successfully!", "success");
      } else {
        await add(blogPosts, setBlogPosts, payload, 'blog');
        showToast("New blog article published!", "success");
      }
      setForm(blank);
      setEditingPostId(null);
      setOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to save blog article", "error");
    } finally {
      setSaving(false);
    }
  };

  // Open edit mode for a post
  const handleEditClick = (p) => {
    let initialMarkdown = p.markdown || "";
    if (!initialMarkdown && Array.isArray(p.content) && p.content.length > 0) {
      initialMarkdown = p.content.map(b => {
        if (b.type === "heading") return `## ${b.text}\n`;
        if (b.type === "subheading") return `### ${b.text}\n`;
        if (b.type === "quote") return `> ${b.text}\n`;
        if (b.type === "code") return `\`\`\`${b.lang || 'javascript'}\n${b.text}\n\`\`\`\n`;
        if (b.type === "image") return `![${b.caption || 'image'}](${b.src})\n`;
        if (b.type === "list") return (b.items || []).map(i => `- ${i}`).join('\n') + '\n';
        if (b.type === "divider") return `---\n`;
        return `${b.text || ''}\n`;
      }).join('\n');
    }

    let postAuthor = p.author;
    if (typeof postAuthor === 'string') {
      try { postAuthor = JSON.parse(postAuthor); } catch { postAuthor = null; }
    }
    const resolvedAuthor = postAuthor || { ...blankAuthor };

    let postAuthors = p.authors;
    if (typeof postAuthors === 'string') {
      try { postAuthors = JSON.parse(postAuthors); } catch { postAuthors = []; }
    }
    let resolvedAuthors = Array.isArray(postAuthors) && postAuthors.length > 0 ? postAuthors : [];
    if (resolvedAuthors.length === 0 && resolvedAuthor?.name) {
      resolvedAuthors = [resolvedAuthor];
    }

    let postLinks = p.links;
    if (typeof postLinks === 'string') {
      try { postLinks = JSON.parse(postLinks); } catch { postLinks = []; }
    }
    const resolvedLinks = Array.isArray(postLinks) ? postLinks : [];

    let postRecs = p.recommendedPosts;
    if (typeof postRecs === 'string') {
      try { postRecs = JSON.parse(postRecs); } catch { postRecs = []; }
    }
    const resolvedRecs = Array.isArray(postRecs) ? postRecs : [];

    let postStyling = p.styling;
    if (typeof postStyling === 'string') {
      try { postStyling = JSON.parse(postStyling); } catch { postStyling = null; }
    }
    const resolvedStyling = {
      ...blankStyling,
      ...(postStyling || {})
    };

    const resolvedTags = getPostTags(p);
    const initialTags = resolvedTags.length > 0 ? resolvedTags : (p.tag ? [p.tag] : ["Tutorial"]);

    setForm({
      ...blank,
      ...p,
      tags: initialTags,
      tag: initialTags.join(", "),
      markdown: initialMarkdown,
      content: p.content || [],
      author: resolvedAuthor,
      authors: resolvedAuthors,
      links: resolvedLinks,
      recommendedPosts: resolvedRecs,
      demo: p.demo || p.demoUrl || "",
      github: p.github || p.githubUrl || "",
      docsUrl: p.docsUrl || "",
      youtubeUrl: p.youtubeUrl || p.videoUrl || "",
      styling: resolvedStyling,
      image: p.image || "",
      showOnHome: Boolean(p.showOnHome),
      homeOrder: parseInt(p.homeOrder) || 0,
      hidden: Boolean(p.hidden),
    });

    setEditingPostId(p.id);
    setOpen(true);
    setTimeout(() => {
      document.getElementById("blog-editor-workspace")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleCancel = () => {
    setForm(blank);
    setEditingPostId(null);
    setOpen(false);
  };

  // Reordering posts
  const movePostOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blogPosts.length - 1) return;

    const items = [...blogPosts];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;

    const updated = items.map((item, i) => ({
      ...item,
      homeOrder: i + 1
    }));

    setBlogPosts(updated);
    try {
      await edit(blogPosts, setBlogPosts, items[index].id, { homeOrder: swapIndex + 1 }, 'blog');
      await edit(blogPosts, setBlogPosts, items[swapIndex].id, { homeOrder: index + 1 }, 'blog');
      showToast("Order updated!", "success");
    } catch {
      showToast("Error updating order", "error");
    }
  };

  const popularTags = [
    "Tutorial",
    "Architecture",
    "Engineering",
    "React",
    "Node.js",
    "System Design",
    "DevOps",
    "AI / ML",
    "Guide",
    "Frontend",
    "Backend",
    "Database",
    "Performance"
  ];
  const popularEmojis = ["📝", "🚀", "💻", "⚡", "🎨", "🧠", "🔐", "🌐", "📊", "🛠️", "💡", "🔥"];
  const colorPresets = ["#10B981", "#7C3AED", "#3B82F6", "#06B6D4", "#F59E0B", "#EC4899", "#6366F1"];

  // Filtered list with multi-tag matching
  const filteredPosts = blogPosts.filter(p => {
    const pTags = getPostTags(p);
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof p.tag === "string" && p.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = tagFilter === "all" || pTags.includes(tagFilter) || p.tag === tagFilter;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(blogPosts.flatMap(p => getPostTags(p))));
  const visibleCount = blogPosts.filter(p => !p.hidden).length;
  const homeCount = blogPosts.filter(p => p.showOnHome && !p.hidden).length;
  const hiddenCount = blogPosts.filter(p => p.hidden).length;

  return (
    <div className="space-y-6">
      {/* ── All Blog Articles List Card ────────────────────────── */}
      <SectionCard title={`Blog Articles (${blogPosts.length})`} color="#06B6D4">
        {/* Top Summary & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.25)] text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {visibleCount} Active
            </span>
            <span className="px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-amber-400 font-semibold flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {homeCount} on Home
            </span>
            {hiddenCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-red-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {hiddenCount} Hidden
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (open && editingPostId) handleCancel();
              else {
                setForm(blank);
                setEditingPostId(null);
                setOpen(true);
                setTimeout(() => {
                  document.getElementById("blog-editor-workspace")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {open ? "Close Editor" : "Write New Article"}
          </button>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, tag..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setTagFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tagFilter === "all" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/[0.03] text-[#94A3B8] hover:text-white"
                }`}
              >
                All Tags
              </button>
              {allTags.map(t => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    tagFilter === t ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/[0.03] text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {filteredPosts.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
                p.hidden
                  ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-60"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex flex-col gap-0.5 items-center justify-center">
                  <button onClick={() => movePostOrder(i, 'up')} disabled={i === 0} className="text-[#64748B] hover:text-white disabled:opacity-30 p-0.5"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => movePostOrder(i, 'down')} disabled={i === blogPosts.length - 1} className="text-[#64748B] hover:text-white disabled:opacity-30 p-0.5"><ArrowDown className="w-3 h-3" /></button>
                </div>

                {p.image ? (
                  <img src={p.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-[rgba(255,255,255,0.1)] flex-shrink-0" />
                ) : (
                  <span className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-xl flex-shrink-0">
                    {p.emoji || "📝"}
                  </span>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate max-w-md">{p.title}</p>
                    {p.hidden ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 border border-[rgba(245,158,11,0.2)]">Hidden</span>
                    ) : p.showOnHome ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 border border-[rgba(245,158,11,0.3)] flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> Home #{p.homeOrder || 1}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {getPostTags(p).slice(0, 4).map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)] text-[#C084FC] text-[10px] font-semibold">
                          #{t}
                        </span>
                      ))}
                      {getPostTags(p).length === 0 && (
                        <span className="text-[#A855F7] font-semibold">{p.tag || "General"}</span>
                      )}
                    </div>
                    <span>·</span>
                    <span>{p.date || "Recent"}</span>
                    <span>·</span>
                    <span>{p.readTime || "5 min read"}</span>
                    {p.author?.name && (
                      <>
                        <span>·</span>
                        <span className="text-cyan-400 font-medium flex items-center gap-1">
                          👤 {p.author.name} {p.author.isTeam ? "(Team)" : ""}
                        </span>
                      </>
                    )}
                    {Array.isArray(p.links) && p.links.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">🔗 {p.links.length} links</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !p.showOnHome;
                    await edit(blogPosts, setBlogPosts, p.id, { showOnHome: nextVal }, 'blog');
                    showToast(nextVal ? "★ Added to Home Page!" : "Removed from Home Page", nextVal ? "success" : "info");
                  }}
                  className={`p-2 rounded-lg border transition-all ${
                    p.showOnHome
                      ? "bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.4)] text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-amber-400 hover:border-[rgba(245,158,11,0.3)]"
                  }`}
                  title={p.showOnHome ? "Featured on Home (Click to remove)" : "Click to feature on Home"}
                >
                  <Star className={`w-3.5 h-3.5 ${p.showOnHome ? "fill-amber-400" : ""}`} />
                </button>

                <EditBtn onClick={() => handleEditClick(p)} />
                <VisibilityBtn
                  hidden={p.hidden}
                  onClick={async () => {
                    const nextHidden = !p.hidden;
                    await edit(blogPosts, setBlogPosts, p.id, { hidden: nextHidden }, 'blog');
                    showToast(nextHidden ? "Post hidden." : "Post visible!", "success");
                  }}
                />
                <DeleteBtn onClick={() => { remove(blogPosts, setBlogPosts, p.id, 'blog'); showToast("Article deleted!"); }} />
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <p className="text-center text-[#475569] text-sm py-8">
              {searchQuery ? "No articles match your search." : "No blog articles found. Click 'Write New Article' to create one!"}
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── Unified Blog Article Editor Workspace (Collapsible) ── */}
      <div id="blog-editor-workspace">
        {open && (
          <SectionCard
            title={editingPostId ? `Editing Article: ${form.title || "Untitled"}` : "Create New Blog Article"}
            color="#7C3AED"
          >
            {/* ── Top Bar: Quick Import README.md / Word .docx ──── */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[rgba(124,58,237,0.12)] via-[rgba(6,182,212,0.12)] to-[rgba(16,185,129,0.08)] border border-[rgba(124,58,237,0.3)] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-space">Import from File (README.md or Word .docx)</h4>
                  <p className="text-xs text-[#94A3B8]">
                    Upload <code className="text-cyan-400">README.md</code>, <code className="text-purple-400">.docx</code>, or <code className="text-emerald-400">.txt</code> to instantly extract content, headings, and formatting!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocImport(file);
                  }}
                />
                <button
                  type="button"
                  disabled={importingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#7C3AED] hover:from-cyan-400 hover:to-[#6D28D9] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {importingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{importingFile ? "Reading Document..." : "Import File"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* ═══ Section 1: Basic Information ═══════════════ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="text-[#A855F7] font-bold text-sm">1.</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Article Details & SEO Meta</h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field
                      label="Article Title *"
                      name="title"
                      value={form.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm(f => ({
                          ...f,
                          title: val,
                          slug: f.slug || val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        }));
                      }}
                      placeholder="e.g. Master High-Performance Full Stack React & Node Architecture"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Excerpt / Summary"
                      name="excerpt"
                      value={form.excerpt}
                      onChange={onChange}
                      type="textarea"
                      rows={2}
                      placeholder="A crisp, engaging overview of this article for cards, social previews, and search engines..."
                    />
                  </div>

                  {/* ── Multi-Tag Selector & Manager ── */}
                  <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        <label className="text-xs font-bold text-white uppercase tracking-wider">
                          Tags & Categories ({currentFormTags.length} selected)
                        </label>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        Click presets below to toggle on/off, or type custom tags
                      </span>
                    </div>

                    {/* Active Selected Tags Chips */}
                    <div className="min-h-[42px] p-2 rounded-xl bg-black/40 border border-white/[0.08] flex flex-wrap items-center gap-1.5">
                      {currentFormTags.length === 0 ? (
                        <span className="text-xs text-[#64748B] italic px-1">
                          No tags selected yet. Click any preset pill below or add custom tags.
                        </span>
                      ) : (
                        currentFormTags.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/25 to-cyan-500/20 border border-purple-500/40 text-purple-200 shadow-sm"
                          >
                            <span className="text-purple-400 font-mono">#</span>
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-purple-300 hover:text-white transition-colors"
                              title={`Remove tag ${t}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                      {currentFormTags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tags: [], tag: "" }))}
                          className="ml-auto text-[10px] text-[#64748B] hover:text-red-400 transition-colors underline px-1"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Custom Tag Input + Add Button */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-xs">#</span>
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={handleCustomTagKeyDown}
                          placeholder="Type custom tag (e.g. Next.js, Tailwind, Docker) and press Enter or comma..."
                          className="w-full pl-7 pr-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-purple-500 text-xs transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddTag(customTagInput)}
                        disabled={!customTagInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Tag
                      </button>
                    </div>

                    {/* Quick-Toggle Preset Pills */}
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase font-mono tracking-wider block mb-1.5">
                        Quick Preset Tags (Click to toggle on/off):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {popularTags.map(t => {
                          const isSelected = currentFormTags.some(curr => curr.toLowerCase() === t.toLowerCase());
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleToggleTag(t)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? "bg-purple-500/30 text-purple-200 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/40"
                                  : "bg-white/[0.03] text-[#94A3B8] hover:text-white border border-white/[0.07] hover:border-white/[0.15]"
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3 h-3 text-purple-300" />
                              ) : (
                                <Plus className="w-3 h-3 text-[#64748B]" />
                              )}
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Accent Color with ColorPickerControl */}
                  <div className="space-y-1.5">
                    <ColorPickerControl
                      label="Accent Color"
                      name="tagColor"
                      value={form.tagColor || "#10B981"}
                      onChange={onChange}
                      presets={["#10B981", "#7C3AED", "#3B82F6", "#06B6D4", "#F59E0B", "#EC4899", "#6366F1", "#00BFFF"]}
                    />
                  </div>

                  {/* Emoji selector */}
                  <div className="space-y-1.5">
                    <Field label="Article Emoji" name="emoji" value={form.emoji} onChange={onChange} placeholder="📝" />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {popularEmojis.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, emoji: em }))}
                          className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-sm transition-all"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Read Time with Auto Calculate button */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Read Time</label>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, readTime: estimatedReadTime }))}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        ⚡ Auto ({estimatedReadTime})
                      </button>
                    </div>
                    <input
                      type="text"
                      name="readTime"
                      value={form.readTime}
                      onChange={onChange}
                      placeholder="5 min read"
                      className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-cyan-400 text-sm"
                    />
                  </div>

                  {/* Date with Today button */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Date</label>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          setForm(f => ({ ...f, date: today }));
                        }}
                        className="text-[10px] text-purple-400 hover:underline font-mono"
                      >
                        Current Month
                      </button>
                    </div>
                    <input
                      type="text"
                      name="date"
                      value={form.date}
                      onChange={onChange}
                      placeholder="Aug 2025"
                      className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  {/* Slug */}
                  <Field label="URL Slug (auto)" name="slug" value={form.slug} onChange={onChange} placeholder="master-fullstack-architecture" />

                  {/* Cover Image URL with Cloudinary Upload */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
                      Cover Image <span className="text-[#64748B] normal-case font-normal">(Hero banner shown at top of article)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="image"
                        value={form.image || ""}
                        onChange={onChange}
                        placeholder="https://... or click Upload →"
                        className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-purple-500 text-sm"
                      />
                      <CloudinaryUpload onUpload={(url) => setForm(f => ({ ...f, image: url }))} />
                      {form.image && (
                        <img src={form.image} alt="Cover preview" className="w-12 h-10 rounded-lg object-cover border border-white/10" />
                      )}
                    </div>
                  </div>

                  {/* Primary Direct Action Links & URLs */}
                  <div className="sm:col-span-2 pt-3 border-t border-white/[0.06] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        <label className="text-xs font-bold text-white uppercase tracking-wider">
                          Primary Action Links & Direct URLs
                        </label>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        Featured as interactive glow buttons in hero and quick links in the sidebar
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field
                        label="🌐 Live Demo URL"
                        name="demo"
                        value={form.demo || ""}
                        onChange={onChange}
                        placeholder="https://my-live-demo.vercel.app"
                      />
                      <Field
                        label="💻 GitHub / Source Code URL"
                        name="github"
                        value={form.github || ""}
                        onChange={onChange}
                        placeholder="https://github.com/username/repository"
                      />
                      <Field
                        label="📄 Documentation / Guide URL"
                        name="docsUrl"
                        value={form.docsUrl || ""}
                        onChange={onChange}
                        placeholder="https://docs.my-project.com"
                      />
                      <Field
                        label="🎥 Video / YouTube Walkthrough URL"
                        name="youtubeUrl"
                        value={form.youtubeUrl || ""}
                        onChange={onChange}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ Section 2: Author Control (Multiple Authors via Team Profiles or Guest) ═ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(124,58,237,0.03)] border border-[rgba(124,58,237,0.18)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A855F7] font-bold text-sm">2.</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Who Wrote This Article (Authors & Team Profiles)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {(form.authors || []).length} Assigned
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowProfilePicker(true)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-300" />
                      Pick from Team Profiles ({teamProfiles.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleAddManualAuthor}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-white/20 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                      Add Guest Author
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8]">
                  Articles support multiple contributors! Pick members from your saved <span className="text-[#C084FC] font-semibold">Team Profiles</span> or add custom guest authors. The first author is featured as the <span className="text-cyan-300 font-semibold">Lead Author</span>.
                </p>

                {/* Team Profiles Multi-Picker Modal */}
                {showProfilePicker && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A] border border-[rgba(124,58,237,0.4)] shadow-2xl space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#A855F7]" />
                        <h4 className="font-space font-bold text-white text-sm">Select Team Members for this Article</h4>
                        <span className="text-xs text-[#64748B]">({teamProfiles.length} available)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProfilePicker(false)}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input
                        type="text"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder="Search team member by name, role, email..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {teamProfiles.length === 0 ? (
                        <p className="text-center text-xs text-[#64748B] py-6">
                          No team profiles created yet. Add team members under the "Team Profiles" tab, or click "Add Guest Author" above.
                        </p>
                      ) : (
                        teamProfiles
                          .filter(tp => !pickerSearch || tp.name?.toLowerCase().includes(pickerSearch.toLowerCase()) || tp.role?.toLowerCase().includes(pickerSearch.toLowerCase()) || tp.email?.toLowerCase().includes(pickerSearch.toLowerCase()))
                          .map(tp => {
                            const isAssigned = (form.authors || []).some(
                              a => (a.teamId && String(a.teamId) === String(tp.id)) || (a.name && a.name.toLowerCase() === tp.name?.toLowerCase())
                            );
                            return (
                              <div
                                key={tp.id}
                                onClick={() => handleToggleTeamAuthor(tp)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  isAssigned
                                    ? "bg-purple-500/15 border-purple-500/50 shadow-sm ring-1 ring-purple-500/30"
                                    : "bg-white/[0.02] border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.04]"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {tp.photo ? (
                                    <img src={tp.photo} alt={tp.name} className="w-9 h-9 rounded-full object-cover border border-purple-500/30" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center font-bold text-white text-xs">
                                      {tp.name?.charAt(0) || "T"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-white truncate">{tp.name}</p>
                                      {tp.skills && (
                                        <span className="hidden sm:inline text-[10px] text-purple-300 font-mono truncate max-w-[150px]">
                                          • {tp.skills}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#A855F7] truncate">{tp.role || "Team Member"}</p>
                                    {tp.email && <p className="text-[10px] text-[#64748B] truncate">{tp.email}</p>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {isAssigned ? (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50 flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5 text-purple-300" /> Selected
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] text-[#94A3B8] hover:text-white border border-white/10 flex items-center gap-1">
                                      <Plus className="w-3.5 h-3.5" /> Add Author
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        Click any member to add or remove them as a co-author.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowProfilePicker(false)}
                        className="px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {/* Assigned Authors Cards */}
                <div className="space-y-3">
                  {(form.authors || []).map((authorItem, idx) => {
                    const isLead = idx === 0;
                    const isExpanded = expandedAuthorIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLead
                            ? "bg-purple-500/[0.06] border-purple-500/30 shadow-md"
                            : "bg-white/[0.02] border-white/[0.07]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            {authorItem.avatar ? (
                              <img
                                src={authorItem.avatar}
                                alt={authorItem.name}
                                className="w-10 h-10 rounded-full object-cover border border-purple-500/40 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center font-bold text-white text-xs shrink-0 font-space">
                                {authorItem.name?.charAt(0) || "A"}
                              </div>
                            )}

                            {/* Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white truncate">
                                  {authorItem.name || "Untitled Author"}
                                </span>
                                {isLead ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    ★ Lead Author
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                                    Co-Author #{idx + 1}
                                  </span>
                                )}
                                {authorItem.isTeam && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.05] text-[#94A3B8] border border-white/10">
                                    Team Profile
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#A855F7] truncate">{authorItem.role || "Contributor"}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {/* Make Lead button */}
                            {!isLead && (
                              <button
                                type="button"
                                onClick={() => handleMakeLeadAuthor(idx)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                                title="Make this author the primary lead author"
                              >
                                Make Lead
                              </button>
                            )}

                            {/* Order arrows */}
                            <button
                              type="button"
                              onClick={() => handleMoveAuthorOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-[#94A3B8] hover:text-white disabled:opacity-20 transition-all"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveAuthorOrder(idx, 'down')}
                              disabled={idx === (form.authors || []).length - 1}
                              className="p-1 rounded text-[#94A3B8] hover:text-white disabled:opacity-20 transition-all"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit / Expand Drawer */}
                            <button
                              type="button"
                              onClick={() => setExpandedAuthorIdx(isExpanded ? null : idx)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                isExpanded
                                  ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                                  : "bg-white/[0.04] border-white/10 text-[#94A3B8] hover:text-white"
                              }`}
                            >
                              {isExpanded ? "Hide Details" : "Edit / Details"}
                            </button>

                            {/* Delete author */}
                            <button
                              type="button"
                              onClick={() => handleRemoveAuthor(idx)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                              title="Remove author"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Detailed Editing Fields */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-3 animate-fadeIn">
                            <div className="grid sm:grid-cols-2 gap-3">
                              <Field
                                label="Author Name"
                                name="name"
                                value={authorItem.name || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "name", e.target.value)}
                                placeholder="Full Name"
                              />
                              <Field
                                label="Author Role / Title"
                                name="role"
                                value={authorItem.role || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "role", e.target.value)}
                                placeholder="e.g. Full Stack Developer"
                              />

                              {/* Photo URL with Upload */}
                              <div className="sm:col-span-2">
                                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1 block">
                                  Author Avatar / Photo URL
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={authorItem.avatar || ""}
                                    onChange={(e) => handleUpdateAuthor(idx, "avatar", e.target.value)}
                                    placeholder="https://... photo URL"
                                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-purple-500"
                                  />
                                  <CloudinaryUpload onUpload={(url) => handleUpdateAuthor(idx, "avatar", url)} />
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <Field
                                  label="Author Bio"
                                  name="bio"
                                  value={authorItem.bio || ""}
                                  onChange={(e) => handleUpdateAuthor(idx, "bio", e.target.value)}
                                  type="textarea"
                                  rows={2}
                                  placeholder="Short bio shown on the article sidebar & card..."
                                />
                              </div>

                              <Field
                                label="GitHub URL"
                                name="github"
                                value={authorItem.github || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "github", e.target.value)}
                                placeholder="https://github.com/..."
                              />
                              <Field
                                label="LinkedIn URL"
                                name="linkedin"
                                value={authorItem.linkedin || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "linkedin", e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                              />
                              <Field
                                label="Email Address"
                                name="email"
                                value={authorItem.email || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "email", e.target.value)}
                                placeholder="author@example.com"
                              />
                              <Field
                                label="Twitter / X Profile"
                                name="twitter"
                                value={authorItem.twitter || ""}
                                onChange={(e) => handleUpdateAuthor(idx, "twitter", e.target.value)}
                                placeholder="https://x.com/..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(!form.authors || form.authors.length === 0) && (
                    <div
                      onClick={() => setShowProfilePicker(true)}
                      className="p-6 rounded-xl border border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/[0.02] hover:bg-purple-500/[0.05] text-center cursor-pointer transition-all"
                    >
                      <Users className="w-8 h-8 mx-auto text-purple-400 mb-2 opacity-80" />
                      <p className="text-xs font-bold text-white">No Authors Assigned Yet</p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Click here to select team members from saved <strong className="text-purple-300">Team Profiles</strong> or add a guest author.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ Section 3: Multiple Links & Resources Manager ════ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(6,182,212,0.03)] border border-[rgba(6,182,212,0.18)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-sm">3.</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Multiple Action Links & Resources Manager
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {(form.links || []).length} Added
                    </span>
                  </div>

                  {/* Quick-Add Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "Live Demo", url: form.demo || "", type: "demo" })}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Live Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "Source Code", url: form.github || "", type: "github" })}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> GitHub Repo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "API Documentation", url: form.docsUrl || "", type: "docs" })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Docs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "Video Walkthrough", url: form.youtubeUrl || "", type: "video" })}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Video
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "Download Files", url: "", type: "download" })}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLink({ label: "", url: "", type: "link" })}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Custom Link
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(form.links || []).map((linkItem, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {/* Type Dropdown */}
                        <select
                          value={linkItem.type || "link"}
                          onChange={(e) => handleUpdateLink(idx, "type", e.target.value)}
                          className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="demo" className="bg-[#0f172a]">🌐 Live Demo</option>
                          <option value="github" className="bg-[#0f172a]">💻 GitHub</option>
                          <option value="docs" className="bg-[#0f172a]">📄 Docs / API</option>
                          <option value="video" className="bg-[#0f172a]">🎥 Video</option>
                          <option value="download" className="bg-[#0f172a]">📥 Download</option>
                          <option value="link" className="bg-[#0f172a]">🔗 External</option>
                        </select>

                        {/* Reorder Arrows */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveLink(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[#64748B] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move link up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink(idx, 'down')}
                            disabled={idx === (form.links || []).length - 1}
                            className="p-1 text-[#64748B] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move link down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Label Input */}
                      <input
                        type="text"
                        value={linkItem.label || ""}
                        onChange={(e) => handleUpdateLink(idx, "label", e.target.value)}
                        placeholder="Link Label (e.g. Live Project Demo)"
                        className="sm:w-1/3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-cyan-400"
                      />

                      {/* URL Input */}
                      <input
                        type="url"
                        value={linkItem.url || ""}
                        onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                        placeholder="https://example.com/..."
                        className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-cyan-400"
                      />

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {/* Test URL button */}
                        {linkItem.url && (
                          <button
                            type="button"
                            onClick={() => window.open(linkItem.url, "_blank")}
                            className="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all shrink-0"
                            title="Open / test link in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                          title="Remove link"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!form.links || form.links.length === 0) && (
                    <p className="text-xs text-[#64748B] text-center py-3">
                      No multiple links added yet. Click the preset buttons above to add Live Demo, GitHub repo, API docs, or Custom links.
                    </p>
                  )}
                </div>
              </div>

              {/* ═══ Section 4: Content Editor with Beside Split View ══ */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 space-y-3 relative ${
                  isDragging
                    ? "bg-cyan-500/[0.08] border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)]"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleDocImport(file);
                }}
              >
                {/* Drag-and-drop active visual overlay */}
                {isDragging && (
                  <div className="absolute inset-0 z-50 rounded-2xl bg-[#090E1A]/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 border-2 border-dashed border-cyan-400 p-6 pointer-events-none animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                      <DownloadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-base font-bold text-white font-space">Drop File to Auto-Detect & Import!</p>
                    <p className="text-xs text-cyan-300 max-w-sm text-center">
                      Drop Word <code className="text-white bg-white/10 px-1 py-0.5 rounded">.docx</code>, <code className="text-white bg-white/10 px-1 py-0.5 rounded">README.md</code>, <code className="text-white bg-white/10 px-1 py-0.5 rounded">.html</code>, or ChatGPT <code className="text-white bg-white/10 px-1 py-0.5 rounded">.json</code>
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A855F7] font-bold text-sm">4.</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Article Content & Markdown Editor
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {currentWordCount.toLocaleString()} words · {estimatedReadTime}
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                    {[
                      { id: "edit", label: "✏️ Write Only" },
                      { id: "split", label: "⬛ Beside Split" },
                      { id: "preview", label: "👁 Preview" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEditorMode(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          editorMode === tab.id
                            ? "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-md"
                            : "text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Typography & Real Website Presentation Control Bar ── */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900/50 to-cyan-950/30 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Font Family Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Type className="w-3.5 h-3.5 text-purple-400" /> Font:
                    </span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                      {[
                        { id: "inter", label: "Inter (Modern)" },
                        { id: "space", label: "Space Grotesk (Tech)" },
                        { id: "merriweather", label: "Merriweather (Serif)" },
                        { id: "mono", label: "JetBrains (Code)" }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, styling: { ...(prev.styling || blankStyling), fontFamily: f.id } }))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            (form.styling?.fontFamily || "inter") === f.id
                              ? "bg-purple-600/40 text-purple-200 border border-purple-500/50 shadow-sm"
                              : "text-[#94A3B8] hover:text-white"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Size:
                    </span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                      {[
                        { id: "compact", label: "15px Compact" },
                        { id: "standard", label: "17px Standard" },
                        { id: "large", label: "19px Large" },
                        { id: "xlarge", label: "21px X-Large" }
                      ].map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, styling: { ...(prev.styling || blankStyling), fontSize: s.id } }))}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            (form.styling?.fontSize || "standard") === s.id
                              ? "bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 shadow-sm"
                              : "text-[#94A3B8] hover:text-white"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reading Layout Width Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> Layout Width:
                    </span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                      {[
                        { id: "standard", label: "Optimal (768px)" },
                        { id: "wide", label: "Wide (896px)" },
                        { id: "ultrawide", label: "Ultra-Wide" }
                      ].map(w => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, styling: { ...(prev.styling || blankStyling), layoutWidth: w.id } }))}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            (form.styling?.layoutWidth || "standard") === w.id
                              ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 shadow-sm"
                              : "text-[#94A3B8] hover:text-white"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Markdown Formatting & Smart Paste Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-black/40 border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handleClipboardButtonClick}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all shadow-sm active:scale-95 mr-1"
                    title="Smart Paste: Auto-detects ChatGPT, Word, tables, and colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Smart Paste</span>
                  </button>
                  <span className="w-px h-4 bg-white/10 mx-1" />

                  <button type="button" onClick={() => insertMarkdownSyntax('# ', '', 'Heading 1')} className="px-2 py-1 rounded text-xs font-bold text-white hover:bg-white/10" title="Heading 1">H1</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('## ', '', 'Heading 2')} className="px-2 py-1 rounded text-xs font-bold text-white hover:bg-white/10" title="Heading 2">H2</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('### ', '', 'Heading 3')} className="px-2 py-1 rounded text-xs font-bold text-white hover:bg-white/10" title="Heading 3">H3</button>
                  <span className="w-px h-4 bg-white/10 mx-1" />
                  <button type="button" onClick={() => insertMarkdownSyntax('**', '**', 'bold text')} className="px-2 py-1 rounded text-xs font-bold text-white hover:bg-white/10" title="Bold">B</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('*', '*', 'italic text')} className="px-2 py-1 rounded text-xs italic text-white hover:bg-white/10" title="Italic">I</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('~~', '~~', 'strikethrough')} className="px-2 py-1 rounded text-xs text-white hover:bg-white/10" title="Strikethrough">S̶</button>
                  <span className="w-px h-4 bg-white/10 mx-1" />
                  <button type="button" onClick={() => insertMarkdownSyntax('- ', '', 'List item')} className="px-2 py-1 rounded text-xs text-cyan-400 hover:bg-white/10" title="Bullet List">• List</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('1. ', '', 'First item')} className="px-2 py-1 rounded text-xs text-cyan-400 hover:bg-white/10" title="Numbered List">1. List</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('> ', '', 'Quoted thought')} className="px-2 py-1 rounded text-xs text-amber-400 hover:bg-white/10" title="Quote">"" Quote</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('> 💡 **Tip:** ', '', 'Helpful advice here')} className="px-2 py-1 rounded text-xs text-emerald-400 hover:bg-white/10" title="Tip Box">💡 Tip</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('> 🚨 **Important:** ', '', 'Critical warning note')} className="px-2 py-1 rounded text-xs text-red-400 hover:bg-white/10" title="Warning Box">🚨 Alert</button>
                  <span className="w-px h-4 bg-white/10 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertMarkdownSyntax('\n| Feature | Status | Description |\n| :--- | :---: | :--- |\n| Speed | ⚡ High | Next-gen rendering |\n| Security | 🛡️ Pass | End-to-end token |\n\n', '', '')}
                    className="px-2 py-1 rounded text-xs font-medium text-emerald-400 hover:bg-white/10 flex items-center gap-1"
                    title="Insert Markdown Table"
                  >
                    <TableIcon className="w-3.5 h-3.5" /> Table
                  </button>
                  <button type="button" onClick={() => insertMarkdownSyntax('```javascript\n', '\n```', '// Code snippet')} className="px-2 py-1 rounded text-xs font-mono text-purple-400 hover:bg-white/10" title="Code Block">&lt;/&gt; Code</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('<span style="color: #06B6D4">', '</span>', 'colored text')} className="px-2 py-1 rounded text-xs text-cyan-400 hover:bg-white/10" title="Colored Text">🎨 Color</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('[', '](https://example.com)', 'Link label')} className="px-2 py-1 rounded text-xs text-blue-400 hover:bg-white/10" title="Insert Link">🔗 Link</button>
                  <button type="button" onClick={() => insertMarkdownSyntax('---\n', '', '')} className="px-2 py-1 rounded text-xs text-slate-400 hover:bg-white/10" title="Divider">— Line</button>
                  
                  {/* Inline Image Upload in Toolbar */}
                  <div className="ml-auto flex items-center gap-1">
                    <CloudinaryUpload
                      label="Insert Img"
                      onUpload={(imgUrl) => {
                        insertMarkdownSyntax(`![Illustration](${imgUrl})\n`, '', '');
                        showToast("Image inserted into article!", "success");
                      }}
                    />
                  </div>
                </div>

                {/* ── Beside Split Screen / Single Pane Area ────── */}
                <div className={`rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070B16] ${
                  editorMode === "split" ? "grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]" : ""
                }`}>
                  {/* Left Column: Markdown Editor */}
                  {(editorMode === "edit" || editorMode === "split") && (
                    <div className="flex flex-col">
                      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                        <span className="flex items-center gap-1.5 text-purple-300">
                          <Edit2 className="w-3 h-3" /> MARKDOWN & RICH PASTE WRITER
                        </span>
                        <span>{form.markdown?.length || 0} chars · Paste Word/ChatGPT here!</span>
                      </div>
                      <textarea
                        ref={editorTextareaRef}
                        value={form.markdown || ""}
                        onChange={(e) => setForm(f => ({ ...f, markdown: e.target.value }))}
                        onPaste={handleSmartPaste}
                        rows={24}
                        placeholder={`# Article Title\n\nStart writing in Markdown or paste formatted content directly from Word / ChatGPT...\n\n| Endpoint | Method | Description |\n| :--- | :---: | :--- |\n| /api/blog | GET | Retrieve all articles |\n\n> 💡 **Tip:** Auto-converts tables, colors, code, and images into clean markdown!\n\n\`\`\`javascript\nconst app = express();\napp.listen(5000);\n\`\`\`\n`}
                        className="w-full h-full min-h-[480px] max-h-[780px] p-5 bg-transparent text-slate-100 font-mono text-sm leading-relaxed focus:outline-none resize-y placeholder:text-[#334155]"
                      />
                    </div>
                  )}

                  {/* Right Column: Beside Split Live Formatted Real Website Preview */}
                  {(editorMode === "preview" || editorMode === "split") && (
                    <div className="flex flex-col bg-[#050813]">
                      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                          <Eye className="w-3.5 h-3.5" /> LIVE REAL-WEBSITE PREVIEW
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#A855F7]">
                            Font: {form.styling?.fontFamily || "inter"} · Size: {form.styling?.fontSize || "standard"}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 max-h-[780px] overflow-y-auto" data-lenis-prevent="true">
                        {form.markdown ? (
                          <div
                            className={`w-full transition-all duration-300 ${
                              form.styling?.layoutWidth === "wide"
                                ? "max-w-4xl"
                                : form.styling?.layoutWidth === "ultrawide"
                                ? "max-w-5xl"
                                : "max-w-3xl"
                            } ${
                              form.styling?.fontFamily === "space"
                                ? "font-['Space_Grotesk',sans-serif]"
                                : form.styling?.fontFamily === "merriweather"
                                ? "font-['Merriweather',serif]"
                                : form.styling?.fontFamily === "mono"
                                ? "font-['JetBrains_Mono',monospace]"
                                : "font-['Inter',sans-serif]"
                            } ${
                              form.styling?.fontSize === "compact"
                                ? "text-[15px]"
                                : form.styling?.fontSize === "large"
                                ? "text-[19px]"
                                : form.styling?.fontSize === "xlarge"
                                ? "text-[21px]"
                                : "text-[17px]"
                            } ${
                              form.styling?.lineHeight === "compact"
                                ? "leading-[1.65]"
                                : form.styling?.lineHeight === "relaxed"
                                ? "leading-[2.1]"
                                : "leading-[1.85]"
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                              components={{
                                // Responsive glassmorphic tables with gradient headers & glowing row hovers
                                table: ({ children }) => (
                                  <div className="my-7 overflow-x-auto rounded-2xl border border-white/10 bg-[#070b16]/95 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md">
                                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-gradient-to-r from-purple-950/60 via-cyan-950/50 to-purple-950/40 border-b border-white/15 text-white font-space font-bold uppercase text-[11px] tracking-wider">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="px-4 py-3.5 text-cyan-300 font-bold whitespace-nowrap">
                                    {children}
                                  </th>
                                ),
                                tr: ({ children }) => (
                                  <tr className="border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors odd:bg-transparent even:bg-white/[0.015]">
                                    {children}
                                  </tr>
                                ),
                                td: ({ children }) => (
                                  <td className="px-4 py-3 text-slate-300 font-mono text-xs leading-relaxed">
                                    {children}
                                  </td>
                                ),
                                // Smart image detector: badges vs full illustrations
                                img: ({ node, src, alt, ...props }) => {
                                  const isBadge = src?.includes('shields.io') || src?.includes('badge') || (alt && alt.toLowerCase().includes('badge'));
                                  if (isBadge) {
                                    return (
                                      <img
                                        src={src}
                                        alt={alt || "badge"}
                                        className="inline-block my-1 mr-2 h-6 object-contain align-middle hover:scale-105 transition-transform"
                                        {...props}
                                      />
                                    );
                                  }
                                  return (
                                    <div className="my-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#070b16]">
                                      <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[500px]" {...props} />
                                      {alt && alt !== 'image' && (
                                        <p className="text-center text-xs text-slate-400 py-2 border-t border-white/5 bg-white/[0.02] font-mono">
                                          ▲ {alt}
                                        </p>
                                      )}
                                    </div>
                                  );
                                },
                                // Mac Terminal Code blocks with copy button
                                pre: ({ children }) => <>{children}</>,
                                code: ({ node, inline, className, children, ...props }) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeString = String(children).replace(/\n$/, '');
                                  if (!inline && (match || codeString.includes('\n'))) {
                                    return (
                                      <LiveCodeBlock
                                        codeText={codeString}
                                        lang={match ? match[1] : 'code'}
                                      />
                                    );
                                  }
                                  return (
                                    <code className="text-purple-300 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                // Smart callout blockquotes
                                blockquote: ({ children }) => (
                                  <blockquote className="my-6 p-4 sm:p-5 rounded-2xl border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/[0.1] via-cyan-500/[0.04] to-transparent border border-white/5 text-slate-200 shadow-md">
                                    {children}
                                  </blockquote>
                                ),
                                // Headings
                                h1: ({ children }) => (
                                  <h1 className="text-2xl sm:text-3xl font-space font-bold text-white border-b border-white/10 pb-3 mt-8 mb-4">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl sm:text-2xl font-space font-bold text-white mt-8 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-5 rounded-full bg-cyan-400 inline-block" />
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg sm:text-xl font-space font-semibold text-[#C4B5FD] mt-6 mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="my-4 text-slate-300 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                a: ({ href, children }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 transition-colors">
                                    {children}
                                  </a>
                                ),
                                hr: () => (
                                  <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-6 my-4 space-y-1.5 text-slate-300">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal pl-6 my-4 space-y-1.5 text-slate-300">
                                    {children}
                                  </ol>
                                ),
                              }}
                            >
                              {form.markdown}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-center py-24 text-[#475569]">
                            <p className="text-4xl mb-3">👁️</p>
                            <p className="text-base font-bold text-white font-space">Real Website Live Preview</p>
                            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                              Start typing on the left, paste from Word/ChatGPT, or drop a document to see real-time tables, colors, and typography!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ Section 5: Recommended & Referred Articles Selector ══ */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(236,72,153,0.03)] border border-[rgba(236,72,153,0.18)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400 font-bold text-sm">5.</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Recommended & Referred Articles
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {(form.recommendedPosts || []).length} Curated
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRecPicker(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 hover:border-pink-400 text-pink-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-pink-300" />
                    Browse & Add Articles ({blogPosts.filter(p => !editingPostId || p.id !== editingPostId).length} available)
                  </button>
                </div>

                <p className="text-xs text-[#94A3B8]">
                  Hand-pick specific articles to display in the Right Sidebar's <strong className="text-pink-300">"Recommended Articles"</strong> section and at the bottom of the article.
                </p>

                {/* Recommended Articles Modal Picker */}
                {showRecPicker && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#090E1A] border border-pink-500/40 shadow-2xl space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-pink-400" />
                        <h4 className="font-space font-bold text-white text-sm">Pick Recommended Articles</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRecPicker(false)}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input
                        type="text"
                        value={recSearch}
                        onChange={(e) => setRecSearch(e.target.value)}
                        placeholder="Search articles by title, tag, or topic..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-[#475569] focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {blogPosts
                        .filter(p => (!editingPostId || p.id !== editingPostId))
                        .filter(p => !recSearch || p.title?.toLowerCase().includes(recSearch.toLowerCase()) || p.tag?.toLowerCase().includes(recSearch.toLowerCase()))
                        .map(p => {
                          const key = p.slug || String(p.id);
                          const isPicked = (form.recommendedPosts || []).some(
                            k => String(k) === String(key) || String(k) === String(p.id) || String(k) === p.slug
                          );
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleToggleRecommendedPost(p)}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                isPicked
                                  ? "bg-pink-500/15 border-pink-500/50 ring-1 ring-pink-500/30"
                                  : "bg-white/[0.02] border-white/[0.06] hover:border-pink-500/40 hover:bg-white/[0.04]"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-base shrink-0 p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                  {p.emoji || "📝"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{p.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#94A3B8] font-mono">
                                    <span className="text-pink-300">{p.tag || "Article"}</span>
                                    <span>•</span>
                                    <span>{p.readTime || "5 min read"}</span>
                                    {p.date && (
                                      <>
                                        <span>•</span>
                                        <span>{p.date}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isPicked ? (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-500/30 text-pink-200 border border-pink-500/50 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-pink-300" /> Recommended
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] text-[#94A3B8] hover:text-white border border-white/10 flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Recommend
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        Articles selected here will be prioritized in the reader's sidebar.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRecPicker(false)}
                        className="px-3.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Recommended Articles Cards */}
                <div className="space-y-2">
                  {(form.recommendedPosts || []).map((targetKey, idx) => {
                    const matchPost = blogPosts.find(p => p.slug === targetKey || String(p.id) === String(targetKey));
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-sm shrink-0">
                            {matchPost?.emoji || "📝"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {matchPost?.title || `Article (${targetKey})`}
                            </p>
                            <p className="text-[10px] text-pink-300 font-mono">
                              {matchPost?.tag || "Article"} {matchPost?.readTime ? `• ${matchPost.readTime}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveRecommendedPost(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[#64748B] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move recommendation up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRecommendedPost(idx, 'down')}
                            disabled={idx === (form.recommendedPosts || []).length - 1}
                            className="p-1 text-[#64748B] hover:text-white disabled:opacity-20 transition-colors"
                            title="Move recommendation down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecommendedPost(targetKey)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                            title="Remove recommendation"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {(!form.recommendedPosts || form.recommendedPosts.length === 0) && (
                    <div
                      onClick={() => setShowRecPicker(true)}
                      className="p-4 rounded-xl border border-dashed border-pink-500/20 hover:border-pink-500/40 bg-pink-500/[0.01] hover:bg-pink-500/[0.03] text-center cursor-pointer transition-all"
                    >
                      <BookOpen className="w-6 h-6 mx-auto text-pink-400 mb-1 opacity-70" />
                      <p className="text-xs font-semibold text-white">No Specific Articles Curated (Auto-Matched by Category)</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Click here to hand-pick recommended articles for the reader sidebar.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ Section 6: Publishing & Status Controls ════ */}
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(form.showOnHome)}
                      onChange={(e) => setForm(f => ({ ...f, showOnHome: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-white/5 border-white/20"
                    />
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Feature on Home Page
                    </span>
                  </label>

                  {form.showOnHome && (
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <span>Position:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={form.homeOrder || 1}
                        onChange={(e) => setForm(f => ({ ...f, homeOrder: parseInt(e.target.value) || 1 }))}
                        className="w-14 px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-mono text-center"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(form.hidden)}
                      onChange={(e) => setForm(f => ({ ...f, hidden: e.target.checked }))}
                      className="w-4 h-4 rounded text-red-500 focus:ring-0 bg-white/5 border-white/20"
                    />
                    <span className="text-xs font-semibold text-[#94A3B8]">
                      Save as Draft / Hidden
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#94A3B8] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] text-white text-sm font-bold shadow-xl hover:opacity-95 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "Saving to Database..." : (editingPostId ? "Update Article" : "Publish Article")}</span>
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

/* ─── WYSIWYG Rich Text Editor ───────────────────────────────── */
function RichTextEditor({ value, onChange, handleRichImageUpload }) {
  const editorRef = useRef(null);
  const fileRef   = useRef(null);

  // Sync HTML out
  const onInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  // Clean paste: strip Word/Google garbage but keep structure
  const onPaste = useCallback((e) => {
    e.preventDefault();
    const html  = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    if (html) {
      // Sanitise: keep useful tags, strip garbage styles/attributes
      const div = document.createElement('div');
      div.innerHTML = html;
      // Remove script/style nodes
      div.querySelectorAll('script,style,meta,link').forEach(n => n.remove());
      // Strip all style/class/id attrs
      div.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.removeAttribute('lang');
        el.removeAttribute('dir');
      });
      document.execCommand('insertHTML', false, div.innerHTML);
    } else {
      // Plain text: convert newlines to <br>
      const lines = plain.split('\n').map(l => `<p>${l || '<br>'}</p>`).join('');
      document.execCommand('insertHTML', false, lines);
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertEmoji = (emoji) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const EMOJIS = ['😀','🎉','🔥','⚡','🚀','💡','✅','❌','📌','🧠','💻','🎨','📝','🌟','👉','📢','💬','🛠️','🎯','📊'];

  const ToolBtn = ({ cmd, val, label, title }) => (
    <button
      type="button" title={title || label}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
      className="px-2 py-1 rounded text-[11px] font-bold text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all"
    >{label}</button>
  );

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.1)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[rgba(0,0,0,0.3)] border-b border-[rgba(255,255,255,0.08)]">
        <ToolBtn cmd="bold"          label="B"    title="Bold" />
        <ToolBtn cmd="italic"        label="I"    title="Italic" />
        <ToolBtn cmd="underline"     label="U"    title="Underline" />
        <ToolBtn cmd="strikeThrough" label="S̶"    title="Strikethrough" />
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        <ToolBtn cmd="formatBlock" val="h2"      label="H2"   title="Heading 2" />
        <ToolBtn cmd="formatBlock" val="h3"      label="H3"   title="Heading 3" />
        <ToolBtn cmd="formatBlock" val="p"       label="¶"    title="Paragraph" />
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        <ToolBtn cmd="insertUnorderedList" label="• List"  title="Bullet list" />
        <ToolBtn cmd="insertOrderedList"   label="1. List" title="Numbered list" />
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        <ToolBtn cmd="justifyLeft"   label="⬅" title="Align left" />
        <ToolBtn cmd="justifyCenter" label="↔" title="Center" />
        <ToolBtn cmd="justifyRight"  label="➡" title="Align right" />
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        {/* Image upload */}
        <button
          type="button"
          title="Insert image"
          onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
          className="px-2 py-1 rounded text-[11px] font-bold text-[#10B981] hover:text-white hover:bg-[rgba(16,185,129,0.1)] transition-all"
        >🖼 Img</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleRichImageUpload(e, editorRef)} />
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        {/* Emoji picker */}
        <div className="relative group">
          <button type="button"
            className="px-2 py-1 rounded text-[11px] font-bold text-[#F59E0B] hover:bg-[rgba(245,158,11,0.1)] transition-all"
            title="Insert emoji"
          >😊 Emoji</button>
          <div className="absolute top-full left-0 mt-1 z-50 hidden group-hover:grid grid-cols-5 gap-1 p-2 rounded-xl bg-[#0D1117] border border-[rgba(255,255,255,0.12)] shadow-2xl">
            {EMOJIS.map(em => (
              <button key={em} type="button"
                onMouseDown={(e) => { e.preventDefault(); insertEmoji(em); }}
                className="w-8 h-8 text-lg flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.08)] transition-all"
              >{em}</button>
            ))}
          </div>
        </div>
        <span className="w-px h-4 bg-[rgba(255,255,255,0.1)] mx-1" />
        <button type="button" title="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}
          className="px-2 py-1 rounded text-[11px] text-[#64748B] hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all"
        >✕ Clear</button>
      </div>

      {/* Hint banner */}
      <div className="px-4 py-2 bg-[rgba(236,72,153,0.06)] border-b border-[rgba(236,72,153,0.12)] flex items-center gap-2">
        <span className="text-[10px] text-[#EC4899] font-bold">💡 TIP:</span>
        <span className="text-[10px] text-[#64748B]">Paste directly from ChatGPT, Word, Google Docs — formatting is preserved automatically.</span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onPaste={onPaste}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder="Paste your content here from ChatGPT, Word, Google Docs... or type directly. Use the toolbar above for formatting, images and emojis."
        className="rich-editor min-h-[220px] max-h-[500px] overflow-y-auto px-5 py-4 text-[#E2E8F0] text-sm leading-relaxed outline-none"
        style={{
          background: 'rgba(0,0,0,0.25)',
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
  );
}

/* ─── Login Screen ───────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("initial"); // "initial", "password", "2fa_otp", "forgot"
  const [pw, setPw] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '403768628498-bp3iruc9m64qvh1gq9q2btqkokmtj579.apps.googleusercontent.com';

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const attemptPassword = async () => {
    if (!pw) { setError("Password required"); triggerShake(); return; }
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.requireOtp) {
          setMsg(data.message);
          setMode("2fa_otp");
        } else if (data.token) {
          onLogin(data.token);
        }
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect password"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/otp/request`, { method: 'POST' });
      if (res.ok) {
        setMsg("New OTP sent! Check your inbox.");
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend OTP"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  const requestOtp = async (isReset = false) => {
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/otp/request`, { method: 'POST' });
      if (res.ok) {
        setMsg("OTP sent to admin email. Please check your inbox.");
        setMode(isReset ? "forgot" : "otp");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send OTP"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  const attemptOtp = async () => {
    if (!otpCode) { setError("OTP required"); triggerShake(); return; }
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode })
      });
      if (res.ok) {
        const data = await res.json();
        onLogin(data.token);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid OTP"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  const attemptReset = async () => {
    if (!otpCode || !newPw) { setError("OTP and New Password required"); triggerShake(); return; }
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode, newPassword: newPw })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg(data.message);
        setMode("password");
        setPw("");
        setOtpCode("");
        setNewPw("");
      } else {
        const data = await res.json();
        setError(data.error || "Reset failed"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true); setError(false); setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      if (res.ok) {
        const data = await res.json();
        onLogin(data.token);
      } else {
        const data = await res.json();
        setError(data.error || "Google login failed"); triggerShake();
      }
    } catch (err) {
      setError("Network error"); triggerShake();
    }
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <div className="min-h-screen bg-[#0b132b] flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="flex flex-col items-center mb-8 z-10">
          <div className="w-16 h-16 rounded-[1rem] bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <Shield className="w-8 h-8 text-[#F59E0B]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[2.5rem] font-bold mb-2">
            <span className="text-white tracking-tight">ANKIT</span>
            <span className="text-[#F97316] tracking-tight">.DEV</span>
          </h1>
          <p className="text-[#EA580C] text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Portfolio Admin</p>
          <p className="text-[#93C5FD] text-[15px]">Admin Panel Access</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, x: shake ? [-8, 8, -6, 6, 0] : 0 }}
          transition={{ duration: shake ? 0.4 : 0.5 }}
          className="relative w-full max-w-sm z-10"
        >
          <div className="rounded-[1.5rem] border border-[rgba(255,255,255,0.05)] bg-[#1c2438] px-8 py-10 shadow-2xl">
            <h2 className="text-white text-[22px] font-bold text-center mb-8 tracking-tight">Sign in as Administrator</h2>

            <div className="space-y-4">
              {msg && <p className="text-xs text-emerald-400 text-center mb-4">{msg}</p>}

              {mode === "password" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="relative mb-4">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input
                      type={show ? "text" : "password"}
                      value={pw}
                      onChange={(e) => { setPw(e.target.value); setError(false); }}
                      onKeyDown={(e) => e.key === "Enter" && attemptPassword()}
                      placeholder="Enter admin password"
                      className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm bg-[rgba(255,255,255,0.04)] border transition-all focus:outline-none ${
                        error ? "border-red-500 bg-[rgba(239,68,68,0.05)]" : "border-[rgba(255,255,255,0.08)] focus:border-[#FF9900]"
                      }`}
                    />
                    <button onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-1 mb-6">
                    <button onClick={() => setMode("initial")} className="text-xs text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                      &larr; Back
                    </button>
                    <button onClick={() => requestOtp(true)} className="text-xs text-[#FF9900] hover:text-white transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400 flex items-center justify-center gap-1.5 mb-4"><X className="w-3.5 h-3.5" /> {error}</p>}
                  <button onClick={attemptPassword} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#FF9900] text-black font-bold text-sm hover:bg-[#E68A00] transition-colors flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} SIGN IN
                  </button>
                </motion.div>
              )}

              {mode === "2fa_otp" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(245,158,11,0.1)] mb-4">
                      <Shield className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">2-Step Verification</h3>
                    <p className="text-sm text-[rgba(255,255,255,0.6)]">Enter the 6-digit code sent to your email.</p>
                  </div>
                  
                  <div className="relative mb-6">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => { setOtpCode(e.target.value); setError(false); }}
                      onKeyDown={(e) => e.key === "Enter" && attemptOtp()}
                      placeholder="Enter 6-digit OTP"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white font-mono tracking-widest text-sm bg-[rgba(255,255,255,0.04)] border transition-all focus:outline-none text-center ${error ? "border-red-500 bg-[rgba(239,68,68,0.05)]" : "border-[rgba(255,255,255,0.08)] focus:border-[#FF9900]"}`}
                      maxLength={6}
                    />
                  </div>
                  {error && <p className="text-xs text-red-400 flex items-center justify-center gap-1.5 mb-4"><X className="w-3.5 h-3.5" /> {error}</p>}
                  <button onClick={attemptOtp} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#FF9900] text-black font-bold text-sm hover:bg-[#E68A00] transition-colors flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Verify & Login
                  </button>
                  <div className="mt-5 flex items-center justify-between px-1">
                    <button onClick={() => setMode("password")} className="text-xs text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                      &larr; Back
                    </button>
                    <button
                      onClick={resendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className={`text-xs transition-colors ${resendCooldown > 0 ? 'text-[rgba(255,255,255,0.3)] cursor-not-allowed' : 'text-[#FF9900] hover:text-white'}`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}



              {mode === "forgot" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="relative mb-3">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => { setOtpCode(e.target.value); setError(false); }}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white font-mono tracking-widest text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[#FF9900] transition-all focus:outline-none text-center"
                      maxLength={6}
                    />
                  </div>
                  <div className="relative mb-6">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => { setNewPw(e.target.value); setError(false); }}
                      placeholder="Enter New Password"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm bg-[rgba(255,255,255,0.04)] border transition-all focus:outline-none ${error ? "border-red-500 bg-[rgba(239,68,68,0.05)]" : "border-[rgba(255,255,255,0.08)] focus:border-[#FF9900]"}`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-400 flex items-center justify-center gap-1.5 mb-4"><X className="w-3.5 h-3.5" /> {error}</p>}
                  <button onClick={attemptReset} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#FF9900] text-black font-bold text-sm hover:bg-[#E68A00] transition-colors flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Reset Password
                  </button>
                  <div className="mt-4 text-center">
                    <button onClick={() => setMode("initial")} className="text-xs text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                      &larr; Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === "initial" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button 
                    onClick={() => { setMode("password"); setError(false); setMsg(""); }}
                    className="w-full py-3.5 rounded-xl bg-[#F97316] text-[#0B1221] font-bold text-[15px] hover:bg-[#EA580C] transition-colors flex justify-center items-center gap-2 mb-6 shadow-lg"
                  >
                    <Mail className="w-5 h-5 stroke-[2.5]" /> SIGN IN WITH EMAIL
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.1)]"></div>
                    <span className="text-[rgba(255,255,255,0.4)] text-[13px] font-medium">Or</span>
                    <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.1)]"></div>
                  </div>

                  {GOOGLE_CLIENT_ID ? (
                    <div className="flex justify-center bg-white rounded-xl overflow-hidden hover:opacity-90 transition-opacity mb-8">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => { setError("Google login failed"); triggerShake(); }}
                        theme="outline"
                        shape="rectangular"
                        text="continue_with"
                        width="350"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-red-400 text-center mb-8">Google Client ID missing</p>
                  )}

                  <p className="text-center text-[12px] text-[rgba(255,255,255,0.3)] leading-relaxed px-4">
                    Only authorized administrators can access this panel.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <button onClick={() => window.location.href = '/'} className="mt-10 text-[rgba(255,255,255,0.3)] hover:text-white transition-colors text-[13px] z-10 flex items-center gap-2">
          &larr; Back to Store
        </button>
      </div>
    </GoogleOAuthProvider>
  );
}

/* ─── Categories Tab ─────────────────────────────────────── */
function CategoriesTab({ showToast }) {
  const { categories, addCategory, deleteCategory } = useData();
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setLoading(true); setError("");
    const result = await addCategory(trimmed);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setNewName("");
      showToast(`Category "${trimmed}" created!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Category */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#A855F7]" /> Create New Category
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Freelance, Hackathon, AI/ML..."
            className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Existing Categories */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
        <h3 className="text-sm font-bold text-white mb-4">All Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <p className="text-[#64748B] text-sm">No categories yet. Create one above.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.06)] text-white text-sm font-medium transition-all hover:border-[rgba(239,68,68,0.3)]"
              >
                <Tags className="w-3.5 h-3.5 text-[#A855F7] group-hover:text-red-400 transition-colors" />
                {cat.name}
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                      showToast(`"${cat.name}" deleted`);
                    }
                  }}
                  className="ml-1 text-[#64748B] hover:text-red-400 transition-colors"
                  title="Delete category"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-[rgba(56,189,248,0.04)] border border-[rgba(56,189,248,0.1)] text-[#38BDF8] text-xs leading-relaxed">
        💡 Categories you create here will appear in the project form dropdown. Deleting a category does <strong>not</strong> change existing projects that already use it.
      </div>
    </div>
  );
}

/* ─── Quick Info Tab ─────────────────────────────────────── */
function QuickInfoTab({ showToast }) {
  const { infoItems, setInfoItems } = useData();
  const blank = { icon: "", title: "", value: "", sub: "", hidden: false };
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);

  const handleToggleVisibility = async (item) => {
    const updated = { ...item, hidden: !item.hidden };
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update visibility");
      }
      const updatedItem = await res.json();
      setInfoItems(prev => (prev || []).map(i => i.id === item.id ? updatedItem : i));
      showToast(updatedItem.hidden ? "Info item hidden." : "Info item visible!", updatedItem.hidden ? "warning" : "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error updating visibility", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to remove item");
      }
      setInfoItems(prev => (prev || []).filter(item => item.id !== id));
      showToast("Info item removed!", "error");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error removing item", "error");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.value.trim()) {
      showToast("Title and Value are required", "warning");
      return;
    }
    try {
      if (editingId) {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to update item");
        }
        const updatedItem = await res.json();
        setInfoItems(prev => (prev || []).map(item => item.id === editingId ? updatedItem : item));
        setEditingId(null);
        showToast("Info item updated!", "success");
      } else {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to add item");
        }
        const newItem = await res.json();
        setInfoItems(prev => [...(prev || []), newItem]);
        showToast("Info item added!", "success");
      }
      setForm(blank);
      setOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error saving item", "error");
    }
  };

  const handleEdit = (item) => {
    setForm({ icon: item.icon, title: item.title, value: item.value, sub: item.sub, hidden: item.hidden || false });
    setEditingId(item.id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Quick Info (${infoItems?.length || 0})`} color="#38BDF8">
        <div className="space-y-3">
          {(infoItems || []).map((item) => (
            <div key={item.id} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${item.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    {item.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                  <p className="text-xs text-[#64748B]">{item.value} — {item.sub}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <VisibilityBtn hidden={item.hidden} onClick={() => handleToggleVisibility(item)} />
                <EditBtn onClick={() => handleEdit(item)} />
                <DeleteBtn onClick={() => handleDelete(item.id)} />
              </div>
            </div>
          ))}
          {(!infoItems || infoItems.length === 0) && <p className="text-center text-[#475569] text-sm py-6">No info items.</p>}
        </div>
      </SectionCard>

      <SectionCard title={editingId ? "Edit Info Item" : "Add Info Item"} color="#06B6D4">
        <button onClick={() => { setOpen(o => !o); if(editingId){ setEditingId(null); setForm(blank); } }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
          {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {open ? "Cancel" : "Add info item"}
        </button>
        {open && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title" name="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Education" />
            <Field label="Icon Emoji" name="icon" value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} placeholder="🎓" />
            <Field label="Value" name="value" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} placeholder="Diploma in" />
            <Field label="Subtitle" name="sub" value={form.sub} onChange={(e) => setForm({...form, sub: e.target.value})} placeholder="Computer Engineering" />
            
            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div><p className="text-sm font-semibold text-white">Hide Item</p><p className="text-xs text-[#64748B] mt-0.5">Hides this item from the public site</p></div>
              <button type="button" onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))} className={`relative w-12 h-6 rounded-full transition-all border ${form.hidden ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]" : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-${form.hidden ? "red" : "emerald"}-400 shadow-md ${form.hidden ? "left-0.5" : "left-6"}`} />
              </button>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#2563EB] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> {editingId ? "Save Item" : "Add Item"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ─── About Me Tab ───────────────────────────────────────── */
function CVTab({ showToast }) {
  const { aboutMe, updateAboutMe } = useData();
  const [cvUrl, setCvUrl] = useState(aboutMe?.cv_url || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (aboutMe?.cv_url) setCvUrl(aboutMe.cv_url);
  }, [aboutMe]);

  const isDrive = cvUrl.includes("drive.google.com") || cvUrl.includes("docs.google.com");

  // Upload via /api/cv/upload (Google Drive) — XHR for real-time progress
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowed.includes(ext)) {
      showToast("Only PDF / DOC / DOCX files are allowed", "error");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);

    const token = sessionStorage.getItem("admin_token");
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    });

    xhr.addEventListener("load", () => {
      setUploading(false);
      setProgress(0);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setCvUrl(data.cv_url);
          showToast("✅ CV uploaded to Google Drive!", "success");
        } catch {
          showToast("Upload OK — please refresh", "error");
        }
      } else {
        let msg = "Upload failed";
        try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch {}
        showToast(msg, "error");
      }
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      setProgress(0);
      showToast("Network error — check backend is running", "error");
    });

    setUploading(true);
    setProgress(1);
    xhr.open("POST", `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cv/upload`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  };

  const saveManualUrl = async () => {
    if (!cvUrl.trim()) { showToast("Enter a URL or upload a file", "error"); return; }
    setSaving(true);
    const res = await updateAboutMe({ ...aboutMe, cv_url: cvUrl.trim() });
    setSaving(false);
    if (res.success) showToast("✅ CV URL saved!", "success");
    else showToast("Failed to save URL", "error");
  };

  if (!aboutMe) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6 relative">
      <SectionCard title="My CV / Resume" color="#2563EB">
        <div className="grid gap-6">

          {/* ── Status Card ─────────────────────────── */}
          {cvUrl ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">CV Active</p>
                  {isDrive && (
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.3)] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
                      ▲ Google Drive
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8] truncate">{cvUrl}</p>
              </div>
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cv/download`}
                download="Ankit_Das_CV_Resume.pdf"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.3)] text-[#2563EB] text-xs font-semibold hover:bg-[rgba(37,99,235,0.25)] transition-all shrink-0"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                Test Download
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)]">
              <X className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-[#94A3B8]">No CV uploaded yet — upload a PDF below.</p>
            </div>
          )}

          {/* ── Google Drive info banner ─────────────── */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.2)]">
            <div className="w-9 h-9 rounded-xl bg-[rgba(37,99,235,0.15)] flex items-center justify-center shrink-0 text-base">
              ▲
            </div>
            <div>
              <p className="text-xs font-semibold text-[#60A5FA] mb-1">Powered by Google Drive</p>
              <p className="text-xs text-[#475569] leading-relaxed">
                CV is uploaded to <strong className="text-[#94A3B8]">your Google Drive</strong> using the same Gmail OAuth credentials in your{" "}
                <code className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#60A5FA] text-[10px]">.env</code>.
                The file is made public so anyone can download it. No extra setup required.
              </p>
            </div>
          </div>

          {/* ── Upload Zone ──────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 block">
              Upload CV / Resume (PDF · DOC · DOCX)
            </label>
            <label
              htmlFor="cv-file-input"
              className={`relative flex flex-col items-center justify-center gap-3 w-full h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
                uploading
                  ? "border-[#2563EB] bg-[rgba(37,99,235,0.08)]"
                  : "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(37,99,235,0.5)] hover:bg-[rgba(37,99,235,0.04)]"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-9 h-9 text-[#2563EB] animate-spin" />
                  <div className="w-52 h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#2563EB] font-semibold">{progress}% — Uploading to Google Drive…</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(37,99,235,0.12)] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-semibold text-[#94A3B8]">Click to choose your CV file</p>
                    <p className="text-xs text-[#475569] mt-1">
                      PDF / DOC / DOCX · Max 50 MB · Downloads as{" "}
                      <span className="text-[#2563EB] font-medium">Ankit_Das_CV_Resume.pdf</span>
                    </p>
                  </div>
                </>
              )}
              <input
                id="cv-file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* ── Manual URL ───────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">
              Or paste a Google Drive shareable link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/xxxxxx/view?usp=sharing"
                className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] text-sm transition-all"
              />
              <button
                onClick={saveManualUrl}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.3)] text-[#2563EB] font-semibold text-sm hover:bg-[rgba(37,99,235,0.25)] transition-all disabled:opacity-60 shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save URL
              </button>
            </div>
          </div>

          {/* ── Footer note ──────────────────────────── */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <Info className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />
            <p className="text-xs text-[#475569] leading-relaxed">
              Every download is served through your backend — the filename is always{" "}
              <strong className="text-[#2563EB]">Ankit_Das_CV_Resume.pdf</strong> on all devices (mobile &amp; desktop). No CDN restrictions.
            </p>
          </div>

        </div>
      </SectionCard>
    </div>
  );
}
function AboutMeTab({ showToast }) {
  const { aboutMe, updateAboutMe } = useData();
  const [form, setForm] = useState(aboutMe || {});
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState({
    learning: JSON.stringify(aboutMe?.learning_data || [], null, 2),
    stats: JSON.stringify(aboutMe?.stats_data || [], null, 2)
  });

  useEffect(() => {
    if (aboutMe && !form.id) {
      setForm(aboutMe);
      setJsonText({
        learning: JSON.stringify(aboutMe.learning_data || [], null, 2),
        stats: JSON.stringify(aboutMe.stats_data || [], null, 2)
      });
    }
  }, [aboutMe]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setLoading(true);
    const res = await updateAboutMe(form);
    setLoading(false);
    if (res.success) showToast("About Me updated successfully!");
    else showToast("Failed to update", "error");
  };

  if (!aboutMe) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6 relative">
      <SectionCard title="General Info" color="#A855F7">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">Portrait Image</label>
            <div className="flex items-center gap-4">
              {form.portrait_image && (
                <img src={form.portrait_image} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-[rgba(255,255,255,0.1)]" />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  name="portrait_image"
                  value={form.portrait_image || ""}
                  onChange={handleChange}
                  placeholder="Image URL or upload below..."
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[#A855F7] text-sm mb-2"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if(!file) return;
                    try {
                      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
                      const compressedFile = await imageCompression(file, options);
                      const reader = new FileReader();
                      reader.readAsDataURL(compressedFile);
                      reader.onloadend = () => setForm({ ...form, portrait_image: reader.result });
                    } catch(err) {
                      showToast("Error compressing image", "error");
                    }
                  }}
                  className="text-xs text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgba(168,85,247,0.1)] file:text-[#A855F7] hover:file:bg-[rgba(168,85,247,0.2)]"
                />
              </div>
            </div>
          </div>
          <Field label="Journey Title" name="journey_title" value={form.journey_title || ""} onChange={handleChange} placeholder="My Journey" />
          <div className="sm:col-span-2">
            <Field label="Journey Text" name="journey_text" value={form.journey_text || ""} onChange={handleChange} type="textarea" />
          </div>
          <Field label="Lightbulb Title" name="lightbulb_title" value={form.lightbulb_title || ""} onChange={handleChange} />
          <Field label="Lightbulb Subtitle (HTML allowed)" name="lightbulb_subtitle" value={form.lightbulb_subtitle || ""} onChange={handleChange} />
        </div>
      </SectionCard>

      <SectionCard title="What I Do" color="#00BFFF">
        <div className="mb-4">
          <Field label="Section Title" name="what_i_do_title" value={form.what_i_do_title || ""} onChange={handleChange} placeholder="What I Do" />
        </div>
        <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">List Items (One per line)</label>
        <textarea
          value={(form.what_i_do || []).join('\n')}
          onChange={(e) => setForm({ ...form, what_i_do: e.target.value.split('\n') })}
          className="w-full h-32 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm focus:outline-none focus:border-[rgba(0,191,255,0.5)]"
        />
      </SectionCard>

      <SectionCard title={`Learning Data (${(form.learning_data || []).length})`} color="#10B981">
        <div className="space-y-3">
          {(form.learning_data || []).map((item, idx) => (
            <div key={idx} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${item.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={item.name}
                    onChange={(e) => {
                      const copy = [...(form.learning_data || [])];
                      copy[idx].name = e.target.value;
                      setForm({ ...form, learning_data: copy });
                    }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#10B981] text-sm font-semibold text-white outline-none flex-1"
                  />
                  {item.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden relative group">
                    <div className="h-full bg-[#10B981] transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                  <input
                    type="number"
                    min="0" max="100"
                    value={item.progress}
                    onChange={(e) => {
                      const copy = [...(form.learning_data || [])];
                      copy[idx].progress = parseInt(e.target.value) || 0;
                      setForm({ ...form, learning_data: copy });
                    }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#10B981] text-xs text-[#64748B] font-mono outline-none w-12 text-center"
                  />
                  <span className="text-xs text-[#64748B]">%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <VisibilityBtn hidden={item.hidden} onClick={() => {
                  const copy = [...(form.learning_data || [])];
                  copy[idx].hidden = !copy[idx].hidden;
                  setForm({ ...form, learning_data: copy });
                }} />
                <DeleteBtn onClick={() => {
                  if(window.confirm("Remove this item?")) {
                    const copy = [...(form.learning_data || [])];
                    copy.splice(idx, 1);
                    setForm({ ...form, learning_data: copy });
                  }
                }} />
              </div>
            </div>
          ))}
          {(!form.learning_data || form.learning_data.length === 0) && <p className="text-center text-[#475569] text-sm py-4">No learning items.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-[#10B981]"/> Add Learning Item</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" id="learn_name" placeholder="Skill Name (e.g. React)" className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#10B981]" />
            <input type="number" id="learn_prog" placeholder="Progress % (e.g. 80)" min="0" max="100" className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#10B981]" />
            <button type="button" onClick={() => {
              const n = document.getElementById('learn_name');
              const p = document.getElementById('learn_prog');
              if(!n.value || !p.value) return;
              const copy = [...(form.learning_data || [])];
              copy.push({ name: n.value, progress: parseInt(p.value, 10) });
              setForm({ ...form, learning_data: copy });
              n.value = ""; p.value = "";
            }} className="flex items-center justify-center px-4 py-2 rounded-lg bg-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.3)] transition-colors"><Plus className="w-4 h-4"/></button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={`Terminal Lines (${(form.terminal_data || []).length})`} color="#2563EB">
        <div className="space-y-3">
          {(form.terminal_data || []).map((item, idx) => (
            <div key={idx} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${item.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  value={item.icon}
                  onChange={(e) => {
                    const copy = [...(form.terminal_data || [])];
                    copy[idx].icon = e.target.value;
                    setForm({ ...form, terminal_data: copy });
                  }}
                  className="w-16 text-sm flex-shrink-0 text-[#A855F7] font-mono bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#A855F7] outline-none text-center"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const copy = [...(form.terminal_data || [])];
                        copy[idx].label = e.target.value;
                        setForm({ ...form, terminal_data: copy });
                      }}
                      className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#A855F7] text-sm font-semibold text-white outline-none w-full"
                    />
                    {item.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                  <input
                    value={item.value}
                    onChange={(e) => {
                      const copy = [...(form.terminal_data || [])];
                      copy[idx].value = e.target.value;
                      setForm({ ...form, terminal_data: copy });
                    }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#A855F7] text-xs text-[#64748B] font-mono outline-none w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <VisibilityBtn hidden={item.hidden} onClick={() => {
                  const copy = [...(form.terminal_data || [])];
                  copy[idx].hidden = !copy[idx].hidden;
                  setForm({ ...form, terminal_data: copy });
                }} />
                <DeleteBtn onClick={() => {
                  if(window.confirm("Remove this line?")) {
                    const copy = [...(form.terminal_data || [])];
                    copy.splice(idx, 1);
                    setForm({ ...form, terminal_data: copy });
                  }
                }} />
              </div>
            </div>
          ))}
          {(!form.terminal_data || form.terminal_data.length === 0) && <p className="text-center text-[#475569] text-sm py-4">No terminal lines.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-[#A855F7]"/> Add Terminal Line</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" id="term_icon" placeholder="Icon (e.g. MapPin)" className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#2563EB]" />
            <input type="text" id="term_label" placeholder="Label (e.g. Location)" className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#2563EB]" />
            <input type="text" id="term_value" placeholder="Value (e.g. India)" className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#2563EB]" />
            <button type="button" onClick={() => {
              const i = document.getElementById('term_icon');
              const l = document.getElementById('term_label');
              const v = document.getElementById('term_value');
              if(!l.value || !v.value) return;
              const copy = [...(form.terminal_data || [])];
              copy.push({ icon: i.value || "Circle", label: l.value, value: v.value, hidden: false });
              setForm({ ...form, terminal_data: copy });
              i.value = ""; l.value = ""; v.value = "";
            }} className="flex items-center justify-center px-4 py-2 rounded-lg bg-[rgba(37,99,235,0.2)] text-[#38BDF8] hover:bg-[rgba(37,99,235,0.3)] transition-colors"><Plus className="w-4 h-4"/></button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={`Stats Data (${(form.stats_data || []).length})`} color="#F59E0B">
        <div className="space-y-3">
          {(form.stats_data || []).map((item, idx) => (
            <div key={idx} className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${item.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  value={item.icon}
                  onChange={(e) => {
                    const copy = [...(form.stats_data || [])];
                    copy[idx].icon = e.target.value;
                    setForm({ ...form, stats_data: copy });
                  }}
                  className="w-16 text-sm flex-shrink-0 text-[#F59E0B] font-mono bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#F59E0B] outline-none text-center"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const copy = [...(form.stats_data || [])];
                        copy[idx].label = e.target.value;
                        setForm({ ...form, stats_data: copy });
                      }}
                      className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#F59E0B] text-sm font-semibold text-white outline-none w-full"
                    />
                    {item.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                  <input
                    value={item.value}
                    onChange={(e) => {
                      const copy = [...(form.stats_data || [])];
                      copy[idx].value = e.target.value;
                      setForm({ ...form, stats_data: copy });
                    }}
                    className="bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#F59E0B] text-xs text-[#64748B] font-mono outline-none w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <VisibilityBtn hidden={item.hidden} onClick={() => {
                  const copy = [...(form.stats_data || [])];
                  copy[idx].hidden = !copy[idx].hidden;
                  setForm({ ...form, stats_data: copy });
                }} />
                <DeleteBtn onClick={() => {
                  if(window.confirm("Remove this stat?")) {
                    const copy = [...(form.stats_data || [])];
                    copy.splice(idx, 1);
                    setForm({ ...form, stats_data: copy });
                  }
                }} />
              </div>
            </div>
          ))}
          {(!form.stats_data || form.stats_data.length === 0) && <p className="text-center text-[#475569] text-sm py-4">No stats items.</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-[#F59E0B]"/> Add Stat Item</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" id="stat_icon" placeholder="Icon (e.g. Code2)" className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#F59E0B]" />
            <input type="text" id="stat_label" placeholder="Label (e.g. Projects)" className="w-full sm:w-1/4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#F59E0B]" />
            <input type="text" id="stat_value" placeholder="Value (e.g. 12+)" className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:outline-none focus:border-[#F59E0B]" />
            <button type="button" onClick={() => {
              const i = document.getElementById('stat_icon');
              const l = document.getElementById('stat_label');
              const v = document.getElementById('stat_value');
              if(!l.value || !v.value) return;
              const copy = [...(form.stats_data || [])];
              copy.push({ icon: i.value || "Circle", label: l.value, value: v.value });
              setForm({ ...form, stats_data: copy });
              i.value = ""; l.value = ""; v.value = "";
            }} className="flex items-center justify-center px-4 py-2 rounded-lg bg-[rgba(245,158,11,0.2)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.3)] transition-colors"><Plus className="w-4 h-4"/></button>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end sticky bottom-6 z-50">
        <button onClick={save} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#2563EB] text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:opacity-90 transition-all">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save About Me
        </button>
      </div>
    </div>
  );
}

function FeaturedTab({ showToast }) {
  const { projects, setProjects, edit } = useData();

  const featuredProjects = projects.filter(p => Boolean(p.featured)).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
  const availableProjects = projects.filter(p => !p.featured);

  const toggleFeatured = async (project) => {
    const isNowFeatured = !project.featured;
    let newOrder = project.featured_order || 0;
    if (isNowFeatured) {
      const maxOrder = Math.max(0, ...featuredProjects.map(p => p.featured_order || 0));
      newOrder = maxOrder + 1;
    }
    const updated = { ...project, featured: isNowFeatured, featured_order: newOrder };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(isNowFeatured ? "★ Added to Home Page showcase!" : "Removed from Home Page (still in /projects page)", "success");
  };

  const moveOrder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featuredProjects.length - 1) return;

    const items = [...featuredProjects];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap their array positions
    const temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;

    // Reassign featured_order continuously from 1 to N
    const updatedItems = items.map((item, i) => ({ ...item, featured_order: i + 1 }));

    // Optimistic UI update
    setProjects(projects.map(p => {
      const updated = updatedItems.find(u => u.id === p.id);
      return updated ? updated : p;
    }));

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/featured/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updatedItems.map(i => ({ id: i.id, featured_order: i.featured_order })) })
      });
      if (res.ok) showToast("Order updated", "success");
      else showToast("Error updating order", "error");
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  // Directly set a featured project's number / position by typing a number
  const handleSetFeaturedOrder = async (fromIndex, targetOrder) => {
    const target = parseInt(targetOrder, 10);
    if (isNaN(target)) return;
    const clampedTarget = Math.max(1, Math.min(featuredProjects.length, target));
    const toIndex = clampedTarget - 1;
    if (fromIndex === toIndex) return;

    const items = [...featuredProjects];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    const updatedItems = items.map((item, i) => ({ ...item, featured_order: i + 1 }));

    setProjects(projects.map(p => {
      const updated = updatedItems.find(u => u.id === p.id);
      return updated ? updated : p;
    }));

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/featured/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updatedItems.map(i => ({ id: i.id, featured_order: i.featured_order })) })
      });
      if (res.ok) showToast(`Moved "${moved.title}" to Home Page #${clampedTarget}!`, "success");
      else showToast("Error updating order", "error");
    } catch (e) {
      showToast("Error updating order", "error");
    }
  };

  const handleToggleVisibility = async (project) => {
    const updated = { ...project, hidden: !project.hidden };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(updated.hidden ? "Project hidden from public." : "Project is now visible!", updated.hidden ? "warning" : "success");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SectionCard title="Home Page Featured Showcase" color="#F59E0B">
        <p className="text-xs text-[#94A3B8] mb-4">These projects appear in the "Featured Projects" section on your Home Page in this exact order.</p>
        <div className="space-y-3">
          {featuredProjects.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveOrder(i, 'up')} disabled={i === 0} className="text-[#64748B] hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveOrder(i, 'down')} disabled={i === featuredProjects.length - 1} className="text-[#64748B] hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                </div>
                <div className="relative flex items-center shrink-0" title="Click to write/change Home Page position">
                  <span className="absolute left-2 text-[11px] font-bold text-[#F59E0B] pointer-events-none select-none">#</span>
                  <input
                    type="number"
                    min="1"
                    max={featuredProjects.length}
                    defaultValue={i + 1}
                    key={`feat-num-${p.id}-${i + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== i + 1) {
                        handleSetFeaturedOrder(i, val);
                      } else {
                        e.target.value = i + 1;
                      }
                    }}
                    className="w-12 h-8 pl-4 pr-1 text-center rounded-lg bg-[rgba(245,158,11,0.12)] hover:bg-[rgba(245,158,11,0.22)] focus:bg-[rgba(245,158,11,0.3)] border border-[rgba(245,158,11,0.3)] focus:border-[#F59E0B] text-[#F59E0B] focus:text-white font-mono font-bold text-xs outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  {p.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400 font-bold">HIDDEN</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VisibilityBtn hidden={p.hidden} onClick={() => handleToggleVisibility(p)} />
                <button onClick={() => toggleFeatured(p)} className="p-2 rounded-lg bg-[rgba(245,158,11,0.1)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.2)]" title="Remove from Home Page">
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
          {featuredProjects.length === 0 && <p className="text-sm text-[#475569] text-center py-4">No projects on the Home Page yet. Click the star on any project on the right to add it.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Other Projects (In /projects page only)" color="#38BDF8">
        <p className="text-xs text-[#94A3B8] mb-4">Click the star to add a project to the Home Page showcase.</p>
        <div className="space-y-3">
          {availableProjects.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="text-sm font-bold text-white">{p.title}</p>
                <p className="text-xs text-[#64748B] truncate max-w-[200px]">{Array.isArray(p.tech) ? p.tech.join(", ") : p.tech}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400 font-bold">HIDDEN</span>}
                <button onClick={() => toggleFeatured(p)} className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(245,158,11,0.15)] hover:text-amber-400" title="Add to Home Page">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {availableProjects.length === 0 && <p className="text-sm text-[#475569] text-center py-4">All projects are currently shown on the Home Page!</p>}
        </div>
      </SectionCard>
    </div>
  );
}

function ProposalsTab({ showToast }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/proposals`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProposal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/proposals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProposals(proposals.filter(p => p.id !== id));
        if (selected?.id === id) setSelected(null);
        showToast("Proposal deleted successfully");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete proposal", "error");
    }
  };

  if (loading) return <div className="text-[#94A3B8] p-4 text-center">Loading proposals...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <SectionCard title={`Proposals (${proposals.length})`} color="#06B6D4">
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {proposals.length === 0 && <p className="text-xs text-[#64748B] text-center py-4">No proposals yet.</p>}
            {proposals.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelected(p)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${selected?.id === p.id ? 'bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.3)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'}`}
              >
                <h4 className="text-sm font-bold text-white truncate">{p.project_title}</h4>
                <p className="text-xs text-[#94A3B8] truncate">{p.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-[#64748B]">{new Date(p.created_at).toLocaleDateString()}</span>
                  {p.file_path && <FileText className="w-3 h-3 text-[#06B6D4]" />}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-2">
        <SectionCard title="Proposal Details" color="#A855F7">
          {selected ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-space font-bold text-white mb-1">{selected.project_title}</h2>
                  <p className="text-sm text-[#94A3B8]">Submitted on {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteProposal(selected.id)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm text-white">{selected.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[#06B6D4] hover:underline">{selected.email}</a>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-white">{selected.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm text-white">{selected.address}</p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-3">Project Details</p>
                <div className="text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                  {selected.project_details}
                </div>
              </div>

              {selected.file_path && (
                <div className="p-5 rounded-xl bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.2)]">
                  <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#06B6D4]" />
                    Attached Document(s)
                  </p>
                  <div className="space-y-2">
                    {(() => {
                      let files = [];
                      try {
                        files = JSON.parse(selected.file_path);
                      } catch {
                        files = [selected.file_path];
                      }
                      return files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
                          <span className="text-sm text-[#94A3B8] truncate max-w-[200px] sm:max-w-sm">
                            {f.split('-').pop()}
                          </span>
                          <a 
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${f}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-[rgba(6,182,212,0.15)] text-[#06B6D4] text-xs font-bold hover:bg-[rgba(6,182,212,0.25)] transition-colors whitespace-nowrap"
                          >
                            View / Download
                          </a>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-[#475569] mb-3 opacity-50" />
              <p className="text-sm text-[#94A3B8]">Select a proposal from the list to view details.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function MessagesTab({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        if (selected?.id === id) setSelected(null);
        showToast("Message deleted successfully");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete message", "error");
    }
  };

  if (loading) return <div className="text-[#94A3B8] p-4 text-center">Loading messages...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <SectionCard title={`Messages (${messages.length})`} color="#3B82F6">
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 && <p className="text-xs text-[#64748B] text-center py-4">No messages yet.</p>}
            {messages.map(m => (
              <div 
                key={m.id} 
                onClick={() => setSelected(m)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${selected?.id === m.id ? 'bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.3)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'}`}
              >
                <h4 className="text-sm font-bold text-white truncate">{m.subject}</h4>
                <p className="text-xs text-[#94A3B8] truncate">{m.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-[#64748B]">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-2">
        <SectionCard title="Message Details" color="#EC4899">
          {selected ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-space font-bold text-white mb-1">{selected.subject}</h2>
                  <p className="text-sm text-[#94A3B8]">Sent on {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteMessage(selected.id)} className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#EC4899] uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm text-white">{selected.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] font-bold text-[#EC4899] uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-sm text-[#38BDF8] hover:underline">{selected.email}</a>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold text-[#EC4899] uppercase tracking-wider mb-3">Message</p>
                <div className="text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Mail className="w-12 h-12 text-[#475569] mb-3 opacity-50" />
              <p className="text-sm text-[#94A3B8]">Select a message from the list to view details.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── Education Tab ────────────────────────────────────────── */
function EducationTab({ showToast }) {
  const { education, updateEducation } = useData();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(education || {});

  useEffect(() => {
    if (education) {
      let migratedHighlights = education.highlights || [];
      if (!Array.isArray(migratedHighlights)) {
        migratedHighlights = [
          { label: "Current Level", value: migratedHighlights.currentLevel || "" },
          { label: "Stream", value: migratedHighlights.stream || "" },
          { label: "University/Board", value: migratedHighlights.board || "" },
          { label: "Year of Study", value: migratedHighlights.yearOfStudy || "" },
          { label: "CGPA / Percentage", value: migratedHighlights.cgpa || "" },
          { label: "Graduation Year", value: migratedHighlights.graduation || "" },
        ].filter(h => h.value); // keep only ones with values
      }
      
      setForm({ ...education, highlights: migratedHighlights });
    }
  }, [education]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setLoading(true);
    const res = await updateEducation(form);
    setLoading(false);
    if (res.success) showToast("Education updated successfully!");
    else showToast("Failed to update", "error");
  };

  if (!education) return <div className="text-white">Loading...</div>;

  const highlightsArr = Array.isArray(form.highlights) ? form.highlights : [];

  return (
    <div className="space-y-6 relative">
      <SectionCard title="Quote & Intro" color="#8B5CF6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Quote Text" name="quote_text" value={form.quote_text || ""} onChange={handleChange} />
          <Field label="Quote Author" name="quote_author" value={form.quote_author || ""} onChange={handleChange} />
        </div>
      </SectionCard>

      <SectionCard title={`Education Highlights (${highlightsArr.length})`} color="#06B6D4">
        <div className="space-y-3">
          {highlightsArr.map((hl, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-[rgba(255,255,255,0.02)] p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
              <input value={hl.label} onChange={(e) => { const copy = [...form.highlights]; copy[idx].label = e.target.value; setForm({...form, highlights: copy}); }} className="flex-1 px-3 py-2 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.1)] focus:border-[#06B6D4] text-xs text-[#94A3B8] outline-none" placeholder="Label (e.g. Current Level)" />
              <input value={hl.value} onChange={(e) => { const copy = [...form.highlights]; copy[idx].value = e.target.value; setForm({...form, highlights: copy}); }} className="flex-1 px-3 py-2 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.1)] focus:border-[#06B6D4] text-xs text-white font-bold outline-none" placeholder="Value (e.g. Diploma)" />
              <button onClick={() => { const copy = [...form.highlights]; copy.splice(idx,1); setForm({...form, highlights: copy}); }} className="text-red-400 hover:text-red-300 p-2 bg-[rgba(239,68,68,0.1)] rounded"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          <button onClick={() => setForm({...form, highlights: [...highlightsArr, {label:"New Highlight", value:""}]})} className="w-full py-2.5 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] text-[#06B6D4] hover:bg-[rgba(6,182,212,0.15)] text-xs font-bold flex justify-center items-center gap-2 transition-colors"><Plus className="w-4 h-4"/> Add Highlight</button>
        </div>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title={`Subjects (${(form.subjects || []).length})`} color="#10B981">
          <div className="flex flex-wrap gap-2 mb-4">
            {(form.subjects || []).map((subject, idx) => (
              <span key={idx} className="flex items-center gap-1 bg-[rgba(16,185,129,0.1)] text-[#10B981] px-2 py-1 rounded-md text-xs border border-[rgba(16,185,129,0.2)]">
                {subject}
                <button onClick={() => {
                  const copy = [...form.subjects]; copy.splice(idx,1); setForm({...form, subjects: copy});
                }} className="hover:text-white transition-colors ml-1"><X className="w-3 h-3"/></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input id="new_subject" placeholder="New subject... (e.g. Data Structures 🌳)" className="flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-xs focus:border-[#10B981] outline-none transition-colors" onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = e.target.value.trim();
                if(v) { setForm({...form, subjects: [...(form.subjects||[]), v]}); e.target.value = ''; }
              }
            }} />
            <button onClick={() => {
              const el = document.getElementById('new_subject');
              const v = el.value.trim();
              if(v) { setForm({...form, subjects: [...(form.subjects||[]), v]}); el.value = ''; }
            }} className="px-3 py-2 bg-[rgba(16,185,129,0.2)] text-[#10B981] rounded-lg text-xs font-bold hover:bg-[rgba(16,185,129,0.3)] transition-colors"><Plus className="w-4 h-4"/></button>
          </div>
        </SectionCard>
        
        <SectionCard title={`Stats (${(form.stats || []).length})`} color="#EC4899">
          <div className="space-y-3">
            {(form.stats || []).map((stat, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-[rgba(255,255,255,0.02)] p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
                <input value={stat.icon} onChange={(e) => { const copy = [...form.stats]; copy[idx].icon = e.target.value; setForm({...form, stats: copy}); }} className="w-12 px-2 py-1.5 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.1)] focus:border-[#EC4899] text-xs text-center text-[#EC4899] font-mono outline-none" title="Icon (lucide name)" placeholder="icon" />
                <input value={stat.value} onChange={(e) => { const copy = [...form.stats]; copy[idx].value = e.target.value; setForm({...form, stats: copy}); }} className="w-16 px-2 py-1.5 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.1)] focus:border-[#EC4899] text-xs text-white font-bold outline-none" placeholder="10+" />
                <input value={stat.label} onChange={(e) => { const copy = [...form.stats]; copy[idx].label = e.target.value; setForm({...form, stats: copy}); }} className="flex-1 px-2 py-1.5 bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(255,255,255,0.1)] focus:border-[#EC4899] text-xs text-[#94A3B8] outline-none" placeholder="Projects" />
                <button onClick={() => { const copy = [...form.stats]; copy.splice(idx,1); setForm({...form, stats: copy}); }} className="text-red-400 hover:text-red-300 p-1 bg-[rgba(239,68,68,0.1)] rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
            <button onClick={() => setForm({...form, stats: [...(form.stats||[]), {icon:"star", value:"0", label:"New Stat"}]})} className="w-full py-2.5 rounded-lg bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.2)] text-[#EC4899] hover:bg-[rgba(236,72,153,0.15)] text-xs font-bold flex justify-center items-center gap-2 transition-colors"><Plus className="w-4 h-4"/> Add Stat</button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={`Timeline Events (${(form.timeline || []).length})`} color="#3B82F6">
        <div className="space-y-6">
          {(form.timeline || []).map((item, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] relative group">
              <button onClick={() => { if(window.confirm("Delete this event?")) { const copy = [...form.timeline]; copy.splice(idx,1); setForm({...form, timeline: copy}); } }} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(239,68,68,0.1)] p-1.5 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-5 pr-10">
                <div className="lg:col-span-2">
                  <Field label="Year" value={item.year} onChange={(e) => { const copy = [...form.timeline]; copy[idx].year = e.target.value; setForm({...form, timeline: copy}); }} placeholder="2024" />
                </div>
                <div className="lg:col-span-3">
                  <Field label="Title" value={item.title} onChange={(e) => { const copy = [...form.timeline]; copy[idx].title = e.target.value; setForm({...form, timeline: copy}); }} placeholder="Milestone Title" />
                </div>
                <div className="lg:col-span-3">
                  <Field label="Subtitle" value={item.subtitle} onChange={(e) => { const copy = [...form.timeline]; copy[idx].subtitle = e.target.value; setForm({...form, timeline: copy}); }} placeholder="Description..." />
                </div>
                <div className="lg:col-span-2">
                  <Field label="Icon" value={item.icon} onChange={(e) => { const copy = [...form.timeline]; copy[idx].icon = e.target.value; setForm({...form, timeline: copy}); }} placeholder="code" />
                </div>
                <div className="lg:col-span-2">
                  <ColorPickerControl
                    label="Color"
                    value={item.color || "#3B82F6"}
                    onChange={(newColor) => {
                      const copy = [...form.timeline];
                      copy[idx].color = newColor;
                      setForm({ ...form, timeline: copy });
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-lg border border-[rgba(255,255,255,0.03)]">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]"/> Achievements</p>
                <div className="space-y-2">
                  {(item.achievements || []).map((ach, aIdx) => (
                    <div key={aIdx} className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                      <input value={ach} onChange={(e) => {
                        const copy = [...form.timeline];
                        copy[idx].achievements[aIdx] = e.target.value;
                        setForm({...form, timeline: copy});
                      }} className="flex-1 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#E2E8F0] text-xs focus:border-[#3B82F6] outline-none transition-colors" placeholder="Achievement text..." />
                      <button onClick={() => {
                        const copy = [...form.timeline];
                        copy[idx].achievements.splice(aIdx, 1);
                        setForm({...form, timeline: copy});
                      }} className="text-red-400 hover:bg-[rgba(239,68,68,0.1)] p-1.5 rounded-md transition-colors"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const copy = [...form.timeline];
                    if(!copy[idx].achievements) copy[idx].achievements = [];
                    copy[idx].achievements.push("New achievement...");
                    setForm({...form, timeline: copy});
                  }} className="text-[11px] text-[#3B82F6] font-bold flex items-center gap-1.5 mt-3 hover:text-blue-400 bg-[rgba(59,130,246,0.1)] px-3 py-1.5 rounded-md w-fit transition-colors"><Plus className="w-3.5 h-3.5"/> Add Achievement</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setForm({...form, timeline: [...(form.timeline||[]), {id: Date.now(), year: "New Year", title: "New Milestone", subtitle: "Subtitle", icon: "star", color: "#3B82F6", achievements: []}]})} className="w-full py-4 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.15)] font-bold flex justify-center items-center gap-2 transition-colors"><Plus className="w-5 h-5"/> Add New Timeline Event</button>
        </div>
      </SectionCard>

      {/* Floating Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={save}
        disabled={loading}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-shadow disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {loading ? "Saving..." : "Save Changes"}
      </motion.button>
    </div>
  );
}

function ContactLinksTab({ showToast }) {
  const { contactLinks, setContactLinks } = useData();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ type: "", label: "", value: "", action: "", link: "", color: "#ffffff", glow: "rgba(255,255,255,0.3)", hidden: 0, sort_order: 0 });

  const resetForm = () => {
    setEditing(null);
    setFormData({ type: "", label: "", value: "", action: "", link: "", color: "#ffffff", glow: "rgba(255,255,255,0.3)", hidden: 0, sort_order: 0 });
  };

  const saveLink = async () => {
    try {
      if (editing) {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error();
        setContactLinks(prev => prev.map(l => l.id === editing.id ? { ...l, ...formData } : l));
        showToast("Link updated");
      } else {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setContactLinks(prev => [...prev, { ...formData, id: data.id }]);
        showToast("Link added");
      }
      resetForm();
    } catch (e) {
      showToast("Error saving link", "error");
    }
  };

  const deleteLink = async (id) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setContactLinks(prev => prev.filter(l => l.id !== id));
      showToast("Link deleted");
    } catch (e) {
      showToast("Error deleting link", "error");
    }
  };

  const toggleHide = async (link) => {
    try {
      const updated = { ...link, hidden: link.hidden ? 0 : 1 };
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error();
      setContactLinks(prev => prev.map(l => l.id === link.id ? updated : l));
      showToast(updated.hidden ? "Link hidden" : "Link visible");
    } catch (e) {
      showToast("Error updating visibility", "error");
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Contact Links" icon={Share2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {contactLinks && contactLinks.map((link) => (
              <div key={link.id} className={`p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between ${link.hidden ? 'opacity-50' : ''}`}>
                <div>
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: link.color }}></span>
                    <span className="text-[#7C3AED] font-mono bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded text-xs">#{link.sort_order}</span>
                    {link.label} ({link.type})
                  </h4>
                  <p className="text-[#94A3B8] text-xs mt-1">{link.value} <span className="mx-2">→</span> {link.link}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleHide(link)} className="p-2 bg-[rgba(255,255,255,0.05)] rounded hover:bg-[rgba(255,255,255,0.1)] text-[#94A3B8]" title={link.hidden ? "Show" : "Hide"}>
                    {link.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditing(link); setFormData(link); }} className="p-2 bg-[rgba(56,189,248,0.1)] text-[#38BDF8] rounded hover:bg-[rgba(56,189,248,0.2)]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="p-2 bg-[rgba(239,68,68,0.1)] text-red-400 rounded hover:bg-[rgba(239,68,68,0.2)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-5 rounded-xl h-fit">
            <h3 className="text-white font-bold mb-4 pb-2 border-b border-[rgba(255,255,255,0.1)]">
              {editing ? "Edit Link" : "Add New Link"}
            </h3>
            <div className="space-y-4">
              <Field label="Type (e.g. Email, GitHub, Facebook, X)" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} />
              <Field label="Label (e.g. GitHub)" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} />
              <Field label="Value (e.g. user@email.com)" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
              <Field label="Link URL (e.g. mailto:..., https://...)" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
              <Field label="Action Text (e.g. Visit Profile)" value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Color (Hex)" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                <Field label="Glow (rgba)" value={formData.glow} onChange={e => setFormData({ ...formData, glow: e.target.value })} />
              </div>
              <Field label="Display Order (e.g. 1, 2, 3)" type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
              <div className="flex gap-3 pt-2">
                <button onClick={saveLink} className="flex-1 bg-[#7C3AED] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#6D28D9] transition-colors flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> {editing ? "Update" : "Add"}
                </button>
                {editing && (
                  <button onClick={resetForm} className="px-4 bg-[rgba(255,255,255,0.05)] text-[#94A3B8] rounded-lg text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Main Admin Page ────────────────────────────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("admin_token"));
  const [tab, setTab] = useState("projects");
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const login = (token) => { 
    sessionStorage.setItem("admin_token", token); 
    setAuthed(true); 
  };
  
  const logout = () => { 
    sessionStorage.removeItem("admin_token"); 
    setAuthed(false); 
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handler = (e) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key) && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        const currentIndex = TABS.findIndex(t => t.id === tab);
        if (e.key === 'ArrowUp' && currentIndex > 0) setTab(TABS[currentIndex - 1].id);
        else if (e.key === 'ArrowDown' && currentIndex < TABS.length - 1) setTab(TABS[currentIndex + 1].id);
        return;
      }
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel') || b.innerText.includes('Close') || b.getAttribute('title') === 'Close');
        if (cancelBtn) cancelBtn.click();
        return;
      }
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save') || b.innerText.includes('Add Item') || b.innerText.includes('Add Skill') || b.innerText.includes('Add Project'));
        if (saveBtn) saveBtn.click();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tab]);

  if (!authed) return <LoginScreen onLogin={login} />;

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen bg-[#02050D] flex flex-col lg:flex-row">

      {/* ── Mobile Top Sticky Header ──────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-[rgba(5,10,20,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open sidebar menu"
            className="p-2 -ml-1 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(168,85,247,0.15)] hover:border-[rgba(168,85,247,0.3)] transition-all flex items-center gap-2"
          >
            <Menu className="w-5 h-5 text-[#A855F7]" />
            <span className="text-xs font-semibold text-slate-300 sm:inline">Menu</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-space font-bold text-white text-xs">Admin</span>
                <span className="text-[10px] text-[#A855F7] font-semibold bg-[rgba(168,85,247,0.12)] px-2 py-0.5 rounded-full border border-[rgba(168,85,247,0.25)] flex items-center gap-1">
                  {activeTab && <activeTab.icon className="w-3 h-3" />}
                  {activeTab?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] transition-all"
            title="View Live Portfolio"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Site</span>
          </a>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-red-400 hover:text-red-300 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer & Backdrop ──────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            />

            {/* Slide-out Sidebar Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[rgba(5,10,20,0.98)] backdrop-blur-2xl border-r border-[rgba(255,255,255,0.08)] z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-space font-bold text-white text-sm">Admin Panel</p>
                    <p className="text-[10px] text-[#A855F7] font-semibold tracking-wide">ANKIT.DEV</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs List */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto" data-lenis-prevent="true">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                  Navigation ({TABS.length} sections)
                </div>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setTab(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      tab === id
                        ? "bg-gradient-to-r from-[rgba(124,58,237,0.3)] to-[rgba(37,99,235,0.2)] text-white border border-[rgba(124,58,237,0.4)] shadow-sm"
                        : "text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${tab === id ? "text-[#A855F7]" : "text-[#64748B]"}`} />
                    <span className="flex-1 text-left">{label}</span>
                    {tab === id && <ChevronRight className="w-3.5 h-3.5 text-[#A855F7]" />}
                  </button>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-[rgba(255,255,255,0.06)] space-y-1">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-[#64748B]" />
                  <span>View Live Site</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-[rgba(239,68,68,0.1)] hover:text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 border-r border-[rgba(255,255,255,0.05)] bg-[rgba(5,10,20,0.9)] backdrop-blur-xl z-40"
      >
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-space font-bold text-white text-sm">Admin Panel</p>
              <p className="text-[10px] text-[#475569]">ANKIT.DEV</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" data-lenis-prevent="true">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === id
                  ? "bg-gradient-to-r from-[rgba(124,58,237,0.3)] to-[rgba(37,99,235,0.2)] text-white border border-[rgba(124,58,237,0.3)]"
                  : "text-[#64748B] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {tab === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-10 min-h-screen">

        {/* Mobile quick scroll pill bar with All Sections toggle */}
        <div className="flex lg:hidden items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar" data-lenis-prevent="true">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-[rgba(124,58,237,0.18)] border border-[rgba(124,58,237,0.35)] text-[#C084FC] hover:bg-[rgba(124,58,237,0.3)] transition-all flex-shrink-0 shadow-sm"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All Sections ({TABS.length})</span>
          </button>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                tab === id
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-sm shadow-purple-500/20"
                  : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            {activeTab && <activeTab.icon className="w-5 h-5 text-[#A855F7]" />}
            <h1 className="text-2xl font-space font-bold text-white">{activeTab?.label}</h1>
          </div>
          <p className="text-[#475569] text-sm">Manage your portfolio {activeTab?.label?.toLowerCase()} — changes save instantly.</p>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "quickinfo"    && <QuickInfoTab    showToast={showToast} />}
            {tab === "aboutme"      && <AboutMeTab      showToast={showToast} />}
            {tab === "cv"           && <CVTab           showToast={showToast} />}
            {tab === "education"    && <EducationTab    showToast={showToast} />}
            {tab === "skills"       && <SkillsTab       showToast={showToast} />}
            {tab === "projects"     && <ProjectsTab     showToast={showToast} />}
            {tab === "team_profiles" && <TeamProfilesTab showToast={showToast} />}
            {tab === "featured"     && <FeaturedTab     showToast={showToast} />}
            {tab === "categories"   && <CategoriesTab   showToast={showToast} />}
            {tab === "gallery"      && <GalleryTab      showToast={showToast} />}
            {tab === "certificates" && <CertificatesTab showToast={showToast} />}
            {tab === "testimonials" && <TestimonialsTab showToast={showToast} />}
            {tab === "blog"         && <BlogTab         showToast={showToast} />}
            {tab === "proposals"    && <ProposalsTab    showToast={showToast} />}
            {tab === "messages"     && <MessagesTab     showToast={showToast} />}
            {tab === "contact_links" && <ContactLinksTab showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
