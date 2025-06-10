import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Perfect for small institutions getting started",
      features: [
        "Up to 500 leads per month",
        "Basic lead management",
        "Email notifications",
        "Standard reporting",
        "Phone support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "149",
      description: "Ideal for growing institutions",
      features: [
        "Up to 2,000 leads per month",
        "Advanced lead scoring",
        "AI-powered insights",
        "Custom workflows",
        "WhatsApp & SMS integration",
        "Advanced analytics",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "349",
      description: "For large institutions with complex needs",
      features: [
        "Unlimited leads",
        "Full AI forecasting suite",
        "ERP integrations",
        "Custom reporting",
        "Multi-campus support",
        "API access",
        "Dedicated account manager",
        "24/7 premium support"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-slate-900">EduLead Pro</span>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your institution. All plans include our core CRM features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative shadow-lg border-slate-200 ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                <CardDescription className="text-slate-600 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="text-4xl font-bold text-slate-900">
                  ${plan.price}
                  <span className="text-lg font-normal text-slate-600">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Link href="/book-demo">
                    <Button 
                      className={`w-full text-white ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16 border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">Why Choose Our CRM?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Lightning Fast</h3>
              <p className="text-slate-600">
                Process leads 3x faster with our intelligent automation and AI-powered insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Secure & Reliable</h3>
              <p className="text-slate-600">
                Enterprise-grade security with 99.9% uptime guarantee and data encryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Award Winning</h3>
              <p className="text-slate-600">
                Trusted by 500+ institutions worldwide with 95% customer satisfaction rate.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-slate-900">Is there a free trial?</h4>
              <p className="text-slate-600 mb-4">
                Yes! All plans come with a 14-day free trial. No credit card required.
              </p>
              
              <h4 className="font-semibold mb-2 text-slate-900">Can I change plans anytime?</h4>
              <p className="text-slate-600 mb-4">
                Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-slate-900">What kind of support do you offer?</h4>
              <p className="text-slate-600 mb-4">
                We offer phone, email, and chat support. Enterprise customers get dedicated account managers.
              </p>
              
              <h4 className="font-semibold mb-2 text-slate-900">Is my data secure?</h4>
              <p className="text-slate-600 mb-4">
                Yes. We use enterprise-grade encryption and are compliant with all major security standards.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to Transform Your Admissions Process?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join hundreds of institutions already using our platform.
          </p>
          <div className="space-x-4">
            <Link href="/book-demo">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                Book a Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}