import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Check, X, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Leave() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({
    type: 'Annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [allocateData, setAllocateData] = useState({
    annualLeave: 0,
    sickLeave: 0
  });

  const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'payroll';
  const canAllocate = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  // Fetch leaves
  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: api.getLeaves
  });

  // Fetch users (for HR/Admin to see employee names and manage leaves)
  const { data: users = [] } = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: canAllocate ? api.getUserDirectory : async () => [],
    enabled: canAllocate
  });

  // Apply leave mutation
  const applyLeaveMutation = useMutation({
    mutationFn: api.applyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast({
        title: 'Leave Application Submitted',
        description: 'Your leave request is pending approval'
      });
      setOpen(false);
      setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update leave status mutation
  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.updateLeaveStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast({
        title: variables.status === 'Approved' ? 'Leave Approved' : 'Leave Rejected',
        description: `Leave request has been ${variables.status.toLowerCase()}`
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

  // Allocate leaves mutation (for HR)
  const allocateLeavesMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.updateUserLeaves(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Leaves Allocated',
        description: 'Leave balance has been updated successfully'
      });
      setAllocateDialogOpen(false);
      setAllocateData({ annualLeave: 0, sickLeave: 0 });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyLeaveMutation.mutate(formData);
  };

  const handleApprove = (leaveId: string) => {
    updateLeaveStatusMutation.mutate({ id: leaveId, status: 'Approved' });
  };

  const handleReject = (leaveId: string) => {
    updateLeaveStatusMutation.mutate({ id: leaveId, status: 'Rejected' });
  };

  const handleAllocateLeaves = (e: React.FormEvent) => {
    e.preventDefault();
    allocateLeavesMutation.mutate({ userId: selectedUserId, data: allocateData });
  };

  const openAllocateDialog = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (user) {
      setSelectedUserId(userId);
      setAllocateData({
        annualLeave: user.annualLeave || 0,
        sickLeave: user.sickLeave || 0
      });
      setAllocateDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Approved: 'bg-green-100 text-green-700 border-green-200',
      Rejected: 'bg-red-100 text-red-700 border-red-200',
      Cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user?.name || 'Unknown';
  };

  const pendingLeaves = leaves.filter((l: any) => 
    l.userId === currentUser?.id && l.status === 'Pending'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
          <p className="text-muted-foreground">
            Apply for leave and track requests
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-apply-leave">
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>
                Submit a leave request for approval
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Leave Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger data-testid="select-leave-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual Leave</SelectItem>
                      <SelectItem value="Sick">Sick Leave</SelectItem>
                      <SelectItem value="Casual">Casual Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    data-testid="input-end-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    data-testid="input-reason"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="button-submit-leave">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {currentUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Annual Leave</p>
            <p className="text-2xl font-bold">{currentUser.annualLeave} days</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Sick Leave</p>
            <p className="text-2xl font-bold">{currentUser.sickLeave} days</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
            <p className="text-2xl font-bold">{pendingLeaves}</p>
          </Card>
        </div>
      )}

      {canAllocate && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Manage Employee Leave Balances</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Annual Leave</TableHead>
                <TableHead>Sick Leave</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.annualLeave || 0} days</TableCell>
                    <TableCell>{user.sickLeave || 0} days</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAllocateDialog(user.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Allocate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>
        <Table>
          <TableHeader>
            <TableRow>
              {currentUser?.role !== 'employee' && <TableHead>Employee</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              {canApprove && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canApprove ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No leave requests yet
                </TableCell>
              </TableRow>
            ) : (
              leaves.slice().reverse().map((leave: any) => (
                <TableRow key={leave.id}>
                  {currentUser?.role !== 'employee' && <TableCell>{getUserName(leave.userId)}</TableCell>}
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status}
                    </Badge>
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(leave.id)}
                            data-testid={`button-approve-${leave.id}`}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(leave.id)}
                            data-testid={`button-reject-${leave.id}`}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Leave Balance</DialogTitle>
            <DialogDescription>
              Update employee leave balance
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateLeaves}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="annualLeave">Annual Leave (days)</Label>
                <Input
                  id="annualLeave"
                  type="number"
                  value={allocateData.annualLeave}
                  onChange={(e) => setAllocateData({ ...allocateData, annualLeave: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sickLeave">Sick Leave (days)</Label>
                <Input
                  id="sickLeave"
                  type="number"
                  value={allocateData.sickLeave}
                  onChange={(e) => setAllocateData({ ...allocateData, sickLeave: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Balance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
