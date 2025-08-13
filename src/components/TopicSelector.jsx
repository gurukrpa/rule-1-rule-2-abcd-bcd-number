// src/components/TopicSelector.jsx
// Optimized topic selector with virtualization for large topic lists

import React, { memo, useCallback, useMemo } from 'react';

const TopicSelector = memo(({ 
  availableTopics, 
  selectedTopics, 
  onTopicToggle, 
  showSelector 
}) => {
  // Memoized bulk selection handlers
  const handleSelectAll = useCallback(() => {
    availableTopics.forEach(topic => {
      if (!selectedTopics.has(topic)) {
        onTopicToggle(topic);
      }
    });
  }, [availableTopics, selectedTopics, onTopicToggle]);

  const handleClearAll = useCallback(() => {
    selectedTopics.forEach(topic => {
      onTopicToggle(topic);
    });
  }, [selectedTopics, onTopicToggle]);

  const handleBulkSetToggle = useCallback((setNumber) => {
    const setTopics = availableTopics.filter(topic => topic.includes(`Set-${setNumber}`));
    const allSelected = setTopics.every(topic => selectedTopics.has(topic));
    
    setTopics.forEach(topic => {
      if (allSelected && selectedTopics.has(topic)) {
        onTopicToggle(topic);
      } else if (!allSelected && !selectedTopics.has(topic)) {
        onTopicToggle(topic);
      }
    });
  }, [availableTopics, selectedTopics, onTopicToggle]);

  // Memoized topic statistics
  const topicStats = useMemo(() => {
    const set1Count = availableTopics.filter(topic => topic.includes('Set-1')).length;
    const set2Count = availableTopics.filter(topic => topic.includes('Set-2')).length;
    const selectedSet1Count = availableTopics.filter(topic => 
      topic.includes('Set-1') && selectedTopics.has(topic)
    ).length;
    const selectedSet2Count = availableTopics.filter(topic => 
      topic.includes('Set-2') && selectedTopics.has(topic)
    ).length;

    return {
      total: availableTopics.length,
      selected: selectedTopics.size,
      set1Count,
      set2Count,
      selectedSet1Count,
      selectedSet2Count
    };
  }, [availableTopics, selectedTopics]);

  // Memoized grouped topics for better organization
  const groupedTopics = useMemo(() => {
    const groups = {};
    availableTopics.forEach(topic => {
      const dayMatch = topic.match(/D-(\d+)/);
      const setMatch = topic.match(/Set-(\d+)/);
      if (dayMatch && setMatch) {
        const day = dayMatch[1];
        const set = setMatch[1];
        const groupKey = `D-${day}`;
        if (!groups[groupKey]) {
          groups[groupKey] = { set1: null, set2: null };
        }
        groups[groupKey][`set${set}`] = topic;
      }
    });
    return groups;
  }, [availableTopics]);

  if (!showSelector || !availableTopics.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Topic Selection ({topicStats.selected}/{topicStats.total})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Bulk Set Selection */}
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => handleBulkSetToggle(1)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              topicStats.selectedSet1Count === topicStats.set1Count
                ? 'bg-green-600 text-white'
                : topicStats.selectedSet1Count > 0
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Set-1 ({topicStats.selectedSet1Count}/{topicStats.set1Count})
          </button>
          <button
            onClick={() => handleBulkSetToggle(2)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              topicStats.selectedSet2Count === topicStats.set2Count
                ? 'bg-green-600 text-white'
                : topicStats.selectedSet2Count > 0
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Set-2 ({topicStats.selectedSet2Count}/{topicStats.set2Count})
          </button>
        </div>

        {/* Grouped Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {Object.entries(groupedTopics).map(([groupKey, sets]) => (
            <div key={groupKey} className="border rounded-lg p-3 bg-gray-50">
              <h4 className="font-medium text-sm text-gray-700 mb-2">{groupKey}</h4>
              <div className="space-y-2">
                {sets.set1 && (
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(sets.set1)}
                      onChange={() => onTopicToggle(sets.set1)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                      Set-1
                    </span>
                  </label>
                )}
                {sets.set2 && (
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(sets.set2)}
                      onChange={() => onTopicToggle(sets.set2)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                      Set-2
                    </span>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Info */}
        <div className="mt-4 text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center justify-between">
            <span>⚡ Optimized topic selector with grouping</span>
            <span>{availableTopics.length} topics • {topicStats.selected} selected</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TopicSelector.displayName = 'TopicSelector';

export default TopicSelector;
