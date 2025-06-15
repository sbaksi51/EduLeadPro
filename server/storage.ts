import { 
  users, leads, followUps, leadSources, staff, attendance, payroll, expenses, students, feeStructure, feePayments, eMandates, emiSchedule,
  type User, type Lead, type FollowUp, type LeadSource, type Staff, type Attendance, type Payroll, type Expense, type Student, type FeeStructure, type FeePayment, type EMandate, type EmiSchedule,
  type InsertUser, type InsertLead, type InsertFollowUp, type InsertLeadSource, type InsertStaff, type InsertAttendance, type InsertPayroll, type InsertExpense, type InsertStudent, type InsertFeeStructure, type InsertFeePayment, type InsertEMandate, type InsertEmiSchedule,
  type LeadWithCounselor, type StaffWithDetails, type StudentWithFees, type ExpenseWithApprover
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sum, count, avg, isNull } from "drizzle-orm";

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

  // Staff Management
  getStaff(id: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<StaffWithDetails[]>;
  getStaffByRole(role: string): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;

  // Attendance
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceByStaff(staffId: number, month?: number, year?: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<Attendance>): Promise<Attendance | undefined>;
  getAttendanceStats(month: number, year: number): Promise<{
    totalPresent: number;
    totalAbsent: number;
    averageHours: number;
  }>;

  // Payroll
  getPayroll(id: number): Promise<Payroll | undefined>;
  getPayrollByStaff(staffId: number): Promise<Payroll[]>;
  getPayrollByMonth(month: number, year: number): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, updates: Partial<Payroll>): Promise<Payroll | undefined>;
  getPayrollStats(month: number, year: number): Promise<{
    totalSalaries: number;
    totalDeductions: number;
    totalAllowances: number;
    netPayroll: number;
  }>;

  // Expenses
  getExpense(id: number): Promise<ExpenseWithApprover | undefined>;
  getAllExpenses(): Promise<ExpenseWithApprover[]>;
  getExpensesByCategory(category: string): Promise<ExpenseWithApprover[]>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<ExpenseWithApprover[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined>;
  getExpenseStats(month: number, year: number): Promise<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; amount: number }>;
    monthlyTrend: Array<{ month: string; amount: number }>;
  }>;

  // Students
  getStudent(id: number): Promise<StudentWithFees | undefined>;
  getAllStudents(): Promise<StudentWithFees[]>;
  getStudentsByClass(className: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  convertLeadToStudent(leadId: number, studentData: InsertStudent): Promise<Student>;

  // Fee Management
  getFeeStructure(id: number): Promise<FeeStructure | undefined>;
  getFeeStructureByStudent(studentId: number): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  updateFeeStructure(id: number, updates: Partial<FeeStructure>): Promise<FeeStructure | undefined>;
  
  getFeePayment(id: number): Promise<FeePayment | undefined>;
  getFeePaymentsByStudent(studentId: number): Promise<FeePayment[]>;
  createFeePayment(feePayment: InsertFeePayment): Promise<FeePayment>;
  
  getFeeStats(): Promise<{
    totalPending: number;
    totalPaid: number;
    totalOverdue: number;
    collectionRate: number;
  }>;

  // E-Mandate
  getEMandate(id: number): Promise<EMandate | undefined>;
  getEMandateByStudent(studentId: number): Promise<EMandate | undefined>;
  createEMandate(eMandate: InsertEMandate): Promise<EMandate>;
  updateEMandate(id: number, updates: Partial<EMandate>): Promise<EMandate | undefined>;
  
  getEmiSchedule(id: number): Promise<EmiSchedule | undefined>;
  getEmiScheduleByMandate(eMandateId: number): Promise<EmiSchedule[]>;
  createEmiSchedule(emiSchedule: InsertEmiSchedule): Promise<EmiSchedule>;
  updateEmiSchedule(id: number, updates: Partial<EmiSchedule>): Promise<EmiSchedule | undefined>;
  getUpcomingEmis(): Promise<EmiSchedule[]>;
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
      name: "Sarah Johnson",
      email: "admin@school.com"
    };
    
    const counselor1: User = {
      id: this.currentUserId++,
      username: "priya.sharma",
      password: "password123",
      role: "counselor",
      name: "Priya Sharma",
      email: "priya@school.com"
    };

    const counselor2: User = {
      id: this.currentUserId++,
      username: "rajesh.singh",
      password: "password123",
      role: "counselor",
      name: "Rajesh Singh",
      email: "rajesh@school.com"
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
      role: insertUser.role || "counselor",
      email: insertUser.email || null
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

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllCounselors(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "counselor"));
  }

  // Leads
  async getLead(id: number): Promise<LeadWithCounselor | undefined> {
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .where(eq(leads.id, id));

    if (result.length === 0) return undefined;

    const { lead, counselor } = result[0];
    return {
      ...lead,
      counselor: counselor || undefined
    };
  }

  async getAllLeads(): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .orderBy(desc(leads.createdAt));

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  async getLeadsByStatus(status: string): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .where(eq(leads.status, status))
      .orderBy(desc(leads.createdAt));

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  async getLeadsByCounselor(counselorId: number): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .where(eq(leads.counselorId, counselorId))
      .orderBy(desc(leads.createdAt));

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async getRecentLeads(limit: number = 10): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .orderBy(desc(leads.createdAt))
      .limit(limit);

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  async getLeadsRequiringFollowUp(): Promise<LeadWithCounselor[]> {
    // Implementation for leads requiring follow-up
    const result = await db
      .select({
        lead: leads,
        counselor: users
      })
      .from(leads)
      .leftJoin(users, eq(leads.counselorId, users.id))
      .where(and(
        eq(leads.status, "contacted"),
        lte(leads.lastContactedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      ))
      .orderBy(desc(leads.createdAt));

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  // Follow-ups
  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    const [followUp] = await db.select().from(followUps).where(eq(followUps.id, id));
    return followUp || undefined;
  }

  async getFollowUpsByLead(leadId: number): Promise<FollowUp[]> {
    return await db.select().from(followUps).where(eq(followUps.leadId, leadId));
  }

  async getFollowUpsByCounselor(counselorId: number): Promise<FollowUp[]> {
    return await db.select().from(followUps).where(eq(followUps.counselorId, counselorId));
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const [followUp] = await db
      .insert(followUps)
      .values(insertFollowUp)
      .returning();
    return followUp;
  }

  async updateFollowUp(id: number, updates: Partial<FollowUp>): Promise<FollowUp | undefined> {
    const [followUp] = await db
      .update(followUps)
      .set(updates)
      .where(eq(followUps.id, id))
      .returning();
    return followUp || undefined;
  }

  async getOverdueFollowUps(): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(and(
        lte(followUps.scheduledAt, new Date()),
        isNull(followUps.completedAt)
      ));
  }

  // Lead Sources
  async getAllLeadSources(): Promise<LeadSource[]> {
    return await db.select().from(leadSources);
  }

  async createLeadSource(insertSource: InsertLeadSource): Promise<LeadSource> {
    const [source] = await db
      .insert(leadSources)
      .values(insertSource)
      .returning();
    return source;
  }

  async updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource | undefined> {
    const [source] = await db
      .update(leadSources)
      .set(updates)
      .where(eq(leadSources.id, id))
      .returning();
    return source || undefined;
  }

  // Analytics
  async getLeadStats(): Promise<{
    totalLeads: number;
    hotLeads: number;
    conversions: number;
    newLeadsToday: number;
  }> {
    const allLeads = await db.select().from(leads);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalLeads = allLeads.length;
    const hotLeads = allLeads.filter(lead => lead.status === "interested").length;
    const conversions = allLeads.filter(lead => lead.status === "enrolled").length;
    const newLeadsToday = allLeads.filter(lead => lead.createdAt >= today).length;

    return {
      totalLeads,
      hotLeads,
      conversions,
      newLeadsToday
    };
  }

  async getLeadSourcePerformance(): Promise<Array<{
    source: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
  }>> {
    const result = await db
      .select({
        source: leads.source,
        totalLeads: count(),
        conversions: sum(
          eq(leads.status, "enrolled") ? 1 : 0
        )
      })
      .from(leads)
      .groupBy(leads.source);

    return result.map(row => ({
      source: row.source,
      totalLeads: Number(row.totalLeads),
      conversions: Number(row.conversions),
      conversionRate: Number(row.totalLeads) > 0 ? (Number(row.conversions) / Number(row.totalLeads)) * 100 : 0
    }));
  }

  async getMonthlyEnrollmentTrend(): Promise<Array<{
    month: string;
    enrollments: number;
  }>> {
    // Simple implementation - would need proper date grouping in real scenario
    return [
      { month: "Jan", enrollments: 45 },
      { month: "Feb", enrollments: 52 },
      { month: "Mar", enrollments: 48 },
      { month: "Apr", enrollments: 61 },
      { month: "May", enrollments: 55 },
      { month: "Jun", enrollments: 67 }
    ];
  }

  // Staff Management Implementation
  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getAllStaff(): Promise<StaffWithDetails[]> {
    const result = await db.select().from(staff).where(eq(staff.isActive, true));
    return result.map(s => ({ ...s, attendance: [], payroll: [] }));
  }

  async getStaffByRole(role: string): Promise<Staff[]> {
    return await db.select().from(staff).where(and(eq(staff.role, role), eq(staff.isActive, true)));
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [newStaff] = await db
      .insert(staff)
      .values(insertStaff)
      .returning();
    return newStaff;
  }

  async updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined> {
    const [updatedStaff] = await db
      .update(staff)
      .set(updates)
      .where(eq(staff.id, id))
      .returning();
    return updatedStaff || undefined;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db
      .update(staff)
      .set({ isActive: false })
      .where(eq(staff.id, id));
    return result.rowCount > 0;
  }

  // Attendance Implementation
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord || undefined;
  }

  async getAttendanceByStaff(staffId: number, month?: number, year?: number): Promise<Attendance[]> {
    let query = db.select().from(attendance).where(eq(attendance.staffId, staffId));
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query.where(and(
        eq(attendance.staffId, staffId),
        gte(attendance.date, startDate.toISOString().split('T')[0]),
        lte(attendance.date, endDate.toISOString().split('T')[0])
      ));
    }
    
    return await query;
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return newAttendance;
  }

  async updateAttendance(id: number, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance || undefined;
  }

  async getAttendanceStats(month: number, year: number): Promise<{
    totalPresent: number;
    totalAbsent: number;
    averageHours: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const [stats] = await db
      .select({
        totalPresent: sum(eq(attendance.status, "present") ? 1 : 0),
        totalAbsent: sum(eq(attendance.status, "absent") ? 1 : 0),
        averageHours: avg(attendance.hoursWorked)
      })
      .from(attendance)
      .where(and(
        gte(attendance.date, startDate.toISOString().split('T')[0]),
        lte(attendance.date, endDate.toISOString().split('T')[0])
      ));

    return {
      totalPresent: Number(stats.totalPresent) || 0,
      totalAbsent: Number(stats.totalAbsent) || 0,
      averageHours: Number(stats.averageHours) || 0
    };
  }

  // Payroll Implementation
  async getPayroll(id: number): Promise<Payroll | undefined> {
    const [payrollRecord] = await db.select().from(payroll).where(eq(payroll.id, id));
    return payrollRecord || undefined;
  }

  async getPayrollByStaff(staffId: number): Promise<Payroll[]> {
    return await db.select().from(payroll).where(eq(payroll.staffId, staffId));
  }

  async getPayrollByMonth(month: number, year: number): Promise<Payroll[]> {
    return await db.select().from(payroll).where(and(eq(payroll.month, month), eq(payroll.year, year)));
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const [newPayroll] = await db
      .insert(payroll)
      .values(insertPayroll)
      .returning();
    return newPayroll;
  }

  async updatePayroll(id: number, updates: Partial<Payroll>): Promise<Payroll | undefined> {
    const [updatedPayroll] = await db
      .update(payroll)
      .set(updates)
      .where(eq(payroll.id, id))
      .returning();
    return updatedPayroll || undefined;
  }

  async getPayrollStats(month: number, year: number): Promise<{
    totalSalaries: number;
    totalDeductions: number;
    totalAllowances: number;
    netPayroll: number;
  }> {
    const [stats] = await db
      .select({
        totalSalaries: sum(payroll.basicSalary),
        totalDeductions: sum(payroll.deductions),
        totalAllowances: sum(payroll.allowances),
        netPayroll: sum(payroll.netSalary)
      })
      .from(payroll)
      .where(and(eq(payroll.month, month), eq(payroll.year, year)));

    return {
      totalSalaries: Number(stats.totalSalaries) || 0,
      totalDeductions: Number(stats.totalDeductions) || 0,
      totalAllowances: Number(stats.totalAllowances) || 0,
      netPayroll: Number(stats.netPayroll) || 0
    };
  }

  // Expense Implementation
  async getExpense(id: number): Promise<ExpenseWithApprover | undefined> {
    const result = await db
      .select({
        expense: expenses,
        approver: users,
        creator: users
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.approvedBy, users.id))
      .leftJoin(users, eq(expenses.createdBy, users.id))
      .where(eq(expenses.id, id));

    if (result.length === 0) return undefined;

    const { expense, approver, creator } = result[0];
    return {
      ...expense,
      approver: approver || undefined,
      creator: creator || undefined
    };
  }

  async getAllExpenses(): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        expense: expenses,
        approver: users,
        creator: users
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.approvedBy, users.id))
      .leftJoin(users, eq(expenses.createdBy, users.id))
      .orderBy(desc(expenses.createdAt));

    return result.map(({ expense, approver, creator }) => ({
      ...expense,
      approver: approver || undefined,
      creator: creator || undefined
    }));
  }

  async getExpensesByCategory(category: string): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        expense: expenses,
        approver: users,
        creator: users
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.approvedBy, users.id))
      .leftJoin(users, eq(expenses.createdBy, users.id))
      .where(eq(expenses.category, category))
      .orderBy(desc(expenses.createdAt));

    return result.map(({ expense, approver, creator }) => ({
      ...expense,
      approver: approver || undefined,
      creator: creator || undefined
    }));
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        expense: expenses,
        approver: users,
        creator: users
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.approvedBy, users.id))
      .leftJoin(users, eq(expenses.createdBy, users.id))
      .where(and(
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ))
      .orderBy(desc(expenses.createdAt));

    return result.map(({ expense, approver, creator }) => ({
      ...expense,
      approver: approver || undefined,
      creator: creator || undefined
    }));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return newExpense;
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense || undefined;
  }

  async getExpenseStats(month: number, year: number): Promise<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; amount: number }>;
    monthlyTrend: Array<{ month: string; amount: number }>;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const [totalStats] = await db
      .select({
        totalExpenses: sum(expenses.amount)
      })
      .from(expenses)
      .where(and(
        gte(expenses.date, startDate.toISOString().split('T')[0]),
        lte(expenses.date, endDate.toISOString().split('T')[0])
      ));

    const categoryStats = await db
      .select({
        category: expenses.category,
        amount: sum(expenses.amount)
      })
      .from(expenses)
      .where(and(
        gte(expenses.date, startDate.toISOString().split('T')[0]),
        lte(expenses.date, endDate.toISOString().split('T')[0])
      ))
      .groupBy(expenses.category);

    return {
      totalExpenses: Number(totalStats.totalExpenses) || 0,
      categoryBreakdown: categoryStats.map(stat => ({
        category: stat.category,
        amount: Number(stat.amount) || 0
      })),
      monthlyTrend: [
        { month: "Jan", amount: 45000 },
        { month: "Feb", amount: 52000 },
        { month: "Mar", amount: 48000 },
        { month: "Apr", amount: 61000 },
        { month: "May", amount: 55000 },
        { month: "Jun", amount: 67000 }
      ]
    };
  }

  // Student Implementation
  async getStudent(id: number): Promise<StudentWithFees | undefined> {
    const result = await db
      .select({
        student: students,
        feeStructure: feeStructure,
        feePayments: feePayments,
        eMandate: eMandates
      })
      .from(students)
      .leftJoin(feeStructure, eq(students.id, feeStructure.studentId))
      .leftJoin(feePayments, eq(students.id, feePayments.studentId))
      .leftJoin(eMandates, eq(students.id, eMandates.studentId))
      .where(eq(students.id, id));

    if (result.length === 0) return undefined;

    const student = result[0].student;
    const fees = result.filter(r => r.feeStructure).map(r => r.feeStructure!);
    const payments = result.filter(r => r.feePayments).map(r => r.feePayments!);
    const mandate = result.find(r => r.eMandate)?.eMandate;

    return {
      ...student,
      feeStructure: fees,
      feePayments: payments,
      eMandate: mandate
    };
  }

  async getAllStudents(): Promise<StudentWithFees[]> {
    const result = await db.select().from(students).where(eq(students.isActive, true));
    return result.map(s => ({ ...s, feeStructure: [], feePayments: [] }));
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    return await db.select().from(students).where(and(eq(students.class, className), eq(students.isActive, true)));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return newStudent;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent || undefined;
  }

  async convertLeadToStudent(leadId: number, studentData: InsertStudent): Promise<Student> {
    // Create student and update lead status
    const newStudent = await this.createStudent(studentData);
    await this.updateLead(leadId, { status: "enrolled" });
    return newStudent;
  }

  // Fee Management Implementation
  async getFeeStructure(id: number): Promise<FeeStructure | undefined> {
    const [fee] = await db.select().from(feeStructure).where(eq(feeStructure.id, id));
    return fee || undefined;
  }

  async getFeeStructureByStudent(studentId: number): Promise<FeeStructure[]> {
    return await db.select().from(feeStructure).where(eq(feeStructure.studentId, studentId));
  }

  async createFeeStructure(insertFeeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [newFee] = await db
      .insert(feeStructure)
      .values(insertFeeStructure)
      .returning();
    return newFee;
  }

  async updateFeeStructure(id: number, updates: Partial<FeeStructure>): Promise<FeeStructure | undefined> {
    const [updatedFee] = await db
      .update(feeStructure)
      .set(updates)
      .where(eq(feeStructure.id, id))
      .returning();
    return updatedFee || undefined;
  }

  async getFeePayment(id: number): Promise<FeePayment | undefined> {
    const [payment] = await db.select().from(feePayments).where(eq(feePayments.id, id));
    return payment || undefined;
  }

  async getFeePaymentsByStudent(studentId: number): Promise<FeePayment[]> {
    return await db.select().from(feePayments).where(eq(feePayments.studentId, studentId));
  }

  async createFeePayment(insertFeePayment: InsertFeePayment): Promise<FeePayment> {
    const [newPayment] = await db
      .insert(feePayments)
      .values(insertFeePayment)
      .returning();
    return newPayment;
  }

  async getFeeStats(): Promise<{
    totalPending: number;
    totalPaid: number;
    totalOverdue: number;
    collectionRate: number;
  }> {
    const [pendingStats] = await db
      .select({
        totalPending: sum(feeStructure.amount)
      })
      .from(feeStructure)
      .where(eq(feeStructure.status, "pending"));

    const [paidStats] = await db
      .select({
        totalPaid: sum(feePayments.amount)
      })
      .from(feePayments);

    const [overdueStats] = await db
      .select({
        totalOverdue: sum(feeStructure.amount)
      })
      .from(feeStructure)
      .where(eq(feeStructure.status, "overdue"));

    const pending = Number(pendingStats.totalPending) || 0;
    const paid = Number(paidStats.totalPaid) || 0;
    const overdue = Number(overdueStats.totalOverdue) || 0;
    const total = pending + paid + overdue;

    return {
      totalPending: pending,
      totalPaid: paid,
      totalOverdue: overdue,
      collectionRate: total > 0 ? (paid / total) * 100 : 0
    };
  }

  // E-Mandate Implementation
  async getEMandate(id: number): Promise<EMandate | undefined> {
    const [mandate] = await db.select().from(eMandates).where(eq(eMandates.id, id));
    return mandate || undefined;
  }

  async getEMandateByStudent(studentId: number): Promise<EMandate | undefined> {
    const [mandate] = await db.select().from(eMandates).where(eq(eMandates.studentId, studentId));
    return mandate || undefined;
  }

  async createEMandate(insertEMandate: InsertEMandate): Promise<EMandate> {
    const [newMandate] = await db
      .insert(eMandates)
      .values(insertEMandate)
      .returning();
    return newMandate;
  }

  async updateEMandate(id: number, updates: Partial<EMandate>): Promise<EMandate | undefined> {
    const [updatedMandate] = await db
      .update(eMandates)
      .set(updates)
      .where(eq(eMandates.id, id))
      .returning();
    return updatedMandate || undefined;
  }

  async getEmiSchedule(id: number): Promise<EmiSchedule | undefined> {
    const [schedule] = await db.select().from(emiSchedule).where(eq(emiSchedule.id, id));
    return schedule || undefined;
  }

  async getEmiScheduleByMandate(eMandateId: number): Promise<EmiSchedule[]> {
    return await db.select().from(emiSchedule).where(eq(emiSchedule.eMandateId, eMandateId));
  }

  async createEmiSchedule(insertEmiSchedule: InsertEmiSchedule): Promise<EmiSchedule> {
    const [newSchedule] = await db
      .insert(emiSchedule)
      .values(insertEmiSchedule)
      .returning();
    return newSchedule;
  }

  async updateEmiSchedule(id: number, updates: Partial<EmiSchedule>): Promise<EmiSchedule | undefined> {
    const [updatedSchedule] = await db
      .update(emiSchedule)
      .set(updates)
      .where(eq(emiSchedule.id, id))
      .returning();
    return updatedSchedule || undefined;
  }

  async getUpcomingEmis(): Promise<EmiSchedule[]> {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return await db
      .select()
      .from(emiSchedule)
      .where(and(
        lte(emiSchedule.scheduledDate, nextWeek.toISOString().split('T')[0]),
        eq(emiSchedule.status, "scheduled")
      ));
  }
}

