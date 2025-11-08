import { MetricCard } from '@/components/MetricCard';
import { Users, Clock, Calendar, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getDataStore } from '@/lib/dataStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const data = getDataStore();
  const [, setLocation] = useLocation();

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest<any[]>('GET', '/api/users'),
    enabled: currentUser?.role === 'admin' || currentUser?.role === 'hr',
  });

  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/attendance'],
    queryFn: () => apiRequest<any[]>('GET', '/api/attendance'),
  });

  const totalEmployees = employees.length || data.users.length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const presentToday = attendance.filter((a: any) => a.date === today && a.status === 'Present').length;
  const pendingLeaves = data.leaves.filter(l => l.status === 'Pending').length;
  const currentMonth = format(new Date(), 'yyyy-MM');
  const payrollThisMonth = data.payruns.find(p => p.month === currentMonth)?.totalPayroll || 0;

  const getTodayCheckInStatus = (userId: string) => {
    return attendance.find((a: any) => a.userId === userId && a.date === today);
  };

  const attendanceData = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
    const count = attendance.filter((a: any) => a.date === date && a.status === 'Present').length;
    return {
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      present: count
    };
  });

  const payrollData = [
    { month: 'Jul', amount: 78000 },
    { month: 'Aug', amount: 82000 },
    { month: 'Sep', amount: 85000 },
    { month: 'Oct', amount: payrollThisMonth || 88000 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="text-purple-600"
        />
        <MetricCard
          title="Present Today"
          value={presentToday}
          icon={Clock}
          color="text-teal-600"
          trend={{ value: '+2 from yesterday', positive: true }}
        />
        <MetricCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={Calendar}
          color="text-blue-600"
        />
        {(currentUser?.role === 'admin' || currentUser?.role === 'payroll') && (
          <MetricCard
            title="Payroll This Month"
            value={`₹${(payrollThisMonth / 1000).toFixed(0)}K`}
            icon={Wallet}
            color="text-indigo-600"
          />
        )}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Trend (30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.375rem'
              }}
            />
            <Line type="monotone" dataKey="present" stroke="hsl(var(--chart-1))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {(currentUser?.role === 'admin' || currentUser?.role === 'payroll') && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payroll Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.375rem'
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && employees.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Employee Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {employees.map((employee: any) => {
              const checkedIn = getTodayCheckInStatus(employee.id);
              return (
                <Card 
                  key={employee.id} 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
                  onClick={() => setLocation(`/employees/${employee.id}`)}
                  data-testid={`card-employee-${employee.id}`}
                >
                  <div 
                    className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                      checkedIn ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={checkedIn ? 'Checked In' : 'Not Checked In'}
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                      {employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{employee.name}</h4>
                    <p className="text-xs text-muted-foreground mb-1 font-mono">{employee.loginId}</p>
                    <p className="text-xs text-muted-foreground mb-2 capitalize">{employee.role}</p>
                    <div className="w-full pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                      <p className="text-xs font-medium mt-1">₹{(employee.basicSalary / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
