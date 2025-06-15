import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  GraduationCap, 
  Users, 
  Brain, 
  Target, 
  BarChart3, 
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle,
  Star,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  IndianRupee,
  UserCheck,
  ChevronDown
} from "lucide-react";
import { motion, useAnimation, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
    institution: ""
  });
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log("Contact form submitted:", contactForm);
    // Reset form
    setContactForm({
      name: "",
      email: "",
      message: "",
      institution: ""
    });
    // Show success message or redirect
  };

  const features = [
    {
      icon: Users,
      title: "Intelligent Lead Management",
      description: "Track, nurture, and convert prospective students with AI-powered lead scoring and automated follow-up sequences. Supports WhatsApp, SMS, and regional languages.",
      color: "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Brain,
      title: "AI Admission Predictions",
      description: "Predict enrollment likelihood with 95% accuracy using machine learning algorithms trained on Indian admission patterns.",
      color: "bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Target,
      title: "Smart Marketing Automation",
      description: "Generate high-converting campaigns with AI-driven content creation, audience targeting, and budget optimization for Indian markets.",
      color: "bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics Dashboard",
      description: "Monitor performance metrics, track conversion rates, and identify growth opportunities with comprehensive reporting. GST-ready and Indian compliance supported.",
      color: "bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400"
    },
    {
      icon: MessageSquare,
      title: "Omnichannel Communication",
      description: "Engage prospects across WhatsApp, SMS, email, and voice calls with unified conversation management. Bulk messaging for Indian admissions.",
      color: "bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling & Automation",
      description: "Automate follow-ups, schedule counseling sessions, and send timely reminders to maximize conversion rates during Indian admission seasons.",
      color: "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
    }
  ];

  const aiFeatures = [
    {
      icon: Sparkles,
      title: "Predictive Enrollment Forecasting",
      description: "Forecast future enrollments for Indian institutions with 90% accuracy using advanced ML models that analyze local data, seasonal trends, and market conditions."
    },
    {
      icon: TrendingUp,
      title: "Revenue Growth Acceleration",
      description: "Increase revenue by 40% through AI-optimized pricing strategies, targeted upselling, and demand prediction algorithms tailored for Indian education."
    },
    {
      icon: Heart,
      title: "Enhanced Parent Engagement",
      description: "Build stronger relationships with personalized communication, automated progress updates, and AI-powered sentiment analysis in Indian languages."
    }
  ];

  const faqItems = [
    {
      question: "How quickly can we implement EduLead Pro in our institution?",
      answer: "Most Indian institutions are up and running within 2-3 days. Our team provides complete setup assistance, data migration support, and comprehensive training tailored for Indian staff."
    },
    {
      question: "Is EduLead Pro suitable for small educational institutions?",
      answer: "Absolutely! Our Starter plan is designed specifically for Indian schools and coaching centers with up to 200 students. You can scale up as your institution grows without any migration hassles."
    },
    {
      question: "How does the AI prediction system work?",
      answer: "Our AI analyzes multiple data points including student demographics, engagement patterns, communication history, and behavioral indicators to predict enrollment likelihood with 95% accuracy for Indian admissions."
    },
    {
      question: "Can EduLead Pro integrate with our existing systems?",
      answer: "Yes! We offer seamless integrations with popular Indian ERPs like Tally, Zoho, and more. Our API also allows custom integrations with any system you currently use."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 customer support in English, Hindi, and regional languages, dedicated account managers for Enterprise clients, and regular training sessions for Indian institutions."
    },
    {
      question: "Is our data secure with EduLead Pro?",
      answer: "Security is our top priority. We use enterprise-grade encryption, comply with Indian data protection standards, and undergo regular security audits to protect your sensitive information."
    }
  ];

  // Helper for animated count up
  function AnimatedNumber({ value, duration = 1.2, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, { once: true });
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { duration });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
      if (inView) {
        motionValue.set(0);
        motionValue.set(value);
      }
    }, [inView, value, motionValue]);

    useEffect(() => {
      return spring.on("change", (latest) => {
        setDisplay(latest);
      });
    }, [spring]);

    return (
      <span ref={ref}>
        {prefix}
        {typeof value === "number" && value % 1 !== 0
          ? display.toFixed(1)
          : Math.floor(display)}
        {suffix}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                if (window.location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setLocation("/");
                }
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">EduLead Pro</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">Features</a>
              <a href="#ai-future" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">AI Solutions</a>
              <Link href="/pricing">
                <Button 
                  variant="ghost" 
                  className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 font-semibold"
                >
                  Pricing
                </Button>
              </Link>
              <a href="#faq" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">FAQ</a>
              <a href="#contact" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">Contact</a>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{user.name ? user.name.charAt(0) : 'U'}</span>
                    </div>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">Welcome, {user.name || 'User'}</span>
                  </div>
                  <Button 
                    onClick={() => {
                      setLocation("/dashboard");
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg font-semibold"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-slate-900 dark:text-slate-100 hover:text-red-600 dark:hover:text-red-400 font-semibold"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setLocation("/login");
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                    className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 font-semibold"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      setLocation("/book-demo");
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg font-semibold"
                  >
                    Book a Demo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-pink-100/50 to-purple-100/50 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-purple-900/20 pointer-events-none"
        ></motion.div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants} className="space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm hover:shadow-md transition-shadow">
                <Sparkles className="h-3 w-3 mr-1" />
                Next-Generation Education Platform
              </Badge>
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight"
              >
                Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600"> AI-Driven</span> Platform for Indian Educational Excellence
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
              >
                Transform admissions, accelerate growth, and maximize enrollments with intelligent automation designed for Indian schools, colleges, and coaching centers. Built for the unique needs of Indian education.
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => {
                    setLocation("/book-demo");
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/pricing">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-orange-500 text-orange-700 dark:text-orange-300 text-lg px-8 py-4 hover:bg-orange-50 dark:hover:bg-orange-900 font-semibold bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View Pricing Plans
                  </Button>
                </Link>
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400"
              >
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full shadow-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full shadow-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Setup in 2 Days</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full shadow-sm">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  <span>500+ Institutions</span>
                </div>
              </motion.div>
            </motion.div>
            
              <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99],
                delay: 0.4
              }}
              className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-3xl transition-all duration-300"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live Analytics Dashboard</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(59,130,246,0.15)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-xl cursor-pointer"
                    >
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        <AnimatedNumber value={1248} />
                      </div>
                      <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Active Leads</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(34,197,94,0.15)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-xl cursor-pointer"
                    >
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        <AnimatedNumber value={94} suffix="%" />
                      </div>
                      <div className="text-sm text-green-600/70 dark:text-green-400/70">AI Accuracy</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(168,85,247,0.15)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-xl cursor-pointer"
                    >
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        <AnimatedNumber value={45} suffix="%" />
                      </div>
                      <div className="text-sm text-purple-600/70 dark:text-purple-400/70">Growth Rate</div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(251,146,60,0.15)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-xl cursor-pointer"
                    >
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        <AnimatedNumber value={2.4} prefix="₹" suffix="M" duration={1.5} />
                      </div>
                      <div className="text-sm text-orange-600/70 dark:text-orange-400/70">Revenue</div>
                    </motion.div>
                  </div>
                  <div className="h-40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Real-time Performance Metrics</p>
                    </div>
                  </div>
                </div>
              </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Complete Admissions Management Suite
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Every tool your institution needs to attract, convert, and enroll students with unprecedented efficiency and intelligence.
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card className="h-full min-h-[220px] border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
                        <Icon size={28} />
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-slate-100">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* AI Future Section */}
      <motion.section 
        id="ai-future" 
        className="py-20 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Experience the Future of Educational Growth with AI
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-8">
              Harness the power of artificial intelligence to transform every aspect of your institution's growth strategy, from predictive analytics to parent engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-900 dark:text-slate-100">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Benefits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Why Leading Institutions Choose Our AI Platform
              </h3>
              <div className="space-y-4">
                {[
                  "Increase enrollment rates by up to 40% with predictive modeling",
                  "Reduce manual workload by 60% through intelligent automation",
                  "Boost parent satisfaction with personalized communication",
                  "Accelerate revenue growth through AI-optimized pricing strategies",
                  "Make data-driven decisions with real-time insights",
                  "Scale operations without proportional staff increases"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-slate-900 dark:text-slate-100">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium">Institutions Trust Us</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">40%</div>
                  <div className="text-green-700 dark:text-green-300 font-medium">Enrollment Increase</div>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">98%</div>
                  <div className="text-purple-700 dark:text-purple-300 font-medium">Satisfaction Rate</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                  <div className="text-orange-700 dark:text-orange-300 font-medium">AI Support</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq" 
        className="py-20 bg-gradient-to-br from-white via-pink-50/30 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Everything you need to know about EduLead Pro
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-medium text-slate-900 dark:text-slate-100">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Have questions about EduLead Pro? Our team is here to help you transform your institution's admissions process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                      <a href="mailto:contact@edulead.pro" className="text-slate-900 dark:text-slate-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        contact@edulead.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                      <a href="tel:+915551234567" className="text-slate-900 dark:text-slate-100 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        +91 (555) 123-4567
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                      <p className="text-slate-900 dark:text-slate-100 font-medium">
                        Mumbai, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Monday - Friday</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Saturday</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Sunday</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleContactSubmit} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    id="institution"
                    value={contactForm.institution}
                    onChange={(e) => setContactForm({ ...contactForm, institution: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join 500+ educational institutions that have revolutionized their admissions process with EduLead Pro's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              onClick={() => {
                setLocation("/book-demo");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
            >
              Book a Demo Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              onClick={() => {
                setLocation("/pricing");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
            >
              View Pricing Plans
            </Button>           
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">EduLead Pro</h3>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Empowering educational institutions worldwide with AI-driven admissions management, predictive analytics, and intelligent marketing solutions.
              </p>
              <div className="flex items-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-slate-400 ml-2">4.9/5 from 500+ institutions</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li>
                  <button 
                    onClick={() => {
                      setLocation("/pricing");
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }} 
                    className="text-slate-400 hover:text-white transition-colors text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li><a href="#ai-future" className="hover:text-white transition-colors">AI Solutions</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>contact@edulead.pro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span>+91 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 EduLead Pro. All rights reserved. Built with ❤️ for educational institutions.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}