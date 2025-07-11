import { RainbowButton } from "@/components/ui/rainbow-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight,
  CheckCircle,
  Users,
  Star,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const stats = [
  { icon: Users, value: "50K+", label: "Job seekers helped" },
  { icon: TrendingUp, value: "3x", label: "Faster job placement" },
  { icon: Star, value: "4.9/5", label: "User satisfaction" }
];

const benefits = [
  "No credit card required",
  "Start free forever",
  "Cancel anytime"
];

export const CTA = () => {
  const ref = useRef(null);
  const statsRef = useRef(null);
  const [email, setEmail] = useState("");
  const isInView = useInView(ref, { once: true });
  const statsInView = useInView(statsRef, { once: true });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-pink-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          ref={ref}
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-pink-100 text-pink-700 border-pink-200">
            <Sparkles className="h-4 w-4 mr-2" />
            Ready to get started?
          </Badge>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join thousands who found their{" "}
            <span className="text-gradient-primary">
              dream job
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Start your AI-powered job search today. Get matched with perfect opportunities 
            and let our technology handle the applications.
          </p>

          {/* Email Signup Form */}
          <motion.form
            onSubmit={handleEmailSubmit}
            className="max-w-lg mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-3 shadow-lg border border-gray-200">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-0 text-lg h-12 bg-transparent focus:ring-0 placeholder:text-gray-400"
                required
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <RainbowButton 
                  type="submit"
                  size="lg"
                  className="h-12 px-8 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </RainbowButton>
              </motion.div>
            </div>
          </motion.form>

          {/* Benefits */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 mb-12"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-pink-500" />
                <span>{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Found my dream job in just 2 weeks. The AI matching was incredibly accurate!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-700 font-medium text-sm">SC</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Sarah Chen</div>
                  <div className="text-gray-500 text-xs">Software Engineer at Google</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The interview prep feature was a game-changer. Aced every interview!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                  <span className="text-pink-700 font-medium text-sm">MJ</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Marcus Johnson</div>
                  <div className="text-gray-500 text-xs">Product Manager at Microsoft</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};