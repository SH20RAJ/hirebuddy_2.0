import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Cpu, 
  Zap, 
  Target, 
  MessageSquare, 
  BarChart3,
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Star,
  Bot,
  Lightbulb,
  Shield,
  Rocket,
  Globe,
  Database
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const aiCapabilities = [
  {
    icon: Brain,
    title: "Advanced AI Resume Analysis",
    description: "Our AI analyzes thousands of successful resumes to optimize yours",
    gradient: "from-purple-500 to-indigo-600",
    stats: { accuracy: 98, speed: "2.3s", improvement: "+45%" },
    demo: "resume-analysis"
  },
  {
    icon: Target,
    title: "Intelligent Job Matching",
    description: "Machine learning algorithms find your perfect career matches",
    gradient: "from-blue-500 to-cyan-600",
    stats: { accuracy: 94, speed: "1.8s", improvement: "+67%" },
    demo: "job-matching"
  },
  {
    icon: MessageSquare,
    title: "AI Interview Coach",
    description: "Personalized coaching powered by natural language processing",
    gradient: "from-emerald-500 to-teal-600",
    stats: { accuracy: 96, speed: "0.9s", improvement: "+78%" },
    demo: "interview-coach"
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "AI-driven insights to forecast your job search success",
    gradient: "from-rose-500 to-pink-600",
    stats: { accuracy: 92, speed: "3.1s", improvement: "+56%" },
    demo: "analytics"
  }
];

const demoData = {
  "resume-analysis": {
    title: "AI Resume Analysis in Action",
    metrics: [
      { label: "ATS Compatibility", value: 98, color: "bg-green-500" },
      { label: "Keyword Optimization", value: 85, color: "bg-blue-500" },
      { label: "Impact Score", value: 92, color: "bg-purple-500" },
      { label: "Industry Match", value: 88, color: "bg-orange-500" }
    ],
    suggestions: [
      "Add 3 more technical keywords",
      "Quantify achievement in bullet point #2",
      "Improve action verbs in experience section",
      "Add relevant certifications"
    ]
  },
  "job-matching": {
    title: "Smart Job Matching Results",
    jobs: [
      { title: "Senior Frontend Developer", company: "TechCorp", match: 96, salary: "$120k-150k" },
      { title: "React Developer", company: "StartupXYZ", match: 94, salary: "$100k-130k" },
      { title: "Full Stack Engineer", company: "InnovateCo", match: 89, salary: "$110k-140k" }
    ]
  },
  "interview-coach": {
    title: "AI Interview Coaching Session",
    questions: [
      "Tell me about a challenging project you worked on",
      "How do you handle tight deadlines?",
      "Describe your experience with React hooks"
    ],
    feedback: [
      "Great use of the STAR method",
      "Consider adding specific metrics",
      "Excellent technical explanation"
    ]
  },
  "analytics": {
    title: "Predictive Career Analytics",
    predictions: [
      { metric: "Interview Success Rate", value: "78%", trend: "+12%" },
      { metric: "Offer Probability", value: "85%", trend: "+8%" },
      { metric: "Salary Negotiation Edge", value: "23%", trend: "+5%" }
    ]
  }
};

const testimonials = [
  {
    name: "Alex Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "/api/placeholder/40/40",
    quote: "The AI resume analysis helped me land 5 interviews in just 2 weeks!",
    improvement: "5x more interviews"
  },
  {
    name: "Maria Rodriguez",
    role: "Product Manager",
    company: "Spotify",
    avatar: "/api/placeholder/40/40",
    quote: "The job matching was incredibly accurate. Found my dream job on the first try.",
    improvement: "Perfect job match"
  },
  {
    name: "David Park",
    role: "Data Scientist",
    company: "Netflix",
    avatar: "/api/placeholder/40/40",
    quote: "Interview coaching boosted my confidence and improved my success rate by 80%.",
    improvement: "80% success rate"
  }
];

const techStats = [
  { icon: Database, label: "Training Data Points", value: "50M+" },
  { icon: Cpu, label: "AI Models", value: "12+" },
  { icon: Globe, label: "Languages Supported", value: "25+" },
  { icon: Shield, label: "Data Security", value: "SOC 2" }
];

