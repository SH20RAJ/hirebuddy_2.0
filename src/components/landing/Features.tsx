import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileText, 
  ArrowRight, 
  Brain, 
  Target,
  Sparkles,
  CheckCircle,
  Star,
  BarChart3,
  MessageSquare,
  Users
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const mainFeatures = [
  {
    icon: Brain,
    title: "AI Resume Builder",
    description: "Create ATS-optimized resumes with AI assistance and real-time feedback.",
    features: ["ATS Optimization", "Real-time Feedback", "Industry Templates", "Export Options"]
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    description: "AI analyzes your skills and preferences to find perfect job matches.",
    features: ["Skill Analysis", "Preference Learning", "Match Scoring", "Auto Applications"]
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with AI-powered mock interviews tailored to your industry.",
    features: ["Mock Interviews", "Industry Questions", "Performance Analytics", "Video Practice"]
  },
  {
    icon: BarChart3,
    title: "Application Tracking",
    description: "Track applications, interviews, and progress in one unified dashboard.",
    features: ["Application Pipeline", "Interview Calendar", "Progress Tracking", "Analytics"]
  }
];

const stats = [
  { value: "50K+", label: "Users helped", icon: Users },
  { value: "95%", label: "Success rate", icon: Target },
  { value: "4.9", label: "User rating", icon: Star }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    quote: "Landed my dream job in just 3 weeks using Hirebuddy's AI matching!"
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager", 
    company: "Microsoft",
    quote: "The interview prep feature helped me ace every technical interview."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const Features = () => {
  const ref = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const isInView = useInView(ref, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });
  
  return (
    <section className="py-20 bg-white relative overflow-hidden" id="features">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.08)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-pink-100 text-pink-700 border-pink-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            How it works
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-primary">
              Land Your Dream Job
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform simplifies your job search with intelligent automation 
            and personalized guidance every step of the way.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {mainFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="group text-center"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-pink-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  {feature.features.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-pink-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
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

        {/* Testimonials */}
        <motion.div
          ref={testimonialsRef}
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-pink-100 text-pink-700 border-pink-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Success Stories
          </Badge>
          
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Loved by thousands of <span className="text-gradient-primary">job seekers</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center">
                      <span className="text-pink-700 font-medium text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm">{testimonial.name}</div>
                      <div className="text-gray-500 text-xs">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};