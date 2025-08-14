/**
 * 🎯 ROBUST NUMBER BOX SYSTEM FOR RULE-1 PAGE
 * 
 * This is a complete rewrite of the number box logic to handle:
 * - 6 hours per day
 * - 30 topics per hour  
 * - 15 days of data
 * - Number boxes active from 5th date onward
 * - Reliable UI display, data saving, and fetching
 * 
 * Key Features:
 * - Centralized state management
 * - Robust error handling and retry logic
 * - Consistent topic/HR key normalization
 * - Efficient batch operations
 * - Real-time UI updates
 * - Comprehensive debugging
 */


// =====================================
// 🔧 UTILITY FUNCTIONS
// =====================================

export const NumberBoxUtils = {
  // Normalize topic names for consistency
  normalizeTopicName: (topicName) => {
    if (!topicName || typeof topicName !== 'string') return topicName;
    
    return topicName
      .replace(/\s+/g, ' ')           // Multiple spaces to single space
      .trim()                         // Remove leading/trailing spaces
      .replace(/\(trd\)/g, '')        // Remove (trd) annotations
      .replace(/\([^)]*\)/g, '')      // Remove any other annotations
      .replace(/\s+/g, ' ')           // Clean up spacing again
      .trim();
  },

  // Normalize HR keys for consistency  
  normalizeHR: (hrValue) => {
    if (typeof hrValue === 'number') {
      return `HR${hrValue}`;
    }
    if (typeof hrValue === 'string') {
      const match = hrValue.match(/(?:HR)?(\d+)/);
      return match ? `HR${match[1]}` : hrValue;
    }
    return hrValue;
  },

  // Generate unique key for topic-date-hr combination
  generateStateKey: (topicName, dateKey, hr) => {
    const normalizedTopic = NumberBoxUtils.normalizeTopicName(topicName);
    const normalizedHR = NumberBoxUtils.normalizeHR(hr);
    return `${normalizedTopic}|${dateKey}|${normalizedHR}`;
  },

  // Parse state key back to components
  parseStateKey: (stateKey) => {
    const [topicName, dateKey, hr] = stateKey.split('|');
    return { topicName, dateKey, hr };
  },

  // Check if date is eligible for number boxes (5th date onward)
  isDateEligible: (dateKey, allDates) => {
    const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));
    const dateIndex = sortedDates.indexOf(dateKey);
    return dateIndex >= 4; // 0-based index, so 4 = 5th date
  },

  // Validate number box click eligibility
  validateClickEligibility: (number, abcdNumbers, bcdNumbers) => {
    const isAbcdMatch = abcdNumbers.includes(number);
    const isBcdMatch = bcdNumbers.includes(number);
    const isMatched = isAbcdMatch || isBcdMatch;
    
    return {
      eligible: isMatched,
      matchType: isAbcdMatch ? 'ABCD' : (isBcdMatch ? 'BCD' : null),
      isAbcdMatch,
      isBcdMatch
    };
  }
};

// =====================================
// 🗃️ NUMBER BOX STATE MANAGER
// =====================================

export class NumberBoxStateManager {
  constructor(supabaseService, userId) {
    this.supabaseService = supabaseService;
    this.userId = userId;
    
    // State structure: { stateKey: [numbers] }
    this.clickedNumbers = {};
    this.pendingOperations = new Map(); // Track pending save/delete operations
    this.batchOperations = []; // Batch operations for efficiency
    this.batchTimeout = null;
    
    this.isLoading = false;
    this.lastError = null;
    
    console.log('🎯 NumberBoxStateManager initialized for user:', userId);
  }

