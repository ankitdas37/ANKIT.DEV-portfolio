import { Routes, Route, useLocation } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import "./index.css";
import { DataProvider } from "./context/DataContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import MobileDock from "./components/MobileDock";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import StartProjectPage from "./pages/StartProjectPage";
import BlogPage from "./pages/BlogPage";
import BlogPostDetailPage from "./pages/BlogPostDetailPage";
import AdminPage from "./pages/AdminPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";

import { Toaster } from "react-hot-toast";

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin";
  const isProjectDetails = pathname.startsWith("/project/");

  return (
    <div className="min-h-screen bg-[#02050D] relative selection:bg-[rgba(124,58,237,0.3)] selection:text-white">

      {/* Ambient Background Glows — hidden on admin */}
      {!isAdmin && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7C3AED] opacity-[0.03] blur-[100px] mix-blend-screen animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563EB] opacity-[0.03] blur-[100px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-[#EC4899] opacity-[0.02] blur-[120px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '4s' }} />
        </div>
      )}

      <div className="relative z-10">
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(7, 17, 31, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
            },
          }}
        />
        {!isAdmin && !isProjectDetails && <Navbar />}
        <ScrollToTop />
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/projects"     element={<ProjectsPage />} />
          <Route path="/project/:id"  element={<ProjectDetailsPage />} />
          <Route path="/contact"      element={<ContactPage />} />
          <Route path="/start-project"element={<StartProjectPage />} />
          <Route path="/blog"         element={<BlogPage />} />
          <Route path="/blog/:slug"   element={<BlogPostDetailPage />} />
          <Route path="/admin"        element={<AdminPage />} />
        </Routes>
        {!isAdmin && <Footer />}
        {!isAdmin && <BackToTop />}
        {!isAdmin && <MobileDock />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <ReactLenis root>
        <AppLayout />
      </ReactLenis>
    </DataProvider>
  );
}
