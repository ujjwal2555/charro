import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertAttendanceSchema, insertLeaveSchema, insertPayrunSchema, insertSettingsSchema, insertUserPermissionSchema, insertSalaryComponentSchema, insertSkillSchema, insertCertificationSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).send({ error: "Not authenticated" });
  }
  next();
}

// Middleware to check if user has required role
function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).send({ error: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).send({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express) {
  // ===== Authentication Routes =====
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).send({ error: "Invalid credentials" });
      }
      
      const valid = await storage.verifyPassword(user.id, password);
      if (!valid) {
        return res.status(401).send({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  
  // ===== User/Employee Routes =====
  
  // Update own profile (authenticated users can update their own non-sensitive fields)
  app.patch("/api/users/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      
      // Only allow updating non-sensitive fields for self-service
      const allowedFields = ['about', 'hobbies', 'mobile', 'location'];
      const updates: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).send({ error: "No valid fields to update" });
      }
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Get all users (admin/hr only - full data)
  app.get("/api/users", requireRole('admin', 'hr'), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });

  // Get employee directory (all authenticated users - without salary info for employees)
  app.get("/api/users/directory", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }

      const users = await storage.getAllUsers();
      
      // If employee role, exclude salary information and leave balances
      if (currentUser.role === 'employee') {
        const sanitizedUsers = users.map(({ password, basicSalary, hra, otherEarnings, annualLeave, sickLeave, ...user }) => user);
        return res.json(sanitizedUsers);
      }
      
      // For other roles, return full data without password
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Get current user's profile (any authenticated user)
  app.get("/api/users/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Create user (admin/hr only)
  app.post("/api/users", requireRole('admin', 'hr'), async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // Update user (admin/hr only)
  app.patch("/api/users/:id", requireRole('admin', 'hr'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Delete user (admin only)
  app.delete("/api/users/:id", requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).send({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Attendance Routes =====
  
  // Get attendance (own for employees, all for admin/hr/payroll)
  app.get("/api/attendance", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }
      
      // Employees can only see their own attendance
      if (currentUser.role === 'employee') {
        const records = await storage.getAttendanceByUser(currentUser.id);
        return res.json(records);
      }
      
      // Admin, HR, and Payroll can see all attendance
      const records = await storage.getAllAttendance();
      res.json(records);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Clock in
  app.post("/api/attendance/clock-in", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already clocked in today
      const existing = await storage.getAttendanceByUserAndDate(userId, today);
      if (existing) {
        return res.status(400).send({ error: "Already clocked in today" });
      }
      
      const now = new Date();
      const attendance = await storage.createAttendance({
        userId,
        date: today,
        inTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        outTime: null,
        status: 'Present'
      });
      
      res.json(attendance);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Clock out
  app.post("/api/attendance/clock-out", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const today = new Date().toISOString().split('T')[0];
      
      const existing = await storage.getAttendanceByUserAndDate(userId, today);
      if (!existing) {
        return res.status(400).send({ error: "Not clocked in today" });
      }
      
      if (existing.outTime) {
        return res.status(400).send({ error: "Already clocked out" });
      }
      
      const now = new Date();
      const attendance = await storage.updateAttendance(existing.id, {
        outTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      });
      
      res.json(attendance);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Leave Routes =====
  
  // Get leaves (own for employees, all for admin/hr/payroll)
  app.get("/api/leaves", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }
      
      // Employees can only see their own leaves
      if (currentUser.role === 'employee') {
        const leaves = await storage.getLeavesByUser(currentUser.id);
        return res.json(leaves);
      }
      
      // Admin, HR, and Payroll can see all leaves
      const leaves = await storage.getAllLeaves();
      res.json(leaves);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Apply for leave
  app.post("/api/leaves", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const leaveData = insertLeaveSchema.parse({
        ...req.body,
        userId,
        status: 'Pending'
      });
      
      const leave = await storage.createLeave(leaveData);
      res.json(leave);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // Approve/Reject leave (admin/payroll only - payroll officer approves time-off)
  app.patch("/api/leaves/:id", requireRole('admin', 'payroll'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
        return res.status(400).send({ error: "Invalid status" });
      }
      
      const leave = await storage.updateLeaveStatus(id, status);
      if (!leave) {
        return res.status(404).send({ error: "Leave not found" });
      }
      
      res.json(leave);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });

  // Update employee leave balance (admin/hr only - HR allocates leaves)
  app.patch("/api/users/:id/leaves", requireRole('admin', 'hr'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { annualLeave, sickLeave } = req.body;
      
      const updateData: any = {};
      if (annualLeave !== undefined) updateData.annualLeave = annualLeave;
      if (sickLeave !== undefined) updateData.sickLeave = sickLeave;
      
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Payroll Routes =====
  
  // Get all payruns (admin/payroll only)
  app.get("/api/payruns", requireRole('admin', 'payroll'), async (req: Request, res: Response) => {
    try {
      const payruns = await storage.getAllPayruns();
      res.json(payruns);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Get current user's payslip data (any authenticated user)
  app.get("/api/payruns/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const payruns = await storage.getAllPayruns();
      
      // Filter payruns to only include current user's payslip data
      const userPayruns = payruns.map(payrun => {
        const items = payrun.items as Array<{userId: string, gross: number, deductions: number, net: number}>;
        const userItem = items.find(item => item.userId === userId);
        if (!userItem) return null;
        
        return {
          id: payrun.id,
          month: payrun.month,
          item: userItem
        };
      }).filter(Boolean);
      
      res.json(userPayruns);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Generate payrun (admin/payroll only)
  app.post("/api/payruns", requireRole('admin', 'payroll'), async (req: Request, res: Response) => {
    try {
      const { month } = req.body;
      const userId = req.session.userId!;
      
      // Get settings
      const settingsData = await storage.getSettings();
      if (!settingsData) {
        return res.status(400).send({ error: "Settings not configured" });
      }
      
      // Get all users
      const users = await storage.getAllUsers();
      
      // Calculate payroll for each user
      const items = users.map(user => {
        const gross = user.basicSalary + user.hra + user.otherEarnings;
        const pf = (user.basicSalary * parseFloat(settingsData.pfPercent)) / 100;
        const deductions = pf + settingsData.professionalTax;
        const net = gross - deductions;
        
        return {
          userId: user.id,
          gross,
          deductions: Math.round(deductions),
          net: Math.round(net)
        };
      });
      
      const totalPayroll = items.reduce((sum, item) => sum + item.net, 0);
      
      const payrun = await storage.createPayrun({
        month,
        generatedBy: userId,
        totalPayroll,
        items
      });
      
      res.json(payrun);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Settings Routes =====
  
  // Get settings
  app.get("/api/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      let settings = await storage.getSettings();
      if (!settings) {
        // Create default settings
        settings = await storage.updateSettings({
          pfPercent: '12',
          professionalTax: 200
        });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Update settings (admin only)
  app.patch("/api/settings", requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== User Permissions Routes =====
  
  // Get user permissions (admin only)
  app.get("/api/users/:id/permissions", requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const permissions = await storage.getUserPermissions(req.params.id);
      res.json(permissions);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Create or update user permissions (admin only)
  app.post("/api/users/:id/permissions", requireRole('admin'), async (req: Request, res: Response) => {
    try {
      const data = insertUserPermissionSchema.parse({
        userId: req.params.id,
        ...req.body,
      });
      const permissions = await storage.createOrUpdateUserPermissions(data);
      res.json(permissions);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Salary Components Routes =====
  
  // Get salary components (admin/payroll only, or own data)
  app.get("/api/users/:id/salary-components", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }
      
      // Only admin/payroll can view others' salary, or users can view their own
      if (req.params.id !== req.session.userId && !['admin', 'payroll'].includes(currentUser.role)) {
        return res.status(403).send({ error: "Insufficient permissions" });
      }
      
      const components = await storage.getSalaryComponents(req.params.id);
      res.json(components);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Create or update salary components (admin/payroll only)
  app.post("/api/users/:id/salary-components", requireRole('admin', 'payroll'), async (req: Request, res: Response) => {
    try {
      const data = insertSalaryComponentSchema.parse({
        userId: req.params.id,
        ...req.body,
      });
      const components = await storage.createOrUpdateSalaryComponents(data);
      res.json(components);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Skills Routes =====
  
  // Get skills for a user
  app.get("/api/users/:id/skills", requireAuth, async (req: Request, res: Response) => {
    try {
      const skills = await storage.getSkills(req.params.id);
      res.json(skills);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Add skill (user can only add to their own profile)
  app.post("/api/users/:id/skills", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }
      
      // Only admin can add to others, or users can add to their own
      if (req.params.id !== req.session.userId && currentUser.role !== 'admin') {
        return res.status(403).send({ error: "Insufficient permissions" });
      }
      
      const data = insertSkillSchema.parse({
        userId: req.params.id,
        ...req.body,
      });
      const skill = await storage.addSkill(data);
      res.json(skill);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // Delete skill
  app.delete("/api/skills/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteSkill(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).send({ error: "Skill not found" });
      }
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // ===== Certifications Routes =====
  
  // Get certifications for a user
  app.get("/api/users/:id/certifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const certifications = await storage.getCertifications(req.params.id);
      res.json(certifications);
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
  
  // Add certification (user can only add to their own profile)
  app.post("/api/users/:id/certifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUserById(req.session.userId!);
      if (!currentUser) {
        return res.status(404).send({ error: "User not found" });
      }
      
      // Only admin can add to others, or users can add to their own
      if (req.params.id !== req.session.userId && currentUser.role !== 'admin') {
        return res.status(403).send({ error: "Insufficient permissions" });
      }
      
      const data = insertCertificationSchema.parse({
        userId: req.params.id,
        ...req.body,
      });
      const certification = await storage.addCertification(data);
      res.json(certification);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).send({ error: error.errors });
      }
      res.status(500).send({ error: error.message });
    }
  });
  
  // Delete certification
  app.delete("/api/certifications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteCertification(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).send({ error: "Certification not found" });
      }
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  });
}
