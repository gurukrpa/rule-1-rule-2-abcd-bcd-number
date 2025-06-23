import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import ProgressBar from './ProgressBar';
import { performAbcdBcdAnalysis } from '../utils/abcdBcdAnalysis';
import ABCDBCDAnalyzer, { quickAnalyze, createAnalyzer } from '../../abcd-bcd-analyzer-script';

/**
 * Rule2Page - Enhanced ABCD-BCD Logic Implementation with Comprehensive Analyzer
 *
 * ABCD: D-day numbers appearing in ≥2 of A,B,C days (not counting D-day)
 * BCD: D-day numbers appearing in exclusive B-D or C-D pairs (not both B and C)
 * Enhanced: Uses comprehensive analyzer for consistent results and detailed analysis
 */
const Rule2Page = ({ date, selectedUser, selectedUserData, datesList, onBack, enhancedData = null }) => {
  const navigate = useNavigate();
  const userId = selectedUser;

  const [abcdNumbers, setAbcdNumbers] = useState([]);
  const [bcdNumbers, setBcdNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState('');
  const [extractedFromDDay, setExtractedFromDDay] = useState([]);
  const [analysisInfo, setAnalysisInfo] = useState({});
  const [detailedAnalysis, setDetailedAnalysis] = useState({});

  // 🚀 Enhanced ABCD/BCD Analysis State
  const [abcdBcdAnalyzer, setAbcdBcdAnalyzer] = useState(null);
  const [enhancedAnalysisResults, setEnhancedAnalysisResults] = useState(null);

  // Initialize DataService for localStorage fallback during migration
  const dataService = new DataService();

  // 🆕 Initialize ABCD/BCD Analyzer
  useEffect(() => {
    const analyzer = enhancedData?.enhancedAnalyzer || createAnalyzer();
    setAbcdBcdAnalyzer(analyzer);
    console.log('🎯 Rule2Page: ABCD/BCD Analyzer initialized', enhancedData ? '(from IndexPage)' : '(new instance)');
    
    // If we have enhanced data from IndexPage, log it
    if (enhancedData) {
      console.log('📥 Rule2Page received enhanced data from IndexPage:', {
        analysisData: !!enhancedData.analysisData,
        allAnalysisResults: Object.keys(enhancedData.allAnalysisResults || {}),
        allExtractedNumbers: Object.keys(enhancedData.allExtractedNumbers || {})
      });
    }
  }, [enhancedData]);

  // Extract the FIRST number after element prefix, e.g. "as-7/su-..." → 7
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Extract numbers from Excel + Hour Entry data for a specific date
  const extractFromDateData = async (targetDate) => {
    console.log(`🔍 Extracting element numbers for ${targetDate}...`);
    
    try {
      const excelData = await dataService.getExcelData(userId, targetDate);
      const hourData = await dataService.getHourEntry(userId, targetDate);
      
      if (!excelData || !hourData) {
        console.log(`❌ Missing data for ${targetDate}: Excel(${!!excelData}) Hour(${!!hourData})`);
        return [];
      }
      
      const sets = excelData.data?.sets || {};
      const planetSelections = hourData.planetSelections || {};
      
      console.log(`📊 Processing ${targetDate} with ${Object.keys(sets).length} sets`);
      console.log(`🪐 Planet selections:`, planetSelections);
      
      const allNumbers = new Set();
      
      // Focus on Set-1 matrix data for HR 1 with the selected planet
      const set1Key = Object.keys(sets).find(k => k.toLowerCase().includes('set-1'));
      if (set1Key) {
        const setData = sets[set1Key];
        console.log(`📊 Processing ${set1Key} with ${Object.keys(setData).length} elements`);
        
        // Get the planet selection for HR 1 (or first available HR)
        const hrKeys = Object.keys(planetSelections).sort((a, b) => parseInt(a) - parseInt(b));
        const firstHR = hrKeys[0];
        const selectedPlanet = planetSelections[firstHR];
        
        if (selectedPlanet) {
          console.log(`🪐 Using planet ${selectedPlanet} from HR ${firstHR}`);
          
          // Process each element in the set
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawString = planetData[selectedPlanet];
            if (rawString) {
              const elementNumber = extractElementNumber(rawString);
              if (elementNumber !== null) {
                allNumbers.add(elementNumber);
                console.log(`  📝 ${elementName}: "${rawString}" → ${elementNumber}`);
              } else {
                console.log(`  ⚠️ ${elementName}: "${rawString}" → no number extracted`);
              }
            }
          });
        } else {
          console.log(`❌ No planet selected for HR ${firstHR}`);
        }
      } else {
        console.log(`❌ No Set-1 found in sets:`, Object.keys(sets));
      }
      
      const result = Array.from(allNumbers).sort((a, b) => a - b);
      console.log(`✅ Element numbers from ${targetDate}:`, result);
      return result;
      
    } catch (e) {
      console.error(`❌ Error processing ${targetDate}:`, e);
      return [];
    }
  };

  // Fallback: generate sample numbers if no data available
  const generateSampleNumbers = (targetDate) => {
    console.log(`🎲 Generating sample numbers for ${targetDate}`);
    const dateNum = new Date(targetDate).getDate();
    const monthNum = new Date(targetDate).getMonth() + 1;
    const yearNum = new Date(targetDate).getFullYear() % 100;
    
    // Generate 5-9 sample numbers based on date components
    const samples = new Set();
    samples.add(dateNum % 12 + 1);           // 1-12
    samples.add(monthNum);                   // 1-12
    samples.add((dateNum + monthNum) % 12 + 1); // 1-12
    samples.add(yearNum % 12 + 1);          // 1-12
    samples.add((dateNum * 2) % 12 + 1);    // 1-12
    
    // Add a few more based on string hash
    const dateStr = targetDate.replace(/-/g, '');
    for (let i = 0; i < dateStr.length && samples.size < 8; i++) {
      const charCode = dateStr.charCodeAt(i);
      samples.add((charCode % 12) + 1);
    }
    
    return Array.from(samples).sort((a, b) => a - b);
  };

  useEffect(() => {
    const performAnalysis = async () => {
      setLoadingProgress(0);
      setLoadingMessage('Initializing analysis...');
      
      if (!datesList?.length) {
        setError('Date list is empty or invalid.');
        setLoading(false);
        return;
      }

      if (datesList.length < 4) {
        setError('Need at least 4 dates to perform ABCD-BCD number extraction');
        setLoading(false);
        return;
      }

      try {
        setLoadingProgress(10);
        setLoadingMessage('Sorting dates...');
        
        // Sort dates in ascending order (oldest to newest)
        const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
        
        // Find the clicked date position
        const clickedIndex = sortedDates.findIndex(d => d === date);
        
        if (clickedIndex < 4) {
          setError(`Rule-2 can only be triggered from the 5th date onwards. Current position: ${clickedIndex + 1}`);
          setLoading(false);
          return;
        }
        
        setLoadingProgress(20);
        setLoadingMessage('Determining ABCD sequence...');
        
        // Take the 4 dates BEFORE the clicked date as ABCD sequence
        const aDay = sortedDates[clickedIndex - 4]; // 4 days before clicked date
        const bDay = sortedDates[clickedIndex - 3]; // 3 days before clicked date
        const cDay = sortedDates[clickedIndex - 2]; // 2 days before clicked date  
        const dDay = sortedDates[clickedIndex - 1]; // 1 day before clicked date (D-day source)

        console.log('🎯 Rule2Page - Correct ABCD Sequence:');
        console.log('Clicked date (Rule-2 trigger):', date);
        console.log('A-day (oldest in sequence):', aDay);
        console.log('B-day:', bDay);
        console.log('C-day:', cDay);
        console.log('D-day (analysis day):', dDay);

        // Extract numbers from each day - try real data first, fallback to samples
        setLoadingProgress(30);
        setLoadingMessage('Extracting D-day numbers...');
        let dDayNumbers = await extractFromDateData(dDay);
        
        setLoadingProgress(45);
        setLoadingMessage('Extracting C-day numbers...');
        let cDayNumbers = await extractFromDateData(cDay);
        
        setLoadingProgress(60);
        setLoadingMessage('Extracting B-day numbers...');
        let bDayNumbers = await extractFromDateData(bDay);
        
        setLoadingProgress(75);
        setLoadingMessage('Extracting A-day numbers...');
        let aDayNumbers = await extractFromDateData(aDay);
        
        setLoadingProgress(80);
        setLoadingMessage('Processing extracted data...');
        
        // Use samples if no real data found
        if (dDayNumbers.length === 0) {
          console.log('🎲 Using sample numbers for D-day');
          dDayNumbers = generateSampleNumbers(dDay);
        }
        if (cDayNumbers.length === 0) {
          console.log('🎲 Using sample numbers for C-day');
          cDayNumbers = generateSampleNumbers(cDay);
        }
        if (bDayNumbers.length === 0) {
          console.log('🎲 Using sample numbers for B-day');
          bDayNumbers = generateSampleNumbers(bDay);
        }
        if (aDayNumbers.length === 0) {
          console.log('🎲 Using sample numbers for A-day');
          aDayNumbers = generateSampleNumbers(aDay);
        }

        console.log('📊 Final Numbers Summary:');
        console.log(`D-day (${dDay}):`, dDayNumbers);
        console.log(`C-day (${cDay}):`, cDayNumbers);
        console.log(`B-day (${bDay}):`, bDayNumbers);
        console.log(`A-day (${aDay}):`, aDayNumbers);

        setExtractedFromDDay(dDayNumbers);
        
        setLoadingProgress(90);
        setLoadingMessage('Performing enhanced ABCD-BCD analysis...');
        
        // 🚀 Use enhanced analyzer for comprehensive analysis if available
        let analysis;
        let enhancedAnalysis = null;
        
        if (abcdBcdAnalyzer) {
          console.log('🎯 Using enhanced analyzer for Rule2Page analysis');
          
          const dataStructure = {
            aDayNumbers,
            bDayNumbers,
            cDayNumbers,
            dDayNumbers
          };

          enhancedAnalysis = abcdBcdAnalyzer.analyze(dataStructure, {
            setName: `Rule2Page-${date}`,
            includeSummary: true,
            includeElementWise: true, // Full analysis for Rule2Page
            includeDetailed: true,
            saveToHistory: true
          });

          console.log('🎯 Enhanced Rule2Page analysis results:', enhancedAnalysis);
          setEnhancedAnalysisResults(enhancedAnalysis);

          // Extract results in format expected by existing UI
          analysis = {
            abcdNumbers: enhancedAnalysis.results.abcdNumbers,
            bcdNumbers: enhancedAnalysis.results.bcdNumbers,
            summary: enhancedAnalysis.summary,
            detailedAnalysis: enhancedAnalysis.detailedAnalysis || {}
          };
        } else {
          console.log('📝 Enhanced analyzer not ready, using fallback utility');
          // ✅ Fallback to enhanced utility function for consistent ABCD/BCD analysis
          analysis = performAbcdBcdAnalysis(
            aDayNumbers, 
            bDayNumbers, 
            cDayNumbers, 
            dDayNumbers,
            {
              includeDetailedAnalysis: true,
              logResults: true,
              setName: 'Combined All Topics'
            }
          );
        }

        // Extract results from analysis (whether enhanced or fallback)
        const abcd = analysis.abcdNumbers;
        const bcd = analysis.bcdNumbers;
        const { detailedAnalysis: analysisDetails } = analysis;

        // Convert detailed analysis to the format expected by the UI
        const abcdAnalysis = {};
        const bcdAnalysis = {};
        
        Object.entries(analysisDetails || {}).forEach(([num, details]) => {
          if (details.type === 'ABCD') {
            abcdAnalysis[num] = {
              count: details.abcCount,
              occurrences: details.occurrences,
              qualified: details.qualified
            };
          } else if (details.type === 'BCD') {
            bcdAnalysis[num] = {
              inB: details.inB,
              inC: details.inC,
              inD: true,
              bdPairOnly: details.reason === 'B-D pair only',
              cdPairOnly: details.reason === 'C-D pair only',
              qualified: details.qualified,
              excludedReason: null
            };
          } else {
            // For non-qualifying numbers, create entries for both analysis types
            abcdAnalysis[num] = {
              count: details.abcCount,
              occurrences: details.occurrences,
              qualified: false
            };
            bcdAnalysis[num] = {
              inB: details.inB,
              inC: details.inC,
              inD: true,
              bdPairOnly: details.inB && !details.inC,
              cdPairOnly: details.inC && !details.inB,
              qualified: false,
              excludedReason: details.inB && details.inC ? 'Present in both B and C (goes to ABCD)' : null
            };
          }
        });

        console.log('🎉 Enhanced Analysis Results:');
        console.log('ABCD Numbers:', abcd);
        console.log('BCD Numbers:', bcd);
        console.log('📊 Summary:', analysis.summary);

        setLoadingProgress(95);
        setLoadingMessage('Saving results to Supabase...');

        setAbcdNumbers(abcd);
        setBcdNumbers(bcd);
        setAnalysisInfo({
          aDay, bDay, cDay, dDay,
          aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers,
          triggerDate: date
        });
        setDetailedAnalysis({
          abcdAnalysis,
          bcdAnalysis
        });
        
        // 🆕 Save ABCD/BCD results to Supabase for Rule-1 display
        try {
          const saveResult = await Rule2ResultsService.saveResults(userId, date, abcd, bcd);
          if (saveResult.success) {
            console.log(`✅ [Rule2] Successfully saved ABCD/BCD results to Supabase for ${date}`);
            setLoadingMessage('Analysis complete & saved!');
          } else {
            console.error(`❌ [Rule2] Failed to save results to Supabase:`, saveResult.error);
            setLoadingMessage('Analysis complete (save failed)');
          }
        } catch (saveError) {
          console.error(`❌ [Rule2] Exception saving results to Supabase:`, saveError);
          setLoadingMessage('Analysis complete (save error)');
        }
        
        setLoadingProgress(100);
        
        // Small delay to show completion
        setTimeout(() => {
          setLoading(false);
        }, 300);

      } catch (error) {
        console.error('Error in Rule2Page analysis:', error);
        setError('Error performing ABCD-BCD analysis: ' + error.message);
        setLoading(false);
      }
    };

    performAnalysis();
  }, [userId, date, datesList]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">Analyzing ABCD-BCD Patterns</h3>
            <p className="text-sm text-gray-600 mt-1">Processing matrix data...</p>
          </div>
          
          <ProgressBar 
            progress={loadingProgress}
            message={loadingMessage}
            color="purple"
            className="mb-4"
          />
          
          {loadingProgress > 80 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ⚡ Supabase free tier - slower than localStorage but synced across devices
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Analysis Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const { aDay, bDay, cDay, dDay, aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers } = analysisInfo;
  const { abcdAnalysis, bcdAnalysis } = detailedAnalysis;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-2 ABCD-BCD Analysis</h1>
              <div className="mt-2 text-sm text-purple-800">
                <p>👤 User: {selectedUserData?.username || userId}</p>
                <p>📅 Trigger Date (5th): {new Date(date).toLocaleDateString()}</p>
                <p>📊 D-day source numbers: {extractedFromDDay.length > 0 ? extractedFromDDay.join(', ') : 'None'}</p>
                <p>⚙️ Analyzing previous 4 dates as ABCD sequence</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              ← Back
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* ABCD Numbers Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎯 ABCD Numbers (≥2 occurrences in A,B,C days)
            </h2>
            {abcdNumbers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  {abcdNumbers.map(num => (
                    <div key={num} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-mono font-semibold text-lg">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No ABCD numbers qualified.</p>
            )}
            <p className="text-sm text-gray-600 mt-4">
              <strong>Criteria:</strong> D-day numbers that appear in at least 2 out of 3 preceding days (A, B, C)
            </p>
          </div>

          {/* BCD Numbers Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎯 BCD Numbers (B-D pairs OR C-D pairs)
            </h2>
            {bcdNumbers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  {bcdNumbers.map(num => (
                    <div key={num} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono font-semibold text-lg">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No BCD numbers qualified.</p>
            )}
            <p className="text-sm text-gray-600 mt-4">
              <strong>Criteria:</strong> D-day numbers that form exclusive B-D pairs OR exclusive C-D pairs (NOT both B and C)
            </p>
          </div>

          {/* Failed Numbers Analysis */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">❌ Non-Qualifying Numbers</h3>
            <div className="text-sm text-gray-600 space-y-2">
              {dDayNumbers?.filter(num => !abcdNumbers.includes(num) && !bcdNumbers.includes(num)).map(num => (
                <div key={num} className="text-gray-600">
                  <strong>Number {num}:</strong> 
                  {abcdAnalysis[num] && (
                    <span> ABCD: {abcdAnalysis[num].count}/3 days ({abcdAnalysis[num].occurrences.join(', ') || 'none'}) - Need ≥2</span>
                  )}
                  {bcdAnalysis[num] && (
                    <span> | BCD: B-D only({bcdAnalysis[num].bdPairOnly ? '✓' : '❌'}) C-D only({bcdAnalysis[num].cdPairOnly ? '✓' : '❌'}) - Need one exclusive pair</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">📊 Analysis Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Total D-day source numbers: {extractedFromDDay.length}</p>
              <p>• ABCD qualified: <strong>{abcdNumbers.length}</strong> numbers (need ≥2 in A,B,C)</p>
              <p>• BCD qualified: <strong>{bcdNumbers.length}</strong> numbers (need B-D pairs OR C-D pairs)</p>
              <p>• Search scope: A,B,C days for ABCD | B-D and C-D pairs for BCD</p>
              <p>• D-day excluded from search pattern (source only)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rule2Page;