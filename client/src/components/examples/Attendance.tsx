import { AuthProvider } from '@/contexts/AuthContext';
import Attendance from '@/pages/Attendance';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function AttendanceWithAuth() {
  const { login } = useAuth();
  
  useEffect(() => {
    login('u4');
  }, []);

  return <Attendance />;
}

export default function AttendanceExample() {
  return (
    <AuthProvider>
      <AttendanceWithAuth />
    </AuthProvider>
  );
}
