import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'STUDENT' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute - User:', user, 'Role:', role, 'isLoading:', isLoading); // Debug logging

    // If user is still null, we're still loading
    if (user === null) {
      console.log('ProtectedRoute - Still loading user from localStorage'); // Debug logging
      setIsLoading(true);
      return;
    }

    // User has been loaded from localStorage
    setIsLoading(false);

    if (!user) {
      console.log('ProtectedRoute - No user found, redirecting to login'); // Debug logging
      router.push('/login');
    } else if (user.role !== role) {
      console.log('ProtectedRoute - Wrong role, redirecting to unauthorized'); // Debug logging
      router.push('/unauthorized');
    }
  }, [user, role, router]);

  // Show loading while AuthContext is initializing
  if (isLoading || !user || user.role !== role) {
    console.log('ProtectedRoute - Rendering loading state (isLoading:', isLoading, 'user:', !!user, 'role match:', user?.role === role, ')'); // Debug logging
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - Rendering children'); // Debug logging
  return <>{children}</>;
};

export default ProtectedRoute;