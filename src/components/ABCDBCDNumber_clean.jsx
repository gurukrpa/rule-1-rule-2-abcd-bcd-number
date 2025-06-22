// src/components/ABCDBCDNumber.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import IndexPage from './IndexPage';
import Rule1Page from './Rule1Page';
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
  const [showRule1Page, setShowRule1Page] = useState(false);
  const [rule1PageData, setRule1PageData] = useState(null);
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
      console.log('🔄 [ABCDBCDNumber] loadUserDates called for user:', uid);
      
      // Check deletion flag before loading dates
      const deletionFlag = localStorage.getItem(`abcd_user_deleted_all_${uid}`);
      console.log('🏁 [ABCDBCDNumber] Deletion flag check:', deletionFlag);
      
      const dates = await dataService.getDates(uid);
      console.log('📅 [ABCDBCDNumber] Dates received from DataService:', dates);
      
      if (dates && dates.length > 0) {
        const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
        console.log('✅ [ABCDBCDNumber] Setting dates list:', sorted);
        setDatesList(sorted);
        setSelectedDate(sorted[0]);
        return;
      }
      
      console.log('📭 [ABCDBCDNumber] No dates found, setting empty list');
      setDatesList([]);
      setSelectedDate('');
    } catch (e) {
      console.error('❌ [ABCDBCDNumber] Error loading user dates:', e);
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
      
      // Clear deletion flag when user adds a new date (re-enable sample data creation for future)
      localStorage.removeItem(`abcd_user_deleted_all_${selectedUser}`);
      console.log('🔄 [ABCDBCDNumber] Cleared deletion flag - user added new date');
      
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
    
    if (selectedDate === dateToRemove) {
      if (updated.length > 0) setSelectedDate(updated[0]);
      else setSelectedDate('');
    }
    
    // ✅ 1. Delete all data related to this date
    console.log('🗑️ [ABCDBCDNumber] Deleting date:', dateToRemove);
    await dataService.deleteDataForDate(selectedUser, dateToRemove);
    
    // ✅ 2. Save updated date list WITHOUT the deleted date
    console.log('💾 [ABCDBCDNumber] Saving updated dates list:', updated);
    await saveDatesToLocalStorage(selectedUser, updated);
    
    // ✅ 2.5. Set deletion flag if all dates are deleted
    if (updated.length === 0) {
      localStorage.setItem(`abcd_user_deleted_all_${selectedUser}`, 'true');
      console.log('🗑️ [ABCDBCDNumber] Set deletion flag - all dates deleted');
    }
    
    // ✅ 3. Reload the list from source of truth
    console.log('🔄 [ABCDBCDNumber] Reloading dates from source of truth');
    await loadUserDates(selectedUser);
    
    // ✅ 4. Clear status and verify cleanup
    setDateStatuses(prev => {
      const newStatus = { ...prev };
      delete newStatus[dateToRemove];
      return newStatus;
    });
    
    console.log('✅ Deleted data and updated saved dates:', updated);
    
    const label = dateToRemove === first ? 'Newest' : 'Oldest';
    setSuccess(`${label} date ${new Date(dateToRemove).toLocaleDateString()} removed.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Comprehensive ABCD Excel validation function
  const validateABCDExcelStructure = (worksheet) => {
    console.log('🔍 Starting comprehensive ABCD Excel validation...');
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const errors = [];
    const warnings = [];
    
    // Expected structure
    const expectedTopics = 30;
    const expectedElements = [
      'as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'
    ];
    const expectedPlanetsPerElement = 9; // Columns B-J (1-9)
    
    let topicsFound = 0;
    let currentTopicRow = -1;
    let elementsInCurrentTopic = 0;
    let totalDataCells = 0;
    let missingCells = [];
    
    // Analyze each row
    for (let row = 0; row <= range.e.r; row++) {
      const firstCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const firstCellValue = firstCell ? String(firstCell.v).trim() : '';
      
      // Check for topic headers (D-x Set-y Matrix)
      if (firstCellValue.includes('Matrix') && firstCellValue.match(/D-\d+.*Set-\d+.*Matrix/i)) {
        // Validate previous topic completion
        if (currentTopicRow >= 0 && elementsInCurrentTopic !== expectedElements.length) {
          errors.push(`Topic at row ${currentTopicRow + 1} is incomplete: found ${elementsInCurrentTopic}/${expectedElements.length} elements`);
        }
        
        topicsFound++;
        currentTopicRow = row;
        elementsInCurrentTopic = 0;
        console.log(`📊 Found topic ${topicsFound}: ${firstCellValue} at row ${row + 1}`);
        continue;
      }
      
      // Skip planet header rows (containing just "x" or planet names)
      if (currentTopicRow >= 0 && (
        firstCellValue.toLowerCase() === 'x' ||
        ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']
          .some(planet => firstCellValue.toLowerCase().includes(planet)))) {
        console.log(`🪐 Skipping planet header row: ${firstCellValue}`);
        continue;
      }
      
      // Check for element rows within topics
      if (currentTopicRow >= 0 && firstCellValue.length <= 3 && firstCellValue.match(/^[a-z]+$/i)) {
        const elementCode = firstCellValue.toLowerCase();
        
        // Validate element is expected
        if (!expectedElements.includes(elementCode)) {
          errors.push(`Row ${row + 1}: Invalid element code "${elementCode}". Expected one of: ${expectedElements.join(', ')}`);
          continue;
        }
        
        // Check element order
        const expectedElement = expectedElements[elementsInCurrentTopic];
        if (elementCode !== expectedElement) {
          warnings.push(`Row ${row + 1}: Element "${elementCode}" out of expected order. Expected "${expectedElement}"`);
        }
        
        elementsInCurrentTopic++;
        
        // Validate planet data in columns B-J (indices 1-9)
        let planetDataCount = 0;
        for (let col = 1; col <= 9; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          
          if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== '') {
            const cellValue = String(cell.v).trim();
            
            // Validate planet data format (should contain astrological data)
            if (!cellValue.match(/[a-z]+-\d+/i)) {
              errors.push(`Row ${row + 1}, Column ${String.fromCharCode(66 + col - 1)}: Invalid planet data format for element "${elementCode}". Expected format like "as-7-/su-(...)", found: "${cellValue}"`);
            } else {
              planetDataCount++;
              totalDataCells++;
            }
          } else {
            missingCells.push({
              row: row + 1,
              col: col + 1,
              element: elementCode,
              address: cellAddress
            });
          }
        }
        
        // Check if element has all required planet data
        if (planetDataCount < expectedPlanetsPerElement) {
          errors.push(`Row ${row + 1}: Element "${elementCode}" missing planet data. Found ${planetDataCount}/${expectedPlanetsPerElement} planets`);
        }
      }
    }
    
    // Final validation checks
    if (topicsFound < expectedTopics) {
      errors.push(`Insufficient topics found. Expected ${expectedTopics}, found ${topicsFound}`);
    }
    
    // Check total data cells (should be close to 3030 for complete file)
    const expectedTotalCells = expectedTopics * expectedElements.length * expectedPlanetsPerElement;
    if (totalDataCells < expectedTotalCells * 0.95) { // Allow 5% tolerance
      errors.push(`Insufficient data cells. Expected ~${expectedTotalCells}, found ${totalDataCells}`);
    }
    
    // Log results
    console.log('📊 ABCD Excel Validation Results:');
    console.log(`   - Topics found: ${topicsFound}/${expectedTopics}`);
    console.log(`   - Total data cells: ${totalDataCells}`);
    console.log(`   - Missing cells: ${missingCells.length}`);
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('❌ Validation Errors:', errors);
    }
    if (warnings.length > 0) {
      console.log('⚠️ Validation Warnings:', warnings);
    }
    
    // Return validation result
    const isValid = errors.length === 0;
    return {
      isValid,
      errors,
      warnings,
      topicsFound,
      totalDataCells,
      missingCells: missingCells.slice(0, 50), // Limit to first 50 missing cells
      summary: `Found ${topicsFound} topics with ${totalDataCells} data cells. ${missingCells.length} cells missing.`
    };
  };

  // Helper function to format validation errors for user-friendly display
  const formatValidationErrors = (validationResult) => {
    const { errors, warnings, topicsFound, totalDataCells, missingCells } = validationResult;
    
    if (errors.length === 0) return null;
    
    let message = '❌ Excel File Validation Failed\n\n';
    
    // Categorize errors
    const topicErrors = errors.filter(e => e.includes('Topic') || e.includes('Matrix'));
    const elementErrors = errors.filter(e => e.includes('element') || e.includes('order'));
    const dataErrors = errors.filter(e => e.includes('Missing') || e.includes('planet data'));
    const structureErrors = errors.filter(e => e.includes('Insufficient'));
    
    // Add summary
    message += `📊 Summary:\n`;
    message += `   • Topics found: ${topicsFound}/30\n`;
    message += `   • Data cells: ${totalDataCells}\n`;
    message += `   • Missing cells: ${missingCells.length}\n\n`;
    
    // Add most critical errors first
    if (structureErrors.length > 0) {
      message += `🏗️ Critical Issues:\n`;
      structureErrors.forEach(error => message += `   • ${error}\n`);
      message += '\n';
    }
    
    if (topicErrors.length > 0) {
      message += `🏷️ Topic Issues (${topicErrors.length}):\n`;
      topicErrors.slice(0, 2).forEach(error => message += `   • ${error}\n`);
      if (topicErrors.length > 2) message += `   • ...and ${topicErrors.length - 2} more\n`;
      message += '\n';
    }
    
    if (dataErrors.length > 0) {
      message += `📋 Missing Data (${dataErrors.length} issues):\n`;
      dataErrors.slice(0, 3).forEach(error => message += `   • ${error}\n`);
      if (dataErrors.length > 3) message += `   • ...and ${dataErrors.length - 3} more\n`;
      message += '\n';
    }
    
    // Add helpful suggestions
    message += `💡 Requirements:\n`;
    message += `   • 30 topics with "D-x Set-y Matrix" headers\n`;
    message += `   • 9 elements per topic: as, mo, hl, gl, vig, var, sl, pp, in\n`;
    message += `   • Planet data in columns B-J for each element\n`;
    message += `   • Approximately 3030 total data cells\n`;
    
    return message;
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

          // Validate Excel structure for ABCD format
          console.log('🔍 Validating ABCD Excel structure...');
          const validationResult = validateABCDExcelStructure(worksheet);
          
          if (!validationResult.isValid) {
            // Format errors for better user experience
            const formattedMessage = formatValidationErrors(validationResult);
            throw new Error(formattedMessage || `Excel validation failed with ${validationResult.errors.length} errors.`);
          }
          
          // Show validation summary
          console.log('✅ Excel validation passed:', validationResult.summary);
          if (validationResult.warnings.length > 0) {
            console.log('⚠️ Validation warnings:', validationResult.warnings);
          }

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

  // ... additional functions would continue here
  // For now I'll just add the essential functions and the component return

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">ABCD BCD Analysis System</h1>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
            {error}
          </div>
        )}
        
        {/* Success Display */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select User</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} (HR: {user.hr})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Management */}
          {selectedUser && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Dates</h2>
                <button
                  onClick={() => setShowAddDateModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Date
                </button>
              </div>
              
              {datesList.length > 0 ? (
                <div className="space-y-2">
                  {datesList.map(date => (
                    <div key={date} className="flex items-center justify-between p-2 border rounded">
                      <span className={`${selectedDate === date ? 'font-bold text-blue-600' : ''}`}>
                        {new Date(date).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => handleDateExcelUpload(e, date)}
                          className="hidden"
                          id={`excel-${date}`}
                        />
                        <label
                          htmlFor={`excel-${date}`}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-green-600"
                        >
                          Upload Excel
                        </label>
                        <button
                          onClick={() => handleRemoveDate(date)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No dates available. Add a date to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddDateModal && (
          <AddDateModal
            isOpen={showAddDateModal}
            onClose={() => setShowAddDateModal(false)}
            onSubmit={handleAddDate}
            newDate={newDate}
            setNewDate={setNewDate}
            error={dateError}
          />
        )}
      </div>
    </div>
  );
}

export default ABCDBCDNumber;
