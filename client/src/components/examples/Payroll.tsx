import { AuthProvider } from '@/contexts/AuthContext';
import Payroll from '@/pages/Payroll';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function PayrollWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u3');
  }, []);

  return <Payroll />;
}

export default function PayrollExample() {
  return (
    <AuthProvider>
      <PayrollWithAuth />
    </AuthProvider>
  );
}
