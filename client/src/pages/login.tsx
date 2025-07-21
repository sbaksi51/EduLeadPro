import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Brain, 
  Sparkles, 
  Target, 
  BarChart3, 
  MessageSquare,
  ArrowRight,
  Lightbulb,
  Rocket,
  Globe,
  Zap,
  Home,
  Star,
  ChevronDown
} from "lucide-react";
import { useEffect } from "react";
import NavBar from "@/components/ui/navbar";

export default function Login() {
  // Force dark mode on mount, revert on unmount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Home");
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Features", url: "/#features", icon: BarChart3 },
    { name: "AI Solutions", url: "/#ai-future", icon: Brain },
    { name: "Pricing", url: "/pricing", icon: Star },
    { name: "FAQ", url: "/#faq-section", icon: ChevronDown },
    { name: "Contact", url: "/#contact", icon: GraduationCap },
  ];

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
        setLocation("/dashboard");
      } else {
        throw new Error(data.message || "Login failed");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; name: string; email: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", userData);
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({
          title: "Signup successful",
          description: `Welcome to EduLead Pro, ${data.user.name}!`,
        });
        setLocation("/dashboard");
      } else {
        throw new Error(data.message || "Signup failed");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      signupMutation.mutate({ username, password, name, email });
    }
  };

  return (
    <>
      <NavBar
        items={navItems}
        setLocation={setLocation}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main gradient circles */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-orange-200 to-pink-200 dark:from-orange-900/20 dark:to-pink-900/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" />
          
          {/* Additional gradient elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-900/10 dark:to-blue-900/10 rounded-full blur-3xl opacity-30 animate-pulse-slower" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-green-200 to-teal-200 dark:from-green-900/10 dark:to-teal-900/10 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
          
          {/* Grid pattern with enhanced opacity */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Animated dots pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#80808008_1px,transparent_1px)] bg-[size:24px_24px] animate-dots" />
          
          {/* Floating icons with enhanced positioning and animations */}
          <div className="absolute top-1/4 left-1/4 animate-float-slow">
            <GraduationCap className="w-12 h-12 text-orange-500/20 dark:text-orange-400/20" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float">
            <BookOpen className="w-10 h-10 text-blue-500/20 dark:text-blue-400/20" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float-slow">
            <Users className="w-11 h-11 text-purple-500/20 dark:text-purple-400/20" />
          </div>
          <div className="absolute bottom-1/3 right-1/3 animate-float">
            <Brain className="w-9 h-9 text-pink-500/20 dark:text-pink-400/20" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-float-slow">
            <Sparkles className="w-8 h-8 text-yellow-500/20 dark:text-yellow-400/20" />
          </div>
          <div className="absolute top-1/4 right-1/3 animate-float">
            <Target className="w-10 h-10 text-green-500/20 dark:text-green-400/20" />
          </div>
          <div className="absolute bottom-1/2 right-1/4 animate-float-slow">
            <Lightbulb className="w-9 h-9 text-orange-500/20 dark:text-orange-400/20" />
          </div>
          <div className="absolute top-1/3 left-1/3 animate-float">
            <Rocket className="w-10 h-10 text-blue-500/20 dark:text-blue-400/20" />
          </div>
          <div className="absolute bottom-1/3 left-1/4 animate-float-slow">
            <Globe className="w-11 h-11 text-purple-500/20 dark:text-purple-400/20" />
          </div>
          <div className="absolute top-1/4 left-1/2 animate-float">
            <Zap className="w-9 h-9 text-yellow-500/20 dark:text-yellow-400/20" />
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => setLocation("/")}
            >
              <GraduationCap className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome to EduLead Pro</h1>
            <p className="text-slate-600 dark:text-slate-400">AI-Powered Admissions Management</p>
          </div>
          
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-slate-900 dark:text-slate-100">
                {isLogin ? "Sign in to your account" : "Create a new account"}
              </CardTitle>
              <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                {isLogin 
                  ? "Access your admissions dashboard and AI-powered tools"
                  : "Join EduLead Pro and start managing your admissions process"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required={!isLogin}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200 group"
                  disabled={isLogin ? loginMutation.isPending : signupMutation.isPending}
                >
                  <span className="flex items-center justify-center">
                    {isLogin 
                      ? (loginMutation.isPending ? "Signing in..." : "Sign in")
                      : (signupMutation.isPending ? "Creating account..." : "Create account")
                    }
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-colors duration-200"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span className="text-xs">AI Analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  <span className="text-xs">Smart Communication</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">Lead Scoring</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-xs">AI Insights</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}