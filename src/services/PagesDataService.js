// Supabase Database Service for IndexPage, Rule-1, and Rule-2 Pages
// Handles date-by-date data management and easy D-date addition

import { supabase } from '../supabaseClient';

export class PagesDataService {
  constructor(userId) {
    this.userId = userId;
  }

  // 1. PROCESSED DATA MANAGEMENT

  /**
   * Store processed data for any page type (index, rule1, rule2)
   */
  async saveProcessedData(date, pageType, setName, elementName, hrNumber, data) {
    const processedEntry = {
      user_id: this.userId,
      date,
      page_type: pageType,
      set_name: setName,
      element_name: elementName,
      hr_number: hrNumber,
      raw_data: data.raw,
      formatted_data: data.formatted,
      extracted_number: data.extractedNumber,
      planet_code: data.planetCode,
      sign_code: data.signCode
    };

    const { data: result, error } = await supabase
      .from('processed_data')
      .upsert(processedEntry)
      .select();

    if (error) throw new Error(`Failed to save processed data: ${error.message}`);
    return result[0];
  }

  /**
   * Get processed data for specific date and page type
   */
  async getProcessedData(date, pageType, setName = null) {
    let query = supabase
      .from('processed_data')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .eq('page_type', pageType);

    if (setName) {
      query = query.eq('set_name', setName);
    }

    const { data, error } = await query.order('element_name, hr_number');

    if (error) throw new Error(`Failed to get processed data: ${error.message}`);
    return data || [];
  }

  /**
   * Get processed data for multiple dates (for ABCD sequence)
   */
  async getProcessedDataForDates(dates, pageType, setName = null) {
    let query = supabase
      .from('processed_data')
      .select('*')
      .eq('user_id', this.userId)
      .in('date', dates)
      .eq('page_type', pageType);

    if (setName) {
      query = query.eq('set_name', setName);
    }

    const { data, error } = await query.order('date, element_name, hr_number');

    if (error) throw new Error(`Failed to get processed data for dates: ${error.message}`);
    
    // Group by date for easy access
    const groupedData = {};
    dates.forEach(date => groupedData[date] = []);
    
    data?.forEach(item => {
      if (groupedData[item.date]) {
        groupedData[item.date].push(item);
      }
    });

    return groupedData;
  }

  // 2. ABCD SEQUENCE MANAGEMENT

  /**
   * Create or update ABCD sequence for Rule-1 or Rule-2
   */
  async saveABCDSequence(triggerDate, pageType, aDate, bDate, cDate, dDate, selectedHR) {
    const sequenceData = {
      user_id: this.userId,
      trigger_date: triggerDate,
      page_type: pageType,
      a_date: aDate,
      b_date: bDate,
      c_date: cDate,
      d_date: dDate,
      selected_hr: selectedHR
    };

    const { data, error } = await supabase
      .from('abcd_sequences')
      .upsert(sequenceData)
      .select();

    if (error) throw new Error(`Failed to save ABCD sequence: ${error.message}`);
    return data[0];
  }

