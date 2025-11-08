import { AuthProvider } from '@/contexts/AuthContext';
import Profile from '@/pages/Profile';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function ProfileWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u4');
  }, []);

  return <Profile />;
}

export default function ProfileExample() {
  return (
    <AuthProvider>
      <ProfileWithAuth />
    </AuthProvider>
  );
}
