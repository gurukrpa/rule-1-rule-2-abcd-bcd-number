// src/components/ABCDBCDNumber.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import IndexPage from './IndexPage';
import Rule2Page from './Rule2Page';
import Rule2CompactPage from './Rule2CompactPage';
import AddDateModal from './modals/AddDateModal';
import HourEntryModal from './modals/HourEntryModal';
import { DataService } from '../services/dataService';

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
  
  // Initialize DataService for localStorage fallback during migration
  const dataService = new DataService();
  
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
  const [showIndexPage, setShowIndexPage] = useState(false);
  const [indexPageData, setIndexPageData] = useState(null);
  const [showRule2Page, setShowRule2Page] = useState(false);
  const [rule2PageData, setRule2PageData] = useState(null);
  const [dateStatuses, setDateStatuses] = useState({}); // Track Excel/Hour Entry status for each date

  // Fetch users from Supabase or localStorage
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: supabaseUsers, error: supabaseError } = await supabase
        .from('users')
        .select('*');

      let processedUsers = [];
      if (!supabaseError && supabaseUsers && supabaseUsers.length > 0) {
        processedUsers = supabaseUsers.map(user => ({
          ...user,
          id: String(user.id),
          hr: Number(user.hr) || 1
        }));
      } else {
        // Fallback to localStorage - still needed for user data as DataService focuses on dates/excel/hour entries
        let stored = localStorage.getItem('abcd_users_data');
        if (stored) {
          try {
            processedUsers = JSON.parse(stored).map(u => ({
              ...u,
              id: String(u.id),
              hr: Number(u.hr) || 1
            }));
          } catch {
            processedUsers = [];
          }
        }
        if (!Array.isArray(processedUsers) || processedUsers.length === 0) {
          processedUsers = [
            { id: '1', username: 'Test User 1', hr: 3 },
            { id: '2', username: 'Test User 2', hr: 4 },
            { id: '3', username: 'Test User 3', hr: 5 }
          ];
          localStorage.setItem('abcd_users_data', JSON.stringify(processedUsers));
        }
      }
      setUsers(processedUsers);
      setError('');
    } catch (err) {
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
      const dates = await dataService.getDates(uid);
      if (dates && dates.length > 0) {
        const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
        setDatesList(sorted);
        setSelectedDate(sorted[0]);
        return;
      }
      setDatesList([]);
      setSelectedDate('');
    } catch (e) {
      console.error('Error loading user dates:', e);
      setDatesList([]);
      setSelectedDate('');
    }
  };

  const saveDatesToLocalStorage = async (uid, dates) => {
    try {
      await dataService.saveDates(uid, dates);
    } catch (e) {
      console.error('Error saving dates:', e);
    }
  };

  // Add new date
  const handleAddDate = () => {
    if (!newDate) {
      setDateError('Please select a date.');
      return;
    }
    
    if (!selectedUser) {
      setDateError('Please select a user first.');
      return;
    }
    
    try {
      const iso = new Date(newDate).toISOString().split('T')[0];
      const normalized = datesList.map(d => new Date(d).toISOString().split('T')[0]);
      
      if (normalized.includes(iso)) {
        setDateError('This date already exists.');
        return;
      }
      
      let updated = [...datesList, iso].sort((a, b) => new Date(b) - new Date(a));
      
      setDatesList(updated);
      setSelectedDate(iso);
      saveDatesToLocalStorage(selectedUser, updated);
      setNewDate('');
      setDateError('');
      setShowAddDateModal(false);
      
      setSuccess(`Date ${new Date(iso).toLocaleDateString()} added successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setDateError('An error occurred. Try again.');
    }
  };

  // Remove date
  const handleRemoveDate = async (dateToRemove) => {
    if (datesList.length <= 1) {
      const updated = datesList.filter(d => d !== dateToRemove);
      setDatesList(updated);
      await saveDatesToLocalStorage(selectedUser, updated);
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
    
    const updated = datesList.filter(d => d !== dateToRemove);
    setDatesList(updated);
    await saveDatesToLocalStorage(selectedUser, updated);
    
    if (selectedDate === dateToRemove) {
      if (updated.length > 0) setSelectedDate(updated[0]);
      else setSelectedDate('');
    }
    
    // Use DataService to delete all data for this date
    await dataService.deleteDataForDate(selectedUser, dateToRemove);
    
    // Remove the date from dateStatuses
    setDateStatuses(prev => {
      const updated = { ...prev };
      delete updated[dateToRemove];
      return updated;
    });
    
    const label = dateToRemove === first ? 'Newest' : 'Oldest';
    setSuccess(`${label} date ${new Date(dateToRemove).toLocaleDateString()} removed.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle Excel upload for specific date
  const handleDateExcelUpload = async (event, targetDate) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const processedData = processSingleDayExcel(jsonData, targetDate);
          
          // Use DataService to save Excel data
          await dataService.saveExcelData(selectedUser, targetDate, {
            date: targetDate,
            fileName: file.name,
            data: processedData,
            uploadedAt: new Date().toISOString()
          });
          
          // Update date status for this specific date
          const excelUploaded = await dataService.hasExcelData(selectedUser, targetDate);
          const hourEntryCompleted = await dataService.hasHourEntry(selectedUser, targetDate);
          setDateStatuses(prev => ({
            ...prev,
            [targetDate]: {
              excelUploaded,
              hourEntryCompleted
            }
          }));
          
          setSuccess(`Excel uploaded successfully for ${new Date(targetDate).toLocaleDateString()}`);
          setTimeout(() => setSuccess(''), 3000);
          
          setDatesList([...datesList]);
          
        } catch (error) {
          setError(`Failed to process Excel file: ${error.message}`);
          setTimeout(() => setError(''), 5000);
        }
      };

      reader.readAsArrayBuffer(file);
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
    if (!excelData) {
      setError('Upload Excel file for this date first.');
      return;
    }
    
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
      setDateStatuses(prev => ({
        ...prev,
        [hourEntryDate]: {
          excelUploaded,
          hourEntryCompleted
        }
      }));
      
      setShowHourEntryModal(false);
      setSuccess(`Hour entry saved for ${new Date(hourEntryDate).toLocaleDateString()}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setHourEntryError('Failed to save. Try again.');
    }
  };

  // Index page navigation - Updated for planet-based Excel structure
  const handleIndexClick = async (date) => {
    console.log('🔥 handleIndexClick called with date:', date);
    console.log('🔥 Current datesList:', datesList);
    
    if (!selectedUser) {
      setError('Please select a user first.');
      return;
    }
    
    // Check if Excel and Hour Entry data exist using DataService
    const excelData = await dataService.getExcelData(selectedUser, date);
    const hourEntryData = await dataService.getHourEntry(selectedUser, date);
    
    if (!excelData) {
      setError('Upload Excel file for this date first.');
      return;
    }
    
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
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  <p>⚠️ No user data found</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
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

        {/* Date List */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">📅 Dates List</h3>
          
          {datesList.length > 0 ? (
            <div className="space-y-3">
              {datesList.map((date, idx) => {
                // Sort dates chronologically to get proper indices
                const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
                const thisIndex = sortedDates.indexOf(date); // Zero-based index in sorted order
                
                const canDelete = datesList.length === 1 || idx === 0 || idx === datesList.length - 1;
                const isNewest = idx === 0;
                const isOldest = idx === datesList.length - 1;
                const excelUploaded = isExcelUploaded(date);
                const hourEntryCompleted = isHourEntryCompleted(date);
                // Rule-2 available only for dates that are chronologically 5th or later (thisIndex >= 4)
                const rule2Available = thisIndex >= 4;
                
                return (
                  <div
                    key={date}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedDate === date 
                        ? 'bg-purple-50 border-purple-300 shadow-md' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {/* Date Display */}
                    <div 
                      className="cursor-pointer min-w-[140px]" 
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="font-bold text-blue-700 text-lg">
                        {new Date(date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {isNewest && datesList.length > 1 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Newest
                          </span>
                        )}
                        {isOldest && datesList.length > 1 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Oldest
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      
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
                          className={`px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                            excelUploaded
                              ? 'bg-green-100 text-green-800 border-2 border-green-300'
                              : 'bg-purple-100 text-purple-800 border-2 border-purple-300 hover:bg-purple-200'
                          }`}
                        >
                          📊 Excel
                          {excelUploaded ? ' ✓' : ''}
                        </label>
                      </div>

                      {/* Hour Entry Button */}
                      <button
                        onClick={() => handleHourEntryClick(date)}
                        disabled={!excelUploaded}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          !excelUploaded
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : hourEntryCompleted
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Hour Entry
                        {hourEntryCompleted ? ' ✓' : ''}
                      </button>

                      {/* Index Button */}
                      <button
                        onClick={() => handleIndexClick(date)}
                        disabled={!excelUploaded || !hourEntryCompleted}
                        className={`px-4 py-1 rounded transition-all ${
                          !excelUploaded || !hourEntryCompleted
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        Index
                      </button>

                      {/* Rule-2 button: available only for dates that are chronologically 5th or later (thisIndex >= 4) */}
                      {rule2Available && (
                        <button
                          onClick={() => handleRule2Click(date)}
                          className="px-4 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                        >
                          Rule-2
                        </button>
                      )}

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
                            className={`px-4 py-1 rounded ${
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

                    {/* Status Indicators */}
                    <div className="ml-auto flex flex-col gap-1">
                      <div className={`text-xs px-2 py-1 rounded ${
                        excelUploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {excelUploaded ? '📊 Excel ✓' : '📊 No Excel'}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        hourEntryCompleted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hourEntryCompleted ? '🕐 Hour Entry ✓' : '🕐 Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No dates added yet</h3>
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

        {/* Hour Entry Modal */}
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
