import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.includes(path);

  const brandNavItems = [
    { label: 'Dashboard', path: '/brand/dashboard', icon: 'DB' },
    { label: 'Campaigns', path: '/brand/campaigns', icon: 'CP' },
    { label: 'Recommendations', path: '/brand/recommendations', icon: 'RC' },
    { label: 'Messages', path: '/messaging', icon: 'MS' },
    { label: 'Profile', path: '/brand/profile', icon: 'PF' },
  ];

  const influencerNavItems = [
    { label: 'Dashboard', path: '/influencer/dashboard', icon: 'DB' },
    { label: 'Campaigns', path: '/influencer/campaigns', icon: 'CP' },
    { label: 'Messages', path: '/messaging', icon: 'MS' },
    { label: 'Profile', path: '/influencer/profile', icon: 'PF' },
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'AD' },
  ];

  const getNavItems = () => {
    if (user?.role === 'BRAND') return brandNavItems;
    if (user?.role === 'INFLUENCER') return influencerNavItems;
    if (user?.role === 'ADMIN') return adminNavItems;
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-white dark:bg-ramp-black flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-ramp-gray-900 border-b border-ramp-gray-200 dark:border-ramp-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/brand/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ramp-purple-600 to-ramp-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">IH</span>
            </div>
            <span className="font-bold text-xl text-ramp-black dark:text-white hidden sm:inline">InfluencerHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-ramp-purple-100 dark:bg-ramp-purple-900 text-ramp-purple-700 dark:text-ramp-purple-300'
                    : 'text-ramp-gray-700 dark:text-ramp-gray-400 hover:bg-ramp-gray-100 dark:hover:bg-ramp-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-ramp-gray-700 dark:text-ramp-gray-300 font-medium">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-ramp-red-600 hover:bg-ramp-red-50 dark:hover:bg-ramp-red-900 dark:hover:text-ramp-red-300 rounded-md transition-colors duration-200"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-ramp-gray-100 dark:hover:bg-ramp-gray-800 rounded-md transition-colors"
            >
              <span className="text-xs font-semibold text-ramp-gray-700 dark:text-ramp-gray-300">
                {isMobileMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-ramp-gray-200 dark:border-ramp-gray-800 bg-ramp-gray-50 dark:bg-ramp-gray-900">
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-ramp-purple-100 dark:bg-ramp-purple-900 text-ramp-purple-700 dark:text-ramp-purple-300'
                      : 'text-ramp-gray-700 dark:text-ramp-gray-400 hover:bg-ramp-gray-100 dark:hover:bg-ramp-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-ramp-gray-200 dark:border-ramp-gray-800 bg-ramp-gray-50 dark:bg-ramp-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-ramp-gray-600 dark:text-ramp-gray-400 text-sm">
            © 2026 InfluencerHub. Connecting brands with creators.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
