import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  admissionLikelihood: true,
}).extend({
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

// Types
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type FollowUp = typeof followUps.$inferSelect;
export type LeadSource = typeof leadSources.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;

// Lead with relations
export type LeadWithCounselor = Lead & {
  counselor?: User;
  followUps?: FollowUp[];
};
