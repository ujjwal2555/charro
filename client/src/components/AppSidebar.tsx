import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  UserCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const [location] = useLocation();
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const allMenuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'payroll', 'employee'] },
    { title: 'Attendance', url: '/attendance', icon: Clock, roles: ['admin', 'hr', 'payroll', 'employee'] },
    { title: 'Leave', url: '/leave', icon: Calendar, roles: ['admin', 'hr', 'payroll', 'employee'] },
    { title: 'Employees', url: '/employees', icon: Users, roles: ['admin', 'hr', 'employee'] },
    { title: 'Payroll', url: '/payroll', icon: Wallet, roles: ['admin', 'payroll'] },
    { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['admin', 'hr', 'payroll'] },
    { title: 'Profile', url: '/profile', icon: UserCircle, roles: ['admin', 'hr', 'payroll', 'employee'] },
    { title: 'Settings', url: '/settings', icon: Settings, roles: ['admin'] },
    { title: 'Help', url: '/help', icon: HelpCircle, roles: ['admin', 'hr', 'payroll', 'employee'] }
  ];

  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(currentUser.role)
  );

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    hr: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    payroll: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
    employee: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2" data-testid="sidebar-user-info">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {currentUser.name}
            </p>
            <Badge 
              className={`${roleColors[currentUser.role]} text-xs mt-1`}
              data-testid="badge-user-role"
            >
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
