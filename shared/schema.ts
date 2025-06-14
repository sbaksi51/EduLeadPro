import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("counselor"), // counselor, admin, marketing_head
  name: text("name").notNull(),
  email: text("email"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  class: text("class").notNull(), // Class 9, Class 10, etc.
  stream: text("stream"), // Science, Commerce, Arts
  status: text("status").notNull().default("new"), // new, contacted, interested, enrolled, dropped
  source: text("source").notNull(), // facebook, google_ads, website, referral, etc.
  counselorId: integer("counselor_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastContactedAt: timestamp("last_contacted_at"),
  admissionLikelihood: decimal("admission_likelihood", { precision: 5, scale: 2 }), // AI prediction 0-100
  notes: text("notes"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
  address: text("address"),
});

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  counselorId: integer("counselor_id").references(() => users.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  completedAt: timestamp("completed_at"),
  remarks: text("remarks"),
  outcome: text("outcome"), // interested, not_interested, needs_more_info, enrolled, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  conversions: integer("conversions").default(0),
  totalLeads: integer("total_leads").default(0),
});

// Staff Management
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // Teacher, Admin, Counselor, etc.
  department: varchar("department", { length: 100 }),
  dateOfJoining: date("date_of_joining").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 15 }),
  qualifications: text("qualifications"),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  ifscCode: varchar("ifsc_code", { length: 11 }),
  panNumber: varchar("pan_number", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  date: date("date").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }),
  status: varchar("status", { length: 20 }).default("present"), // present, absent, half-day, late
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense Tracking
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Salaries, Utilities, Marketing, Repairs, etc.
  subcategory: varchar("subcategory", { length: 50 }),
  description: text("description").notNull(),
  date: date("date").notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).default("cash"), // cash, card, bank_transfer, cheque
  vendorName: varchar("vendor_name", { length: 100 }),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  receiptUrl: text("receipt_url"),
  approvedBy: integer("approved_by").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student Fee Management
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  studentId: varchar("student_id", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  parentName: varchar("parent_name", { length: 100 }),
  parentPhone: varchar("parent_phone", { length: 15 }),
  class: varchar("class", { length: 50 }).notNull(),
  stream: varchar("stream", { length: 50 }),
  admissionDate: date("admission_date").notNull(),
  totalFees: decimal("total_fees", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feeStructure = pgTable("fee_structure", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  feeType: varchar("fee_type", { length: 50 }).notNull(), // tuition, admission, exam, transport, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  academicYear: varchar("academic_year", { length: 10 }).notNull(),
  installmentNumber: integer("installment_number").default(1),
  totalInstallments: integer("total_installments").default(1),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, overdue, waived
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feePayments = pgTable("fee_payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  feeStructureId: integer("fee_structure_id").references(() => feeStructure.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 30 }).notNull(), // cash, card, bank_transfer, upi, cheque
  transactionId: varchar("transaction_id", { length: 100 }),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull(),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// E-Mandate Management
export const eMandates = pgTable("e_mandates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  mandateId: varchar("mandate_id", { length: 100 }).unique().notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  ifscCode: varchar("ifsc_code", { length: 11 }).notNull(),
  accountHolderName: varchar("account_holder_name", { length: 100 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  frequency: varchar("frequency", { length: 20 }).default("monthly"), // monthly, quarterly, yearly
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, expired, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emiSchedule = pgTable("emi_schedule", {
  id: serial("id").primaryKey(),
  eMandateId: integer("e_mandate_id").references(() => eMandates.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  emiAmount: decimal("emi_amount", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  actualDate: date("actual_date"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, success, failed, cancelled
  transactionId: varchar("transaction_id", { length: 100 }),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  admissionLikelihood: true,
}).extend({
  lastContactedAt: z.date().optional().nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({
  id: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeeStructureSchema = createInsertSchema(feeStructure).omit({
  id: true,
  createdAt: true,
});

export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({
  id: true,
  createdAt: true,
});

export const insertEMandateSchema = createInsertSchema(eMandates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmiScheduleSchema = createInsertSchema(emiSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type FollowUp = typeof followUps.$inferSelect;
export type LeadSource = typeof leadSources.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Student = typeof students.$inferSelect;
export type FeeStructure = typeof feeStructure.$inferSelect;
export type FeePayment = typeof feePayments.$inferSelect;
export type EMandate = typeof eMandates.$inferSelect;
export type EmiSchedule = typeof emiSchedule.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type InsertEMandate = z.infer<typeof insertEMandateSchema>;
export type InsertEmiSchedule = z.infer<typeof insertEmiScheduleSchema>;

// Relations
export type LeadWithCounselor = Lead & {
  counselor?: User;
  followUps?: FollowUp[];
};

export type StaffWithDetails = Staff & {
  attendance?: Attendance[];
  payroll?: Payroll[];
};

export type StudentWithFees = Student & {
  feeStructure?: FeeStructure[];
  feePayments?: FeePayment[];
  eMandate?: EMandate;
};

export type ExpenseWithApprover = Expense & {
  approver?: User;
  creator?: User;
};