  /**
   * Get ABCD sequence for specific trigger date and page type
   */
  async getABCDSequence(triggerDate, pageType) {
    const { data, error } = await supabase
      .from('abcd_sequences')
      .select('*')
      .eq('user_id', this.userId)
      .eq('trigger_date', triggerDate)
      .eq('page_type', pageType)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get ABCD sequence: ${error.message}`);
    }
    return data;
  }

  /**
   * Get all Rule-1 sequences (for easy D-date addition)
   */
  async getRule1Sequences() {
    const { data, error } = await supabase
      .from('rule1_current_sequences')
      .select('*')
      .eq('user_id', this.userId);

    if (error) throw new Error(`Failed to get Rule-1 sequences: ${error.message}`);
    return data || [];
  }

  // 3. ANALYSIS RESULTS MANAGEMENT

  /**
   * Save ABCD/BCD analysis results
   */
  async saveAnalysisResults(sequenceId, results) {
    const analysisEntries = results.map(result => ({
      user_id: this.userId,
      sequence_id: sequenceId,
      set_name: result.setName,
      element_name: result.elementName,
      hr_number: result.hrNumber,
      d_day_number: result.dDayNumber,
      analysis_type: result.analysisType, // 'ABCD' or 'BCD'
      qualification_reason: result.qualificationReason,
      badge_text: result.badgeText
    }));

    const { data, error } = await supabase
      .from('analysis_results')
      .upsert(analysisEntries)
      .select();

    if (error) throw new Error(`Failed to save analysis results: ${error.message}`);
    return data;
  }

  /**
   * Get analysis results for a sequence
   */
  async getAnalysisResults(sequenceId) {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('set_name, element_name, hr_number');

    if (error) throw new Error(`Failed to get analysis results: ${error.message}`);
    return data || [];
  }

  // 4. INDEX PAGE CACHE MANAGEMENT

  /**
   * Cache IndexPage display data
   */
  async cacheIndexPageData(dateWindow, selectedHR, setName, displayData) {
    const cacheEntry = {
      user_id: this.userId,
      date_window: dateWindow,
      selected_hr: selectedHR,
      set_name: setName,
      display_data: displayData,
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    };

    const { data, error } = await supabase
      .from('index_page_cache')
      .upsert(cacheEntry)
      .select();

    if (error) throw new Error(`Failed to cache IndexPage data: ${error.message}`);
    return data[0];
  }

  /**
   * Get cached IndexPage data
   */
  async getCachedIndexPageData(dateWindow, selectedHR, setName) {
    const { data, error } = await supabase
      .from('index_page_cache')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date_window', JSON.stringify(dateWindow))
      .eq('selected_hr', selectedHR)
      .eq('set_name', setName)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get cached IndexPage data: ${error.message}`);
    }
    return data?.display_data;
  }

  // 5. RULE-1 SPECIFIC METHODS (Easy D-date addition)

  /**
   * Add new D-date to existing Rule-1 sequence
   */
  async addNewDDateToRule1(existingSequence, newDDate, newTriggerDate) {
    // Create new sequence: A→B, B→C, C→D, D→newD
    const newSequence = {
      user_id: this.userId,
      trigger_date: newTriggerDate,
      page_type: 'rule1',
      a_date: existingSequence.b_date, // Shift dates
      b_date: existingSequence.c_date,
      c_date: existingSequence.d_date,
      d_date: newDDate,
      selected_hr: existingSequence.selected_hr
    };

    return await this.saveABCDSequence(
      newTriggerDate,
      'rule1',
      newSequence.a_date,
      newSequence.b_date,
      newSequence.c_date,
      newSequence.d_date,
      newSequence.selected_hr
    );
  }

  /**
   * Get Rule-1 data ready for new D-date addition
   */
  async getRule1ReadyForNewDate() {
    const sequences = await this.getRule1Sequences();
    
    // Find the most recent sequence
    const latestSequence = sequences.sort((a, b) => 
      new Date(b.trigger_date) - new Date(a.trigger_date)
    )[0];

    if (!latestSequence) return null;

    // Get the processed data for current D-date
    const dDateData = await this.getProcessedData(
      latestSequence.d_date, 
      'rule1'
    );

    return {
      sequence: latestSequence,
      dDateData,
      nextADate: latestSequence.b_date,
      nextBDate: latestSequence.c_date,
      nextCDate: latestSequence.d_date,
      suggestedNextDDate: this.suggestNextDate(latestSequence.d_date)
    };
  }

  // 6. UTILITY METHODS

  /**
   * Suggest next date (add 1 day)
   */
  suggestNextDate(currentDate) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get dates ready for IndexPage display
   */
  async getIndexPageReadyDates() {
    const { data, error } = await supabase
      .from('index_page_ready_data')
      .select('*')
      .eq('user_id', this.userId);

    if (error) throw new Error(`Failed to get IndexPage ready dates: ${error.message}`);
    return data || [];
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // Clean up processed data
    await supabase
      .from('processed_data')
      .delete()
      .eq('user_id', this.userId)
      .lt('date', cutoffDateStr);

    // Clean up old sequences
    await supabase
      .from('abcd_sequences')
      .delete()
      .eq('user_id', this.userId)
      .lt('trigger_date', cutoffDateStr);

    // Clean up expired cache
    await supabase.rpc('cleanup_expired_cache');
  }

  // 7. BATCH OPERATIONS FOR MIGRATION

  /**
   * Migrate existing localStorage data to Supabase
   */
  async migrateFromLocalStorage(localStorageData) {
    const results = {
      processed: 0,
      sequences: 0,
      errors: []
    };

    try {
      // Process each date's data
      for (const [dateKey, dateData] of Object.entries(localStorageData.dates || {})) {
        if (dateData.excel && dateData.hourEntry) {
          // Extract and save processed data
          const processedEntries = await this.extractAndSaveFromExcel(
            dateKey, 
            dateData.excel, 
            dateData.hourEntry
          );
          results.processed += processedEntries.length;
        }
      }

      // Create sequences from existing analysis
      if (localStorageData.sequences) {
        for (const sequence of localStorageData.sequences) {
          await this.saveABCDSequence(
            sequence.triggerDate,
            sequence.pageType,
            sequence.aDate,
            sequence.bDate,
            sequence.cDate,
            sequence.dDate,
            sequence.selectedHR
          );
          results.sequences++;
        }
      }

    } catch (error) {
      results.errors.push(error.message);
    }

    return results;
  }
}
