import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertFollowUpSchema, Lead, InsertLead } from "@shared/schema";
import { forecastEnrollments, generateMarketingRecommendations, predictAdmissionLikelihood } from "./ollama-ai";
import PDFDocument from "pdfkit";
import { db } from "./lib/db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const leadStats = await storage.getLeadStats();
      const enrollmentStats = await storage.getEnrollmentStats();
      const feeStats = await storage.getFeeStats();
      
      // Calculate trends (comparing current month vs previous month)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get current month leads
      const currentMonthLeads = await storage.getLeadsByDateRange(
        new Date(currentYear, currentMonth, 1),
        new Date(currentYear, currentMonth + 1, 0)
      );
      
      // Get previous month leads
      const previousMonthLeads = await storage.getLeadsByDateRange(
        new Date(currentYear, currentMonth - 1, 1),
        new Date(currentYear, currentMonth, 0)
      );
      
      // Calculate trends
      const leadTrend = previousMonthLeads.length > 0 
        ? ((currentMonthLeads.length - previousMonthLeads.length) / previousMonthLeads.length) * 100
        : 0;
      
      // Calculate conversion rate
      const conversionRate = leadStats.totalLeads > 0 
        ? (leadStats.conversions / leadStats.totalLeads) * 100 
        : 0;
      
      // Calculate estimated revenue (assuming average fee per student)
      const avgFeePerStudent = 80000; // ₹80,000 average fee
      const revenue = enrollmentStats.activeEnrollments * avgFeePerStudent;
      
      const stats = {
        totalLeads: leadStats.totalLeads,
        activeStudents: enrollmentStats.activeEnrollments,
        conversionRate: Math.round(conversionRate * 100) / 100,
        revenue: revenue,
        leadTrend: Math.round(leadTrend * 100) / 100,
        studentTrend: enrollmentStats.enrollmentTrend,
        conversionTrend: 0, // Placeholder
        revenueTrend: 0, // Placeholder
        hotLeads: leadStats.hotLeads,
        conversions: leadStats.conversions,
        newLeadsToday: leadStats.newLeadsToday,
        totalPending: feeStats.totalPending,
        totalPaid: feeStats.totalPaid,
        collectionRate: feeStats.collectionRate,
        // Additional enrollment data
        totalEnrollments: enrollmentStats.totalEnrollments,
        newEnrollmentsThisMonth: enrollmentStats.newEnrollmentsThisMonth
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent leads
  app.get("/api/dashboard/leads", async (req, res) => {
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
        res.json({
          success: true,
          user: {
            id: 1,
            username: "admin",
            name: "Sarah Johnson",
            role: "admin"
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

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password, name, email } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        password,
        name,
        email,
        role: "counselor" // Default role for new signups
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ success: false, message: "Signup failed" });
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
      console.error("Error fetching leads:", error);
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
      // Convert date fields if they exist and are valid strings, otherwise set to null
      const updates = { ...req.body };
      const dateFields = ["lastContactedAt", "assignedAt", "createdAt", "updatedAt"];
      for (const field of dateFields) {
        if (field in updates) {
          if (!updates[field] || updates[field] === "" || updates[field] === null) {
            updates[field] = null;
          } else if (typeof updates[field] === "string" && !isNaN(Date.parse(updates[field]))) {
            updates[field] = new Date(updates[field]);
          } else if (!(updates[field] instanceof Date)) {
            updates[field] = null;
          }
        }
      }
      const lead = await storage.updateLead(Number(req.params.id), updates);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
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

      // Get follow-ups count for this lead
      const followUps = await storage.getFollowUpsByLead(lead.id);
      const followUpCount = followUps.length;

      const prediction = await predictAdmissionLikelihood({
        status: lead.status,
        source: lead.source,
        daysSinceCreation,
        followUpCount: followUpCount,
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
      res.json([]); // Return empty array for now since getAlerts doesn't exist
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // E-Mandate endpoints
  app.get("/api/e-mandates", async (req, res) => {
    try {
      const eMandates = await storage.getAllEMandates();
      res.json(eMandates);
    } catch (error) {
      console.error("E-Mandates fetch error:", error);
      res.status(500).json({ message: "Failed to fetch E-Mandates" });
    }
  });

  app.post("/api/e-mandates", async (req, res) => {
    try {
      const eMandateData = {
        leadId: req.body.leadId,
        mandateId: req.body.mandateId,
        bankAccount: req.body.accountNumber,
        ifscCode: req.body.ifscCode,
        maxAmount: String(Number(req.body.maxAmount)),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        status: req.body.status || "active",
        bankName: req.body.bankName
      };
      console.log("E-Mandate insert data:", eMandateData);
      const eMandate = await storage.createEMandate(eMandateData);
      // Update lead status to active
      await storage.updateLead(req.body.leadId, { status: "active" });
      res.status(201).json(eMandate);
    } catch (error) {
      console.error("E-Mandate DB insert error:", error);
      res.status(500).json({ message: "Failed to create E-Mandate" });
    }
  });

  app.get("/api/e-mandates/:id", async (req, res) => {
    try {
      const eMandate = await storage.getEMandate(parseInt(req.params.id));
      if (!eMandate) {
        return res.status(404).json({ message: "E-Mandate not found" });
      }
      res.json(eMandate);
    } catch (error) {
      console.error("E-Mandate fetch error:", error);
      res.status(500).json({ message: "Failed to fetch E-Mandate" });
    }
  });

  app.patch("/api/e-mandates/:id", async (req, res) => {
    try {
      const eMandate = await storage.updateEMandate(parseInt(req.params.id), req.body);
      res.json(eMandate);
    } catch (error) {
      console.error("E-Mandate update error:", error);
      res.status(500).json({ message: "Failed to update E-Mandate" });
    }
  });

  app.delete("/api/e-mandates/:id", async (req, res) => {
    try {
      const mandate = await storage.getEMandate(parseInt(req.params.id));
      if (!mandate) return res.status(404).json({ message: "Not found" });
      await storage.deleteEMandate(mandate.id);
      res.json({ message: "E-Mandate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete E-Mandate" });
    }
  });

  // Global Class Fee Management Routes
  app.get("/api/global-class-fees", async (req, res) => {
    try {
      const { className } = req.query;
      if (className) {
        const fees = await storage.getGlobalClassFeesByClass(className as string);
        res.json(fees);
      } else {
        const fees = await storage.getAllGlobalClassFees();
        res.json(fees);
      }
    } catch (error) {
      console.error("Global class fees fetch error:", error);
      res.status(500).json({ message: "Failed to fetch global class fees" });
    }
  });

  app.get("/api/global-class-fees/:id", async (req, res) => {
    try {
      const fee = await storage.getGlobalClassFee(parseInt(req.params.id));
      if (!fee) {
        return res.status(404).json({ message: "Global class fee not found" });
      }
      res.json(fee);
    } catch (error) {
      console.error("Global class fee fetch error:", error);
      res.status(500).json({ message: "Failed to fetch global class fee" });
    }
  });

  app.post("/api/global-class-fees", async (req, res) => {
    try {
      console.log("Received global class fee request:", req.body);
      
      const globalClassFeeData = {
        className: req.body.className,
        feeType: req.body.feeType,
        amount: String(Number(req.body.amount)),
        frequency: req.body.frequency,
        academicYear: req.body.academicYear,
        description: req.body.description,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };
      
      console.log("Processed global class fee data:", globalClassFeeData);
      
      const globalClassFee = await storage.createGlobalClassFee(globalClassFeeData);
      console.log("Created global class fee:", globalClassFee);
      
      res.status(201).json(globalClassFee);
    } catch (error) {
      console.error("Global class fee creation error:", error);
      res.status(500).json({ message: "Failed to create global class fee", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/global-class-fees/:id", async (req, res) => {
    try {
      const updates = {
        className: req.body.className,
        feeType: req.body.feeType,
        amount: req.body.amount ? String(Number(req.body.amount)) : undefined,
        frequency: req.body.frequency,
        academicYear: req.body.academicYear,
        description: req.body.description,
        isActive: req.body.isActive
      };
      
      const globalClassFee = await storage.updateGlobalClassFee(parseInt(req.params.id), updates);
      if (!globalClassFee) {
        return res.status(404).json({ message: "Global class fee not found" });
      }
      res.json(globalClassFee);
    } catch (error) {
      console.error("Global class fee update error:", error);
      res.status(500).json({ message: "Failed to update global class fee" });
    }
  });

  app.delete("/api/global-class-fees/:id", async (req, res) => {
    try {
      const fee = await storage.getGlobalClassFee(parseInt(req.params.id));
      if (!fee) {
        return res.status(404).json({ message: "Global class fee not found" });
      }
      await storage.deleteGlobalClassFee(fee.id);
      res.json({ message: "Global class fee deleted successfully" });
    } catch (error) {
      console.error("Global class fee deletion error:", error);
      res.status(500).json({ message: "Failed to delete global class fee" });
    }
  });

  // Fee Structure Routes (for individual student fees)
  app.get("/api/fee-structures", async (req, res) => {
    try {
      const feeStructures = await storage.getAllFeeStructures();
      res.json(feeStructures);
    } catch (error) {
      console.error("Fee structures fetch error:", error);
      res.status(500).json({ message: "Failed to fetch fee structures" });
    }
  });

  app.post("/api/fee-structures", async (req, res) => {
    try {
      const feeStructureData = {
        class: req.body.class,
        stream: req.body.stream,
        totalFees: String(Number(req.body.totalFees)),
        installments: req.body.installments,
        academicYear: req.body.academicYear
      };
      
      const feeStructure = await storage.createFeeStructure(feeStructureData);
      res.status(201).json(feeStructure);
    } catch (error) {
      console.error("Fee structure creation error:", error);
      res.status(500).json({ message: "Failed to create fee structure" });
    }
  });

  // Fee Payments Routes
  app.get("/api/fee-payments", async (req, res) => {
    try {
      const { studentId } = req.query;
      if (studentId) {
        const payments = await storage.getFeePaymentsByStudent(parseInt(studentId as string));
        res.json(payments);
      } else {
        const payments = await storage.getAllFeePayments();
        res.json(payments);
      }
    } catch (error) {
      console.error("Fee payments fetch error:", error);
      res.status(500).json({ message: "Failed to fetch fee payments" });
    }
  });

  app.post("/api/fee-payments", async (req, res) => {
    try {
      const feePaymentData = {
        leadId: req.body.leadId,
        amount: String(Number(req.body.amount)),
        paymentDate: req.body.paymentDate,
        paymentMode: req.body.paymentMode,
        receiptNumber: req.body.receiptNumber,
        installmentNumber: req.body.installmentNumber,
        transactionId: req.body.transactionId,
        status: req.body.status || "completed"
      };
      
      const feePayment = await storage.createFeePayment(feePaymentData);
      
      // Check if this payment is for an EMI plan and update completion status
      if (req.body.installmentNumber) {
        const emiPlans = await storage.getEmiPlansByStudent(req.body.leadId);
        for (const emiPlan of emiPlans) {
          const isCompleted = await storage.checkEmiPlanCompletion(emiPlan.id);
          if (isCompleted && emiPlan.status !== 'completed') {
            await storage.updateEmiPlan(emiPlan.id, { status: 'completed' });
          }
        }
      }
      
      res.status(201).json(feePayment);
    } catch (error) {
      console.error("Fee payment creation error:", error);
      res.status(500).json({ message: "Failed to create fee payment" });
    }
  });

  // Fee Stats Route
  app.get("/api/fee-stats", async (req, res) => {
    try {
      const feeStats = await storage.getFeeStats();
      res.json(feeStats);
    } catch (error) {
      console.error("Fee stats fetch error:", error);
      res.status(500).json({ message: "Failed to fetch fee stats" });
    }
  });

  // EMI Plan Routes
  app.get("/api/emi-plans", async (req, res) => {
    try {
      const { studentId } = req.query;
      if (studentId) {
        const emiPlans = await storage.getEmiPlansByStudent(parseInt(studentId as string));
        res.json(emiPlans);
      } else {
        const emiPlans = await storage.getAllEmiPlans();
        res.json(emiPlans);
      }
    } catch (error) {
      console.error("EMI plans fetch error:", error);
      res.status(500).json({ message: "Failed to fetch EMI plans" });
    }
  });

  app.get("/api/emi-plans/:id", async (req, res) => {
    try {
      const emiPlan = await storage.getEmiPlan(parseInt(req.params.id));
      if (!emiPlan) {
        return res.status(404).json({ message: "EMI plan not found" });
      }
      res.json(emiPlan);
    } catch (error) {
      console.error("EMI plan fetch error:", error);
      res.status(500).json({ message: "Failed to fetch EMI plan" });
    }
  });

  // New endpoint to get pending EMIs for a student
  app.get("/api/emi-plans/:id/pending-emis", async (req, res) => {
    try {
      const emiPlan = await storage.getEmiPlan(parseInt(req.params.id));
      if (!emiPlan) {
        return res.status(404).json({ message: "EMI plan not found" });
      }

      const pendingEmis = await storage.getPendingEmisForPlan(parseInt(req.params.id));
      res.json(pendingEmis);
    } catch (error) {
      console.error("Pending EMIs fetch error:", error);
      res.status(500).json({ message: "Failed to fetch pending EMIs" });
    }
  });

  // New endpoint to get EMI payment progress
  app.get("/api/emi-plans/:id/payment-progress", async (req, res) => {
    try {
      const emiPlan = await storage.getEmiPlan(parseInt(req.params.id));
      if (!emiPlan) {
        return res.status(404).json({ message: "EMI plan not found" });
      }

      const progress = await storage.getEmiPaymentProgress(parseInt(req.params.id));
      res.json(progress);
    } catch (error) {
      console.error("EMI payment progress fetch error:", error);
      res.status(500).json({ message: "Failed to fetch EMI payment progress" });
    }
  });

  app.post("/api/emi-plans", async (req, res) => {
    try {
      const emiPlanData = {
        studentId: req.body.studentId,
        planType: req.body.planType,
        totalAmount: String(Number(req.body.totalAmount)),
        emiPeriod: req.body.emiPeriod,
        emiAmount: String(Number(req.body.emiAmount)),
        downPayment: String(Number(req.body.downPayment || 0)),
        discount: String(Number(req.body.discount || 0)),
        interestRate: String(Number(req.body.interestRate || 0)),
        startDate: req.body.startDate,
        frequency: req.body.frequency || "monthly",
        processingFee: String(Number(req.body.processingFee || 0)),
        lateFee: String(Number(req.body.lateFee || 0)),
        receiptNumber: req.body.receiptNumber,
        status: req.body.status || "active"
      };
      
      const emiPlan = await storage.createEmiPlan(emiPlanData);
      res.status(201).json(emiPlan);
    } catch (error) {
      console.error("EMI plan creation error:", error);
      res.status(500).json({ message: "Failed to create EMI plan" });
    }
  });

  app.patch("/api/emi-plans/:id", async (req, res) => {
    try {
      const emiPlan = await storage.updateEmiPlan(parseInt(req.params.id), req.body);
      if (!emiPlan) {
        return res.status(404).json({ message: "EMI plan not found" });
      }
      res.json(emiPlan);
    } catch (error) {
      console.error("EMI plan update error:", error);
      res.status(500).json({ message: "Failed to update EMI plan" });
    }
  });

  app.delete("/api/emi-plans/:id", async (req, res) => {
    try {
      const emiPlan = await storage.getEmiPlan(parseInt(req.params.id));
      if (!emiPlan) return res.status(404).json({ message: "Not found" });
      await storage.deleteEmiPlan(emiPlan.id);
      res.json({ message: "EMI plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete EMI plan" });
    }
  });

  // Staff Management Routes
  app.get("/api/staff", async (req, res) => {
    try {
      const { role, department, status } = req.query;
      let staff = await storage.getAllStaff();
      
      // Apply filters
      if (role) {
        staff = staff.filter(s => s.role === role);
      }
      if (department) {
        staff = staff.filter(s => s.department === department);
      }
      if (status) {
        staff = staff.filter(s => s.isActive === (status === 'active'));
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Get staff error:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const staff = await storage.getStaff(parseInt(id));
      
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Get staff by ID error:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const staffData = req.body;
      
      // Validate required fields
      if (!staffData.employeeId || !staffData.name || !staffData.phone || !staffData.role || !staffData.dateOfJoining) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Create staff error:", error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const staff = await storage.updateStaff(parseInt(id), updates);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json(staff);
    } catch (error) {
      console.error("Update staff error:", error);
      res.status(500).json({ message: "Failed to update staff" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStaff(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Staff not found" });
      }
      
      res.json({ message: "Staff deleted successfully" });
    } catch (error) {
      console.error("Delete staff error:", error);
      res.status(500).json({ message: "Failed to delete staff" });
    }
  });

  app.get("/api/staff/roles", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      const roles = Array.from(new Set(staff.map(s => s.role)));
      res.json(roles);
    } catch (error) {
      console.error("Get staff roles error:", error);
      res.status(500).json({ message: "Failed to fetch staff roles" });
    }
  });

  app.get("/api/staff/departments", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));
      res.json(departments);
    } catch (error) {
      console.error("Get staff departments error:", error);
      res.status(500).json({ message: "Failed to fetch staff departments" });
    }
  });

  // Attendance Routes
  app.get("/api/staff/:id/attendance", async (req, res) => {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      
      const attendance = await storage.getAttendanceByStaff(
        parseInt(id), 
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
      
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = req.body;
      const attendance = await storage.createAttendance(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Create attendance error:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.get("/api/attendance/stats", async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      const stats = await storage.getAttendanceStats(
        month ? parseInt(month as string) : currentDate.getMonth() + 1,
        year ? parseInt(year as string) : currentDate.getFullYear()
      );
      res.json(stats);
    } catch (error) {
      console.error("Get attendance stats error:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Payroll Routes
  app.get("/api/staff/:id/payroll", async (req, res) => {
    try {
      const { id } = req.params;
      const payroll = await storage.getPayrollByStaff(parseInt(id));
      res.json(payroll);
    } catch (error) {
      console.error("Get payroll error:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", async (req, res) => {
    try {
      const payrollData = req.body;
      console.log('Creating payroll with data:', JSON.stringify(payrollData, null, 2));
      
      // Validate required fields
      if (!payrollData.staffId || !payrollData.month || !payrollData.year || 
          !payrollData.basicSalary || !payrollData.netSalary) {
        console.error('Missing required payroll fields:', payrollData);
        return res.status(400).json({ 
          message: "Missing required fields: staffId, month, year, basicSalary, netSalary" 
        });
      }

      // Ensure numeric values are properly formatted
      const sanitizedData = {
        ...payrollData,
        staffId: parseInt(payrollData.staffId),
        month: parseInt(payrollData.month),
        year: parseInt(payrollData.year),
        basicSalary: parseFloat(payrollData.basicSalary),
        allowances: parseFloat(payrollData.allowances || 0),
        deductions: parseFloat(payrollData.deductions || 0),
        overtime: parseFloat(payrollData.overtime || 0),
        netSalary: parseFloat(payrollData.netSalary),
        attendedDays: parseInt(payrollData.attendedDays || 30),
        status: payrollData.status || 'pending'
      };

      console.log('Sanitized payroll data:', JSON.stringify(sanitizedData, null, 2));
      
      const payroll = await storage.createPayroll(sanitizedData);
      console.log('Successfully created payroll record:', JSON.stringify(payroll, null, 2));
      
      res.status(201).json({
        success: true,
        message: 'Payroll created successfully',
        data: payroll
      });
    } catch (error) {
      console.error("Create payroll error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to create payroll record",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/payroll/stats", async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      const stats = await storage.getPayrollStats(
        month ? parseInt(month as string) : currentDate.getMonth() + 1,
        year ? parseInt(year as string) : currentDate.getFullYear()
      );
      res.json(stats);
    } catch (error) {
      console.error("Get payroll stats error:", error);
      res.status(500).json({ message: "Failed to fetch payroll stats" });
    }
  });

  app.post("/api/payroll/bulk-generate", async (req, res) => {
    try {
      const { month, year, staffIds, payrollData } = req.body;
      console.log('Bulk payroll generation request:', JSON.stringify(req.body, null, 2));
      
      if (!payrollData || !Array.isArray(payrollData)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid payroll data format" 
        });
      }

      const createdPayrolls = [];
      const failedPayrolls = [];
      
      for (const payrollItem of payrollData) {
        try {
          console.log('Creating payroll for staff:', payrollItem.staffId);
          
          // Validate required fields for each payroll item
          if (!payrollItem.staffId || !payrollItem.month || !payrollItem.year || 
              !payrollItem.basicSalary || !payrollItem.netSalary) {
            console.error('Missing required fields for payroll item:', payrollItem);
            failedPayrolls.push({
              staffId: payrollItem.staffId,
              error: 'Missing required fields'
            });
            continue;
          }

          // Sanitize data for each payroll item
          const sanitizedItem = {
            ...payrollItem,
            staffId: parseInt(payrollItem.staffId),
            month: parseInt(payrollItem.month),
            year: parseInt(payrollItem.year),
            basicSalary: parseFloat(payrollItem.basicSalary),
            allowances: parseFloat(payrollItem.allowances || 0),
            deductions: parseFloat(payrollItem.deductions || 0),
            overtime: parseFloat(payrollItem.overtime || 0),
            netSalary: parseFloat(payrollItem.netSalary),
            attendedDays: parseInt(payrollItem.attendedDays || 30),
            status: payrollItem.status || 'pending'
          };

          const payroll = await storage.createPayroll(sanitizedItem);
          createdPayrolls.push(payroll);
          console.log(`Successfully created payroll for staff ${payrollItem.staffId}:`, payroll.id);
        } catch (error) {
          console.error(`Error creating payroll for staff ${payrollItem.staffId}:`, error);
          failedPayrolls.push({
            staffId: payrollItem.staffId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`Bulk payroll generation completed. Success: ${createdPayrolls.length}, Failed: ${failedPayrolls.length}`);
      
      res.status(201).json({
        success: true,
        message: `Successfully generated ${createdPayrolls.length} payroll records`,
        createdPayrolls,
        failedPayrolls,
        summary: {
          total: payrollData.length,
          successful: createdPayrolls.length,
          failed: failedPayrolls.length
        }
      });
    } catch (error) {
      console.error("Bulk payroll generation error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to generate bulk payroll",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Staff Analytics
  app.get("/api/staff/analytics", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      const currentDate = new Date();
      
      // Calculate analytics
      const totalStaff = staff.length;
      const activeStaff = staff.filter(s => s.isActive).length;
      const roleBreakdown = staff.reduce((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const departmentBreakdown = staff.reduce((acc, s) => {
        if (s.department) {
          acc[s.department] = (acc[s.department] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate average salary by role
      const salaryByRole = staff.reduce((acc, s) => {
        if (s.salary) {
          if (!acc[s.role]) {
            acc[s.role] = { total: 0, count: 0 };
          }
          acc[s.role].total += Number(s.salary);
          acc[s.role].count += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; count: number }>);
      
      // Calculate average salaries
      const averageSalaryByRole: Record<string, number> = {};
      Object.keys(salaryByRole).forEach(role => {
        if (salaryByRole[role].count > 0) {
          averageSalaryByRole[role] = salaryByRole[role].total / salaryByRole[role].count;
        }
      });
      
      // Recent hires (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const recentHires = staff.filter(s => 
        new Date(s.dateOfJoining) >= sixMonthsAgo
      ).length;
      
      const analytics = {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        roleBreakdown,
        departmentBreakdown,
        salaryByRole: averageSalaryByRole,
        recentHires,
        averageSalary: staff.reduce((sum, s) => sum + (s.salary ? Number(s.salary) : 0), 0) / staff.filter(s => s.salary).length
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Get staff analytics error:", error);
      res.status(500).json({ message: "Failed to fetch staff analytics" });
    }
  });

  app.post("/api/payroll/generate-slip", async (req, res) => {
    try {
      const { employeeName, month, year, basicSalary, netSalary, attendedDays, workingDays } = req.body;

      // Set response headers for PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Salary_Slip_${employeeName.replace(/[^a-zA-Z0-9_]/g, "")}_${month}_${year}.pdf`
      );

      // Create PDF
      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(20).text("Salary Slip", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Employee: ${employeeName}`);
      doc.text(`Month: ${month}/${year}`);
      doc.text(`Basic Salary: ₹${basicSalary}`);
      doc.text(`Net Salary: ₹${netSalary}`);
      doc.text(`Days Worked: ${attendedDays} / ${workingDays}`);
      doc.end();

    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Test PDF generation endpoint
  app.get("/api/test-pdf", async (req, res) => {
    try {
      // Create a simple test PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        autoFirstPage: true
      });

      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        try {
          const pdfData = Buffer.concat(chunks);
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Length', pdfData.length);
          res.setHeader('Content-Disposition', 'attachment; filename="test-document.pdf"');
          res.setHeader('Cache-Control', 'no-cache');
          
          res.end(pdfData);
        } catch (error) {
          console.error("Error sending test PDF response:", error);
          res.status(500).json({ message: "Failed to send test PDF" });
        }
      });

      doc.on('error', (error) => {
        console.error("Test PDF generation error:", error);
        res.status(500).json({ message: "Failed to generate test PDF" });
      });

      // Add simple content
      doc.fontSize(20).text('Test PDF Document', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('This is a test PDF to verify PDF generation is working.');
      doc.moveDown();
      doc.text(`Generated at: ${new Date().toLocaleString()}`);
      
      doc.end();

    } catch (error) {
      console.error("Error generating test PDF:", error);
      res.status(500).json({ message: "Failed to generate test PDF" });
    }
  });

  // Generate salary slip PDF
  app.get("/api/payroll/generate-slip/:employeeId/:month/:year", async (req, res) => {
    try {
      const { employeeId, month, year } = req.params;
      
      // Validate parameters
      if (!employeeId || !month || !year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Get employee details from storage
      const employee = await storage.getStaff(parseInt(employeeId));
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Get payroll details
      const payrollDetails = await storage.getPayrollByStaff(employee.id);
      const currentPayroll = payrollDetails.find(p => p.month === parseInt(month) && p.year === parseInt(year));
      
      if (!currentPayroll) {
        return res.status(404).json({ message: "Payroll not found for the specified month" });
      }

      // Create PDF document with proper configuration
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        autoFirstPage: true
      });

      // Create a buffer to store the PDF
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        try {
          const pdfData = Buffer.concat(chunks);
          
          // Set proper headers for PDF download
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Length', pdfData.length);
          res.setHeader('Content-Disposition', `attachment; filename="salary-slip-${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}-${month}-${year}.pdf"`);
          res.setHeader('Cache-Control', 'no-cache');
          
          // Send the PDF data
          res.end(pdfData);
        } catch (error) {
          console.error("Error sending PDF response:", error);
          res.status(500).json({ message: "Failed to send PDF" });
        }
      });

      doc.on('error', (error) => {
        console.error("PDF generation error:", error);
        res.status(500).json({ message: "Failed to generate PDF" });
      });

      // Calculate workedDays (present days) using payroll logic
      let presentDays = 30;
      let totalDays = 30;
      let absentDays = 0;
      let baseSalary = typeof employee.salary === 'number' ? employee.salary : Number(employee.salary) || 0;
      let dailyRate = baseSalary / 30;
      let basicSalary = 0;
      let absentDeduction = 0;
      let netSalary = 0;

      // Debug logging
      console.log('PDF Generation Debug:');
      console.log('Employee:', employee.name, 'Salary:', baseSalary);
      console.log('Current Payroll:', currentPayroll);
      console.log('Payroll attendedDays:', currentPayroll?.attendedDays);
      console.log('Payroll basicSalary:', currentPayroll?.basicSalary);
      console.log('Payroll deductions:', currentPayroll?.deductions);
      console.log('Payroll netSalary:', currentPayroll?.netSalary);

      // Use manual/auto payroll values if available
      if (currentPayroll && 'attendedDays' in currentPayroll && currentPayroll.attendedDays !== undefined && currentPayroll.attendedDays !== null) {
        presentDays = Number(currentPayroll.attendedDays) || 30;
        absentDays = totalDays - presentDays;
        basicSalary = currentPayroll.basicSalary !== undefined ? Number(currentPayroll.basicSalary) : dailyRate * presentDays;
        absentDeduction = currentPayroll.deductions !== undefined ? Number(currentPayroll.deductions) : absentDays * dailyRate;
        netSalary = currentPayroll.netSalary !== undefined ? Number(currentPayroll.netSalary) : basicSalary - absentDeduction;
        
        console.log('Using payroll values:');
        console.log('Present Days:', presentDays);
        console.log('Absent Days:', absentDays);
        console.log('Basic Salary:', basicSalary);
        console.log('Absent Deduction:', absentDeduction);
        console.log('Net Salary:', netSalary);
      } else {
        // fallback: try to count present days from attendance
        const attendanceRecords = await storage.getAttendanceByStaff(employee.id, parseInt(month), parseInt(year));
        presentDays = attendanceRecords.filter(a => a.status === 'present').length || 30;
        absentDays = totalDays - presentDays;
        basicSalary = dailyRate * presentDays;
        absentDeduction = absentDays * dailyRate;
        netSalary = basicSalary - absentDeduction;
        
        console.log('Using fallback calculations:');
        console.log('Present Days:', presentDays);
        console.log('Absent Days:', absentDays);
        console.log('Basic Salary:', basicSalary);
        console.log('Absent Deduction:', absentDeduction);
        console.log('Net Salary:', netSalary);
      }

      // Institute and Title
      doc.fontSize(16).text('EuroKids Manewada', { align: 'center', underline: true });
      doc.moveDown(0.5);
      doc.fontSize(13).text(`PAY SLIP FOR THE MONTH OF ${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long' })} - ${year}`, { align: 'center' });
      doc.moveDown(1);

      // Employee Details
      doc.fontSize(11);
      doc.text(`Employee Name:   ${employee.name}`);
      doc.text(`Empcode:         ${employee.employeeId || 'N/A'}`);
      doc.text(`Department:      ${employee.department || 'N/A'}`);
      doc.text(`Designation:     ${employee.role || 'N/A'}`);
      doc.moveDown(1);

      // Attendance Section
      doc.fontSize(11).text('Attendance', { underline: true });
      doc.moveDown(0.2);
      doc.text(`Present Days:    ${presentDays}`);
      doc.text(`Absent Days:     ${absentDays}`);
      doc.text(`Total Days:      ${totalDays}`);
      doc.moveDown(1);

      // Salary Details Section
      doc.fontSize(11).text('Salary Details', { underline: true });
      doc.moveDown(0.2);
      doc.text(`Daily Rate:      ₹${dailyRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      doc.text(`Basic Salary:    ₹${basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      doc.moveDown(1);

      // Deductions Section
      doc.fontSize(11).text('Deductions', { underline: true });
      doc.moveDown(0.2);
      doc.text(`Absent Deduction: ₹${absentDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      doc.moveDown(1);

      // Net Salary Section
      doc.fontSize(11).text('Net Salary', { underline: true });
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fontSize(13).text(`₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'left' });
      doc.font('Helvetica').fontSize(10);
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).text('* This is a computer generated report. No signature required.', { align: 'center' });

      // End the document
      doc.end();

    } catch (error) {
      console.error("Error generating salary slip:", error);
      res.status(500).json({ message: "Failed to generate salary slip" });
    }
  });

  // Temporary endpoint to fix database schema
  app.post("/api/fix-payroll-schema", async (req, res) => {
    try {
      // Add attended_days column if it doesn't exist
      await db.execute(sql`ALTER TABLE payroll ADD COLUMN IF NOT EXISTS attended_days INTEGER DEFAULT 30`);
      res.json({ message: "Payroll schema fixed successfully" });
    } catch (error) {
      console.error("Schema fix error:", error);
      res.status(500).json({ message: "Failed to fix schema" });
    }
  });

  // Test endpoint to verify payroll data is being saved
  app.get("/api/test-payroll-save", async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      // Get all payroll records for the specified month/year
      const payrollRecords = await storage.getPayrollByMonth(currentMonth, currentYear);
      
      // Get all staff
      const allStaff = await storage.getAllStaff();
      
      // Check which staff have payroll records
      const staffWithPayroll = payrollRecords.map(p => p.staffId);
      const staffWithoutPayroll = allStaff.filter(s => !staffWithPayroll.includes(s.id));
      
      res.json({
        success: true,
        month: currentMonth,
        year: currentYear,
        totalStaff: allStaff.length,
        staffWithPayroll: staffWithPayroll.length,
        staffWithoutPayroll: staffWithoutPayroll.length,
        payrollRecords: payrollRecords,
        missingStaff: staffWithoutPayroll.map(s => ({ id: s.id, name: s.name }))
      });
    } catch (error) {
      console.error("Test payroll save error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to test payroll save",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}