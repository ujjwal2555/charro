import { storage } from './storage';
import { format } from 'date-fns';

export async function seedDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // Create settings
    await storage.updateSettings({
      pfPercent: '12',
      professionalTax: 200
    });

    // Create users sequentially to ensure correct serial numbers
    const users = [];
    
    users.push(await storage.createUser({
      name: 'Admin User',
      email: 'admin@workzen.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
      mobile: '+91 98765 43210',
      company: 'WorkZen Technologies',
      manager: 'CEO',
      location: 'Mumbai, India',
      yearOfJoining: 2020,
      basicSalary: 80000,
      hra: 20000,
      otherEarnings: 5000,
      annualLeave: 12,
      sickLeave: 6
    }));
    
    users.push(await storage.createUser({
      name: 'HR Manager',
      email: 'hr@workzen.com',
      password: 'hr123',
      role: 'hr',
      department: 'Human Resources',
      mobile: '+91 98765 43211',
      company: 'WorkZen Technologies',
      manager: 'Admin User',
      location: 'Mumbai, India',
      yearOfJoining: 2021,
      basicSalary: 60000,
      hra: 15000,
      otherEarnings: 3000,
      annualLeave: 12,
      sickLeave: 6
    }));
    
    users.push(await storage.createUser({
      name: 'Payroll Officer',
      email: 'payroll@workzen.com',
      password: 'payroll123',
      role: 'payroll',
      department: 'Finance',
      mobile: '+91 98765 43212',
      company: 'WorkZen Technologies',
      manager: 'Admin User',
      location: 'Mumbai, India',
      yearOfJoining: 2021,
      basicSalary: 55000,
      hra: 13000,
      otherEarnings: 2500,
      annualLeave: 12,
      sickLeave: 6
    }));
    
    users.push(await storage.createUser({
      name: 'John Doe',
      email: 'john@workzen.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      mobile: '+91 98765 43213',
      company: 'WorkZen Technologies',
      manager: 'HR Manager',
      location: 'Bangalore, India',
      yearOfJoining: 2022,
      basicSalary: 50000,
      hra: 10000,
      otherEarnings: 2000,
      annualLeave: 12,
      sickLeave: 6
    }));
    
    users.push(await storage.createUser({
      name: 'Jane Smith',
      email: 'jane@workzen.com',
      password: 'employee123',
      role: 'employee',
      department: 'Marketing',
      mobile: '+91 98765 43214',
      company: 'WorkZen Technologies',
      manager: 'HR Manager',
      location: 'Delhi, India',
      yearOfJoining: 2023,
      basicSalary: 48000,
      hra: 9500,
      otherEarnings: 1800,
      annualLeave: 12,
      sickLeave: 6
    }));
    
    users.push(await storage.createUser({
      name: 'Mike Johnson',
      email: 'mike@workzen.com',
      password: 'employee123',
      role: 'employee',
      department: 'Sales',
      mobile: '+91 98765 43215',
      company: 'WorkZen Technologies',
      manager: 'HR Manager',
      location: 'Pune, India',
      yearOfJoining: 2023,
      basicSalary: 52000,
      hra: 11000,
      otherEarnings: 2200,
      annualLeave: 12,
      sickLeave: 6
    }));

    // Create sample attendance for the last 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      for (const user of users) {
        await storage.createAttendance({
          userId: user.id,
          date: dateStr,
          inTime: '09:00',
          outTime: i === 0 ? null : '18:00',
          status: 'Present'
        });
      }
    }

    // Create sample leave requests
    await storage.createLeave({
      userId: users[3].id,
      type: 'Annual',
      startDate: format(new Date(2024, 10, 20), 'yyyy-MM-dd'),
      endDate: format(new Date(2024, 10, 22), 'yyyy-MM-dd'),
      reason: 'Family vacation',
      status: 'Approved'
    });

    await storage.createLeave({
      userId: users[4].id,
      type: 'Sick',
      startDate: format(new Date(2024, 10, 15), 'yyyy-MM-dd'),
      endDate: format(new Date(2024, 10, 16), 'yyyy-MM-dd'),
      reason: 'Medical appointment',
      status: 'Pending'
    });

    // Create a sample payrun
    const currentMonth = format(new Date(), 'yyyy-MM');
    const settingsData = await storage.getSettings();
    const allUsers = await storage.getAllUsers();
    
    if (settingsData) {
      const items = allUsers.map(user => {
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
      
      await storage.createPayrun({
        month: currentMonth,
        generatedBy: users[0].id,
        totalPayroll,
        items
      });
    }

    console.log('Database seeded successfully!');
    console.log('Login credentials:');
    console.log('- Admin: admin@workzen.com / admin123');
    console.log('- HR: hr@workzen.com / hr123');
    console.log('- Payroll: payroll@workzen.com / payroll123');
    console.log('- Employee: john@workzen.com / employee123');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
