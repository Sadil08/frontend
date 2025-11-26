import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'STUDENT' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== role) {
      router.push('/unauthorized');
    }
  }, [user, role, router]);

  if (!user || user.role !== role) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;