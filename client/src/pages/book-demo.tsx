import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MessageSquare, ArrowLeft, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function BookDemo() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institutionName: "",
    studentsCount: "",
    additionalInfo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Demo Request Submitted!",
        description: "We'll contact you within 24 hours to schedule your personalized demo.",
      });
      setIsSubmitting(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        institutionName: "",
        studentsCount: "",
        additionalInfo: ""
      });
    }, 1000);
  };

  const nav = (
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
                  onClick={() => {
                    localStorage.removeItem("user");
                    setUser(null);
                  }}
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {nav}
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Book Your Demo
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See how our AI-powered CRM can transform your institution's admissions process and boost enrollment in India.
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Demo Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Schedule Your Personalized Demo</CardTitle>
                <CardDescription className="text-slate-600">
                  Fill out the form below and we'll schedule a 30-minute demo tailored to your institution's needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Amit" 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Sharma" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="amit@yourinstitution.in" 
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input 
                      id="institutionName" 
                      placeholder="Your School/College Name" 
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange("institutionName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentsCount">Students in Institution *</Label>
                    <Select onValueChange={(value) => handleInputChange("studentsCount", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your institution size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under 500 students</SelectItem>
                        <SelectItem value="500-1000">500 - 1,000 students</SelectItem>
                        <SelectItem value="1000-2500">1,000 - 2,500 students</SelectItem>
                        <SelectItem value="2500-5000">2,500 - 5,000 students</SelectItem>
                        <SelectItem value="over-5000">Over 5,000 students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Textarea 
                      id="additionalInfo" 
                      placeholder="Tell us about your current challenges or specific needs..."
                      className="min-h-[100px]"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Scheduling Demo..." : "Book My Demo"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          {/* What to Expect */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Personal Introduction</h4>
                    <p className="text-gray-600 text-sm">Meet your dedicated specialist and discuss your current workflow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Live Platform Demo</h4>
                    <p className="text-gray-600 text-sm">See our CRM in action with real scenarios from Indian institutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Q&A Session</h4>
                    <p className="text-gray-600 text-sm">Get all your questions answered and discuss implementation for your Indian institution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Join 500+ Indian Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Leading Indian schools, colleges, and coaching centers trust our platform to manage their admissions process.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">3x</div>
                    <div className="text-sm text-gray-600">Faster Lead Processing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}