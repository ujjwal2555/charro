import { AuthProvider } from '@/contexts/AuthContext';
import Reports from '@/pages/Reports';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function ReportsWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u1');
  }, []);

  return <Reports />;
}

export default function ReportsExample() {
  return (
    <AuthProvider>
      <ReportsWithAuth />
    </AuthProvider>
  );
}
