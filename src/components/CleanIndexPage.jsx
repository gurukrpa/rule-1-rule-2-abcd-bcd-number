import React, { useState, useEffect } from 'react';
import CleanSupabaseService from '../services/CleanSupabaseService';
import './IndexPage.css';

/**
 * 🎯 CLEAN INDEX PAGE - Supabase Only
 * 
 * Features:
 * ✅ No localStorage
 * ✅ No fallback systems  
 * ✅ Single source of truth (Supabase)
 * ✅ Proper error handling
 * ✅ Clean data flow
 */

const CleanIndexPage = () => {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [excelData, setExcelData] = useState(null);
  const [hourEntry, setHourEntry] = useState(null);
  const [userDates, setUserDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize service
  const [dataService] = useState(new CleanSupabaseService());

  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Load data when user or date changes
  useEffect(() => {
    if (currentUser && selectedDate) {
      loadDataForDate(selectedDate);
    }
  }, [currentUser, selectedDate]);

  /**
   * Initialize or create user
   */
  const initializeUser = async () => {
    try {
      setLoading(true);
      
      // For demo: Create a test user or use existing
      const userData = {
        username: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
        hr: 1
      };

      const user = await dataService.createUser(userData);
      setCurrentUser(user);
      
      // Load user's existing dates
      const dates = await dataService.getUserDates(user.id);
      setUserDates(dates);
      
      console.log('🎯 Clean user initialized:', user);
    } catch (error) {
      console.error('❌ User initialization failed:', error);
      setError('Failed to initialize user');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load data for specific date
   */
  const loadDataForDate = async (date) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Load Excel data
      const excel = await dataService.getExcelData(currentUser.id, date);
      setExcelData(excel);

      // Load hour entries
      const hours = await dataService.getHourEntry(currentUser.id, date);
      setHourEntry(hours);

      console.log('📊 Data loaded for date:', date, { excel, hours });
    } catch (error) {
      console.error('❌ Data loading failed:', error);
      setError(`Failed to load data for ${date}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Excel file upload
   */
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Parse Excel file (simplified for demo)
      const mockExcelData = {
        fileName: file.name,
        sets: generateMock30Topics() // Mock data for demo
      };

      // Save to Supabase
      await dataService.saveExcelData(currentUser.id, selectedDate, mockExcelData);
      
      // Add date to user's dates
      await dataService.addUserDate(currentUser.id, selectedDate);
      
      // Reload data
      await loadDataForDate(selectedDate);
      
      // Refresh user dates
      const updatedDates = await dataService.getUserDates(currentUser.id);
      setUserDates(updatedDates);

      console.log('✅ Excel uploaded successfully');
    } catch (error) {
      console.error('❌ Excel upload failed:', error);
      setError('Failed to upload Excel file');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate mock 30 topics in ascending order
   */
  const generateMock30Topics = () => {
    const topics = [
      'D-1 Set-1', 'D-1 Set-2',
      'D-3 Set-1', 'D-3 Set-2', 
      'D-4 Set-1', 'D-4 Set-2',
      'D-5 Set-1', 'D-5 Set-2',
      'D-7 Set-1', 'D-7 Set-2',
      'D-9 Set-1', 'D-9 Set-2',
      'D-10 Set-1', 'D-10 Set-2',
      'D-11 Set-1', 'D-11 Set-2',
      'D-12 Set-1', 'D-12 Set-2',
      'D-27 Set-1', 'D-27 Set-2',
      'D-30 Set-1', 'D-30 Set-2',
      'D-60 Set-1', 'D-60 Set-2',
      'D-81 Set-1', 'D-81 Set-2',
      'D-108 Set-1', 'D-108 Set-2',
      'D-144 Set-1', 'D-144 Set-2'
    ];

    const sets = {};
    topics.forEach(topic => {
      sets[topic] = {
        name: topic,
        data: Array.from({ length: 24 }, (_, i) => ({
          hour: i + 1,
          value: Math.floor(Math.random() * 100)
        }))
      };
    });

    return sets;
  };

  /**
   * Handle date selection
   */
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  /**
   * Get sorted topics in ascending order
   */
  const getSortedTopics = () => {
    if (!excelData?.sets) return [];

    return Object.keys(excelData.sets).sort((a, b) => {
      const aMatch = a.match(/^D-(\d+)\s+Set-(\d+)/);
      const bMatch = b.match(/^D-(\d+)\s+Set-(\d+)/);
      
      if (!aMatch || !bMatch) return a.localeCompare(b);
      
      const aDNum = parseInt(aMatch[1]);
      const bDNum = parseInt(bMatch[1]);
      const aSetNum = parseInt(aMatch[2]);
      const bSetNum = parseInt(bMatch[2]);
      
      if (aDNum !== bDNum) return aDNum - bDNum;
      return aSetNum - bSetNum;
    });
  };

  return (
    <div className="index-page clean-version">
      {/* Header */}
      <div className="header-section">
        <h1>🎯 Clean Supabase-Only App</h1>
        <div className="status-badges">
          <span className="badge success">No localStorage</span>
          <span className="badge success">No fallback</span>
          <span className="badge primary">Supabase Only</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading data from Supabase...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-section">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* User Info */}
      {currentUser && (
        <div className="user-section">
          <h3>👤 Current User</h3>
          <p><strong>ID:</strong> {currentUser.id}</p>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Created:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
        </div>
      )}

      {/* Date Selection */}
      <div className="date-section">
        <h3>📅 Select Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-input"
        />
        
        {userDates.length > 0 && (
          <div className="existing-dates">
            <p><strong>Your Dates:</strong> {userDates.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Excel Upload */}
      <div className="upload-section">
        <h3>📊 Upload Excel Data</h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          disabled={loading}
          className="file-input"
        />
        <p className="help-text">Upload Excel file with 30 topics data</p>
      </div>

      {/* Data Display */}
      {excelData && (
        <div className="data-section">
          <h3>📈 Excel Data (Ascending Order)</h3>
          <div className="topics-grid">
            {getSortedTopics().map((topic, index) => (
              <div key={topic} className="topic-card">
                <h4>{index + 1}. {topic}</h4>
                <p>Data points: {excelData.sets[topic]?.data?.length || 0}</p>
              </div>
            ))}
          </div>
          
          <div className="data-summary">
            <p><strong>Total Topics:</strong> {Object.keys(excelData.sets).length}</p>
            <p><strong>File Name:</strong> {excelData.fileName}</p>
            <p><strong>Upload Date:</strong> {selectedDate}</p>
          </div>
        </div>
      )}

      {/* Hour Entry Status */}
      {hourEntry && (
        <div className="hour-section">
          <h3>⏰ Hour Entry Data</h3>
          <p>Planet selections available for {selectedDate}</p>
          <div className="planet-selections">
            {Object.entries(hourEntry.planet_selections || {}).map(([hour, planet]) => (
              <span key={hour} className="planet-tag">
                H{hour}: {planet}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !excelData && selectedDate && (
        <div className="no-data-section">
          <h3>📝 No Data Available</h3>
          <p>No Excel data found for {selectedDate}</p>
          <p>Please upload an Excel file to get started.</p>
        </div>
      )}

      {/* Footer */}
      <div className="footer-section">
        <p>🎯 Clean Architecture: Single source of truth with Supabase</p>
        <p>✅ No localStorage dependencies • ✅ No fallback systems</p>
      </div>

      <style jsx>{`
        .clean-version {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .status-badges {
          margin-top: 10px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          margin: 0 5px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.success {
          background: #10b981;
          color: white;
        }

        .badge.primary {
          background: #3b82f6;
          color: white;
        }

        .loading-section, .error-section, .user-section, 
        .date-section, .upload-section, .data-section, 
        .hour-section, .no-data-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .error-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .topic-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .topic-card h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 14px;
        }

        .topic-card p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .planet-selections {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .planet-tag {
          background: #ddd6fe;
          color: #5b21b6;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .footer-section {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 14px;
        }

        .spinner {
          border: 3px solid #f3f4f6;
          border-radius: 50%;
          border-top: 3px solid #3b82f6;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CleanIndexPage;