export const AICapabilities = () => {
  const ref = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [activeDemo, setActiveDemo] = useState("resume-analysis");
  const [animatedStats, setAnimatedStats] = useState({});
  
  const isInView = useInView(ref, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  useEffect(() => {
    if (statsInView) {
      const timer = setTimeout(() => {
        setAnimatedStats({
          accuracy: 98,
          jobs: 50000,
          users: 100000,
          success: 85
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [statsInView]);

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
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(139,92,246,0.15)_2px,transparent_0)] bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      <div className="container mx-auto container-padding relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0"
          >
            <Bot className="h-4 w-4 mr-2" />
            POWERED BY AI
          </Badge>
          
          <h2 className="text-display text-gray-900 mb-6">
            Experience the Future of{" "}
            <span className="text-gradient-primary">
              Career Intelligence
            </span>
          </h2>
          
          <p className="text-body-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Our cutting-edge AI technology combines machine learning, natural language processing, 
            and predictive analytics to revolutionize your job search experience.
          </p>

          {/* Tech Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {techStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* AI Capabilities Grid */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {aiCapabilities.map((capability, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-200 hover:border-purple-300 overflow-hidden cursor-pointer"
                onClick={() => setActiveDemo(capability.demo)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${capability.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <capability.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-white/70 border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI-POWERED
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {capability.title}
                  </CardTitle>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {capability.description}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{capability.stats.accuracy}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{capability.stats.speed}</div>
                      <div className="text-xs text-gray-500">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{capability.stats.improvement}</div>
                      <div className="text-xs text-gray-500">Improvement</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full group/btn hover:bg-purple-50 transition-all duration-300"
                  >
                    <PlayCircle className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    <span>See Live Demo</span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-card border border-purple-200 overflow-hidden shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="text-center text-2xl font-bold">
                AI Technology Demo
              </CardTitle>
              <p className="text-center text-purple-100">
                Experience our AI capabilities in real-time
              </p>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-none h-14">
                  <TabsTrigger value="resume-analysis" className="text-sm font-medium">Resume AI</TabsTrigger>
                  <TabsTrigger value="job-matching" className="text-sm font-medium">Job Match</TabsTrigger>
                  <TabsTrigger value="interview-coach" className="text-sm font-medium">Interview AI</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-sm font-medium">Predictive AI</TabsTrigger>
                </TabsList>
                
                <div className="p-8">
                  <TabsContent value="resume-analysis" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">{demoData["resume-analysis"].title}</h3>
                      <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Analysis Complete</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Performance Metrics</h4>
                        {demoData["resume-analysis"].metrics.map((metric, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{metric.label}</span>
                              <span className="text-sm font-bold">{metric.value}%</span>
                            </div>
                            <Progress value={metric.value} className="h-2" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold">AI Suggestions</h4>
                        {demoData["resume-analysis"].suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="job-matching" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">{demoData["job-matching"].title}</h3>
                      <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <Target className="w-4 h-4" />
                        <span>3 Perfect Matches Found</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {demoData["job-matching"].jobs.map((job, idx) => (
                        <Card key={idx} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{job.company[0]}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold">{job.title}</h4>
                                  <p className="text-sm text-gray-600">{job.company}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {job.match}% Match
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">{job.salary}</span>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Apply Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interview-coach" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">{demoData["interview-coach"].title}</h3>
                      <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>Session Active</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Practice Questions</h4>
                        {demoData["interview-coach"].questions.map((question, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                            <p className="text-sm">{question}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold">AI Feedback</h4>
                        {demoData["interview-coach"].feedback.map((feedback, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feedback}</span>
                          </div>
                        ))}
                        <Button className="w-full mt-4">
                          <Rocket className="w-4 h-4 mr-2" />
                          Continue Practice
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-2">{demoData["analytics"].title}</h3>
                      <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Predictions Updated</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {demoData["analytics"].predictions.map((prediction, idx) => (
                        <Card key={idx} className="text-center p-6 border border-gray-200">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {prediction.value}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {prediction.metric}
                          </div>
                          <div className="inline-flex items-center space-x-1 text-green-600 text-sm">
                            <TrendingUp className="w-3 h-3" />
                            <span>{prediction.trend}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          ref={testimonialsRef}
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0"
          >
            <Users className="h-4 w-4 mr-2" />
            SUCCESS STORIES
          </Badge>
          
          <h3 className="text-heading text-gray-900 mb-12">
            Real Results from <span className="text-gradient-secondary">AI-Powered</span> Job Searches
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{testimonial.name}</div>
                          <div className="text-xs text-gray-500">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {testimonial.improvement}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};