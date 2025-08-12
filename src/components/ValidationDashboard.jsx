// Enhanced Validation Dashboard Component for ABCD Excel Validation
import React from 'react';

const ValidationDashboard = ({ validationHistory, isValidating, validationProgress, validationStatus }) => {
  // Calculate validation statistics
  const validationStats = React.useMemo(() => {
    const history = Object.values(validationHistory);
    if (history.length === 0) return null;

    const totalValidations = history.length;
    const passedCount = history.filter(v => v.validationLevel === 'PASSED').length;
    const warningCount = history.filter(v => v.validationLevel === 'PASSED_WITH_WARNINGS').length;
    const failedCount = history.filter(v => v.validationLevel === 'FAILED').length;
    
    const avgQuality = history.reduce((sum, v) => sum + (v.dataQuality || 0), 0) / totalValidations;
    const avgTime = history.reduce((sum, v) => sum + (v.performance?.validationTime || 0), 0) / totalValidations;
    const avgTopics = history.reduce((sum, v) => sum + (v.topicsFound || 0), 0) / totalValidations;

    return {
      total: totalValidations,
      passed: passedCount,
      warnings: warningCount,
      failed: failedCount,
      successRate: ((passedCount + warningCount) / totalValidations * 100).toFixed(1),
      avgQuality: avgQuality.toFixed(1),
      avgTime: Math.round(avgTime),
      avgTopics: avgTopics.toFixed(1),
      recentValidations: history.slice(-5).reverse()
    };
  }, [validationHistory]);

  if (!validationStats && !isValidating) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Validation Dashboard</h3>
        <p className="text-gray-600 text-sm">No validation history available. Upload an Excel file to see validation statistics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Enhanced Validation Dashboard</h3>
      
      {/* Current Validation Status */}
      {isValidating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-800">🔄 Validation in Progress</span>
            <span className="text-blue-600 font-mono">{validationProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${validationProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-blue-700">{validationStatus}</div>
        </div>
      )}

      {/* Validation Statistics */}
      {validationStats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-800">{validationStats.total}</div>
              <div className="text-xs text-gray-600">Total Validations</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{validationStats.successRate}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{validationStats.avgQuality}%</div>
              <div className="text-xs text-gray-600">Avg Quality</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{validationStats.avgTime}ms</div>
              <div className="text-xs text-gray-600">Avg Time</div>
            </div>
          </div>

          {/* Validation Breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm text-green-700">✅ Passed</span>
              <span className="font-semibold text-green-600">{validationStats.passed}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="text-sm text-yellow-700">⚠️ Warnings</span>
              <span className="font-semibold text-yellow-600">{validationStats.warnings}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-sm text-red-700">❌ Failed</span>
              <span className="font-semibold text-red-600">{validationStats.failed}</span>
            </div>
          </div>

          {/* Recent Validations */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recent Validations</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {validationStats.recentValidations.map((validation, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      validation.validationLevel === 'PASSED' ? 'bg-green-500' :
                      validation.validationLevel === 'PASSED_WITH_WARNINGS' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="font-medium">{validation.fileName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{validation.dataQuality?.toFixed(1)}%</span>
                    <span>{validation.topicsFound}/30</span>
                    <span>{validation.performance?.validationTime}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationDashboard;
