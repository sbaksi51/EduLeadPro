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
import { motion, useAnimation, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const features = [
    {
      icon: Users,
      title: "Intelligent Lead Management",
      description: "Track, nurture, and convert prospective students with AI-powered lead scoring and automated follow-up sequences.",
      color: "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
    },
    {
      icon: Brain,
      title: "AI Admission Predictions",
      description: "Predict enrollment likelihood with 95% accuracy using machine learning algorithms trained on admission patterns.",
      color: "bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Target,
      title: "Smart Marketing Automation",
      description: "Generate high-converting campaigns with AI-driven content creation, audience targeting, and budget optimization.",
      color: "bg-slate-100 dark:bg-slate-800 text-green-600 dark:text-green-400"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics Dashboard",
      description: "Monitor performance metrics, track conversion rates, and identify growth opportunities with comprehensive reporting.",
      color: "bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400"
    },
    {
      icon: MessageSquare,
      title: "Omnichannel Communication",
      description: "Engage prospects across WhatsApp, SMS, email, and voice calls with unified conversation management.",
      color: "bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling & Automation",
      description: "Automate follow-ups, schedule counseling sessions, and send timely reminders to maximize conversion rates.",
      color: "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
    }
  ];

  const aiFeatures = [
    {
      icon: Sparkles,
      title: "Predictive Enrollment Forecasting",
      description: "Forecast future enrollments with 90% accuracy using advanced ML models that analyze historical data, seasonal trends, and market conditions."
    },
    {
      icon: TrendingUp,
      title: "Revenue Growth Acceleration",
      description: "Increase revenue by 40% through AI-optimized pricing strategies, targeted upselling, and demand prediction algorithms."
    },
    {
      icon: Heart,
      title: "Enhanced Parent Engagement",
      description: "Build stronger relationships with personalized communication, automated progress updates, and AI-powered sentiment analysis."
    }
  ];

  const faqItems = [
    {
      question: "How quickly can we implement EduLead Pro in our institution?",
      answer: "Most institutions are up and running within 2-3 days. Our team provides complete setup assistance, data migration support, and comprehensive training to ensure a smooth transition."
    },
    {
      question: "Is EduLead Pro suitable for small educational institutions?",
      answer: "Absolutely! Our Starter plan is designed specifically for smaller institutions with up to 200 students. You can scale up as your institution grows without any migration hassles."
    },
    {
      question: "How does the AI prediction system work?",
      answer: "Our AI analyzes multiple data points including student demographics, engagement patterns, communication history, and behavioral indicators to predict enrollment likelihood with 95% accuracy."
    },
    {
      question: "Can EduLead Pro integrate with our existing systems?",
      answer: "Yes! We offer seamless integrations with popular ERPs like Tally, SAP, Zoho, and Salesforce. Our API also allows custom integrations with any system you currently use."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 customer support, dedicated account managers for Enterprise clients, comprehensive documentation, video tutorials, and regular training sessions."
    },
    {
      question: "Is our data secure with EduLead Pro?",
      answer: "Security is our top priority. We use enterprise-grade encryption, comply with international data protection standards, and undergo regular security audits to protect your sensitive information."
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">EduLead Pro</h1>
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
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Next-Generation Education Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600"> AI-Driven</span> Platform for Educational Excellence
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Transform admissions, accelerate growth, and maximize enrollments with intelligent automation designed specifically for educational institutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg px-8 py-4 shadow-xl"
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
                    className="border-2 border-orange-500 text-orange-700 dark:text-orange-300 text-lg px-8 py-4 hover:bg-orange-50 dark:hover:bg-orange-900 font-semibold bg-white dark:bg-slate-800"
                  >
                    View Pricing Plans
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Setup in 2 Days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  <span>500+ Institutions</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Complete Admissions Management Suite
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
              Every tool your institution needs to attract, convert, and enroll students with unprecedented efficiency and intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Future Section */}
      <section id="ai-future" className="py-16 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
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
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
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
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 shadow-lg font-semibold"
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
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 shadow-lg font-semibold"
              onClick={() => {
                setLocation("/pricing");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
            >
              View Pricing Plans
            </Button>           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 py-16">
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
      </footer>
    </div>
  );
}