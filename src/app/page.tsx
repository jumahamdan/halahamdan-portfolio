import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WordOfDay from "@/components/WordOfDay";
import About from "@/components/About";
import LearningTools from "@/components/LearningTools";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WordOfDay />
      <About />
      <LearningTools />
      <Contact />
      <Footer />
    </>
  );
}
