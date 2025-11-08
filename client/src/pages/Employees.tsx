import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Employees() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: '',
    mobile: '',
    company: 'WorkZen Technologies',
    manager: '',
    location: '',
    basicSalary: 50000,
    hra: 10000,
    otherEarnings: 2000
  });

  // Determine which endpoint to use based on role
  const isEmployee = currentUser?.role === 'employee';
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'hr';
  const canDelete = currentUser?.role === 'admin';

  // Fetch users based on role
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', isEmployee ? 'directory' : 'all'],
    queryFn: isEmployee ? api.getUserDirectory : api.getAllUsers
  });

  const filteredEmployees = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createUserMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Employee Added',
        description: 'Employee has been added successfully'
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'employee',
        department: '',
        mobile: '',
        company: 'WorkZen Technologies',
        manager: '',
        location: '',
        basicSalary: 50000,
        hra: 10000,
        otherEarnings: 2000
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Employee Deleted',
        description: 'Employee has been removed'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleDeleteEmployee = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const viewEmployee = (user: any) => {
    setSelectedEmployee(user);
    setIsViewDialogOpen(true);
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    hr: 'bg-blue-100 text-blue-700 border-blue-200',
    payroll: 'bg-teal-100 text-teal-700 border-teal-200',
    employee: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage employee information
          </p>
        </div>
        
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-employee">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter employee details to add to the directory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="hr">HR Officer</SelectItem>
                        <SelectItem value="payroll">Payroll Officer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                      data-testid="input-department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      data-testid="input-mobile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Manager name"
                      data-testid="input-manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      data-testid="input-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <Input
                      id="basicSalary"
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: parseInt(e.target.value) })}
                      required
                      data-testid="input-basic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA</Label>
                    <Input
                      id="hra"
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: parseInt(e.target.value) })}
                      required
                      data-testid="input-hra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherEarnings">Other Earnings</Label>
                    <Input
                      id="otherEarnings"
                      type="number"
                      value={formData.otherEarnings}
                      onChange={(e) => setFormData({ ...formData, otherEarnings: parseInt(e.target.value) })}
                      required
                      data-testid="input-other-earnings"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-employee">Add Employee</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-employees"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((user: any) => (
                <TableRow key={user.id} data-testid={`row-employee-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewEmployee(user)}
                        data-testid={`button-view-${user.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canDelete && user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEmployee(user.id)}
                          data-testid={`button-delete-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">
                    {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  <Badge className={roleColors[selectedEmployee.role]}>
                    {selectedEmployee.role.charAt(0).toUpperCase() + selectedEmployee.role.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-semibold">{selectedEmployee.department}</p>
                </Card>
                {!isEmployee && selectedEmployee.basicSalary !== undefined && (
                  <>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Basic Salary</p>
                      <p className="font-semibold">₹{selectedEmployee.basicSalary.toLocaleString()}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">HRA</p>
                      <p className="font-semibold">₹{selectedEmployee.hra.toLocaleString()}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Other Earnings</p>
                      <p className="font-semibold">₹{selectedEmployee.otherEarnings.toLocaleString()}</p>
                    </Card>
                  </>
                )}
                {!isEmployee && selectedEmployee.annualLeave !== undefined && (
                  <>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Annual Leave</p>
                      <p className="font-semibold">{selectedEmployee.annualLeave} days</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Sick Leave</p>
                      <p className="font-semibold">{selectedEmployee.sickLeave} days</p>
                    </Card>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
