import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CashfreePaymentButton } from "@/components/ui/cashfree-payment-button";
import { CheckCircle, ArrowRight, Sparkles, Users, TrendingUp, Star, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SignInPopup from "@/components/SignInPopup";

const pricingData = [
  {
    tier: "Free Plan",
    description: "Perfect for getting started with your job search journey.",
    price: "₹0",
    period: "",
    features: [
      "AI Resume Builder",
      "Job Search & Filters",
      "ATS Resume Templates",
      "Community Support",
      "Application Status Tracking"
    ],
    imagePath: "/pricing/platinum.png",
    popular: false,
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
  },
  {
    tier: "Premium Plan",
    description: "For active job seekers aiming for more reach and tailored applications.",
    price: "₹149",
    period: "",
    features: [
      "Full Access to Job Board",
      "Hyper-Personalized Cold Emails",
      "Follow-up Emails and tracker",
      "Access to Exclusive Job Openings",
      "Unlimited Job Applications",
      "24/7 Premium Support",
      "All the free features",
    ],
    imagePath: "/pricing/gold.png",
    popular: true,
    buttonText: "Subscribe to Premium",
    buttonVariant: "default" as const,
  },
];

const comparisonFeatures = [
  { feature: "AI Resume Builder", free: true, premium: true },
  { feature: "Job Search & Filters", free: true, premium: true },
  { feature: "ATS Resume Templates", free: true, premium: true },
  { feature: "Community Support", free: true, premium: true },
  { feature: "Application Status Tracking", free: true, premium: true },
  { feature: "Full Access to Job Board", free: false, premium: true },
  { feature: "Hyper-Personalized Cold Emails", free: false, premium: true },
  { feature: "Follow-up Emails and Tracker", free: false, premium: true },
  { feature: "Access to Exclusive Job Openings", free: false, premium: true },
  { feature: "Unlimited Job Applications", free: false, premium: true },
  { feature: "24/7 Premium Support", free: false, premium: true },
];

const stats = [
  { icon: Users, value: "50K+", label: "Job seekers helped" },
  { icon: TrendingUp, value: "3x", label: "Faster job placement" },
  { icon: Star, value: "4.9/5", label: "User satisfaction" }
];

const benefits = [
  "No credit card required for free plan",
  "Start free forever",
  "Cancel anytime",
  "Upgrade or downgrade anytime"
];

const Pricing = () => {
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const statsRef = useRef(null);
  const isInView = useInView(ref, { once: true });
  const statsInView = useInView(statsRef, { once: true });

  const handleFreeButtonClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsSignInPopupOpen(true);
    }
  };

  const CompareCard = () => (
    <motion.div 
      className="rounded-3xl p-6 flex flex-col border-4 w-full relative bg-white border-gray-200 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)]"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="h-24 relative flex items-center justify-center">
        <h3 className="text-2xl font-bold text-gray-800">Plan Comparison</h3>
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-left flex-1">
            <div className="text-sm font-semibold text-gray-600">FREE PLAN</div>
            <div className="text-lg font-bold text-gray-800">₹0</div>
          </div>
          <div className="text-right flex-1">
            <div className="text-sm font-semibold text-gray-600">PREMIUM PLAN</div>
            <div className="text-lg font-bold text-[#b24e55]">₹149</div>
          </div>
        </div>

        <div className="space-y-1 max-h-80 overflow-y-auto">
          {comparisonFeatures.map((item, index) => (
            <div key={index} className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Free Plan Status */}
              <div className="w-6 flex justify-center mr-3">
                {item.free ? (
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                )}
              </div>
              
              {/* Feature Name */}
              <div className="flex-1 text-sm text-gray-700 font-medium">
                {item.feature}
              </div>
              
              {/* Premium Plan Status */}
              <div className="w-6 flex justify-center ml-3">
                {item.premium ? (
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-green-600" />
            </div>
            <span>Included</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-2 h-2 text-red-500" />
            </div>
            <span>Not included</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#fff7f8]">
      <Header openSignIn={() => setIsSignInPopupOpen(true)} />
      
      
      {/* Pricing Cards */}
      <section className="py-16 px-4 bg-[#ffedee]">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-mabry font-semibold text-[#403334] mb-6">
              Plans to boost your <span className="text-[#b24e55]">career</span>
            </h2>
            <p className="text-lg text-[#4A3D55] max-w-2xl mx-auto">
              From free essential tools to premium AI-powered features, choose the perfect plan for your career goals.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Free Plan */}
            <div className="rounded-3xl p-6 flex flex-col border-4 w-full relative shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)] bg-white border-[#e2e8f0] hover:border-[#f78f97] transition-colors duration-300">
              <div className="h-24 relative">
                <div className="h-12 w-20 relative">
                  <img
                    src={pricingData[0].imagePath}
                    alt={`${pricingData[0].tier} tier`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="h-48 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-[#403334]">
                  {pricingData[0].tier}
                </h3>
                <p className="mb-4 text-[#4A3D55] text-sm">
                  {pricingData[0].description}
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#403334]">
                    {pricingData[0].price}
                  </span>
                  <span className="text-base ml-1 text-[#4A3D55]/80">
                    {pricingData[0].period}
                  </span>
                </div>
              </div>

              <div className="mb-auto flex-grow">
                <ul className="space-y-3">
                  {pricingData[0].features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 bg-green-100">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-xs text-[#4A3D55]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleFreeButtonClick}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-t from-[#b24e55] to-[#e4656e] text-white hover:from-[#a04449] hover:to-[#d85a63] transition-colors duration-200 text-sm"
                >
                  {pricingData[0].buttonText}
                </Button>
              </div>
            </div>

            {/* Compare Card */}
            <CompareCard />

            {/* Premium Plan */}
            <div className="rounded-3xl p-6 flex flex-col border-4 w-full relative shadow-[0px_0px_20px_0px_rgba(0,0,0,0.1)] bg-gradient-to-t from-[#b45057] to-[#e4656e] border-[#f78f97]">
              <div className="h-24 relative">
                <span className="absolute font-semibold top-0 right-0 bg-gradient-to-t from-[#f9b6bc] to-[#fffcfd] text-[#8f5055] px-2 py-1 rounded-full text-xs">
                  MOST POPULAR
                </span>
                <div className="h-12 w-20 relative">
                  <img
                    src={pricingData[1].imagePath}
                    alt={`${pricingData[1].tier} tier`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="h-48 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  {pricingData[1].tier}
                </h3>
                <p className="mb-4 text-white text-sm">
                  {pricingData[1].description}
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {pricingData[1].price}
                  </span>
                  <span className="text-base ml-1 text-white/80">
                    {pricingData[1].period}
                  </span>
                </div>
              </div>

              <div className="mb-auto flex-grow">
                <ul className="space-y-3">
                  {pricingData[1].features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 bg-white/20">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-white">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <CashfreePaymentButton className="w-full flex justify-center" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-[#ffedee]">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-mabry font-semibold text-[#403334] mb-6">
              Why choose <span className="text-[#b24e55]">Hirebuddy</span>?
            </h2>
            <p className="text-lg text-[#4A3D55] max-w-2xl mx-auto">
              Join thousands of job seekers who have transformed their career journey with our AI-powered platform.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#4A3D55] mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#b24e55]" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#b24e55] to-[#E3405F]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-mabry font-semibold text-white mb-6">
              Ready to accelerate your career?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Join our community and start your journey to landing your dream job today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                className="bg-white text-[#b24e55] hover:bg-gray-100 font-medium px-8 py-3 rounded-xl text-sm"
                onClick={handleFreeButtonClick}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={() => setIsSignInPopupOpen(false)}
      />
    </div>
  );
};

export default Pricing; 