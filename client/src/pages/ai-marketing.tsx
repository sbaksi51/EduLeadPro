import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Target, IndianRupee, Users, Copy, ExternalLink, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MarketingRecommendation {
  campaign_type: string;
  target_audience: string;
  platform: string;
  budget_suggestion: string;
  ad_copy: string;
  expected_leads: number;
}

export default function AIMarketing() {
  const [ageGroup, setAgeGroup] = useState("14-18");
  const [location, setLocation] = useState("Mumbai");
  const [budget, setBudget] = useState("50000");
  const [recommendations, setRecommendations] = useState<MarketingRecommendation[]>([]);
  const { toast } = useToast();

  const generateRecommendations = useMutation({
    mutationFn: async (data: { ageGroup: string; location: string; budget: number }) => {
      const response = await apiRequest("POST", "/api/ai/marketing-recommendations", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast({
        title: "Marketing Recommendations Generated",
        description: "AI has analyzed your requirements and generated campaign suggestions.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate recommendations at this time",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Ad copy has been copied to your clipboard",
    });
  };

  const platformIcons = {
    "Facebook & Instagram": "📘",
    "Google Ads": "🔍",
    "YouTube": "📺",
    "LinkedIn": "💼",
    "WhatsApp": "💬"
  };

  const handleGenerate = () => {
    generateRecommendations.mutate({
      ageGroup,
      location,
      budget: Number(budget)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Marketing" subtitle="Get AI-powered marketing campaign recommendations" />
      
      <main className="p-6 space-y-8">
        {/* Input Form */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Sparkles className="mr-3 text-purple-600" size={24} />
              Campaign Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label htmlFor="age-group" className="text-sm font-medium">Target Age Group</Label>
                <Input
                  id="age-group"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  placeholder="e.g., 14-18"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Delhi"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">Monthly Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  className="h-10"
                />
              </div>
            </div>
            <Button 
              className="mt-8 w-full md:w-auto h-11 px-6"
              onClick={handleGenerate}
              disabled={generateRecommendations.isPending}
            >
              <Megaphone className="mr-2" size={16} />
              {generateRecommendations.isPending ? "Generating..." : "Generate AI Recommendations"}
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="mr-3 text-blue-600" size={28} />
              Recommended Campaigns
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {recommendations.map((rec, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <span className="text-2xl mr-3">
                          {platformIcons[rec.platform as keyof typeof platformIcons] || "📱"}
                        </span>
                        {rec.campaign_type}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                        {rec.platform}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Users className="text-gray-500" size={18} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Target Audience</div>
                          <div className="text-sm text-gray-600">{rec.target_audience}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <IndianRupee className="text-gray-500" size={18} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Budget</div>
                          <div className="text-sm text-gray-600">{rec.budget_suggestion}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-900">Ad Copy</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-900 leading-relaxed">{rec.ad_copy}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-9"
                        onClick={() => copyToClipboard(rec.ad_copy)}
                      >
                        <Copy className="mr-2" size={14} />
                        Copy Ad Copy
                      </Button>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Expected Leads</div>
                        <div className="text-2xl font-bold text-green-600">{rec.expected_leads}</div>
                      </div>
                      <Button variant="outline" size="sm" className="h-9">
                        <ExternalLink className="mr-2" size={14} />
                        Create Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Marketing Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Campaign Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 text-lg">Timing Optimization</h4>
                <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                  Run admission campaigns during peak seasons (March-June, September-December) for maximum impact.
                </p>
              </div>
              <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 text-lg">Content Strategy</h4>
                <p className="text-sm text-green-700 mt-2 leading-relaxed">
                  Focus on student success stories, faculty achievements, and campus facilities to build trust.
                </p>
              </div>
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 text-lg">Audience Targeting</h4>
                <p className="text-sm text-purple-700 mt-2 leading-relaxed">
                  Target both students and parents with age-appropriate messaging and platforms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Metrics to Monitor</h4>
                  <div className="space-y-2">
                    {[
                      "Cost per Lead (CPL)",
                      "Click-through Rate (CTR)",
                      "Conversion Rate",
                      "Lead Quality Score",
                      "Return on Ad Spend (ROAS)"
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{metric}</span>
                        <Badge variant="outline">Track</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Creative Ideas */}
        <Card>
          <CardHeader>
            <CardTitle>Creative Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📱 Social Media Posts</h4>
                <p className="text-sm text-gray-600">Student testimonials, virtual campus tours, achievement highlights</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🎥 Video Content</h4>
                <p className="text-sm text-gray-600">Day-in-the-life videos, faculty interviews, alumni success stories</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📊 Infographics</h4>
                <p className="text-sm text-gray-600">Placement statistics, course curriculum, campus facilities comparison</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
