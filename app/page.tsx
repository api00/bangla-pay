import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import CreatorShowcase from "@/components/landing/CreatorShowcase";
import Mission from "@/components/landing/Mission";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <CreatorShowcase />
        <Mission />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
