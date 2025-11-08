import { AuthProvider } from '@/contexts/AuthContext';
import Settings from '@/pages/Settings';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function SettingsWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u1');
  }, []);

  return <Settings />;
}

export default function SettingsExample() {
  return (
    <AuthProvider>
      <SettingsWithAuth />
    </AuthProvider>
  );
}
