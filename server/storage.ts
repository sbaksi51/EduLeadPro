import { 
  users, leads, followUps, leadSources,
  type User, type Lead, type FollowUp, type LeadSource,
  type InsertUser, type InsertLead, type InsertFollowUp, type InsertLeadSource,
  type LeadWithCounselor
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCounselors(): Promise<User[]>;

  // Leads
  getLead(id: number): Promise<LeadWithCounselor | undefined>;
  getAllLeads(): Promise<LeadWithCounselor[]>;
  getLeadsByStatus(status: string): Promise<LeadWithCounselor[]>;
  getLeadsByCounselor(counselorId: number): Promise<LeadWithCounselor[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined>;
  getRecentLeads(limit?: number): Promise<LeadWithCounselor[]>;
  getLeadsRequiringFollowUp(): Promise<LeadWithCounselor[]>;

  // Follow-ups
  getFollowUp(id: number): Promise<FollowUp | undefined>;
  getFollowUpsByLead(leadId: number): Promise<FollowUp[]>;
  getFollowUpsByCounselor(counselorId: number): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: number, updates: Partial<FollowUp>): Promise<FollowUp | undefined>;
  getOverdueFollowUps(): Promise<FollowUp[]>;

  // Lead Sources
  getAllLeadSources(): Promise<LeadSource[]>;
  createLeadSource(source: InsertLeadSource): Promise<LeadSource>;
  updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource | undefined>;

  // Analytics
  getLeadStats(): Promise<{
    totalLeads: number;
    hotLeads: number;
    conversions: number;
    newLeadsToday: number;
  }>;
  getLeadSourcePerformance(): Promise<Array<{
    source: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
  }>>;
  getMonthlyEnrollmentTrend(): Promise<Array<{
    month: string;
    enrollments: number;
  }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private followUps: Map<number, FollowUp>;
  private leadSources: Map<number, LeadSource>;
  private currentUserId: number;
  private currentLeadId: number;
  private currentFollowUpId: number;
  private currentLeadSourceId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.followUps = new Map();
    this.leadSources = new Map();
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentFollowUpId = 1;
    this.currentLeadSourceId = 1;

    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users
    const admin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Sarah Johnson"
    };
    
    const counselor1: User = {
      id: this.currentUserId++,
      username: "priya.sharma",
      password: "password123",
      role: "counselor",
      name: "Priya Sharma"
    };

    const counselor2: User = {
      id: this.currentUserId++,
      username: "rajesh.singh",
      password: "password123",
      role: "counselor",
      name: "Rajesh Singh"
    };

    this.users.set(admin.id, admin);
    this.users.set(counselor1.id, counselor1);
    this.users.set(counselor2.id, counselor2);

    // Create sample leads
    const sampleLeads = [
      {
        name: "Arjun Sharma",
        email: "arjun.sharma@gmail.com",
        phone: "9876543210",
        class: "Class 11",
        stream: "Science",
        status: "interested",
        source: "google_ads",
        counselorId: counselor1.id,
        parentName: "Rajesh Sharma",
        parentPhone: "9876543211",
        address: "Mumbai, Maharashtra",
        notes: "Very interested in engineering preparation"
      },
      {
        name: "Priya Patel",
        email: "priya.patel@gmail.com",
        phone: "9876543212",
        class: "Class 10",
        stream: "N/A",
        status: "contacted",
        source: "facebook",
        counselorId: counselor2.id,
        parentName: "Suresh Patel",
        parentPhone: "9876543213",
        address: "Ahmedabad, Gujarat",
        notes: "Looking for good science stream options"
      },
      {
        name: "Rahul Gupta",
        email: "rahul.gupta@gmail.com",
        phone: "9876543214",
        class: "Class 12",
        stream: "Commerce",
        status: "enrolled",
        source: "referral",
        counselorId: counselor1.id,
        parentName: "Amit Gupta",
        parentPhone: "9876543215",
        address: "Delhi, NCR",
        notes: "Enrolled in commerce stream"
      },
      {
        name: "Sneha Singh",
        email: "sneha.singh@gmail.com",
        phone: "9876543216",
        class: "Class 11",
        stream: "Arts",
        status: "new",
        source: "website",
        counselorId: null,
        parentName: "Vikram Singh",
        parentPhone: "9876543217",
        address: "Lucknow, UP",
        notes: "Interested in humanities subjects"
      },
      {
        name: "Kiran Kumar",
        email: "kiran.kumar@gmail.com",
        phone: "9876543218",
        class: "Class 10",
        stream: "N/A",
        status: "interested",
        source: "google_ads",
        counselorId: counselor2.id,
        parentName: "Raj Kumar",
        parentPhone: "9876543219",
        address: "Bangalore, Karnataka",
        notes: "Keen on science and mathematics"
      },
      {
        name: "Anita Reddy",
        email: "anita.reddy@gmail.com",
        phone: "9876543220",
        class: "Class 12",
        stream: "Science",
        status: "dropped",
        source: "facebook",
        counselorId: counselor1.id,
        parentName: "Krishna Reddy",
        parentPhone: "9876543221",
        address: "Hyderabad, Telangana",
        notes: "Family decided to go with local school"
      }
    ];

    sampleLeads.forEach(leadData => {
      const lead = {
        ...leadData,
        id: this.currentLeadId++,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        assignedAt: leadData.counselorId ? new Date() : null,
        lastContactedAt: leadData.status !== "new" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        admissionLikelihood: leadData.status === "interested" ? "75" : leadData.status === "contacted" ? "45" : null,
        email: leadData.email || null,
        stream: leadData.stream || null,
        notes: leadData.notes || null,
        parentName: leadData.parentName || null,
        parentPhone: leadData.parentPhone || null,
        address: leadData.address || null
      };
      this.leads.set(lead.id, lead);
    });

    // Create default lead sources
    const sources = [
      { name: "Google Ads", cost: "15000.00", conversions: 342, totalLeads: 1250 },
      { name: "Facebook", cost: "12000.00", conversions: 298, totalLeads: 1100 },
      { name: "Website", cost: "0.00", conversions: 267, totalLeads: 800 },
      { name: "Referrals", cost: "5000.00", conversions: 201, totalLeads: 350 }
    ];

    sources.forEach(source => {
      const leadSource: LeadSource = {
        id: this.currentLeadSourceId++,
        name: source.name,
        cost: source.cost,
        conversions: source.conversions,
        totalLeads: source.totalLeads
      };
      this.leadSources.set(leadSource.id, leadSource);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentUserId++,
      role: insertUser.role || "counselor"
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllCounselors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "counselor");
  }

  // Leads
  async getLead(id: number): Promise<LeadWithCounselor | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;

    const counselor = lead.counselorId ? await this.getUser(lead.counselorId) : undefined;
    const followUps = await this.getFollowUpsByLead(id);

    return { ...lead, counselor, followUps };
  }

  async getAllLeads(): Promise<LeadWithCounselor[]> {
    const leads = Array.from(this.leads.values());
    const leadsWithCounselors = await Promise.all(
      leads.map(async (lead) => {
        const counselor = lead.counselorId ? await this.getUser(lead.counselorId) : undefined;
        const followUps = await this.getFollowUpsByLead(lead.id);
        return { ...lead, counselor, followUps };
      })
    );
    return leadsWithCounselors.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLeadsByStatus(status: string): Promise<LeadWithCounselor[]> {
    const allLeads = await this.getAllLeads();
    return allLeads.filter(lead => lead.status === status);
  }

  async getLeadsByCounselor(counselorId: number): Promise<LeadWithCounselor[]> {
    const allLeads = await this.getAllLeads();
    return allLeads.filter(lead => lead.counselorId === counselorId);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const lead: Lead = {
      ...insertLead,
      id: this.currentLeadId++,
      createdAt: new Date(),
      assignedAt: insertLead.counselorId ? new Date() : null,
      lastContactedAt: null,
      admissionLikelihood: null,
      email: insertLead.email || null,
      stream: insertLead.stream || null,
      notes: insertLead.notes || null,
      parentName: insertLead.parentName || null,
      parentPhone: insertLead.parentPhone || null,
      address: insertLead.address || null,
      status: insertLead.status || "new",
      counselorId: insertLead.counselorId || null
    };
    this.leads.set(lead.id, lead);
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) return undefined;

    const updatedLead = { ...existingLead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async getRecentLeads(limit: number = 10): Promise<LeadWithCounselor[]> {
    const allLeads = await this.getAllLeads();
    return allLeads.slice(0, limit);
  }

  async getLeadsRequiringFollowUp(): Promise<LeadWithCounselor[]> {
    const allLeads = await this.getAllLeads();
    return allLeads.filter(lead => 
      lead.status === "contacted" || lead.status === "interested"
    );
  }

  // Follow-ups
  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    return this.followUps.get(id);
  }

  async getFollowUpsByLead(leadId: number): Promise<FollowUp[]> {
    return Array.from(this.followUps.values())
      .filter(followUp => followUp.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFollowUpsByCounselor(counselorId: number): Promise<FollowUp[]> {
    return Array.from(this.followUps.values())
      .filter(followUp => followUp.counselorId === counselorId);
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const followUp: FollowUp = {
      ...insertFollowUp,
      id: this.currentFollowUpId++,
      createdAt: new Date(),
      completedAt: null,
      remarks: insertFollowUp.remarks || null,
      outcome: insertFollowUp.outcome || null
    };
    this.followUps.set(followUp.id, followUp);
    return followUp;
  }

  async updateFollowUp(id: number, updates: Partial<FollowUp>): Promise<FollowUp | undefined> {
    const existingFollowUp = this.followUps.get(id);
    if (!existingFollowUp) return undefined;

    const updatedFollowUp = { ...existingFollowUp, ...updates };
    this.followUps.set(id, updatedFollowUp);
    return updatedFollowUp;
  }

  async getOverdueFollowUps(): Promise<FollowUp[]> {
    const now = new Date();
    return Array.from(this.followUps.values())
      .filter(followUp => 
        !followUp.completedAt && 
        new Date(followUp.scheduledAt) < now
      );
  }

  // Lead Sources
  async getAllLeadSources(): Promise<LeadSource[]> {
    return Array.from(this.leadSources.values());
  }

  async createLeadSource(insertSource: InsertLeadSource): Promise<LeadSource> {
    const source: LeadSource = {
      ...insertSource,
      id: this.currentLeadSourceId++,
      cost: insertSource.cost || null,
      conversions: insertSource.conversions || null,
      totalLeads: insertSource.totalLeads || null
    };
    this.leadSources.set(source.id, source);
    return source;
  }

  async updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource | undefined> {
    const existingSource = this.leadSources.get(id);
    if (!existingSource) return undefined;

    const updatedSource = { ...existingSource, ...updates };
    this.leadSources.set(id, updatedSource);
    return updatedSource;
  }

  // Analytics
  async getLeadStats(): Promise<{
    totalLeads: number;
    hotLeads: number;
    conversions: number;
    newLeadsToday: number;
  }> {
    const allLeads = Array.from(this.leads.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalLeads: allLeads.length,
      hotLeads: allLeads.filter(lead => lead.status === "interested").length,
      conversions: allLeads.filter(lead => lead.status === "enrolled").length,
      newLeadsToday: allLeads.filter(lead => 
        new Date(lead.createdAt).getTime() >= today.getTime()
      ).length
    };
  }

  async getLeadSourcePerformance(): Promise<Array<{
    source: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
  }>> {
    const allLeads = Array.from(this.leads.values());
    const sourceStats = new Map<string, { total: number; conversions: number }>();

    allLeads.forEach(lead => {
      const current = sourceStats.get(lead.source) || { total: 0, conversions: 0 };
      current.total++;
      if (lead.status === "enrolled") {
        current.conversions++;
      }
      sourceStats.set(lead.source, current);
    });

    return Array.from(sourceStats.entries()).map(([source, stats]) => ({
      source,
      totalLeads: stats.total,
      conversions: stats.conversions,
      conversionRate: stats.total > 0 ? (stats.conversions / stats.total) * 100 : 0
    }));
  }

  async getMonthlyEnrollmentTrend(): Promise<Array<{
    month: string;
    enrollments: number;
  }>> {
    const enrolledLeads = Array.from(this.leads.values())
      .filter(lead => lead.status === "enrolled");

    const monthlyData = new Map<string, number>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    // Initialize months with 0
    months.forEach(month => monthlyData.set(month, 0));

    // Count enrollments by month (simplified for demo)
    enrolledLeads.forEach((lead, index) => {
      const monthIndex = Math.floor(Math.random() * 6);
      const month = months[monthIndex];
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    return Array.from(monthlyData.entries()).map(([month, enrollments]) => ({
      month,
      enrollments
    }));
  }
}

export const storage = new MemStorage();
