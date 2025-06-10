import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, MessageSquare } from "lucide-react";

export default function BookDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how our CRM can transform your lead management and boost your admissions process
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Demo Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Schedule Your Personalized Demo</CardTitle>
              <CardDescription>
                Fill out the form below and we'll schedule a 30-minute demo tailored to your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="john@company.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Institution/Company</Label>
                <Input id="company" placeholder="Your Institution Name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admissions-director">Admissions Director</SelectItem>
                    <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                    <SelectItem value="counselor">Counselor</SelectItem>
                    <SelectItem value="it-manager">IT Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="How many people in your team?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 people</SelectItem>
                    <SelectItem value="6-20">6-20 people</SelectItem>
                    <SelectItem value="21-50">21-50 people</SelectItem>
                    <SelectItem value="50+">50+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Tell us about your needs</Label>
                <Textarea 
                  id="message" 
                  placeholder="What challenges are you looking to solve with our CRM?"
                  className="min-h-[100px]"
                />
              </div>
              
              <Button className="w-full" size="lg">
                Book My Demo
              </Button>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <div className="space-y-8">
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
                    <p className="text-gray-600 text-sm">See our CRM in action with real scenarios from your industry</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Q&A Session</h4>
                    <p className="text-gray-600 text-sm">Get all your questions answered and discuss implementation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Join 500+ Institutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Educational institutions worldwide trust our platform to manage their admissions process.
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
          </div>
        </div>
      </div>
    </div>
  );
}