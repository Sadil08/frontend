'use client';

import { Button, Dropdown, MenuProps, Avatar } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { UserOutlined, LogoutOutlined, DashboardOutlined, ShoppingCartOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: <Link href="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const isActive = (path: string) => pathname === path ? 'text-primary-600 font-semibold' : 'text-secondary-600 hover:text-primary-600';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600 tracking-tight">
              EduApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`${isActive('/')} transition-colors duration-200`}>Home</Link>
            {user && user.role === 'STUDENT' && (
              <>
                <Link href="/bundles" className={`${isActive('/bundles')} transition-colors duration-200`}>Bundles</Link>
                <Link href="/dashboard" className={`${isActive('/dashboard')} transition-colors duration-200`}>Dashboard</Link>
              </>
            )}
            {user && user.role === 'ADMIN' && (
              <>
                <Link href="/admin" className={`${isActive('/admin')} transition-colors duration-200`}>Admin Panel</Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'STUDENT' && (
                  <Link href="/cart" className="text-secondary-500 hover:text-primary-600 transition-colors relative">
                    <ShoppingCartOutlined style={{ fontSize: '20px' }} />
                  </Link>
                )}
                <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                  <div className="flex items-center space-x-2 cursor-pointer hover:bg-secondary-50 p-2 rounded-lg transition-colors">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-primary-100 text-primary-600" />
                    <span className="text-sm font-medium text-secondary-700 hidden sm:block">{user.email}</span>
                  </div>
                </Dropdown>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button type="text" className="text-secondary-600 hover:text-primary-600 font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button type="primary" className="bg-primary-600 hover:bg-primary-700 border-none font-medium shadow-sm hover:shadow-md transition-all">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;