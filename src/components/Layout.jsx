import React from 'react';
import Header from './Header';

const Layout = ({ children, title, showBackButton = false }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} showBackButton={showBackButton} />
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
