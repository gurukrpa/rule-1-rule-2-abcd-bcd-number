// src/services/UnifiedNumberBoxService.js
// ✅ UNIFIED NUMBER BOX SERVICE: Works across Rule1 and PlanetsAnalysis pages
// Handles all number box clicking, highlighting, counting, and cross-page synchronization

import { supabase } from '../supabaseClient';
import cleanSupabaseService from './CleanSupabaseService';

class UnifiedNumberBoxService {
  constructor() {
    this.listeners = new Set();
    this.cache = {
      clickedNumbers: {},  // {userId: {topic: {date: {hour: [numbers]}}}}
      analysisData: {},    // {topic: {date: {abcdNumbers: [], bcdNumbers: []}}}
      counts: {}          // {userId: {date: {hour: count}}}
    };
    
    this.initializeEventSystem();
  }

  // ✅ EVENT SYSTEM: Real-time updates across pages
  initializeEventSystem() {
    // Listen for changes in the number_clicks table
    this.supabaseSubscription = supabase
      .channel('number_clicks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'number_clicks' },
        (payload) => {
          console.log('🔄 [UnifiedNumberBox] Real-time update:', payload);
          this.notifyListeners('numberClick', payload);
        }
      )
      .subscribe();

    console.log('✅ [UnifiedNumberBox] Event system initialized');
  }

