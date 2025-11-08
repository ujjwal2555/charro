export interface Attendance {
  id: string;
  userId: string;
  date: string;
  inTime: string;
  outTime: string;
  status: 'Present' | 'Absent' | 'Half' | 'Leave';
  notes?: string;
}

export interface Leave {
  id: string;
  userId: string;
  type: 'Annual' | 'Sick' | 'Casual';
  start: string;
  end: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
}

export interface PayrunItem {
  userId: string;
  gross: number;
  deductions: number;
  net: number;
}

export interface Payrun {
  id: string;
  month: string;
  generatedBy: string;
  totalPayroll: number;
  items: PayrunItem[];
}

export interface Settings {
  pfPercent: number;
  professionalTax: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DataStore {
  users: any[];
  attendance: Attendance[];
  leaves: Leave[];
  payruns: Payrun[];
  settings: Settings;
  notifications: Notification[];
}

const STORAGE_KEY = 'workzen_demo_data';

export function getDataStore(): DataStore {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return initializeDataStore();
  return JSON.parse(data);
}

export function saveDataStore(data: DataStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDataStore() {
  const data = initializeDataStore();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function initializeDataStore(): DataStore {
  const data: DataStore = {
    users: [
      { id: "u1", name: "Alice Admin", role: "admin", email: "alice@demo.com", department: "Management", salary: { basic: 90000, hra: 18000, otherEarnings: 5000 }, leaveBalance: { annual: 18, sick: 10 } },
      { id: "u2", name: "Harry HR", role: "hr", email: "harry@demo.com", department: "HR", salary: { basic: 60000, hra: 12000, otherEarnings: 3000 }, leaveBalance: { annual: 18, sick: 8 } },
      { id: "u3", name: "Pam Payroll", role: "payroll", email: "pam@demo.com", department: "Finance", salary: { basic: 65000, hra: 13000, otherEarnings: 3000 }, leaveBalance: { annual: 18, sick: 8 } },
      { id: "u4", name: "Eve Employee", role: "employee", email: "eve@demo.com", department: "Engineering", salary: { basic: 50000, hra: 10000, otherEarnings: 2000 }, leaveBalance: { annual: 12, sick: 6 } },
      { id: "u5", name: "Sam Staff", role: "employee", email: "sam@demo.com", department: "Design", salary: { basic: 45000, hra: 9000, otherEarnings: 1500 }, leaveBalance: { annual: 12, sick: 6 } }
    ],
    attendance: [
      { id: "a1", userId: "u4", date: "2025-10-01", inTime: "09:05", outTime: "17:30", status: "Present" },
      { id: "a2", userId: "u5", date: "2025-10-01", inTime: "09:15", outTime: "17:10", status: "Present" }
    ],
    leaves: [
      { id: "l1", userId: "u4", type: "Annual", start: "2025-10-10", end: "2025-10-12", status: "Pending", reason: "Family travel" },
      { id: "l2", userId: "u5", type: "Sick", start: "2025-09-05", end: "2025-09-06", status: "Approved", reason: "Fever" }
    ],
    payruns: [
      { id: "p1", month: "2025-09", generatedBy: "u3", totalPayroll: 85000, items: [{ userId: "u4", gross: 60000, deductions: 6000, net: 54000 }, { userId: "u5", gross: 55000, deductions: 5500, net: 49500 }] }
    ],
    settings: { pfPercent: 12, professionalTax: 200 },
    notifications: []
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
