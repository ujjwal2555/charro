import { db } from '../db';
import { users, attendance, leaves, payruns, settings, userPermissions, salaryComponents, skills, certifications } from '@shared/schema';
import type { User, InsertUser, Attendance, InsertAttendance, Leave, InsertLeave, Payrun, InsertPayrun, Settings, InsertSettings, UserPermission, InsertUserPermission, SalaryComponent, InsertSalaryComponent, Skill, InsertSkill, Certification, InsertCertification } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  
  // Attendance
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  getAttendanceByUserAndDate(userId: string, date: string): Promise<Attendance | undefined>;
  getAllAttendance(): Promise<Attendance[]>;
  updateAttendance(id: string, data: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  
  // Leaves
  createLeave(leave: InsertLeave): Promise<Leave>;
  getLeavesByUser(userId: string): Promise<Leave[]>;
  getAllLeaves(): Promise<Leave[]>;
  updateLeaveStatus(id: string, status: string): Promise<Leave | undefined>;
  
  // Payruns
  createPayrun(payrun: InsertPayrun): Promise<Payrun>;
  getAllPayruns(): Promise<Payrun[]>;
  getPayrunByMonth(month: string): Promise<Payrun | undefined>;
  
  // Settings
  getSettings(): Promise<Settings | undefined>;
  updateSettings(data: Partial<InsertSettings>): Promise<Settings | undefined>;
  
  // User Permissions
  getUserPermissions(userId: string): Promise<UserPermission | undefined>;
  createOrUpdateUserPermissions(data: InsertUserPermission): Promise<UserPermission>;
  
  // Salary Components
  getSalaryComponents(userId: string): Promise<SalaryComponent | undefined>;
  createOrUpdateSalaryComponents(data: InsertSalaryComponent): Promise<SalaryComponent>;
  
  // Skills
  getSkills(userId: string): Promise<Skill[]>;
  addSkill(data: InsertSkill): Promise<Skill>;
  deleteSkill(id: string): Promise<boolean>;
  
  // Certifications
  getCertifications(userId: string): Promise<Certification[]>;
  addCertification(data: InsertCertification): Promise<Certification>;
  deleteCertification(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(userData: InsertUser): Promise<User> {
    const password = userData.password || this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `u${Date.now()}`;
    
    const nameParts = userData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
    const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
    
    const usersInYear = await db.select().from(users).where(eq(users.yearOfJoining, userData.yearOfJoining));
    const serialNumber = String(usersInYear.length + 1).padStart(4, '0');
    
    const loginId = `OI${firstNamePrefix}${lastNamePrefix}${userData.yearOfJoining}${serialNumber}`;
    
    const [user] = await db.insert(users).values({
      id,
      loginId,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      department: userData.department,
      mobile: userData.mobile,
      company: userData.company,
      manager: userData.manager,
      location: userData.location,
      yearOfJoining: userData.yearOfJoining,
      basicSalary: userData.basicSalary,
      hra: userData.hra,
      otherEarnings: userData.otherEarnings,
      annualLeave: userData.annualLeave ?? 12,
      sickLeave: userData.sickLeave ?? 6,
    }).returning();
    return user;
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  // Attendance
  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const id = `a${Date.now()}`;
    const [record] = await db.insert(attendance).values({
      id,
      ...attendanceData,
    }).returning();
    return record;
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.userId, userId));
  }

  async getAttendanceByUserAndDate(userId: string, date: string): Promise<Attendance | undefined> {
    const [record] = await db.select().from(attendance).where(
      and(eq(attendance.userId, userId), eq(attendance.date, date))
    );
    return record;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance);
  }

  async updateAttendance(id: string, data: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [record] = await db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
    return record;
  }

  // Leaves
  async createLeave(leaveData: InsertLeave): Promise<Leave> {
    const id = `l${Date.now()}`;
    const [leave] = await db.insert(leaves).values({
      id,
      ...leaveData,
    }).returning();
    return leave;
  }

  async getLeavesByUser(userId: string): Promise<Leave[]> {
    return await db.select().from(leaves).where(eq(leaves.userId, userId));
  }

  async getAllLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves);
  }

  async updateLeaveStatus(id: string, status: string): Promise<Leave | undefined> {
    const [leave] = await db.update(leaves).set({ status }).where(eq(leaves.id, id)).returning();
    return leave;
  }

  // Payruns
  async createPayrun(payrunData: InsertPayrun): Promise<Payrun> {
    const id = `p${Date.now()}`;
    const [payrun] = await db.insert(payruns).values({
      id,
      ...payrunData,
    }).returning();
    return payrun;
  }

  async getAllPayruns(): Promise<Payrun[]> {
    return await db.select().from(payruns);
  }

  async getPayrunByMonth(month: string): Promise<Payrun | undefined> {
    const [payrun] = await db.select().from(payruns).where(eq(payruns.month, month));
    return payrun;
  }

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings);
    return setting;
  }

  async updateSettings(data: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existing = await this.getSettings();
    if (existing) {
      const [setting] = await db.update(settings).set(data).where(eq(settings.id, existing.id)).returning();
      return setting;
    } else {
      const id = 's1';
      const [setting] = await db.insert(settings).values({
        id,
        pfPercent: data.pfPercent || '12',
        professionalTax: data.professionalTax || 200,
      }).returning();
      return setting;
    }
  }

  // User Permissions
  async getUserPermissions(userId: string): Promise<UserPermission | undefined> {
    const [permission] = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
    return permission;
  }

  async createOrUpdateUserPermissions(data: InsertUserPermission): Promise<UserPermission> {
    const existing = await this.getUserPermissions(data.userId);
    if (existing) {
      const [permission] = await db.update(userPermissions).set(data).where(eq(userPermissions.userId, data.userId)).returning();
      return permission;
    } else {
      const id = `up${Date.now()}`;
      const [permission] = await db.insert(userPermissions).values({
        id,
        ...data,
      }).returning();
      return permission;
    }
  }

  // Salary Components
  async getSalaryComponents(userId: string): Promise<SalaryComponent | undefined> {
    const [component] = await db.select().from(salaryComponents).where(eq(salaryComponents.userId, userId));
    return component;
  }

  async createOrUpdateSalaryComponents(data: InsertSalaryComponent): Promise<SalaryComponent> {
    const existing = await this.getSalaryComponents(data.userId);
    if (existing) {
      const [component] = await db.update(salaryComponents).set(data).where(eq(salaryComponents.userId, data.userId)).returning();
      return component;
    } else {
      const id = `sc${Date.now()}`;
      const [component] = await db.insert(salaryComponents).values({
        id,
        ...data,
      }).returning();
      return component;
    }
  }

  // Skills
  async getSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async addSkill(data: InsertSkill): Promise<Skill> {
    const id = `sk${Date.now()}`;
    const [skill] = await db.insert(skills).values({
      id,
      ...data,
    }).returning();
    return skill;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Certifications
  async getCertifications(userId: string): Promise<Certification[]> {
    return await db.select().from(certifications).where(eq(certifications.userId, userId));
  }

  async addCertification(data: InsertCertification): Promise<Certification> {
    const id = `ct${Date.now()}`;
    const [certification] = await db.insert(certifications).values({
      id,
      ...data,
    }).returning();
    return certification;
  }

  async deleteCertification(id: string): Promise<boolean> {
    const result = await db.delete(certifications).where(eq(certifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
