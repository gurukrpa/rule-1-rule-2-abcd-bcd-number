// Example usage component showing how to use the new database system
// for easy D-date addition in Rule-1

import React, { useState, useEffect } from 'react';
import { useRule1DDateManager } from '../hooks/useRule1DDateManager';
import { PagesDataService } from '../services/PagesDataService';

const Rule1DDateManager = ({ userId }) => {
  const {
    currentSequence,
    readyForNewDate,
    loading,
    error,
    addNewDDate,
    getCurrentSequenceInfo
  } = useRule1DDateManager(userId);

  const [newDDate, setNewDDate] = useState('');
  const [newDDateData, setNewDDateData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const sequenceInfo = getCurrentSequenceInfo();

  // Auto-suggest next D-date
  useEffect(() => {
    if (sequenceInfo?.nextSuggestedDDate) {
      setNewDDate(sequenceInfo.nextSuggestedDDate);
    }
  }, [sequenceInfo]);

  const handleAddNewDDate = async () => {
    if (!newDDate || !newDDateData) {
      alert('Please provide both new D-date and processed data');
      return;
    }

    setProcessing(true);
    try {
      const result = await addNewDDate(newDDate, newDDateData);
      
      if (result.success) {
        alert(`Successfully added new D-date: ${newDDate}\nABCD/BCD analysis complete: ${result.analysisResults.length} results`);
        setNewDDate('');
        setNewDDateData(null);
      } else {
        alert(`Failed to add D-date: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Process Excel file and extract data
      // This would be similar to existing Excel processing logic
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Parse Excel and create processed data structure
          const processedData = processExcelFile(e.target.result);
          setNewDDateData(processedData);
        } catch (err) {
          alert(`Error processing Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Mock Excel processing function (replace with actual implementation)
  const processExcelFile = (arrayBuffer) => {
    // This should contain the actual Excel processing logic
    // Returns data in the format expected by the database
    return {
      sets: {
        'D-1 Set-1 Matrix': {
          'Lagna': {
            '1': {
              raw: 'as-7-/su-(10 Sc 03)-(17 Ta 58)',
              formatted: 'as-7-/su-sc (10 Sc 03)-(17 Ta 58)',
              extractedNumber: 7,
              planetCode: 'su',
              signCode: 'sc'
            }
          }
          // ... more elements and HRs
        }
        // ... more sets
      }
    };
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">
          <h3 className="font-semibold">Error loading Rule-1 data</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!readyForNewDate) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800">
          <h3 className="font-semibold">No Rule-1 sequence found</h3>
          <p className="text-sm mt-1">
            Please create an initial Rule-1 analysis with 4 dates (A, B, C, D) first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Sequence Display */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Current Rule-1 Sequence
        </h3>
        
        {sequenceInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">A-Date:</span>
              <br />
              {sequenceInfo.aDate}
            </div>
            <div>
              <span className="font-medium text-blue-700">B-Date:</span>
              <br />
              {sequenceInfo.bDate}
            </div>
            <div>
              <span className="font-medium text-blue-700">C-Date:</span>
              <br />
              {sequenceInfo.cDate}
            </div>
            <div>
              <span className="font-medium text-blue-700">D-Date:</span>
              <br />
              {sequenceInfo.dDate}
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Selected HR:</strong> {sequenceInfo?.selectedHR}
            <br />
            <strong>Trigger Date:</strong> {sequenceInfo?.triggerDate}
          </p>
        </div>
      </div>

      {/* Add New D-Date Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New D-Date
        </h3>
        
        <div className="space-y-4">
          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New D-Date
            </label>
            <input
              type="date"
              value={newDDate}
              onChange={(e) => setNewDDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Suggested: {sequenceInfo?.nextSuggestedDDate}
            </p>
          </div>

          {/* Excel File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel Data for New D-Date
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Data Preview */}
          {newDDateData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ Excel data processed successfully
                <br />
                Sets: {Object.keys(newDDateData.sets || {}).length}
                <br />
                Elements: {Object.keys(newDDateData.sets?.['D-1 Set-1 Matrix'] || {}).length}
              </p>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddNewDDate}
            disabled={!newDDate || !newDDateData || processing}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              processing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : newDDate && newDDateData
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {processing ? 'Processing...' : 'Add D-Date & Run Analysis'}
          </button>
        </div>

        {/* How it Works */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium text-gray-900 mb-2">How it Works:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Current sequence: A → B → C → D</li>
            <li>New sequence becomes: B → C → D → New D</li>
            <li>ABCD/BCD analysis runs automatically</li>
            <li>Results stored in database for future reference</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Rule1DDateManager;
