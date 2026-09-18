import { createContext, useContext, useState, useEffect } from "react";
import {
  projects as defaultProjects,
  achievementsGallery as defaultGallery,
  certificates as defaultCertificates,
  testimonials as defaultTestimonials,
  blogPosts as defaultBlogPosts,
} from "../data/portfolio";

const DataContext = createContext(null);

const LS = {
  projects:      "admin_projects",
  gallery:       "admin_gallery",
  certificates:  "admin_certificates",
  testimonials:  "admin_testimonials",
  blogPosts:     "admin_blogPosts",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function DataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [categories, setCategories] = useState([]);
  const [gallery,      setGalleryRaw]      = useState(() => load(LS.gallery,      defaultGallery));
  const [certificates, setCertificatesRaw] = useState(() => load(LS.certificates, defaultCertificates));
  const [testimonials, setTestimonialsRaw] = useState(() => load(LS.testimonials, defaultTestimonials));
  const [blogPosts,    setBlogPostsRaw]    = useState(() => load(LS.blogPosts,    defaultBlogPosts));
  const [infoItems,    setInfoItems]       = useState([]);
  const [aboutMe,      setAboutMe]         = useState(null);
  const [education,    setEducation]       = useState(null);
  const [skills,       setSkills]          = useState([]);
  const [loadingSkills, setLoadingSkills]  = useState(true);
  const [contactLinks, setContactLinks]    = useState([]);

  // Fetch projects from MySQL backend
  useEffect(() => {
    console.log("Fetching projects from API...");
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`)
      .then(res => {
        console.log("API Response Status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Projects received:", data);
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(err => console.error("Error fetching projects:", err))
      .finally(() => setLoadingProjects(false));
  }, []);

  // Fetch categories from MySQL backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch info items and contact links from MySQL backend
  useEffect(() => {
    const fetchData = async () => {
      // Fetch info items
      try {
        const resInfo = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info`);
        if (resInfo.ok) {
          const dataInfo = await resInfo.json();
          setInfoItems(dataInfo);
        }
      } catch (err) { console.error("Error fetching info:", err); }

      // Fetch contact links
      try {
        const resContact = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links`);
        if (resContact.ok) {
          const dataContact = await resContact.json();
          setContactLinks(dataContact);
        }
      } catch (err) { console.error("Error fetching contact links:", err); }
    };
    fetchData();
  }, []);

  // Fetch Skills
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/skills`)
      .then(res => res.json())
      .then(data => {
        setSkills(data);
        setLoadingSkills(false);
      })
      .catch(err => {
        console.error("Error fetching skills:", err);
        setLoadingSkills(false);
      });
  }, []);

  // Fetch about me from MySQL backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/about`)
      .then(res => res.json())
      .then(data => { setAboutMe(data); })
      .catch(err => console.error('Error fetching about me:', err));
  }, []);

  // Fetch education from MySQL backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/education`)
      .then(res => res.json())
      .then(data => { setEducation(data); })
      .catch(err => console.error('Error fetching education:', err));
  }, []);

  const authFetch = (url, options = {}) => {
    const token = sessionStorage.getItem("admin_token");
    const headers = { ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  // Add a new category
  const addCategory = async (name) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.status === 409) return { error: 'Category already exists' };
      const saved = await res.json();
      setCategories(prev => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Failed to create category' };
    }
  };

  // Delete a category
  const deleteCategory = async (id) => {
    try {
      await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${id}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  const setter = (key, setState) => (newValue) => {
    setState(newValue);
    save(key, newValue);
  };

  const setGallery      = setter(LS.gallery,      setGalleryRaw);
  const setCertificates = setter(LS.certificates, setCertificatesRaw);
  const setTestimonials = setter(LS.testimonials, setTestimonialsRaw);
  const setBlogPosts    = setter(LS.blogPosts,    setBlogPostsRaw);

  // Generic helpers
  const remove = async (list, setList, id, type) => {
    if (type === 'projects') {
      try {
        await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${id}`, { method: 'DELETE' });
        setList(list.filter((item) => item.id !== id));
      } catch (err) { console.error(err); }
    } else {
      setList(list.filter((item) => item.id !== id));
    }
  };

  const add = async (list, setList, item, type) => {
    if (type === 'projects') {
      try {
        const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        const savedItem = await res.json();
        setList([savedItem, ...list]);
      } catch (err) { console.error(err); }
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
      setList([...list, { ...item, id: newId }]);
    }
  };

  const edit = async (list, setList, id, updatedItem, type) => {
    if (type === 'projects') {
      try {
        const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        const savedItem = await res.json();
        setList(list.map((item) => (item.id === id ? savedItem : item)));
      } catch (err) { console.error(err); }
    } else {
      setList(list.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
    }
  };

  // Helper: Update About Me
  const updateAboutMe = async (updatedData) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setAboutMe(data);
      return { success: true };
    } catch (error) {
      console.error("Error updating about me:", error);
      return { error: "Failed to update about me" };
    }
  };
  // Helper: Update Education
  const updateEducation = async (updatedData) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/education`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setEducation(data);
      return { success: true };
    } catch (error) {
      console.error("Error updating education:", error);
      return { error: "Failed to update education" };
    }
  };


  return (
    <DataContext.Provider
      value={{
        projects,     setProjects,
        loadingProjects,
        categories,   addCategory, deleteCategory,
        gallery,      setGallery,
        certificates, setCertificates,
        testimonials, setTestimonials,
        blogPosts,    setBlogPosts,
        infoItems,    setInfoItems,
        aboutMe,      updateAboutMe,
        education,    updateEducation,
        skills,       setSkills,
        loadingSkills, setLoadingSkills,
        contactLinks, setContactLinks,
        remove, add, edit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
