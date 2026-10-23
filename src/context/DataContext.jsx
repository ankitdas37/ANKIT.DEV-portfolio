import { createContext, useContext, useState, useEffect } from "react";
import {
  projects as defaultProjects,
  achievementsGallery as defaultGallery,
  certificates as defaultCertificates,
  testimonials as defaultTestimonials,
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

const authFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("admin_token");
  const headers = { ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

export function DataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [categories, setCategories] = useState([]);
  const [gallery,      setGallery]      = useState(() => load(LS.gallery, []));
  const [certificates, setCertificates] = useState(() => load(LS.certificates, []));
  const [testimonials, setTestimonials] = useState(() => load(LS.testimonials, []));
  const [blogPosts,    setBlogPosts]    = useState(() => load(LS.blogPosts, []));
  const [loadingBlog,  setLoadingBlog]  = useState(true);

  useEffect(() => {
    if (certificates && certificates.length > 0) {
      save(LS.certificates, certificates);
    }
  }, [certificates]);

  useEffect(() => {
    if (blogPosts && blogPosts.length > 0) {
      save(LS.blogPosts, blogPosts);
    }
  }, [blogPosts]);
  const [infoItems,    setInfoItems]       = useState([]);
  const [aboutMe,      setAboutMe]         = useState(null);
  const [education,    setEducation]       = useState(null);
  const [skills,       setSkills]          = useState([]);
  const [loadingSkills, setLoadingSkills]  = useState(true);
  const [contactLinks, setContactLinks]    = useState([]);
  const [teamProfiles, setTeamProfiles]    = useState([]);
  const [loadingTeamProfiles, setLoadingTeamProfiles] = useState(true);

  // Fetch team profiles from MySQL backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/team-profiles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeamProfiles(data);
      })
      .catch(err => console.error("Error fetching team profiles:", err))
      .finally(() => setLoadingTeamProfiles(false));
  }, []);

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

  // Fetch gallery, certificates, testimonials, and blog posts from MySQL backend
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const [resGal, resCert, resTest, resBlog] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonials`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/blog`)
        ]);
        if (resGal.ok) { const d = await resGal.json(); if (Array.isArray(d)) setGallery(d); }
        if (resCert.ok) { const d = await resCert.json(); if (Array.isArray(d)) setCertificates(d.length > 0 ? d : load(LS.certificates, d)); }
        if (resTest.ok) { const d = await resTest.json(); if (Array.isArray(d)) setTestimonials(d); }
        if (resBlog.ok) {
          const d = await resBlog.json();
          if (Array.isArray(d)) {
            setBlogPosts(d);
            save(LS.blogPosts, d);
          }
        }
      } catch (err) {
        console.error("Error fetching dynamic sections:", err);
      } finally {
        setLoadingBlog(false);
      }
    };
    fetchSections();
  }, []);

  // Fetch info items and contact links from MySQL backend
  useEffect(() => {
    const fetchData = async () => {
      // Fetch info items
      try {
        const resInfo = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/info`);
        if (resInfo.ok) {
          const dataInfo = await resInfo.json();
          if (Array.isArray(dataInfo)) setInfoItems(dataInfo);
        }
      } catch (err) { console.error("Error fetching info:", err); }

      // Fetch contact links
      try {
        const resContact = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact-links`);
        if (resContact.ok) {
          const dataContact = await resContact.json();
          if (Array.isArray(dataContact)) setContactLinks(dataContact);
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
        if (Array.isArray(data)) setSkills(data);
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

  // Generic helpers
  const getApiType = (setList, explicitType) => {
    if (explicitType) return explicitType;
    if (setList === setGallery) return 'gallery';
    if (setList === setCertificates) return 'certificates';
    if (setList === setTestimonials) return 'testimonials';
    if (setList === setBlogPosts) return 'blog';
    if (setList === setProjects) return 'projects';
    if (setList === setTeamProfiles) return 'team-profiles';
    return null;
  };

  const remove = async (list, setList, id, type) => {
    const apiType = getApiType(setList, type);
    try {
      if (apiType) {
        await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/${apiType}/${id}`, { method: 'DELETE' });
      }
      setList(list.filter((item) => item.id !== id));
    } catch (err) { console.error(err); }
  };

  const add = async (list, setList, item, type) => {
    const apiType = getApiType(setList, type);
    try {
      if (apiType) {
        const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/${apiType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to add ${apiType}`);
        }
        const savedItem = await res.json();
        setList([savedItem, ...list]);
        return savedItem;
      } else {
        const newId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
        const newItem = { ...item, id: newId };
        setList([...list, newItem]);
        return newItem;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const edit = async (list, setList, id, updatedItem, type) => {
    const apiType = getApiType(setList, type);
    try {
      if (apiType) {
        const res = await authFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/${apiType}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to update ${apiType}`);
        }
        const savedItem = await res.json();
        setList(list.map((item) => (item.id === id ? savedItem : item)));
        return savedItem;
      } else {
        const merged = { ...updatedItem, id };
        setList(list.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)));
        return merged;
      }
    } catch (err) {
      console.error(err);
      throw err;
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
        loadingBlog,
        infoItems,    setInfoItems,
        aboutMe,      updateAboutMe,
        education,    updateEducation,
        skills,       setSkills,
        loadingSkills, setLoadingSkills,
        contactLinks, setContactLinks,
        teamProfiles, setTeamProfiles,
        loadingTeamProfiles,
        remove, add, edit,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
