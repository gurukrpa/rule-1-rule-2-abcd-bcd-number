// src/components/ABCDBCDNumber.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// Using CleanSupabaseService singleton instance for data operations
import cleanSupabaseService from '../services/CleanSupabaseService';
import * as XLSX from 'xlsx';
// Import strict Excel validation
import { validateExcelStructure, generateValidationReport } from '../utils/excelValidation';

// Import required components
import Rule1Page from './Rule1Page';
import Rule2CompactPage from './Rule2CompactPage';
import IndexPage from './IndexPage';
import AddDateModal from './modals/AddDateModal';

const HourEntryModal = ({ show, onClose, hourEntryDate, selectedUserData, planets, hourEntryPlanetSelections, handleHourEntryPlanetChange, handleSaveHourEntry, hourEntryError }) => {
  if (!show) return null;
  
  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white p-6 rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - More Compact */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            🕐 Hour Entry for {hourEntryDate}
          </h3>
          <p className="text-sm text-gray-600">Select a planet for each HR period</p>
        </div>
        
        {/* Single Comprehensive Box - All Hours Grid */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
          {/* Responsive Grid - All Hours in Single View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {selectedUserData && Array.from({ length: selectedUserData.hr }, (_, i) => i + 1).map(hr => (
              <div 
                key={hr} 
                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-2">
                  <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                    HR {hr}
                  </span>
                </div>
                <select
                  value={hourEntryPlanetSelections[hr] || ''}
                  onChange={(e) => handleHourEntryPlanetChange(hr, e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white text-center font-medium"
                >
                  <option value="">🌍 Select Planet</option>
                  {planets.map(planet => (
                    <option key={planet.value} value={planet.value}>
                      {planet.label}
                    </option>
                  ))}
                </select>
                {/* Visual indicator for selected planet */}
                {hourEntryPlanetSelections[hr] && (
                  <div className="mt-1.5 text-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Error Message - Compact */}
        {hourEntryError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{hourEntryError}</p>
            </div>
          </div>
        )}
         {/* Action Buttons - Compact and Well-Styled */}
        <div className="flex justify-center gap-3 mt-4">
          {/* Cancel Button */}
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-all duration-150 shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          
          {/* Save Button - Simple Design */}
          <button 
            onClick={handleSaveHourEntry} 
            className="px-6 py-2 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-150 transform hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
          >
            💾 Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

// 9 planets for dropdowns
const planets = [
  { value: 'Su', label: 'Sun (Su)' },
  { value: 'Mo', label: 'Moon (Mo)' },
  { value: 'Ma', label: 'Mars (Ma)' },
  { value: 'Me', label: 'Mercury (Me)' },
  { value: 'Ju', label: 'Jupiter (Ju)' },
  { value: 'Ve', label: 'Venus (Ve)' },
  { value: 'Sa', label: 'Saturn (Sa)' },
  { value: 'Ra', label: 'Rahu (Ra)' },
  { value: 'Ke', label: 'Ketu (Ke)' }
];

function ABCDBCDNumber() {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  // 🧪 EXPERIMENTAL: Enhanced logging for Git workflow testing
  console.log('🔬 EXPERIMENTAL FEATURE: Enhanced component logging enabled');
  console.log('📊 Component rendered at:', new Date().toISOString());
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datesList, setDatesList] = useState([]);
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [showHourEntryModal, setShowHourEntryModal] = useState(false);
  const [hourEntryDate, setHourEntryDate] = useState('');
  const [hourEntryPlanetSelections, setHourEntryPlanetSelections] = useState({});
  const [hourEntryError, setHourEntryError] = useState('');
  const [dateStatuses, setDateStatuses] = useState({}); // Track Excel/Hour Entry status for each date
  
  // Rule1Page navigation states
  const [showRule1Page, setShowRule1Page] = useState(false);
  const [rule1PageData, setRule1PageData] = useState(null);
  
  // Rule2Page navigation states
  const [showRule2Page, setShowRule2Page] = useState(false);
  const [rule2PageData, setRule2PageData] = useState(null);
  
  // IndexPage navigation states
  const [showIndexPage, setShowIndexPage] = useState(false);
  const [indexPageData, setIndexPageData] = useState(null);
  
  // Cache stats for UI display (disabled for Supabase-only testing)
  const [cacheStats, setCacheStats] = useState(null);

  // Use the real DataService instead of local state-based approach
  // This ensures data is saved to Supabase/localStorage where IndexPage can read it
  const dataService = {
    saveDates: (uid, dates) => cleanSupabaseService.saveUserDates(uid, dates),
    getDates: (uid) => cleanSupabaseService.getUserDates(uid),
    
    // Use CleanSupabaseService for proper data persistence
    hasExcelData: (userId, date) => cleanSupabaseService.hasExcelData(userId, date),
    getExcelData: (userId, date) => cleanSupabaseService.getExcelData(userId, date),
    saveExcelData: (userId, date, data) => cleanSupabaseService.saveExcelData(userId, date, data),
    
    hasHourEntry: (userId, date) => cleanSupabaseService.hasHourEntry(userId, date),
    getHourEntry: (userId, date) => cleanSupabaseService.getHourEntry(userId, date),
    saveHourEntry: (userId, date, data) => cleanSupabaseService.saveHourEntry(userId, date, data.planetSelections),
    
    // ✅ COMPREHENSIVE DELETION - Connect to actual deletion functions
    deleteDataForDate: async (userId, date) => {
      console.log('🗑️ [DATASERVICE] Calling comprehensive deletion for:', { userId, date });
      
      // Delete from CleanSupabaseService first
      try {
        await cleanSupabaseService.deleteExcelData(userId, date);
        await cleanSupabaseService.deleteHourEntry(userId, date);
        console.log('✅ [DATASERVICE] CleanSupabaseService deletion completed');
      } catch (error) {
        console.warn('⚠️ [DATASERVICE] CleanSupabaseService deletion had issues:', error.message);
      }
      
      // Import and use the comprehensive DataService deletion
      const { DataService } = await import('../services/dataService');
      const comprehensiveDataService = new DataService();
      await comprehensiveDataService.deleteDataForDate(userId, date);
      console.log('✅ [DATASERVICE] Comprehensive deletion completed');
    },
    
    // Cache management methods (can be no-ops for now)
    invalidateAnalysisCacheForDate: () => Promise.resolve(),
    invalidateUser: () => Promise.resolve(),
    clearAllCache: () => Promise.resolve(),
    warmUpCache: () => Promise.resolve(),
  };

  const loadCacheStats = () => Promise.resolve(); // No-op for testing

  // Fetch users from unified data service
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Try to get users from Supabase data service (Firebase disabled)
      const usersData = await cleanSupabaseService.getAllUsers();
      
      if (usersData && usersData.length > 0) {
        const processedUsers = usersData.map(user => ({
          ...user,
          id: String(user.id),
          hr: Number(user.hr) || 1
        }));
        setUsers(processedUsers);
        
        // If userId is provided in params, auto-select that user
        if (userId) {
          setSelectedUser(userId);
          await loadUserDates(userId);
        }
      } else {
        // If no users found, create some default test users
        const defaultUsers = [
          { id: '1', username: 'Test User 1', hr: 3 },
          { id: '2', username: 'Test User 2', hr: 4 },
          { id: '3', username: 'Test User 3', hr: 5 }
        ];
        
        // Try to create users via Supabase data service (Firebase disabled)
        try {
          for (const user of defaultUsers) {
            await cleanSupabaseService.createUser({
              username: user.username,
              email: `${user.username.toLowerCase().replace(' ', '')}@example.com`,
              hr: user.hr
            });
          }
          setUsers(defaultUsers);
        } catch (createError) {
          console.warn('Could not create default users, using local data:', createError);
          setUsers(defaultUsers);
        }
      }
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load dates for selected user
  useEffect(() => {
    if (selectedUser) {
      loadUserDates(selectedUser);
    } else {
      setDatesList([]);
      setSelectedDate('');
    }
  }, [selectedUser]);

  const loadUserDates = async (uid) => {
    try {
      console.log('📅 Loading user dates for:', uid);
      
      const dates = await cleanSupabaseService.getUserDates(uid);
      console.log('📅 Loaded dates from database:', dates);
      
      if (dates && dates.length > 0) {
        const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
        console.log('📅 Setting sorted dates in UI:', sorted);
        setDatesList(sorted);
        setSelectedDate(sorted[0]);
        return;
      }
      
      console.log('📅 No dates found, setting empty state');
      setDatesList([]);
      setSelectedDate('');
    } catch (e) {
      console.error('❌ Error loading user dates:', e);
      setDatesList([]);
      setSelectedDate('');
    }
  };

  // Load dates for selected user
  useEffect(() => {
    if (selectedUser) {
      loadUserDates(selectedUser);
      // Warm up cache for the selected user (but don't override fresh data)
      setTimeout(() => {
        dataService.warmUpCache(selectedUser).catch(err => 
          console.warn('Cache warming failed:', err)
        );
      }, 1000); // Delay cache warming to allow fresh data to load first
    } else {
      setDatesList([]);
      setSelectedDate('');
    }
  }, [selectedUser]);

  const saveDatesToLocalStorage = async (uid, dates) => {
    try {
      console.log('💾 Saving dates to database for user:', uid, 'dates:', dates);
      await dataService.saveDates(uid, dates);
      console.log('✅ Successfully saved dates to database');
    } catch (e) {
      console.error('❌ Error saving dates to database:', e);
      throw e; // Re-throw to let caller handle the error
    }
  };

  // Add new date
  const handleAddDate = async () => {
    if (!newDate) {
      setDateError('Please select a date.');
      return;
    }
    
    if (!selectedUser) {
      setDateError('Please select a user first.');
      return;
    }
    
    try {
      setDateError(''); // Clear any previous errors
      const iso = new Date(newDate).toISOString().split('T')[0];
      const normalized = datesList.map(d => new Date(d).toISOString().split('T')[0]);
      
      if (normalized.includes(iso)) {
        setDateError('This date already exists.');
        return;
      }
      
      // ✅ Use CleanSupabaseService's dedicated addUserDate method
      console.log('💾 Adding new date using CleanSupabaseService:', iso);
      await cleanSupabaseService.addUserDate(selectedUser, iso);
      console.log('✅ Date added successfully to database');
      
      // ✅ Reload dates from database to ensure UI is in sync
      await loadUserDates(selectedUser);
      console.log('✅ Reloaded dates from database after adding');
      
      // ✅ Set the newly added date as selected
      setSelectedDate(iso);
      setNewDate('');
      setDateError('');
      setShowAddDateModal(false);
      
      setSuccess(`Date ${new Date(iso).toLocaleDateString()} added successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('❌ Error adding date:', e);
      setDateError('Failed to add date. Please try again.');
    }
  };

  // Remove date
  const handleRemoveDate = async (dateToRemove) => {
    try {
      console.log('🗑️ Starting date removal process for:', dateToRemove);
      
      if (datesList.length <= 1) {
        // ✅ Use CleanSupabaseService's dedicated removeUserDate method for single date
        console.log('🗑️ Removing last date using CleanSupabaseService:', dateToRemove);
        await cleanSupabaseService.removeUserDate(selectedUser, dateToRemove);
        console.log('✅ Last date removed successfully from database');
        
        // ✅ Reload dates from database to ensure UI is in sync
        await loadUserDates(selectedUser);
        setSelectedDate('');
        
        setSuccess(`Date ${new Date(dateToRemove).toLocaleDateString()} removed.`);
        setTimeout(() => setSuccess(''), 3000);
        return;
      }
      
      const first = datesList[0];
      const last = datesList[datesList.length - 1];
      if (dateToRemove !== first && dateToRemove !== last) {
        setError('Only newest or oldest can be deleted directly.');
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      // ✅ Use CleanSupabaseService's dedicated removeUserDate method
      console.log('🗑️ Removing date using CleanSupabaseService:', dateToRemove);
      await cleanSupabaseService.removeUserDate(selectedUser, dateToRemove);
      console.log('✅ Date removed successfully from database');
      
      // ✅ Reload dates from database to ensure UI is in sync
      await loadUserDates(selectedUser);
      console.log('✅ Reloaded dates from database after removal');
      
      // ✅ Update selected date if necessary
      if (selectedDate === dateToRemove) {
        const remainingDates = await cleanSupabaseService.getUserDates(selectedUser);
        if (remainingDates.length > 0) {
          setSelectedDate(remainingDates[0]);
        } else {
          setSelectedDate('');
        }
      }
      
      // ✅ Update date statuses
      setDateStatuses(prev => {
        const updated = { ...prev };
        delete updated[dateToRemove];
        return updated;
      });
      
      const label = dateToRemove === first ? 'Newest' : 'Oldest';
      setSuccess(`${label} date ${new Date(dateToRemove).toLocaleDateString()} removed.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error removing date:', error);
      setError('Failed to remove date. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle Excel upload for specific date with STRICT VALIDATION
  const handleDateExcelUpload = async (event, targetDate) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      console.log(`🔍 STRICT VALIDATION: Starting upload for ${file.name}`);
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File too large! Maximum size is 10MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        setTimeout(() => setError(''), 8000);
        event.target.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log(`📊 Processing Excel file: ${file.name}`);
          
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          console.log(`📋 Raw Excel data: ${jsonData.length} rows`);

          // 🚨 STRICT VALIDATION - File must match EXACT template structure
          const validation = validateExcelStructure(jsonData, file.name);
          
          if (!validation.isValid) {
            console.error('❌ VALIDATION FAILED:', validation.errors);
            
            // Generate detailed error report
            const report = generateValidationReport(validation, file.name);
            console.error('📋 VALIDATION REPORT:\n', report);
            
            // Simple, concise error message
            const errorMsg = `❌ Excel file can't be uploaded - it's not from ABCD and BCD number file.`;
            
            setError(errorMsg);
            setTimeout(() => setError(''), 5000); // Normal timeout for simple message
            event.target.value = null;
            return;
          }

          // Enhanced success message with quality metrics
          let successMsg = '';
          if (validation.warnings && validation.warnings.length > 0) {
            console.warn('⚠️ VALIDATION WARNINGS:', validation.warnings);
            successMsg = `⚠️ File uploaded with ${validation.warnings.length} warning(s):\n`;
            validation.warnings.slice(0, 3).forEach((warning, index) => {
              successMsg += `${index + 1}. ${warning}\n`;
            });
            if (validation.warnings.length > 3) {
              successMsg += `... and ${validation.warnings.length - 3} more warnings\n`;
            }
            setSuccess(successMsg);
            setTimeout(() => setSuccess(''), 10000);
          } else {
            // Perfect validation - show quality metrics
            const qualityEmoji = validation.dataQualityScore >= 98 ? '🟢' : validation.dataQualityScore >= 95 ? '🟡' : '🟠';
            successMsg = `${qualityEmoji} Excel uploaded successfully for ${targetDate} - Quality: ${validation.dataQualityScore?.toFixed(1) || '100.0'}% (${validation.validDataCells || 2430} valid cells)`;
            setSuccess(successMsg);
            setTimeout(() => setSuccess(''), 8000);
          }

          console.log('✅ VALIDATION PASSED - Processing data...');

          // Process the validated data
          const processedData = processSingleDayExcel(jsonData, targetDate);
          
          // Use DataService to save Excel data
          await dataService.saveExcelData(selectedUser, targetDate, {
            fileName: file.name,
            sets: processedData.sets, // Extract sets from processedData
            date: targetDate,
            uploadedAt: new Date().toISOString(),
            validationReport: validation
          });
          
          // Update date status for this specific date
          const excelUploaded = await dataService.hasExcelData(selectedUser, targetDate);
          const hourEntryCompleted = await dataService.hasHourEntry(selectedUser, targetDate);
          
          console.log(`📊 Status after Excel upload for ${targetDate}:`, { 
            excelUploaded, 
            hourEntryCompleted,
            key: `${selectedUser}_${targetDate}`
          });
          
          setDateStatuses(prev => ({
            ...prev,
            [targetDate]: {
              excelUploaded,
              hourEntryCompleted
            }
          }));
          
          setSuccess(`✅ Excel file validated and uploaded successfully for ${new Date(targetDate).toLocaleDateString()}!`);
          setTimeout(() => setSuccess(''), 5000);
          
          setDatesList([...datesList]);
          
        } catch (error) {
          console.error('❌ Excel processing error:', error);
          setError(`Failed to process Excel file: ${error.message}\n\nPlease ensure the file matches the required template format.`);
          setTimeout(() => setError(''), 8000);
        }
      };

      reader.readAsArrayBuffer(file);
      event.target.value = null;
      event.target.value = null;
      
    } catch (error) {
      setError(`Failed to upload file: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Process single day Excel data - Updated for planet-based format
  const processSingleDayExcel = (rows, targetDate) => {
    console.log(`🔍 Processing Excel with all 9 planets for ${targetDate}, ${rows.length} rows`);
    
    const result = {
      date: targetDate,
      sets: {},
      planets: {}
    };
    
    // Planet mapping for columns
    const planetMapping = {
      1: 'Su',   // Sun
      2: 'Mo',   // Moon  
      3: 'Ma',   // Mars
      4: 'Me',   // Mercury
      5: 'Ju',   // Jupiter
      6: 'Ve',   // Venus
      7: 'Sa',   // Saturn
      8: 'Ra',   // Rahu
      9: 'Ke'    // Ketu
    };
    
    // Element name mapping
    const elementNames = {
      'as': 'Lagna',
      'mo': 'Moon',
      'hl': 'Hora Lagna', 
      'gl': 'Ghati Lagna',
      'vig': 'Vighati Lagna',
      'var': 'Varnada Lagna',
      'sl': 'Sree Lagna',
      'pp': 'Pranapada Lagna',
      'in': 'Indu Lagna'
    };
    
    let currentSet = null;
    let currentSetData = {};
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      
      const firstCell = String(row[0] || '').trim();
      
      // Detect set headers (e.g., "D-1 Set-1 Matrix")
      if (firstCell.includes('Matrix') && (firstCell.includes('D-') || firstCell.includes('Set-'))) {
        // Save previous set if exists
        if (currentSet && Object.keys(currentSetData).length > 0) {
          result.sets[currentSet] = { ...currentSetData };
        }
        
        currentSet = firstCell;
        currentSetData = {};
        console.log(`📊 Found set: ${currentSet}`);
        continue;
      }
      
      // Skip planet header rows (x, Sun, Moon, Mars, etc.)
      if (firstCell.toLowerCase() === 'x' || 
          ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']
          .some(planet => firstCell.toLowerCase().includes(planet))) {
        console.log(`🪐 Skipping planet header row: ${firstCell}`);
        continue;
      }
      
      // Process element rows (as, mo, hl, gl, etc.)
      if (currentSet && firstCell && firstCell.length <= 3) {
        const elementCode = firstCell.toLowerCase();
        
        if (elementNames[elementCode]) {
          const elementName = elementNames[elementCode];
          const planetData = {};
          
          // Extract data for each planet column (columns 1-9)
          for (let colIndex = 1; colIndex <= 9 && colIndex < row.length; colIndex++) {
            const cellValue = row[colIndex];
            if (cellValue && typeof cellValue === 'string' && cellValue.trim()) {
              const planetCode = planetMapping[colIndex];
              planetData[planetCode] = cellValue.trim();
            }
          }
          
          if (Object.keys(planetData).length > 0) {
            currentSetData[elementName] = planetData;
            console.log(`  📝 ${elementName}: ${Object.keys(planetData).length} planets`);
          }
        }
      }
    }
    
    // Save the last set
    if (currentSet && Object.keys(currentSetData).length > 0) {
      result.sets[currentSet] = { ...currentSetData };
    }
    
    console.log(`✅ Processed ${Object.keys(result.sets).length} sets for ${targetDate}`);
    console.log('📋 Sets found:', Object.keys(result.sets));
    
    return result;
  };

  // Hour Entry modal - Updated for planet-based format
  const handleHourEntryClick = async (date) => {
    if (!selectedUser) {
      setError('Please select a user first.');
      return;
    }
    
    // Check if Excel data exists using DataService
    const excelData = await dataService.getExcelData(selectedUser, date);
    // Removed Excel data requirement - allow Hour Entry without Excel upload
    
    const userObj = users.find(u => u.id.toString() === selectedUser);
    if (!userObj?.hr) {
      setError('User HR info missing.');
      return;
    }
    
    // Initialize planet selection for each HR
    let init = {};
    for (let hr = 1; hr <= userObj.hr; hr++) {
      init[hr] = '';
    }
    
    // Load existing selections if any
    const existingHourEntry = await dataService.getHourEntry(selectedUser, date);
    if (existingHourEntry && existingHourEntry.planetSelections) {
      init = { ...existingHourEntry.planetSelections };
    }
    
    setHourEntryDate(date);
    setHourEntryPlanetSelections(init);
    setHourEntryError('');
    setShowHourEntryModal(true);
  };

  const handleHourEntryPlanetChange = (hr, val) => {
    setHourEntryPlanetSelections(prev => ({
      ...prev,
      [hr]: val
    }));
  };

  const handleSaveHourEntry = async () => {
    const userObj = users.find(u => u.id.toString() === selectedUser);
    let valid = true;
    for (let hr = 1; hr <= userObj.hr; hr++) {
      if (!hourEntryPlanetSelections[hr]) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      setHourEntryError('Select a planet for each HR.');
      return;
    }

    // Single-click save - no confirmation needed
    const payload = {
      userId: selectedUser,
      date: hourEntryDate,
      planetSelections: hourEntryPlanetSelections,
      savedAt: new Date().toISOString()
    };
    
    try {
      // Use DataService to save hour entry
      await dataService.saveHourEntry(selectedUser, hourEntryDate, payload);
      
      // Update date status for this specific date
      const excelUploaded = await dataService.hasExcelData(selectedUser, hourEntryDate);
      const hourEntryCompleted = await dataService.hasHourEntry(selectedUser, hourEntryDate);
        
      console.log(`⏰ Status after Hour Entry save for ${hourEntryDate}:`, { 
        excelUploaded, 
        hourEntryCompleted,
        key: `${selectedUser}_${hourEntryDate}`
      });
      
      setDateStatuses(prev => ({
        ...prev,
        [hourEntryDate]: {
          excelUploaded,
          hourEntryCompleted
        }
      }));
      
      setShowHourEntryModal(false); // Close modal only after successful save
      setSuccess(`Hour entry saved for ${new Date(hourEntryDate).toLocaleDateString()}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setHourEntryError('Failed to save. Try again.');
    }
  };

  // Index page navigation - Updated for planet-based Excel structure
  const handleIndexClick = async (date) => {
    console.log('🏠 handleIndexClick called with date:', date);
    console.log('🏠 Current datesList:', datesList);
    
    // === CRITICAL DEBUG: Compare with Rule-1 ===
    console.log('🆚 INDEXPAGE vs RULE-1 INPUT COMPARISON:');
    console.log('   IndexPage clicked date:', date, typeof date);
    console.log('   IndexPage datesList:', datesList);
    console.log('   IndexPage user:', selectedUser);
    console.log('   Rule-1 would get SAME inputs for SAME button click');
    // =============================================
    
    if (!selectedUser) {
      setError('Please select a user first.');
      return;
    }
    
    // Check if Excel and Hour Entry data exist using DataService
    const excelData = await dataService.getExcelData(selectedUser, date);
    const hourEntryData = await dataService.getHourEntry(selectedUser, date);
    
    // Removed Excel data requirement - allow Index access without Excel upload
    
    if (!hourEntryData) {
      setError('Complete Hour Entry for this date first.');
      return;
    }
    
    // Parse the data to verify structure
    try {
      console.log('🔍 Excel data structure:', excelData.data);
      console.log('🔍 Hour entry selections:', hourEntryData.planetSelections);
      
      setIndexPageData({
        date,
        selectedUser
      });
      setShowIndexPage(true);
    } catch (err) {
      setError('Error processing saved data. Please re-upload Excel and complete Hour Entry.');
    }
  };

  const handleBackFromIndex = () => {
    setShowIndexPage(false);
    setIndexPageData(null);
  };

  // Handle Rule-1 page navigation
  const handleRule1Click = async (date) => {
    console.log('🔗 handleRule1Click called with date:', date);
    console.log('🔗 Current datesList:', datesList);
    console.log('🔗 Current selectedUser:', selectedUser);
    
    // === CRITICAL DEBUG: Compare with IndexPage ===
    console.log('🆚 RULE-1 vs INDEXPAGE INPUT COMPARISON:');
    console.log('   Rule-1 clicked date:', date, typeof date);
    console.log('   Rule-1 datesList:', datesList);
    console.log('   Rule-1 user:', selectedUser);
    console.log('   IndexPage would get SAME inputs for SAME button click');
    // ================================================
    
    if (!selectedUser) {
      console.log('❌ No user selected');
      setError('Please select a user first.');
      return;
    }
    
    // Sort dates chronologically to find the position
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const idx = sortedDates.indexOf(date);
    
    if (idx < 4) {
      setError('Rule-1 requires at least 5 dates. This is only the ' + (idx + 1) + getOrdinalSuffix(idx + 1) + ' date chronologically.');
      return;
    }
    
    // === REMOVED: Excel and Hour Entry dependency checks ===
    // Rule-1 now works independently like Rule-2
    // Missing data will be handled gracefully with empty arrays
    console.log('✅ [INDEPENDENT] Rule-1 operating without Excel/Hour Entry requirements (like Rule-2)');
    
    console.log('✅ Launching Rule1Page with independent operation');
    setRule1PageData({
      date,
      selectedUser,
      users  // Pass the users data
    });
    setShowRule1Page(true);
  };

  const handleBackFromRule1 = () => {
    setShowRule1Page(false);
    setRule1PageData(null);
  };

  // Handle Rule-2 page navigation
  const handleRule2Click = async (date) => {
    console.log('🔗 handleRule2Click called with date:', date);
    console.log('🔗 Current datesList:', datesList);
    console.log('🔗 Current selectedUser:', selectedUser);
    
    if (!selectedUser) {
      console.log('❌ No user selected');
      setError('Please select a user first.');
      return;
    }
    
    // Rule-2 validates the four preceding dates (A, B, C, D), not the clicked date itself
    // The clicked date is just a trigger - it must be chronologically 5th or later
    
    // Get all dates for this user and sort them chronologically
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const idx = sortedDates.indexOf(date);
    
    if (idx < 4) {
      setError('Rule-2 requires at least 5 dates. This is only the ' + (idx + 1) + getOrdinalSuffix(idx + 1) + ' date chronologically.');
      return;
    }
    
    // Get the four preceding dates (A, B, C, D)
    const A = sortedDates[idx - 4];
    const B = sortedDates[idx - 3];
    const C = sortedDates[idx - 2];
    const D = sortedDates[idx - 1];
    
    console.log('🔗 Checking preceding dates:');
    console.log('   A (4th back):', A);
    console.log('   B (3rd back):', B);
    console.log('   C (2nd back):', C);
    console.log('   D (1st back):', D);
    
    // Check if all four preceding dates have Excel and Hour Entry data
    const precedingDates = [
      { label: 'A', date: A },
      { label: 'B', date: B },
      { label: 'C', date: C },
      { label: 'D', date: D }
    ];
    
    const missingData = [];
    
    for (const { label, date: checkDate } of precedingDates) {
      // Use DataService to check for data existence
      const hasExcel = await dataService.hasExcelData(selectedUser, checkDate);
      const hasHourEntry = await dataService.hasHourEntry(selectedUser, checkDate);
      
      if (!hasExcel) {
        missingData.push(`${label}-day (${new Date(checkDate).toLocaleDateString()}): Missing Excel file`);
      }
      if (!hasHourEntry) {
        missingData.push(`${label}-day (${new Date(checkDate).toLocaleDateString()}): Missing Hour Entry`);
      }
    }
    
    if (missingData.length > 0) {
      setError(`Rule-2 requires Excel and Hour Entry for the four preceding dates:\n\n${missingData.join('\n')}`);
      return;
    }
    
    console.log('✅ All validations passed, showing Rule2Page');
    setRule2PageData({
      date,
      selectedUser
    });
    setShowRule2Page(true);
  };

  // Handle Planets Analysis page navigation
  const handlePlanetsAnalysisClick = async (date) => {
    console.log('🪐 handlePlanetsAnalysisClick called with date:', date);
    console.log('🪐 Current datesList:', datesList);
    console.log('🪐 Current selectedUser:', selectedUser);
    
    if (!selectedUser) {
      console.log('❌ No user selected');
      setError('Please select a user first.');
      return;
    }
    
    // Navigate to the Planets Analysis page with userId
    navigate(`/planets-analysis/${selectedUser}?date=${date}`);
  };

  // Helper function for ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (num) => {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const handleBackFromRule2 = () => {
    setShowRule2Page(false);
    setRule2PageData(null);
  };

  // Handle extract numbers navigation
  const handleExtractNumbers = (date, activeHR) => {
    console.log('Extract numbers clicked with date:', date, 'activeHR:', activeHR);
    
    // Store the activeHR in the rule2PageData
    setRule2PageData({
      date,
      selectedUser,
      activeHR
    });
    setShowRule2Page(true);
  };

  // Auto-select user from URL
  useEffect(() => {
    if (userId && users.length > 0) {
      setSelectedUser(userId);
    }
  }, [userId, users]);

  const selectedUserData = users.find(u => u.id.toString() === selectedUser);

  // Update date statuses when datesList or selectedUser changes
  useEffect(() => {
    const updateDateStatuses = async () => {
      if (!selectedUser || datesList.length === 0) {
        setDateStatuses({});
        return;
      }

      const statuses = {};
      for (const date of datesList) {
        const excelUploaded = await dataService.hasExcelData(selectedUser, date);
        const hourEntryCompleted = await dataService.hasHourEntry(selectedUser, date);
        statuses[date] = {
          excelUploaded,
          hourEntryCompleted
        };
      }
      setDateStatuses(statuses);
    };

    updateDateStatuses();
  }, [datesList, selectedUser]);

  // Check helper functions - now using cached statuses
  const isExcelUploaded = (date) => {
    return dateStatuses[date]?.excelUploaded || false;
  };

  const isHourEntryCompleted = (date) => {
    return dateStatuses[date]?.hourEntryCompleted || false;
  };

  // Debug: Log when rule2Available changes
  useEffect(() => {
    const debugRule2Availability = async () => {
      if (datesList.length > 0 && selectedUser) {
        console.log('🔍 Rule-2 Debug Info:');
        console.log('   - Total dates:', datesList.length);
        console.log('   - Checking Rule-2 availability per date based on chronological position (thisIndex >= 4)');
        console.log('   - Dates list:', datesList);
        
        // Check DataService for each date
        for (const [idx, date] of datesList.entries()) {
          const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
          const thisIndex = sortedDates.indexOf(date);
          const rule2AvailableForDate = thisIndex >= 4;
          const excelExists = await dataService.hasExcelData(selectedUser, date);
          const hourEntryExists = await dataService.hasHourEntry(selectedUser, date);
          console.log(`   - Date ${idx + 1} (${date}): chronoIndex=${thisIndex}, Rule2Available=${rule2AvailableForDate}, Excel=${excelExists}, HourEntry=${hourEntryExists}`);
        }
      }
    };
    
    debugRule2Availability();
  }, [datesList, selectedUser]);

  // Debug: Log current data state
  useEffect(() => {
    const debugCurrentData = async () => {
      if (selectedUser) {
        console.log('🔍 DEBUG: Current user data state for', selectedUser);
        
        // Check what dates we have
        const userDates = await dataService.getDates(selectedUser);
        console.log('📅 Available dates:', userDates);
        
        // Check data for each date
        for (const date of userDates) {
          const excelData = await dataService.getExcelData(selectedUser, date);
          const hourData = await dataService.getHourEntry(selectedUser, date);
          
          console.log(`📊 Data for ${date}:`, {
            hasExcel: !!excelData,
            hasHour: !!hourData,
            excelSets: excelData?.data?.sets ? Object.keys(excelData.data.sets) : [],
            hourPlanets: hourData?.planetSelections ? Object.keys(hourData.planetSelections) : []
          });
        }
      }
    };
    
    debugCurrentData();
  }, [selectedUser]);

  // Conditional render for Rule1Page
  if (showRule1Page && rule1PageData) {
    return (
      <Rule1Page
        key={`rule1-${selectedUser}-${datesList.length}-${JSON.stringify(datesList)}`}
        date={rule1PageData.date}
        selectedUser={rule1PageData.selectedUser}
        selectedUserData={selectedUserData}
        datesList={datesList}
        users={rule1PageData.users}
        onBack={handleBackFromRule1}
      />
    );
  }

  // Conditional render for Rule2Page
  if (showRule2Page && rule2PageData) {
    return (
      <Rule2CompactPage
        key={`rule2-${selectedUser}-${datesList.length}-${JSON.stringify(datesList)}`}
        date={rule2PageData.date}
        selectedUser={rule2PageData.selectedUser}
        datesList={datesList}
        onBack={handleBackFromRule2}
        activeHR={rule2PageData.activeHR}
      />
    );
  }

  // Conditional render for IndexPage
  if (showIndexPage && indexPageData) {
    return (
      <IndexPage
        key={`index-${selectedUser}-${datesList.length}-${JSON.stringify(datesList)}`}
        date={indexPageData.date}
        selectedUser={indexPageData.selectedUser}
        datesList={datesList}  // Pass current datesList state instead of stored one
        onBack={handleBackFromIndex}
        onExtractNumbers={handleExtractNumbers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ABCD BCD Number</h1>
              {selectedUserData ? (
                <div className="text-sm text-purple-800">
                  <p>✅ User: {selectedUserData.username}</p>
                  <p>🏠 HR Numbers: {selectedUserData.hr}</p>
                  <p>📅 Dates: {datesList.length}</p>
                  {cacheStats && (
                    <p>🚀 Cache: {cacheStats.provider} {cacheStats.available ? '✅' : '❌'}</p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  <p>⚠️ No user data found</p>
                  {cacheStats && (
                    <p>🚀 Cache: {cacheStats.provider} {cacheStats.available ? '✅' : '❌'}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {cacheStats && (
                <button
                  onClick={async () => {
                    await dataService.clearAllCache();
                    await loadCacheStats();
                    setSuccess('Cache cleared successfully');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs"
                  title="Clear all cache"
                >
                  🧹 Cache
                </button>
              )}
              <button
                onClick={() => setShowAddDateModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg"
              >
                Add Date
              </button>
              <Link to="/" className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg">
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Date List - Compact Design */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📅 Dates List</h3>
          
          {datesList.length > 0 ? (
            <div className="space-y-2">
              {datesList.map((date, idx) => {
                // Sort dates chronologically to get proper indices
                const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
                const thisIndex = sortedDates.indexOf(date); // Zero-based index in sorted order
                
                const canDelete = datesList.length === 1 || idx === 0 || idx === datesList.length - 1;
                const excelUploaded = isExcelUploaded(date);
                const hourEntryCompleted = isHourEntryCompleted(date);
                // Rule-1 available only for dates that are chronologically 5th or later (thisIndex >= 4)
                const rule1Available = thisIndex >= 4;
                // Rule-1 is enabled for ANY date that is 5th or later chronologically
                // (not just the newest date)
                const rule1Enabled = rule1Available;
                // Rule-2 available only for dates that are chronologically 5th or later (thisIndex >= 4)
                const rule2Available = thisIndex >= 4;
                
                return (
                  <div
                    key={date}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                      selectedDate === date 
                        ? 'bg-purple-50 border-purple-300 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {/* Date Display - Compact */}
                    <div 
                      className="cursor-pointer min-w-[120px]" 
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="font-bold text-blue-700 text-base">
                        {new Date(date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Action Buttons - Compact Design */}
                    <div className="flex gap-1.5 flex-wrap">
                      
                      {/* Excel Upload Button */}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleDateExcelUpload(e, date)}
                          className="hidden"
                          id={`excel-upload-${date}`}
                        />
                        <label
                          htmlFor={`excel-upload-${date}`}
                          className={`px-2 py-1 text-xs font-medium rounded cursor-pointer transition-all ${
                            excelUploaded
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                          }`}
                        >
                          📊 Excel
                          {excelUploaded ? ' ✓' : ''}
                        </label>
                      </div>

                      {/* Hour Entry Button */}
                      <button
                        onClick={() => handleHourEntryClick(date)}
                        disabled={false}
                        className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                          hourEntryCompleted
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Hour Entry
                        {hourEntryCompleted ? ' ✓' : ''}
                      </button>

                      {/* Index Button */}
                      <button
                        onClick={() => handleIndexClick(date)}
                        disabled={false}
                        className="px-2 py-1 text-xs font-medium rounded transition-all bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Index
                      </button>

                      {/* Rule-1 button: available only for dates that are chronologically 5th or later (thisIndex >= 4) */}
                      {rule1Available && (
                        <button
                          onClick={() => rule1Enabled ? handleRule1Click(date) : null}
                          disabled={!rule1Enabled}
                          className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                            rule1Enabled
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={rule1Enabled ? 'Rule-1 Analysis - 4-day rolling window' : 'Rule-1 disabled - requires at least 5 total dates'}
                        >
                          Rule-1
                        </button>
                      )}

                      {/* Rule-2 button: available only for dates that are chronologically 5th or later (thisIndex >= 4) */}
                      {rule2Available && (
                        <button
                          onClick={() => handleRule2Click(date)}
                          className="px-2 py-1 text-xs font-medium rounded bg-purple-500 text-white hover:bg-purple-600"
                        >
                          Rule-2
                        </button>
                      )}

                      {/* Planets Analysis button: available for all dates */}
                      <button
                        onClick={() => handlePlanetsAnalysisClick(date)}
                        className="px-2 py-1 text-xs font-medium rounded bg-cyan-500 text-white hover:bg-cyan-600"
                        title="Planets Analysis - Target data (left) vs Planets data (right)"
                      >
                        Planets
                      </button>

                      {/* DELETE BUTTON: only enabled for the oldest (index=0) or newest (index=last) */}
                      {(() => {
                        // 1) Build an ascending‐sorted copy so we know oldest→newest
                        const sortedAsc = [...datesList].sort((a, b) => new Date(a) - new Date(b));
                        // 2) Find this date's position in that ascending array
                        const thisIndex = sortedAsc.indexOf(date);
                        // 3) The last index is "newest"
                        const lastIndex = sortedAsc.length - 1;
                        // 4) Only allow delete if thisIndex is 0 (oldest) or lastIndex (newest)
                        const canDelete = thisIndex === 0 || thisIndex === lastIndex;

                        return (
                          <button
                            onClick={() => {
                              if (!canDelete) return; // do nothing if disabled
                              const confirmMsg = `Are you sure you want to delete ${new Date(date).toLocaleDateString()}? This action cannot be undone.`;
                              if (window.confirm(confirmMsg)) {
                                handleRemoveDate(date);
                              }
                            }}
                            disabled={!canDelete}
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              canDelete
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Delete
                          </button>
                        );
                      })()}
                    </div>

                    {/* Status Indicators - Compact */}
                    <div className="ml-auto flex flex-col gap-0.5">
                      <div className={`text-xs px-1.5 py-0.5 rounded ${
                        excelUploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {excelUploaded ? '📊 Excel ✓' : '📊 No Excel'}
                      </div>
                      <div className={`text-xs px-1.5 py-0.5 rounded ${
                        hourEntryCompleted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hourEntryCompleted ? '🕐 Hour ✓' : '🕐 Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-semibold mb-1">No dates added yet</h3>
              <p className="text-sm">Click "Add Date" to start your astrological analysis</p>
            </div>
          )}
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-3 py-2 rounded mb-4">
            {success}
          </div>
        )}

        {/* Add Date Modal */}
        <AddDateModal
          visible={showAddDateModal}
          onClose={() => {
            setShowAddDateModal(false);
            setNewDate('');
            setDateError('');
          }}
          onSubmit={handleAddDate}
          newDate={newDate}
          setNewDate={setNewDate}
          dateError={dateError}
          datesList={datesList}
        />

        {/* Hour Entry Modal - NOW WITH CLICK-OUTSIDE-TO-CLOSE */}
        <HourEntryModal
          show={showHourEntryModal}
          onClose={() => {
            setShowHourEntryModal(false);
            setHourEntryError('');
          }}
          hourEntryDate={hourEntryDate}
          datesList={datesList}
          hourEntryPlanetSelections={hourEntryPlanetSelections}
          setHourEntryPlanetSelections={setHourEntryPlanetSelections}
          hourEntryError={hourEntryError}
          handleHourEntryPlanetChange={handleHourEntryPlanetChange}
          handleSaveHourEntry={handleSaveHourEntry}
          selectedUserData={selectedUserData}
          planets={planets}
        />
      </div>
    </div>
  );
}

export default ABCDBCDNumber;

