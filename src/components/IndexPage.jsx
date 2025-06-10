// src/components/IndexPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IndexPage = ({
  date,               // clicked date (e.g. "2025-06-05")
  selectedUser,       // current user ID string
  datesList,          // array of all dates for this user (e.g. ["2025-05-22", "2025-05-26", …])
  onBack,             // callback to go back
  onExtractNumbers    // callback(date, activeHR) to open Rule-2
}) => {
  const navigate = useNavigate();
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Abbreviation → exact element name in processedData.sets
  const elementNames = {
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

  // Build a sliding four-day window ending at “date”
  const buildAllDaysData = () => {
    try {
      setLoading(true);
      setError('');

      // 1. Sort all dates ascending (oldest → newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      const targetIdx   = sortedDates.indexOf(date);

      // 2. Determine the window of up to 4 dates ending at the clicked date
      let windowDates;
      if (targetIdx === -1) {
        // clicked date not found → just take the last 4 available
        windowDates = sortedDates.slice(-4);
      } else {
        const end   = targetIdx + 1;           // slice end (exclusive)
        const start = Math.max(0, end - 4);     // can’t go below zero
        windowDates  = sortedDates.slice(start, end);
      }

      // 3. Label those up to 4 days as A, B, C, D (chronological order)
      const labels   = ['A', 'B', 'C', 'D'];
      const assembled = {};

      windowDates.forEach((d, idx) => {
        const label    = labels[idx];  // 'A', 'B', 'C', or 'D'
        const excelKey = `abcd_excel_${selectedUser}_${d}`;
        const hourKey  = `abcd_hourEntry_${selectedUser}_${d}`;
        const excelRaw = localStorage.getItem(excelKey);
        const hourRaw  = localStorage.getItem(hourKey);

        if (excelRaw && hourRaw) {
          const excelData = JSON.parse(excelRaw);
          const hourData  = JSON.parse(hourRaw);
          const planetSel = hourData.planetSelections || {};

          // Build hrData: for each HR, store selectedPlanet + all “sets”
          const hrData = {};
          Object.entries(planetSel).forEach(([hr, selectedPlanet]) => {
            const oneHR = { selectedPlanet, sets: {} };
            Object.entries(excelData.data.sets || {}).forEach(([setName, elementBlock]) => {
              const elementsToShow = {};
              Object.entries(elementBlock).forEach(([elementName, planetMap]) => {
                const rawString = planetMap[selectedPlanet];
                if (rawString) {
                  elementsToShow[elementName] = {
                    rawData: rawString,
                    selectedPlanet
                  };
                }
              });
              oneHR.sets[setName] = elementsToShow;
            });
            hrData[hr] = oneHR;
          });

          assembled[label] = {
            date:      d,
            hrData,
            success:   Object.keys(hrData).length > 0,
            dayLabel:  label
          };
        } else {
          // Missing Excel or HourEntry
          assembled[label] = {
            date:     d,
            hrData:   {},
            success:  false,
            error:    !excelRaw ? 'No Excel data' : 'No Hour Entry data',
            dayLabel: label
          };
        }
      });

      setAllDaysData(assembled);

      // Auto-select first available HR from any of A/B/C/D
      let firstHR = null;
      for (let lbl of ['A', 'B', 'C', 'D']) {
        if (assembled[lbl]?.success) {
          const hrKeys = Object.keys(assembled[lbl].hrData || {});
          if (hrKeys.length) {
            firstHR = hrKeys[0];
            break;
          }
        }
      }
      if (firstHR) setActiveHR(firstHR);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error building index data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser && Array.isArray(datesList) && datesList.length > 0) {
      buildAllDaysData();
    } else {
      setError('Missing required user or dates data.');
      setLoading(false);
    }
  }, [selectedUser, datesList, date]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Loading index data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={onBack}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine the clicked date’s ascending index to gate “Extract Numbers”
  const sortedAll = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  const idxAll    = sortedAll.indexOf(date);
  const canEnableRule2 = idxAll >= 4 && activeHR !== null;

  // Helpers for matrix display
  const generateColumnHeader = (dayObj) => {
    if (!dayObj.success || !activeHR || !dayObj.hrData[activeHR]) {
      return `${dayObj.date}-(${dayObj.dayLabel})`;
    }
    const planet = dayObj.hrData[activeHR].selectedPlanet;
    return `${dayObj.date}-${planet}(${dayObj.dayLabel})`;
  };

  const isDColumn = (dayObj) => dayObj.dayLabel === 'D';
  const headerCellClass = (dayObj) => {
    let base = 'border border-gray-300 px-4 py-2 font-semibold text-center';
    if (isDColumn(dayObj)) {
      base += ' bg-blue-600 text-white';
    } else {
      base += ' bg-gray-50 text-gray-700';
    }
    return base;
  };

  // Determine which labels (A, B, C, D) are present
  const availableLabels = ['A', 'B', 'C', 'D'].filter(lbl => allDaysData[lbl]?.success);
  const hrChoices       = availableLabels.length && allDaysData['D']?.hrData
    ? Object.keys(allDaysData['D'].hrData).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Top Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-orange-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔮 Astrological Index Matrix</h1>
              <div className="mt-2 text-sm text-orange-800">
                <p>👤 User: {selectedUser}</p>
                <p>📅 Clicked Date: {new Date(date).toLocaleDateString()}</p>
                <p>🗓️ Window: {availableLabels.join(', ')}</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* HR Selection & Matrix */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600 mr-4">Select HR:</span>
            {hrChoices.map(hr => (
              <button
                key={hr}
                onClick={() => setActiveHR(hr)}
                className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium ${
                  activeHR === hr
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                }`}
              >
                HR {hr}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeHR ? (
              Array.from(new Set(
                availableLabels.flatMap(lbl => Object.keys(allDaysData[lbl].hrData[activeHR].sets))
              )).map(setName => (
                <div key={setName} className="mb-8">
                  <h2 className="text-lg font-bold mb-3 bg-blue-50 p-2 rounded">
                    {setName}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">
                            Element
                          </th>
                          {availableLabels.map(lbl => {
                            const dayObj = allDaysData[lbl];
                            return (
                              <th key={lbl} className={headerCellClass(dayObj)}>
                                {generateColumnHeader(dayObj)}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const elements = new Set();
                          availableLabels.forEach(lbl => {
                            const hrObj = allDaysData[lbl].hrData[activeHR];
                            Object.keys(hrObj.sets[setName] || {}).forEach(el => elements.add(el));
                          });
                          return Array.from(elements).map(elName => (
                            <tr key={elName} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200">
                                {elName}
                              </td>
                              {availableLabels.map(lbl => {
                                const hrObj     = allDaysData[lbl].hrData[activeHR];
                                const elemMap   = hrObj.sets[setName] || {};
                                const cellValue = elemMap[elName]?.rawData || '—';
                                const baseClass = 'border border-gray-300 px-4 py-2 text-center font-mono text-sm';
                                return (
                                  <td
                                    key={lbl}
                                    className={`${baseClass} ${
                                      isDColumn(allDaysData[lbl])
                                        ? 'ring-2 ring-blue-400 bg-blue-50'
                                        : 'bg-green-50 text-gray-800'
                                    }`}
                                  >
                                    {cellValue}
                                  </td>
                                );
                              })}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg font-semibold mb-2">Select an HR above</p>
                <p>Click an HR tab to view the 4-day matrices</p>
              </div>
            )}
          </div>
        </div>

        {/* Extract Numbers (Rule-2) Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              if (canEnableRule2) {
                onExtractNumbers(date, activeHR);
              }
            }}
            disabled={!canEnableRule2}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              canEnableRule2
                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            Extract Numbers
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
