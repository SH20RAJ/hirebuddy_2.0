import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Mail, 
  MapPin, 
  Phone, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Github,
  Send,
  Heart,
  Sparkles,
  Shield,
  Award,
  Globe,
  Zap,
  Users,
  ArrowUp,
  ExternalLink,
  BarChart3,
  Search,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { label: "Find Jobs", href: "/jobs", icon: Search },
      { label: "Resume Builder", href: "/resume-builder", icon: FileText },
      { label: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
      { label: "Analytics", href: "/analytics", icon: TrendingUp },
      { label: "Calendar", href: "/calendar", icon: Calendar }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers", badge: "We're hiring!" },
      { label: "Press Kit", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Investors", href: "/investors" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API Documentation", href: "/docs", icon: ExternalLink },
      { label: "Career Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/community" },
      { label: "Webinars", href: "/webinars", badge: "Live" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Security", href: "/security" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Accessibility", href: "/accessibility" }
    ]
  }
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/hirebuddy", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com/hirebuddy", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/hirebuddy", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/hirebuddy", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/hirebuddy", label: "GitHub" }
];

const achievements = [
  { icon: Users, label: "50K+ Users", description: "Active job seekers" },
  { icon: Award, label: "4.9/5 Rating", description: "User satisfaction" },
  { icon: Shield, label: "SOC 2 Certified", description: "Enterprise security" },
  { icon: Globe, label: "25+ Countries", description: "Global reach" }
];

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Hirebuddy
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </div>
            </motion.div>

            <motion.p 
              className="text-gray-400 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Transform your career journey with AI-powered resume building, smart job matching, 
              and personalized interview coaching. Join thousands of professionals who've accelerated 
              their success with Hirebuddy.
            </motion.p>

            {/* Contact Info */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-sm">San Francisco, CA & Remote</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-sm">hello@hirebuddy.ai</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-blue-600 transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <motion.div 
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                >
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li 
                        key={link.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                      >
                        <Link 
                          to={link.href} 
                          className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300 flex items-center space-x-2 group"
                        >
                          <span>{link.label}</span>
                          {link.icon && (
                            <link.icon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}
                          {link.badge && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs ml-2">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div>
                <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Get the latest career tips, AI updates, and job market insights.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 pr-12"
                    required
                  />
                  <motion.button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                
                {isSubscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Successfully subscribed!</span>
                  </motion.div>
                )}
              </form>

              <div className="text-xs text-gray-500">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </div>
            </motion.div>
          </div>
        </div>

        {/* Achievements Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Separator className="mb-8 bg-gray-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div 
                key={achievement.label}
                className="text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                  <achievement.icon className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-lg font-bold text-white mb-1">{achievement.label}</div>
                <div className="text-xs text-gray-500">{achievement.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-gray-500 flex items-center">
              © {new Date().getFullYear()} Hirebuddy Technologies Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>for job seekers worldwide</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Status: All Systems Operational
            </Badge>
            
            <motion.button
              onClick={scrollToTop}
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-blue-600 transition-all duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};