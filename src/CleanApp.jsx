import React, { useState } from 'react';
import CleanIndexPage from './components/CleanIndexPage';
import CleanRule2Page from './components/CleanRule2Page';

/**
 * 🎯 CLEAN APPLICATION DEMO
 * 
 * This is a demonstration of the clean Supabase-only architecture.
 * 
 * Features:
 * ✅ No localStorage dependencies
 * ✅ No fallback systems
 * ✅ Single source of truth (Supabase)
 * ✅ Proper ascending topic order (D-1, D-3, D-4, etc.)
 * ✅ Clean data flow
 * ✅ Real ABCD analysis
 */

const CleanApp = () => {
  const [currentPage, setCurrentPage] = useState('index');

  const renderPage = () => {
    switch (currentPage) {
      case 'index':
        return <CleanIndexPage />;
      case 'rule2':
        return <CleanRule2Page />;
      default:
        return <CleanIndexPage />;
    }
  };

  return (
    <div className="clean-app">
      {/* Navigation */}
      <nav className="clean-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>🎯 Clean Supabase App</h2>
            <span className="version-badge">v2.0 - Pure Supabase</span>
          </div>
          
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'index' ? 'active' : ''}`}
              onClick={() => setCurrentPage('index')}
            >
              📊 Data Upload
            </button>
            
            <button
              className={`nav-link ${currentPage === 'rule2' ? 'active' : ''}`}
              onClick={() => setCurrentPage('rule2')}
            >
              🧮 ABCD Analysis
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="page-content">
        {renderPage()}
      </main>

      {/* Architecture Info */}
      <div className="architecture-info">
        <h3>🏗️ Clean Architecture Benefits</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <h4>✅ Single Source of Truth</h4>
            <p>All data stored in Supabase only. No confusion between localStorage and cloud data.</p>
          </div>
          
          <div className="benefit-item">
            <h4>✅ No Fallback Complexity</h4>
            <p>No more "(Fallback)" data or hybrid systems. Clean, predictable data flow.</p>
          </div>
          
          <div className="benefit-item">
            <h4>✅ Proper Topic Order</h4>
            <p>Topics always displayed in ascending numerical order: D-1, D-3, D-4, D-5, etc.</p>
          </div>
          
          <div className="benefit-item">
            <h4>✅ Real-time Sync</h4>
            <p>All devices see the same data instantly. Perfect for multi-device usage.</p>
          </div>
          
          <div className="benefit-item">
            <h4>✅ Easy Migration</h4>
            <p>Ready for Firebase migration with same interface. Just swap the service.</p>
          </div>
          
          <div className="benefit-item">
            <h4>✅ Better Performance</h4>
            <p>No localStorage cleanup or sync issues. Direct database queries only.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .clean-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .clean-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }

        .nav-brand h2 {
          margin: 0;
          color: #1e293b;
          font-size: 24px;
        }

        .version-badge {
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 10px;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          background: none;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .nav-link.active {
          background: #3b82f6;
          color: white;
        }

        .page-content {
          min-height: calc(100vh - 70px);
          padding: 0;
        }

        .architecture-info {
          background: rgba(255, 255, 255, 0.95);
          margin: 40px auto;
          max-width: 1200px;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .architecture-info h3 {
          text-align: center;
          margin: 0 0 30px 0;
          color: #1e293b;
          font-size: 28px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .benefit-item {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .benefit-item h4 {
          margin: 0 0 10px 0;
          color: #059669;
          font-size: 16px;
        }

        .benefit-item p {
          margin: 0;
          color: #64748b;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            height: auto;
            padding: 15px 20px;
            gap: 15px;
          }

          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CleanApp;
