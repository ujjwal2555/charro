import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, Lock } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@workzen.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      setLocation('/dashboard');
    }
  }, [currentUser, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@workzen.com', password: 'admin123' },
      hr: { email: 'hr@workzen.com', password: 'hr123' },
      payroll: { email: 'payroll@workzen.com', password: 'payroll123' },
      employee: { email: 'john@workzen.com', password: 'employee123' },
    };
    const cred = credentials[role];
    setEmail(cred.email);
    setPassword(cred.password);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">WorkZen HRMS</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
            <Lock className="w-4 h-4 mr-2" />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground text-center mb-3">Quick Login</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('admin')}
              data-testid="button-quick-admin"
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('hr')}
              data-testid="button-quick-hr"
            >
              HR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('payroll')}
              data-testid="button-quick-payroll"
            >
              Payroll
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('employee')}
              data-testid="button-quick-employee"
            >
              Employee
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Demo Application - All data is stored in PostgreSQL database
        </p>
      </Card>
    </div>
  );
}
