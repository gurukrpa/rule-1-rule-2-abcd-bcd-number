// 🎯 ABCD/BCD Analyzer Script - Reusable Logic for Future Use
// This script provides a complete ABCD/BCD analysis framework that can be used across different components

import { performAbcdBcdAnalysis } from './src/utils/abcdBcdAnalysis.js';

/**
 * 🔧 ABCD/BCD Analyzer Class
 * Provides comprehensive analysis functionality for astrological data
 */
class ABCDBCDAnalyzer {
  constructor() {
    this.analysisHistory = [];
    this.currentAnalysis = null;
  }

  /**
   * Extract number from astrological data string
   * Format: element-number-/planet-(position)-(position)
   */
  extractNumber(dataString) {
    if (!dataString || typeof dataString !== 'string') return null;
    const match = dataString.match(/^[a-z]+-(\d+)-\//);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extract all numbers from a day's data object
   */
  extractDayNumbers(dayData) {
    if (!dayData || typeof dayData !== 'object') return [];
    return Object.values(dayData)
      .map(dataString => this.extractNumber(dataString))
      .filter(num => num !== null);
  }

  /**
   * Prepare data structure from raw astrological data
   * @param {Object} rawData - Object with A, B, C, D day data
   * @returns {Object} Processed day numbers
   */
  prepareDataStructure(rawData) {
    const { A, B, C, D } = rawData;
    
    return {
      aDayNumbers: this.extractDayNumbers(A),
      bDayNumbers: this.extractDayNumbers(B),
      cDayNumbers: this.extractDayNumbers(C),
      dDayNumbers: this.extractDayNumbers(D),
      rawData: rawData
    };
  }

  /**
   * Perform complete ABCD/BCD analysis
   * @param {Object} data - Raw or prepared data structure
   * @param {Object} options - Analysis options
   * @returns {Object} Complete analysis results
   */
  analyze(data, options = {}) {
    const {
      includeSummary = true,
      includeElementWise = true,
      includeDetailed = true,
      setName = 'Analysis',
      saveToHistory = true
    } = options;

    // Prepare data if raw format provided
    let prepared;
    if (data.A && data.B && data.C && data.D) {
      prepared = this.prepareDataStructure(data);
    } else if (data.aDayNumbers && data.bDayNumbers && data.cDayNumbers && data.dDayNumbers) {
      prepared = data;
    } else {
      throw new Error('Invalid data format. Expected either {A, B, C, D} or {aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers}');
    }

    const { aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers, rawData } = prepared;

    // Perform core ABCD/BCD analysis
    const coreAnalysis = performAbcdBcdAnalysis(
      aDayNumbers,
      bDayNumbers,
      cDayNumbers,
      dDayNumbers,
      {
        includeDetailedAnalysis: includeDetailed,
        logResults: false,
        setName
      }
    );

    // Build comprehensive result
    const result = {
      timestamp: new Date().toISOString(),
      setName,
      extractedNumbers: {
        aDayNumbers,
        bDayNumbers,
        cDayNumbers,
        dDayNumbers
      },
      results: {
        abcdNumbers: coreAnalysis.abcdNumbers,
        bcdNumbers: coreAnalysis.bcdNumbers,
        unqualifiedNumbers: dDayNumbers.filter(num => 
          !coreAnalysis.abcdNumbers.includes(num) && 
          !coreAnalysis.bcdNumbers.includes(num)
        )
      },
      summary: includeSummary ? coreAnalysis.summary : null,
      detailedAnalysis: includeDetailed ? coreAnalysis.detailedAnalysis : null,
      elementWiseBreakdown: includeElementWise && rawData ? this.getElementWiseBreakdown(rawData, aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers) : null
    };

    // Save to history if requested
    if (saveToHistory) {
      this.analysisHistory.push(result);
      this.currentAnalysis = result;
    }

    return result;
  }

  /**
   * Generate element-wise breakdown
   */
  getElementWiseBreakdown(rawData, aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers) {
    const breakdown = [];
    const elements = Object.keys(rawData.A);

    elements.forEach(element => {
      const aNum = this.extractNumber(rawData.A[element]);
      const bNum = this.extractNumber(rawData.B[element]);
      const cNum = this.extractNumber(rawData.C[element]);
      const dNum = this.extractNumber(rawData.D[element]);

      // Check if D-day number appears in A, B, or C days
      const inA = aDayNumbers.includes(dNum);
      const inB = bDayNumbers.includes(dNum);
      const inC = cDayNumbers.includes(dNum);
      const abcCount = [inA, inB, inC].filter(Boolean).length;

      let qualification = 'None';
      let details = '';
      let occurrences = [];

      if (abcCount >= 2) {
        qualification = 'ABCD';
        if (inA) occurrences.push('A');
        if (inB) occurrences.push('B');
        if (inC) occurrences.push('C');
        details = `appears in ${occurrences.join(', ')} days`;
      } else {
        const bdPairOnly = inB && !inC;
        const cdPairOnly = inC && !inB;
        if (bdPairOnly) {
          qualification = 'BCD';
          details = 'B-D pair only';
          occurrences = ['B'];
        } else if (cdPairOnly) {
          qualification = 'BCD';
          details = 'C-D pair only';
          occurrences = ['C'];
        }
      }

      breakdown.push({
        element,
        numbers: { A: aNum, B: bNum, C: cNum, D: dNum },
        qualification,
        details,
        occurrences,
        abcCount
      });
    });

    return breakdown;
  }

  /**
   * Get formatted summary for display
   */
  getFormattedSummary(analysis = null) {
    const data = analysis || this.currentAnalysis;
    if (!data) return 'No analysis available';

    const { results, summary } = data;
    
    return {
      abcdNumbers: results.abcdNumbers,
      bcdNumbers: results.bcdNumbers,
      unqualifiedNumbers: results.unqualifiedNumbers,
      stats: {
        totalDDay: summary.dDayCount,
        totalABCD: summary.abcdCount,
        totalBCD: summary.bcdCount,
        totalQualified: summary.totalQualified,
        qualificationRate: summary.qualificationRate
      }
    };
  }

  /**
   * Generate analysis report for console output
   */
  generateReport(analysis = null, options = {}) {
    const data = analysis || this.currentAnalysis;
    if (!data) return 'No analysis available';

    const {
      includeElementWise = true,
      includeDetailed = true,
      colorOutput = true
    } = options;

    let report = '';
    
    // Header
    report += `🎯 ABCD/BCD Analysis Report - ${data.setName}\n`;
    report += `${'='.repeat(50)}\n\n`;

    // Numbers extracted
    report += `📊 Extracted Numbers:\n`;
    report += `A-day: [${data.extractedNumbers.aDayNumbers.join(', ')}]\n`;
    report += `B-day: [${data.extractedNumbers.bDayNumbers.join(', ')}]\n`;
    report += `C-day: [${data.extractedNumbers.cDayNumbers.join(', ')}]\n`;
    report += `D-day: [${data.extractedNumbers.dDayNumbers.join(', ')}]\n\n`;

    // Results
    report += `🎯 ANALYSIS RESULTS:\n`;
    report += `✅ ABCD Numbers: [${data.results.abcdNumbers.join(', ')}] (${data.results.abcdNumbers.length} total)\n`;
    report += `✅ BCD Numbers: [${data.results.bcdNumbers.join(', ')}] (${data.results.bcdNumbers.length} total)\n`;
    report += `❌ Unqualified: [${data.results.unqualifiedNumbers.join(', ')}] (${data.results.unqualifiedNumbers.length} total)\n\n`;

    // Summary stats
    if (data.summary) {
      report += `📈 Summary Statistics:\n`;
      report += `   • D-day count: ${data.summary.dDayCount}\n`;
      report += `   • ABCD count: ${data.summary.abcdCount}\n`;
      report += `   • BCD count: ${data.summary.bcdCount}\n`;
      report += `   • Total qualified: ${data.summary.totalQualified}\n`;
      report += `   • Qualification rate: ${data.summary.qualificationRate}%\n\n`;
    }

    // Detailed breakdown
    if (includeDetailed && data.detailedAnalysis) {
      report += `🔍 DETAILED BREAKDOWN BY NUMBER:\n`;
      for (const [num, details] of Object.entries(data.detailedAnalysis)) {
        const status = details.qualified ? '✅' : '❌';
        const type = details.type ? `[${details.type}]` : '';
        report += `${status} Number ${num} ${type}: ${details.reason}\n`;
      }
      report += '\n';
    }

    // Element-wise breakdown
    if (includeElementWise && data.elementWiseBreakdown) {
      report += `🎯 ELEMENT-WISE BREAKDOWN:\n`;
      report += `${'='.repeat(50)}\n`;
      data.elementWiseBreakdown.forEach(item => {
        const { element, numbers, qualification, details } = item;
        report += `${element.padEnd(16)}: A=${numbers.A}, B=${numbers.B}, C=${numbers.C}, D=${numbers.D} → ${qualification}`;
        if (details) report += ` (${details})`;
        report += '\n';
      });
    }

    return report;
  }

  /**
   * Get analysis history
   */
  getHistory() {
    return this.analysisHistory;
  }

  /**
   * Clear analysis history
   */
  clearHistory() {
    this.analysisHistory = [];
    this.currentAnalysis = null;
  }

  /**
   * Export analysis results for use in other components
   */
  exportForComponent(analysis = null) {
    const data = analysis || this.currentAnalysis;
    if (!data) return null;

    return {
      abcdNumbers: data.results.abcdNumbers,
      bcdNumbers: data.results.bcdNumbers,
      unqualifiedNumbers: data.results.unqualifiedNumbers,
      summary: data.summary,
      elementWiseBreakdown: data.elementWiseBreakdown,
      timestamp: data.timestamp
    };
  }
}

/**
 * 🚀 Quick Analysis Function - For simple one-off analysis
 * @param {Object} data - Raw data structure with A, B, C, D days
 * @param {string} setName - Name for the analysis set
 * @returns {Object} Analysis results
 */
export function quickAnalyze(data, setName = 'Quick Analysis') {
  const analyzer = new ABCDBCDAnalyzer();
  return analyzer.analyze(data, { setName });
}

/**
 * 🔧 Create Analyzer Instance - For advanced usage
 * @returns {ABCDBCDAnalyzer} New analyzer instance
 */
export function createAnalyzer() {
  return new ABCDBCDAnalyzer();
}

// Export the main class
export default ABCDBCDAnalyzer;

// Example usage demonstration (commented out for production)
/*
// Example data structure
const exampleData = {
  A: {
    'Lagna': 'as-5-/ra-(29 Li 39)-(29 Aq 49)',
    'Moon': 'mo-12-/ra-(02 Pi 18)-(29 Aq 49)',
    // ... more elements
  },
  B: {
    'Lagna': 'as-5-/sa-(06 Sc 18)-(06 Pi 07)',
    'Moon': 'mo-10-/sa-(16 Ge 04)-(06 Pi 07)',
    // ... more elements
  },
  C: {
    // ... C day data
  },
  D: {
    // ... D day data
  }
};

// Quick analysis
const result = quickAnalyze(exampleData, 'My Analysis');
console.log(result.results.abcdNumbers); // [5, 6, 7]
console.log(result.results.bcdNumbers);  // [2, 9]

// Advanced usage
const analyzer = createAnalyzer();
const analysis = analyzer.analyze(exampleData, {
  includeSummary: true,
  includeElementWise: true,
  includeDetailed: true,
  setName: 'Advanced Analysis'
});

console.log(analyzer.generateReport());
*/
