import { AuthProvider } from '@/contexts/AuthContext';
import Employees from '@/pages/Employees';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function EmployeesWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u1');
  }, []);

  return <Employees />;
}

export default function EmployeesExample() {
  return (
    <AuthProvider>
      <EmployeesWithAuth />
    </AuthProvider>
  );
}
