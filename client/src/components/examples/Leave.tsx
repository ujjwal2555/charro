import { AuthProvider } from '@/contexts/AuthContext';
import Leave from '@/pages/Leave';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function LeaveWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u4');
  }, []);

  return <Leave />;
}

export default function LeaveExample() {
  return (
    <AuthProvider>
      <LeaveWithAuth />
    </AuthProvider>
  );
}
