import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { unifiedDataService } from '../services/unifiedDataService';
import { DataService } from '../services/dataService_new';

function PlanetsAnalysisPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(userId || '');
  const [datesList, setDatesList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeHR, setActiveHR] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [planetsData, setPlanetsData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Topic selection state
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true);

  // Initialize data services
  const dataService = new DataService();
  const fallbackDataService = unifiedDataService;

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
        return;
      }
      
      setUsers(data || []);
      
      if (userId && data && data.length > 0) {
        setSelectedUser(userId);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  // Fetch user dates
  const fetchUserDates = async (uid) => {
    try {
      if (!uid) return;
      
      const dates = await dataService.getDates(uid);
      if (dates && dates.length > 0) {
        const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
        setDatesList(sortedDates);
        
        const urlDate = searchParams.get('date');
        if (urlDate && dates.includes(urlDate)) {
          setSelectedDate(urlDate);
        } else if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]);
        }
      } else {
        setDatesList([]);
        setSelectedDate('');
      }
    } catch (error) {
      console.error('Error fetching user dates:', error);
      setDatesList([]);
      setSelectedDate('');
    }
  };

  // Fetch available topics from Excel data
  const fetchAvailableTopics = useCallback(async () => {
    if (!selectedUser || !selectedDate) {
      setAvailableTopics([]);
      return;
    }

    try {
      const excelData = await unifiedDataService.getExcelData(selectedUser, selectedDate);
      if (excelData?.data?.sets) {
        const topics = Object.keys(excelData.data.sets);
        setAvailableTopics(topics);
        
        // Auto-select first few topics
        const autoSelectedTopics = new Set(topics.slice(0, Math.min(5, topics.length)));
        setSelectedTopics(autoSelectedTopics);
      } else {
        setAvailableTopics([]);
        setSelectedTopics(new Set());
      }
    } catch (error) {
      console.error('Error fetching available topics:', error);
      setAvailableTopics([]);
      setSelectedTopics(new Set());
    }
  }, [selectedUser, selectedDate]);

  // Excel upload handling
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedUser || !selectedDate) {
      setError('Please select a user and date first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Process and save the Excel data
          const processedData = {
            date: selectedDate,
            sets: {},
            rawData: jsonData
          };

          await unifiedDataService.saveExcelData(selectedUser, selectedDate, {
            data: processedData,
            uploadedAt: new Date().toISOString()
          });

          setPlanetsData(processedData);
          setSuccess('Excel file uploaded successfully');
          
          // Refresh available topics
          await fetchAvailableTopics();
          
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setError('Failed to process Excel file');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      setError('Failed to upload Excel file');
      setLoading(false);
    }

    event.target.value = '';
  };

  // Effects
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDates(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchAvailableTopics();
  }, [fetchAvailableTopics]);

  // Get selected user data
  const selectedUserData = users.find(u => u.id.toString() === selectedUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔬 Planets Analysis</h1>
              {selectedUserData && (
                <div className="text-sm text-teal-800">
                  <p>👤 User: {selectedUserData.username}</p>
                  <p>🏠 HR Numbers: {selectedUserData.hr}</p>
                  {selectedDate && <p>📅 Date: {new Date(selectedDate).toLocaleDateString()}</p>}
                  {activeHR && <p>🕐 HR: {activeHR}</p>}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/users')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                ← Back to Users
              </button>
              <button
                onClick={() => navigate(`/abcd-number/${selectedUser}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                📊 ABCD Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User:</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.username} (HR: {user.hr})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                disabled={!selectedUser}
              >
                <option value="">Select a date</option>
                {datesList.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Excel Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Planets Excel:</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                disabled={!selectedUser || !selectedDate || loading}
              />
            </div>
          </div>
        </div>

        {/* HR Selection */}
        {selectedUserData && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 mr-4">Select HR:</span>
              <div className="flex gap-2">
                {Array.from({ length: selectedUserData.hr }, (_, i) => i + 1).map(hr => (
                  <button
                    key={hr}
                    onClick={() => setActiveHR(hr.toString())}
                    disabled={analysisLoading}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeHR === hr.toString()
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                    } ${analysisLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    HR {hr}
                  </button>
                ))}
              </div>
              {analysisLoading && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Analyzing...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-700">Processing...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && selectedUser && selectedDate && availableTopics.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              Upload an Excel file with planets data to begin analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanetsAnalysisPage;