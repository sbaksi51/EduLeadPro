import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, ArrowLeft, GraduationCap, IndianRupee, Users, Brain, Target, BarChart3, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatePresence } from "framer-motion";
import { useRef } from "react";

// --- AnimatedNumber (from landing page) ---
function AnimatedNumber({ value, duration = 1.2, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    let startTime: number | null = null;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      setDisplay(start + (value - start) * progress);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value, duration]);
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

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const plans = [
    {
      name: "Starter",
      price: "4,999",
      description: "Perfect for small schools and coaching centers",
      features: [
        "Up to 500 leads per month",
        "Basic lead management",
        "WhatsApp & SMS notifications",
        "Standard reporting",
        "Phone & email support",
        "Basic admission forms",
        "Single branch support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "14,999",
      description: "Ideal for growing educational institutions",
      features: [
        "Up to 2,000 leads per month",
        "Advanced lead scoring",
        "AI-powered insights",
        "Custom admission workflows",
        "WhatsApp & SMS integration",
        "Advanced analytics",
        "Multi-branch support (up to 3)",
        "Priority support",
        "Fee management system",
        "Parent portal access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "34,999",
      description: "For large institutions with complex needs",
      features: [
        "Unlimited leads",
        "Full AI forecasting suite",
        "ERP integrations",
        "Custom reporting",
        "Multi-campus support",
        "API access",
        "Dedicated account manager",
        "24/7 premium support",
        "Advanced fee management",
        "Custom mobile app",
        "Advanced parent portal",
        "Bulk SMS & WhatsApp"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation - copied from landing page for consistency */}
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
              onClick={() => setLocation("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">EduLead Pro</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#features" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">Features</a>
              <a href="/#ai-future" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">AI Solutions</a>
              <Link href="/pricing">
                <Button 
                  variant="ghost" 
                  className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 font-semibold"
                >
                  Pricing
                </Button>
              </Link>
              <a href="/#faq" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">FAQ</a>
              <a href="/#contact" className="text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold">Contact</a>
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
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="py-20 relative overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      >
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm hover:shadow-md transition-shadow">
            <Zap className="h-4 w-4 mr-1" />
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Choose the Right Plan for Your Institution
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Flexible, affordable, and designed for Indian education. All plans include our core CRM features and AI-powered tools.
          </p>
        </div>
      </motion.section>

      {/* Stats/Social Proof Row */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-800/70 px-4 py-2 rounded-full shadow">
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100"><AnimatedNumber value={500} suffix="+" /></span>
          <span className="text-slate-600 dark:text-slate-400 ml-1">Institutions</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-800/70 px-4 py-2 rounded-full shadow">
          <Star className="h-5 w-5 text-yellow-400" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">4.9/5</span>
          <span className="text-slate-600 dark:text-slate-400 ml-1">Satisfaction</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/70 dark:bg-slate-800/70 px-4 py-2 rounded-full shadow">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">24/7</span>
          <span className="text-slate-600 dark:text-slate-400 ml-1">Support</span>
        </div>
      </div>

      {/* Pricing Cards (refactored) */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(251,146,60,0.15)" }}
          >
            <Card className={`relative shadow-lg hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 ${plan.popular ? 'ring-2 ring-orange-500 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  <IndianRupee className="inline-block w-6 h-6" />
                  <AnimatedNumber value={parseInt(plan.price.replace(/,/g, ''))} />
                  <span className="text-lg font-normal text-slate-600 dark:text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link href="/book-demo">
                    <Button 
                      className={`w-full text-white ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'}`}
                      size="lg"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-6xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">AI-Powered Insights</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Make data-driven decisions with our advanced AI algorithms and predictive analytics.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Indian Education Focus</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Built specifically for Indian educational institutions with local support and features.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Enterprise Security</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Bank-grade security with 99.9% uptime and data encryption at rest and in transit.
            </p>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section (Accordion) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-4xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline py-6">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100">Is there a free trial?</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Yes! All plans come with a 14-day free trial. No credit card required.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline py-6">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100">Can I change plans anytime?</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline py-6">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100">What kind of support do you offer?</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We offer phone, email, and WhatsApp support in English and Hindi. Enterprise customers get dedicated account managers.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border border-slate-200 dark:border-slate-700 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline py-6">
              <span className="text-lg font-medium text-slate-900 dark:text-slate-100">Is my data secure?</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Yes. We use enterprise-grade encryption and are compliant with Indian data protection standards.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.section>

      {/* CTA Section (Gradient, Animated Button) */}
      <motion.section
        className="py-20 bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join 500+ educational institutions that have revolutionized their admissions process with EduLead Pro's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
            <motion.button
              className="relative bg-white text-orange-600 text-lg px-8 py-4 shadow-lg font-semibold rounded-lg overflow-hidden border-2 border-orange-400 hover:scale-105 transition-all duration-300"
              style={{
                boxShadow: "0 0 24px 4px #f59e42, 0 0 48px 8px #ec4899, 0 0 64px 16px #a78bfa",
                borderImage: "linear-gradient(90deg,#f59e42,#ec4899,#a78bfa) 1"
              }}
              whileHover={{
                boxShadow: "0 0 36px 8px #f59e42, 0 0 72px 16px #ec4899, 0 0 96px 32px #a78bfa",
                scale: 1.07
              }}
              onClick={() => {
                setLocation("/book-demo");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
            >
              Book a Demo Today
            </motion.button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
              onClick={() => {
                setLocation("/login");
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
            >
              Start Free Trial
            </Button>           
          </div>
          <div className="text-orange-100 text-lg font-medium mt-2">
            EduLead Pro adapts to your institution's unique needs.
          </div>
        </div>
      </motion.section>
    </div>
  );
}