// Initialize database with sample data
async function initializeSampleData() {
  const db = new DatabaseStorage();
  
  try {
    // Create sample users/counselors
    await db.createUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Sarah Johnson",
      email: "admin@school.com"
    });

    await db.createUser({
      username: "priya.sharma",
      password: "password123", 
      role: "counselor",
      name: "Priya Sharma",
      email: "priya@school.com"
    });

    await db.createUser({
      username: "rajesh.singh",
      password: "password123",
      role: "counselor", 
      name: "Rajesh Singh",
      email: "rajesh@school.com"
    });

    // Create sample staff members
    const staffData = [
      {
        employeeId: "EMP001",
        name: "Dr. Anita Patel",
        email: "anita.patel@school.com",
        phone: "9876543210",
        role: "Teacher",
        department: "Mathematics",
        dateOfJoining: "2020-06-15",
        salary: "55000",
        address: "123 Park Street, Mumbai",
        emergencyContact: "9876543211",
        qualifications: "M.Sc Mathematics, B.Ed"
      },
      {
        employeeId: "EMP002", 
        name: "Vikram Kumar",
        email: "vikram@school.com",
        phone: "9876543212",
        role: "Teacher",
        department: "Physics",
        dateOfJoining: "2019-04-10",
        salary: "52000",
        address: "456 Lake View, Mumbai",
        emergencyContact: "9876543213",
        qualifications: "M.Sc Physics, B.Ed"
      },
      {
        employeeId: "EMP003",
        name: "Meera Reddy", 
        email: "meera@school.com",
        phone: "9876543214",
        role: "Admin",
        department: "Administration",
        dateOfJoining: "2021-01-20",
        salary: "45000",
        address: "789 Hill Station, Mumbai",
        emergencyContact: "9876543215",
        qualifications: "MBA, B.Com"
      },
      {
        employeeId: "EMP004",
        name: "Rahul Joshi",
        email: "rahul@school.com", 
        phone: "9876543216",
        role: "Counselor",
        department: "Student Affairs",
        dateOfJoining: "2020-08-12",
        salary: "48000",
        address: "321 Garden Road, Mumbai",
        emergencyContact: "9876543217", 
        qualifications: "M.A Psychology, B.Ed"
      }
    ];

    for (const staff of staffData) {
      await db.createStaff(staff);
    }

    // Create sample students
    const studentsData = [
      {
        rollNumber: "STU001",
        name: "Arjun Sharma",
        email: "arjun@gmail.com",
        phone: "9876543220",
        parentName: "Ramesh Sharma",
        parentPhone: "9876543221",
        class: "Class 11", 
        stream: "Science",
        admissionDate: "2024-04-01",
        address: "12 Nehru Nagar, Mumbai"
      },
      {
        rollNumber: "STU002",
        name: "Priya Mehta",
        email: "priya@gmail.com", 
        phone: "9876543222",
        parentName: "Suresh Mehta",
        parentPhone: "9876543223",
        class: "Class 12",
        stream: "Commerce", 
        admissionDate: "2023-04-01",
        address: "45 Gandhi Road, Mumbai"
      },
      {
        rollNumber: "STU003",
        name: "Kiran Patel",
        email: "kiran@gmail.com",
        phone: "9876543224", 
        parentName: "Deepak Patel",
        parentPhone: "9876543225",
        class: "Class 10",
        stream: "General",
        admissionDate: "2024-04-01", 
        address: "78 MG Road, Mumbai"
      },
      {
        rollNumber: "STU004",
        name: "Sneha Reddy",
        email: "sneha@gmail.com",
        phone: "9876543226",
        parentName: "Venkat Reddy", 
        parentPhone: "9876543227",
        class: "Class 11",
        stream: "Arts",
        admissionDate: "2024-04-01",
        address: "90 Link Road, Mumbai"
      },
      {
        rollNumber: "STU005",
        name: "Rohit Gupta", 
        email: "rohit@gmail.com",
        phone: "9876543228",
        parentName: "Manoj Gupta",
        parentPhone: "9876543229",
        class: "Class 12",
        stream: "Science",
        admissionDate: "2023-04-01",
        address: "34 SV Road, Mumbai"
      }
    ];

    for (const student of studentsData) {
      await db.createStudent(student);
    }

    // Create sample expenses
    const expensesData = [
      {
        amount: "45000",
        category: "Salaries",
        subcategory: "Teaching Staff",
        description: "Monthly salary payment for teaching staff",
        date: "2024-06-01",
        paymentMethod: "bank_transfer",
        vendorName: "Teaching Staff",
        status: "approved",
        createdBy: 1
      },
      {
        amount: "8500", 
        category: "Utilities",
        subcategory: "Electricity",
        description: "Monthly electricity bill payment",
        date: "2024-06-05",
        paymentMethod: "bank_transfer",
        vendorName: "Mumbai Electric Supply",
        invoiceNumber: "INV-2024-001",
        status: "approved",
        createdBy: 1
      },
      {
        amount: "12000",
        category: "Marketing",
        subcategory: "Digital Ads", 
        description: "Google Ads campaign for admissions",
        date: "2024-06-10",
        paymentMethod: "card",
        vendorName: "Google India",
        status: "approved",
        createdBy: 1
      },
      {
        amount: "3500",
        category: "Repairs",
        subcategory: "Maintenance",
        description: "AC maintenance and repair",
        date: "2024-06-12", 
        paymentMethod: "cash",
        vendorName: "Cool Air Services",
        invoiceNumber: "INV-2024-002",
        status: "approved",
        createdBy: 1
      },
      {
        amount: "2200",
        category: "Supplies",
        subcategory: "Stationery",
        description: "Office supplies and stationery",
        date: "2024-06-08",
        paymentMethod: "cash",
        vendorName: "Office Mart",
        status: "approved", 
        createdBy: 1
      }
    ];

    for (const expense of expensesData) {
      await db.createExpense(expense);
    }

    // Create sample leads
    const leadsData = [
      {
        name: "Aditya Singh",
        email: "aditya@gmail.com", 
        phone: "9876543230",
        class: "Class 11",
        stream: "Science",
        status: "interested",
        source: "google_ads",
        counselorId: 2,
        parentName: "Rajesh Singh",
        parentPhone: "9876543231",
        address: "67 Park Avenue, Mumbai",
        notes: "Interested in Science stream, good academic record"
      },
      {
        name: "Kavya Nair",
        email: "kavya@gmail.com",
        phone: "9876543232",
        class: "Class 12", 
        stream: "Commerce",
        status: "contacted",
        source: "facebook",
        counselorId: 3,
        parentName: "Sunil Nair",
        parentPhone: "9876543233",
        address: "89 Marine Drive, Mumbai",
        notes: "Parent enquired about commerce stream"
      },
      {
        name: "Aryan Joshi",
        email: "aryan@gmail.com",
        phone: "9876543234",
        class: "Class 10",
        status: "new",
        source: "referral",
        counselorId: 2,
        parentName: "Amit Joshi", 
        parentPhone: "9876543235",
        address: "23 Linking Road, Mumbai",
        notes: "Referred by existing student"
      }
    ];

    for (const lead of leadsData) {
      await db.createLead(lead);
    }

    // Create sample attendance records
    const attendanceData = [
      {
        staffId: 1,
        date: "2024-06-14",
        checkInTime: new Date("2024-06-14T09:00:00Z"),
        checkOutTime: new Date("2024-06-14T17:30:00Z"),
        hoursWorked: "8.5",
        status: "present",
        notes: "Regular working day"
      },
      {
        staffId: 2,
        date: "2024-06-14",
        checkInTime: new Date("2024-06-14T08:45:00Z"),
        checkOutTime: new Date("2024-06-14T17:15:00Z"),
        hoursWorked: "8.5",
        status: "present"
      },
      {
        staffId: 3,
        date: "2024-06-14",
        checkInTime: new Date("2024-06-14T09:15:00Z"),
        checkOutTime: new Date("2024-06-14T18:00:00Z"),
        hoursWorked: "8.75",
        status: "late",
        notes: "15 minutes late due to traffic"
      },
      {
        staffId: 4,
        date: "2024-06-14",
        status: "absent",
        notes: "Sick leave"
      }
    ];

    for (const record of attendanceData) {
      await db.createAttendance(record);
    }

    // Create sample payroll records
    const payrollData = [
      {
        staffId: 1,
        month: 6,
        year: 2024,
        basicSalary: "55000",
        allowances: "5000",
        deductions: "2000",
        overtime: "0",
        netSalary: "58000",
        status: "paid"
      },
      {
        staffId: 2,
        month: 6,
        year: 2024,
        basicSalary: "52000",
        allowances: "4500",
        deductions: "1800",
        overtime: "1000",
        netSalary: "55700",
        status: "paid"
      },
      {
        staffId: 3,
        month: 6,
        year: 2024,
        basicSalary: "45000",
        allowances: "3000",
        deductions: "1500",
        overtime: "0",
        netSalary: "46500",
        status: "pending"
      },
      {
        staffId: 4,
        month: 6,
        year: 2024,
        basicSalary: "48000",
        allowances: "3500",
        deductions: "1600",
        overtime: "500",
        netSalary: "50400",
        status: "pending"
      }
    ];

    for (const payroll of payrollData) {
      await db.createPayroll(payroll);
    }

    // Create sample fee structures
    const feeStructureData = [
      {
        studentId: 1,
        feeType: "tuition",
        amount: "30000",
        dueDate: "2024-07-15",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 4,
        status: "pending"
      },
      {
        studentId: 1,
        feeType: "admission",
        amount: "15000",
        dueDate: "2024-04-15",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 1,
        status: "paid"
      },
      {
        studentId: 2,
        feeType: "tuition",
        amount: "31250",
        dueDate: "2024-07-15",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 4,
        status: "pending"
      },
      {
        studentId: 3,
        feeType: "tuition",
        amount: "25000",
        dueDate: "2024-06-01",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 4,
        status: "overdue"
      },
      {
        studentId: 4,
        feeType: "tuition",
        amount: "27500",
        dueDate: "2024-07-15",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 4,
        status: "pending"
      },
      {
        studentId: 5,
        feeType: "tuition",
        amount: "32500",
        dueDate: "2024-07-15",
        academicYear: "2024-25",
        installmentNumber: 1,
        totalInstallments: 4,
        status: "paid"
      }
    ];

    for (const fee of feeStructureData) {
      await db.createFeeStructure(fee);
    }

    // Create sample fee payments
    const feePaymentData = [
      {
        studentId: 1,
        feeStructureId: 2,
        amount: "15000",
        paymentDate: "2024-04-10",
        paymentMethod: "bank_transfer",
        transactionId: "TXN001234567",
        receiptNumber: "RCP001",
        notes: "Admission fee payment",
        createdBy: 1
      },
      {
        studentId: 5,
        feeStructureId: 6,
        amount: "32500",
        paymentDate: "2024-06-05",
        paymentMethod: "upi",
        transactionId: "UPI123456789",
        receiptNumber: "RCP002",
        notes: "First installment payment",
        createdBy: 1
      },
      {
        studentId: 2,
        feeStructureId: 3,
        amount: "15000",
        paymentDate: "2024-05-20",
        paymentMethod: "cash",
        receiptNumber: "RCP003",
        notes: "Partial payment",
        createdBy: 1
      }
    ];

    for (const payment of feePaymentData) {
      await db.createFeePayment(payment);
    }

    // Create sample e-mandates
    const eMandateData = [
      {
        studentId: 1,
        mandateId: "MNDT001",
        bankName: "State Bank of India",
        accountNumber: "1234567890",
        ifscCode: "SBIN0001234",
        accountHolderName: "Ramesh Sharma",
        maxAmount: "35000",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        frequency: "monthly",
        status: "active"
      },
      {
        studentId: 2,
        mandateId: "MNDT002",
        bankName: "HDFC Bank",
        accountNumber: "0987654321",
        ifscCode: "HDFC0001234",
        accountHolderName: "Suresh Mehta",
        maxAmount: "35000",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        frequency: "monthly",
        status: "active"
      },
      {
        studentId: 5,
        mandateId: "MNDT003",
        bankName: "ICICI Bank",
        accountNumber: "5678901234",
        ifscCode: "ICIC0001234",
        accountHolderName: "Manoj Gupta",
        maxAmount: "35000",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        frequency: "monthly",
        status: "active"
      }
    ];

    for (const mandate of eMandateData) {
      await db.createEMandate(mandate);
    }

    // Create sample EMI schedules
    const emiScheduleData = [
      {
        eMandateId: 1,
        studentId: 1,
        emiAmount: "30000",
        scheduledDate: "2024-07-15",
        status: "scheduled"
      },
      {
        eMandateId: 1,
        studentId: 1,
        emiAmount: "30000",
        scheduledDate: "2024-10-15",
        status: "scheduled"
      },
      {
        eMandateId: 2,
        studentId: 2,
        emiAmount: "31250",
        scheduledDate: "2024-07-15",
        status: "scheduled"
      },
      {
        eMandateId: 3,
        studentId: 5,
        emiAmount: "32500",
        scheduledDate: "2024-06-15",
        actualDate: "2024-06-15",
        status: "success",
        transactionId: "EMI123456789"
      },
      {
        eMandateId: 2,
        studentId: 2,
        emiAmount: "31250",
        scheduledDate: "2024-06-10",
        status: "failed",
        failureReason: "Insufficient funds",
        retryCount: 1
      }
    ];

    for (const emi of emiScheduleData) {
      await db.createEmiSchedule(emi);
    }

    console.log("Sample data initialized successfully");
  } catch (error) {
    console.log("Sample data already exists or error occurred:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data on startup
initializeSampleData();
