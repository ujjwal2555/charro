import { Card } from '@/components/ui/card';
import { HelpCircle, Users, Clock, Calendar, Wallet, BarChart3, Settings, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const helpSections = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    description: 'View key metrics, attendance trends, leave distribution, and payroll costs at a glance.',
    features: ['Real-time metrics', 'Interactive charts', 'Role-based widgets']
  },
  {
    title: 'Attendance',
    icon: Clock,
    description: 'Clock in and out daily, view attendance history, and track your presence.',
    features: ['Clock In/Out', 'Monthly calendar', 'Attendance history']
  },
  {
    title: 'Leave Management',
    icon: Calendar,
    description: 'Apply for leave, track leave balance, and manage requests (role-based approval).',
    features: ['Apply for leave', 'Track status', 'Approve/Reject (Admin/Payroll)']
  },
  {
    title: 'Employee Directory',
    icon: Users,
    description: 'View all employees, search by name or department, and manage employee records.',
    features: ['Employee profiles', 'Search & filter', 'Add/Edit/Delete (Admin/HR)']
  },
  {
    title: 'Payroll',
    icon: Wallet,
    description: 'Generate payruns, view payslips, and download salary breakdowns (Admin/Payroll only).',
    features: ['Generate payrun', 'View payslips', 'Print/Download']
  },
  {
    title: 'Reports',
    icon: BarChart3,
    description: 'Access detailed attendance, leave, and payroll reports with analytics.',
    features: ['Attendance summary', 'Leave statistics', 'Payroll breakdown']
  },
  {
    title: 'Profile',
    icon: UserCircle,
    description: 'Edit your personal information, view salary details, and check leave balance.',
    features: ['Edit profile', 'View salary', 'Leave balance']
  },
  {
    title: 'Settings',
    icon: Settings,
    description: 'Configure system settings like PF percentage and professional tax (Admin only).',
    features: ['Payroll settings', 'Reset demo data', 'System configuration']
  }
];

const roles = [
  {
    name: 'Admin',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    permissions: ['Full system access', 'Manage all modules', 'Configure settings', 'View all reports']
  },
  {
    name: 'HR Officer',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    permissions: ['Manage employees', 'View attendance', 'Cannot access payroll settings']
  },
  {
    name: 'Payroll Officer',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    permissions: ['Approve/reject leaves', 'Generate payruns', 'View payroll reports']
  },
  {
    name: 'Employee',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    permissions: ['Mark attendance', 'Apply for leave', 'View own payslips and attendance']
  }
];

export default function Help() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <HelpCircle className="w-8 h-8" />
          Help & Documentation
        </h1>
        <p className="text-muted-foreground">
          Learn how to use WorkZen HRMS
        </p>
      </div>

      <Card className="p-6 bg-accent">
        <h2 className="text-lg font-semibold mb-2">About This Demo</h2>
        <p className="text-sm text-muted-foreground mb-2">
          This is a fully interactive frontend HRMS prototype. All data is stored locally in your browser
          using localStorage. No backend server is required.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Switch roles using the user menu in the header</li>
          <li>All changes persist in browser storage</li>
          <li>Use "Reset Demo Data" in Settings to restore defaults</li>
          <li>This is a demo - no real data is stored on any server</li>
        </ul>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helpSections.map((section) => (
            <Card key={section.title} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  <ul className="text-sm space-y-1">
                    {section.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">User Roles & Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.name} className="p-6">
              <Badge className={`mb-3 ${role.color}`}>{role.name}</Badge>
              <ul className="text-sm space-y-2">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-foreground rounded-full mt-2"></span>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="font-semibold min-w-[120px]">Clock In/Out:</span>
            <span className="text-muted-foreground">Use the Attendance page to mark your daily attendance</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold min-w-[120px]">Apply Leave:</span>
            <span className="text-muted-foreground">Click "Apply Leave" on the Leave page and fill in the details</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold min-w-[120px]">View Payslip:</span>
            <span className="text-muted-foreground">Go to Payroll page and click "View Payslip" on any payrun</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold min-w-[120px]">Switch Roles:</span>
            <span className="text-muted-foreground">Click your avatar in the header and select a different role</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold min-w-[120px]">Reset Data:</span>
            <span className="text-muted-foreground">Go to Settings and use "Reset Demo Data" to restore defaults</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