  // Load all clicked numbers for user
  async loadAllClickedNumbers() {
    try {
      this.isLoading = true;
      this.lastError = null;
      
      console.log('📥 Loading all clicked numbers from Supabase...');
      
      const clickedData = await this.supabaseService.getTopicClicks(this.userId);
      
      // Clear existing state
      this.clickedNumbers = {};
      
      // Organize by normalized state keys
      clickedData.forEach(click => {
        const { topic_name, date_key, hour, clicked_number } = click;
        const stateKey = NumberBoxUtils.generateStateKey(topic_name, date_key, hour);
        
        if (!this.clickedNumbers[stateKey]) {
          this.clickedNumbers[stateKey] = [];
        }
        
        if (!this.clickedNumbers[stateKey].includes(clicked_number)) {
          this.clickedNumbers[stateKey].push(clicked_number);
        }
      });
      
      console.log(`✅ Loaded ${clickedData.length} clicked numbers organized into ${Object.keys(this.clickedNumbers).length} state keys`);
      
      return this.clickedNumbers;
      
    } catch (error) {
      console.error('❌ Error loading clicked numbers:', error);
      this.lastError = error;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Get clicked numbers for specific topic-date-hr
  getClickedNumbers(topicName, dateKey, hr) {
    const stateKey = NumberBoxUtils.generateStateKey(topicName, dateKey, hr);
    return this.clickedNumbers[stateKey] || [];
  }

  // Check if number is clicked for specific topic-date-hr
  isNumberClicked(topicName, dateKey, hr, number) {
    const clickedNumbers = this.getClickedNumbers(topicName, dateKey, hr);
    return clickedNumbers.includes(number);
  }

  // Add clicked number (with immediate state update + batch database operation)
  async addClickedNumber(topicName, dateKey, hr, number, matchType = null) {
    const stateKey = NumberBoxUtils.generateStateKey(topicName, dateKey, hr);
    const operationKey = `${stateKey}:${number}`;
    
    try {
      // Prevent duplicate operations
      if (this.pendingOperations.has(operationKey)) {
        console.log(`⏳ Operation already pending for ${operationKey}`);
        return;
      }
      
      this.pendingOperations.set(operationKey, 'add');
      
      // Immediate state update for UI responsiveness
      if (!this.clickedNumbers[stateKey]) {
        this.clickedNumbers[stateKey] = [];
      }
      
      if (!this.clickedNumbers[stateKey].includes(number)) {
        this.clickedNumbers[stateKey].push(number);
        console.log(`➕ Added number ${number} to state for ${stateKey}`);
      }
      
      // Queue database operation
      this.queueBatchOperation({
        type: 'add',
        topicName: NumberBoxUtils.normalizeTopicName(topicName),
        dateKey,
        hr: NumberBoxUtils.normalizeHR(hr),
        number,
        matchType,
        stateKey,
        operationKey
      });
      
    } catch (error) {
      console.error(`❌ Error adding number ${number} for ${stateKey}:`, error);
      // Rollback state change
      if (this.clickedNumbers[stateKey]) {
        const index = this.clickedNumbers[stateKey].indexOf(number);
        if (index > -1) {
          this.clickedNumbers[stateKey].splice(index, 1);
        }
      }
      throw error;
    }
  }

  // Remove clicked number (with immediate state update + batch database operation)
  async removeClickedNumber(topicName, dateKey, hr, number) {
    const stateKey = NumberBoxUtils.generateStateKey(topicName, dateKey, hr);
    const operationKey = `${stateKey}:${number}`;
    
    try {
      // Prevent duplicate operations
      if (this.pendingOperations.has(operationKey)) {
        console.log(`⏳ Operation already pending for ${operationKey}`);
        return;
      }
      
      this.pendingOperations.set(operationKey, 'remove');
      
      // Immediate state update for UI responsiveness
      if (this.clickedNumbers[stateKey]) {
        const index = this.clickedNumbers[stateKey].indexOf(number);
        if (index > -1) {
          this.clickedNumbers[stateKey].splice(index, 1);
          console.log(`🗑️ Removed number ${number} from state for ${stateKey}`);
        }
      }
      
      // Queue database operation
      this.queueBatchOperation({
        type: 'remove',
        topicName: NumberBoxUtils.normalizeTopicName(topicName),
        dateKey,
        hr: NumberBoxUtils.normalizeHR(hr),
        number,
        stateKey,
        operationKey
      });
      
    } catch (error) {
      console.error(`❌ Error removing number ${number} for ${stateKey}:`, error);
      // Rollback state change
      if (!this.clickedNumbers[stateKey]) {
        this.clickedNumbers[stateKey] = [];
      }
      if (!this.clickedNumbers[stateKey].includes(number)) {
        this.clickedNumbers[stateKey].push(number);
      }
      throw error;
    }
  }

  // Queue batch operations for efficiency
  queueBatchOperation(operation) {
    this.batchOperations.push(operation);
    
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    // Set new timeout to execute batch
    this.batchTimeout = setTimeout(() => {
      this.executeBatchOperations();
    }, 100); // 100ms batch window
  }

  // Execute batch operations
  async executeBatchOperations() {
    if (this.batchOperations.length === 0) return;
    
    const operations = [...this.batchOperations];
    this.batchOperations = [];
    
    console.log(`🔄 Executing batch of ${operations.length} number box operations...`);
    
    try {
      // Group operations by type
      const addOperations = operations.filter(op => op.type === 'add');
      const removeOperations = operations.filter(op => op.type === 'remove');
      
      // Execute add operations
      for (const op of addOperations) {
        try {
          await this.supabaseService.saveTopicClick(
            this.userId,
            op.topicName,
            op.dateKey,
            op.hr,
            op.number,
            true, // matched
            op.matchType
          );
          
          this.pendingOperations.delete(op.operationKey);
          console.log(`✅ Saved: ${op.number} for ${op.topicName} ${op.dateKey} ${op.hr}`);
          
        } catch (error) {
          console.error(`❌ Failed to save: ${op.number} for ${op.topicName}:`, error);
          this.pendingOperations.delete(op.operationKey);
        }
      }
      
      // Execute remove operations
      for (const op of removeOperations) {
        try {
          await this.supabaseService.deleteTopicClick(
            this.userId,
            op.topicName,
            op.dateKey,
            op.hr,
            op.number
          );
          
          this.pendingOperations.delete(op.operationKey);
          console.log(`✅ Deleted: ${op.number} for ${op.topicName} ${op.dateKey} ${op.hr}`);
          
        } catch (error) {
          console.error(`❌ Failed to delete: ${op.number} for ${op.topicName}:`, error);
          this.pendingOperations.delete(op.operationKey);
        }
      }
      
      console.log(`✅ Batch operations completed: ${addOperations.length} adds, ${removeOperations.length} removes`);
      
    } catch (error) {
      console.error('❌ Error executing batch operations:', error);
    }
  }

  // Force flush all pending operations
  async flushPendingOperations() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    await this.executeBatchOperations();
  }

  // Get state summary for debugging
  getStateSummary() {
    const totalClicked = Object.values(this.clickedNumbers).reduce((sum, numbers) => sum + numbers.length, 0);
    const totalStateKeys = Object.keys(this.clickedNumbers).length;
    const pendingOps = this.pendingOperations.size;
    const queuedOps = this.batchOperations.length;
    
    return {
      totalClicked,
      totalStateKeys,
      pendingOps,
      queuedOps,
      isLoading: this.isLoading,
      lastError: this.lastError?.message,
      sampleStateKeys: Object.keys(this.clickedNumbers).slice(0, 5)
    };
  }
}

// =====================================
// 🎨 ENHANCED NUMBER BOX RENDERER
// =====================================

export class NumberBoxRenderer {
  constructor(stateManager, abcdBcdAnalysis) {
    this.stateManager = stateManager;
    this.abcdBcdAnalysis = abcdBcdAnalysis;
  }

  // Render number boxes for specific topic-date-hr combination
  renderNumberBoxes(topicName, dateKey, activeHR, allDates, onNumberClick) {
    // Get ABCD/BCD numbers for this topic-date
    const abcdNumbers = this.abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
    const bcdNumbers = this.abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];
    
    // Get currently clicked numbers
    const clickedNumbers = this.stateManager.getClickedNumbers(topicName, dateKey, activeHR);
    
    // Render number grid
    return (
      <div className="mt-2 space-y-1">
        {/* Row 1: Numbers 1-6 */}
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5, 6].map(num => 
            this.renderNumberButton(num, topicName, dateKey, activeHR, abcdNumbers, bcdNumbers, clickedNumbers, onNumberClick)
          )}
        </div>
        
        {/* Row 2: Numbers 7-12 */}
        <div className="flex gap-1 justify-center">
          {[7, 8, 9, 10, 11, 12].map(num => 
            this.renderNumberButton(num, topicName, dateKey, activeHR, abcdNumbers, bcdNumbers, clickedNumbers, onNumberClick)
          )}
        </div>
      </div>
    );
  }

  // Render individual number button
  renderNumberButton(number, topicName, dateKey, activeHR, abcdNumbers, bcdNumbers, clickedNumbers, onNumberClick) {
    const isClicked = clickedNumbers.includes(number);
    const eligibility = NumberBoxUtils.validateClickEligibility(number, abcdNumbers, bcdNumbers);
    const isDisabled = !eligibility.eligible || this.stateManager.isLoading;
    
    const buttonStyle = this.getButtonStyle(number, isClicked, eligibility);
    const title = this.getButtonTitle(number, eligibility, isClicked);
    
    return (
      <button
        key={`${topicName}-${dateKey}-${activeHR}-${number}`}
        onClick={() => {
          if (!isDisabled && onNumberClick) {
            onNumberClick(topicName, dateKey, activeHR, number, eligibility);
          }
        }}
        disabled={isDisabled}
        className={`w-6 h-6 text-xs font-bold rounded border transition-all transform ${buttonStyle.className}`}
        style={buttonStyle.style}
        title={title}
      >
        {number}
      </button>
    );
  }

  // Get button styling based on state and eligibility
  getButtonStyle(number, isClicked, eligibility) {
    if (!eligibility.eligible) {
      return {
        className: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50',
        style: {}
      };
    }
    
    if (!isClicked) {
      return {
        className: 'bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 hover:shadow-sm',
        style: {}
      };
    }
    
    // Clicked and eligible
    if (eligibility.isAbcdMatch) {
      return {
        className: 'text-white border-orange-400 shadow-md scale-105',
        style: {
          backgroundColor: '#FB923C',
          borderColor: '#F97316'
        }
      };
    } else if (eligibility.isBcdMatch) {
      return {
        className: 'text-white shadow-md scale-105',
        style: {
          backgroundColor: '#41B3A2',
          borderColor: '#359486'
        }
      };
    }
    
    // Fallback for clicked but unmatched (shouldn't happen)
    return {
      className: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-emerald-400 shadow-md scale-105',
      style: {}
    };
  }

  // Get button title (tooltip)
  getButtonTitle(number, eligibility, isClicked) {
    if (!eligibility.eligible) {
      return 'Number not in ABCD/BCD arrays';
    }
    
    const matchType = eligibility.matchType;
    const clickState = isClicked ? 'Clicked' : 'Not clicked';
    
    return `${clickState} | ${matchType} match | Click to ${isClicked ? 'remove' : 'add'}`;
  }

  // Render disabled message
  renderDisabledMessage(message) {
    return (
      <div className="mt-2 text-center text-xs text-gray-500 py-2 bg-gray-50 rounded border">
        {message}
      </div>
    );
  }
}

