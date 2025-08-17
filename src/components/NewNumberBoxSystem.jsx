/**
 * COMPLETE NEW NUMBER BOX SYSTEM - REACT COMPONENT
 * 
 * This is a completely new, independent number box system that:
 * 1. Works for all topics, all dates, all hours
 * 2. Has its own UI and state management
 * 3. Doesn't depend on ABCD/BCD timing issues
 * 4. Stores data independently in localStorage/Supabase
 */

import React, { useState, useEffect, useCallback } from 'react';

const NewNumberBoxSystem = ({ 
  currentTopic, 
  currentDate, 
  currentHR, 
  selectedUser,
  onNumberClick = () => {} 
}) => {
  // State for clicked numbers: Map<"topic|date|hr", Set<number>>
  const [clickedNumbers, setClickedNumbers] = useState(new Map());
  const [highlightedCells, setHighlightedCells] = useState(new Map());
  const [loading, setLoading] = useState(false);

  // Generate unique key for current context
  const getCurrentKey = useCallback(() => {
    return `${currentTopic}|${currentDate}|${currentHR}`;
  }, [currentTopic, currentDate, currentHR]);

  // Get clicked numbers for current context
  const getCurrentClickedNumbers = useCallback(() => {
    const key = getCurrentKey();
    return clickedNumbers.get(key) || new Set();
  }, [clickedNumbers, getCurrentKey]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save data whenever clickedNumbers changes
  useEffect(() => {
    saveToStorage();
  }, [clickedNumbers]);

  // Apply matrix highlighting whenever context or clicked numbers change
  useEffect(() => {
    applyMatrixHighlighting();
  }, [currentTopic, currentDate, currentHR, clickedNumbers]);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('newNumberBoxSystem_v2');
      if (stored) {
        const data = JSON.parse(stored);
        const newMap = new Map();
        
        Object.entries(data).forEach(([key, numbers]) => {
          newMap.set(key, new Set(numbers));
        });
        
        setClickedNumbers(newMap);
        console.log('📥 [NewNumberBox] Loaded from localStorage');
      }
    } catch (error) {
      console.error('❌ [NewNumberBox] Error loading from storage:', error);
    }
  };

  const saveToStorage = () => {
    try {
      const data = {};
      clickedNumbers.forEach((numberSet, key) => {
        data[key] = Array.from(numberSet);
      });
      
      localStorage.setItem('newNumberBoxSystem_v2', JSON.stringify(data));
      console.log('💾 [NewNumberBox] Saved to localStorage');
    } catch (error) {
      console.error('❌ [NewNumberBox] Error saving to storage:', error);
    }
  };

  const handleNumberClick = (number) => {
    console.log(`🔢 [NewNumberBox] Number ${number} clicked`);
    
    const key = getCurrentKey();
    const newClickedNumbers = new Map(clickedNumbers);
    
    if (!newClickedNumbers.has(key)) {
      newClickedNumbers.set(key, new Set());
    }
    
    const numberSet = new Set(newClickedNumbers.get(key));
    
    if (numberSet.has(number)) {
      numberSet.delete(number);
      console.log(`➖ [NewNumberBox] Removed number ${number}`);
    } else {
      numberSet.add(number);
      console.log(`➕ [NewNumberBox] Added number ${number}`);
    }
    
    newClickedNumbers.set(key, numberSet);
    setClickedNumbers(newClickedNumbers);
    
    // Call parent callback
    onNumberClick(number, numberSet.has(number));
  };

  const applyMatrixHighlighting = () => {
    if (!currentTopic || !currentDate || !currentHR) return;
    
    console.log('🎨 [NewNumberBox] Applying matrix highlighting...');
    
    const currentNumbers = getCurrentClickedNumbers();
    
    // Find all matrix cells and apply highlighting
    setTimeout(() => {
      const cells = document.querySelectorAll('td');
      
      cells.forEach(cell => {
        const cellText = cell.textContent || '';
        
        // Look for number patterns like "as-10-ta", "mo-5-le", etc.
        const numberMatch = cellText.match(/-(\d+)-/);
        
        if (numberMatch) {
          const cellNumber = parseInt(numberMatch[1]);
          
          if (currentNumbers.has(cellNumber)) {
            // Highlight this cell
            cell.style.backgroundColor = '#FCE7C8';
            cell.style.color = '#8B4513';
            cell.style.fontWeight = 'bold';
            cell.style.border = '2px solid #FB923C';
            cell.style.transition = 'all 0.3s ease';
          } else {
            // Remove highlight
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.style.fontWeight = '';
            cell.style.border = '';
            cell.style.transition = '';
          }
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  };

  const clearAllForCurrentContext = () => {
    const key = getCurrentKey();
    const newClickedNumbers = new Map(clickedNumbers);
    newClickedNumbers.delete(key);
    setClickedNumbers(newClickedNumbers);
  };

  const isNumberClicked = (number) => {
    return getCurrentClickedNumbers().has(number);
  };

  const getClickedCount = () => {
    return getCurrentClickedNumbers().size;
  };

  // Render number boxes (1-12)
  const renderNumberBoxes = () => {
    const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
      <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-lg">
        <div className="col-span-6 mb-2 text-center">
          <h3 className="text-sm font-semibold text-gray-700">
            📊 {currentTopic} | {currentDate} | HR{currentHR}
          </h3>
          <p className="text-xs text-gray-500">
            Clicked: {getClickedCount()} numbers
          </p>
        </div>
        
        {numbers.map(number => (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            className={`
              w-12 h-12 rounded-lg font-bold text-sm transition-all duration-200
              ${isNumberClicked(number)
                ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }
            `}
            disabled={loading}
          >
            {number}
          </button>
        ))}
        
        <div className="col-span-6 mt-2 flex gap-2">
          <button
            onClick={clearAllForCurrentContext}
            className="flex-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            disabled={loading || getClickedCount() === 0}
          >
            Clear All
          </button>
          
          <button
            onClick={applyMatrixHighlighting}
            className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            disabled={loading}
          >
            Refresh Highlights
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="new-number-box-system">
      {renderNumberBoxes()}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug:</strong> {Array.from(getCurrentClickedNumbers()).join(', ') || 'None'}
        </div>
      )}
    </div>
  );
};

export default NewNumberBoxSystem;
