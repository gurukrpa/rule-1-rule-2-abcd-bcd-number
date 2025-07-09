import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';

const Header = ({ title, showBackButton = false, pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    // Clear authentication session
    localStorage.removeItem('house_count_session');
    localStorage.removeItem('house_count_enabled');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_type');
    
    // Redirect to login
    navigate('/auth');
  };

  // Create friendly page names based on the current path
  const getPageName = () => {
    const path = location.pathname;
    if (path === '/' || path === '/users') return 'User Management';
    if (path.includes('/user-data/')) return 'House Count Data';
    if (path.includes('/abcd-number/')) return 'ABCD Number Analysis';
    if (path.includes('/day-details/')) return 'Day Details';
    if (path === '/number-gen') return 'Number Generator';
    if (path.includes('/planets-analysis/')) return 'Planets Analysis';
    if (path.includes('/rule1/')) return 'Rule 1 Analysis';
    if (path.includes('/rule2/')) return 'Rule 2 Analysis';
    if (path.includes('/index-page/')) return 'Index Matrix';
    return pageTitle || title || 'Unknown Page';
  };

  useEffect(() => {
    document.title = getPageName() + ' | viboothi.in';
  }, [location.pathname, pageTitle, title]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleGoHome}
          >
            <Logo size="medium" showText={true} pageTitle={getPageName()} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/users" className="text-indigo-600 hover:text-indigo-900 font-medium">
              Users
            </Link>
            <Link to="/number-gen" className="text-gray-700 hover:text-gray-900">
              Number Generator
            </Link>
          </nav>

          {/* Title Section */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>
          )}

          {/* Navigation Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            
            {/* Current page indicator with breadcrumb style */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-600 font-medium">{getPageName()}</span>
              <span className="text-gray-400 text-xs">({location.pathname})</span>
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, gurukrpasharma</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