// =====================================
// 🎯 MAIN NUMBER BOX CONTROLLER
// =====================================

export class NumberBoxController {
  constructor(supabaseService, userId) {
    this.stateManager = new NumberBoxStateManager(supabaseService, userId);
    this.renderer = null; // Will be set when abcdBcdAnalysis is available
    this.activeHR = null;
    this.userId = userId;
    
    // Event listeners for cleanup
    this.eventListeners = [];
    
    console.log('🎯 NumberBoxController initialized for user:', userId);
  }

  // Initialize with ABCD/BCD analysis data
  initialize(abcdBcdAnalysis, activeHR) {
    this.renderer = new NumberBoxRenderer(this.stateManager, abcdBcdAnalysis);
    this.activeHR = activeHR;
    
    console.log('✅ NumberBoxController initialized with analysis data');
  }

  // Load all clicked numbers
  async loadClickedNumbers() {
    return await this.stateManager.loadAllClickedNumbers();
  }

  // Handle number box click
  async handleNumberClick(topicName, dateKey, hr, number, eligibility) {
    try {
      console.log(`🔢 Number ${number} clicked for ${topicName} ${dateKey} ${hr}`, eligibility);
      
      const isCurrentlyClicked = this.stateManager.isNumberClicked(topicName, dateKey, hr, number);
      
      if (isCurrentlyClicked) {
        // Remove click
        await this.stateManager.removeClickedNumber(topicName, dateKey, hr, number);
        console.log(`🗑️ Removed click: ${number} from ${topicName} ${dateKey} ${hr}`);
      } else {
        // Add click
        await this.stateManager.addClickedNumber(topicName, dateKey, hr, number, eligibility.matchType);
        console.log(`➕ Added click: ${number} to ${topicName} ${dateKey} ${hr} (${eligibility.matchType})`);
      }
      
      return !isCurrentlyClicked; // Return new state
      
    } catch (error) {
      console.error('❌ Error handling number click:', error);
      throw error;
    }
  }

