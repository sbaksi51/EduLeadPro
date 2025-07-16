import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { motion, useMotionValue, useMotionTemplate, animate, AnimatePresence, useAnimation, useInView, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollFloat } from "@/hooks/useScrollFloat";
import { cn } from "@/lib/utils";
import { 
  Home,
  Users, 
  BarChart3, 
  GraduationCap,
  DollarSign,
  Brain,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Star,
  ArrowRight,
  Shield,
  Zap,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Heart,
  CheckCircle,
  Target,
  MessageSquare,
  Calendar,
  Check
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import FeatureSteps from "@/components/ui/feature-steps";
import Earth from "../../../components/ui/globe";
// Remove the AnimatedInsights import
// import AnimatedInsights from "../components/dashboard/animated-insights";

// --- Unique Visual Components ---
// ConstellationNetwork: Dynamic constellation of points and lines
const ConstellationNetwork = ({ mouseX, mouseY }: { mouseX: number; mouseY: number }) => {
  // Generate static points on mount
  const points = React.useMemo(() => (
    Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * 400 + 100
    }))
  ), []);
  // Animate a shooting star
  const [shooting, setShooting] = React.useState(false);
  React.useEffect(() => {
    const timeout = setTimeout(() => setShooting(true), 6000 + Math.random() * 4000);
    return () => clearTimeout(timeout);
  }, [shooting]);
  React.useEffect(() => {
    if (shooting) {
      const timeout = setTimeout(() => setShooting(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [shooting]);
  // Shooting star path
  const shootingStart = { x: 100, y: 120 };
  const shootingEnd = { x: window.innerWidth - 100, y: 320 };
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x + (mouseX - window.innerWidth / 2) / 18}
          cy={p.y + (mouseY - 300) / 18}
          r={3.5 + Math.sin(Date.now() / 900 + i) * 1.2}
          fill={`hsl(${200 + i * 10}, 100%, 90%)`}
          opacity={0.95}
          animate={{
            r: [3.5, 5, 3.5],
            opacity: [0.95, 0.7, 0.95]
          }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.13 }}
        />
      ))}
      {points.map((p1, i) =>
        points.map((p2, j) => (
          i < j && Math.hypot(p1.x - p2.x, p1.y - p2.y) < 160 ? (
            <motion.line
              key={i + '-' + j}
              x1={p1.x + (mouseX - window.innerWidth / 2) / 18}
              y1={p1.y + (mouseY - 300) / 18}
              x2={p2.x + (mouseX - window.innerWidth / 2) / 18}
              y2={p2.y + (mouseY - 300) / 18}
              stroke={`hsl(${220 + (i + j) * 7}, 100%, 80%)`}
              strokeWidth={1.2}
              opacity={0.35 + 0.12 * Math.sin(Date.now() / 1200 + i + j)}
              initial={false}
              animate={{
                opacity: [0.35, 0.55, 0.35]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: (i + j) * 0.07 }}
            />
          ) : null
        ))
      )}
      {/* Shooting star */}
      {shooting && (
        <motion.line
          x1={shootingStart.x}
          y1={shootingStart.y}
          x2={shootingEnd.x}
          y2={shootingEnd.y}
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0], pathLength: [0, 1, 0] }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
};

// AnimatedJourneyPath: SVG line that grows as user scrolls
const AnimatedJourneyPath = ({ progress }: { progress: number }) => (
  <svg width="8" height="100%" style={{ position: 'absolute', left: -24, top: 0, height: '100%', zIndex: 2 }}>
    <motion.line
      x1="4" y1="0" x2="4" y2="1000"
      stroke="#f59e42" strokeWidth="6" strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: progress }}
      transition={{ duration: 1, ease: "easeInOut" }}
    />
  </svg>
);

// RotatingTaglines: Rotates through AI-generated taglines
const taglines = [
  "Did you know? Our AI predicts enrollments with 95% accuracy!",
  "EduLead Pro adapts to your institution's unique needs.",
  "AI-driven insights, real results.",
  "Admissions, reimagined for the future.",
  "Your growth, powered by intelligence."
];
function RotatingTaglines() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
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

