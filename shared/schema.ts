import { pgTable, text, integer, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  loginId: text("login_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'hr' | 'payroll' | 'employee'
  department: text("department").notNull(),
  mobile: text("mobile"),
  company: text("company"),
  manager: text("manager"),
  location: text("location"),
  yearOfJoining: integer("year_of_joining").notNull(),
  basicSalary: integer("basic_salary").notNull(),
  hra: integer("hra").notNull(),
  otherEarnings: integer("other_earnings").notNull(),
  annualLeave: integer("annual_leave").notNull().default(12),
  sickLeave: integer("sick_leave").notNull().default(6),
  about: text("about"),
  hobbies: text("hobbies"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text("date").notNull(), // YYYY-MM-DD format
  inTime: text("in_time").notNull(),
  outTime: text("out_time"),
  status: text("status").notNull(), // 'Present' | 'Absent' | 'Half' | 'Leave'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaves = pgTable("leaves", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'Annual' | 'Sick' | 'Casual'
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull(), // 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payruns = pgTable("payruns", {
  id: text("id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM format
  generatedBy: text("generated_by").notNull().references(() => users.id),
  totalPayroll: integer("total_payroll").notNull(),
  items: json("items").notNull(), // Array of { userId, gross, deductions, net }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  pfPercent: decimal("pf_percent", { precision: 5, scale: 2 }).notNull(),
  professionalTax: integer("professional_tax").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPermissions = pgTable("user_permissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  employees: text("employees").notNull().default("none"), // 'none' | 'view' | 'edit'
  attendance: text("attendance").notNull().default("none"),
  timeOff: text("time_off").notNull().default("none"),
  payroll: text("payroll").notNull().default("none"),
  reports: text("reports").notNull().default("none"),
  settings: text("settings").notNull().default("none"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaryComponents = pgTable("salary_components", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  monthlyWage: integer("monthly_wage").notNull(),
  yearlyWage: integer("yearly_wage").notNull(),
  workingDays: integer("working_days").notNull().default(22),
  workingHours: decimal("working_hours", { precision: 5, scale: 2 }).notNull().default("8.00"),
  breakTime: decimal("break_time", { precision: 5, scale: 2 }).notNull().default("1.00"),
  basicSalary: integer("basic_salary").notNull(),
  basicSalaryPercent: decimal("basic_salary_percent", { precision: 5, scale: 2 }).notNull(),
  overtimeAllowance: integer("overtime_allowance").notNull().default(0),
  overtimePercent: decimal("overtime_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  performanceBonus: integer("performance_bonus").notNull().default(0),
  performanceBonusPercent: decimal("performance_bonus_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  leaveTravelAllowance: integer("leave_travel_allowance").notNull().default(0),
  leaveTravelPercent: decimal("leave_travel_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  fixedAllowance: integer("fixed_allowance").notNull().default(0),
  fixedAllowancePercent: decimal("fixed_allowance_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  pfEmployer: integer("pf_employer").notNull().default(0),
  pfEmployerPercent: decimal("pf_employer_percent", { precision: 5, scale: 2 }).notNull().default("12.00"),
  pfEmployee: integer("pf_employee").notNull().default(0),
  pfEmployeePercent: decimal("pf_employee_percent", { precision: 5, scale: 2 }).notNull().default("12.00"),
  professionalTax: integer("professional_tax").notNull().default(0),
  incomeTax: integer("income_tax").notNull().default(0),
  incomeTaxPercent: decimal("income_tax_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillName: text("skill_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certifications = pgTable("certifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  certificationName: text("certification_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  loginId: true,
  createdAt: true,
}).extend({
  password: z.string().optional(), // Password is optional in insert (will be auto-generated if not provided)
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
});

export const insertPayrunSchema = createInsertSchema(payruns).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertSalaryComponentSchema = createInsertSchema(salaryComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type Payrun = typeof payruns.$inferSelect;
export type InsertPayrun = z.infer<typeof insertPayrunSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

export type SalaryComponent = typeof salaryComponents.$inferSelect;
export type InsertSalaryComponent = z.infer<typeof insertSalaryComponentSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
