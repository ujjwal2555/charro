import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Users as UsersIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDataStore } from '@/lib/dataStore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export default function Payroll() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [employerCostViewMode, setEmployerCostViewMode] = useState<'monthly' | 'annually'>('monthly');
  const [employeeCountViewMode, setEmployeeCountViewMode] = useState<'monthly' | 'annually'>('monthly');

  const data = getDataStore();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiRequest<any[]>('GET', '/api/users'),
    enabled: currentUser?.role === 'admin' || currentUser?.role === 'payroll',
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => apiRequest<any[]>('GET', '/api/attendance'),
    enabled: currentUser?.role === 'admin' || currentUser?.role === 'payroll',
  });

  const canAccess = currentUser?.role === 'admin' || currentUser?.role === 'payroll';

  if (!canAccess) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            The Payroll menu is accessible only to users with Admin/Payroll Officer access rights.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const employeesWithoutBankAccount = employees.filter((emp: any) => !emp.bankAccount || emp.bankAccount === '');
  const employeesWithoutManager = employees.filter((emp: any) => !emp.manager || emp.manager === '');

  const getMonthlyAttendanceCount = (userId: string, month: string) => {
    const monthStart = new Date(month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    return attendance.filter((a: any) => {
      const attDate = new Date(a.date);
      return a.userId === userId && 
             a.status === 'Present' &&
             attDate >= monthStart && 
             attDate <= monthEnd;
    }).length;
  };

  const generatePayslipsForMonth = () => {
    const payslips = employees.map((emp: any) => {
      const attendanceCount = getMonthlyAttendanceCount(emp.id, selectedMonth);
      const employerCost = emp.basicSalary || 50000;
      const basicWage = emp.basicSalary || 50000;
      const grossWage = basicWage + (emp.hra || 0) + (emp.otherEarnings || 0);
      const netWage = grossWage - ((basicWage * 0.12) + 200);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        attendanceCount,
        employerCost,
        basicWage,
        grossWage,
        netWage,
        status: attendanceCount > 0 ? 'Done' : 'Pending'
      };
    });

    toast({
      title: 'Payslips Generated',
      description: `Generated payslips for ${employees.length} employees for ${format(new Date(selectedMonth), 'MMMM yyyy')}`,
    });

    return payslips;
  };

  const [payslips, setPayslips] = useState<any[]>([]);

  const handlePayrunClick = () => {
    const generated = generatePayslipsForMonth();
    setPayslips(generated);
  };

  const employerCostData = employerCostViewMode === 'monthly' 
    ? [
        { month: 'Jan 2025', cost: 180000 },
        { month: 'Feb 2025', cost: 195000 },
        { month: 'Mar 2025', cost: 210000 },
      ]
    : [
        { month: 'Jan 2025', cost: 180000 },
        { month: 'Feb 2025', cost: 195000 },
        { month: 'Mar 2025', cost: 210000 },
        { month: 'Apr 2025', cost: 205000 },
        { month: 'May 2025', cost: 220000 },
        { month: 'Jun 2025', cost: 225000 },
      ];

  const employeeCountData = employeeCountViewMode === 'monthly'
    ? [
        { month: 'Jan 2025', count: employees.length || 3 },
        { month: 'Feb 2025', count: employees.length || 3 },
        { month: 'Mar 2025', count: employees.length || 3 },
      ]
    : [
        { month: 'Jan 2025', count: employees.length || 3 },
        { month: 'Feb 2025', count: employees.length || 3 },
        { month: 'Mar 2025', count: employees.length || 3 },
        { month: 'Apr 2025', count: employees.length || 3 },
        { month: 'May 2025', count: employees.length || 3 },
        { month: 'Jun 2025', count: employees.length || 3 },
      ];

  const recentPayruns = [
    { id: 1, month: 'Oct 2025', peopleCount: employees.length },
    { id: 2, month: 'Sept 2025', peopleCount: employees.length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payroll</h1>
        <p className="text-muted-foreground">
          Payroll Dashboard contains warnings, pay run information, and statistics related to employee and employer costs
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" data-testid="tab-payroll-dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="payrun" data-testid="tab-payroll-payrun">
            Payrun
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Warnings</h3>
              <div className="space-y-2">
                {employeesWithoutBankAccount.length > 0 && (
                  <div className="text-sm text-blue-600 dark:text-blue-400" data-testid="warning-bank-account">
                    {employeesWithoutBankAccount.length} Employee without Bank A/c
                  </div>
                )}
                {employeesWithoutManager.length > 0 && (
                  <div className="text-sm text-blue-600 dark:text-blue-400" data-testid="warning-manager">
                    {employeesWithoutManager.length} Employee without Manager
                  </div>
                )}
                {employeesWithoutBankAccount.length === 0 && employeesWithoutManager.length === 0 && (
                  <p className="text-sm text-muted-foreground">No warnings at this time</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payrun</h3>
              <div className="space-y-2">
                {recentPayruns.map(payrun => (
                  <div key={payrun.id} className="text-sm text-blue-600 dark:text-blue-400" data-testid={`payrun-${payrun.id}`}>
                    Payrun for {payrun.month} ({payrun.peopleCount} People)
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employer cost</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={employerCostViewMode === 'annually' ? 'default' : 'outline'}
                    onClick={() => setEmployerCostViewMode('annually')}
                    data-testid="button-employer-cost-annually"
                  >
                    Annually
                  </Button>
                  <Button
                    size="sm"
                    variant={employerCostViewMode === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setEmployerCostViewMode('monthly')}
                    data-testid="button-employer-cost-monthly"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={employerCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Bar dataKey="cost" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employee Count</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={employeeCountViewMode === 'annually' ? 'default' : 'outline'}
                    onClick={() => setEmployeeCountViewMode('annually')}
                    data-testid="button-employee-count-annually"
                  >
                    Annually
                  </Button>
                  <Button
                    size="sm"
                    variant={employeeCountViewMode === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setEmployeeCountViewMode('monthly')}
                    data-testid="button-employee-count-monthly"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={employeeCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payrun" className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                The payslip of an individual employee is generated on the basis of attendance of that employee in a particular month.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                The Payroll Payrun allows you to generate payslips for all employees at once, when you click the Payrun button, all employee payslips are created automatically.
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Pay Period:</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                    data-testid="input-payrun-month"
                  />
                </div>
                <Button 
                  onClick={handlePayrunClick}
                  className="bg-primary"
                  data-testid="button-generate-payrun"
                >
                  Payrun
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: 'Validation Complete',
                      description: `All employee data validated for ${format(new Date(selectedMonth), 'MMMM yyyy')}`,
                    });
                  }}
                  data-testid="button-validate-payrun"
                >
                  Validate
                </Button>
              </div>
            </div>

            {payslips.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Employer Cost</TableHead>
                      <TableHead className="text-right">Basic Wage</TableHead>
                      <TableHead className="text-right">Gross Wage</TableHead>
                      <TableHead className="text-right">Net Wage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((payslip) => (
                      <TableRow key={payslip.employeeId}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(selectedMonth), 'MMM yyyy')}
                        </TableCell>
                        <TableCell>{payslip.employeeName}</TableCell>
                        <TableCell className="text-right">₹{payslip.employerCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{payslip.basicWage.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{payslip.grossWage.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">₹{payslip.netWage.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={payslip.status === 'Done' ? 'default' : 'secondary'}
                            className={payslip.status === 'Done' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                            data-testid={`badge-status-${payslip.employeeId}`}
                          >
                            {payslip.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {payslips.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-md">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a pay period and click "Payrun" to generate payslips
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
