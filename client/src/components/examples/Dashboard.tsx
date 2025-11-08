import { AuthProvider } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function DashboardWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u1');
  }, []);

  return <Dashboard />;
}

export default function DashboardExample() {
  return (
    <AuthProvider>
      <DashboardWithAuth />
    </AuthProvider>
  );
}
