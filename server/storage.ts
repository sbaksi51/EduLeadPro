import { eq, and, gte, lte, sql, desc, or, isNull, not } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  User, InsertUser, Lead, InsertLead, FollowUp, InsertFollowUp,
  LeadSource, InsertLeadSource, Staff, InsertStaff, Attendance, InsertAttendance,
  Payroll, InsertPayroll, Expense, InsertExpense, Student, InsertStudent,
  FeeStructure, InsertFeeStructure, FeePayment, InsertFeePayment,
  EMandate, InsertEMandate, EmiSchedule, InsertEmiSchedule,
  GlobalClassFee, InsertGlobalClassFee, EmiPlan, InsertEmiPlan,
  Notification, InsertNotification
} from "@shared/schema";

// Type definitions for complex queries
export type LeadWithCounselor = Lead & {
  counselor?: User;
};

export type ExpenseWithApprover = Expense & {
  approver?: User;
};

export type StaffWithDetails = Staff;

export type StudentWithFees = Student & {
  feeStructure?: FeeStructure;
  payments?: FeePayment[];
  eMandate?: EMandate;
  emiSchedule?: EmiSchedule[];
};

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCounselors(): Promise<User[]>;

  // Leads
  getLead(id: number): Promise<LeadWithCounselor | undefined>;
  getAllLeads(includeDeleted?: boolean): Promise<LeadWithCounselor[]>;
  getLeadsByStatus(status: string): Promise<LeadWithCounselor[]>;
  getLeadsByCounselor(counselorId: number): Promise<LeadWithCounselor[]>;
  getLeadsByDateRange(startDate: Date, endDate: Date): Promise<LeadWithCounselor[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined>;
  getRecentLeads(limit?: number): Promise<LeadWithCounselor[]>;
  getLeadsRequiringFollowUp(): Promise<LeadWithCounselor[]>;
  restoreLead(id: number): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<void>;

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
  getEnrollmentStats(): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    newEnrollmentsThisMonth: number;
    enrollmentTrend: number;
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
  getAllPayroll(): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, updates: Partial<Payroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
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
  getAllFeeStructures(): Promise<FeeStructure[]>;
  getFeeStructureByStudent(studentId: number): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  updateFeeStructure(id: number, updates: Partial<FeeStructure>): Promise<FeeStructure | undefined>;
  
  // Global Class Fee Management
  getGlobalClassFee(id: number): Promise<GlobalClassFee | undefined>;
  getAllGlobalClassFees(): Promise<GlobalClassFee[]>;
  getGlobalClassFeesByClass(className: string): Promise<GlobalClassFee[]>;
  createGlobalClassFee(globalClassFee: InsertGlobalClassFee): Promise<GlobalClassFee>;
  updateGlobalClassFee(id: number, updates: Partial<GlobalClassFee>): Promise<GlobalClassFee | undefined>;
  deleteGlobalClassFee(id: number): Promise<boolean>;
  
  getFeePayment(id: number): Promise<FeePayment | undefined>;
  getAllFeePayments(): Promise<FeePayment[]>;
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
  getAllEMandates(): Promise<EMandate[]>;
  createEMandate(eMandate: InsertEMandate): Promise<EMandate>;
  updateEMandate(id: number, updates: Partial<EMandate>): Promise<EMandate | undefined>;
  deleteEMandate(id: number): Promise<boolean>;
  
  getEmiSchedule(id: number): Promise<EmiSchedule | undefined>;
  getEmiScheduleByMandate(eMandateId: number): Promise<EmiSchedule[]>;
  createEmiSchedule(emiSchedule: InsertEmiSchedule): Promise<EmiSchedule>;
  updateEmiSchedule(id: number, updates: Partial<EmiSchedule>): Promise<EmiSchedule | undefined>;
  getUpcomingEmis(): Promise<EmiSchedule[]>;
  
  // EMI Plan operations
  getEmiPlan(id: number): Promise<EmiPlan | undefined>;
  getEmiPlansByStudent(studentId: number): Promise<EmiPlan[]>;
  getAllEmiPlans(): Promise<EmiPlan[]>;
  createEmiPlan(emiPlan: InsertEmiPlan): Promise<EmiPlan>;
  updateEmiPlan(id: number, updates: Partial<EmiPlan>): Promise<EmiPlan | undefined>;
  deleteEmiPlan(id: number): Promise<boolean>;
  
  // EMI Payment tracking operations
  getPendingEmisForPlan(emiPlanId: number): Promise<any[]>;
  getEmiPaymentProgress(emiPlanId: number): Promise<any>;
  checkEmiPlanCompletion(emiPlanId: number): Promise<boolean>;

  // Fee Payment Deletion
  deleteFeePayment(id: number): Promise<boolean>;

  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsByUser(userId: number): Promise<Notification[]>;
  getNotificationsByType(type: string, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: Partial<Notification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<number>;
  deleteNotification(id: number): Promise<boolean>;
  deleteAllNotifications(userId: number): Promise<number>;
  getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Array<{ type: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Basic user operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(insertUser).returning();
    return result[0];
  }

  async getAllCounselors(): Promise<User[]> {
    return await db.select().from(schema.users).where(eq(schema.users.role, "counselor"));
  }

  // Lead operations with counselor details
  async getLead(id: number): Promise<LeadWithCounselor | undefined> {
    const result = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .where(eq(schema.leads.id, id));
    
    return result[0] ? {
      ...result[0],
      counselor: result[0].counselor || undefined
    } : undefined;
  }

  async getAllLeads(includeDeleted = false): Promise<LeadWithCounselor[]> {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90*24*60*60*1000);
    let query = db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        deletedAt: schema.leads.deletedAt,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .orderBy(desc(schema.leads.createdAt));
    if (!includeDeleted) {
      query = query.where(or(
        isNull(schema.leads.deletedAt),
        gte(schema.leads.deletedAt, ninetyDaysAgo)
      )).where(not(eq(schema.leads.status, "deleted")));
    }
    const result = await query;
    return result.map(item => ({
      ...item,
      counselor: item.counselor || undefined
    }));
  }

  async getLeadsByStatus(status: string): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .where(eq(schema.leads.status, status))
      .orderBy(desc(schema.leads.createdAt));
    
    return result.map(item => ({
      ...item,
      counselor: item.counselor || undefined
    }));
  }

  async getLeadsByCounselor(counselorId: number): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .where(eq(schema.leads.counselorId, counselorId))
      .orderBy(desc(schema.leads.createdAt));
    
    return result.map(item => ({
      ...item,
      counselor: item.counselor || undefined
    }));
  }

  async getLeadsByDateRange(startDate: Date, endDate: Date): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .where(and(
        gte(schema.leads.createdAt, startDate),
        lte(schema.leads.createdAt, endDate)
      ))
      .orderBy(desc(schema.leads.createdAt));
    
    return result.map(item => ({
      ...item,
      counselor: item.counselor || undefined
    }));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(schema.leads).values(insertLead).returning();
    return result[0];
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const result = await db.update(schema.leads).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.leads.id, id)).returning();
    return result[0];
  }

  async getRecentLeads(limit: number = 10): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        lead: schema.leads,
        counselor: schema.users
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .orderBy(desc(schema.leads.createdAt))
      .limit(limit);

    return result.map(({ lead, counselor }) => ({
      ...lead,
      counselor: counselor || undefined
    }));
  }

  async getLeadsRequiringFollowUp(): Promise<LeadWithCounselor[]> {
    const result = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        class: schema.leads.class,
        stream: schema.leads.stream,
        source: schema.leads.source,
        status: schema.leads.status,
        interestedProgram: schema.leads.interestedProgram,
        notes: schema.leads.notes,
        counselorId: schema.leads.counselorId,
        assignedAt: schema.leads.assignedAt,
        createdAt: schema.leads.createdAt,
        updatedAt: schema.leads.updatedAt,
        lastContactedAt: schema.leads.lastContactedAt,
        admissionLikelihood: schema.leads.admissionLikelihood,
        parentName: schema.leads.parentName,
        parentPhone: schema.leads.parentPhone,
        address: schema.leads.address,
        counselor: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          password: schema.users.password,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.leads)
      .leftJoin(schema.users, eq(schema.leads.counselorId, schema.users.id))
      .where(eq(schema.leads.status, "interested"))
      .orderBy(desc(schema.leads.createdAt));
    
    return result.map(item => ({
      ...item,
      counselor: item.counselor || undefined
    }));
  }

  // Follow-up operations
  async getFollowUp(id: number): Promise<FollowUp | undefined> {
    const result = await db.select().from(schema.followUps).where(eq(schema.followUps.id, id));
    return result[0];
  }

  async getFollowUpsByLead(leadId: number): Promise<FollowUp[]> {
    return await db.select().from(schema.followUps)
      .where(eq(schema.followUps.leadId, leadId))
      .orderBy(desc(schema.followUps.scheduledAt));
  }

  async getFollowUpsByCounselor(counselorId: number): Promise<FollowUp[]> {
    return await db.select().from(schema.followUps)
      .where(eq(schema.followUps.counselorId, counselorId))
      .orderBy(desc(schema.followUps.scheduledAt));
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const result = await db.insert(schema.followUps).values(insertFollowUp).returning();
    return result[0];
  }

  async updateFollowUp(id: number, updates: Partial<FollowUp>): Promise<FollowUp | undefined> {
    const result = await db.update(schema.followUps).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.followUps.id, id)).returning();
    return result[0];
  }

  async getOverdueFollowUps(): Promise<FollowUp[]> {
    const now = new Date();
    return await db.select().from(schema.followUps)
      .where(and(
        eq(schema.followUps.status, "scheduled"),
        sql`${schema.followUps.scheduledAt} < ${now}`
      ));
  }

  // Lead source operations
  async getAllLeadSources(): Promise<LeadSource[]> {
    return await db.select().from(schema.leadSources);
  }

  async createLeadSource(insertSource: InsertLeadSource): Promise<LeadSource> {
    const result = await db.insert(schema.leadSources).values(insertSource).returning();
    return result[0];
  }

  async updateLeadSource(id: number, updates: Partial<LeadSource>): Promise<LeadSource | undefined> {
    const result = await db.update(schema.leadSources).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.leadSources.id, id)).returning();
    return result[0];
  }

  // Analytics operations
  async getLeadStats(): Promise<{
    totalLeads: number;
    hotLeads: number;
    conversions: number;
    newLeadsToday: number;
  }> {
    const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(schema.leads);
    const hotLeads = await db.select({ count: sql<number>`count(*)` }).from(schema.leads).where(eq(schema.leads.status, "hot"));
    const conversions = await db.select({ count: sql<number>`count(*)` }).from(schema.leads).where(eq(schema.leads.status, "enrolled"));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newLeadsToday = await db.select({ count: sql<number>`count(*)` }).from(schema.leads)
      .where(gte(schema.leads.createdAt, today));

    return {
      totalLeads: totalLeads[0].count,
      hotLeads: hotLeads[0].count,
      conversions: conversions[0].count,
      newLeadsToday: newLeadsToday[0].count
    };
  }

  async getEnrollmentStats(): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    newEnrollmentsThisMonth: number;
    enrollmentTrend: number;
  }> {
    // Get total enrollments (leads with status "enrolled")
    const totalEnrollments = await db.select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(eq(schema.leads.status, "enrolled"));
    
    // Get active enrollments (leads with status "enrolled")
    const activeEnrollments = await db.select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(eq(schema.leads.status, "enrolled"));
    
    // Get new enrollments this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const newEnrollmentsThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.status, "enrolled"),
          gte(schema.leads.createdAt, monthStart),
          lte(schema.leads.createdAt, monthEnd)
        )
      );
    
    // Get previous month enrollments for trend calculation
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0);
    
    const prevMonthEnrollments = await db.select({ count: sql<number>`count(*)` })
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.status, "enrolled"),
          gte(schema.leads.createdAt, prevMonthStart),
          lte(schema.leads.createdAt, prevMonthEnd)
        )
      );
    
    // Calculate trend percentage
    const currentCount = newEnrollmentsThisMonth[0]?.count || 0;
    const prevCount = prevMonthEnrollments[0]?.count || 0;
    const enrollmentTrend = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : 0;
    
    return {
      totalEnrollments: totalEnrollments[0]?.count || 0,
      activeEnrollments: activeEnrollments[0]?.count || 0,
      newEnrollmentsThisMonth: currentCount,
      enrollmentTrend: Math.round(enrollmentTrend * 100) / 100, // Round to 2 decimal places
    };
  }

  async getLeadSourcePerformance(): Promise<Array<{
    source: string;
    totalLeads: number;
    conversions: number;
    conversionRate: number;
  }>> {
    const sources = await db.select().from(schema.leadSources);
    const performance = [];

    for (const source of sources) {
      const totalLeads = await db.select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(eq(schema.leads.source, source.name));
      
      const conversions = await db.select({ count: sql<number>`count(*)` })
        .from(schema.leads)
        .where(and(
          eq(schema.leads.source, source.name),
          eq(schema.leads.status, "enrolled")
        ));

      const total = totalLeads[0].count;
      const converted = conversions[0].count;
      
      performance.push({
        source: source.name,
        totalLeads: total,
        conversions: converted,
        conversionRate: total > 0 ? (converted / total) * 100 : 0
      });
    }

    return performance;
  }

  async getMonthlyEnrollmentTrend(): Promise<Array<{
    month: string;
    enrollments: number;
  }>> {
    // Get enrollments by month for the last 12 months
    const enrollments = await db
      .select({
        month: sql<string>`to_char(${schema.leads.updatedAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(schema.leads)
      .where(eq(schema.leads.status, "enrolled"))
      .groupBy(sql`to_char(${schema.leads.updatedAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${schema.leads.updatedAt}, 'YYYY-MM')`);

    return enrollments.map(e => ({
      month: e.month,
      enrollments: e.count
    }));
  }

  // Staff operations - simplified implementations to avoid errors
  async getStaff(id: number): Promise<Staff | undefined> {
    const result = await db.select().from(schema.staff).where(eq(schema.staff.id, id));
    return result[0];
  }

  async getAllStaff(): Promise<StaffWithDetails[]> {
    return await db.select().from(schema.staff);
  }

  async getStaffByRole(role: string): Promise<Staff[]> {
    return await db.select().from(schema.staff).where(eq(schema.staff.role, role));
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const result = await db.insert(schema.staff).values(insertStaff).returning();
    return result[0];
  }

  async updateStaff(id: number, updates: Partial<Staff>): Promise<Staff | undefined> {
    const result = await db.update(schema.staff).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.staff.id, id)).returning();
    return result[0];
  }

  async deleteStaff(id: number): Promise<boolean> {
    try {
      console.log(`Starting deletion of staff ID: ${id}`);
      
      // First, delete related records (payroll, attendance)
      console.log(`Deleting payroll records for staff ID: ${id}`);
      const payrollResult = await db.delete(schema.payroll).where(eq(schema.payroll.staffId, id));
      console.log(`Payroll deletion result:`, payrollResult);
      
      console.log(`Deleting attendance records for staff ID: ${id}`);
      const attendanceResult = await db.delete(schema.attendance).where(eq(schema.attendance.staffId, id));
      console.log(`Attendance deletion result:`, attendanceResult);
      
      // Then delete the staff record
      console.log(`Deleting staff record ID: ${id}`);
      const staffResult = await db.delete(schema.staff).where(eq(schema.staff.id, id));
      console.log(`Staff deletion result:`, staffResult);
      
      console.log(`Successfully deleted staff ID: ${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting staff ID ${id}:`, error);
      console.error(`Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  // Attendance operations
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const result = await db.select().from(schema.attendance).where(eq(schema.attendance.id, id));
    return result[0];
  }

  async getAttendanceByStaff(staffId: number, month?: number, year?: number): Promise<Attendance[]> {
    let query = db.select().from(schema.attendance).where(eq(schema.attendance.staffId, staffId));
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query.where(and(
        eq(schema.attendance.staffId, staffId),
        gte(schema.attendance.date, startDate.toISOString().split('T')[0]),
        lte(schema.attendance.date, endDate.toISOString().split('T')[0])
      )) as any;
    }
    
    return await query;
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(schema.attendance).values(insertAttendance).returning();
    return result[0];
  }

  async updateAttendance(id: number, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const result = await db.update(schema.attendance).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.attendance.id, id)).returning();
    return result[0];
  }

  async getAttendanceStats(month: number, year: number): Promise<{
    totalPresent: number;
    totalAbsent: number;
    averageHours: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const stats = await db
      .select({
        totalPresent: sql<number>`count(*) filter (where status = 'present')`,
        totalAbsent: sql<number>`count(*) filter (where status = 'absent')`,
        averageHours: sql<number>`avg(CASE WHEN hours_worked IS NOT NULL THEN hours_worked ELSE 0 END)`
      })
      .from(schema.attendance)
      .where(and(
        gte(schema.attendance.date, startDate.toISOString().split('T')[0]),
        lte(schema.attendance.date, endDate.toISOString().split('T')[0])
      ));

    return {
      totalPresent: stats[0].totalPresent || 0,
      totalAbsent: stats[0].totalAbsent || 0,
      averageHours: stats[0].averageHours || 0
    };
  }

  // Payroll operations
  async getPayroll(id: number): Promise<Payroll | undefined> {
    const result = await db.select().from(schema.payroll).where(eq(schema.payroll.id, id));
    return result[0];
  }

  async getPayrollByStaff(staffId: number): Promise<Payroll[]> {
    return await db.select().from(schema.payroll).where(eq(schema.payroll.staffId, staffId));
  }

  async getPayrollByMonth(month: number, year: number): Promise<Payroll[]> {
    return await db.select().from(schema.payroll)
      .where(and(
        eq(schema.payroll.month, month),
        eq(schema.payroll.year, year)
      ));
  }

  async getAllPayroll(): Promise<Payroll[]> {
    return await db.select().from(schema.payroll);
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    // Ensure attendedDays is included if present
    console.log('Storage createPayroll - Input data:', JSON.stringify(insertPayroll, null, 2));
    const result = await db.insert(schema.payroll).values(insertPayroll).returning();
    console.log('Storage createPayroll - Result:', JSON.stringify(result[0], null, 2));
    return result[0];
  }

  async updatePayroll(id: number, updates: Partial<Payroll>): Promise<Payroll | undefined> {
    const result = await db.update(schema.payroll).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.payroll.id, id)).returning();
    return result[0];
  }

  async deletePayroll(id: number): Promise<boolean> {
    const result = await db.delete(schema.payroll).where(eq(schema.payroll.id, id));
    return true;
  }

  async getPayrollStats(month: number, year: number): Promise<{
    totalSalaries: number;
    totalDeductions: number;
    totalAllowances: number;
    netPayroll: number;
  }> {
    const stats = await db
      .select({
        totalSalaries: sql<number>`sum(CAST(base_salary AS DECIMAL))`,
        totalDeductions: sql<number>`sum(CAST(deductions AS DECIMAL))`,
        totalAllowances: sql<number>`sum(CAST(allowances AS DECIMAL))`,
        netPayroll: sql<number>`sum(CAST(net_salary AS DECIMAL))`
      })
      .from(schema.payroll)
      .where(and(
        eq(schema.payroll.month, month),
        eq(schema.payroll.year, year)
      ));

    return {
      totalSalaries: stats[0].totalSalaries || 0,
      totalDeductions: stats[0].totalDeductions || 0,
      totalAllowances: stats[0].totalAllowances || 0,
      netPayroll: stats[0].netPayroll || 0
    };
  }

  // Expense operations
  async getExpense(id: number): Promise<ExpenseWithApprover | undefined> {
    const result = await db
      .select({
        id: schema.expenses.id,
        description: schema.expenses.description,
        amount: schema.expenses.amount,
        category: schema.expenses.category,
        date: schema.expenses.date,
        status: schema.expenses.status,
        receiptUrl: schema.expenses.receiptUrl,
        submittedBy: schema.expenses.submittedBy,
        approvedBy: schema.expenses.approvedBy,
        createdAt: schema.expenses.createdAt,
        updatedAt: schema.expenses.updatedAt,
        approver: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.expenses)
      .leftJoin(schema.users, eq(schema.expenses.approvedBy, schema.users.id))
      .where(eq(schema.expenses.id, id));
    
    return result[0];
  }

  async getAllExpenses(): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        id: schema.expenses.id,
        description: schema.expenses.description,
        amount: schema.expenses.amount,
        category: schema.expenses.category,
        date: schema.expenses.date,
        status: schema.expenses.status,
        receiptUrl: schema.expenses.receiptUrl,
        submittedBy: schema.expenses.submittedBy,
        approvedBy: schema.expenses.approvedBy,
        createdAt: schema.expenses.createdAt,
        updatedAt: schema.expenses.updatedAt,
        approver: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.expenses)
      .leftJoin(schema.users, eq(schema.expenses.approvedBy, schema.users.id));
    
    return result;
  }

  async getExpensesByCategory(category: string): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        id: schema.expenses.id,
        description: schema.expenses.description,
        amount: schema.expenses.amount,
        category: schema.expenses.category,
        date: schema.expenses.date,
        status: schema.expenses.status,
        receiptUrl: schema.expenses.receiptUrl,
        submittedBy: schema.expenses.submittedBy,
        approvedBy: schema.expenses.approvedBy,
        createdAt: schema.expenses.createdAt,
        updatedAt: schema.expenses.updatedAt,
        approver: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.expenses)
      .leftJoin(schema.users, eq(schema.expenses.approvedBy, schema.users.id))
      .where(eq(schema.expenses.category, category));
    
    return result;
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<ExpenseWithApprover[]> {
    const result = await db
      .select({
        id: schema.expenses.id,
        description: schema.expenses.description,
        amount: schema.expenses.amount,
        category: schema.expenses.category,
        date: schema.expenses.date,
        status: schema.expenses.status,
        receiptUrl: schema.expenses.receiptUrl,
        submittedBy: schema.expenses.submittedBy,
        approvedBy: schema.expenses.approvedBy,
        createdAt: schema.expenses.createdAt,
        updatedAt: schema.expenses.updatedAt,
        approver: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt
        }
      })
      .from(schema.expenses)
      .leftJoin(schema.users, eq(schema.expenses.approvedBy, schema.users.id))
      .where(and(
        gte(schema.expenses.date, startDate),
        lte(schema.expenses.date, endDate)
      ));
    
    return result;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const result = await db.insert(schema.expenses).values(insertExpense).returning();
    return result[0];
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const result = await db.update(schema.expenses).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.expenses.id, id)).returning();
    return result[0];
  }

  async getExpenseStats(month: number, year: number): Promise<{
    totalExpenses: number;
    categoryBreakdown: Array<{ category: string; amount: number }>;
    monthlyTrend: Array<{ month: string; amount: number }>;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const total = await db
      .select({
        total: sql<number>`sum(CAST(amount AS DECIMAL))`
      })
      .from(schema.expenses)
      .where(and(
        gte(schema.expenses.date, startDate.toISOString().split('T')[0]),
        lte(schema.expenses.date, endDate.toISOString().split('T')[0])
      ));

    const categoryBreakdown = await db
      .select({
        category: schema.expenses.category,
        amount: sql<number>`sum(CAST(amount AS DECIMAL))`
      })
      .from(schema.expenses)
      .where(and(
        gte(schema.expenses.date, startDate.toISOString().split('T')[0]),
        lte(schema.expenses.date, endDate.toISOString().split('T')[0])
      ))
      .groupBy(schema.expenses.category);

    const monthlyTrend = await db
      .select({
        month: sql<string>`to_char(${schema.expenses.date}::date, 'YYYY-MM')`,
        amount: sql<number>`sum(CAST(amount AS DECIMAL))`
      })
      .from(schema.expenses)
      .groupBy(sql`to_char(${schema.expenses.date}::date, 'YYYY-MM')`)
      .orderBy(sql`to_char(${schema.expenses.date}::date, 'YYYY-MM')`);

    return {
      totalExpenses: total[0].total || 0,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        amount: c.amount
      })),
      monthlyTrend: monthlyTrend.map(m => ({
        month: m.month,
        amount: m.amount
      }))
    };
  }

  // Student operations
  async getStudent(id: number): Promise<StudentWithFees | undefined> {
    const student = await db.select().from(schema.students).where(eq(schema.students.id, id));
    if (!student[0]) return undefined;

    const feeStructure = await db.select().from(schema.feeStructure);
    const payments = await db.select().from(schema.feePayments).where(eq(schema.feePayments.studentId, id));
    const eMandate = await db.select().from(schema.eMandates).where(eq(schema.eMandates.studentId, id));
    const emiSchedule = await db.select().from(schema.emiSchedule).where(eq(schema.emiSchedule.studentId, id));

    return {
      ...student[0],
      feeStructure: feeStructure[0],
      payments,
      eMandate: eMandate[0],
      emiSchedule
    };
  }

  async getAllStudents(): Promise<StudentWithFees[]> {
    const students = await db.select().from(schema.students);
    return students.map(student => ({
      ...student,
      feeStructure: undefined,
      payments: [],
      eMandate: undefined,
      emiSchedule: []
    }));
  }

  async getStudentsByClass(className: string): Promise<Student[]> {
    return await db.select().from(schema.students).where(eq(schema.students.class, className));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await db.insert(schema.students).values(insertStudent).returning();
    return result[0];
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const result = await db.update(schema.students).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.students.id, id)).returning();
    return result[0];
  }

  async convertLeadToStudent(leadId: number, studentData: InsertStudent): Promise<Student> {
    const student = await this.createStudent(studentData);
    await this.updateLead(leadId, { status: "enrolled" });
    return student;
  }

  // Fee management operations
  async getFeeStructure(id: number): Promise<FeeStructure | undefined> {
    const result = await db.select().from(schema.feeStructure).where(eq(schema.feeStructure.id, id));
    return result[0];
  }

  async getAllFeeStructures(): Promise<FeeStructure[]> {
    return await db.select().from(schema.feeStructure);
  }

  async getFeeStructureByStudent(studentId: number): Promise<FeeStructure[]> {
    return await db.select().from(schema.feeStructure);
  }

  async createFeeStructure(insertFeeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const result = await db.insert(schema.feeStructure).values(insertFeeStructure).returning();
    return result[0];
  }

  async updateFeeStructure(id: number, updates: Partial<FeeStructure>): Promise<FeeStructure | undefined> {
    const result = await db.update(schema.feeStructure).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.feeStructure.id, id)).returning();
    return result[0];
  }

  async getFeePayment(id: number): Promise<FeePayment | undefined> {
    const result = await db.select().from(schema.feePayments).where(eq(schema.feePayments.id, id));
    return result[0];
  }

  async getAllFeePayments(): Promise<FeePayment[]> {
    return await db.select().from(schema.feePayments);
  }

  async getFeePaymentsByStudent(studentId: number): Promise<FeePayment[]> {
    return await db.select().from(schema.feePayments).where(eq(schema.feePayments.leadId, studentId));
  }

  async createFeePayment(insertFeePayment: InsertFeePayment): Promise<FeePayment> {
    const result = await db.insert(schema.feePayments).values(insertFeePayment).returning();
    return result[0];
  }

  async getFeeStats(): Promise<{
    totalPending: number;
    totalPaid: number;
    totalOverdue: number;
    collectionRate: number;
  }> {
    return {
      totalPending: 0,
      totalPaid: 0,
      totalOverdue: 0,
      collectionRate: 0
    };
  }

  // E-Mandate operations
  async getEMandate(id: number): Promise<EMandate | undefined> {
    const result = await db.select().from(schema.eMandates).where(eq(schema.eMandates.id, id));
    return result[0];
  }

  async getEMandateByStudent(studentId: number): Promise<EMandate | undefined> {
    const result = await db.select().from(schema.eMandates).where(eq(schema.eMandates.studentId, studentId));
    return result[0];
  }

  async getAllEMandates(): Promise<EMandate[]> {
    return await db.select().from(schema.eMandates);
  }

  async createEMandate(insertEMandate: InsertEMandate): Promise<EMandate> {
    const result = await db.insert(schema.eMandates).values(insertEMandate).returning();
    return result[0];
  }

  async updateEMandate(id: number, updates: Partial<EMandate>): Promise<EMandate | undefined> {
    const result = await db.update(schema.eMandates).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.eMandates.id, id)).returning();
    return result[0];
  }

  async deleteEMandate(id: number): Promise<boolean> {
    const result = await db.delete(schema.eMandates).where(eq(schema.eMandates.id, id));
    return true;
  }

  async getEmiSchedule(id: number): Promise<EmiSchedule | undefined> {
    const result = await db.select().from(schema.emiSchedule).where(eq(schema.emiSchedule.id, id));
    return result[0];
  }

  async getEmiScheduleByMandate(eMandateId: number): Promise<EmiSchedule[]> {
    return await db.select().from(schema.emiSchedule).where(eq(schema.emiSchedule.eMandateId, eMandateId));
  }

  async createEmiSchedule(insertEmiSchedule: InsertEmiSchedule): Promise<EmiSchedule> {
    const result = await db.insert(schema.emiSchedule).values(insertEmiSchedule).returning();
    return result[0];
  }

  async updateEmiSchedule(id: number, updates: Partial<EmiSchedule>): Promise<EmiSchedule | undefined> {
    const result = await db.update(schema.emiSchedule).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.emiSchedule.id, id)).returning();
    return result[0];
  }

  async getUpcomingEmis(): Promise<EmiSchedule[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    return await db.select().from(schema.emiSchedule)
      .where(and(
        eq(schema.emiSchedule.status, "scheduled"),
        lte(schema.emiSchedule.dueDate, sevenDaysFromNow.toISOString().split('T')[0])
      ));
  }

  // Global Class Fee Management
  async getGlobalClassFee(id: number): Promise<GlobalClassFee | undefined> {
    const result = await db.select().from(schema.globalClassFees).where(eq(schema.globalClassFees.id, id));
    return result[0];
  }

  async getAllGlobalClassFees(): Promise<GlobalClassFee[]> {
    return await db.select().from(schema.globalClassFees);
  }

  async getGlobalClassFeesByClass(className: string): Promise<GlobalClassFee[]> {
    return await db.select().from(schema.globalClassFees).where(eq(schema.globalClassFees.className, className));
  }

  async createGlobalClassFee(globalClassFee: InsertGlobalClassFee): Promise<GlobalClassFee> {
    const result = await db.insert(schema.globalClassFees).values(globalClassFee).returning();
    return result[0];
  }

  async updateGlobalClassFee(id: number, updates: Partial<GlobalClassFee>): Promise<GlobalClassFee | undefined> {
    const result = await db.update(schema.globalClassFees).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.globalClassFees.id, id)).returning();
    return result[0];
  }

  async deleteGlobalClassFee(id: number): Promise<boolean> {
    await db.delete(schema.globalClassFees).where(eq(schema.globalClassFees.id, id));
    return true;
  }

  // EMI Plan operations
  async getEmiPlan(id: number): Promise<EmiPlan | undefined> {
    const result = await db.select().from(schema.emiPlans).where(eq(schema.emiPlans.id, id));
    return result[0];
  }

  async getEmiPlansByStudent(studentId: number): Promise<EmiPlan[]> {
    return await db.select().from(schema.emiPlans).where(eq(schema.emiPlans.studentId, studentId));
  }

  async getAllEmiPlans(): Promise<EmiPlan[]> {
    return await db.select().from(schema.emiPlans);
  }

  async createEmiPlan(insertEmiPlan: InsertEmiPlan): Promise<EmiPlan> {
    const result = await db.insert(schema.emiPlans).values(insertEmiPlan).returning();
    return result[0];
  }

  async updateEmiPlan(id: number, updates: Partial<EmiPlan>): Promise<EmiPlan | undefined> {
    const result = await db.update(schema.emiPlans).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(schema.emiPlans.id, id)).returning();
    return result[0];
  }

  async deleteEmiPlan(id: number): Promise<boolean> {
    // Start a transaction for atomicity
    return await db.transaction(async (trx) => {
      // Get the EMI plan to find the studentId
      const emiPlan = await trx.select().from(schema.emiPlans).where(eq(schema.emiPlans.id, id));
      if (!emiPlan[0]) return false;
      const studentId = emiPlan[0].studentId;

      // Delete all fee payments associated with this EMI plan (installmentNumber not null)
      await trx.delete(schema.feePayments)
        .where(eq(schema.feePayments.leadId, studentId))
        .where(schema.feePayments.installmentNumber.isNotNull());

      // Now delete the EMI plan itself
      await trx.delete(schema.emiPlans).where(eq(schema.emiPlans.id, id));
      return true;
    });
  }

  // EMI Payment tracking operations
  async getPendingEmisForPlan(emiPlanId: number): Promise<any[]> {
    try {
      const emiPlan = await this.getEmiPlan(emiPlanId);
      if (!emiPlan) {
        throw new Error("EMI plan not found");
      }

      // Get all payments for this EMI plan
      const payments = await db.select().from(schema.feePayments)
        .where(eq(schema.feePayments.leadId, emiPlan.studentId))
        .orderBy(schema.feePayments.installmentNumber);

      // Calculate which EMIs are pending
      const paidInstallments = new Set(payments.map(p => p.installmentNumber));
      const pendingEmis = [];

      for (let i = 1; i <= emiPlan.emiPeriod; i++) {
        if (!paidInstallments.has(i)) {
          pendingEmis.push({
            installmentNumber: i,
            amount: emiPlan.emiAmount,
            dueDate: this.calculateEmiDueDate(emiPlan.startDate, i, emiPlan.frequency),
            status: 'pending'
          });
        }
      }

      return pendingEmis;
    } catch (error) {
      console.error("Error getting pending EMIs:", error);
      throw error;
    }
  }

  async getEmiPaymentProgress(emiPlanId: number): Promise<any> {
    try {
      const emiPlan = await this.getEmiPlan(emiPlanId);
      if (!emiPlan) {
        throw new Error("EMI plan not found");
      }

      // Get all payments for this EMI plan
      const payments = await db.select().from(schema.feePayments)
        .where(eq(schema.feePayments.leadId, emiPlan.studentId))
        .orderBy(schema.feePayments.installmentNumber);

      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const totalAmount = parseFloat(emiPlan.totalAmount);
      const paidInstallments = payments.length;
      const totalInstallments = emiPlan.emiPeriod;
      const nextInstallment = paidInstallments + 1;

      return {
        emiPlanId,
        totalAmount,
        totalPaid,
        remainingAmount: totalAmount - totalPaid,
        paidInstallments,
        totalInstallments,
        nextInstallment: nextInstallment <= totalInstallments ? nextInstallment : null,
        completionPercentage: (paidInstallments / totalInstallments) * 100,
        isCompleted: paidInstallments >= totalInstallments,
        payments: payments.map(p => ({
          installmentNumber: p.installmentNumber,
          amount: p.amount,
          paymentDate: p.paymentDate,
          status: p.status
        }))
      };
    } catch (error) {
      console.error("Error getting EMI payment progress:", error);
      throw error;
    }
  }

  async checkEmiPlanCompletion(emiPlanId: number): Promise<boolean> {
    try {
      const progress = await this.getEmiPaymentProgress(emiPlanId);
      return progress.isCompleted;
    } catch (error) {
      console.error("Error checking EMI plan completion:", error);
      return false;
    }
  }

  private calculateEmiDueDate(startDate: string, installmentNumber: number, frequency: string): string {
    const start = new Date(startDate);
    let dueDate = new Date(start);
    
    switch (frequency) {
      case 'monthly':
        dueDate.setMonth(start.getMonth() + installmentNumber - 1);
        break;
      case 'quarterly':
        dueDate.setMonth(start.getMonth() + (installmentNumber - 1) * 3);
        break;
      case 'yearly':
        dueDate.setFullYear(start.getFullYear() + installmentNumber - 1);
        break;
      default:
        dueDate.setMonth(start.getMonth() + installmentNumber - 1);
    }
    
    return dueDate.toISOString().split('T')[0];
  }

  // Fee Payment Deletion
  async deleteFeePayment(id: number): Promise<boolean> {
    await db.delete(schema.feePayments).where(eq(schema.feePayments.id, id));
    return true;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id));
    return result[0];
  }

  async getNotificationsByUser(userId: number, limit?: number): Promise<Notification[]> {
    let query = db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async getUnreadNotificationsByUser(userId: number): Promise<Notification[]> {
    const result = await db.select().from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .and(eq(schema.notifications.read, false))
      .orderBy(desc(schema.notifications.createdAt));
    return result;
  }

  async getNotificationsByType(type: string, limit?: number): Promise<Notification[]> {
    let query = db.select().from(schema.notifications)
      .where(eq(schema.notifications.type, type))
      .orderBy(desc(schema.notifications.createdAt));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(schema.notifications).values(notification).returning();
    return result[0];
  }

  async updateNotification(id: number, updates: Partial<Notification>): Promise<Notification | undefined> {
    const result = await db.update(schema.notifications)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(schema.notifications.id, id))
      .returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(schema.notifications)
      .set({
        read: true,
        updatedAt: new Date()
      })
      .where(eq(schema.notifications.id, id))
      .returning();
    return result[0];
  }

  async markAllNotificationsAsRead(userId: number): Promise<number> {
    const result = await db.update(schema.notifications)
      .set({
        read: true,
        updatedAt: new Date()
      })
      .where(eq(schema.notifications.userId, userId))
      .returning();
    return result.length;
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
    return true;
  }

  async deleteAllNotifications(userId: number): Promise<number> {
    const result = await db.delete(schema.notifications).where(eq(schema.notifications.userId, userId));
    return result.length;
  }

  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Array<{ type: string; count: number }>;
  }> {
    const [totalResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId));
    
    const [unreadResult] = await db.select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .and(eq(schema.notifications.read, false));
    
    const notificationsByType = await db.select({ 
      type: schema.notifications.type, 
      count: sql<number>`count(*)` 
    })
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .groupBy(schema.notifications.type);

    return {
      total: totalResult.count,
      unread: unreadResult.count,
      byType: notificationsByType.map(n => ({
        type: n.type,
        count: n.count
      }))
    };
  }

  async restoreLead(id: number): Promise<Lead | undefined> {
    // Restore a soft-deleted lead
    return this.updateLead(id, { status: "new", deletedAt: null });
  }

  async deleteLead(id: number): Promise<void> {
    // Fetch the lead
    const lead = await this.getLead(id);
    if (!lead) return;
    try {
      const insertObj = {
        original_lead_id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        class: lead.class,
        stream: lead.stream,
        status: lead.status,
        source: lead.source,
        counselor_id: lead.counselorId,
        assigned_at: lead.assignedAt,
        created_at: lead.createdAt,
        updated_at: lead.updatedAt,
        last_contacted_at: lead.lastContactedAt,
        admission_likelihood: lead.admissionLikelihood,
        notes: lead.notes,
        parent_name: lead.parentName,
        parent_phone: lead.parentPhone,
        address: lead.address,
        interested_program: lead.interestedProgram,
        deleted_at: new Date(),
      };
      console.log('Inserting into recently_deleted_leads:', insertObj);
      await db.insert(schema.recentlyDeletedLeads).values(insertObj);
      console.log('Insert successful');
      await db.delete(schema.leads).where(eq(schema.leads.id, id));
    } catch (err) {
      console.error('Error moving lead to recently_deleted_leads:', err);
      throw err;
    }
  }
}

// Initialize database with admin user and CSV data
async function initializeBasicData() {
  const db = new DatabaseStorage();
  
  try {
    // Create admin user only
    await db.createUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Admin User",
      email: "admin@school.com"
    });

    // Import real CSV data
    const { importCSVLeads, realLeadsData } = await import("./csv-import");
    await importCSVLeads(realLeadsData);

    console.log("Admin user and CSV leads data imported successfully!");
  } catch (error) {
    console.log("Basic data already exists or error occurred:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize basic admin user and CSV data only
initializeBasicData();