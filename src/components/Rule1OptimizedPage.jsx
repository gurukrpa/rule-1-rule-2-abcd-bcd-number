// src/components/Rule1OptimizedPage.jsx
// Ultra-fast, optimized Rule1Page with zero-delay data fetching

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import optimizedRule1Service from '../services/OptimizedRule1Service';
import '../styles/Rule1PageOptimized.css';

function Rule1OptimizedPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State management with optimized updates
  const [datesList, setDatesList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(userId);
  const [topicsData, setTopicsData] = useState({});
  const [clickedNumbers, setClickedNumbers] = useState({});
  const [highlightedNumbers, setHighlightedNumbers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState({
    cacheHitRate: 0,
    avgResponseTime: 0,
    totalRequests: 0,
    errors: 0
  });

  // Performance tracking
  const [pendingClicks, setPendingClicks] = useState(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [renderCount, setRenderCount] = useState(0);

  // Refs for synchronized scrolling and performance optimization
  const scrollContainerRefs = useRef({});
  const abortControllerRef = useRef(null);
  const performanceMonitorRef = useRef(null);
  const batchUpdateTimeoutRef = useRef(null);

  // Performance monitoring
  useEffect(() => {
    performanceMonitorRef.current = setInterval(() => {
      const metrics = optimizedRule1Service.getPerformanceMetrics();
      setPerformance(metrics);
    }, 1000);

    return () => {
      if (performanceMonitorRef.current) {
        clearInterval(performanceMonitorRef.current);
      }
    };
  }, []);

  // Track render count for optimization monitoring
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastUpdateTime(Date.now());
  });

  // Initialize and load all data with prefetching
  const loadAllData = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      setError(null);

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Get dates and topics with optimized parallel loading
      const startTime = performance.now();
      
      const [dates, topics] = await Promise.all([
        optimizedRule1Service.getDatesForUser(selectedUser),
        optimizedRule1Service.getTopicsForUser(selectedUser)
      ]);

      setDatesList(dates || []);

      if (topics && topics.length > 0) {
        // Load all data with intelligent prefetching
        const dataPromises = topics.map(async (topic) => {
          const topicData = await optimizedRule1Service.getTopicDataOptimized(
            selectedUser,
            topic,
            dates,
            { signal: abortControllerRef.current?.signal }
          );
          
          // Prefetch next likely data
          optimizedRule1Service.prefetchAdjacentData(selectedUser, topic, dates);
          
          return { topic, data: topicData };
        });

        const results = await Promise.all(dataPromises);
        
        // Batch update state for better performance
        const newTopicsData = {};
        const newClickedNumbers = {};
        const newHighlightedNumbers = {};

        results.forEach(({ topic, data }) => {
          newTopicsData[topic] = data.topicData || {};
          newClickedNumbers[topic] = data.clickedNumbers || {};
          newHighlightedNumbers[topic] = data.highlightedNumbers || {};
        });

        // Optimistic updates
        setTopicsData(newTopicsData);
        setClickedNumbers(newClickedNumbers);
        setHighlightedNumbers(newHighlightedNumbers);

        const loadTime = performance.now() - startTime;
        console.log(`🚀 [Rule1Optimized] Data loaded in ${loadTime.toFixed(2)}ms`);
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ [Rule1Optimized] Loading error:', error);
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  // Load data when user changes or component mounts
  useEffect(() => {
    loadAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadAllData]);

  // Cross-page sync for bi-directional unclicking
  useEffect(() => {
    // Listen for planet analysis unclick events
    const handlePlanetMessage = (event) => {
      if (event.data?.type === 'planet-analysis-unclick' && event.data?.clickData) {
        const { topicName, number, userId: eventUserId, dateKey } = event.data.clickData;
        // Only process if it's for the same user
        if (eventUserId === selectedUser) {
          console.log(`🔄 [Rule1Optimized] Received unclick from Planet Analysis: ${number} from ${topicName} for date ${dateKey}`);
          // Update local state to unclick the number for the specific dateKey
          setClickedNumbers(prev => {
            const newState = { ...prev };
            if (newState[topicName] && newState[topicName][dateKey] && newState[topicName][dateKey][number]) {
              delete newState[topicName][dateKey][number];
              console.log(`➖ [Rule1Optimized] Cross-page unclick: ${number} from ${topicName}-${dateKey}`);
              // Clean up empty objects
              if (Object.keys(newState[topicName][dateKey]).length === 0) {
                delete newState[topicName][dateKey];
              }
              if (Object.keys(newState[topicName]).length === 0) {
                delete newState[topicName];
              }
            }
            return newState;
          });
        }
      }

      // Listen for planet analysis click events
      if (event.data?.type === 'planet-analysis-click' && event.data?.clickData) {
        const { topicName, number, userId: eventUserId, dateKey } = event.data.clickData;
        
        // Only process if it's for the same user
        if (eventUserId === selectedUser) {
          console.log(`🔄 [Rule1Optimized] Received click from Planet Analysis: ${number} to ${topicName}`);
          
          // Update local state to click the number
          setClickedNumbers(prev => ({
            ...prev,
            [topicName]: {
              ...prev[topicName],
              [dateKey]: {
                ...prev[topicName]?.[dateKey],
                [number]: true
              }
            }
          }));
        }
      }
    };

    // Add window message listener for cross-page communication
    window.addEventListener('message', handlePlanetMessage);
    
    return () => {
      window.removeEventListener('message', handlePlanetMessage);
    };
  }, [selectedUser]);

  // Optimized number box click handler with optimistic updates and unclick support
  const handleNumberBoxClick = useCallback((topicName, dateKey, number) => {
    const clickKey = `${topicName}-${dateKey}-${number}`;
    const isCurrentlyClicked = clickedNumbers[topicName]?.[dateKey]?.[number] || false;
    
    if (isCurrentlyClicked) {
      // Unclick - Remove the number
      setClickedNumbers(prev => {
        const newState = { ...prev };
        if (newState[topicName]?.[dateKey]?.[number]) {
          delete newState[topicName][dateKey][number];
          
          // Clean up empty objects
          if (Object.keys(newState[topicName][dateKey]).length === 0) {
            delete newState[topicName][dateKey];
          }
          if (Object.keys(newState[topicName]).length === 0) {
            delete newState[topicName];
          }
        }
        return newState;
      });

      // Remove from cache for instant UI response
      optimizedRule1Service.updateClickedNumberCache(selectedUser, topicName, dateKey, number, false);

      // Sync with database and cross-page
      if (window.cleanSupabaseService && selectedUser) {
        const userId = selectedUser?.id || selectedUser;
        const hour = 'HR1'; // Default hour for Rule1
        console.log(`🔄 [Rule1Optimized] Unclick sync: ${clickKey}`);
        
        window.cleanSupabaseService.deleteTopicClick(
          userId,
          topicName,
          dateKey,
          hour,
          number
        ).then((result) => {
          console.log(`✅ [Rule1Optimized] Number ${number} removed from DB and sync`, result);
          
          // Notify Planet Analysis page of unclick
          window.postMessage({
            type: 'rule1-unclick',
            clickData: { topicName, number, userId, dateKey, hour }
          }, '*');
        }).catch(err => {
          console.error(`❌ [Rule1Optimized] Unclick failed:`, err);
        });
      }

      console.log(`➖ [Rule1Optimized] Unclick: ${clickKey}`);
    } else {
      // Click - Add the number
      setClickedNumbers(prev => ({
        ...prev,
        [topicName]: {
          ...prev[topicName],
          [dateKey]: {
            ...prev[topicName]?.[dateKey],
            [number]: true
          }
        }
      }));

      // Add to pending batch
      setPendingClicks(prev => new Set([...prev, {
        topicName,
        dateKey,
        number,
        timestamp: Date.now()
      }]));

      // Update cache immediately for instant UI response
      optimizedRule1Service.updateClickedNumberCache(selectedUser, topicName, dateKey, number, true);

      // Sync with database and cross-page
      if (window.cleanSupabaseService && selectedUser) {
        const userId = selectedUser?.id || selectedUser;
        const hour = 'HR1'; // Default hour for Rule1
        
        window.cleanSupabaseService.saveTopicClick(
          userId,
          topicName,
          dateKey,
          hour,
          number,
          true
        ).then(() => {
          console.log(`✅ [Rule1Optimized] Number ${number} added to DB and sync`);
          
          // Notify Planet Analysis page of click
          window.postMessage({
            type: 'rule1-click', 
            clickData: { topicName, number, userId, dateKey, hour }
          }, '*');
        }).catch(err => {
          console.error(`❌ [Rule1Optimized] Click sync failed:`, err);
        });
      }

      console.log(`⚡ [Rule1Optimized] Click: ${clickKey}`);
    }
  }, [selectedUser, clickedNumbers]);

  // Fast lookup functions
  const isNumberClicked = useCallback((topicName, dateKey, number) => {
    return clickedNumbers[topicName]?.[dateKey]?.[number] || false;
  }, [clickedNumbers]);

  const isNumberHighlighted = useCallback((topicName, dateKey, number) => {
    return highlightedNumbers[topicName]?.[dateKey]?.[number] || false;
  }, [highlightedNumbers]);

  // Synchronized scrolling for better UX
  const handleSynchronizedScroll = useCallback((sourceTopicName, scrollLeft) => {
    Object.entries(scrollContainerRefs.current).forEach(([topicName, container]) => {
      if (topicName !== sourceTopicName && container) {
        container.scrollLeft = scrollLeft;
      }
    });
  }, []);

  // Scroll event handler with throttling
  const handleScroll = useCallback((topicName, event) => {
    const scrollLeft = event.target.scrollLeft;
    
    // Throttle scroll events for performance
    requestAnimationFrame(() => {
      handleSynchronizedScroll(topicName, scrollLeft);
    });
  }, [handleSynchronizedScroll]);

  // Ref management for scroll containers
  const setScrollContainerRef = useCallback((topicName, element) => {
    if (element) {
      scrollContainerRefs.current[topicName] = element;
    } else {
      delete scrollContainerRefs.current[topicName];
    }
  }, []);

  // Get available topics
  const availableTopics = Object.keys(topicsData);

  // Loading state
  if (isLoading) {
    return (
      <div className="rule1-optimized-container">
        <div className="performance-metrics">
          <div className="metric">
            <span className="label">Cache Hit Rate:</span>
            <span className="value">{(performance.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="label">Avg Response:</span>
            <span className="value">{performance.avgResponseTime.toFixed(0)}ms</span>
          </div>
        </div>
        <div className="loading-optimized">
          <div className="loading-spinner"></div>
          <p>Loading optimized data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rule1-optimized-container">
        <div className="error-optimized">
          <h3>⚠️ Loading Error</h3>
          <p>{error}</p>
          <button onClick={loadAllData} className="retry-button">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Optimized number box renderer
  const renderNumberBox = useCallback((topicName, dateKey, number) => {
    const isClicked = isNumberClicked(topicName, dateKey, number);
    const isHighlighted = isNumberHighlighted(topicName, dateKey, number);
    
    return (
      <button
        key={`${topicName}-${dateKey}-${number}`}
        className={`number-box optimized ${isClicked ? 'clicked' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        onClick={() => handleNumberBoxClick(topicName, dateKey, number)}
        data-topic={topicName}
        data-date={dateKey}
        data-number={number}
      >
        {number}
      </button>
    );
  }, [isNumberClicked, isNumberHighlighted, handleNumberBoxClick]);

  // Optimized topic row renderer
  const renderTopicRow = useCallback((topicName) => {
    const topicData = topicsData[topicName] || {};
    
    return (
      <div key={topicName} className="topic-row optimized">
        <div className="topic-header">
          <h3>{topicName}</h3>
          <div className="topic-stats">
            <span className="data-count">
              {Object.keys(topicData).length} dates
            </span>
          </div>
        </div>
        <div 
          className="numbers-container"
          ref={(el) => setScrollContainerRef(topicName, el)}
          onScroll={(e) => handleScroll(topicName, e)}
        >
          <div className="numbers-grid">
            {datesList.map(dateKey => {
              const dateData = topicData[dateKey] || {};
              return (
                <div key={dateKey} className="date-column">
                  <div className="date-header">{dateKey}</div>
                  <div className="numbers-list">
                    {Object.keys(dateData).length > 0 ? (
                      Object.keys(dateData).map(number => 
                        renderNumberBox(topicName, dateKey, number)
                      )
                    ) : (
                      <div className="no-data">No data</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [topicsData, datesList, renderNumberBox, setScrollContainerRef, handleScroll]);

  return (
    <div className="rule1-optimized-container">
      {/* Performance Dashboard */}
      <div className="performance-metrics">
        <h4>⚡ Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Cache Hit Rate:</span>
            <span className="value success">{(performance.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="label">Avg Response:</span>
            <span className="value">{performance.avgResponseTime.toFixed(0)}ms</span>
          </div>
          <div className="metric">
            <span className="label">Total Requests:</span>
            <span className="value">{performance.totalRequests}</span>
          </div>
          <div className="metric">
            <span className="label">Render Count:</span>
            <span className="value">{renderCount}</span>
          </div>
          <div className="metric">
            <span className="label">Pending Clicks:</span>
            <span className="value warning">{pendingClicks.size}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="header-optimized">
        <h2>⚡ Rule-1 Optimized (User: {selectedUser})</h2>
        <div className="header-controls">
          <button 
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Back to Users
          </button>
          <button 
            onClick={loadAllData}
            className="refresh-button"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => navigate('/performance-demo')}
            className="demo-button"
          >
            📊 Performance Demo
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="topics-container">
        {availableTopics.length > 0 ? (
          availableTopics.map(renderTopicRow)
        ) : (
          <div className="no-topics">
            <h3>No topics available</h3>
            <p>No data found for user {selectedUser}</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="footer-stats">
        <p>
          📈 Loaded {availableTopics.length} topics across {datesList.length} dates
          | 🚀 Cache efficiency: {(performance.cacheHitRate * 100).toFixed(1)}%
          | ⏱️ Last update: {new Date(lastUpdateTime).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default Rule1OptimizedPage;
