import SEO from "../components/SEO";
import Hero from "../sections/Hero";
import StatsBar from "../sections/StatsBar";
import About from "../sections/About";
import Skills from "../sections/Skills";
import Projects from "../sections/Projects";
import Gallery from "../sections/Gallery";
import Certificates from "../sections/Certificates";
import Blog from "../sections/Blog";
import Testimonials from "../sections/Testimonials";
import ContactCTA from "../sections/ContactCTA";
import Education from "../sections/Education";

export default function Home() {
  return (
    <main className="pb-24 lg:pb-0">
      <SEO />
      <Hero />
      <StatsBar />
      <About />
      <Education />
      <Skills />
      <Projects />
      <Gallery />
      <Certificates />
      <Blog />
      <Testimonials />
      <ContactCTA />
    </main>
  );
}
