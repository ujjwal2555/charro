import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { getDataStore } from '@/lib/dataStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Reports() {
  const data = getDataStore();

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const attendanceStats = data.users.map(user => {
    const userAttendance = data.attendance.filter(a =>
      a.userId === user.id &&
      a.date >= format(monthStart, 'yyyy-MM-dd') &&
      a.date <= format(monthEnd, 'yyyy-MM-dd')
    );
    
    const present = userAttendance.filter(a => a.status === 'Present').length;
    const percentage = daysInMonth.length > 0 ? (present / daysInMonth.length) * 100 : 0;
    
    return {
      name: user.name,
      department: user.department,
      present,
      total: daysInMonth.length,
      percentage: percentage.toFixed(1)
    };
  });

  const leaveStats = data.users.map(user => {
    const userLeaves = data.leaves.filter(l => l.userId === user.id);
    const approved = userLeaves.filter(l => l.status === 'Approved').length;
    const pending = userLeaves.filter(l => l.status === 'Pending').length;
    const rejected = userLeaves.filter(l => l.status === 'Rejected').length;
    
    return {
      name: user.name,
      department: user.department,
      approved,
      pending,
      rejected,
      total: userLeaves.length
    };
  });

  const totalPayroll = data.payruns.find(p => p.month === currentMonth)?.totalPayroll || 0;
  const avgSalary = data.users.length > 0 ? totalPayroll / data.users.length : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View detailed reports and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{data.users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Leaves</p>
              <p className="text-2xl font-bold">{data.leaves.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
              <p className="text-2xl font-bold">₹{(totalPayroll / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Salary</p>
              <p className="text-2xl font-bold">₹{(avgSalary / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance Summary - {format(new Date(), 'MMMM yyyy')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Present Days</TableHead>
              <TableHead>Total Days</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceStats.map((stat, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{stat.name}</TableCell>
                <TableCell>{stat.department}</TableCell>
                <TableCell>{stat.present}</TableCell>
                <TableCell>{stat.total}</TableCell>
                <TableCell>{stat.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Leave Summary</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Rejected</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveStats.map((stat, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{stat.name}</TableCell>
                <TableCell>{stat.department}</TableCell>
                <TableCell>{stat.approved}</TableCell>
                <TableCell>{stat.pending}</TableCell>
                <TableCell>{stat.rejected}</TableCell>
                <TableCell>{stat.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
