// PlanetsUIComponents.js - Enhanced UI components for Planets Analysis
// Modular components for rendering different sections of the interface

import React from 'react';

export const UserSelector = ({ users, selectedUser, onUserChange, loading }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select User:
    </label>
    <select
      value={selectedUser}
      onChange={(e) => onUserChange(e.target.value)}
      disabled={loading}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select a user...</option>
      {users.map(user => (
        <option key={user.id} value={user.id}>
          {user.username} ({user.id})
        </option>
      ))}
    </select>
  </div>
);

export const DateSelector = ({ datesList, selectedDate, onDateChange, loading }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Date:
    </label>
    <select
      value={selectedDate}
      onChange={(e) => onDateChange(e.target.value)}
      disabled={loading || datesList.length === 0}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select a date...</option>
      {datesList.map(date => (
        <option key={date} value={date}>{date}</option>
      ))}
    </select>
  </div>
);

export const HRSelector = ({ activeHR, onHRChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Active HR:
    </label>
    <select
      value={activeHR}
      onChange={(e) => onHRChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {Array.from({ length: 24 }, (_, i) => i + 1).map(hr => (
        <option key={hr} value={hr.toString()}>{hr}</option>
      ))}
    </select>
  </div>
);

export const TopicSelector = ({ 
  availableTopics, 
  selectedTopics, 
  onTopicsChange, 
  showTopicSelector, 
  onToggleSelector 
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-800">Topic Selection</h3>
      <button
        onClick={onToggleSelector}
        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
      >
        {showTopicSelector ? 'Hide' : 'Show'} Topics
      </button>
    </div>
    
    {showTopicSelector && (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
        {availableTopics.map(topic => (
          <label key={topic} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selectedTopics.has(topic)}
              onChange={(e) => {
                const newSelected = new Set(selectedTopics);
                if (e.target.checked) {
                  newSelected.add(topic);
                } else {
                  newSelected.delete(topic);
                }
                onTopicsChange(newSelected);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="truncate">{topic}</span>
          </label>
        ))}
      </div>
    )}
    
    <div className="mt-2 text-sm text-gray-600">
      Selected: {selectedTopics.size} of {availableTopics.length} topics
    </div>
  </div>
);

export const ExcelUploadSection = ({ onFileUpload, uploading }) => (
  <div className="mb-6 p-4 border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Excel Upload</h3>
    <div className="flex items-center space-x-3">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && (
        <div className="text-sm text-blue-600">Uploading...</div>
      )}
    </div>
  </div>
);

export const StatusMessages = ({ error, success }) => (
  <>
    {error && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
        {error}
      </div>
    )}
    {success && (
      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
        {success}
      </div>
    )}
  </>
);

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

export const DataSummary = ({ targetData, planetsData }) => {
  if (!targetData && !planetsData) return null;

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {targetData && (
          <>
            <div>
              <span className="font-medium">Selected Planet:</span>
              <div className="text-lg font-bold text-blue-600">{targetData.selectedPlanet}</div>
            </div>
            <div>
              <span className="font-medium">Available Sets:</span>
              <div className="text-lg font-bold text-green-600">{Object.keys(targetData.sets || {}).length}</div>
            </div>
          </>
        )}
        {planetsData && (
          <>
            <div>
              <span className="font-medium">Excel File:</span>
              <div className="text-sm text-gray-600 truncate">{planetsData.fileName || 'Unknown'}</div>
            </div>
            <div>
              <span className="font-medium">Upload Date:</span>
              <div className="text-sm text-gray-600">
                {planetsData.uploadedAt ? new Date(planetsData.uploadedAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ElementCard = ({ elementName, planetData, badge, onClick, isSelected }) => (
  <div 
    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
      isSelected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-sm text-gray-800 truncate">{elementName}</h4>
      {badge && (
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
          badge === 'ABCD' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {badge}
        </span>
      )}
    </div>
    <div className="text-xs text-gray-600">
      <div className="truncate">{planetData.rawData || 'No data'}</div>
      {planetData.extractedNumber !== null && (
        <div className="font-semibold text-blue-600 mt-1">
          Number: {planetData.extractedNumber}
        </div>
      )}
    </div>
  </div>
);

export const SetSection = ({ setName, elements, onElementClick, selectedElements }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{setName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(elements).map(([elementName, planetData]) => (
        <ElementCard
          key={elementName}
          elementName={elementName}
          planetData={planetData}
          badge={planetData.badge}
          onClick={() => onElementClick(setName, elementName)}
          isSelected={selectedElements.has(`${setName}_${elementName}`)}
        />
      ))}
    </div>
  </div>
);

export const Rule1Section = ({ rule1Data, loading }) => {
  if (loading) {
    return <LoadingSpinner message="Loading Rule-1 data..." />;
  }

  if (!rule1Data) {
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Rule-1 Integration</h3>
        <p className="text-gray-600">No Rule-1 data available. Need at least 5 dates for analysis.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Rule-1 Integration</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className="font-medium">Target Date:</span>
          <div className="text-lg font-bold text-green-600">{rule1Data.targetDate}</div>
        </div>
        <div>
          <span className="font-medium">Data Source:</span>
          <div className="text-sm text-gray-600">{rule1Data.dataDate}</div>
        </div>
        <div>
          <span className="font-medium">Planet:</span>
          <div className="text-lg font-bold text-blue-600">{rule1Data.selectedPlanet}</div>
        </div>
        <div>
          <span className="font-medium">Sets Analyzed:</span>
          <div className="text-lg font-bold text-purple-600">
            {Object.keys(rule1Data.analysis || {}).length}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600">
        <strong>Analysis Sequence:</strong> {rule1Data.abcdSequence?.join(' → ') || 'N/A'}
      </div>
    </div>
  );
};