  // ✅ LISTENER MANAGEMENT
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('❌ [UnifiedNumberBox] Listener error:', error);
      }
    });
  }

  // ✅ CORE NUMBER BOX LOGIC: Click handling with database persistence
  async clickNumber(userId, topic, date, hour, number) {
    try {
      console.log(`🔢 [UnifiedNumberBox] Click: ${number} for ${topic}/${date}/HR${hour}`);

      // Get current state
      const currentNumbers = await this.getClickedNumbers(userId, topic, date, hour);
      const isCurrentlyClicked = currentNumbers.includes(number);

      if (isCurrentlyClicked) {
        // Remove from database
        await cleanSupabaseService.removeTopicClick(userId, topic, date, hour, number);
        console.log(`➖ [UnifiedNumberBox] Removed number ${number}`);
      } else {
        // Add to database  
        await cleanSupabaseService.addTopicClick(userId, topic, date, hour, number);
        console.log(`➕ [UnifiedNumberBox] Added number ${number}`);
      }

      // Update cache
      await this.refreshCache(userId);
      
      // Notify listeners
      this.notifyListeners('numberClick', {
        userId, topic, date, hour, number, 
        action: isCurrentlyClicked ? 'removed' : 'added'
      });

      // Trigger highlighting update
      await this.updateHighlighting(topic, date);

      return !isCurrentlyClicked; // Return new state

    } catch (error) {
      console.error('❌ [UnifiedNumberBox] Click error:', error);
      throw error;
    }
  }

  // ✅ GET CLICKED NUMBERS: From cache or database
  async getClickedNumbers(userId, topic, date, hour) {
    try {
      const cacheKey = `${userId}|${topic}|${date}|${hour}`;
      
      // Check cache first
      if (this.cache.clickedNumbers[cacheKey]) {
        return [...this.cache.clickedNumbers[cacheKey]];
      }

      // Load from database
      const data = await cleanSupabaseService.getTopicClicks(userId);
      const filtered = data.filter(click => 
        click.topic_name === topic && 
        click.date_key === date && 
        click.hour === `HR${hour}`
      );

      const numbers = filtered.map(click => click.clicked_number);
      
      // Update cache
      this.cache.clickedNumbers[cacheKey] = new Set(numbers);
      
      return numbers;

    } catch (error) {
      console.error('❌ [UnifiedNumberBox] Get clicked numbers error:', error);
      return [];
    }
  }

  // ✅ CHECK IF NUMBER IS CLICKED
  async isNumberClicked(userId, topic, date, hour, number) {
    const clickedNumbers = await this.getClickedNumbers(userId, topic, date, hour);
    return clickedNumbers.includes(number);
  }

  // ✅ GET ALL CLICKED NUMBERS FOR USER: Organized by topic/date/hour
  async getAllClickedNumbers(userId) {
    try {
      const data = await cleanSupabaseService.getTopicClicks(userId);
      
      const organized = {};
      data.forEach(click => {
        const { topic_name, date_key, hour, clicked_number } = click;
        
        if (!organized[topic_name]) organized[topic_name] = {};
        if (!organized[topic_name][date_key]) organized[topic_name][date_key] = {};
        if (!organized[topic_name][date_key][hour]) organized[topic_name][date_key][hour] = [];
        
        organized[topic_name][date_key][hour].push(clicked_number);
      });

      return organized;

    } catch (error) {
      console.error('❌ [UnifiedNumberBox] Get all clicked numbers error:', error);
      return {};
    }
  }

  // ✅ HIGHLIGHTING LOGIC: Determine if cell should be highlighted
  shouldHighlightCell(cellValue, topic, date, userId, hour) {
    // Extract number from cell value (handles formats like "var-10-le", "as-1-ta", etc.)
    const numberMatch = cellValue.match(/-(\d+)-/);
    if (!numberMatch) return { highlighted: false };

    const cellNumber = parseInt(numberMatch[1]);
    const cacheKey = `${userId}|${topic}|${date}|${hour}`;
    
    // Check if number was clicked
    const clickedNumbers = this.cache.clickedNumbers[cacheKey] || new Set();
    const wasClicked = clickedNumbers.has(cellNumber);

    if (!wasClicked) return { highlighted: false };

    // Determine highlight type based on analysis data
    const analysisKey = `${topic}|${date}`;
    const analysis = this.cache.analysisData[analysisKey];

    if (analysis) {
      const { abcdNumbers = [], bcdNumbers = [] } = analysis;
      
      if (abcdNumbers.includes(cellNumber)) {
        return { highlighted: true, type: 'ABCD' };
      } else if (bcdNumbers.includes(cellNumber)) {
        return { highlighted: true, type: 'BCD' };
      }
    }

    // Always highlight clicked numbers (ensures persistence after refresh)
    return { highlighted: true, type: 'CLICKED' };
  }

  // ✅ UPDATE HIGHLIGHTING: Force DOM update
  async updateHighlighting(topic, date) {
    console.log(`🎨 [UnifiedNumberBox] Updating highlighting for ${topic}/${date}`);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.applyDOMHighlighting();
    }, 100);
  }

  // ✅ DOM HIGHLIGHTING: Direct manipulation for immediate visual feedback
  applyDOMHighlighting() {
    const cells = document.querySelectorAll('td, .matrix-cell, .cell');
    let highlightedCount = 0;

    cells.forEach(cell => {
      const text = cell.textContent || cell.innerText || '';
      const numberMatch = text.match(/-(\d+)-/);
      
      if (numberMatch) {
        const cellNumber = parseInt(numberMatch[1]);
        let shouldHighlight = false;

        // Check all cached clicked numbers
        Object.values(this.cache.clickedNumbers).forEach(clickedSet => {
          if (clickedSet && clickedSet.has(cellNumber)) {
            shouldHighlight = true;
          }
        });

        if (shouldHighlight) {
          // Apply highlight styling
          cell.style.backgroundColor = '#FCE7C8';
          cell.style.color = '#8B4513';
          cell.style.fontWeight = 'bold';
          cell.style.border = '2px solid #FB923C';
          cell.style.boxShadow = '0 4px 6px -1px rgba(251, 146, 60, 0.3)';
          highlightedCount++;
        } else {
          // Reset styling
          cell.style.backgroundColor = '';
          cell.style.color = '';
          cell.style.fontWeight = '';
          cell.style.border = '';
          cell.style.boxShadow = '';
        }
      }
    });

    console.log(`✅ [UnifiedNumberBox] Applied highlighting to ${highlightedCount} cells`);
  }

  // ✅ COUNT LOGIC: Calculate highlighted topics count
  async calculateHighlightedCount(userId, date, hour) {
    try {
      const allClicked = await this.getAllClickedNumbers(userId);
      let count = 0;

      // Count topics that have clicked numbers which are also highlighted
      Object.keys(allClicked).forEach(topic => {
        const dateData = allClicked[topic][date];
        if (!dateData) return;

        const hourData = dateData[`HR${hour}`];
        if (!hourData || hourData.length === 0) return;

        // Check if any clicked numbers would be highlighted
        const analysisKey = `${topic}|${date}`;
        const analysis = this.cache.analysisData[analysisKey];
        
        if (analysis) {
          const { abcdNumbers = [], bcdNumbers = [] } = analysis;
          const hasHighlightedNumbers = hourData.some(num => 
            abcdNumbers.includes(num) || bcdNumbers.includes(num)
          );
          
          if (hasHighlightedNumbers) {
            count++;
          }
        } else {
          // If no analysis data, count it anyway (clicked numbers will show)
          count++;
        }
      });

      // Update cache
      const countKey = `${userId}|${date}|${hour}`;
      this.cache.counts[countKey] = count;

      console.log(`📊 [UnifiedNumberBox] Count for ${date}/HR${hour}: ${count} topics`);
      return count;

    } catch (error) {
      console.error('❌ [UnifiedNumberBox] Count calculation error:', error);
      return 0;
    }
  }

  // ✅ REFRESH CACHE: Reload data from database
  async refreshCache(userId) {
    try {
      console.log('🔄 [UnifiedNumberBox] Refreshing cache...');
      
      // Clear existing cache
      this.cache.clickedNumbers = {};
      
      // Reload clicked numbers
      const data = await cleanSupabaseService.getTopicClicks(userId);
      
      data.forEach(click => {
        const { topic_name, date_key, hour, clicked_number } = click;
        const cacheKey = `${userId}|${topic_name}|${date_key}|${hour.replace('HR', '')}`;
        
        if (!this.cache.clickedNumbers[cacheKey]) {
          this.cache.clickedNumbers[cacheKey] = new Set();
        }
        
        this.cache.clickedNumbers[cacheKey].add(clicked_number);
      });

      console.log('✅ [UnifiedNumberBox] Cache refreshed');

    } catch (error) {
      console.error('❌ [UnifiedNumberBox] Cache refresh error:', error);
    }
  }

  // ✅ SET ANALYSIS DATA: Store ABCD/BCD data for highlighting logic
  setAnalysisData(topic, date, abcdNumbers, bcdNumbers) {
    const key = `${topic}|${date}`;
    this.cache.analysisData[key] = { abcdNumbers, bcdNumbers };
    console.log(`📊 [UnifiedNumberBox] Stored analysis data for ${topic}/${date}`);
  }

  // ✅ CLEANUP
  destroy() {
    if (this.supabaseSubscription) {
      this.supabaseSubscription.unsubscribe();
    }
    this.listeners.clear();
    this.cache = { clickedNumbers: {}, analysisData: {}, counts: {} };
    console.log('🧹 [UnifiedNumberBox] Service destroyed');
  }
}

// Create singleton instance
const unifiedNumberBoxService = new UnifiedNumberBoxService();

export default unifiedNumberBoxService;
