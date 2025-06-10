import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your institution. All plans include our core CRM features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative shadow-lg ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Link href="/book-demo">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our CRM?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Process leads 3x faster with our intelligent automation and AI-powered insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee and data encryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Award Winning</h3>
              <p className="text-gray-600">
                Trusted by 500+ institutions worldwide with 95% customer satisfaction rate.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 mb-4">
                Yes! All plans come with a 14-day free trial. No credit card required.
              </p>
              
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 mb-4">
                Absolutely. You can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What kind of support do you offer?</h4>
              <p className="text-gray-600 mb-4">
                We offer phone, email, and chat support. Enterprise customers get dedicated account managers.
              </p>
              
              <h4 className="font-semibold mb-2">Is my data secure?</h4>
              <p className="text-gray-600 mb-4">
                Yes. We use enterprise-grade encryption and are compliant with all major security standards.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Admissions Process?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of institutions already using our platform.
          </p>
          <div className="space-x-4">
            <Link href="/book-demo">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book a Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}