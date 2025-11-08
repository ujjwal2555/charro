import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Phone, Building2, MapPin, User, Briefcase, Calendar, Lock, DollarSign, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function EmployeeProfile() {
  const [, params] = useRoute('/employees/:id');
  const employeeId = params?.id;

  const { data: employee, isLoading } = useQuery({
    queryKey: ['/api/users', employeeId],
    queryFn: async () => {
      const users = await apiRequest('GET', '/api/users');
      return users.find((u: any) => u.id === employeeId);
    },
    enabled: !!employeeId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Employee not found</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const initials = employee.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Employee Profile</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="w-32 h-32 text-4xl">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge className="mt-4 capitalize" data-testid="badge-role">
              {employee.role}
            </Badge>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-employee-name">
                <User className="w-4 h-4 text-muted-foreground" />
                {employee.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Login ID</p>
              <p className="font-semibold font-mono text-sm" data-testid="text-login-id">
                {employee.loginId}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-email">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {employee.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Mobile</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-mobile">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {employee.mobile || 'Not provided'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Company</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-company">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {employee.company || 'Organization Inc'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Department</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-department">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                {employee.department}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Manager</p>
              <p className="font-semibold" data-testid="text-manager">
                {employee.manager || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-semibold flex items-center gap-2" data-testid="text-location">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {employee.location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume" data-testid="tab-resume">
            <FileText className="w-4 h-4 mr-2" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="private" data-testid="tab-private">
            <User className="w-4 h-4 mr-2" />
            Private Info
          </TabsTrigger>
          <TabsTrigger value="salary" data-testid="tab-salary">
            <DollarSign className="w-4 h-4 mr-2" />
            Salary Info
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Year of Joining</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {employee.yearOfJoining}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="font-semibold capitalize">{employee.role}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Department</p>
                <p className="font-semibold">{employee.department}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Leave Balance</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1 p-3 bg-accent rounded-md">
                    <p className="text-xs text-muted-foreground">Annual Leave</p>
                    <p className="text-xl font-bold">{employee.annualLeave} days</p>
                  </div>
                  <div className="flex-1 p-3 bg-accent rounded-md">
                    <p className="text-xs text-muted-foreground">Sick Leave</p>
                    <p className="text-xl font-bold">{employee.sickLeave} days</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-semibold">{employee.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-semibold">{employee.email}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mobile Number</p>
                <p className="font-semibold">{employee.mobile || 'Not provided'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold">{employee.location || 'Not specified'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-semibold">{employee.dateOfBirth || 'Not provided'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-semibold">{employee.address || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Salary Breakdown</h3>
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Basic Salary</p>
                <p className="text-2xl font-bold">₹{employee.basicSalary.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-accent rounded-md">
                <p className="text-sm text-muted-foreground mb-1">HRA (House Rent Allowance)</p>
                <p className="text-2xl font-bold">₹{employee.hra.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-accent rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Other Earnings</p>
                <p className="text-2xl font-bold">₹{employee.otherEarnings.toLocaleString()}</p>
              </div>
              <Separator className="my-4" />
              <div className="p-4 bg-primary/10 rounded-md border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Gross Salary</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{(employee.basicSalary + employee.hra + employee.otherEarnings).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per Month</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security & Access</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Login ID</p>
                <p className="font-semibold font-mono bg-accent px-3 py-2 rounded-md inline-block">
                  {employee.loginId}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <Badge className="capitalize">{employee.role}</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Password Change</p>
                <p className="font-semibold">{employee.lastPasswordChange || 'Never'}</p>
              </div>
              <Separator />
              <div className="mt-6">
                <Button variant="outline" data-testid="button-reset-password">
                  Reset Password
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
