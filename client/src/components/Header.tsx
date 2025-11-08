import { LogOut, User, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export function Header() {
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [checkedIn, setCheckedIn] = useState(false);

  const { data: todayAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const attendance = await apiRequest<any[]>('GET', '/api/attendance');
      return attendance.find((a: any) => a.userId === currentUser?.id && a.date === today);
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setCheckedIn(!!todayAttendance);
  }, [todayAttendance]);

  const checkInMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/attendance/clock-in'),
    onSuccess: () => {
      setCheckedIn(true);
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      toast({
        title: 'Checked In',
        description: 'You have successfully checked in for today',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Check-in Failed',
        description: error.message || 'Failed to check in',
        variant: 'destructive',
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleProfile = () => {
    setLocation('/profile');
  };

  const handleCheckIn = () => {
    if (!checkedIn) {
      checkInMutation.mutate();
    }
  };

  if (!currentUser) return null;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="gap-2 hover-elevate relative" 
              data-testid="button-user-menu"
            >
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                    checkedIn ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={checkedIn ? 'Checked In' : 'Not Checked In'}
                />
              </div>
              <span className="hidden sm:inline" data-testid="text-current-user-name">
                {currentUser.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium" data-testid="text-dropdown-user-name">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-dropdown-user-role">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-dropdown-user-email">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${checkedIn ? 'bg-green-500' : 'bg-red-500'}`} />
                  <p className="text-xs text-muted-foreground">
                    {checkedIn ? 'Checked In' : 'Not Checked In'}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile} data-testid="button-profile">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            {!checkedIn && (
              <DropdownMenuItem onClick={handleCheckIn} data-testid="button-check-in">
                <Clock className="w-4 h-4 mr-2" />
                Check In
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
