import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, ArrowLeft, GraduationCap, IndianRupee, Users, Brain, Target, BarChart3, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your institution. All plans include our core CRM features and are designed for the Indian education market.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`relative shadow-lg hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}>
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
                    {plan.price}
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

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Is there a free trial?</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Yes! All plans come with a 14-day free trial. No credit card required.
              </p>
              
              <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Can I change plans anytime?</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">What kind of support do you offer?</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We offer phone, email, and WhatsApp support in English and Hindi. Enterprise customers get dedicated account managers.
              </p>
              
              <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Is my data secure?</h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Yes. We use enterprise-grade encryption and are compliant with Indian data protection standards.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">Ready to Transform Your Admissions Process?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join hundreds of Indian institutions already using our platform.
          </p>
          <div className="space-x-4">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                Book a Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}