export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  basicSalary: number;
  hra: number;
  otherEarnings: number;
  annualLeave: number;
  sickLeave: number;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  inTime: string;
  outTime?: string | null;
  status: string;
}

export interface Leave {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export interface Payrun {
  id: string;
  month: string;
  generatedBy: string;
  totalPayroll: number;
  items: Array<{
    userId: string;
    gross: number;
    deductions: number;
    net: number;
  }>;
}

export interface Settings {
  id: string;
  pfPercent: string;
  professionalTax: number;
}

export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

async function apiRequestOld(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (credentials: LoginCredentials) => {
    return apiRequestOld('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return apiRequestOld('/api/auth/me');
  },

  logout: async () => {
    return apiRequestOld('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Users
  getAllUsers: async () => {
    return apiRequestOld('/api/users');
  },

  getUserDirectory: async () => {
    return apiRequestOld('/api/users/directory');
  },

  createUser: async (userData: any) => {
    return apiRequestOld('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, data: any) => {
    return apiRequestOld(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateUserLeaves: async (id: string, data: { annualLeave?: number; sickLeave?: number }) => {
    return apiRequestOld(`/api/users/${id}/leaves`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequestOld(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Attendance
  getAttendance: async () => {
    return apiRequestOld('/api/attendance');
  },

  clockIn: async () => {
    return apiRequestOld('/api/attendance/clock-in', {
      method: 'POST',
    });
  },

  clockOut: async () => {
    return apiRequestOld('/api/attendance/clock-out', {
      method: 'POST',
    });
  },

  // Leaves
  getLeaves: async () => {
    return apiRequestOld('/api/leaves');
  },

  applyLeave: async (leaveData: any) => {
    return apiRequestOld('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  updateLeaveStatus: async (id: string, status: string) => {
    return apiRequestOld(`/api/leaves/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Payruns
  getPayruns: async () => {
    return apiRequestOld('/api/payruns');
  },
  
  getUserPayruns: async () => {
    return apiRequestOld('/api/payruns/me');
  },

  generatePayrun: async (month: string) => {
    return apiRequestOld('/api/payruns', {
      method: 'POST',
      body: JSON.stringify({ month }),
    });
  },

  // Settings
  getSettings: async () => {
    return apiRequestOld('/api/settings');
  },

  updateSettings: async (data: any) => {
    return apiRequestOld('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