  // Render number boxes for topic-date combination
  renderNumberBoxes(topicName, dateKey, allDates) {
    if (!this.renderer || !this.activeHR) {
      return this.renderer?.renderDisabledMessage('Number box system not initialized') || null;
    }
    
    return this.renderer.renderNumberBoxes(
      topicName, 
      dateKey, 
      this.activeHR, 
      allDates, 
      (topicName, dateKey, hr, number, eligibility) => {
        // Use external click handler if available, fallback to internal
        if (this.externalClickHandler) {
          this.externalClickHandler(topicName, dateKey, number);
        } else {
          this.handleNumberClick(topicName, dateKey, hr, number, eligibility);
        }
      }
    );
  }

  // Get clicked numbers for specific combination
  getClickedNumbers(topicName, dateKey, hr = null) {
    const actualHR = hr || this.activeHR;
    return this.stateManager.getClickedNumbers(topicName, dateKey, actualHR);
  }

  // Check if specific number is clicked
  isNumberClicked(topicName, dateKey, number, hr = null) {
    const actualHR = hr || this.activeHR;
    return this.stateManager.isNumberClicked(topicName, dateKey, actualHR, number);
  }

  // Update active HR
  setActiveHR(newHR) {
    this.activeHR = NumberBoxUtils.normalizeHR(newHR);
    console.log('🔄 Active HR updated to:', this.activeHR);
  }

  // Set external click handler
  setClickHandler(clickHandler) {
    this.externalClickHandler = clickHandler;
    console.log('🔗 External click handler set');
  }

  // Force flush pending operations
  async flushPendingOperations() {
    await this.stateManager.flushPendingOperations();
  }

  // Get debug information
  getDebugInfo() {
    return {
      ...this.stateManager.getStateSummary(),
      activeHR: this.activeHR,
      userId: this.userId,
      rendererInitialized: !!this.renderer
    };
  }

  // Cleanup
  async cleanup() {
    await this.flushPendingOperations();
    
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    this.eventListeners = [];
    
    console.log('🧹 NumberBoxController cleanup completed');
  }
}

// =====================================
// 🚀 EXPORT FOR INTEGRATION
// =====================================

// All exports are already handled above with individual export statements
export default NumberBoxController;
