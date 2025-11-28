import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { name: 'Documents', path: '/documents', icon: '📄' },
    { name: 'Hierarchy', path: '/hierarchy', icon: '🏢', requiresAuth: true },
    { name: 'HR Management', path: '/hr', icon: '👔', hasDropdown: true },
  ];

  const hrMenuItems = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: '📊' },
    { name: 'Employees', path: '/hr/employees', icon: '👥' },
    { name: 'Leaves', path: '/hr/leaves', icon: '📅' },
    { name: 'Attendance', path: '/hr/attendance', icon: '⏰' },
    { name: 'Payroll', path: '/hr/payroll', icon: '💰' },
  ];

  const documentItems = [
    { name: 'Offer Letter', path: '/offer-letter', icon: '📝' },
    { name: 'Appointment Letter', path: '/appointment-letter', icon: '📋' },
    { name: 'Increment Letter', path: '/increment-letter', icon: '📈' },
    { name: 'Relieving Letter', path: '/relieving-letter', icon: '👋' },
    { name: 'Termination Letter', path: '/termination-letter', icon: '⚠️' },
    { name: 'Salary Slip', path: '/salary-slip', icon: '💰' },
  ];

  const isActive = (path) => {
    if (path === '/documents') {
      return documentItems.some(item => location.pathname === item.path);
    }
    if (path === '/hr') {
      return hrMenuItems.some(item => location.pathname === item.path);
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              GrandHR
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              if (item.path === '/documents') {
                return (
                  <div key={item.path} className="relative group">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon} {item.name}
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {documentItems.map((docItem) => (
                          <Link
                            key={docItem.path}
                            to={docItem.path}
                            className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors ${
                              location.pathname === docItem.path ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                            }`}
                          >
                            <span className="text-xl">{docItem.icon}</span>
                            <span className="text-gray-700 font-medium">{docItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              
              if (item.hasDropdown && item.path === '/hr') {
                return (
                  <div key={item.path} className="relative group">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        hrMenuItems.some(hrItem => location.pathname === hrItem.path)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon} {item.name}
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {hrMenuItems.map((hrItem) => (
                          <Link
                            key={hrItem.path}
                            to={hrItem.path}
                            className={`flex items-center space-x-3 px-4 py-3 hover:bg-primary-50 transition-colors ${
                              location.pathname === hrItem.path ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                            }`}
                          >
                            <span className="text-xl">{hrItem.icon}</span>
                            <span className="text-gray-700 font-medium">{hrItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {menuItems.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                
                if (item.path === '/documents') {
                  return (
                    <div key={item.path} className="space-y-1">
                      <div className="px-4 py-2 font-medium text-gray-700">
                        {item.icon} {item.name}
                      </div>
                      {documentItems.map((docItem) => (
                        <Link
                          key={docItem.path}
                          to={docItem.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-8 py-2 hover:bg-primary-50 transition-colors ${
                            location.pathname === docItem.path ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                          }`}
                        >
                          <span className="text-xl">{docItem.icon}</span>
                          <span className="text-gray-700">{docItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  );
                }
                
                if (item.hasDropdown && item.path === '/hr') {
                  return (
                    <div key={item.path} className="space-y-1">
                      <div className="px-4 py-2 font-medium text-gray-700">
                        {item.icon} {item.name}
                      </div>
                      {hrMenuItems.map((hrItem) => (
                        <Link
                          key={hrItem.path}
                          to={hrItem.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-8 py-2 hover:bg-primary-50 transition-colors ${
                            location.pathname === hrItem.path ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                          }`}
                        >
                          <span className="text-xl">{hrItem.icon}</span>
                          <span className="text-gray-700">{hrItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">{user?.email}</div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-2"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

