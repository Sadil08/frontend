'use client';

import { useState } from 'react';
import { Button, Dropdown, MenuProps, Avatar, Drawer } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { UserOutlined, LogoutOutlined, DashboardOutlined, ShoppingCartOutlined, TrophyOutlined, BarChartOutlined, MenuOutlined } from '@ant-design/icons';
import { Badge } from 'antd';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: <Link href="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    // WALLET_DISABLED: My Wallet menu item hidden
    // {
    //   key: 'wallet',
    //   label: <Link href="/wallet">My Wallet</Link>,
    //   icon: <BarChartOutlined />,
    // },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const isActive = (path: string) => pathname === path ? 'text-primary-600 font-semibold' : 'text-secondary-600 hover:text-primary-600';

  // Mobile menu content
  const mobileMenuContent = (
    <div className="flex flex-col space-y-4 pt-4">
      <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/')} text-lg`}>Home</Link>
      {user && user.role === 'STUDENT' && (
        <>
          <Link href="/bundles" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/bundles')} text-lg`}>Bundles</Link>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/dashboard')} text-lg`}>Dashboard</Link>
          {/* WALLET_DISABLED: Wallet nav link hidden */}
          {/* <Link href="/wallet" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/wallet')} text-lg`}>Wallet</Link> */}
          <Link href="/feedback" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/feedback')} text-lg`}>Feedback</Link>
        </>
      )}
      {user && user.role === 'ADMIN' && (
        <>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/admin')} text-lg`}>Admin Panel</Link>
          <Link href="/admin/analytics" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/admin/analytics')} text-lg`}>Analytics</Link>
          <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/admin/settings')} text-lg`}>Settings</Link>
          <Link href="/admin/feedback" onClick={() => setMobileMenuOpen(false)} className={`${isActive('/admin/feedback')} text-lg`}>Reviews & Improvements</Link>
        </>
      )}
      {!user && (
        <div className="flex flex-col space-y-3 mt-4">
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button block size="large">Log in</Button>
          </Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
            <Button type="primary" block size="large">Sign up</Button>
          </Link>
        </div>
      )}
    </div>
  );

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
                {/* WALLET_DISABLED: Wallet nav link hidden */}
                {/* <Link href="/wallet" className={`${isActive('/wallet')} transition-colors duration-200`}>Wallet</Link> */}
                <Link href="/feedback" className={`${isActive('/feedback')} transition-colors duration-200`}>Feedback</Link>
              </>
            )}
            {user && user.role === 'ADMIN' && (
              <>
                <Link href="/admin" className={`${isActive('/admin')} transition-colors duration-200`}>Admin Panel</Link>
                <Link href="/admin/analytics" className={`${isActive('/admin/analytics')} transition-colors duration-200`}>Analytics</Link>
                <Link href="/admin/settings" className={`${isActive('/admin/settings')} transition-colors duration-200`}>Settings</Link>
                <Link href="/admin/feedback" className={`${isActive('/admin/feedback')} transition-colors duration-200`}>Reviews & Improvements</Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'STUDENT' && (
                  <Link href="/cart" className="text-secondary-500 hover:text-primary-600 transition-colors relative mr-4">
                    <Badge count={cartCount} size="small" offset={[0, 0]}>
                      <ShoppingCartOutlined style={{ fontSize: '20px' }} />
                    </Badge>
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
              <div className="hidden md:flex items-center space-x-3">
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setMobileMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        {mobileMenuContent}
      </Drawer>
    </header>
  );
};

export default Header;