import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';

export default function LoginExample() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
