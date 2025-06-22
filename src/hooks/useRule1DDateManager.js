// Hook for easy Rule-1 D-date addition
// Simplifies the process of adding new D-dates to Rule-1 analysis

import { useState, useEffect } from 'react';
import { PagesDataService } from '../services/PagesDataService';

export const useRule1DDateManager = (userId) => {
  const [dataService] = useState(() => new PagesDataService(userId));
  const [currentSequence, setCurrentSequence] = useState(null);
  const [readyForNewDate, setReadyForNewDate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current Rule-1 state
  useEffect(() => {
    loadRule1State();
  }, [userId]);

  const loadRule1State = async () => {
    try {
      setLoading(true);
      setError(null);

      const rule1Data = await dataService.getRule1ReadyForNewDate();
      
      if (rule1Data) {
        setCurrentSequence(rule1Data.sequence);
        setReadyForNewDate(true);
      } else {
        setReadyForNewDate(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new D-date and create new Rule-1 sequence
  const addNewDDate = async (newDDate, processedDDateData) => {
    try {
      if (!currentSequence) {
        throw new Error('No current Rule-1 sequence found');
      }

      // 1. Save the new D-date processed data
      await saveProcessedDDateData(newDDate, processedDDateData);

      // 2. Create new ABCD sequence with shifted dates
      const newTriggerDate = newDDate; // New D-date becomes trigger
      const newSequence = await dataService.addNewDDateToRule1(
        currentSequence,
        newDDate,
        newTriggerDate
      );

      // 3. Run ABCD/BCD analysis for the new sequence
      const analysisResults = await runABCDAnalysis(newSequence);

      // 4. Update state
      setCurrentSequence(newSequence);

      return {
        sequence: newSequence,
        analysisResults,
        success: true
      };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Save processed data for new D-date
  const saveProcessedDDateData = async (date, processedData) => {
    for (const setName in processedData.sets) {
      for (const elementName in processedData.sets[setName]) {
        for (const hrNumber in processedData.sets[setName][elementName]) {
          const data = processedData.sets[setName][elementName][hrNumber];
          
          await dataService.saveProcessedData(
            date,
            'rule1',
            setName,
            elementName,
            parseInt(hrNumber),
            {
              raw: data.raw,
              formatted: data.formatted,
              extractedNumber: data.extractedNumber,
              planetCode: data.planetCode,
              signCode: data.signCode
            }
          );
        }
      }
    }
  };

  // Run ABCD/BCD analysis for new sequence
  const runABCDAnalysis = async (sequence) => {
    // Get processed data for all dates in sequence
    const dates = [sequence.a_date, sequence.b_date, sequence.c_date, sequence.d_date];
    const allData = await dataService.getProcessedDataForDates(dates, 'rule1');

    const analysisResults = [];

    // Group data by set/element/hr for analysis
    const groupedData = groupDataForAnalysis(allData);

    for (const [key, elementData] of Object.entries(groupedData)) {
      const [setName, elementName, hrNumber] = key.split('|');
      
      // Extract numbers for ABCD analysis
      const aNumbers = elementData[sequence.a_date]?.extracted_number ? [elementData[sequence.a_date].extracted_number] : [];
      const bNumbers = elementData[sequence.b_date]?.extracted_number ? [elementData[sequence.b_date].extracted_number] : [];
      const cNumbers = elementData[sequence.c_date]?.extracted_number ? [elementData[sequence.c_date].extracted_number] : [];
      const dNumbers = elementData[sequence.d_date]?.extracted_number ? [elementData[sequence.d_date].extracted_number] : [];

      if (dNumbers.length === 0) continue;

      const dNumber = dNumbers[0];

      // ABCD Analysis: D-day numbers appearing in ≥2 of A,B,C days
      let abcdCount = 0;
      const abcdOccurrences = [];

      if (aNumbers.includes(dNumber)) {
        abcdCount++;
        abcdOccurrences.push('A');
      }
      if (bNumbers.includes(dNumber)) {
        abcdCount++;
        abcdOccurrences.push('B');
      }
      if (cNumbers.includes(dNumber)) {
        abcdCount++;
        abcdOccurrences.push('C');
      }

      const qualifiesForABCD = abcdCount >= 2;

      // BCD Analysis: Exclusive B-D or C-D pairs
      const inB = bNumbers.includes(dNumber);
      const inC = cNumbers.includes(dNumber);
      const bdPairOnly = inB && !inC;
      const cdPairOnly = inC && !inB;
      const qualifiesForBCD = (bdPairOnly || cdPairOnly) && !qualifiesForABCD;

      // Save qualifying results
      if (qualifiesForABCD) {
        analysisResults.push({
          setName,
          elementName,
          hrNumber: parseInt(hrNumber),
          dDayNumber: dNumber,
          analysisType: 'ABCD',
          qualificationReason: `appears in ${abcdOccurrences.join(', ')} days`,
          badgeText: generateBadgeText('ABCD', elementName, dNumber, elementData[sequence.d_date])
        });
      }

      if (qualifiesForBCD) {
        analysisResults.push({
          setName,
          elementName,
          hrNumber: parseInt(hrNumber),
          dDayNumber: dNumber,
          analysisType: 'BCD',
          qualificationReason: bdPairOnly ? 'B-D pair only' : 'C-D pair only',
          badgeText: generateBadgeText('BCD', elementName, dNumber, elementData[sequence.d_date])
        });
      }
    }

    // Save analysis results to database
    if (analysisResults.length > 0) {
      await dataService.saveAnalysisResults(sequence.id, analysisResults);
    }

    return analysisResults;
  };

  // Helper functions
  const groupDataForAnalysis = (allData) => {
    const grouped = {};
    
    for (const [date, dateData] of Object.entries(allData)) {
      for (const item of dateData) {
        const key = `${item.set_name}|${item.element_name}|${item.hr_number}`;
        if (!grouped[key]) grouped[key] = {};
        grouped[key][date] = item;
      }
    }
    
    return grouped;
  };

  const generateBadgeText = (type, elementName, number, dDateData) => {
    const elementCodes = {
      'Lagna': 'as',
      'Moon': 'mo',
      'Hora Lagna': 'hl',
      'Ghati Lagna': 'gl',
      'Vighati Lagna': 'vig',
      'Varnada Lagna': 'var',
      'Sree Lagna': 'sl',
      'Pranapada Lagna': 'pp',
      'Indu Lagna': 'in'
    };

    const elementCode = elementCodes[elementName] || elementName.toLowerCase();
    const planetCode = dDateData?.planet_code || '';
    const signCode = dDateData?.sign_code || '';

    let badge = `${type.toLowerCase()}-${elementCode}-${number}`;
    if (planetCode) badge += `-${planetCode}`;
    if (signCode) badge += `-${signCode}`;

    return badge;
  };

  // Get current sequence info for display
  const getCurrentSequenceInfo = () => {
    if (!currentSequence) return null;

    return {
      triggerDate: currentSequence.trigger_date,
      aDate: currentSequence.a_date,
      bDate: currentSequence.b_date,
      cDate: currentSequence.c_date,
      dDate: currentSequence.d_date,
      selectedHR: currentSequence.selected_hr,
      nextSuggestedDDate: dataService.suggestNextDate(currentSequence.d_date)
    };
  };

  return {
    currentSequence,
    readyForNewDate,
    loading,
    error,
    addNewDDate,
    loadRule1State,
    getCurrentSequenceInfo
  };
};
