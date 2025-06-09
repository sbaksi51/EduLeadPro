import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface AdmissionPrediction {
  likelihood: number; // 0-100
  confidence: number; // 0-1
  factors: string[];
  recommendations: string[];
}

export interface EnrollmentForecast {
  nextMonth: number;
  nextQuarter: number;
  confidence: number;
  trends: string[];
}

export interface MarketingRecommendation {
  targetAudience: string;
  platforms: string[];
  budget: string;
  adCopy: string[];
  creativeIdeas: string[];
}

export async function predictAdmissionLikelihood(
  leadData: {
    studentName: string;
    class: string;
    source: string;
    status: string;
    followUpCount: number;
    daysSinceFirstContact: number;
    parentEngagement: string;
  }
): Promise<AdmissionPrediction> {
  try {
    const prompt = `Analyze this lead data and predict admission likelihood:
    
    Student: ${leadData.studentName}
    Class: ${leadData.class}
    Lead Source: ${leadData.source}
    Current Status: ${leadData.status}
    Follow-up Count: ${leadData.followUpCount}
    Days Since First Contact: ${leadData.daysSinceFirstContact}
    Parent Engagement: ${leadData.parentEngagement}
    
    Provide a JSON response with:
    1. likelihood (0-100 percentage)
    2. confidence (0-1 decimal)
    3. factors (array of key factors influencing the prediction)
    4. recommendations (array of actionable recommendations)
    
    Consider factors like lead source quality, engagement level, follow-up frequency, and typical conversion patterns.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in educational admissions analytics. Provide accurate, data-driven predictions based on lead behavior patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      likelihood: Math.max(0, Math.min(100, result.likelihood || 50)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      factors: Array.isArray(result.factors) ? result.factors : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  } catch (error) {
    console.error("Error predicting admission likelihood:", error);
    // Return default prediction on error
    return {
      likelihood: 50,
      confidence: 0.3,
      factors: ["Unable to analyze - using default prediction"],
      recommendations: ["Contact parent for more information", "Schedule school visit"]
    };
  }
}

export async function forecastEnrollments(
  historicalData: Array<{ month: string; enrollments: number }>,
  currentLeads: Array<{ status: string; likelihood?: number }>
): Promise<EnrollmentForecast> {
  try {
    const prompt = `Based on this enrollment data, predict future enrollments:
    
    Historical Monthly Enrollments:
    ${historicalData.map(d => `${d.month}: ${d.enrollments}`).join('\n')}
    
    Current Lead Pipeline:
    Total Leads: ${currentLeads.length}
    Hot Leads: ${currentLeads.filter(l => l.status === 'Interested' || l.status === 'Hot').length}
    Enrolled: ${currentLeads.filter(l => l.status === 'Enrolled').length}
    
    Provide a JSON response with:
    1. nextMonth (predicted enrollments for next month)
    2. nextQuarter (predicted enrollments for next 3 months)
    3. confidence (0-1 decimal indicating prediction confidence)
    4. trends (array of trend observations)
    
    Consider seasonality, current pipeline strength, and historical patterns.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI forecasting specialist for educational institutions. Provide realistic enrollment predictions based on historical data and current pipeline."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      nextMonth: Math.max(0, result.nextMonth || 50),
      nextQuarter: Math.max(0, result.nextQuarter || 150),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
      trends: Array.isArray(result.trends) ? result.trends : [],
    };
  } catch (error) {
    console.error("Error forecasting enrollments:", error);
    return {
      nextMonth: 50,
      nextQuarter: 150,
      confidence: 0.5,
      trends: ["Unable to analyze trends - using default forecast"]
    };
  }
}

export async function generateMarketingRecommendations(
  leadSources: Array<{ source: string; count: number; conversionRate: number }>,
  targetClass: string,
  budget: string
): Promise<MarketingRecommendation> {
  try {
    const prompt = `Generate marketing recommendations for a school:
    
    Current Lead Sources Performance:
    ${leadSources.map(s => `${s.source}: ${s.count} leads (${s.conversionRate}% conversion)`).join('\n')}
    
    Target: ${targetClass} admissions
    Budget: ${budget}
    
    Provide a JSON response with:
    1. targetAudience (description of ideal audience)
    2. platforms (array of recommended marketing platforms)
    3. budget (budget allocation recommendations)
    4. adCopy (array of 3-5 ad copy suggestions)
    5. creativeIdeas (array of creative campaign ideas)
    
    Focus on high-performing channels and provide actionable marketing strategies.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI marketing specialist for educational institutions. Provide practical, results-driven marketing recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      targetAudience: result.targetAudience || "Parents seeking quality education",
      platforms: Array.isArray(result.platforms) ? result.platforms : ["Facebook", "Google Ads"],
      budget: result.budget || "Distribute across top-performing channels",
      adCopy: Array.isArray(result.adCopy) ? result.adCopy : ["Quality education for your child's bright future"],
      creativeIdeas: Array.isArray(result.creativeIdeas) ? result.creativeIdeas : ["Virtual school tour campaign"],
    };
  } catch (error) {
    console.error("Error generating marketing recommendations:", error);
    return {
      targetAudience: "Parents of school-age children",
      platforms: ["Facebook", "Google Ads", "WhatsApp"],
      budget: "Focus budget on highest-converting channels",
      adCopy: ["Give your child the best education", "Quality learning environment", "Experienced teachers, bright futures"],
      creativeIdeas: ["Student success stories", "Virtual campus tours", "Parent testimonial videos"],
    };
  }
}
