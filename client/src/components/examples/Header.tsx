import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function HeaderWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u1');
  }, []);

  return <Header />;
}

export default function HeaderExample() {
  return (
    <AuthProvider>
      <HeaderWithAuth />
    </AuthProvider>
  );
}
