// src/components/PlanetsAnalysisPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { abcdBcdDatabaseService } from '../services/abcdBcdDatabaseService';
import { PlanetsAnalysisDataService } from '../services/planetsAnalysisDataService';
import { DateValidationService } from '../services/dateValidationService.js';
import { DateManagementService } from '../utils/dateManagement.js';
import Logo from './Logo';

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

  // Load ABCD/BCD numbers from all available sources automatically
  const loadAllAvailableData = async () => {
    try {
      setDatabaseLoading(true);
      setError('');
      setDataSource('loading');
      
      console.log('🔍 [PlanetsAnalysis] Loading ABCD/BCD numbers from all sources...');
      
      // Strategy 1: Try to get real Rule2 analysis data using actual available dates
      try {
        if (userId) {
          console.log('📊 [PlanetsAnalysis] Attempting to fetch real Rule2 analysis data...');
          
          // 🔍 PRIORITY FIX: Try CleanFirebaseService FIRST (most reliable)
          let availableDates = [];
          console.log('🔍 [DEBUG] Loading dates - Priority 1: CleanFirebaseService');
          try {
            const { default: cleanFirebaseService, PAGE_CONTEXTS } = await import('../services/CleanFirebaseService.js');
            console.log('🔧 [PlanetsAnalysis] Attempting to load dates from CleanFirebaseService...');
            console.log('🔧 [PlanetsAnalysis] Using userId:', userId);
            console.log('🔧 [PlanetsAnalysis] Using PAGE_CONTEXTS.ABCD:', PAGE_CONTEXTS.ABCD);
            
            availableDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
            console.log('📅 [PlanetsAnalysis] CleanFirebaseService result:', availableDates);
            console.log('📅 [PlanetsAnalysis] Result type:', typeof availableDates);
            console.log('📅 [PlanetsAnalysis] Result length:', availableDates ? availableDates.length : 'null/undefined');
            
            if (availableDates && availableDates.length > 0) {
              console.log('✅ [PlanetsAnalysis] Successfully loaded dates from CleanFirebaseService');
              console.log('🔍 [PRIORITY DEBUG] All dates from CleanFirebaseService:', availableDates);
              console.log('🔍 [PRIORITY DEBUG] July 2025 dates available:', availableDates.filter(d => d.startsWith('2025-07')));
            } else {
              console.log('❌ [PlanetsAnalysis] CleanFirebaseService returned empty/null result');
              availableDates = []; // Ensure it's an array for the next check
            }
          } catch (e) {
            console.log('❌ [PlanetsAnalysis] CleanFirebaseService error:', e);
            console.log('❌ [PlanetsAnalysis] Error details:', e.message);
            console.log('❌ [PlanetsAnalysis] Error stack:', e.stack);
            availableDates = []; // Ensure it's an array for the next check
          }
          
          // Fallback to localStorage only if CleanFirebaseService failed
          if (availableDates.length === 0) {
            console.log('🔄 [DEBUG] CleanFirebaseService failed, falling back to localStorage');
            try {
              const storedDates = localStorage.getItem(`abcd_dates_${userId}`);
              if (storedDates) {
                availableDates = JSON.parse(storedDates);
                console.log('📅 [PlanetsAnalysis] Found dates in localStorage:', availableDates);
              } else {
                console.log('⚠️ [PlanetsAnalysis] No dates found in localStorage with key:', `abcd_dates_${userId}`);
                
                // 🔍 DEBUG: Check what localStorage keys exist for this user
                const allKeys = Object.keys(localStorage);
                const userKeys = allKeys.filter(key => key.includes(userId));
                console.log('🔍 [PlanetsAnalysis] Available localStorage keys for user:', userKeys);
                
                // Try common alternative key patterns
                const alternativeKeys = [
                  `abcd_dates_${userId}`,
                  `dates_${userId}`,
                  `user_dates_${userId}`,
                  `${userId}_dates`
                ];
                
                for (const key of alternativeKeys) {
                  const value = localStorage.getItem(key);
                  if (value) {
                    console.log(`🔍 [PlanetsAnalysis] Found dates in alternative key "${key}":`, JSON.parse(value));
                    availableDates = JSON.parse(value);
                    break;
                  }
                }
              }
            } catch (e) {
              console.log('❌ [PlanetsAnalysis] Error reading localStorage dates:', e);
            }
          }
          
          // If still no dates, this is a critical error - don't use fallback
          if (availableDates.length === 0) {
            console.log('❌ [PlanetsAnalysis] CRITICAL: No dates found in any source!');
            console.log('🔍 [PlanetsAnalysis] This suggests a data storage/retrieval issue');
            setError('No date data available. Please ensure data is properly loaded in the system.');
            setDatabaseLoading(false);
            return;
          }

          // 🔧 PROGRESSIVE CALENDAR FIX: Handle forward-only date progression
          if (selectedDate && !availableDates.includes(selectedDate)) {
            console.log(`🔧 [PlanetsAnalysis] Selected date ${selectedDate} not in availableDates`);
            console.log(`📅 [PlanetsAnalysis] Current availableDates:`, availableDates);
            
            // For progressive calendar dates, just add the selected date
            // The RealTimeRule2AnalysisService will handle finding a suitable sequence
            const allDates = [...availableDates, selectedDate];
            availableDates = allDates.sort((a, b) => new Date(a) - new Date(b));
            
            console.log(`✅ [PlanetsAnalysis] Added ${selectedDate} to availableDates`);
            console.log(`📅 [PlanetsAnalysis] Updated availableDates:`, availableDates);
            console.log(`📍 [PlanetsAnalysis] Selected date ${selectedDate} now at position:`, availableDates.indexOf(selectedDate) + 1);
          }
          
        // Strategy 1: Try to get real hour-specific analysis data using RealTimeRule2AnalysisService
        if (availableDates && availableDates.length > 0) {
          setError('');
          
          try {
            console.log('🚀 [PlanetsAnalysis] Loading real ABCD/BCD data for each hour using RealTimeRule2AnalysisService...');
            
            // Import and use RealTimeRule2AnalysisService directly for multi-HR analysis
            const { RealTimeRule2AnalysisService } = await import('../services/realTimeRule2AnalysisService.js');
            
            // 🎯 STRICT N-1 PATTERN: Always show previous day's data regardless of clicked date availability
            let dateForAnalysis = selectedDate;
            let displayDate = selectedDate; // Keep track of what user clicked for display
            
            console.log('🔍 [DEBUG] Date selection debug (Simple Previous Date Logic):');
            console.log('  selectedDate from URL:', selectedDate);
            console.log('  availableDates:', availableDates);
            console.log('  availableDates length:', availableDates.length);
            console.log('  availableDates (sorted):', [...availableDates].sort());
            console.log('  selectedDate type:', typeof selectedDate);
            
            // 🔍 EXTRA DEBUG: Check if July 7th is in available dates when July 8th is clicked
            if (selectedDate === '2025-07-08') {
              console.log('🔍 [JULY 8TH DEBUG] Special debug for July 8th click:');
              console.log('  🔍 Is July 7th (2025-07-07) in availableDates?', availableDates.includes('2025-07-07'));
              console.log('  🔍 Is July 6th (2025-07-06) in availableDates?', availableDates.includes('2025-07-06'));
              console.log('  🔍 Is July 5th (2025-07-05) in availableDates?', availableDates.includes('2025-07-05'));
              console.log('  🔍 All July 2025 dates in availableDates:', availableDates.filter(d => d.startsWith('2025-07')));
              console.log('  🔍 All June 2025 dates in availableDates:', availableDates.filter(d => d.startsWith('2025-06')));
            }
            
            if (!dateForAnalysis || !selectedDate?.trim()) {
              // Use the latest date if no specific date selected
              const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
              dateForAnalysis = sortedDates[sortedDates.length - 1];
              displayDate = dateForAnalysis;
              console.log('  No selectedDate, using latest:', dateForAnalysis);
            } else {
              // 🎯 SIMPLIFIED LOGIC: Always find closest previous date with data
              displayDate = selectedDate.trim(); // What user clicked (for display)
              
              console.log('  🎯 SIMPLIFIED PATTERN Applied:');
              console.log('    Display date (user clicked):', displayDate);
              console.log('    Available dates:', availableDates);
              
              // 🔧 ALWAYS find closest previous date - don't use exact clicked date
              console.log('  🔍 Finding closest previous date with data...');
              
              if (availableDates.length === 0) {
                console.log('  ❌ DEBUG: No available dates found!');
                
                // Try to get dates from CleanFirebaseService as fallback
                try {
                  const { default: cleanFirebaseService, PAGE_CONTEXTS } = await import('../services/CleanFirebaseService.js');
                  const supabaseDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
                  console.log('  📅 DEBUG: Found dates from CleanFirebaseService:', supabaseDates);
                  if (supabaseDates && supabaseDates.length > 0) {
                    availableDates = supabaseDates;
                  }
                } catch (e) {
                  console.log('  ❌ DEBUG: CleanFirebaseService also failed:', e);
                }
              }
              
              const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
              console.log('  📅 DEBUG: sortedDates after sorting:', sortedDates);
              console.log('  📅 DEBUG: selectedDate:', selectedDate);
              
              // 🎯 N-1 PATTERN: ALWAYS find closest previous date (never use clicked date itself)
              const selectedDateObj = new Date(selectedDate);
              
              console.log(`  🔍 ALWAYS finding closest previous date before ${selectedDate} (N-1 pattern)...`);
              console.log(`  📅 Available dates to check:`, sortedDates);
              console.log(`  🎯 Note: With sparse dates (1,3,7,8), N-1 pattern requires closest previous logic`);
              
              // ALWAYS find closest previous date - never use the clicked date itself
              let closestPreviousDate = null;
                
              // Find the closest previous date (no artificial gap limits)
              for (let i = sortedDates.length - 1; i >= 0; i--) {
                const availableDate = new Date(sortedDates[i]);
                const isLess = availableDate < selectedDateObj;
                const daysDiff = (selectedDateObj.getTime() - availableDate.getTime()) / (1000 * 60 * 60 * 24);
                
                console.log(`    📅 Checking: ${sortedDates[i]} < ${selectedDate} = ${isLess}, gap: ${Math.round(daysDiff)} days`);
                
                if (isLess) {
                  closestPreviousDate = sortedDates[i];
                  console.log(`    ✅ Found closest previous date (${Math.round(daysDiff)} days gap): ${closestPreviousDate}`);
                  break;
                }
              }
              
              // If no previous date found, use the latest available date
              if (!closestPreviousDate) {
                closestPreviousDate = sortedDates[sortedDates.length - 1];
                console.log(`    🔄 No previous date found, using latest available: ${closestPreviousDate}`);
              }
              
              dateForAnalysis = closestPreviousDate;
              console.log(`  🎯 FINAL LOGIC: ${selectedDate} clicked → using ${dateForAnalysis} data`);
              console.log(`  📅 Analysis will use the closest previous date with actual data`);
            
            console.log('  ✅ FINAL: Date selection complete - Analysis will use date:', dateForAnalysis);
            }
            
            console.log(`📅 [PlanetsAnalysis] Using date for analysis: ${dateForAnalysis} (clicked: ${selectedDate || 'none'})`);
            
            // Show user-friendly message about date selection
            if (selectedDate && dateForAnalysis) {
              setSuccess(`🎯 Clicked ${new Date(selectedDate).toLocaleDateString()} → Using closest previous data from ${new Date(dateForAnalysis).toLocaleDateString()}`);
            } else if (selectedDate) {
              setSuccess(`📅 No previous data available for ${new Date(selectedDate).toLocaleDateString()}`);
            } else {
              setSuccess(`📅 Analyzing data for ${new Date(dateForAnalysis).toLocaleDateString()} (latest available date)`);
            }
            
            // Perform real analysis that returns hour-specific data
            const multiHRAnalysisResult = await RealTimeRule2AnalysisService.performRule2Analysis(
              userId,
              dateForAnalysis,
              availableDates
            );
            
            if (multiHRAnalysisResult.success && multiHRAnalysisResult.data.hrResults) {
              const allHourAnalysisData = {};
              const hrResults = multiHRAnalysisResult.data.hrResults;
              
              console.log(`✅ [PlanetsAnalysis] RealTime analysis successful! Found HR results:`, Object.keys(hrResults));
              
              // Process each HR's real analysis data 
              Object.entries(hrResults).forEach(([hrNumber, hrData]) => {
                if (hrData && !hrData.error && hrData.topicResults) {
                  // Convert to the format expected by PlanetsAnalysisPage
                  const topicNumbers = {};
                  
                  hrData.topicResults.forEach(topicResult => {
                    if (!topicResult.error) {
                      topicNumbers[topicResult.setName] = {
                        abcd: topicResult.abcdNumbers || [],
                        bcd: topicResult.bcdNumbers || []
                      };
                    }
                  });
                  
                  allHourAnalysisData[hrNumber] = {
                    source: 'realTimeRule2Analysis',
                    analysisDate: dateForAnalysis,  // Use the actual date used for analysis
                    timestamp: multiHRAnalysisResult.data.timestamp,
                    hrNumber: parseInt(hrNumber),
                    topicNumbers: topicNumbers,
                    overallNumbers: {
                      abcd: hrData.overallAbcdNumbers || [],
                      bcd: hrData.overallBcdNumbers || []
                    },
                    totalTopics: hrData.topicResults.length,
                    dataSource: `Real Analysis HR-${hrNumber}`,
                    realData: true // Mark as real data, not fallback
                  };
                  
                  console.log(`🎯 [PlanetsAnalysis] HR ${hrNumber} real data:`, {
                    topics: Object.keys(topicNumbers).length,
                    overallABCD: hrData.overallAbcdNumbers?.length || 0,
                    overallBCD: hrData.overallBcdNumbers?.length || 0,
                    sampleTopic: Object.keys(topicNumbers)[0] ? topicNumbers[Object.keys(topicNumbers)[0]] : null
                  });
                } else {
                  console.log(`⚠️ [PlanetsAnalysis] HR ${hrNumber} has error:`, hrData?.error || 'Unknown error');
                }
              });
              
              if (Object.keys(allHourAnalysisData).length > 0) {
                setRealAnalysisData(allHourAnalysisData[selectedHour] || allHourAnalysisData[Object.keys(allHourAnalysisData)[0]]);
                setHourTabsData(allHourAnalysisData);
                setDataSource('analysis');
                setSuccess(`✅ Loaded real ABCD/BCD data for ${Object.keys(allHourAnalysisData).length} hours with unique numbers per hour`);
                
                // Log verification for the first few hours to show they have different data
                const hourNumbers = Object.keys(allHourAnalysisData).slice(0, 3);
                console.log('🔍 [PlanetsAnalysis] Hour-specific data verification:');
                hourNumbers.forEach(hr => {
                  const data = allHourAnalysisData[hr];
                  if (data.topicNumbers['D-1 Set-1 Matrix']) {
                    const topic = data.topicNumbers['D-1 Set-1 Matrix'];
                    console.log(`   HR ${hr}: ABCD=[${topic.abcd.join(',')}], BCD=[${topic.bcd.join(',')}]`);
                  }
                });
                
                setDatabaseLoading(false);
                return; // Success - use this real hour-specific data
              }
            } else {
              console.log('⚠️ [PlanetsAnalysis] RealTime analysis failed:', multiHRAnalysisResult.error);
              
              // If analysis failed and we're using a user-selected date not in availableDates,
              // try falling back to the latest available date
              if (selectedDate && !isSelectedDateAvailable) {
                console.log('🔄 [PlanetsAnalysis] Retrying with latest available date as fallback...');
                const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
                const fallbackDate = sortedDates[sortedDates.length - 1];
                
                try {
                  const fallbackResult = await RealTimeRule2AnalysisService.performRule2Analysis(
                    userId,
                    fallbackDate,
                    availableDates
                  );
                  
                  if (fallbackResult.success && fallbackResult.data.hrResults) {
                    console.log('✅ [PlanetsAnalysis] Fallback analysis successful with date:', fallbackDate);
                    
                    // 🔧 FIXED: Process the fallback result properly - same logic as successful analysis above
                    const allHourAnalysisData = {};
                    const hrResults = fallbackResult.data.hrResults;
                    
                    console.log(`✅ [PlanetsAnalysis] Fallback processing HR results:`, Object.keys(hrResults));
                    
                    // Process each HR's real analysis data 
                    Object.entries(hrResults).forEach(([hrNumber, hrData]) => {
                      if (!hrData.error) {
                        allHourAnalysisData[hrNumber] = {
                          source: 'realTimeRule2Analysis',
                          date: fallbackDate, // Use fallback date instead of original date
                          hrNumber: parseInt(hrNumber),
                          topicNumbers: {},
                          overallNumbers: {
                            abcd: hrData.overallAbcdNumbers || [],
                            bcd: hrData.overallBcdNumbers || []
                          },
                          totalTopics: hrData.topicResults?.length || 0,
                          timestamp: fallbackResult.data.timestamp
                        };

                        // Convert topic results to expected format
                        if (hrData.topicResults) {
                          hrData.topicResults.forEach(topicResult => {
                            allHourAnalysisData[hrNumber].topicNumbers[topicResult.setName] = {
                              abcd: topicResult.abcdNumbers || [],
                              bcd: topicResult.bcdNumbers || []
                            };
                          });
                        }
                      }
                    });

                    // Set the processed data
                    setHourlyAnalysisData(allHourAnalysisData);
                    setDataSource('realTimeRule2Analysis');
                    setSelectedDate(fallbackDate); // Update the selected date to reflect fallback
                    
                    // Debug log
                    console.log('📊 [PlanetsAnalysis] Fallback data preview:');
                    Object.keys(allHourAnalysisData).forEach(hr => {
                      const data = allHourAnalysisData[hr];
                      if (data.topicNumbers['D-1 Set-1 Matrix']) {
                        const topic = data.topicNumbers['D-1 Set-1 Matrix'];
                        console.log(`   HR ${hr}: ABCD=[${topic.abcd.join(',')}], BCD=[${topic.bcd.join(',')}]`);
                      }
                    });
                    
                    // Show warning message about fallback but data is working
                    setError(`⚠️ No data available for ${new Date(selectedDate).toLocaleDateString()}. Showing data for ${new Date(fallbackDate).toLocaleDateString()} instead. Add ${selectedDate} data for direct analysis.`);
                    setDatabaseLoading(false);
                    return; // Success - use this fallback data
                  } else {
                    setError(`❌ No analysis data available for ${new Date(selectedDate).toLocaleDateString()} or any recent dates.`);
                  }
                } catch (fallbackError) {
                  console.log('❌ [PlanetsAnalysis] Fallback analysis also failed:', fallbackError.message);
                  setError(`❌ Analysis failed for ${new Date(selectedDate).toLocaleDateString()}. Please try a different date.`);
                }
              } else {
                setError(`❌ Analysis failed: ${multiHRAnalysisResult.error}`);
              }
            }
          } catch (realTimeError) {
            console.log('⚠️ [PlanetsAnalysis] RealTime analysis error:', realTimeError.message);
          }
        }
        } // Close the if (userId) block from line 136
      } catch (analysisError) {
        console.log('⚠️ [PlanetsAnalysis] Analysis data not available:', analysisError.message);
      }
      
      // Strategy 2: Try database
      console.log('🗄️ [PlanetsAnalysis] Trying database as fallback...');
      const dbResult = await abcdBcdDatabaseService.getAllTopicNumbers();
      
      if (dbResult.success) {
        setDatabaseTopicNumbers(dbResult.data);
        setDataSource('database');
        const summary = abcdBcdDatabaseService.getAnalysisSummary(dbResult);
        setSuccess(`✅ Loaded ${summary.totalTopics} topics from database`);
        console.log('✅ [PlanetsAnalysis] Database data loaded:', summary);
        setDatabaseLoading(false);
        return; // Success - use database data
      }
      
      // Strategy 3: Use enhanced fallback with all topics
      console.log('📋 [PlanetsAnalysis] Using enhanced fallback data...');
      setDataSource('fallback');
      setSuccess('Using comprehensive fallback ABCD/BCD numbers for all topics');
      
    } catch (error) {
      console.error('❌ [PlanetsAnalysis] Error loading data:', error);
      setError(`Failed to load ABCD/BCD numbers: ${error.message}`);
      setDataSource('fallback');
    } finally {
      setDatabaseLoading(false);
    }
  };

  // Enhanced automatic loading - now handles all data sources automatically
  // This function automatically loads ABCD/BCD data from all available sources:
  // 1. Real Rule2 analysis data for all hours using RealTimeRule2AnalysisService (highest priority)
  // 2. Database data as fallback
  // 3. Comprehensive fallback data as last resort
  // ✅ NEW: Each hour gets its own unique real ABCD/BCD numbers based on hour-specific planet selections

  // Topic-specific ABCD/BCD numbers mapping - REAL DYNAMIC DATA 
  // ⚠️ NOTE: These numbers are updated daily with new Rule-2 analysis results
  // Last updated: July 6, 2025 - Replace with fresh analysis data as needed
  const TOPIC_NUMBERS = {
    'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] },
    'D-1 Set-2 Matrix': { abcd: [3, 5, 7, 10, 12], bcd: [] },
    'D-3 Set-1 Matrix': { abcd: [1, 2, 5, 9, 10], bcd: [7] },
    'D-3 Set-2 Matrix': { abcd: [3, 7, 8, 9, 10], bcd: [5, 6] },
    'D-4 Set-1 Matrix': { abcd: [2, 3, 4, 8], bcd: [7, 12] },
    'D-4 Set-2 Matrix': { abcd: [2, 10, 11, 12], bcd: [4] },
    'D-5 Set-1 Matrix': { abcd: [1, 4, 7, 8, 9, 11, 12], bcd: [] },
    'D-5 Set-2 Matrix': { abcd: [4, 5, 7, 8, 10], bcd: [2, 3, 12] },
    'D-7 Set-1 Matrix': { abcd: [5, 6, 8, 9, 11, 12], bcd: [] },
    'D-7 Set-2 Matrix': { abcd: [4, 5, 6, 7, 8], bcd: [] },
    'D-9 Set-1 Matrix': { abcd: [7, 8, 10, 12], bcd: [9] },
    'D-9 Set-2 Matrix': { abcd: [4, 5, 8], bcd: [6, 9] },
    'D-10 Set-1 Matrix': { abcd: [1, 4, 5, 6, 8], bcd: [2] },
    'D-10 Set-2 Matrix': { abcd: [2, 5, 6, 7], bcd: [3, 12] },
    'D-11 Set-1 Matrix': { abcd: [8, 9, 10], bcd: [3] },
    'D-11 Set-2 Matrix': { abcd: [2, 6, 8], bcd: [1] },
    'D-12 Set-1 Matrix': { abcd: [1, 3, 12], bcd: [4, 8] },
    'D-12 Set-2 Matrix': { abcd: [7, 10, 12], bcd: [] },
    'D-27 Set-1 Matrix': { abcd: [1, 3, 4, 5, 8], bcd: [9, 10] },
    'D-27 Set-2 Matrix': { abcd: [2, 3, 5, 7, 11, 12], bcd: [] },
    'D-30 Set-1 Matrix': { abcd: [1, 4, 9, 11], bcd: [2, 7, 8] },
    'D-30 Set-2 Matrix': { abcd: [2, 3, 4, 7, 8, 11], bcd: [5] },
    'D-60 Set-1 Matrix': { abcd: [1, 10, 11], bcd: [] },
    'D-60 Set-2 Matrix': { abcd: [4, 11], bcd: [8, 10] },
    'D-81 Set-1 Matrix': { abcd: [1, 4, 8, 11], bcd: [7, 12] },
    'D-81 Set-2 Matrix': { abcd: [2, 5, 6, 7, 10], bcd: [8, 11] },
    'D-108 Set-1 Matrix': { abcd: [1, 5, 8, 11], bcd: [3] },
    'D-108 Set-2 Matrix': { abcd: [4, 5, 7], bcd: [11] },
    'D-144 Set-1 Matrix': { abcd: [1, 11], bcd: [4, 10] },
    'D-144 Set-2 Matrix': { abcd: [1, 3, 4, 10], bcd: [] }
  };

  // Get ABCD/BCD numbers for a specific topic - prioritize real analysis data
  const getTopicNumbers = (setName) => {
    if (realAnalysisData && realAnalysisData.topicNumbers && !realAnalysisData.incomplete) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-2 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo size="medium" showText={false} pageTitle="Planets Analysis" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">📅 Prediction Date</h1>
              </div>
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
          
          {/* Real Analysis Data Status */}
          {realAnalysisData ? (
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
              {/* Topic verification for current hour */}
              {realAnalysisData.topicNumbers && realAnalysisData.topicNumbers['D-1 Set-1 Matrix'] && (
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
              {/* Hour switching reminder */}
              {userInfo && userInfo.hr > 1 && (
                <div className="mt-1 p-1 bg-blue-50 rounded border text-xs">
                  <div className="font-medium text-blue-800">💡 Tip:</div>
                  <div className="text-blue-700">
                    Click different HR tabs above to see ABCD/BCD numbers change for each hour!
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Database Analysis Summary */}
          {databaseTopicNumbers && !realAnalysisData ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-2 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-medium">✓ DATABASE</span>
                <span className="text-green-700 font-medium text-xs">Using Supabase ABCD/BCD numbers</span>
              </div>
            </div>
          ) : !realAnalysisData ? (
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
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">
                  {selectedTopics.size}/{availableTopics.length}
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800"
                >
                  All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowTopicSelector(!showTopicSelector)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {showTopicSelector ? '☑️' : '◻️'}
                </button>
              </div>
            </div>

            {/* ABCD/BCD Topic Status Overview */}
            {realAnalysisData && (
              <div className="mb-3 p-2 bg-green-50 rounded text-xs">
                <div className="font-medium text-green-800 mb-1">📊 HR {selectedHour} ABCD/BCD Status:</div>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  {availableTopics.slice(0, 8).map(topic => {
                    const { abcd, bcd } = getTopicNumbersWithNormalization(topic);
                    const hasData = abcd.length > 0 || bcd.length > 0;
                    return (
                      <div key={topic} className={`p-1 rounded ${hasData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <div className="font-medium">{formatSetName(topic)}</div>
                        <div>{hasData ? `A:${abcd.length} B:${bcd.length}` : 'No data'}</div>
                      </div>
                    );
                  })}
                </div>
                {availableTopics.length > 8 && (
                  <div className="mt-1 text-green-700">...and {availableTopics.length - 8} more topics</div>
                )}
              </div>
            )}

            {showTopicSelector && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
                {availableTopics.map(topic => {
                  const { abcd, bcd } = getTopicNumbersWithNormalization(topic);
                  const hasData = abcd.length > 0 || bcd.length > 0;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => handleTopicToggle(topic)}
                      className={`w-full px-1 py-1 rounded text-xs font-medium transition-all text-left relative ${
                        selectedTopics.has(topic)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs">{formatSetName(topic)}</span>
                        <div className="flex items-center gap-0.5">
                          {hasData ? (
                            <span className="text-green-600 text-xs">●</span>
                          ) : (
                            <span className="text-red-500 text-xs">○</span>
                          )}
                          {selectedTopics.has(topic) && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-2 py-1 rounded mb-3 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-2 py-1 rounded mb-3 text-xs">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Planets Analysis Results
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Processing Excel file...</p>
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
                      }`}>
                        {hourSwitchLoading ? '⏳ HR Data' : `HR ${selectedHour} Data`}
                      </span>
                    )}
                  </h4>
                  
                  {/* All ABCD/BCD numbers row for this topic (separated) */}
                  {(() => {
                    // Get ABCD/BCD numbers for this topic (hour-specific if available)
                    const { abcd, bcd } = getTopicNumbersWithNormalization(setName);
                    if ((abcd?.length || 0) + (bcd?.length || 0) === 0) return null;
                    return (
                      <div className="mb-2 flex flex-wrap gap-4 items-center bg-blue-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-700 mr-1">ABCD:</span>
                          {abcd && abcd.length > 0 ? abcd.sort((a,b)=>a-b).map(num => (
                            <span key={num} className="px-2 py-0.5 bg-green-200 text-green-900 rounded text-xs font-mono font-bold">{num}</span>
                          )) : <span className="text-xs text-gray-400">None</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-700 mr-1">BCD:</span>
                          {bcd && bcd.length > 0 ? bcd.sort((a,b)=>a-b).map(num => (
                            <span key={num} className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded text-xs font-mono font-bold">{num}</span>
                          )) : <span className="text-xs text-gray-400">None</span>}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Planet Headers with topic-specific ABCD/BCD numbers */}
                  <div key={`planet-headers-${selectedHour}-${realAnalysisData?.timestamp || 'fallback'}`} className="mb-2 grid grid-cols-9 gap-1">
                    {PLANET_CODES.map(planetCode => {
                      // Get topic-level ABCD/BCD numbers for this hour
                      const { abcd, bcd } = getTopicNumbersWithNormalization(setName);
                      // Get this planet's element numbers for this topic
                      const planetNumbers = getTopicPlanetNumbers(setName)[planetCode] || [];
                      // Only show numbers that are both in ABCD/BCD and in this planet's numbers
                      const abcdForPlanet = planetNumbers.filter(num => abcd.includes(num));
                      const bcdForPlanet = planetNumbers.filter(num => bcd.includes(num));
                      return (
                        <div key={`${planetCode}-${selectedHour}`} className="text-center bg-purple-100 p-1 rounded">
                          <div className="text-xs font-semibold">{planetCode}</div>
                          <div className="text-xs mt-0.5">
                            {abcdForPlanet.length > 0 && (
                              <div className="bg-green-200 text-green-800 px-0.5 py-0.5 rounded mb-0.5 text-xs">
                                A: {abcdForPlanet.join(',')}
                              </div>
                            )}
                            {bcdForPlanet.length > 0 && (
                              <div className="bg-blue-200 text-blue-800 px-0.5 py-0.5 rounded text-xs">
                                B: {bcdForPlanet.join(',')}
                              </div>
                            )}
                            {abcdForPlanet.length === 0 && bcdForPlanet.length === 0 && (
                              <div className="text-gray-400 text-xs">—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
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
                                    
                                    return (
                                      <td key={planet} className="border border-gray-300 px-1 py-1 text-center">
                                        {rawData ? (
                                          <div className="flex flex-col items-center gap-0.5">
                                            <span className="font-mono text-gray-700 text-xs">
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
              <p className="text-sm text-gray-600">No analysis results available. Please upload an Excel file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanetsAnalysisPage;
