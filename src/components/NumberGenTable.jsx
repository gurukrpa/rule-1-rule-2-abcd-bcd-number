import React, { useState } from 'react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const NumberGenTable = ({ combinations, onDeleteCombination, onClearAll }) => {
  // State for manual date input - initialize with today's date
  const getTodaysDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };
  
  const [customDate, setCustomDate] = useState(getTodaysDate());

  // Determine the number of positions from the first combination
  const numPositions = combinations.length > 0 ? combinations[0].numbers.length : 0;
  
  // Get the planet names for headers from the first combination
  const planetHeaders = combinations.length > 0 ? combinations[0].planets : [];

  // Generate alphanumeric labels (A1-A50, B1-B50, C1-C50, etc.)
  const generateAlphanumericLabel = (index) => {
    const letterIndex = Math.floor(index / 50);
    const numberIndex = (index % 50) + 1;
    const letter = String.fromCharCode(65 + letterIndex); // A, B, C, etc.
    return `${letter}${numberIndex}`;
  };

  // Handle export with custom date
    const handleExportWithDate = (type) => {
    try {
      const customDate = exportDate.trim() === '' ? getCurrentDate() : exportDate;
      
      if (type === 'excel') {
        exportToExcel(combinations, 'planet-combinations', customDate);
      } else if (type === 'pdf') {
        exportToPDF(combinations, 'planet-combinations', customDate);
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      alert(`Error exporting to ${type}. Please try again.`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Total Lines: {combinations ? combinations.length : 0}
          </h3>
        </div>
        
        {/* Always visible date input */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Export Date:</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>          
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleExportWithDate(exportToExcel, 'planet-combinations')}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              title="Download Excel file with Label and Planet columns"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={() => handleExportWithDate(exportToPDF, 'planet-combinations')}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              title="Download PDF file with Label and Planet columns"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
            {combinations && combinations.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Only show table when there are combinations */}
      {combinations && combinations.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  {/* Dynamically generate planet columns */}
                  {planetHeaders.map((planet, index) => (
                    <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {planet}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinations.map((combination, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {generateAlphanumericLabel(index)}
                    </td>
                    {/* Dynamically render all position values */}
                    {combination.numbers.map((number, posIndex) => (
                      <td key={posIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {number}
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {combination.numbers.reduce((sum, num) => sum + num, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {combination.planets.map((planet, planetIndex) => (
                          <span
                            key={planetIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {planet}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => onDeleteCombination(index)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete combination"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {combinations.length > 10 && (
            <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-600">
              Showing {combinations.length} combinations
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No combinations generated yet</p>
          <p className="text-sm">Generate planet combinations to see the results table and enable export functionality.</p>
        </div>
      )}
    </div>
  );
};

export default NumberGenTable;
