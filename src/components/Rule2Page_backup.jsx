// src/components/Rule2Page.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Rule2Page
 *
 * Implements Logic-4: ABCD-BCD Number Extraction.
 *
 * When you click “Rule-2” on a date (must be 5th chronological or later), this page:
 *
 * 1. Loads all saved dates for the user from localStorage (`abcd_dates_<userId>`).
 * 2. Sorts those dates ascending (oldest → newest).
 * 3. Finds the clicked date’s index (idx). If idx < 4, shows an error because fewer than 5 dates exist.
 * 4. Defines:
 *      A = sortedDates[idx - 4]
 *      B = sortedDates[idx - 3]
 *      C = sortedDates[idx - 2]
 *      D = sortedDates[idx - 1]
 *    (The clicked date itself at sortedDates[idx] is only a trigger and never used directly.)
 * 5. Extracts all “Set-1” numbers from **D-day**:
 *      • Reads `localStorage.getItem('abcd_excel_<userId>_<D>')` → parse JSON → data.sets  
 *      • Reads `localStorage.getItem('abcd_hourEntry_<userId>_<D>')` → parse JSON → planetSelections  
 *      • Finds any block in data.sets whose key **(case-insensitive)** includes `"Set-1"`  
 *      • For each of the nine element abbreviations (`as, mo, hl, gl, vig, var, sl, pp, in`),  
 *        find the chosen planet, then pull out the first integer after a dash (e.g. “hl-7-…” → 7).  
 *      • Deduplicate those results to form an array `dTargets`.
 * 6. For each integer in `dTargets`, check whether that integer appears in at least two of **A, B, C**:  
 *      • Load Excel/hour-entry for that date, find the same `Set-1` block, extract numbers as above,  
 *      • Count in how many of A, B, C it appears (each day can only contribute “1 hit” even if multiple).  
 * 7. Show only those integers that appear in ≥2 of A, B, C.  
 *    If none qualify, display “No Numbers Qualified.”  
 * 8. If any of A, B, C, or D is missing its own Excel/hour-entry, display a clear error.  
 */

