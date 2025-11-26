import { Button } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white flex justify-between items-center p-4">
      <div className="text-xl font-bold">EduApp</div>
      <nav className="flex space-x-4">
        <Link href="/" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>
        {user && (
          <>
            <Link href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">Dashboard</Link>
            <Link href="/progress" className="hover:bg-blue-700 px-3 py-2 rounded">Progress</Link>
            <Link href="/leaderboard" className="hover:bg-blue-700 px-3 py-2 rounded">Leaderboard</Link>
            <Link href="/cart" className="hover:bg-blue-700 px-3 py-2 rounded">Cart</Link>
            {user.role === 'ADMIN' && <Link href="/admin" className="hover:bg-blue-700 px-3 py-2 rounded">Admin</Link>}
            <Button onClick={logout} className="bg-red-500 hover:bg-red-600">Logout</Button>
          </>
        )}
        {!user && (
          <>
            <Link href="/login" className="hover:bg-blue-700 px-3 py-2 rounded">Login</Link>
            <Link href="/register" className="hover:bg-blue-700 px-3 py-2 rounded">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;