// --- End Unique Visual Components ---

// --- Testimonial Carousel ---
import { useState as useState2, useEffect as useEffect2 } from "react";
import { AnimatePresence as AnimatePresence2 } from "framer-motion";
import { useScrollFloat as useScrollFloat2 } from "@/hooks/useScrollFloat";

const testimonials = [
  {
    name: "Priya S.",
    role: "Principal, Delhi Public School",
    quote: "EduLead Pro transformed our admissions process. We saw a 35% increase in enrollments!",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    name: "Ravi K.",
    role: "Director, Bright Minds Academy",
    quote: "The AI predictions are spot on. Our team saves hours every week.",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg"
  },
  {
    name: "Anjali M.",
    role: "Admissions Head, Sunrise College",
    quote: "Seamless integration and fantastic support. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg"
  }
];

function TestimonialCarousel() {
  const [idx, setIdx] = useState2(0);
  useEffect2(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);
  // Subtle float effect for the main testimonial card
  const { ref, y } = useScrollFloat2([0, 1], [0, -20]);
  return (
    <div className="w-full flex flex-col items-center mb-20">
      <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">What Our Clients Say</h3>
      <div className="relative w-full max-w-2xl h-64 flex items-center justify-center">
        <AnimatePresence2 mode="wait">
          <motion.div
            key={idx}
            ref={ref}
            style={{ y }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute w-full"
          >
            <motion.div
              whileHover={{ y: -8, rotate: 2, boxShadow: "0 8px 32px rgba(251,146,60,0.15)" }}
              animate={{ y: [0, -4, 0], boxShadow: ["0 2px 8px #f59e4222", "0 8px 32px #f59e4222", "0 2px 8px #f59e4222"] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-center"
            >
              <img src={testimonials[idx].avatar} alt={testimonials[idx].name} className="w-20 h-20 rounded-full mb-4 border-4 border-orange-200 shadow" />
              <p className="text-lg text-slate-700 dark:text-slate-200 italic mb-4 text-center">"{testimonials[idx].quote}"</p>
              <div className="font-semibold text-orange-600 dark:text-orange-400">{testimonials[idx].name}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">{testimonials[idx].role}</div>
            </motion.div>
          </motion.div>
        </AnimatePresence2>
      </div>
      <div className="flex space-x-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === idx ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700"}`}
            onClick={() => setIdx(i)}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Navigation Bar (from new template, but will adapt to your nav items and logic)
const NavBar = ({ items, className, setLocation }: { items: any[], className?: string, setLocation?: (path: string) => void }) => {
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className={cn("fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6", className)}>
      <div className="flex items-center gap-3 bg-background/80 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary"
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
        <Button
          onClick={() => (setLocation ? setLocation('/login') : window.location.href = '/login')}
          className="ml-2 rounded-full px-6 py-2 font-semibold text-sm bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow hover:scale-105 hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Login
        </Button>
      </div>
    </div>
  );
};

// Correct ContainerScroll implementation for animated 'See It In Action' section
import { useScroll, useTransform } from "framer-motion";

const ContainerScroll = ({ titleComponent, children }: { titleComponent: React.ReactNode; children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          style={{
            translateY: translate,
          }}
          className="div max-w-5xl mx-auto text-center"
        >
          {titleComponent}
        </motion.div>
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 flex flex-col items-center justify-center">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// MiniDashboard component for interactive demo in ContainerScroll
// Replace MiniDashboard slides with image-based slides
const dashboardSlides = [
  {
    key: 'ai-forecasting',
    title: 'AI Forecasting',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', // AI/analytics visual
  },
  {
    key: 'dashboard',
    title: 'Dashboard',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', // dashboard visual
  },
  {
    key: 'leads-management',
    title: 'Leads Management',
    image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80', // leads/CRM visual
  },
];

function MiniDashboard() {
  const [tab, setTab] = useState<string>(dashboardSlides[0].key);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide effect
  useEffect(() => {
    if (autoSlideRef.current) clearTimeout(autoSlideRef.current);
    autoSlideRef.current = setTimeout(() => {
      setDirection(1);
      setTab((prev) => {
        const idx = dashboardSlides.findIndex(s => s.key === prev);
        return dashboardSlides[(idx + 1) % dashboardSlides.length].key;
      });
    }, 2000);
    return () => { if (autoSlideRef.current) { clearTimeout(autoSlideRef.current); } };
  }, [tab]);

  const handleTabClick = (key: string) => {
    setDirection(dashboardSlides.findIndex(s => s.key === key) > dashboardSlides.findIndex(s => s.key === tab) ? 1 : -1);
    setTab(key);
  };

  const currentSlide = dashboardSlides.find(s => s.key === tab);

  return (
    <div className="flex flex-col items-center">
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 relative">
        {dashboardSlides.map((slide) => (
          <button
            key={slide.key}
            className={cn(
              "relative px-4 py-2 rounded-full font-medium text-sm transition-colors duration-300",
              tab === slide.key
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                : "bg-white/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-200 hover:bg-blue-100/60 dark:hover:bg-zinc-700/60"
            )}
            style={{ zIndex: 1 }}
            onClick={() => handleTabClick(slide.key)}
          >
            <span className="flex items-center">
              {slide.title}
            </span>
            {tab === slide.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      {/* Sliding Image Pages */}
      <div className="w-full h-48 md:h-64 mb-6 relative overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={tab}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
            className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center"
          >
            <img
              src={currentSlide?.image}
              alt={currentSlide?.title}
              className="w-full h-full object-cover rounded-2xl shadow-lg"
              style={{ maxHeight: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent py-4 px-6 rounded-b-2xl">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg text-center">{currentSlide?.title}</h3>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

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

// Main Landing Page Component (outer structure only for now)
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
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featureProgress, setFeatureProgress] = useState(0);
  // Add FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Mouse move handler for hero/particles
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
  }, []);

  // Scroll progress for features journey path
  useEffect(() => {
    function onScroll() {
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect();
        const windowH = window.innerHeight;
        const visible = Math.max(0, Math.min(rect.bottom, windowH) - Math.max(rect.top, 0));
        const total = rect.height;
        setFeatureProgress(Math.max(0, Math.min(1, visible / total)));
      }
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // For the features grid/cards, use schoolFeatures:
  const schoolFeatures = [
    {
      icon: Users,
      title: "Intelligent Lead Management",
      description: "Track, nurture, and convert prospective students with AI-powered lead scoring and automated follow-up sequences. Supports WhatsApp, SMS, and regional languages.",
      stat: { label: "97% conversion rate", color: "bg-green-900/80 text-green-300", icon: "zap" },
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-300"
    },
    {
      icon: Brain,
      title: "AI Admission Predictions",
      description: "Predict enrollment likelihood with 95% accuracy using machine learning algorithms trained on Indian admission patterns.",
      stat: { label: "95% accuracy", color: "bg-purple-900/80 text-purple-200", icon: "zap" },
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-300"
    },
    {
      icon: Target,
      title: "Smart Marketing Automation",
      description: "Generate high-converting campaigns with AI-driven content creation, audience targeting, and budget optimization for Indian markets.",
      stat: { label: "40% more leads", color: "bg-pink-900/80 text-pink-200", icon: "zap" },
      iconBg: "bg-green-500/20",
      iconColor: "text-green-300"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics Dashboard",
      description: "Monitor performance metrics, track conversion rates, and identify growth opportunities with comprehensive reporting. GST-ready and Indian compliance supported.",
      stat: { label: "GST-ready", color: "bg-orange-900/80 text-orange-200", icon: "zap" },
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-300"
    },
    {
      icon: MessageSquare,
      title: "Omnichannel Communication",
      description: "Engage prospects across WhatsApp, SMS, email, and voice calls with unified conversation management. Bulk messaging for Indian admissions.",
      stat: { label: "Bulk messaging", color: "bg-blue-900/80 text-blue-200", icon: "zap" },
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-300"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling & Automation",
      description: "Automate follow-ups, schedule counseling sessions, and send timely reminders to maximize conversion rates during Indian admission seasons.",
      stat: { label: "Auto reminders", color: "bg-indigo-900/80 text-indigo-200", icon: "zap" },
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-300"
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

  // 1. Add animated underline CSS for nav links
  const navLinkClass =
    "relative text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold px-2 py-1 focus:outline-none group";

  const [ripple, setRipple] = useState<{x: number, y: number, key: number} | null>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

  function handleCtaClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ctaButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        key: Date.now()
      });
      setTimeout(() => setRipple(null), 600);
    }
    setLocation("/book-demo");
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  // Navigation items (will adapt to your original nav logic)
  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "Features", url: "#features", icon: BarChart3 },
    { name: "AI Solutions", url: "#ai-future", icon: Brain },
    { name: "FAQ", url: "#faq", icon: ChevronDown },
    { name: "Contact", url: "#contact", icon: GraduationCap },
  ];
  // Animated color for hero background
  const color = useMotionValue("#f59e42");
  useEffect(() => {
    animate(color, ["#f59e42", "#ec4899", "#a78bfa", "#10b981"], {
      ease: "easeInOut",
      duration: 8,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  // Features for FeatureSteps (step, title, content, image)
  const features = [
    {
      step: "Step 1",
      title: "Predictive Enrollment Forecasting",
      content: "Forecast future enrollments for Indian institutions with 90% accuracy using advanced ML models that analyze local data, seasonal trends, and market conditions.",
      image: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80" // Indian students in classroom
    },
    {
      step: "Step 2", 
      title: "Revenue Growth Acceleration",
      content: "Increase revenue by 40% through AI-optimized pricing strategies, targeted upselling, and demand prediction algorithms tailored for Indian education.",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80" // Indian rupee notes
    },
    {
      step: "Step 3",
      title: "Enhanced Parent Engagement",
      content: "Build stronger relationships with personalized communication, automated progress updates, and AI-powered sentiment analysis in Indian languages.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" // Indian family
    }
  ];

  // Enhanced AI Features with relevant images and icons
  const aiFeaturesEnhanced = [
    {
      step: "Step 1",
      title: "Predictive Enrollment Forecasting",
      content: "Forecast future enrollments for Indian institutions with 90%+ accuracy using advanced ML models that analyze local data, seasonal trends, and market conditions.",
      image: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80", // Indian classroom
      icon: Sparkles,
    },
    {
      step: "Step 2",
      title: "Revenue Growth Acceleration",
      content: "Increase revenue by up to 40% with AI-optimized pricing, targeted upselling, and demand prediction tailored for Indian education.",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80", // Indian rupee notes
      icon: TrendingUp,
    },
    {
      step: "Step 3",
      title: "Enhanced Parent Engagement",
      content: "Build stronger relationships with personalized communication, automated progress updates, and AI-powered sentiment analysis in Indian languages.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80", // Indian family
      icon: Heart,
    },
  ];

  // Force dark mode on mount, revert on unmount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <NavBar items={navItems} setLocation={setLocation} />
      {/* Hero Section (placeholder for now) */}
      <motion.section id="home" style={{ backgroundImage }} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Hero content will be migrated here */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-white to-gray-300 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            EduLead Pro: AI-Driven Platform for Indian Educational Excellence
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 dark:text-slate-200 mb-8 max-w-3xl mx-auto">
            Transform admissions, accelerate growth, and maximize enrollments with intelligent automation designed for Indian schools, colleges, and coaching centers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg transition-all dark:bg-orange-500">
                    Book a Demo
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
                  </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 rounded-full dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">
                    View Pricing Plans
                  </Button>
                </div>
        </div>
        {/* Removed AnimatedInsights component */}
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="text-primary"> Manage Your School</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From student enrollment to AI-powered insights, our comprehensive platform 
              handles every aspect of school administration.
            </p>
          </motion.div>

          {/* New Features Grid (reference image style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {schoolFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)' }}
              >
                <div className="relative h-full rounded-2xl border border-slate-700 bg-[#181B20] shadow-lg group flex flex-col p-8 transition-all duration-300 hover:shadow-2xl hover:border-primary hover:-translate-y-2 hover:bg-gradient-to-br hover:from-slate-800/80 hover:to-slate-900/80">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.iconBg}`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  {/* Stat Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${feature.stat.color} gap-1`}>
                      {feature.stat.icon === "zap" && <Zap className="w-4 h-4 text-yellow-400 mr-1" />}
                      {feature.stat.label}
                    </span>
                  </div>
                  {/* Description */}
                  <p className="text-slate-300 mb-8 flex-1">{feature.description}</p>
                  {/* Learn More Link */}
                  <a href="#" className="text-blue-400 font-medium hover:underline mt-auto inline-block">Learn More →</a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How It Works Section (Enhanced AI Solutions) */}
      <section id="ai-future" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              AI-Powered Solutions for <span className="text-orange-400">Indian Institutions</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Unlock the full potential of your institution with advanced AI features designed for Indian education. Explore how our platform can forecast enrollments, accelerate revenue, and build stronger parent relationships.
            </p>
          </motion.div>
          <div className="max-w-5xl mx-auto">
            <FeatureSteps
              features={aiFeaturesEnhanced}
              autoPlayInterval={5000}
            />
          </div>
        </div>
      </section>
                  </div>
      </section>

      {/* See It In Action Section (Animated with ContainerScroll) */}
      <ContainerScroll
        titleComponent={
                    <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 dark:text-slate-100">
              See It In <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto dark:text-slate-300">
              Experience the power of our platform with an interactive demo
            </p>
                    </div>
        }
      >
        {/* Tablet/mockup container tweaks */}
        <div
          className="relative mx-auto w-full max-w-md md:max-w-xl lg:max-w-2xl rounded-3xl shadow-2xl border border-white/20 bg-white/60 dark:bg-slate-900/80 backdrop-blur-lg overflow-hidden transition-transform duration-300 hover:scale-105"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
        >
          {/* Soft background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-100/30 to-transparent pointer-events-none z-0 dark:from-blue-900/40 dark:via-purple-900/30" />
          <div className="relative z-10 p-6 md:p-10">
            <MiniDashboard />
                  </div>
                </div>
      </ContainerScroll>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50 dark:bg-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Hear from educational leaders who have transformed their admissions with EduLead Pro.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about EduLead Pro
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mb-4"
              >
                <Card>
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-semibold">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </motion.div>
                    )}
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
        </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30 dark:bg-slate-900/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about EduLead Pro? Our team is here to help you transform your institution's admissions process.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-background rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href="mailto:contact@edulead.pro" className="font-medium hover:text-blue-600 transition-colors">
                        contact@edulead.pro
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href="tel:+915551234567" className="font-medium hover:text-green-600 transition-colors">
                        +91 (555) 123-4567
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">
                        Mumbai, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold mb-6">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form */}
                <div>
              <form onSubmit={handleContactSubmit} className="bg-background rounded-2xl p-8 shadow-lg space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium mb-2">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    id="institution"
                    value={contactForm.institution}
                    onChange={(e) => setContactForm({ ...contactForm, institution: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Send Message
                </Button>
              </form>
          </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground dark:bg-orange-600 dark:text-white">
        <div className="container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Institution?
          </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
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
            {/* Animated Taglines (if present in original) */}
          <RotatingTaglines />
        </motion.div>
        </div>
      </section>

      {/* Footer (from new template, will adapt to your info) */}
      <motion.footer 
        className="bg-muted py-12 dark:bg-slate-900"
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