const Rule2Page = () => {
  const { userId, date } = useParams(); // e.g. "/rule2/john/2025-06-05"
  const navigate = useNavigate();

  const [qualifiedNumbers, setQualifiedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map each element abbreviation → full name as stored in Excel JSON
  const planetMapping = {
    as:  'Lagna',
    mo:  'Moon',
    hl:  'Hora Lagna',
    gl:  'Ghati Lagna',
    vig: 'Vighati Lagna',
    var: 'Varnada Lagna',
    sl:  'Sree Lagna',
    pp:  'Pranapada Lagna',
    in:  'Indu Lagna'
  };

  // Given a string like "hl-7-...", extract the first integer after a dash → 7
  const extractFirstNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/-(\d+)/);
    return match ? Number(match[1]) : null;
  };

  useEffect(() => {
    // 1) Load all saved dates for this user
    const datesRaw = localStorage.getItem(`abcd_dates_${userId}`);
    if (!datesRaw) {
      setError('No dates found for this user.');
      setLoading(false);
      return;
    }
    const allDates = JSON.parse(datesRaw);
    if (!Array.isArray(allDates) || allDates.length === 0) {
      setError('Date list is empty or invalid.');
      setLoading(false);
      return;
    }

    // 2) Sort ascending (oldest → newest) and find index of clicked date
    const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));
    const idx = sortedDates.indexOf(date);
    if (idx < 0) {
      setError('Clicked date not found in user’s dates.');
      setLoading(false);
      return;
    }
    if (idx < 4) {
      setError('Rule-2 only runs on the 5th (or later) date.');
      setLoading(false);
      return;
    }

    // 3) Define A, B, C, D from the four dates immediately before the clicked date
    const A = sortedDates[idx - 4];
    const B = sortedDates[idx - 3];
    const C = sortedDates[idx - 2];
    const D = sortedDates[idx - 1];

    // 4) Helper: extract all “Set-1” numbers for a given date’s Excel/hour-entry
    const extractFromDate = (dDate) => {
      const excelKey = `abcd_excel_${userId}_${dDate}`;
      const hourKey  = `abcd_hourEntry_${userId}_${dDate}`;
      const rawExcel = localStorage.getItem(excelKey);
      const rawHour  = localStorage.getItem(hourKey);
      if (!rawExcel || !rawHour) {
        return null; // signals missing data for that day
      }

      const excelData = JSON.parse(rawExcel);
      const hourData  = JSON.parse(rawHour);
      const allSets   = excelData.data?.sets || {};
      // Find any key that contains "Set-1" (case-insensitive)
      const setNameKey = Object.keys(allSets).find((key) =>
        key.toLowerCase().includes('set-1')
      );
      if (!setNameKey) {
        // No "Set-1" block found
        return [];
      }

      const setData = allSets[setNameKey];
      const nums = [];

      // For each of the nine abbreviations, look up the chosen planet and extract a number
      Object.entries(planetMapping).forEach(([abbr, colName]) => {
        const selectedPlanet = hourData.planetSelections?.[abbr];
        if (!selectedPlanet) return;
        const rawString = setData[colName]?.[selectedPlanet]; // e.g. "hl-7-..."
        const num = extractFirstNumber(rawString);
        if (num !== null) {
          nums.push(num);
        }
      });

      // Deduplicate before returning
      return Array.from(new Set(nums));
    };

    // 5) Extract D-day targets
    const dTargets = extractFromDate(D);
    if (dTargets === null) {
      setError(`Missing Excel or Hour Entry data for D-day (${D}).`);
      setLoading(false);
      return;
    }
    if (dTargets.length === 0) {
      setError(`No "Set-1" numbers found for D-day (${D}).`);
      setLoading(false);
      return;
    }

    // 6) Helper: check if a single number appears in at least 2 of A, B, C
    const appearsInABC = (num) => {
      let count = 0;
      [A, B, C].forEach((dDate) => {
        const excelKey = `abcd_excel_${userId}_${dDate}`;
        const hourKey  = `abcd_hourEntry_${userId}_${dDate}`;
        const rawExcel = localStorage.getItem(excelKey);
        const rawHour  = localStorage.getItem(hourKey);
        if (!rawExcel || !rawHour) return;

        const excelData = JSON.parse(rawExcel);
        const hourData  = JSON.parse(rawHour);
        const allSets   = excelData.data?.sets || {};
        // Again find the block whose key includes "Set-1"
        const setNameKey = Object.keys(allSets).find((key) =>
          key.toLowerCase().includes('set-1')
        );
        if (!setNameKey) return;
        const setData = allSets[setNameKey];

        // Collect that day’s extracted numbers into a Set
        const dayNums = new Set();
        Object.entries(planetMapping).forEach(([abbr, colName]) => {
          const selectedPlanet = hourData.planetSelections?.[abbr];
          if (!selectedPlanet) return;
          const rawString = setData[colName]?.[selectedPlanet];
          const extracted = extractFirstNumber(rawString);
          if (extracted !== null) {
            dayNums.add(extracted);
          }
        });

        if (dayNums.has(num)) {
          count += 1;
        }
      });
      return count >= 2;
    };

    // 7) Filter the D-day numbers to only those that appear in ≥2 of A, B, C
    const qualified = dTargets.filter((n) => appearsInABC(n));
    setQualifiedNumbers(qualified.sort((a, b) => a - b));
    setLoading(false);
  }, [userId, date]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Running Rule-2 analysis…</p>
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
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-2 Analysis</h1>
              <div className="mt-2 text-sm text-purple-800">
                <p>👤 User: {userId}</p>
                <p>📅 Trigger Date: {new Date(date).toLocaleDateString()}</p>
                <p>⚙️ Using four preceding dates (A, B, C, D) for extraction.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Display Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {qualifiedNumbers.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Qualified Numbers (appear in ≥ 2 of A, B, C):
              </h2>
              <div className="flex flex-wrap gap-3">
                {qualifiedNumbers.map((num) => (
                  <div
                    key={num}
                    className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-mono font-semibold"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-semibold mb-2">No Numbers Qualified</p>
              <p>None of the D-day “Set-1” numbers appeared in at least two of A, B, C.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rule2Page;
