// src/components/PlanetsAnalysisPage.jsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
// Removed unused fallbacks for Supabase-only mode

function PlanetsAnalysisPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  // Simple state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planetsData, setPlanetsData] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  
  // User information state
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Hour tab functionality
  const [selectedHour, setSelectedHour] = useState(1);
  const [hourTabsData, setHourTabsData] = useState({});
  const [hourSwitchLoading, setHourSwitchLoading] = useState(false);
  
  // Database ABCD/BCD analysis data
  const [databaseTopicNumbers, setDatabaseTopicNumbers] = useState(null);
  const [databaseLoading, setDatabaseLoading] = useState(false);
  const [realAnalysisData, setRealAnalysisData] = useState(null);
  const [dataSource, setDataSource] = useState('loading');
  
  // ❌ REMOVED: No manual clicking state needed - all data comes from Rule-1 sync
  // const [clickedNumbersByTopic, setClickedNumbersByTopic] = useState({});
  
  // ✅ LOCAL CLICK STATE: For local highlighting in PlanetsAnalysis page
  const [localClickedNumbers, setLocalClickedNumbers] = useState({}); // {topicName: Set<number>}
  
  // ✅ Cross-page sync state - sync clicked numbers from Rule-1 page
  const [rule1SyncData, setRule1SyncData] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Load user information if userId is provided
  useEffect(() => {
    const loadUserInfo = async () => {
      if (userId) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, hr, days')
            .eq('id', userId)
            .single();

          if (userError) throw userError;
          setUserInfo(userData);
        } catch (err) {
          console.error('Error loading user info:', err);
          // Use fallback user info
          setUserInfo({
            id: userId,
            username: 'Unknown User',
            hr: 'N/A'
          });
        }
      }
    };

    // Extract date from URL query params
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');
    console.log('🔍 [PlanetsAnalysis] URL date extraction:');
    console.log('  Full URL:', window.location.href);
    console.log('  Search params:', location.search);
    console.log('  All params:', Object.fromEntries(urlParams.entries()));
    console.log('  Extracted dateParam:', dateParam);
    console.log('  dateParam type:', typeof dateParam);
    console.log('  Current selectedDate state:', selectedDate);
    console.log('  Provided userId:', userId);
    
    if (dateParam) {
      console.log('  ✅ Setting selectedDate to:', dateParam);
      setSelectedDate(dateParam);
    } else {
      console.log('  ❌ No date parameter found in URL');
      console.log('  💡 Expected URL format: /planets-analysis/{userId}?date=2025-07-07');
    }

    loadUserInfo();
  }, [userId, location.search]);

  // Load ABCD/BCD numbers when component mounts or user changes
  useEffect(() => {
    if (userId && userInfo) {
      console.log('🔄 [PlanetsAnalysis] Triggering data load - userId:', userId, 'selectedDate:', selectedDate);
      loadAllAvailableData();
    }
  }, [userId, userInfo, selectedDate]); // Added selectedDate to dependencies

  // Set default hour when user info is loaded
  useEffect(() => {
    if (userInfo && userInfo.hr && selectedHour > userInfo.hr) {
      setSelectedHour(1);
    }
  }, [userInfo]);

  // Force re-render when hour or analysis data changes (for planet headers)
  useEffect(() => {
    if (realAnalysisData && selectedHour) {
      console.log(`🔄 [PlanetsAnalysis] Hour/Data change detected - HR ${selectedHour}`);
      console.log(`🔄 [PlanetsAnalysis] Current realAnalysisData source: ${realAnalysisData.source}`);
      
      // Log real analysis data status for monitoring
      console.log('✅ [PlanetsAnalysis] Real analysis data updated for HR switching');
      
      // Basic topic validation check
      if (realAnalysisData.topicNumbers) {
        const topicCount = Object.keys(realAnalysisData.topicNumbers).length;
        console.log(`📊 [PlanetsAnalysis] Real analysis data contains ${topicCount} topics`);
      }
      
      // Log specific D-1 Set-1 data for verification
      if (realAnalysisData.topicNumbers && realAnalysisData.topicNumbers['D-1 Set-1 Matrix']) {
        const d1set1 = realAnalysisData.topicNumbers['D-1 Set-1 Matrix'];
        console.log(`🔄 [PlanetsAnalysis] Effect - D-1 Set-1 Matrix HR ${selectedHour}:`, d1set1);
      }
    }
  }, [selectedHour, realAnalysisData]);

  // Load Rule-1 sync data when component mounts or sync settings change
  useEffect(() => {
    if (userId && syncEnabled) {
      console.log('🔄 [PlanetsAnalysis] Triggering Rule-1 sync data load');
      loadRule1SyncData();
    }
  }, [userId, syncEnabled, selectedDate]); // Reload when date changes too

  // DEBUG: Log sync data changes
  useEffect(() => {
    if (rule1SyncData) {
      console.log('🎯 [DEBUG] Rule1SyncData updated:', rule1SyncData);
      console.log('🎯 [DEBUG] Selected date:', selectedDate);
      if (rule1SyncData[selectedDate]) {
        console.log('🎯 [DEBUG] Data for selected date:', rule1SyncData[selectedDate]);
        Object.keys(rule1SyncData[selectedDate]).forEach(topic => {
          const data = rule1SyncData[selectedDate][topic];
          console.log(`🎯 [DEBUG] ${topic}:`, data);
          if (topic.includes('D-1 Set-1')) {
            console.log(`🔍 [FOCUS] D-1 Set-1 clicked numbers:`, data.clickedNumbers);
            console.log(`🔍 [FOCUS] D-1 Set-1 ABCD numbers:`, data.abcdNumbers);
            console.log(`🔍 [FOCUS] D-1 Set-1 BCD numbers:`, data.bcdNumbers);
          }
        });
      } else {
        console.log('❌ [DEBUG] No data found for selected date:', selectedDate);
        console.log('🔍 [DEBUG] Available dates:', Object.keys(rule1SyncData));
      }
    }
  }, [rule1SyncData, selectedDate]);

  // Cross-page sync for bi-directional unclicking
  useEffect(() => {
    // Listen for Rule1 unclick events
    const handleRule1Unclick = (event) => {
      // 🔍 DEBUG: Log all incoming cross-page events
      if (event.data?.type?.startsWith('rule1-') || event.data?.type?.startsWith('planet-analysis-')) {
        console.log(`🔍 [CrossPageSync] Received event:`, {
          type: event.data.type,
          clickData: event.data.clickData,
          currentUserId: userId,
          selectedDate,
          selectedHour
        });
      }

      if (event.data?.type === 'rule1-unclick' && event.data?.clickData) {
        const { topicName, number, userId: eventUserId, dateKey, hour } = event.data.clickData;
        
        // Only process if it's for the same user
        if (eventUserId === userId) {
          console.log(`🔄 [PlanetsAnalysis] Processing unclick from Rule1: ${number} from ${topicName} (${dateKey}, ${hour})`);
          
          // 🔍 DEBUG: Check current state before update
          console.log(`🔍 [CrossPageSync] Before unclick - LocalClickedNumbers:`, localClickedNumbers[topicName]);
          console.log(`🔍 [CrossPageSync] Before unclick - Rule1SyncData:`, rule1SyncData?.[selectedDate]?.[topicName]);
          
          // Update local clicked numbers state to unclick the number
          setLocalClickedNumbers(prev => {
            const newState = { ...prev };
            if (newState[topicName]) {
              const currentNumbers = [...newState[topicName]];
              const numberIndex = currentNumbers.indexOf(number);
              if (numberIndex > -1) {
                newState[topicName] = currentNumbers.filter(n => n !== number);
                console.log(`➖ [PlanetsAnalysis] Cross-page unclick: ${number} from ${topicName}`);
              }
            }
            // 🔍 DEBUG: Log new state after unclick
            console.log(`🔍 [CrossPageSync] After unclick - LocalClickedNumbers:`, newState[topicName]);
            return newState;
          });

          // Also update rule1SyncData to ensure UI consistency
          setRule1SyncData(prev => {
            if (!prev || !prev[selectedDate] || !prev[selectedDate][topicName]) return prev;
            const newState = { ...prev };
            const topicData = { ...newState[selectedDate][topicName] };
            topicData.clickedNumbers = topicData.clickedNumbers.filter(n => n !== number);
            newState[selectedDate] = { ...newState[selectedDate], [topicName]: topicData };
            console.log(`🔍 [CrossPageSync] Updated Rule1SyncData after unclick:`, topicData.clickedNumbers);
            return newState;
          });
        }
      }

      // Listen for Rule1 click events
      if (event.data?.type === 'rule1-click' && event.data?.clickData) {
        const { topicName, number, userId: eventUserId, dateKey, hour } = event.data.clickData;
        
        // Only process if it's for the same user
        if (eventUserId === userId) {
          console.log(`🔄 [PlanetsAnalysis] Processing click from Rule1: ${number} to ${topicName} (${dateKey}, ${hour})`);
          
          // 🔍 DEBUG: Check current state before update
          console.log(`🔍 [CrossPageSync] Before click - LocalClickedNumbers:`, localClickedNumbers[topicName]);
          console.log(`🔍 [CrossPageSync] Before click - Rule1SyncData:`, rule1SyncData?.[selectedDate]?.[topicName]);
          
          // Update local clicked numbers state to click the number
          setLocalClickedNumbers(prev => {
            const newState = { ...prev };
            const currentNumbers = newState[topicName] || [];
            if (!currentNumbers.includes(number)) {
              newState[topicName] = [...currentNumbers, number];
              console.log(`➕ [PlanetsAnalysis] Cross-page click: ${number} to ${topicName}`);
            }
            // 🔍 DEBUG: Log new state after click
            console.log(`🔍 [CrossPageSync] After click - LocalClickedNumbers:`, newState[topicName]);
            return newState;
          });

          // Also update rule1SyncData to ensure UI consistency
          setRule1SyncData(prev => {
            if (!prev) {
              const newState = { [selectedDate]: { [topicName]: { clickedNumbers: [number], abcdNumbers: [], bcdNumbers: [] } } };
              console.log(`🔍 [CrossPageSync] Created new Rule1SyncData after click:`, newState);
              return newState;
            }
            const newState = { ...prev };
            if (!newState[selectedDate]) newState[selectedDate] = {};
            if (!newState[selectedDate][topicName]) newState[selectedDate][topicName] = { clickedNumbers: [], abcdNumbers: [], bcdNumbers: [] };
            
            const topicData = { ...newState[selectedDate][topicName] };
            if (!topicData.clickedNumbers.includes(number)) {
              topicData.clickedNumbers = [...topicData.clickedNumbers, number];
            }
            newState[selectedDate] = { ...newState[selectedDate], [topicName]: topicData };
            console.log(`🔍 [CrossPageSync] Updated Rule1SyncData after click:`, topicData.clickedNumbers);
            return newState;
          });
        }
      }
    };

    // Add window message listener for cross-page communication
    window.addEventListener('message', handleRule1Unclick);
    
    return () => {
      window.removeEventListener('message', handleRule1Unclick);
    };
  }, [userId]);

  // Load ABCD/BCD numbers from Supabase only
  const loadAllAvailableData = async () => {
    try {
      setDatabaseLoading(true);
      setError('');
      setDataSource('supabase-only');
      
      console.log('🔍 [PlanetsAnalysis] Loading ABCD/BCD numbers from Supabase only...');
      
      // Supabase-only fetch
      if (userId && selectedDate) {
        console.log(`� [PlanetsAnalysis] Fetching analysis from Supabase for user ${userId} on ${selectedDate}`);
        
        const { data, error } = await supabase
          .from('abcd_bcd_analysis_results')
          .select('*')
          .eq('user_id', userId)
          .eq('date', selectedDate)
          .maybeSingle();
          
        if (error || !data) {
          setError(`No analysis found in Supabase for ${userId} on ${selectedDate}.`);
          setDatabaseLoading(false);
          return;
        }
        
        // Process Supabase data
        const analysisData = {
          source: 'supabase',
          date: selectedDate,
          topicNumbers: data.topic_numbers || {},
          hrNumber: selectedHour,
          timestamp: data.created_at
        };
        
        setRealAnalysisData(analysisData);
        setSuccess(`✅ Loaded analysis data from Supabase for ${selectedDate}`);
        console.log('✅ [PlanetsAnalysis] Supabase data loaded:', analysisData);
      } else {
        setError('Missing userId or selectedDate for Supabase query.');
      }
      
    } catch (error) {
      console.error('❌ [PlanetsAnalysis] Supabase error:', error);
      setError(`Failed to load analysis from Supabase: ${error.message}`);
    } finally {
      setDatabaseLoading(false);
    }
  };

  // Load Rule-1 sync data for cross-page number box synchronization
  const loadRule1SyncData = async () => {
    console.log('🔄 [PlanetsAnalysis] loadRule1SyncData called - SUPABASE-ONLY MODE');
    
    if (!userId || !syncEnabled) {
      console.log('🔄 [PlanetsAnalysis] Sync disabled or no userId:', { userId, syncEnabled });
      return;
    }

    try {
      setSyncLoading(true);
      console.log('🔄 [PlanetsAnalysis] Loading data from Supabase only...');

      // For Supabase-only implementation, we don't need cross-page sync
      // Data will be loaded through the main loadAllAvailableData function
      console.log('📊 [PlanetsAnalysis] Supabase-only mode - skipping cross-page sync');
      
      setRule1SyncData(null); // Clear any previous sync data
      setLastSyncTime(new Date());
      console.log('✅ [PlanetsAnalysis] Supabase-only sync completed');
    } catch (error) {
      console.error('❌ [PlanetsAnalysis] Error in Supabase-only sync:', error);
      setError(`Supabase-only sync error: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // Get ABCD/BCD numbers for a specific topic - prioritize real analysis data
  const getTopicNumbers = (setName) => {
    // Priority 1: Real analysis data (from Supabase)
    if (realAnalysisData && realAnalysisData.topicNumbers) {
      // Try exact match first
      let realNumbers = realAnalysisData.topicNumbers[setName];
      if (realNumbers && (realNumbers.abcd.length > 0 || realNumbers.bcd.length > 0)) {
        return realNumbers;
      }
      // Try variations
      const topicVariations = [
        setName,
        setName.replace(' Matrix', ''),
        setName + ' Matrix',
        setName.replace(/\s*Matrix\s*/g, '').trim()
      ];
      for (const variation of topicVariations) {
        if (variation !== setName) {
          realNumbers = realAnalysisData.topicNumbers[variation];
          if (realNumbers && (realNumbers.abcd.length > 0 || realNumbers.bcd.length > 0)) {
            return realNumbers;
          }
        }
      }
    }
    // No fallback, only real data
    return { abcd: [], bcd: [] };
  };

  // Normalize topic names to handle variations like "D-3 (trd) Set-1" → "D-3 Set-1 Matrix"
  const normalizeTopicName = (setName) => {
    if (!setName || typeof setName !== 'string') return setName;
    
    // Remove annotations in parentheses: "D-3 (trd) Set-1" → "D-3 Set-1"
    let normalized = setName.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    
    // Add "Matrix" suffix if not present
    if (!normalized.includes('Matrix')) {
      normalized += ' Matrix';
    }
    
    // Clean up extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    console.log(`🔄 [TopicNormalize] "${setName}" → "${normalized}"`);
    return normalized;
  };

  // Enhanced getTopicNumbers with strict normalization: always use normalized name for lookup
  const getTopicNumbersWithNormalization = (setName) => {
    // Always normalize the topic name for lookup
    const normalizedName = normalizeTopicName(setName);
    let result = getTopicNumbers(normalizedName);
    if (result.abcd.length > 0 || result.bcd.length > 0) {
      return result;
    }
    // If still no match, try original and fallback variations
    result = getTopicNumbers(setName);
    if (result.abcd.length > 0 || result.bcd.length > 0) {
      return result;
    }
    // Try common variations as last resort
    const variations = [
      setName.replace(/\s*\([^)]*\)\s*/g, ' ').trim() + ' Matrix',
      setName.replace(/\s*\([^)]*\)\s*/g, ' ').replace('Set-', 'Set-').trim() + ' Matrix',
      setName.replace(/\s*\([^)]*\)\s*/g, '').trim() + ' Matrix'
    ];
    for (const variation of variations) {
      const cleanVariation = variation.replace(/\s+/g, ' ').trim();
      if (cleanVariation !== setName && cleanVariation !== normalizedName) {
        result = getTopicNumbers(cleanVariation);
        if (result.abcd.length > 0 || result.bcd.length > 0) {
          return result;
        }
      }
    }
    // No match found
    return { abcd: [], bcd: [] };
  };

  // Extract number from planet data for ABCD/BCD analysis
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)/);
    return match ? Number(match[1]) : null;
  };

  // Extract complete element-number-sign format from planet data
  const extractElementFormat = (rawString) => {
    if (!rawString || typeof rawString !== 'string') return null;
    
    // Pattern: as-9-/ju-(22 Li 53)-(00 Ge 11) → as-9-Li
    // Extract the first zodiac sign mentioned in parentheses
    const match = rawString.match(/^([a-z]+-\d+)-\/[a-z]+-\(\d+\s+([A-Za-z]+)/);
    if (match) {
      const [, elementNumber, sign] = match;
      return `${elementNumber}-${sign}`;
    }
    
    // Fallback: if it's already in the desired format
    if (rawString.match(/^[a-z]+-\d+-[A-Za-z]+$/)) {
      return rawString;
    }
    
    // Another fallback: extract just element-number if no sign found
    const basicMatch = rawString.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return rawString;
  };

  // Extract all numbers for each planet in a specific topic
  const getTopicPlanetNumbers = (setName) => {
    if (!planetsData?.sets?.[setName]) return {};
    
    const planetNumbers = {
      'Su': [], 'Mo': [], 'Ma': [], 'Me': [], 'Ju': [],
      'Ve': [], 'Sa': [], 'Ra': [], 'Ke': []
    };
    
    const setData = planetsData.sets[setName];
    
    // Go through each element in this topic
    Object.values(setData).forEach(elementData => {
      // Go through each planet's data
      Object.entries(elementData).forEach(([planet, rawData]) => {
        if (planetNumbers[planet] !== undefined) {
          const number = extractElementNumber(rawData);
          if (number !== null && !planetNumbers[planet].includes(number)) {
            planetNumbers[planet].push(number);
          }
        }
      });
    });
    
    // Sort numbers for each planet
    Object.keys(planetNumbers).forEach(planet => {
      planetNumbers[planet].sort((a, b) => a - b);
    });
    
    return planetNumbers;
  };

  // Format planet data to show element-number-sign format
  const formatPlanetData = (rawString) => {
    if (!rawString) return '—';
    
    // Use the new extraction method to get element-number-sign format
    const extracted = extractElementFormat(rawString);
    if (extracted) {
      return extracted;
    }
    
    // Fallback: try the old pattern matching
    // Pattern: as-7/su-(12 Sc 50)-(20 Ta 50) → as-7-Sc
    let match = rawString.match(/^([a-z]+-\d+)\/[a-z]+-\((\d+)\s+([A-Za-z]+)/);
    if (match) {
      const [, element, , sign] = match;
      return `${element}-${sign}`;
    }
    
    // Simple format already formatted
    if (rawString.match(/^[a-z]+-\d+-[A-Za-z]+$/)) {
      return rawString;
    }
    
    // Fallback: extract basic element-number pattern
    const basicMatch = rawString.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return rawString;
  };

  // Render ABCD/BCD badges based on database numbers
  const renderABCDBadges = (rawData, setName) => {
    const extractedNumber = extractElementNumber(rawData);
    if (!extractedNumber && extractedNumber !== 0) return null;
    
    // Get numbers from database or fallback WITH NORMALIZATION
    const { abcd, bcd } = getTopicNumbersWithNormalization(setName);
    
    // Check ABCD first (priority)
    if (abcd.includes(extractedNumber)) {
      return (
        <span className="bg-green-200 text-green-800 px-1 py-0.5 rounded text-xs font-medium">
          A
        </span>
      );
    }
    
    // Check BCD
    if (bcd.includes(extractedNumber)) {
      return (
        <span className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded text-xs font-medium">
          B
        </span>
      );
    }
    
    return null;
  };

  // Excel processing logic
  const processSingleDayExcel = (rows) => {
    const result = { sets: {} };
    
    // Planet mapping for columns
    const planetMapping = {
      1: 'Su', 2: 'Mo', 3: 'Ma', 4: 'Me', 5: 'Ju',
      6: 'Ve', 7: 'Sa', 8: 'Ra', 9: 'Ke'
    };
    
    // Element name mapping
    const elementNames = {
      'as': 'Lagna', 'mo': 'Moon', 'hl': 'Hora Lagna', 'gl': 'Ghati Lagna',
      'vig': 'Vighati Lagna', 'var': 'Varnada Lagna', 'sl': 'Sree Lagna',
      'pp': 'Pranapada Lagna', 'in': 'Indu Lagna'
    };
    
    let currentSet = null;
    let currentSetData = {};
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      
      const firstCell = String(row[0] || '').trim();
      
      // Detect set headers (D-x Set-y Matrix)
      if (firstCell.includes('Matrix') && (firstCell.includes('D-') || firstCell.includes('Set-'))) {
        // Save previous set if exists
        if (currentSet && Object.keys(currentSetData).length > 0) {
          result.sets[currentSet] = { ...currentSetData };
        }
        currentSet = firstCell;
        currentSetData = {};
        continue;
      }
      
      // Process element rows
      if (currentSet && firstCell && firstCell.length <= 3) {
        const elementCode = firstCell.toLowerCase();
        
        if (elementNames[elementCode]) {
          const elementData = {};
          
          // Extract planet data from columns B-J (indices 1-9)
          for (let col = 1; col <= 9; col++) {
            const planetCode = planetMapping[col];
            const cellValue = row[col];
            
            if (cellValue && cellValue.toString().trim()) {
              elementData[planetCode] = cellValue.toString().trim();
            }
          }
          
          if (Object.keys(elementData).length > 0) {
            currentSetData[elementNames[elementCode]] = elementData;
          }
        }
      }
    }
    
    // Save the last set
    if (currentSet && Object.keys(currentSetData).length > 0) {
      result.sets[currentSet] = { ...currentSetData };
    }
    
    return result;
  };

  // Handle Excel upload
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Process the Excel data
          const processedData = processSingleDayExcel(jsonData);
          
          if (Object.keys(processedData.sets).length === 0) {
            throw new Error('No valid data found in Excel file');
          }
          
          setPlanetsData(processedData);
          setSelectedTopics(new Set()); // Reset topic selection
          setSuccess(`✅ Excel uploaded successfully! Found ${Object.keys(processedData.sets).length} topics.`);
          
        } catch (error) {
          console.error('Excel processing error:', error);
          setError(`Failed to process Excel file: ${error.message}`);
        }
      };
      
      reader.readAsArrayBuffer(file);
      event.target.value = null;
    } catch (error) {
      setError(`Failed to upload file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Natural sorting function for topic names (D-1, D-3, D-10, etc.)
  // ✅ FIXED: Now handles annotated topic names like "D-3 (trd) Set-1 Matrix"
  const naturalTopicSort = (topics) => {
    return topics.sort((a, b) => {
      // Extract the numeric part from "D-X" pattern (supports annotations)
      const extractNumber = (topic) => {
        // Enhanced pattern: D-NUMBER with optional annotations like (trd), (pv), (sh), (Trd)
        const match = topic.match(/D-(\d+)(?:\s*\([^)]*\))?/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      // Extract set number (Set-1 vs Set-2)
      const extractSetNumber = (topic) => {
        const match = topic.match(/Set-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      const numA = extractNumber(a);
      const numB = extractNumber(b);
      
      // First sort by the D-number
      if (numA !== numB) {
        return numA - numB;
      }
      
      // If D-numbers are equal, sort by Set number
      const setA = extractSetNumber(a);
      const setB = extractSetNumber(b);
      
      if (setA !== setB) {
        return setA - setB;
      }
      
      // If both D-number and Set number are equal, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Topic management functions
  const availableTopics = planetsData ? naturalTopicSort(Object.keys(planetsData.sets)) : [];
  // Bulk select/deselect for Set-1 and Set-2
  const handleBulkSetToggle = (setNumber) => {
    const setTopics = availableTopics.filter(topic => topic.includes(`Set-${setNumber}`));
    const allSelected = setTopics.every(topic => selectedTopics.has(topic));
    const newSelectedTopics = new Set(selectedTopics);
    if (allSelected) {
      setTopics.forEach(topic => newSelectedTopics.delete(topic));
    } else {
      setTopics.forEach(topic => newSelectedTopics.add(topic));
    }
    setSelectedTopics(newSelectedTopics);
  };

  const getTopicsForDisplay = () => {
    if (selectedTopics.size === 0) {
      return availableTopics;
    }
    return naturalTopicSort(Array.from(selectedTopics));
  };

  const formatSetName = (setName) => {
    return setName.replace(/\s+Matrix$/i, '');
  };

  const handleTopicToggle = (topic) => {
    const newSelectedTopics = new Set(selectedTopics);
    if (selectedTopics.has(topic)) {
      newSelectedTopics.delete(topic);
    } else {
      newSelectedTopics.add(topic);
    }
    setSelectedTopics(newSelectedTopics);
  };

  const handleSelectAll = () => {
    setSelectedTopics(new Set(availableTopics));
  };

  const handleClearAll = () => {
    setSelectedTopics(new Set());
  };

  // Handle hour tab change
  const handleHourChange = async (hourNumber) => {
    console.log(`🕐 [PlanetsAnalysis] Switching to Hour ${hourNumber}...`);
    
    // Show loading state
    setHourSwitchLoading(true);
    
    // Small delay to show the visual indicator
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setSelectedHour(hourNumber);
    
    // Update real analysis data for the selected hour
    if (hourTabsData[hourNumber]) {
      setRealAnalysisData(hourTabsData[hourNumber]);
      console.log(`✅ [PlanetsAnalysis] Hour ${hourNumber} data loaded:`, hourTabsData[hourNumber]);
      
      // Log specific D-1 Set-1 data for the new hour to verify it's different
      if (hourTabsData[hourNumber].topicNumbers && hourTabsData[hourNumber].topicNumbers['D-1 Set-1 Matrix']) {
        const d1set1NewHour = hourTabsData[hourNumber].topicNumbers['D-1 Set-1 Matrix'];
        console.log(`🎯 [PlanetsAnalysis] D-1 Set-1 Matrix for HR ${hourNumber}:`, d1set1NewHour);
        console.log(`🎯 [PlanetsAnalysis] ABCD: [${d1set1NewHour.abcd.join(',')}], BCD: [${d1set1NewHour.bcd.join(',')}]`);
      }
      
      // Force UI update by updating success message to reflect current hour
      setSuccess(`✅ Now viewing Hour ${hourNumber} - ABCD/BCD data updated`);
      
      // Log specific topic verification for the new hour
      if (hourTabsData[hourNumber].topicNumbers) {
        const topicCount = Object.keys(hourTabsData[hourNumber].topicNumbers).length;
        console.log(`🎯 [PlanetsAnalysis] Hour ${hourNumber} has ${topicCount} topics with ABCD/BCD data`);
        
        // Show sample topic data for verification
        const sampleTopic = Object.keys(hourTabsData[hourNumber].topicNumbers)[0];
        if (sampleTopic) {
          const sampleData = hourTabsData[hourNumber].topicNumbers[sampleTopic];
          console.log(`📊 [Sample] ${sampleTopic} (HR ${hourNumber}):`, sampleData);
        }
      }
    } else {
      console.warn(`⚠️ [PlanetsAnalysis] No pre-loaded analysis data for Hour ${hourNumber}`);
      
      // 🔧 FIX: Don't clear realAnalysisData completely, instead set a placeholder that allows fallback
      // This ensures all hours can access database and hardcoded fallback data
      setRealAnalysisData({
        incomplete: true,
        source: `No specific data for HR ${hourNumber}`,
        topicNumbers: {},
        note: `Fallback mode - will use database or hardcoded TOPIC_NUMBERS data`
      });
      
      // Show informative message instead of error
      setSuccess(`📊 Hour ${hourNumber} selected - Using fallback ABCD/BCD data sources`);
      
      // Additional debugging information
      console.log(`🔍 [Debug] Available hours in hourTabsData:`, Object.keys(hourTabsData));
      console.log(`🔍 [Debug] User info HR count:`, userInfo?.hr);
      console.log(`🔍 [Debug] Requested hour:`, hourNumber);
      
      // Try to reload data for this hour if user info is available and hour is within user's range
      if (userInfo && userInfo.id && userInfo.hr >= hourNumber) {
        console.log(`🔄 [PlanetsAnalysis] Attempting to reload data for HR ${hourNumber}...`);
        loadAllAvailableData().catch(error => {
          console.error(`❌ [PlanetsAnalysis] Failed to reload data for HR ${hourNumber}:`, error);
        });
      } else {
        console.log(`ℹ️ [PlanetsAnalysis] HR ${hourNumber} is beyond user's configured range (${userInfo?.hr}) or user info unavailable`);
      }
    }
    
    // Hide loading state
    setTimeout(() => {
      setHourSwitchLoading(false);
    }, 500);
  };

  // Use a single, constant array for planet order everywhere
  const PLANET_CODES = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

  // ✅ ENABLED: Allow local clicking for highlighting on PlanetsAnalysis page
  // Local clicks for highlighting, synced numbers from Rule-1 page via cross-page sync
  const handleNumberBoxClick = (topicName, number) => {
    console.log(`🔢 [PlanetsAnalysis] Number ${number} clicked for ${topicName}`);

    // Check if number is a synced (orange) number from Rule-1
    let isSyncedNumber = false;
    if (syncEnabled && rule1SyncData && selectedDate) {
      const dateData = rule1SyncData[selectedDate];
      if (dateData && dateData[topicName] && dateData[topicName].clickedNumbers) {
        isSyncedNumber = dateData[topicName].clickedNumbers.includes(number);
      }
    }

    if (isSyncedNumber) {
      // Unclicking a synced number: remove from Rule-1 sync and send message
      console.log(`🟧 [PlanetsAnalysis] Unclicking synced (orange) number: ${number} for ${topicName}`);
      // Remove from localClickedNumbers for UI
      setLocalClickedNumbers(prev => {
        const newState = { ...prev };
        if (newState[topicName]) {
          newState[topicName] = newState[topicName].filter(n => n !== number);
        }
        return newState;
      });
      // Remove from rule1SyncData for UI (force update)
      if (rule1SyncData && selectedDate && rule1SyncData[selectedDate] && rule1SyncData[selectedDate][topicName]) {
        const updatedSyncData = { ...rule1SyncData };
        updatedSyncData[selectedDate] = { ...updatedSyncData[selectedDate] };
        updatedSyncData[selectedDate][topicName] = { ...updatedSyncData[selectedDate][topicName] };
        updatedSyncData[selectedDate][topicName].clickedNumbers = updatedSyncData[selectedDate][topicName].clickedNumbers.filter(n => n !== number);
        setRule1SyncData(updatedSyncData);
      }
      // Send cross-page message to Rule-1 to unclick
      window.postMessage({
        type: 'planet-analysis-unclick',
        clickData: { topicName, number, userId, dateKey: selectedDate, hour: `HR${selectedHour}` }
      }, '*');
      // Remove from database and trigger sync refresh
      if (window.cleanSupabaseService && userId && selectedDate) {
        window.cleanSupabaseService.deleteTopicClick(
          userId,
          topicName,
          selectedDate,
          `HR${selectedHour}`,
          number
        ).then(() => {
          if (window.crossPageSyncService) {
            window.crossPageSyncService.getAllClickedNumbers(userId).then(syncData => {
              if (window.setRule1SyncData) window.setRule1SyncData(syncData);
              if (window.forceUpdatePlanetsAnalysis) window.forceUpdatePlanetsAnalysis();
            });
          }
        }).catch(err => {
          console.error('[Unclick] deleteTopicClick failed:', err);
        });
      }
      return;
    }

    // Otherwise, handle local click/unclick as before
    setLocalClickedNumbers(prev => {
      const newState = { ...prev };
      if (!newState[topicName]) newState[topicName] = [];
      const currentNumbers = [...newState[topicName]];
      const numberIndex = currentNumbers.indexOf(number);

      if (numberIndex > -1) {
        // Remove the number (unclick)
        newState[topicName] = currentNumbers.filter(n => n !== number);
        console.log(`➖ [PlanetsAnalysis] Removed click: ${number} from ${topicName}`);

        if (window.cleanSupabaseService && userId && selectedDate) {
          window.cleanSupabaseService.deleteTopicClick(
            userId,
            topicName,
            selectedDate,
            `HR${selectedHour}`,
            number
          ).then(() => {
            window.postMessage({
              type: 'planet-analysis-unclick',
              clickData: { topicName, number, userId, dateKey: selectedDate, hour: `HR${selectedHour}` }
            }, '*');
            if (window.crossPageSyncService) {
              window.crossPageSyncService.getAllClickedNumbers(userId).then(syncData => {
                if (window.setRule1SyncData) window.setRule1SyncData(syncData);
                if (window.forceUpdatePlanetsAnalysis) window.forceUpdatePlanetsAnalysis();
              });
            }
          }).catch(err => {
            console.error('[Unclick] deleteTopicClick failed:', err);
          });
        }
      } else {
        // Add the number (click)
        newState[topicName] = [...currentNumbers, number];
        console.log(`➕ [PlanetsAnalysis] Added local click: ${number} to ${topicName}`);

        if (window.cleanSupabaseService && userId && selectedDate) {
          window.cleanSupabaseService.saveTopicClick(
            userId,
            topicName,
            selectedDate,
            `HR${selectedHour}`,
            number,
            true
          ).then(() => {
            window.postMessage({
              type: 'planet-analysis-click',
              clickData: { topicName, number, userId, dateKey: selectedDate, hour: `HR${selectedHour}` }
            }, '*');
            if (window.crossPageSyncService) {
              window.crossPageSyncService.getAllClickedNumbers(userId).then(syncData => {
                if (window.setRule1SyncData) window.setRule1SyncData(syncData);
              });
            }
          });
        }
      }
      return newState;
    });
  };

  // Check if a number is clicked for a specific topic
  const isNumberClicked = (topicName, number) => {
    // Check local clicks first (for local highlighting)
    if (localClickedNumbers[topicName] && localClickedNumbers[topicName].includes(number)) {
      console.log(`✅ Number ${number} was clicked locally for ${topicName}`);
      return true;
    }
    
    // ✅ Also check numbers that were clicked on Rule-1 page
    if (syncEnabled && rule1SyncData && selectedDate) {
      const dateData = rule1SyncData[selectedDate];
      if (dateData && dateData[topicName] && dateData[topicName].clickedNumbers) {
        const isClicked = dateData[topicName].clickedNumbers.includes(number);
        if (isClicked) {
          console.log(`✅ Number ${number} was clicked on Rule-1 page for ${topicName}`);
        }
        return isClicked;
      }
    }
    
    return false; // Not clicked locally or from Rule-1
  };

  // Render interactive number boxes (1-12) for a topic - DEPRECATED: Now using clickable ABCD/BCD numbers directly
  // const renderNumberBoxes = (topicName) => {
  //   const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  //   
  //   return (
  //     <div className="mt-2 space-y-1">
  //       <div className="text-xs font-semibold text-gray-600">Click numbers to highlight:</div>
  //       {/* Row 1: Numbers 1-6 */}
  //       <div className="flex gap-1 justify-center">
  //         {numbers.slice(0, 6).map(num => (
  //           <button
  //             key={num}
  //             onClick={() => handleNumberBoxClick(topicName, num)}
  //             className={`w-8 h-8 rounded text-xs font-bold border-2 transition-all duration-200 ${
  //               isNumberClicked(topicName, num)
  //                 ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-md transform scale-105'
  //                 : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
  //             }`}
  //           >
  //             {num}
  //           </button>
  //         ))}
  //       </div>
  //       {/* Row 2: Numbers 7-12 */}
  //       <div className="flex gap-1 justify-center">
  //         {numbers.slice(6, 12).map(num => (
  //           <button
  //             key={num}
  //             onClick={() => handleNumberBoxClick(topicName, num)}
  //             className={`w-8 h-8 rounded text-xs font-bold border-2 transition-all duration-200 ${
  //               isNumberClicked(topicName, num)
  //                 ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-md transform scale-105'
  //                 : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
  //             }`}
  //           >
  //             {num}
  //           </button>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // Check if a number should be displayed (only show clicked numbers from Rule-1)
  const shouldDisplayNumber = (topicName, rawData) => {
    if (!rawData) return false;
    const number = extractElementNumber(rawData);
    if (!number) return false;

    // 📊 DEBUG: Log display check
    console.log(`📊 [DisplayCheck] Checking ${topicName} number ${number}:`, {
      selectedDate,
      selectedHour,
      localClicked: localClickedNumbers[topicName]?.includes(number),
      syncDataExists: !!rule1SyncData?.[selectedDate]?.[topicName],
      syncClicked: rule1SyncData?.[selectedDate]?.[topicName]?.clickedNumbers?.includes(number)
    });

    // Check 1: Local clicks (manual clicks on planet page) - always display
    if (localClickedNumbers[topicName] && localClickedNumbers[topicName].includes(number)) {
      console.log(`✅ [DisplayCheck] Number ${number} displayed via local click`);
      return true;
    }

    // Check 2: Rule-1 sync clicks - only display if clicked in Rule-1
    if (syncEnabled && rule1SyncData && selectedDate) {
      const dateData = rule1SyncData[selectedDate];
      const topicVariations = [
        topicName,
        normalizeTopicName(topicName),
        topicName.replace(' Matrix', ''),
        topicName + ' Matrix'
      ];
      
      for (const variation of topicVariations) {
        if (dateData && dateData[variation]) {
          const syncData = dateData[variation];
          if (syncData.clickedNumbers && syncData.clickedNumbers.includes(number)) {
            // Additional check: ensure the hour matches or is compatible
            const syncHour = syncData.hour || 'HR1';
            const currentHour = `HR${selectedHour}`;
            if (syncHour === currentHour || syncHour === selectedHour.toString() || selectedHour === 1) {
              console.log(`✅ [DisplayCheck] Number ${number} displayed via Rule-1 sync (hour: ${syncHour} -> ${currentHour})`);
              return true;
            } else {
              console.log(`📊 [DisplayCheck] Number ${number} in sync data but hour mismatch: ${syncHour} vs ${currentHour}`);
            }
          }
        }
      }
    }
    
    console.log(`❌ [DisplayCheck] Number ${number} not displayed - not clicked in Rule-1`);
    return false;
  };

  // Check if a planet cell should be highlighted (if its number is clicked)
  const shouldHighlightPlanetCell = (topicName, rawData) => {
    if (!rawData) return { highlighted: false };
    const number = extractElementNumber(rawData);
    if (!number) return { highlighted: false };

    // 🔍 DEBUG: Log highlight check details
    console.log(`🔍 [HighlightCheck] Checking ${topicName} number ${number}:`, {
      selectedDate,
      selectedHour,
      localClicked: localClickedNumbers[topicName]?.includes(number),
      syncDataExists: !!rule1SyncData?.[selectedDate]?.[topicName],
      syncClicked: rule1SyncData?.[selectedDate]?.[topicName]?.clickedNumbers?.includes(number)
    });

    // Only highlight if number is in topic's ABCD or BCD for the current hour
    const { abcd, bcd } = getTopicNumbersWithNormalization(topicName);
    const isAbcd = abcd.includes(number);
    const isBcd = bcd.includes(number);
    if (!(isAbcd || isBcd)) {
      console.log(`🔍 [HighlightCheck] Number ${number} not in ABCD/BCD for ${topicName}`);
      return { highlighted: false };
    }

    // Check 1: Local clicks (manual clicks on planet page)
    if (localClickedNumbers[topicName] && localClickedNumbers[topicName].includes(number)) {
      console.log(`✅ [HighlightCheck] Number ${number} highlighted via local click`);
      return {
        highlighted: true,
        type: isAbcd ? 'ABCD' : isBcd ? 'BCD' : 'unknown',
        source: 'local-click',
        syncSource: 'local'
      };
    }

    // Check 2: Rule-1 sync clicks (only if number is clicked in Rule-1 for this topic and hour)
    let isSyncedFromRule1 = false;
    let syncSource = null;
    if (syncEnabled && rule1SyncData && selectedDate) {
      const dateData = rule1SyncData[selectedDate];
      const topicVariations = [
        topicName,
        normalizeTopicName(topicName),
        topicName.replace(' Matrix', ''),
        topicName + ' Matrix'
      ];
      let syncData = null;
      for (const variation of topicVariations) {
        if (dateData && dateData[variation]) {
          syncData = dateData[variation];
          break;
        }
      }
      if (syncData && syncData.clickedNumbers && syncData.clickedNumbers.includes(number)) {
        // Additional check: ensure the hour matches or is compatible
        const syncHour = syncData.hour || 'HR1';
        const currentHour = `HR${selectedHour}`;
        if (syncHour === currentHour || syncHour === selectedHour.toString() || selectedHour === 1) {
          isSyncedFromRule1 = true;
          syncSource = 'clicked';
          console.log(`✅ [HighlightCheck] Number ${number} highlighted via Rule-1 sync (hour: ${syncHour} -> ${currentHour})`);
        } else {
          console.log(`🔍 [HighlightCheck] Number ${number} in sync data but hour mismatch: ${syncHour} vs ${currentHour}`);
        }
      }
    }
    
    if (isSyncedFromRule1) {
      return {
        highlighted: true,
        type: isAbcd ? 'ABCD' : isBcd ? 'BCD' : 'unknown',
        source: 'rule1-sync',
        syncSource
      };
    }
    
    console.log(`❌ [HighlightCheck] Number ${number} not highlighted - not clicked anywhere`);
    return { highlighted: false };
  };
  
  // Get planet cell highlight styles based on Rule1Page colors
  const getPlanetCellHighlightStyle = (highlightInfo) => {
    if (!highlightInfo.highlighted) return {};
    
    // Base styles for ABCD and BCD
    let baseStyle = {};
    
    if (highlightInfo.type === 'ABCD') {
      baseStyle = {
        backgroundColor: '#FCE7C8',
        borderColor: '#F97316',
        color: '#8B4513',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      };
    } else if (highlightInfo.type === 'BCD') {
      baseStyle = {
        backgroundColor: '#41B3A2',
        borderColor: '#359486',
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        boxShadow: '0 4px 6px -1px rgba(65, 179, 162, 0.4), 0 2px 4px -1px rgba(65, 179, 162, 0.3)'
      };
    } else {
      // Fallback
      baseStyle = {
        backgroundColor: '#FCE7C8',
        borderColor: '#F97316',
        color: '#8B4513',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      };
    }
    
    // Modify styles for synced numbers from Rule-1
    if (highlightInfo.source === 'rule1-sync') {
      if (highlightInfo.type === 'ABCD') {
        baseStyle = {
          ...baseStyle,
          backgroundColor: '#E0F2FE', // Light blue background for synced ABCD
          borderColor: '#0EA5E9',     // Blue border
          color: '#0C4A6E',           // Dark blue text
          boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
      } else if (highlightInfo.type === 'BCD') {
        baseStyle = {
          ...baseStyle,
          backgroundColor: '#F0F9FF', // Very light blue for synced BCD
          borderColor: '#0EA5E9',
          color: '#0C4A6E',
          boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
      }
      
      // Add a distinctive pattern or gradient for synced numbers
      baseStyle.background = `linear-gradient(135deg, ${baseStyle.backgroundColor} 0%, ${baseStyle.backgroundColor} 80%, #E0F2FE 100%)`;
    }
    
    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-2 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">🔬 Planets Analysis</h1>
            </div>
            <div>
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                ← Back
              </button>
            </div>
          </div>
          <div className="mt-2">
            {userInfo ? (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <span className="text-sm">👤 User: <span className="font-semibold text-blue-700">{userInfo.username}</span></span>
                </div>
                <div className={`px-3 py-1 rounded-lg border ${userInfo.hr > 1 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <span className="text-sm">🕐 Hours: <span className={`font-semibold ${userInfo.hr > 1 ? 'text-green-700' : 'text-yellow-700'}`}>{userInfo.hr}</span></span>
                  {userInfo.hr > 1 && <span className="ml-1 text-xs text-green-600">(Hour tabs available)</span>}
                  {userInfo.hr === 1 && <span className="ml-1 text-xs text-yellow-600">(Single hour only)</span>}
                </div>
                {selectedDate && (
                  <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                    <span className="text-sm">📅 Clicked: <span className="font-semibold text-purple-700">{new Date(selectedDate).toLocaleDateString()}</span></span>
                    {realAnalysisData && realAnalysisData.analysisDate && realAnalysisData.analysisDate !== selectedDate && (
                      <span className="text-sm ml-2">🎯 Analysis: <span className="font-semibold text-green-700">{new Date(realAnalysisData.analysisDate).toLocaleDateString()}</span></span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Upload Excel file to see planets data with ABCD/BCD analysis</span>
              </div>
            )}
          </div>
        </div>

        {/* Rule-1 Sync Controls */}
        {false && userId && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-gray-800">📊 Rule-1 Sync</h3>
                
                {/* Sync Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncEnabled}
                    onChange={(e) => setSyncEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable sync</span>
                </label>

                {/* Sync Status */}
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  syncLoading 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : rule1SyncData && Object.keys(rule1SyncData).length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {syncLoading 
                    ? '⏳ Syncing...' 
                    : rule1SyncData && Object.keys(rule1SyncData).length > 0
                      ? `✅ ${Object.keys(rule1SyncData).length} topics synced`
                      : '⚫ No sync data'
                  }
                </div>

                {/* Last Sync Time */}
                {lastSyncTime && (
                  <div className="text-xs text-gray-500">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Manual Sync Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadRule1SyncData}
                  disabled={!syncEnabled || syncLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                >
                  {syncLoading ? '🔄' : '🔄'} Sync Now
                </button>
              </div>
            </div>

            {/* Sync Data Preview */}
            {rule1SyncData && Object.keys(rule1SyncData).length > 0 && selectedDate && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 font-medium mb-1">Synced from Rule-1 for {selectedDate}:</div>
                <div className="text-xs text-blue-600 space-y-1">
                  {rule1SyncData[selectedDate] ? (
                    Object.entries(rule1SyncData[selectedDate]).slice(0, 3).map(([topic, data]) => (
                      <div key={topic} className="flex items-center gap-2">
                        <span className="font-medium">{topic}:</span>
                        <span>
                          {data.clickedNumbers && data.clickedNumbers.length > 0 
                            ? `Clicked: ${data.clickedNumbers.join(', ')}`
                            : 'No clicks'
                          }
                        </span>
                        <span className="text-green-600">
                          | ABCD: {data.abcdNumbers?.length || 0} | BCD: {data.bcdNumbers?.length || 0}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No sync data for {selectedDate}</div>
                  )}
                  {rule1SyncData[selectedDate] && Object.keys(rule1SyncData[selectedDate]).length > 3 && (
                    <div className="text-blue-500">...and {Object.keys(rule1SyncData[selectedDate]).length - 3} more topics</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}



        {/* Hour Tabs with Visual Data Update Indicator */}
        {userInfo && userInfo.hr && userInfo.hr > 1 && (
          <div className="bg-white rounded-lg shadow-md p-2 mb-4">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-medium text-gray-700 mr-2">Hour:</span>
              
              {/* Visual Clock Indicator */}
              <div className="flex items-center mr-2">
                <div className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  hourSwitchLoading 
                    ? 'border-orange-400 bg-orange-100 animate-pulse' 
                    : realAnalysisData 
                      ? 'border-green-400 bg-green-100' 
                      : 'border-gray-300 bg-gray-100'
                }`}>
                  {/* Clock hands */}
                  <div className={`absolute top-1/2 left-1/2 w-1 h-2 bg-current transform -translate-x-1/2 -translate-y-full origin-bottom transition-all duration-300 ${
                    hourSwitchLoading 
                      ? 'text-orange-600 animate-spin' 
                      : realAnalysisData 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                  }`} style={{
                    transform: `translate(-50%, -100%) rotate(${selectedHour * 30 - 90}deg)`
                  }}></div>
                  <div className={`absolute top-1/2 left-1/2 w-0.5 h-1.5 bg-current transform -translate-x-1/2 -translate-y-full origin-bottom transition-all duration-300 ${
                    hourSwitchLoading 
                      ? 'text-orange-500 animate-spin' 
                      : realAnalysisData 
                        ? 'text-green-500' 
                        : 'text-gray-300'
                  }`} style={{
                    transform: `translate(-50%, -100%) rotate(${selectedHour * 6 - 90}deg)`
                  }}></div>
                  {/* Center dot */}
                  <div className={`absolute top-1/2 left-1/2 w-1 h-1 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    hourSwitchLoading 
                      ? 'bg-orange-500' 
                      : realAnalysisData 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                  }`}></div>
                  
                  {/* Loading indicator ring */}
                  {hourSwitchLoading && (
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin"></div>
                  )}
                </div>
                
                {/* Status text */}
                <span className={`ml-1 text-xs font-medium transition-all duration-300 ${
                  hourSwitchLoading 
                    ? 'text-orange-600' 
                    : realAnalysisData 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                }`}>
                  {hourSwitchLoading 
                    ? 'Updating...' 
                    : realAnalysisData 
                      ? `HR ${selectedHour}` 
                      : 'No Data'
                  }
                </span>
              </div>
              
              {Array.from({ length: userInfo.hr }, (_, i) => i + 1).map(hour => (
                <button
                  key={hour}
                  onClick={() => handleHourChange(hour)}
                  disabled={hourSwitchLoading}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    selectedHour === hour
                      ? 'bg-teal-500 text-white shadow-md' 
                      : hourSwitchLoading 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                  }`}
                >
                  HR {hour}
                  {hourTabsData[hour] && (
                    <span className="ml-1 text-xs">
                      {hourTabsData[hour].topicNumbers ? (
                        <span className="text-green-400">●</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </span>
                  )}
                </button>
              ))}
              
              {Object.keys(hourTabsData).length > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  📊 {Object.keys(hourTabsData).length}/{userInfo.hr} hours loaded
                </span>
              )}
              
              {/* Data freshness indicator */}
              {realAnalysisData && realAnalysisData.timestamp && !hourSwitchLoading && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  🕒 Updated: {new Date(realAnalysisData.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {/* Visual feedback bar */}
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${
                hourSwitchLoading 
                  ? 'bg-orange-400 animate-pulse' 
                  : realAnalysisData 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
              }`} style={{
                width: hourSwitchLoading 
                  ? '100%' 
                  : realAnalysisData 
                    ? `${(Object.keys(hourTabsData).length / userInfo.hr) * 100}%`
                    : '0%'
              }}></div>
            </div>
          </div>
        )}

        {/* Excel Upload & Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Upload Excel File:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={loading}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            {/* Automatic ABCD/BCD loading - no manual buttons needed */}
            <div className="text-xs text-gray-600 italic">
              ABCD/BCD data loads automatically for all hours when user information is available
            </div>
          </div>
          
          {/* Real Analysis Data Status - HIDDEN */}
          {false && realAnalysisData ? (
            <div className={`border-l-4 p-2 rounded text-xs mb-3 transition-all duration-300 ${
              hourSwitchLoading 
                ? 'bg-orange-50 border-orange-400' 
                : 'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-white px-1 py-0.5 rounded text-xs font-medium transition-all duration-300 ${
                  hourSwitchLoading ? 'bg-orange-600' : 'bg-green-600'
                }`}>
                  {hourSwitchLoading ? '🔄 UPDATING' : '🎯 REAL ANALYSIS'}
                </span>
                <span className={`font-medium text-xs transition-all duration-300 ${
                  hourSwitchLoading ? 'text-orange-700' : 'text-green-700'
                }`}>
                  {hourSwitchLoading ? 'Switching to HR data...' : 'Using actual Rule2 ABCD/BCD numbers'}
                </span>
                <span className={`text-white px-1 py-0.5 rounded text-xs font-medium ml-1 transition-all duration-300 ${
                  hourSwitchLoading ? 'bg-orange-500 animate-pulse' : 'bg-teal-500'
                }`}>
                  HR {selectedHour}
                </span>
                {userInfo && userInfo.hr > 1 && (
                  <span className={`text-white px-1 py-0.5 rounded text-xs font-medium ml-1 transition-all duration-300 ${
                    hourSwitchLoading ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {hourSwitchLoading ? '⏳ Loading' : '📊 Hour-Specific Data'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div><strong>Source:</strong> {realAnalysisData.source}</div>
                  <div><strong>Date:</strong> {realAnalysisData.analysisDate}</div>
                  <div><strong>Current Hour:</strong> HR {selectedHour}</div>
                </div>
                <div>
                  <div><strong>Topics:</strong> {realAnalysisData.totalTopics}</div>
                  <div><strong>ABCD:</strong> {Object.values(realAnalysisData.topicNumbers || {}).reduce((sum, topic) => sum + topic.abcd.length, 0)}</div>
                  <div><strong>BCD:</strong> {Object.values(realAnalysisData.topicNumbers || {}).reduce((sum, topic) => sum + topic.bcd.length, 0)}</div>
                </div>
              </div>
              {/* Topic verification for current hour - HIDDEN */}
              {false && realAnalysisData.topicNumbers && realAnalysisData.topicNumbers['D-1 Set-1 Matrix'] && (
                <div className="mt-1 p-1 bg-white rounded border text-xs">
                  <div className="font-medium text-green-800">🔍 D-1 Set-1 Verification (HR {selectedHour}):</div>
                  <div className="text-green-700">
                    <strong>ABCD:</strong> [{realAnalysisData.topicNumbers['D-1 Set-1 Matrix'].abcd.join(', ')}] | 
                    <strong> BCD:</strong> [{realAnalysisData.topicNumbers['D-1 Set-1 Matrix'].bcd.join(', ')}]
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Analysis Date: {new Date(realAnalysisData.analysisDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Database Analysis Summary - HIDDEN */}
          {false && databaseTopicNumbers && !realAnalysisData ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-2 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-medium">✓ DATABASE</span>
                <span className="text-green-700 font-medium text-xs">Using Supabase ABCD/BCD numbers</span>
              </div>
            </div>
          ) : false && !realAnalysisData ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="bg-yellow-500 text-white px-1 py-0.5 rounded text-xs font-medium">⚠ FALLBACK</span>
                <span className="text-yellow-700 font-medium text-xs">Using hardcoded ABCD/BCD numbers</span>
              </div>
              <div className="text-yellow-700 text-xs">
                <div><strong>Status:</strong> Real analysis data not available for HR {selectedHour}</div>
                <div><strong>Action:</strong> Click "🎯 All Hours" to load calculated data from Rule2CompactPage</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Topic Filter */}
        {planetsData && availableTopics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Filter Topics:</h3>
            </div>
            {/* Rule-1 style topic selector UI */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-gray-800">📊 Topic Selection</h3>
              <div className="flex gap-1">
                <button
                  onClick={handleSelectAll}
                  className="bg-green-300 hover:bg-green-400 text-green-800 px-1.5 py-0.5 rounded text-xs"
                >
                  All
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-300 hover:bg-red-400 text-red-800 px-1.5 py-0.5 rounded text-xs"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowTopicSelector(!showTopicSelector)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-1.5 py-0.5 rounded text-xs"
                >
                  {showTopicSelector ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {/* Combined Topics in 2 rows */}
            <div className="space-y-0.5">
              {/* Set-1 Topics Row */}
              <div className="flex flex-wrap gap-0.5 items-center">
                <button 
                  onClick={() => handleBulkSetToggle(1)}
                  className="text-xs font-medium text-blue-600 mr-1 hover:text-blue-800 hover:bg-blue-50 px-1 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to select/deselect all Set-1 topics"
                >
                  Set-1:
                </button>
                {availableTopics.filter(topic => topic.includes('Set-1')).map(topic => (
                  <label key={topic} className="flex items-center space-x-0.5 text-xs bg-blue-50 px-1 py-0.5 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(topic)}
                      onChange={() => handleTopicToggle(topic)}
                      className="rounded border-gray-300 w-2.5 h-2.5"
                    />
                    <span className="whitespace-nowrap text-xs">{formatSetName(topic)}</span>
                  </label>
                ))}
              </div>
              {/* Set-2 Topics Row */}
              <div className="flex flex-wrap gap-0.5 items-center">
                <button 
                  onClick={() => handleBulkSetToggle(2)}
                  className="text-xs font-medium text-green-600 mr-1 hover:text-green-800 hover:bg-green-50 px-1 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to select/deselect all Set-2 topics"
                >
                  Set-2:
                </button>
                {availableTopics.filter(topic => topic.includes('Set-2')).map(topic => (
                  <label key={topic} className="flex items-center space-x-0.5 text-xs bg-green-50 px-1 py-0.5 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(topic)}
                      onChange={() => handleTopicToggle(topic)}
                      className="rounded border-gray-300 w-2.5 h-2.5"
                    />
                    <span className="whitespace-nowrap text-xs">{formatSetName(topic)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {false && error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-2 py-1 rounded mb-3 text-xs">
            {error}
          </div>
        )}
        {false && success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-2 py-1 rounded mb-3 text-xs">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800" style={{display: 'none'}}>
              Planets Analysis Results
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600" style={{display: 'none'}}>Processing Excel file...</p>
            </div>
          ) : planetsData && planetsData.sets && Object.keys(planetsData.sets).length > 0 ? (
            <div className="space-y-4">
              {getTopicsForDisplay().map(setName => (
                <div key={setName} className="border rounded p-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 bg-gray-50 p-1 rounded flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {formatSetName(setName)}
                      {hourSwitchLoading && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-orange-600">Updating...</span>
                        </div>
                      )}
                    </span>
                    {userInfo && userInfo.hr > 1 && realAnalysisData && (
                      <span className={`text-xs px-2 py-0.5 rounded transition-all duration-300 ${
                        hourSwitchLoading 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-teal-100 text-teal-700'
                      }`} style={{display: 'none'}}>
                        {hourSwitchLoading ? '⏳ HR Data' : `HR ${selectedHour} Data`}
                      </span>
                    )}
                  </h4>
                  
                  {/* Clickable ABCD/BCD numbers row for this topic - click to highlight matching planets */}
                  {(() => {
                    // Get ABCD/BCD numbers for this topic (hour-specific if available)
                    const { abcd, bcd } = getTopicNumbersWithNormalization(setName);
                    if ((abcd?.length || 0) + (bcd?.length || 0) === 0) return null;
                    return (
                      <div className="mb-2 flex flex-wrap gap-4 items-center bg-blue-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-700 mr-1" style={{display: 'none'}}>ABCD:</span>
                          {abcd && abcd.length > 0 ? abcd.sort((a,b)=>a-b).map(num => (
                            <button
                              key={num}
                              onClick={() => handleNumberBoxClick(setName, num)}
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                                isNumberClicked(setName, num)
                                  ? 'shadow-md transform scale-105'
                                  : 'bg-green-200 text-green-900 border-green-300 hover:bg-green-300'
                              }`}
                              style={isNumberClicked(setName, num) 
                                ? { backgroundColor: '#FB923C', borderColor: '#F97316', color: 'white' }
                                : {}
                              }
                            >
                              {num}
                            </button>
                          )) : <span className="text-xs text-gray-400" style={{display: 'none'}}>None</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-700 mr-1" style={{display: 'none'}}>BCD:</span>
                          {bcd && bcd.length > 0 ? bcd.sort((a,b)=>a-b).map(num => (
                            <button
                              key={num}
                              onClick={() => handleNumberBoxClick(setName, num)}
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                                isNumberClicked(setName, num)
                                  ? 'shadow-md transform scale-105'
                                  : 'bg-blue-200 text-blue-900 border-blue-300 hover:bg-blue-300'
                              }`}
                              style={isNumberClicked(setName, num) 
                                ? { backgroundColor: '#41B3A2', borderColor: '#359486', color: 'white' }
                                : {}
                              }
                            >
                              {num}
                            </button>
                          )) : <span className="text-xs text-gray-400" style={{display: 'none'}}>None</span>}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Planet Count Box for D-1 Set-1: show up to 2 numbers per planet, representing count of topics where each planet is highlighted */}
                  {setName === 'D-1 Set-1 Matrix' && planetsData && (
                    <div className="mb-2 grid grid-cols-10 gap-1">
                      {/* Alignment box before Su */}
                      <div className="text-center"></div>
                      {PLANET_CODES.map(planetCode => {
                        // Count topics where this planet is highlighted (from cross-page sync OR manual clicks)
                        let highlightCount = 0;
                        let highlightTopics = [];
                        
                        // Go through all topics/sets in planetsData
                        Object.keys(planetsData.sets).forEach(topic => {
                          const topicData = planetsData.sets[topic];
                          
                          // Check if this planet is highlighted in any element of this topic
                          let planetHighlightedInTopic = false;
                          
                          Object.keys(topicData).forEach(elementName => {
                            const elementData = topicData[elementName];
                            if (elementData && elementData[planetCode]) {
                              const rawData = elementData[planetCode];
                              
                              // Check 1: Cross-page sync highlighting (from Rule 1 page)
                              const shouldHighlight = shouldHighlightPlanetCell(topic, rawData);
                              if (shouldHighlight.highlighted) {
                                planetHighlightedInTopic = true;
                              }
                              
                              // Check 2: Manual clicks on this specific topic
                              const number = extractElementNumber(rawData);
                              if (number && localClickedNumbers[topic] && Array.isArray(localClickedNumbers[topic]) && localClickedNumbers[topic].includes(number)) {
                                planetHighlightedInTopic = true;
                              }
                            }
                          });
                          
                          // If planet is highlighted in this topic (either way), count it once
                          if (planetHighlightedInTopic && !highlightTopics.includes(topic)) {
                            highlightCount++;
                            highlightTopics.push(topic);
                          }
                        });
                        
                        // Always show count box (remove dashes, show empty box if 0)
                        return (
                          <div key={planetCode} className="text-center">
                            <div className="inline-flex flex-col items-center justify-center">
                              <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded mb-0.5 text-xs font-bold min-w-[24px] min-h-[20px] flex items-center justify-center">
                                {highlightCount || ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Data Table */}
                  <div className="w-full overflow-x-auto">
                    <table className="w-full table-auto border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-1 py-1 font-semibold bg-gray-100 text-left w-16">
                            Element
                          </th>
                          {PLANET_CODES.map(planetCode => (
                            <th key={planetCode} className="border border-gray-300 px-1 py-1 font-semibold text-center bg-purple-100 w-16">
                              {planetCode}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Define correct element order
                          const orderedElementNames = [
                            'Lagna', 'Moon', 'Hora Lagna', 'Ghati Lagna',
                            'Vighati Lagna', 'Varnada Lagna', 'Sree Lagna',
                            'Pranapada Lagna', 'Indu Lagna'
                          ];
                          
                          const setData = planetsData.sets[setName] || {};
                          
                          return orderedElementNames
                            .filter(elementName => setData[elementName])
                            .map(elementName => {
                              const planetData = setData[elementName];
                              return (
                                <tr key={elementName} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-1 py-1 font-medium bg-gray-50 text-xs">
                                    {elementName}
                                  </td>
                                  {PLANET_CODES.map(planet => {
                                    const rawData = planetData[planet];
                                    const formattedData = formatPlanetData(rawData);
                                    
                                    // 🎯 FIXED: Only display if number is clicked in Rule-1 or locally
                                    const shouldDisplay = shouldDisplayNumber(setName, rawData);
                                    
                                    return (
                                      <td 
                                        key={planet} 
                                        className={`border border-gray-300 px-1 py-1 text-center transition-all duration-200 ${
                                          shouldHighlightPlanetCell(setName, rawData).highlighted 
                                            ? 'shadow-md' 
                                            : ''
                                        }`}
                                        style={getPlanetCellHighlightStyle(shouldHighlightPlanetCell(setName, rawData))}
                                      >
                                        {shouldDisplay && rawData ? (
                                          <div className="flex flex-col items-center gap-0.5">
                                            <span className={`font-mono text-gray-700 text-xs ${
                                              shouldHighlightPlanetCell(setName, rawData).highlighted 
                                                ? 'font-bold' 
                                                : ''
                                            }`}
                                              style={shouldHighlightPlanetCell(setName, rawData).highlighted 
                                                ? { color: getPlanetCellHighlightStyle(shouldHighlightPlanetCell(setName, rawData)).color }
                                                : {}
                                              }
                                            >
                                              {formattedData}
                                            </span>
                                            {renderABCDBadges(rawData, setName)}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400 text-xs">—</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600" style={{display: 'none'}}>No analysis results available. Please upload an Excel file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanetsAnalysisPage;
