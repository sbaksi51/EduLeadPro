import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, ArrowLeft, GraduationCap, IndianRupee, Users, Brain, Target, BarChart3, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

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

// --- Copy NavBar and RotatingTaglines from landing page ---
import { useRef as useRef2, useEffect as useEffect2, useState as useState2 } from "react";

// RotatingTaglines (copied from landing page)
const taglines = [
  "Did you know? Our AI predicts enrollments with 95% accuracy!",
  "EduLead Pro adapts to your institution's unique needs.",
  "AI-driven insights, real results.",
  "Admissions, reimagined for the future.",
  "Your growth, powered by intelligence."
];
function RotatingTaglines() {
  const [idx, setIdx] = useState2(0);
  useEffect2(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % taglines.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.6 }}
        className="text-lg text-orange-200 mt-4 font-medium"
        style={{ minHeight: 32 }}
      >
        {taglines[idx]}
      </motion.div>
    </AnimatePresence>
  );
}

// NavBar (copied from landing page, with Pricing active)
const navItems = [
  { name: "Home", url: "#home", icon: GraduationCap },
  { name: "Features", url: "#features", icon: BarChart3 },
  { name: "AI Solutions", url: "#ai-future", icon: Brain },
  { name: "Pricing", url: "/pricing", icon: Star },
  { name: "FAQ", url: "#faq", icon: Shield },
  { name: "Contact", url: "#contact", icon: Calendar },
];
function NavBar({ setLocation, user }: { setLocation: (path: string) => void; user: any }) {
  const [activeTab, setActiveTab] = useState2("Pricing");
  return (
    <div className={cn("fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6")}> 
      <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full shadow-lg py-1 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <a
              key={item.name}
              href={item.url}
              onClick={e => {
                e.preventDefault();
                setActiveTab(item.name);
                if (item.url === "/pricing") {
                  setLocation("/pricing");
                } else if (item.url.startsWith("#")) {
                  const section = document.getElementById(item.url.replace("#", ""));
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-white hover:text-white",
                isActive && "bg-[#643ae5]"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div layoutId="lamp" className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10" initial={false} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </a>
          );
        })}
        {user ? (
          <Button
            onClick={() => setLocation('/dashboard')}
            className="ml-2 rounded-full px-6 py-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow hover:scale-105 hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Return to Dashboard
          </Button>
        ) : (
          <Button
            onClick={() => setLocation('/login')}
            className="ml-2 rounded-full px-6 py-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow hover:scale-105 hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Login
          </Button>
        )}
      </div>
    </div>
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
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
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
    <div className="bg-[#010205] min-h-screen">
      <NavBar setLocation={setLocation} user={user} />
      {/* Hero Section */}
      <motion.section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24" style={{ background: "radial-gradient(125% 125% at 50% 0%, #020617 50%, #643ae5)" }}>
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-white to-gray-300 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Transparent Pricing for Every Institution
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 dark:text-slate-200 mb-4 max-w-3xl mx-auto">
            Flexible, affordable, and designed for Indian education. All plans include our core CRM features and AI-powered tools.
          </p>
          <RotatingTaglines />
        </div>
      </motion.section>
      {/* Pricing Cards Section */}
      <section className="py-24">
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
      </section>
      {/* Features Comparison Section */}
      <section className="py-16">
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
      </section>
      {/* FAQ Section */}
      <section className="py-16" id="faq">
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
      </section>
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 text-white">
              Join 500+ educational institutions that have revolutionized their admissions process with EduLead Pro's AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" variant="secondary" className="px-8 py-4 rounded-full">
                Book a Demo Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 rounded-full border-white text-white hover:bg-white hover:text-primary">
                View Pricing Plans
              </Button>           
            </div>
            <RotatingTaglines />
          </motion.div>
        </div>
      </section>
      {/* Footer (copied from landing page) */}
      <motion.footer 
        className="bg-muted py-12 dark:bg-slate-900"
        style={{ background: "#010205" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EduLead Pro</h3>
              <p className="text-muted-foreground">
                Empowering educational institutions worldwide with AI-driven admissions management, predictive analytics, and intelligent marketing solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#ai-future" className="hover:text-foreground transition-colors">AI Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 EduLead Pro. All rights reserved. Built with ❤️ for educational institutions.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}