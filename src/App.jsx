import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import "./index.css";
import { DataProvider } from "./context/DataContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileDock from "./components/MobileDock";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";

const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const StartProjectPage = lazy(() => import("./pages/StartProjectPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostDetailPage = lazy(() => import("./pages/BlogPostDetailPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProjectDetailsPage = lazy(() => import("./pages/ProjectDetailsPage"));

import { Toaster } from "react-hot-toast";

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin";
  const isProjectDetails = pathname.startsWith("/project/");
  const isBlogDetails = pathname.startsWith("/blog/") && pathname !== "/blog";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#02050D] relative selection:bg-[rgba(124,58,237,0.3)] selection:text-white">

      {/* Ambient Background Glows — hidden on admin */}
      {!isAdmin && (
        <div 
          className="fixed inset-0 overflow-hidden pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(124, 58, 237, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 90% 90%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
              radial-gradient(circle at 70% 40%, rgba(236, 72, 153, 0.025) 0%, transparent 35%)
            `,
          }}
        />
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
        {!isAdmin && !isProjectDetails && !isBlogDetails && <Navbar />}
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
          </div>
        }>
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
        </Suspense>
        {!isAdmin && (
          <div className={isBlogDetails ? "lg:pl-72 xl:pl-80 xl:pr-80 2xl:pr-88" : ""}>
            <Footer />
          </div>
        )}
        {!isAdmin && !isProjectDetails && !isBlogDetails && <MobileDock />}
      </div>
    </div>
  );
}

const lenisOptions = {
  lerp: 0.08,             // Buttery smooth interpolation without sluggish delay
  duration: 1.2,          // Smooth momentum
  smoothWheel: true,      // Smooth mouse wheel
  wheelMultiplier: 0.95,  // Natural 1-to-1 feel
  touchMultiplier: 1.5,   // Smooth touch response
  infinite: false,
};

export default function App() {
  return (
    <DataProvider>
      <ReactLenis root options={lenisOptions}>
        <AppLayout />
      </ReactLenis>
    </DataProvider>
  );
}
