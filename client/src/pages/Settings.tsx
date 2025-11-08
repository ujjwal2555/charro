import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@shared/schema';

export default function Settings() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [pfPercent, setPfPercent] = useState('12');
  const [professionalTax, setProfessionalTax] = useState('200');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState({
    employees: 'none',
    attendance: 'none',
    timeOff: 'none',
    payroll: 'none',
    reports: 'none',
    settings: 'none',
  });

  // Only admin can access Settings
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-muted-foreground">You do not have permission to access settings.</p>
        </Card>
      </div>
    );
  }

  // Fetch all users for permissions management
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch current user's permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['/api/users', selectedUser?.id, 'permissions'],
    enabled: !!selectedUser,
  });

  useEffect(() => {
    if (permissionsData) {
      setPermissions({
        employees: (permissionsData as any).employees || 'none',
        attendance: (permissionsData as any).attendance || 'none',
        timeOff: (permissionsData as any).timeOff || 'none',
        payroll: (permissionsData as any).payroll || 'none',
        reports: (permissionsData as any).reports || 'none',
        settings: (permissionsData as any).settings || 'none',
      });
    } else if (selectedUser) {
      setPermissions({
        employees: 'none',
        attendance: 'none',
        timeOff: 'none',
        payroll: 'none',
        reports: 'none',
        settings: 'none',
      });
    }
  }, [permissionsData, selectedUser]);

  const updatePermissionsMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('POST', `/api/users/${selectedUser?.id}/permissions`, data),
    onSuccess: () => {
      toast({
        title: 'Permissions Updated',
        description: 'User access rights have been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', selectedUser?.id, 'permissions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update permissions',
        variant: 'destructive',
      });
    },
  });

  const handleSavePermissions = () => {
    if (!selectedUser) {
      toast({
        title: 'No User Selected',
        description: 'Please select a user to update permissions',
        variant: 'destructive',
      });
      return;
    }
    updatePermissionsMutation.mutate(permissions);
  };

  const permissionOptions = [
    { value: 'none', label: 'No Access' },
    { value: 'view', label: 'View Only' },
    { value: 'edit', label: 'Full Access' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and user access rights
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          User Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          In the Admin Settings, the administrator can assign user access rights based on each user's role and responsibilities. These access rights define what each user is permitted to do from accessing.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select
                value={selectedUser?.id || ''}
                onValueChange={(value) => {
                  const user = users?.find((u) => u.id === value);
                  setSelectedUser(user || null);
                }}
              >
                <SelectTrigger id="user-select" data-testid="select-user">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id} data-testid={`option-user-${user.id}`}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Login ID</Label>
              <Input
                value={selectedUser?.loginId || ''}
                disabled
                className="bg-muted"
                data-testid="input-login-id"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={selectedUser?.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : ''}
                disabled
                className="bg-muted capitalize"
                data-testid="input-role"
              />
            </div>
          </div>

          {selectedUser && (
            <>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Select user access rights as per their role and responsibilities. These access rights define what each user is permitted to do and restricted from accessing.
                </p>
                <p className="text-sm font-medium mb-2">
                  Employee / Admin / HR Officer / Payroll Officer
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 bg-accent font-semibold">Module</th>
                      <th className="text-left p-3 bg-accent font-semibold">Access Rights</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Employees</td>
                      <td className="p-3">
                        <Select
                          value={permissions.employees}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, employees: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-employees">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Attendance</td>
                      <td className="p-3">
                        <Select
                          value={permissions.attendance}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, attendance: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-attendance">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Time Off</td>
                      <td className="p-3">
                        <Select
                          value={permissions.timeOff}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, timeOff: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-timeoff">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Payroll</td>
                      <td className="p-3">
                        <Select
                          value={permissions.payroll}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, payroll: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-payroll">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Reports</td>
                      <td className="p-3">
                        <Select
                          value={permissions.reports}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, reports: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-reports">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Settings</td>
                      <td className="p-3">
                        <Select
                          value={permissions.settings}
                          onValueChange={(value) =>
                            setPermissions({ ...permissions, settings: value })
                          }
                        >
                          <SelectTrigger className="w-[200px]" data-testid="select-permission-settings">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Button 
                onClick={handleSavePermissions} 
                className="mt-4"
                data-testid="button-save-permissions"
                disabled={updatePermissionsMutation.isPending}
              >
                {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
