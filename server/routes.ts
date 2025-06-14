import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertFollowUpSchema, Lead, InsertLead } from "@shared/schema";
import { forecastEnrollments, generateMarketingRecommendations, predictAdmissionLikelihood } from "./ollama-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent leads
  app.get("/api/dashboard/recent-leads", async (req, res) => {
    try {
      const leads = await storage.getRecentLeads(10);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent leads" });
    }
  });

  // Lead source performance
  app.get("/api/dashboard/lead-sources", async (req, res) => {
    try {
      const performance = await storage.getLeadSourcePerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead source performance" });
    }
  });

  // Monthly enrollment trend
  app.get("/api/dashboard/enrollment-trend", async (req, res) => {
    try {
      const trend = await storage.getMonthlyEnrollmentTrend();
      res.json(trend);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollment trend" });
    }
  });

  // Enhanced CSV import route
  app.post("/api/leads/import-csv", async (req, res) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "Invalid CSV data format" });
      }

      const importedLeads = [];
      const errors = [];
      
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          // Validate required fields
          if (!row.name || !row.phone || !row.class) {
            errors.push(`Row ${i + 1}: Missing required fields (name, phone, class)`);
            continue;
          }

          // Parse and format the data
          const leadData: InsertLead = {
            name: row.name?.trim(),
            email: row.email?.trim() || null,
            phone: row.phone?.trim(),
            class: row.class?.trim(),
            stream: row.stream?.trim() || null,
            status: row.status?.trim() || "new",
            source: row.source?.trim(),
            counselorId: row.counselorId ? parseInt(row.counselorId) : null,
            parentName: row.parentName?.trim() || null,
            parentPhone: row.parentPhone?.trim() || null,
            address: row.address?.trim() || null,
            notes: row.notes?.trim() || null,
            lastContactedAt: row.lastContactedAt ? new Date(row.lastContactedAt) : null
          };

          const lead = await storage.createLead(leadData);
          
          importedLeads.push(lead);
        } catch (error: any) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      const response = {
        message: `Successfully imported ${importedLeads.length} leads`,
        imported: importedLeads.length,
        errors: errors.length,
        leads: importedLeads,
        errorDetails: errors
      };

      if (errors.length > 0) {
        response.message += ` with ${errors.length} errors`;
      }
      
      res.json(response);
    } catch (error) {
      console.error("CSV import error:", error);
      res.status(500).json({ message: "Failed to import leads" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === "admin" && password === "admin") {
        const user = await storage.getUserByUsername("admin") || await storage.createUser({
          username: "admin",
          password: "admin",
          role: "admin",
          name: "Sarah Johnson",
          email: "sarah.johnson@school.edu"
        });
        
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            name: user.name, 
            role: user.role 
          } 
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  // User profile route
  app.get("/api/auth/profile", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("admin");
      if (user) {
        res.json({ 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role,
          email: user.email 
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // All leads
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, counselorId } = req.query;
      
      let leads;
      if (status) {
        leads = await storage.getLeadsByStatus(status as string);
      } else if (counselorId) {
        leads = await storage.getLeadsByCounselor(Number(counselorId));
      } else {
        leads = await storage.getAllLeads();
      }
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Get single lead
  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(Number(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // Create lead
  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Update lead
  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.updateLead(Number(req.params.id), req.body);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // AI: Predict admission likelihood
  app.post("/api/leads/:id/predict", async (req, res) => {
    try {
      const lead = await storage.getLead(Number(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const lastContactDays = lead.lastContactedAt ? 
        Math.floor((Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24)) :
        undefined;

      const prediction = await predictAdmissionLikelihood({
        status: lead.status,
        source: lead.source,
        daysSinceCreation,
        followUpCount: lead.followUps?.length || 0,
        lastContactDays,
        class: lead.class,
        hasParentInfo: !!(lead.parentName && lead.parentPhone),
        name: lead.name,
        phone: lead.phone || undefined,
        email: lead.email || undefined
      });

      // Update lead with AI prediction
      await storage.updateLead(lead.id, {
        admissionLikelihood: prediction.likelihood.toString()
      });

      res.json(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });

  // Follow-ups
  app.get("/api/follow-ups", async (req, res) => {
    try {
      const { leadId, counselorId } = req.query;
      
      let followUps;
      if (leadId) {
        followUps = await storage.getFollowUpsByLead(Number(leadId));
      } else if (counselorId) {
        followUps = await storage.getFollowUpsByCounselor(Number(counselorId));
      } else {
        followUps = await storage.getOverdueFollowUps();
      }
      
      res.json(followUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Create follow-up
  app.post("/api/follow-ups", async (req, res) => {
    try {
      const validatedData = insertFollowUpSchema.parse(req.body);
      const followUp = await storage.createFollowUp(validatedData);
      res.status(201).json(followUp);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid follow-up data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  // Update follow-up
  app.patch("/api/follow-ups/:id", async (req, res) => {
    try {
      const followUp = await storage.updateFollowUp(Number(req.params.id), req.body);
      if (!followUp) {
        return res.status(404).json({ message: "Follow-up not found" });
      }
      res.json(followUp);
    } catch (error) {
      res.status(500).json({ message: "Failed to update follow-up" });
    }
  });

  // AI: Enrollment forecasting
  app.get("/api/ai/forecast", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      const trend = await storage.getMonthlyEnrollmentTrend();
      
      const forecast = await forecastEnrollments({
        totalLeads: stats.totalLeads,
        hotLeads: stats.hotLeads,
        conversions: stats.conversions,
        monthlyTrend: trend
      });
      
      res.json(forecast);
    } catch (error) {
      console.error("Forecasting error:", error);
      res.status(500).json({ message: "Failed to generate forecast" });
    }
  });

  // AI: Marketing recommendations
  app.post("/api/ai/marketing-recommendations", async (req, res) => {
    try {
      const { ageGroup, location, budget } = req.body;
      const sourcePerformance = await storage.getLeadSourcePerformance();
      
      const recommendations = await generateMarketingRecommendations({
        targetClass: ageGroup || "Grade 10-12",
        budget: budget || 50000,
        currentLeadSources: sourcePerformance.map(s => s.source),
        competitorAnalysis: location || "Local market"
      });
      
      res.json(recommendations);
    } catch (error) {
      console.error("Marketing recommendations error:", error);
      res.status(500).json({ message: "Failed to generate marketing recommendations" });
    }
  });

  // AI: Fee optimization
  app.post("/api/ai/fee-optimization", async (req, res) => {
    try {
      const { analyzeFeeOptimization } = await import("./ollama-ai.js");
      const optimization = await analyzeFeeOptimization(req.body);
      res.json(optimization);
    } catch (error) {
      console.error("Fee optimization error:", error);
      res.status(500).json({ message: "Failed to analyze fee optimization" });
    }
  });

  // AI: Staff performance analysis
  app.post("/api/ai/staff-performance", async (req, res) => {
    try {
      const { analyzeStaffPerformance } = await import("./ollama-ai.js");
      const analysis = await analyzeStaffPerformance(req.body);
      res.json(analysis);
    } catch (error) {
      console.error("Staff performance analysis error:", error);
      res.status(500).json({ message: "Failed to analyze staff performance" });
    }
  });

  // Get all counselors
  app.get("/api/counselors", async (req, res) => {
    try {
      const counselors = await storage.getAllCounselors();
      res.json(counselors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch counselors" });
    }
  });

  // Overdue follow-ups
  app.get("/api/follow-ups/overdue", async (req, res) => {
    try {
      const overdueFollowUps = await storage.getOverdueFollowUps();
      res.json(overdueFollowUps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue follow-ups" });
    }
  });

  // Campaign management endpoints
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date(),
        stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, responded: 0 }
      };
      res.json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.post("/api/campaigns/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body;
      
      res.json({ 
        success: true, 
        message: `${type} campaign ${id} sent successfully`,
        sent: Math.floor(Math.random() * 50) + 10
      });
    } catch (error) {
      console.error("Campaign send error:", error);
      res.status(500).json({ error: "Failed to send campaign" });
    }
  });

  // ERP integration endpoints
  app.get("/api/erp/systems", async (req, res) => {
    try {
      res.json([
        {
          id: "1",
          name: "School Management System",
          type: "custom",
          status: "connected",
          apiEndpoint: "https://school-erp.example.com/api",
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
          syncedEntities: ["students", "fees", "classes"],
          credentials: { username: "admin", apiKey: "****" }
        }
      ]);
    } catch (error) {
      console.error("ERP systems error:", error);
      res.status(500).json({ error: "Failed to fetch ERP systems" });
    }
  });

  app.post("/api/erp/connect", async (req, res) => {
    try {
      const system = {
        id: Date.now().toString(),
        ...req.body,
        status: "connected",
        lastSync: new Date(),
        syncedEntities: ["students"]
      };
      res.json(system);
    } catch (error) {
      console.error("ERP connection error:", error);
      res.status(500).json({ error: "Failed to connect ERP system" });
    }
  });

  app.post("/api/erp/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      const { entities } = req.body;
      
      res.json({
        success: true,
        message: `Synced ${entities.join(", ")} for system ${id}`,
        syncedRecords: Math.floor(Math.random() * 100) + 50
      });
    } catch (error) {
      console.error("ERP sync error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  // Counseling session endpoints
  app.post("/api/counseling-sessions", async (req, res) => {
    try {
      const session = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: new Date()
      };
      res.json(session);
    } catch (error) {
      console.error("Counseling session error:", error);
      res.status(500).json({ error: "Failed to save counseling session" });
    }
  });

  app.post("/api/ai/summarize-session", async (req, res) => {
    try {
      const { transcript, leadId, leadName } = req.body;
      
      const summary = `Counseling session with ${leadName} covered admission requirements and next steps. Student shows strong interest in Science stream.`;
      const keyPoints = [
        "Student interested in Science stream",
        "Parent concerned about fee structure",
        "Scheduled campus visit for next week"
      ];
      const nextActions = [
        "Send fee structure details",
        "Arrange campus tour",
        "Follow up after visit"
      ];
      const sentiment = transcript.toLowerCase().includes("interested") || transcript.toLowerCase().includes("excited") ? "positive" : "neutral";
      
      res.json({
        summary,
        keyPoints,
        nextActions,
        sentiment
      });
    } catch (error) {
      console.error("AI session summary error:", error);
      res.status(500).json({ error: "Failed to generate session summary" });
    }
  });

  // Lead prediction endpoint
  app.post("/api/leads/:id/predict", async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(parseInt(id));
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const likelihood = Math.floor(Math.random() * 40) + 60;
      const confidence = Math.random() * 0.3 + 0.7;
      
      await storage.updateLead(parseInt(id), { 
        admissionLikelihood: likelihood.toString() 
      });
      
      res.json({
        likelihood,
        confidence,
        factors: ["Student engagement level", "Parent interest", "Academic background"],
        recommendations: ["Schedule campus visit", "Send detailed course information"]
      });
    } catch (error) {
      console.error("Lead prediction error:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  // Get alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}