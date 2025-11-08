import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock, LogIn, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, type Attendance as AttendanceType } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

export default function Attendance() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: userAttendance = [] } = useQuery<AttendanceType[]>({
    queryKey: ['/api/attendance'],
    enabled: !!currentUser,
  });

  const todayAttendance = userAttendance.find(
    (a: AttendanceType) => a.date === format(new Date(), 'yyyy-MM-dd')
  );

  const clockInMutation = useMutation({
    mutationFn: () => api.clockIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      toast({
        title: 'Clocked In',
        description: 'Attendance marked successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Clock In Failed',
        description: error.message || 'Failed to clock in',
        variant: 'destructive',
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.clockOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      toast({
        title: 'Clocked Out',
        description: 'Clock out recorded successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Clock Out Failed',
        description: error.message || 'Failed to clock out',
        variant: 'destructive',
      });
    },
  });

  const handleClockIn = () => {
    clockInMutation.mutate();
  };

  const handleClockOut = () => {
    clockOutMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Present: 'bg-green-100 text-green-700 border-green-200',
      Absent: 'bg-red-100 text-red-700 border-red-200',
      Half: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Leave: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Attendance</h1>
        <p className="text-muted-foreground">
          Manage your daily attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Clock In/Out
          </h2>

          {todayAttendance ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Clock In Time</p>
                  <p className="text-2xl font-bold">{todayAttendance.inTime}</p>
                </div>
                {todayAttendance.outTime && (
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Clock Out Time</p>
                    <p className="text-2xl font-bold">{todayAttendance.outTime}</p>
                  </div>
                )}
              </div>

              {!todayAttendance.outTime && (
                <Button
                  onClick={handleClockOut}
                  className="w-full"
                  data-testid="button-clock-out"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              )}

              {todayAttendance.outTime && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Attendance Marked for Today
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't clocked in today</p>
              <Button onClick={handleClockIn} data-testid="button-clock-in">
                <LogIn className="w-4 h-4 mr-2" />
                Clock In Now
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar
          </h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No attendance records yet
                </TableCell>
              </TableRow>
            ) : (
              userAttendance.slice().reverse().map((record: AttendanceType) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{record.inTime}</TableCell>
                  <TableCell>{record.outTime || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
