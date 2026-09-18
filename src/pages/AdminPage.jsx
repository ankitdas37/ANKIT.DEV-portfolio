import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LayoutDashboard, FolderGit2, Image, Award,
  MessageSquare, BookOpen, Plus, Trash2, LogOut,
  Eye, EyeOff, Save, Shield, ChevronRight, X, Edit2,
  UploadCloud, Loader2, Tags, ArrowLeft, Folder, Info, UserCircle, Cpu, Star, ArrowUp, ArrowDown, FileText, Mail, SplitSquareHorizontal, GraduationCap, CheckCircle2, Share2, DownloadCloud
} from "lucide-react";
import { useData } from "../context/DataContext";
import imageCompression from "browser-image-compression";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  { id: "featured",   label: "Featured",    icon: Star },
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
function Field({ label, name, value, onChange, type = "text", placeholder = "", rows = 3 }) {
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

  const handleFileChange = async (e) => {
    let files = Array.from(e.target.files);
    if (files.length === 0) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === 'your_cloud_name_here') {
      alert("Please set your Cloudinary Cloud Name in the .env file.");
      return;
    }

    setUploading(true);
    
    try {
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
          console.error("Upload error", result.reason);
          alert("Error uploading file: " + files[index].name + " - " + result.reason);
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
    }
  };

  return (
    <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.2)] transition-all cursor-pointer text-sm font-semibold">
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
      {uploading ? "Uploading..." : label}
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
  const { projects, setProjects, add, remove, edit, categories } = useData();
  const blank = { title: "", description: "", tech: "", github: "", demo: "", youtubeUrl: "", docsUrl: "", startDate: "", duration: "", color: "#7C3AED", image: "", logo: "", projectType: [], architecture: "", screenshots: [""], notes: [""], team: [], hidden: false, status: "", version: "", extraInfo: [] };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    const updatedItems = items.map((item, i) => ({ ...item, project_order: i + 1 }));

    // Optimistic UI update
    setProjects(updatedItems);

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updatedItems.map(i => ({ id: i.id, project_order: i.project_order })) })
      });
      if (res.ok) showToast("Project order updated!", "success");
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
    
    // Clean up empty array items before saving
    const cleanedForm = {
      ...form,
      tech: processedTech,
      screenshots: (form.screenshots || []).filter(s => s.trim()),
      notes: (form.notes || []).filter(n => n.trim()),
      team: (form.team || []).filter(t => t.name.trim()),
      image: form.screenshots?.[0] || form.image || "",
      logo: form.logo || "",
      hidden: form.hidden || false,
    };

    if (editingId) {
      edit(projects, setProjects, editingId, cleanedForm, 'projects');
      showToast("Project updated!", "success");
    } else {
      add(projects, setProjects, { ...cleanedForm, featured: true }, 'projects');
      showToast("Project added!", "success");
    }
    setForm(blank); setOpen(false); setEditingId(null);
  };

  const handleEditClick = (project) => {
    const rawNotes = project.notes?.length ? project.notes : [""];
    // Detect mode: if any note contains ## headings or multi-line rich content → rich mode
    const isRich = rawNotes.some(n => n.includes('##') || n.includes('\n'));
    setNotesMode(isRich ? "rich" : "rich"); // always start in rich mode for easier editing
    setForm({
      ...blank,
      ...project,
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""),
      projectType: Array.isArray(project.projectType) ? project.projectType : (project.projectType ? [project.projectType] : []),
      screenshots: project.screenshots?.length ? project.screenshots : [project.image || ""],
      notes: rawNotes,
      team: project.team || [],
      logo: project.logo || "",
      hidden: project.hidden || false,
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

  const visibleCount = projects.filter(p => !p.hidden).length;
  const hiddenCount  = projects.filter(p =>  p.hidden).length;

  return (
    <div className="space-y-6">
      <SectionCard title={`All Projects (${projects.length})`} color="#2563EB">
        {/* Live counters */}
        <div className="flex gap-4 mb-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-emerald-400 font-semibold">
            {visibleCount} visible
          </span>
          <span className="px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-amber-400 font-semibold">
            {hiddenCount} hidden
          </span>
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
                
                <div className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.1)] flex flex-shrink-0 items-center justify-center font-bold text-xs bg-[rgba(37,99,235,0.1)] text-[#38BDF8]">
                  #{i + 1}
                </div>

                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    {p.hidden && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold flex-shrink-0">HIDDEN</span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] truncate">{Array.isArray(p.tech) ? p.tech.join(", ") : p.tech}</p>
                </div>
              </div>
              <div className="flex gap-2">
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
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
              <Field label="Title *"       name="title"       value={form.title}       onChange={onChange} placeholder="My Awesome App" />
              <Field label="Color"          name="color"       value={form.color}       onChange={onChange} type="color" />
              
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
                Screenshots
                <div className="flex gap-2">
                  <CloudinaryUpload label="Bulk Upload" multiple={true} onUpload={(urls) => {
                    setForm(f => {
                      const current = (f.screenshots || []).filter(s => s.trim());
                      return { ...f, screenshots: [...current, ...urls] };
                    });
                  }} />
                  <button onClick={() => handleArrayAdd('screenshots', '')} className="text-xs text-[#38BDF8] hover:text-[#0EA5E9] flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add URL
                  </button>
                </div>
              </label>
              <div className="space-y-3">
                {(form.screenshots || []).map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {url && typeof url === 'string' && url.startsWith('http') && <img src={url} alt="" className="w-12 h-12 rounded object-cover border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]" />}
                    <div className="flex-1">
                      <input type="text" value={url} onChange={(e) => handleArrayUpdate('screenshots', idx, e.target.value)} placeholder={`Image URL ${idx + 1}`} className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-sm" />
                    </div>
                    <CloudinaryUpload onUpload={(newUrl) => handleArrayUpdate('screenshots', idx, newUrl)} />
                    {idx === 0 ? (
                      <div className="w-9 h-9 flex items-center justify-center text-[#64748B] text-xs">Hero</div>
                    ) : (
                      <button onClick={() => handleArrayRemove('screenshots', idx)} className="p-2.5 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)]">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
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
            <div className="sm:col-span-2 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(16,185,129,0.05)]">
              <label className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                Team Members
                <button onClick={() => handleArrayAdd('team', { name: '', role: '', photo: '', github: '', instagram: '', linkedin: '', email: '' })} className="text-xs text-[#10B981] hover:text-[#34D399] flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Member
                </button>
              </label>
              <div className="space-y-4">
                {(form.team || []).map((member, idx) => (
                  <div key={idx} className="flex flex-col gap-3 p-4 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] relative">
                    <button onClick={() => handleArrayRemove('team', idx)} className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
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
  const blank = { title: "", organization: "", date: "", color: "#10B981", category: "Programming", link: "", image: "", hidden: false, hours: "" };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleToggleVisibility = (cert) => {
    const updated = { ...cert, hidden: !cert.hidden };
    edit(certificates, setCertificates, cert.id, updated);
    showToast(updated.hidden ? "Certificate hidden." : "Certificate is visible!", updated.hidden ? "warning" : "success");
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const processedForm = {
      ...form,
      category: typeof form.category === "string" ? form.category.split(',').map(c => c.trim()).filter(Boolean) : form.category
    };

    if (editingId) {
      edit(certificates, setCertificates, editingId, processedForm);
      showToast("Certificate updated!", "success");
    } else {
      add(certificates, setCertificates, processedForm);
      showToast("Certificate added!", "success");
    }
    setForm(blank); setEditingId(null); setOpen(false);
  };

  const handleEdit = (c) => {
    setForm({ 
      title: c.title, 
      organization: c.organization, 
      date: c.date, 
      color: c.color || "#10B981", 
      category: Array.isArray(c.category) ? c.category.join(", ") : (c.category || ""), 
      link: c.link || "", 
      image: c.image || "", 
      hidden: c.hidden || false, 
      hours: c.hours || "" 
    });
    setEditingId(c.id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Certificates (${certificates.length})`} color="#10B981">
        <div className="space-y-3">
          {certificates.map((c) => (
            <div key={c.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${c.hidden ? "bg-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.15)] opacity-70" : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"}`}>
              <div className="flex items-center gap-3 min-w-0">
                {c.image ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.1)]">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                    {c.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                  </div>
                  <p className="text-xs text-[#64748B]">{c.organization} · {c.date}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <VisibilityBtn hidden={c.hidden} onClick={() => handleToggleVisibility(c)} />
                <EditBtn onClick={() => handleEdit(c)} />
                <DeleteBtn onClick={() => { remove(certificates, setCertificates, c.id); showToast("Certificate removed!", "error"); }} />
              </div>
            </div>
          ))}
          {certificates.length === 0 && <p className="text-center text-[#475569] text-sm py-6">No certificates.</p>}
        </div>
      </SectionCard>

      <SectionCard title={editingId ? "Edit Certificate" : "Add Certificate"} color="#06B6D4">
        <button onClick={() => { setOpen(o => !o); if(editingId){ setEditingId(null); setForm(blank); } }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
          {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {open ? "Cancel" : "Add certificate"}
        </button>
        {open && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Title *" name="title" value={form.title} onChange={onChange} placeholder="Responsive Web Design Certificate" />
            </div>
            <Field label="Organization" name="organization" value={form.organization} onChange={onChange} placeholder="freeCodeCamp" />
            <Field label="Date" name="date" value={form.date} onChange={onChange} placeholder="2025" />
            <Field label="Category" name="category" value={form.category} onChange={onChange} placeholder="Programming, Web Development" />
            <Field label="Color" name="color" value={form.color} onChange={onChange} type="color" />
            
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
              <Field label="Hours (e.g. 50)" name="hours" value={form.hours || ""} onChange={onChange} type="number" placeholder="50" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Image (Optional)</label>
                <div className="flex items-center gap-2">
                  <input type="text" name="image" value={form.image} onChange={onChange} placeholder="/src/assets/... (Optional)" className="flex-1 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm transition-all" />
                  <CloudinaryUpload onUpload={(url) => setForm(f => ({ ...f, image: url }))} />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Field label="Certificate URL" name="link" value={form.link} onChange={onChange} placeholder="https://freecodecamp.org/..." />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div><p className="text-sm font-semibold text-white">Hide Certificate</p><p className="text-xs text-[#64748B] mt-0.5">Hides this certificate from the public site</p></div>
              <button type="button" onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))} className={`relative w-12 h-6 rounded-full transition-all border ${form.hidden ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.4)]" : "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all bg-${form.hidden ? "red" : "emerald"}-400 shadow-md ${form.hidden ? "left-0.5" : "left-6"}`} />
              </button>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> {editingId ? "Save Certificate" : "Add Certificate"}
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
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" /> {editingId ? "Update" : "Add"} Testimonial
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function BlogTab({ showToast }) {
  const { blogPosts, setBlogPosts, add, remove } = useData();
  const blank = { title: "", excerpt: "", tag: "Tutorial", tagColor: "#10B981", readTime: "5 min read", date: "", emoji: "📝", slug: "", image: "" };
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    if (editingPostId) {
      const updated = blogPosts.map(p => p.id === editingPostId ? { ...p, ...form, slug } : p);
      setBlogPosts(updated);
      showToast("Blog post updated!");
    } else {
      add(blogPosts, setBlogPosts, { ...form, slug, content: [] });
      showToast("Blog post added!");
    }
    
    setForm(blank); setOpen(false); setEditingPostId(null);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Blog Posts (${blogPosts.length})`} color="#06B6D4">
        <div className="space-y-3">
          {[...blogPosts].sort((a, b) => {
            const orderA = parseInt(a.homeOrder) || 999;
            const orderB = parseInt(b.homeOrder) || 999;
            return orderA - orderB;
          }).map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
                p.hidden
                  ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-60"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0" style={{ filter: p.hidden ? 'grayscale(1)' : 'none' }}>{p.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    {p.hidden && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 border border-[rgba(245,158,11,0.2)] flex-shrink-0">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B]">{p.tag} · {p.date} · {p.readTime}</p>
                  {p.content && p.content.length > 0 && (
                    <p className="text-xs text-[#10B981] mt-0.5">{p.content.length} content blocks</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={p.homeOrder || ''}
                  onChange={(e) => {
                    const updated = blogPosts.map(post => post.id === p.id ? { ...post, homeOrder: parseInt(e.target.value) || 0 } : post);
                    setBlogPosts(updated);
                  }}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1.5 focus:border-[#A855F7] text-xs text-white outline-none cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  title="Home Page Position"
                >
                  <option value="" className="bg-[#0f172a] text-white">Auto Order</option>
                  <option value="1" className="bg-[#0f172a] text-white">1st (Featured)</option>
                  <option value="2" className="bg-[#0f172a] text-white">2nd</option>
                  <option value="3" className="bg-[#0f172a] text-white">3rd</option>
                  <option value="4" className="bg-[#0f172a] text-white">4th</option>
                  <option value="5" className="bg-[#0f172a] text-white">5th</option>
                  <option value="6" className="bg-[#0f172a] text-white">6th</option>
                </select>
                <button
                  onClick={() => {
                    const updated = blogPosts.map(post => post.id === p.id ? { ...post, showOnHome: !post.showOnHome } : post);
                    setBlogPosts(updated);
                    showToast(p.showOnHome ? "Removed from Home" : "Added to Home", "success");
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${p.showOnHome ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981]' : 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)]'}`}
                  title="Toggle display on Home Page"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setForm(p);
                    setEditingPostId(p.id);
                    setOpen(true);
                    setTimeout(() => {
                      document.getElementById("add-blog-form")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="p-1.5 rounded-lg text-[#06B6D4] hover:text-white hover:bg-[rgba(6,182,212,0.1)] transition-all"
                  title="Edit Metadata"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <VisibilityBtn
                  hidden={p.hidden}
                  onClick={() => {
                    const updated = blogPosts.map(post =>
                      post.id === p.id ? { ...post, hidden: !post.hidden } : post
                    );
                    setBlogPosts(updated);
                    showToast(p.hidden ? "Post is now visible!" : "Post hidden from blog.");
                  }}
                />
                <DeleteBtn onClick={() => { remove(blogPosts, setBlogPosts, p.id); showToast("Post removed!"); }} />
              </div>
            </div>
          ))}
          {blogPosts.length === 0 && <p className="text-center text-[#475569] text-sm py-6">No blog posts.</p>}
        </div>
      </SectionCard>

      <div id="add-blog-form">
        <SectionCard title={editingPostId ? "Edit Blog Post Info" : "Add Blog Post"} color="#7C3AED">
          <button onClick={() => {
            if (open && editingPostId) {
              setForm(blank);
              setEditingPostId(null);
              setOpen(false);
            } else {
              setOpen((o) => !o);
            }
          }} className="flex items-center gap-2 text-sm font-semibold text-[#A855F7] mb-4">
            {open ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {open ? "Cancel" : "Add post"}
          </button>
        {open && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Title *"   name="title"    value={form.title}    onChange={onChange} placeholder="My awesome article" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Excerpt"   name="excerpt"  value={form.excerpt}  onChange={onChange} type="textarea" placeholder="Short description..." />
            </div>
            <Field label="Tag"         name="tag"      value={form.tag}      onChange={onChange} placeholder="Tutorial" />
            <Field label="Tag Color"   name="tagColor" value={form.tagColor} onChange={onChange} type="color" />
            <div className="sm:col-span-2">
              <Field label="Cover Image URL (Optional)" name="image" value={form.image || ""} onChange={onChange} placeholder="https://example.com/image.jpg (leave blank to use Emoji)" />
            </div>
            <Field label="Emoji"       name="emoji"    value={form.emoji}    onChange={onChange} placeholder="📝" />
            <Field label="Read Time"   name="readTime" value={form.readTime} onChange={onChange} placeholder="5 min read" />
            <Field label="Date"        name="date"     value={form.date}     onChange={onChange} placeholder="Aug 2025" />
            <Field label="Slug (auto)" name="slug"     value={form.slug}     onChange={onChange} placeholder="my-awesome-article" />
            <div className="sm:col-span-2 flex justify-end">
              <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                {editingPostId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingPostId ? "Save Changes" : "Add Post"}
              </button>
            </div>
          </div>
        )}
        </SectionCard>
      </div>

      {/* Rich Content Editor */}
      <BlogContentEditor blogPosts={blogPosts} setBlogPosts={setBlogPosts} showToast={showToast} />
    </div>
  );
}

/* ─── Rich Blog Content Editor ───────────────────────────────── */
function BlogContentEditor({ blogPosts, setBlogPosts, showToast }) {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [addingType, setAddingType] = useState(null);
  const [newBlock, setNewBlock] = useState({});
  const [editingIdx, setEditingIdx] = useState(null);

  const selectedPost = blogPosts.find((p) => p.id === selectedPostId);

  const loadPost = (post) => {
    setSelectedPostId(post.id);
    setBlocks(post.content ? [...post.content] : []);
    setAddingType(null);
    setNewBlock({});
    setEditingIdx(null);
  };

  const saveBlocks = () => {
    const updated = blogPosts.map((p) =>
      p.id === selectedPostId ? { ...p, content: blocks } : p
    );
    setBlogPosts(updated);
    showToast("Content saved!");
  };

  const moveBlock = (idx, dir) => {
    const arr = [...blocks];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setBlocks(arr);
  };

  const deleteBlock = (idx) => {
    setBlocks((b) => b.filter((_, i) => i !== idx));
  };

  const openAdd = (type) => {
    if (type === "divider") {
      setBlocks((b) => [...b, { type: "divider" }]);
      return;
    }
    setAddingType(type);
    setEditingIdx(null);
    setNewBlock(
      type === "list"    ? { items: [""] } :
      type === "image"   ? { src: "", caption: "" } :
      type === "quote"   ? { text: "", author: "" } :
      type === "code"    ? { text: "", lang: "javascript" } :
      type === "richtext"? { html: "" } :
      { text: "" }
    );
  };

  const commitBlock = () => {
    if (!addingType) return;
    if ((addingType === "paragraph" || addingType === "heading" || addingType === "subheading" || addingType === "quote" || addingType === "code") && !newBlock.text?.trim()) return;
    if (addingType === "image" && !newBlock.src?.trim()) return;
    if (addingType === "list" && !(newBlock.items || []).some(i => i.trim())) return;
    if (addingType === "richtext" && !newBlock.html?.trim()) return;
    if (editingIdx !== null) {
      setBlocks(b => b.map((blk, i) => i === editingIdx ? { type: addingType, ...newBlock } : blk));
      setEditingIdx(null);
    } else {
      setBlocks((b) => [...b, { type: addingType, ...newBlock }]);
    }
    setAddingType(null);
    setNewBlock({});
  };

  const editBlock = (idx) => {
    const b = blocks[idx];
    setAddingType(b.type);
    setNewBlock(b);
    setEditingIdx(idx);
    setTimeout(() => {
      document.getElementById("content-editor-form")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const toggleHideBlock = (idx) => {
    setBlocks(b => b.map((blk, i) => i === idx ? { ...blk, hidden: !blk.hidden } : blk));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const comp = await import("browser-image-compression");
      const compressed = await comp.default(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true });
      const reader = new FileReader();
      reader.onload = (ev) => setNewBlock((nb) => ({ ...nb, src: ev.target.result }));
      reader.readAsDataURL(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => setNewBlock((nb) => ({ ...nb, src: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // Inline image upload handler for richtext editor
  const handleRichImageUpload = async (e, editorRef) => {
    const file = e.target.files[0];
    if (!file) return;
    let dataUrl;
    try {
      const comp = await import("browser-image-compression");
      const compressed = await comp.default(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true });
      dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(compressed); });
    } catch {
      dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(file); });
    }
    if (editorRef && editorRef.current) editorRef.current.focus();
    document.execCommand('insertImage', false, dataUrl);
    if (editorRef && editorRef.current) setNewBlock(nb => ({ ...nb, html: editorRef.current.innerHTML }));
  };

  const BLOCK_TYPES = [
    { type: "richtext",   label: "Rich Text",   icon: "Aa",  color: "#EC4899" },
    { type: "paragraph",  label: "Paragraph",   icon: "¶",   color: "#94A3B8" },
    { type: "heading",    label: "Heading",      icon: "H2",  color: "#A855F7" },
    { type: "subheading", label: "Subheading",   icon: "H3",  color: "#7C3AED" },
    { type: "image",      label: "Image",        icon: "🖼️",  color: "#10B981" },
    { type: "quote",      label: "Quote",        icon: "\u201c",  color: "#F59E0B" },
    { type: "code",       label: "Code Block",   icon: "</>", color: "#06B6D4" },
    { type: "list",       label: "Bullet List",  icon: "•",   color: "#2563EB" },
    { type: "divider",    label: "Divider",      icon: "—",   color: "#475569" },
  ];

  const blockIcon  = (type) => BLOCK_TYPES.find(b => b.type === type)?.icon  ?? "?";
  const blockColor = (type) => BLOCK_TYPES.find(b => b.type === type)?.color ?? "#94A3B8";

  return (
    <SectionCard title="📝 Blog Content Editor" color="#A855F7">
      {/* Post selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
          Select post to edit content
        </label>
        <div className="grid gap-2">
          {blogPosts.length === 0 && (
            <p className="text-sm text-[#475569] text-center py-4">No posts yet. Add a post above first.</p>
          )}
          {blogPosts.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPost(p)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                selectedPostId === p.id
                  ? "border-[rgba(168,85,247,0.5)] bg-[rgba(168,85,247,0.1)]"
                  : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(168,85,247,0.3)]"
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                <p className="text-xs text-[#64748B]">{p.content?.length ?? 0} blocks</p>
              </div>
              {selectedPostId === p.id && (
                <span className="text-xs text-[#A855F7] font-bold flex-shrink-0">Editing</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedPost && (
        <>
          {/* Content blocks list */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Content Blocks ({blocks.length})
              </p>
              <button
                onClick={saveBlocks}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Save className="w-3.5 h-3.5" /> Save Content
              </button>
            </div>

            {blocks.length === 0 && (
              <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] p-8 text-center">
                <p className="text-3xl mb-2">📄</p>
                <p className="text-sm text-[#475569]">No content blocks yet.</p>
                <p className="text-xs text-[#334155] mt-1">Add a "Rich Text" block to paste from ChatGPT / Word.</p>
              </div>
            )}

            <div className="space-y-2">
              {blocks.map((block, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    block.hidden 
                      ? "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-50 grayscale" 
                      : "border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]"
                  } ${editingIdx === idx ? "border-[rgba(6,182,212,0.5)] bg-[rgba(6,182,212,0.05)]" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                    style={{ background: `${blockColor(block.type)}18`, color: blockColor(block.type) }}
                  >
                    {blockIcon(block.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: blockColor(block.type) }}>
                      {block.type}
                    </p>
                    {block.type === "richtext" ? (
                      <div
                        className="text-xs text-[#94A3B8] line-clamp-2 rich-preview"
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                    ) : block.type === "image" ? (
                      <div className="flex items-center gap-2">
                        <img src={block.src} alt="" className="w-16 h-10 object-cover rounded-lg border border-[rgba(255,255,255,0.08)]" />
                        {block.caption && <p className="text-xs text-[#64748B] truncate">{block.caption}</p>}
                      </div>
                    ) : block.type === "list" ? (
                      <p className="text-xs text-[#94A3B8] truncate">{(block.items || []).join(" • ")}</p>
                    ) : block.type === "divider" ? (
                      <div className="h-px bg-[rgba(255,255,255,0.08)] my-1.5 w-full" />
                    ) : (
                      <p className="text-xs text-[#94A3B8] truncate max-w-xs">{block.text}</p>
                    )}
                  </div>
                  {block.link && (
                    <a
                      href={block.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#06B6D4] hover:text-white transition-colors truncate max-w-[180px]"
                    >
                      <span>🔗</span>
                      <span className="truncate">{block.linkLabel || block.link}</span>
                    </a>
                  )}

                  <div className="flex gap-1 flex-shrink-0">
                    <VisibilityBtn hidden={block.hidden} onClick={() => toggleHideBlock(idx)} />
                    <button onClick={() => editBlock(idx)} className="p-1.5 rounded-lg text-[#06B6D4] hover:text-white hover:bg-[rgba(6,182,212,0.1)] transition-all" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0}
                      className="p-1.5 rounded-lg text-[#475569] hover:text-white disabled:opacity-20 transition-colors" title="Move up">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}
                      className="p-1.5 rounded-lg text-[#475569] hover:text-white disabled:opacity-20 transition-colors" title="Move down">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteBlock(idx)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.1)] transition-all" title="Delete">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add block buttons */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Add Block</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BLOCK_TYPES.map(({ type, label, icon, color }) => (
                <button
                  key={type}
                  onClick={() => openAdd(type)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 text-center ${
                    addingType === type
                      ? "border-[rgba(168,85,247,0.5)] bg-[rgba(168,85,247,0.12)]"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.12)]"
                  } ${ type === "richtext" ? "col-span-1 sm:col-span-2" : "" }`}
                >
                  <span className="text-sm font-bold" style={{ color }}>{icon}</span>
                  <span className="text-[10px] text-[#64748B] leading-tight">{label}</span>
                  {type === "richtext" && <span className="text-[9px] text-[#475569]">Paste from ChatGPT / Word</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Block input form */}
          {addingType && (
            <div id="content-editor-form" className="rounded-xl border border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.05)] p-4 space-y-3">
              <p className="text-xs font-bold text-[#A855F7] uppercase tracking-widest mb-2">
                {editingIdx !== null ? "Edit" : "New"} {BLOCK_TYPES.find(b => b.type === addingType)?.label}
              </p>

              {/* ── RICH TEXT WYSIWYG EDITOR ── */}
              {addingType === "richtext" && (
                <RichTextEditor
                  value={newBlock.html || ""}
                  onChange={(html) => setNewBlock(nb => ({ ...nb, html }))}
                  handleRichImageUpload={handleRichImageUpload}
                />
              )}

              {(addingType === "paragraph" || addingType === "heading" || addingType === "subheading") && (
                <textarea
                  rows={addingType === "paragraph" ? 4 : 2}
                  placeholder={addingType === "paragraph" ? "Write your paragraph text..." : "Heading text..."}
                  value={newBlock.text || ""}
                  onChange={(e) => setNewBlock((nb) => ({ ...nb, text: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm resize-y"
                />
              )}

              {addingType === "image" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-[#94A3B8]">Upload Image</label>
                    <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-dashed border-[rgba(255,255,255,0.12)] text-[#64748B] text-sm cursor-pointer hover:border-[rgba(168,85,247,0.4)] hover:text-white transition-all">
                      <UploadCloud className="w-4 h-4" />
                      Click to upload image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {newBlock.src && (
                      <img src={newBlock.src} alt="preview" className="rounded-xl max-h-48 object-cover border border-[rgba(255,255,255,0.08)]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#94A3B8]">Or paste image URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={newBlock.src || ""}
                      onChange={(e) => setNewBlock((nb) => ({ ...nb, src: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={newBlock.caption || ""}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, caption: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm"
                  />
                </>
              )}

              {addingType === "quote" && (
                <>
                  <textarea
                    rows={3}
                    placeholder="Quote text..."
                    value={newBlock.text || ""}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, text: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm resize-y"
                  />
                  <input
                    type="text"
                    placeholder="Author (optional)"
                    value={newBlock.author || ""}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, author: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm"
                  />
                </>
              )}

              {addingType === "code" && (
                <>
                  <input
                    type="text"
                    placeholder="Language (e.g. javascript, python, css)"
                    value={newBlock.lang || ""}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, lang: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm font-mono"
                  />
                  <textarea
                    rows={6}
                    placeholder="Paste your code here..."
                    value={newBlock.text || ""}
                    onChange={(e) => setNewBlock((nb) => ({ ...nb, text: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-[#E2E8F0] placeholder:text-[#475569] focus:outline-none focus:border-[rgba(6,182,212,0.5)] text-sm font-mono resize-y"
                  />
                </>
              )}

              {addingType === "list" && (
                <div className="space-y-2">
                  {(newBlock.items || [""]).map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Item ${i + 1}`}
                        value={item}
                        onChange={(e) => {
                          const arr = [...(newBlock.items || [""])];
                          arr[i] = e.target.value;
                          setNewBlock((nb) => ({ ...nb, items: arr }));
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(168,85,247,0.5)] text-sm"
                      />
                      {(newBlock.items || []).length > 1 && (
                        <button
                          onClick={() => setNewBlock((nb) => ({ ...nb, items: nb.items.filter((_, j) => j !== i) }))}
                          className="p-2.5 rounded-xl text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewBlock((nb) => ({ ...nb, items: [...(nb.items || [""]), ""] }))}
                    className="text-xs text-[#A855F7] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
              )}

              {/* ── Optional Link Field (shown for all block types except divider) ── */}
              {addingType !== "divider" && (
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 space-y-2">
                  <p className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-widest flex items-center gap-1.5">
                    <span>🔗</span> Block Link <span className="text-[#475569] normal-case font-normal">(optional)</span>
                  </p>
                  <input
                    type="url"
                    placeholder="https://example.com — users click this to visit"
                    value={newBlock.link || ""}
                    onChange={(e) => setNewBlock(nb => ({ ...nb, link: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.15)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(6,182,212,0.4)] text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Link label (e.g. Read more, View demo, Source code)"
                    value={newBlock.linkLabel || ""}
                    onChange={(e) => setNewBlock(nb => ({ ...nb, linkLabel: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-white placeholder:text-[#475569] focus:outline-none focus:border-[rgba(6,182,212,0.4)] text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={commitBlock}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
                <button
                  onClick={() => { setAddingType(null); setNewBlock({}); }}
                  className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-[#64748B] text-xs font-semibold hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

/* ─── WYSIWYG Rich Text Editor ───────────────────────────────── */
import { useRef, useCallback } from "react";
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

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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
      const updatedItem = await res.json();
      setInfoItems(infoItems.map(i => i.id === item.id ? updatedItem : i));
      showToast(updatedItem.hidden ? "Info item hidden." : "Info item visible!", updatedItem.hidden ? "warning" : "success");
    } catch (err) {
      console.error(err);
      showToast("Error updating visibility", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info/${id}`, { method: 'DELETE' });
      setInfoItems(infoItems.filter(item => item.id !== id));
      showToast("Info item removed!", "error");
    } catch (err) {
      console.error(err);
      showToast("Error removing item", "error");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.value.trim()) return;
    try {
      if (editingId) {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const updatedItem = await res.json();
        setInfoItems(infoItems.map(item => item.id === editingId ? updatedItem : item));
        setEditingId(null);
        showToast("Info item updated!", "success");
      } else {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const newItem = await res.json();
        setInfoItems([...infoItems, newItem]);
        showToast("Info item added!", "success");
      }
      setForm(blank);
      setOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving item", "error");
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

  const featuredProjects = projects.filter(p => p.featured).sort((a, b) => a.featured_order - b.featured_order);
  const availableProjects = projects.filter(p => !p.featured);

  const toggleFeatured = async (project) => {
    const isNowFeatured = !project.featured;
    let newOrder = project.featured_order;
    if (isNowFeatured) {
      const maxOrder = Math.max(0, ...featuredProjects.map(p => p.featured_order));
      newOrder = maxOrder + 1;
    }
    const updated = { ...project, featured: isNowFeatured, featured_order: newOrder };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(isNowFeatured ? "Added to Featured" : "Removed from Featured", "success");
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

  const handleToggleVisibility = async (project) => {
    const updated = { ...project, hidden: !project.hidden };
    await edit(projects, setProjects, project.id, updated, 'projects');
    showToast(updated.hidden ? "Project hidden from public." : "Project is now visible!", updated.hidden ? "warning" : "success");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SectionCard title="Featured List (Frontpage)" color="#F59E0B">
        <p className="text-xs text-[#94A3B8] mb-4">These projects will appear on the Frontpage exactly in this order.</p>
        <div className="space-y-3">
          {featuredProjects.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(245,158,11,0.2)]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveOrder(i, 'up')} disabled={i === 0} className="text-[#64748B] hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                  <button onClick={() => moveOrder(i, 'down')} disabled={i === featuredProjects.length - 1} className="text-[#64748B] hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                </div>
                <div className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-xs bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">
                  #{i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  {p.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-amber-400 font-bold">HIDDEN</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VisibilityBtn hidden={p.hidden} onClick={() => handleToggleVisibility(p)} />
                <button onClick={() => toggleFeatured(p)} className="p-2 rounded-lg bg-[rgba(245,158,11,0.1)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.2)]" title="Remove from Featured">
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
          {featuredProjects.length === 0 && <p className="text-sm text-[#475569] text-center py-4">No featured projects yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Available Projects" color="#38BDF8">
        <p className="text-xs text-[#94A3B8] mb-4">Click the star to add a project to the featured list.</p>
        <div className="space-y-3">
          {availableProjects.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="text-sm font-bold text-white">{p.title}</p>
                <p className="text-xs text-[#64748B] truncate max-w-[200px]">{Array.isArray(p.tech) ? p.tech.join(", ") : p.tech}</p>
              </div>
              <button onClick={() => toggleFeatured(p)} className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.1)] hover:text-white" title="Add to Featured">
                <Star className="w-4 h-4" />
              </button>
            </div>
          ))}
          {availableProjects.length === 0 && <p className="text-sm text-[#475569] text-center py-4">All projects are featured!</p>}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 pr-10">
                <Field label="Year" value={item.year} onChange={(e) => { const copy = [...form.timeline]; copy[idx].year = e.target.value; setForm({...form, timeline: copy}); }} placeholder="2024" />
                <Field label="Title" value={item.title} onChange={(e) => { const copy = [...form.timeline]; copy[idx].title = e.target.value; setForm({...form, timeline: copy}); }} placeholder="Milestone Title" />
                <Field label="Subtitle" value={item.subtitle} onChange={(e) => { const copy = [...form.timeline]; copy[idx].subtitle = e.target.value; setForm({...form, timeline: copy}); }} placeholder="Description..." />
                <div className="flex gap-2">
                  <div className="flex-1"><Field label="Icon" value={item.icon} onChange={(e) => { const copy = [...form.timeline]; copy[idx].icon = e.target.value; setForm({...form, timeline: copy}); }} placeholder="rocket" /></div>
                  <div className="w-16"><Field label="Color" type="color" value={item.color} onChange={(e) => { const copy = [...form.timeline]; copy[idx].color = e.target.value; setForm({...form, timeline: copy}); }} /></div>
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
    <div className="min-h-screen bg-[#02050D] flex">

      {/* ── Sidebar ──────────────────────────────────────── */}
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
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 min-h-screen">

        {/* Mobile tab bar */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto pb-2" data-lenis-prevent="true">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white"
                  : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#64748B]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
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
