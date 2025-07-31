import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Newsletter = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    setError("");
    setIsSubmitting(true);

    if (!email) {
      setError("Please enter an email address");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      // For now, just simulate subscription success
      // In a real implementation, you would send this to your backend
      console.log("Newsletter subscription:", email);
      
      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      setError("Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="-mt-5 w-full min-h-screen py-16 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center bg-[#D35C65]">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left side - Content */}
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-mabry font-semibold text-white">
            Join our newsletter.
          </h2>
          <p className="text-xl text-white/90 max-w-xl mx-auto lg:mx-0">
            Get insider tips, career hacks, and the latest job opportunities—
            delivered right to your inbox.
          </p>

          {/* Email input section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-3/4 bg-white p-1 rounded-xl shadow-[0_4px_30px_rgba(231,90,130,0.15)] mx-auto lg:mx-0">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-xl text-[#b88c8e] border-transparent text-center placeholder:text-[#B88C8E] placeholder:text-lg flex-1"
                disabled={isSubmitting}
              />
              <ShimmerButton
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="h-14 px-8 text-lg font-normal rounded-xl w-full sm:w-auto"
                background="linear-gradient(to top, #b24e55, #E3405F)"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
                <svg
                  className="ml-2"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ShimmerButton>
            </div>
            {error && (
              <p className="text-white font-medium text-center lg:text-left sm:w-3/4 mx-auto lg:mx-0">
                {error} ❌
              </p>
            )}
            {isSubscribed && (
              <p className="text-white font-medium text-center lg:text-left sm:w-3/4 mx-auto lg:mx-0">
                Subscribed! ✅
              </p>
            )}
          </div>
          <p className="text-sm text-white text-center lg:text-left sm:w-3/4 mx-auto lg:mx-0">
            We won't spam you. Promise.
          </p>
        </div>

        {/* Right side - Image */}
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
          <img
            src="/newsletter.svg"
            alt="Newsletter illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}; 