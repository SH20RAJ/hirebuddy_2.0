import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Meet } from "@/components/landing/Meet";
import { Working } from "@/components/landing/Working";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Newsletter } from "@/components/landing/Newsletter";

import { Footer } from "@/components/landing/Footer";
import SignInPopup from "@/components/SignInPopup";

const Index = () => {
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if the URL has the signin parameter
    const params = new URLSearchParams(location.search);
    if (params.get("signin") === "true") {
      setIsSignInPopupOpen(true);
    }
  }, [location]);

  return (
    <main className="min-h-screen">
      <Header openSignIn={() => setIsSignInPopupOpen(true)} />
      <Hero />
      <div className="relative w-full min-h-[40vh] md:min-h-[70vh] lg:min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 -mt-4 lg:-mt-16">
        <div className="absolute inset-0 w-full h-full bg-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-transparent" />
        <img
          src="/hero-image.png"
          alt="Hero illustration"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
      <Problem />
      <Solution />
      <Meet />
      <Working />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Newsletter />
      <Footer />
      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={() => setIsSignInPopupOpen(false)}
      />
    </main>
  );
};

export default Index;
