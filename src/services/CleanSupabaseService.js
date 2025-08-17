import { supabase } from '../supabaseClient.js';

/**
 * Clean Supabase-Only Data Service
 * Replaces: localStorage, fallback systems, hybrid approaches
 * Single source of truth for all data operations
 */
class CleanSupabaseService {
  constructor() {
    // Use the existing configured Supabase client
    this.supabase = supabase;
    
    console.log('🎯 CleanSupabaseService initialized - Supabase only, no localStorage');
  }

  // =====================================
  // 👤 USER MANAGEMENT
  // =====================================

  async createUser(userData) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          hr_count: userData.hr || 1
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      console.log('✅ User created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  }

  // =====================================
  // 📊 EXCEL DATA MANAGEMENT
  // =====================================

  async saveExcelData(userId, date, excelData) {
    try {
      console.log(`📤 Saving Excel data for ${userId} on ${date}`);
      console.log(`🔍 Excel data structure:`, {
        hasDirectSets: !!excelData.sets,
        hasDataProperty: !!excelData.data,
        hasDataSets: !!excelData.data?.sets,
        structure: Object.keys(excelData)
      });
      
      // Validate data structure - check both possible formats
      const sets = excelData.sets || excelData.data?.sets;
      if (!sets || Object.keys(sets).length === 0) {
        throw new Error('Excel data must contain sets/topics');
      }

      const { data, error } = await this.supabase
        .from('excel_data')
        .upsert({
          user_id: userId,
          date: date,
          file_name: excelData.fileName || 'Unknown',
          data: { sets: sets } // Store as JSON in 'data' column
        }, {
          onConflict: 'user_id,date'  // Specify composite key for conflict resolution
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      console.log(`✅ Excel data saved: ${Object.keys(sets).length} sets`);
      return data;
    } catch (error) {
      console.error('❌ Error saving Excel data:', error);
      throw error;
    }
  }

  async getExcelData(userId, date) {
    try {
      console.log(`📥 Getting Excel data for ${userId} on ${date}`);

      const { data, error } = await this.supabase
        .from('excel_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal, not an error
          console.log(`ℹ️ No Excel data found for ${userId} on ${date}`);
          return null;
        }
        throw error;
      }

      console.log(`✅ Excel data loaded: ${Object.keys(data.data?.sets || {}).length} sets`);
      return {
        fileName: data.file_name,
        sets: data.data?.sets || {}, // Extract sets from data JSON column
        dataSource: 'Supabase',
        date: data.date
      };
    } catch (error) {
      console.error('❌ Error getting Excel data:', error);
      throw error;
    }
  }

  async deleteExcelData(userId, date) {
    try {
      const { error } = await this.supabase
        .from('excel_data')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) throw error;
      console.log(`🗑️ Excel data deleted for ${userId} on ${date}`);
    } catch (error) {
      console.error('❌ Error deleting Excel data:', error);
      throw error;
    }
  }

  async hasExcelData(userId, date) {
    try {
      console.log(`🔍 [DEBUG] Checking Excel data for user ${userId} on ${date}`);
      
      const { count, error } = await this.supabase
        .from('excel_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', date);

      console.log(`📊 [DEBUG] Excel data query result:`, { count, error: error?.message });

      if (error) {
        console.error('❌ [DEBUG] Excel data query error:', error);
        return false;
      }

      const exists = count > 0;
      console.log(`${exists ? '✅' : '❌'} [DEBUG] Excel data ${exists ? 'EXISTS' : 'NOT FOUND'} for ${date}`);
      return exists;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in hasExcelData:', error);
      return false;
    }
  }

  // =====================================
  // ⏰ HOUR ENTRY MANAGEMENT  
  // =====================================

  async saveHourEntry(userId, date, planetSelections) {
    try {
      console.log(`📤 Saving hour entry for ${userId} on ${date}`);

      const { data, error } = await this.supabase
        .from('hour_entries')
        .upsert({
          user_id: userId,
          date_key: date, // Use date_key column as per actual schema
          hour_data: { 
            planetSelections: planetSelections,
            date: date,
            userId: userId,
            savedAt: new Date().toISOString()
          }
        }, {
          onConflict: 'user_id,date_key'  // Specify composite key for conflict resolution
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      console.log(`✅ Hour entry saved: ${Object.keys(planetSelections).length} HR selections`);
      return data;
    } catch (error) {
      console.error('❌ Error saving hour entry:', error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    try {
      console.log(`📥 Getting hour entry for ${userId} on ${date}`);

      const { data, error } = await this.supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', date) // Use date_key column as per actual schema
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ No hour entry found for ${userId} on ${date} (this is normal for new dates)`);
          return null;
        }
        
        // Log detailed error information for debugging
        console.error(`❌ Hour entry query failed for ${userId} on ${date}:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          statusCode: error.statusCode
        });
        
        throw new Error(`Database query failed: ${error.message || 'Unknown error'}`);
      }

      console.log(`✅ Hour entry loaded: ${Object.keys(data.hour_data?.planetSelections || {}).length} HR selections`);
      return {
        planetSelections: data.hour_data?.planetSelections || {}, // Extract from hour_data JSON
        dataSource: 'Supabase',
        date: data.date_key
      };
    } catch (error) {
      if (error.message?.includes('Database query failed')) {
        throw error; // Re-throw our custom error
      }
      console.error('❌ Unexpected error getting hour entry:', error);
      throw new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteHourEntry(userId, date) {
    try {
      const { error } = await this.supabase
        .from('hour_entries')
        .delete()
        .eq('user_id', userId)
        .eq('date_key', date); // Use date_key column

      if (error) throw error;
      console.log(`🗑️ Hour entry deleted for ${userId} on ${date}`);
    } catch (error) {
      console.error('❌ Error deleting hour entry:', error);
      throw error;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      console.log(`⏰ [DEBUG] Checking Hour Entry for user ${userId} on ${date}`);
      
      const { count, error } = await this.supabase
        .from('hour_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date_key', date); // Use date_key column

      console.log(`📊 [DEBUG] Hour Entry query result:`, { count, error: error?.message });

      if (error) {
        console.error('❌ [DEBUG] Hour Entry query error:', error);
        return false;
      }

      const exists = count > 0;
      console.log(`${exists ? '✅' : '❌'} [DEBUG] Hour Entry ${exists ? 'EXISTS' : 'NOT FOUND'} for ${date}`);
      return exists;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in hasHourEntry:', error);
      return false;
    }
  }

  // =====================================
  // 📅 DATE MANAGEMENT
  // =====================================

  async getUserDates(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_dates')
        .select('dates')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No dates record found, return empty array
          return [];
        }
        throw error;
      }

      return data.dates || [];
    } catch (error) {
      console.error('❌ Error getting user dates:', error);
      throw error;
    }
  }

  async saveUserDates(userId, dates) {
    try {
      const { data, error } = await this.supabase
        .from('user_dates')
        .upsert({
          user_id: userId,
          dates: dates
        }, {
          onConflict: 'user_id'  // Specify the column to use for conflict resolution
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      console.log(`✅ User dates saved: ${dates.length} dates`);
      return data;
    } catch (error) {
      console.error('❌ Error saving user dates:', error);
      throw error;
    }
  }

  async addUserDate(userId, date) {
    try {
      const currentDates = await this.getUserDates(userId);
      if (!currentDates.includes(date)) {
        const newDates = [...currentDates, date].sort();
        await this.saveUserDates(userId, newDates);
      }
    } catch (error) {
      console.error('❌ Error adding user date:', error);
      throw error;
    }
  }

  async removeUserDate(userId, date) {
    try {
      const currentDates = await this.getUserDates(userId);
      const newDates = currentDates.filter(d => d !== date);
      await this.saveUserDates(userId, newDates);
      
      // Also delete associated data
      await this.deleteExcelData(userId, date);
      await this.deleteHourEntry(userId, date);
    } catch (error) {
      console.error('❌ Error removing user date:', error);
      throw error;
    }
  }

  // =====================================
  // 🧮 ANALYSIS FUNCTIONS
  // =====================================

  async extractNumbersFromSet(userId, date, setName, hrNumber) {
    try {
      const [excelData, hourData] = await Promise.all([
        this.getExcelData(userId, date),
        this.getHourEntry(userId, date)
      ]);

      if (!excelData || !hourData) {
        console.log(`⚠️ Missing data for extraction: Excel=${!!excelData}, Hour=${!!hourData}`);
        return [];
      }

      const sets = excelData.sets || {};
      const planetSelections = hourData.planetSelections || {};
      const setData = sets[setName];
      const selectedPlanet = planetSelections[hrNumber];

      if (!setData || !selectedPlanet) {
        console.log(`⚠️ Missing set data or planet selection for ${setName}/HR${hrNumber}`);
        return [];
      }

      const numbers = new Set();
      Object.entries(setData).forEach(([elementName, planetData]) => {
        const rawString = planetData[selectedPlanet];
        if (rawString) {
          const match = rawString.match(/^[a-z]+-(\d+)[\/\-]/);
          if (match) {
            numbers.add(Number(match[1]));
          }
        }
      });

      const result = Array.from(numbers).sort((a, b) => a - b);
      console.log(`🔢 Extracted ${result.length} numbers from ${setName} HR${hrNumber}: [${result.join(', ')}]`);
      return result;
    } catch (error) {
      console.error('❌ Error extracting numbers:', error);
      return [];
    }
  }

  async performABCDAnalysis(userId, dates, setName, hrNumber) {
    try {
      if (dates.length < 4) {
        console.log(`⚠️ Need 4 dates for ABCD analysis, got ${dates.length}`);
        return { abcdNumbers: [], bcdNumbers: [] };
      }

      const [aDay, bDay, cDay, dDay] = dates;
      
      // Extract numbers from all days
      const [aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers] = await Promise.all([
        this.extractNumbersFromSet(userId, aDay, setName, hrNumber),
        this.extractNumbersFromSet(userId, bDay, setName, hrNumber),
        this.extractNumbersFromSet(userId, cDay, setName, hrNumber),
        this.extractNumbersFromSet(userId, dDay, setName, hrNumber)
      ]);

      if (dDayNumbers.length === 0) {
        console.log(`⚠️ No D-day numbers for analysis`);
        return { abcdNumbers: [], bcdNumbers: [] };
      }

      // ABCD Analysis: D-day numbers appearing in ≥2 of A, B, C days
      const abcdCandidates = dDayNumbers.filter(num => {
        let count = 0;
        if (aDayNumbers.includes(num)) count++;
        if (bDayNumbers.includes(num)) count++;
        if (cDayNumbers.includes(num)) count++;
        return count >= 2;
      });

      // BCD Analysis: D-day numbers appearing in exclusive B-D or C-D pairs
      const bcdCandidates = dDayNumbers.filter(num => {
        const inA = aDayNumbers.includes(num);
        const inB = bDayNumbers.includes(num);
        const inC = cDayNumbers.includes(num);
        
        // Exclusive B-D or C-D pairs (not in A, not in both B and C)
        const bdPairOnly = inB && !inA && !inC;
        const cdPairOnly = inC && !inA && !inB;
        return bdPairOnly || cdPairOnly;
      });

      // ABCD takes priority over BCD
      const abcdNumbers = abcdCandidates;
      const bcdNumbers = bcdCandidates.filter(num => !abcdCandidates.includes(num));

      console.log(`🧮 ABCD/BCD Analysis for ${setName}:`, {
        abcdNumbers,
        bcdNumbers,
        extractedCounts: { A: aDayNumbers.length, B: bDayNumbers.length, C: cDayNumbers.length, D: dDayNumbers.length }
      });

      return { abcdNumbers, bcdNumbers };
    } catch (error) {
      console.error('❌ Error in ABCD analysis:', error);
      return { abcdNumbers: [], bcdNumbers: [] };
    }
  }

  // =====================================
  // 🔧 UTILITY FUNCTIONS
  // =====================================

  async getDataSummary(userId) {
    try {
      const [excelCount, hourCount, dates] = await Promise.all([
        this.supabase.from('excel_data').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        this.supabase.from('hour_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        this.getUserDates(userId)
      ]);

      return {
        excelDataCount: excelCount.count || 0,
        hourEntryCount: hourCount.count || 0,
        userDatesCount: dates.length,
        userDates: dates
      };
    } catch (error) {
      console.error('❌ Error getting data summary:', error);
      return {
        excelDataCount: 0,
        hourEntryCount: 0,
        userDatesCount: 0,
        userDates: []
      };
    }
  }

  // =====================================
  // 🎯 TOPIC CLICKS MANAGEMENT (for clickable number boxes)
  // =====================================

  async saveTopicClick(userId, topicName, dateKey, hour, clickedNumber, isMatched = false) {
    try {
      const { data, error } = await this.supabase
        .from('topic_clicks')
        .upsert({
          user_id: userId,
          topic_name: topicName,
          date_key: dateKey,
          hour: hour,
          clicked_number: clickedNumber,
          is_matched: isMatched
        }, {
          onConflict: 'user_id,topic_name,date_key,hour,clicked_number'
        })
        .select();

      if (error) throw error;
      console.log('✅ Topic click saved:', { userId, topicName, dateKey, hour, clickedNumber, isMatched });
      return data[0];
    } catch (error) {
      console.error('❌ Error saving topic click:', error);
      throw error;
    }
  }

  async getTopicClicks(userId, topicName = null, dateKey = null) {
    try {
      let query = this.supabase
        .from('topic_clicks')
        .select('*')
        .eq('user_id', userId);

      if (topicName) {
        query = query.eq('topic_name', topicName);
      }

      if (dateKey) {
        query = query.eq('date_key', dateKey);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ Retrieved ${data.length} topic clicks for user ${userId}`);
      return data;
    } catch (error) {
      console.error('❌ Error getting topic clicks:', error);
      throw error;
    }
  }

  async deleteTopicClick(userId, topicName, dateKey, hour, clickedNumber) {
    try {
      const { error } = await this.supabase
        .from('topic_clicks')
        .delete()
        .eq('user_id', userId)
        .eq('topic_name', topicName)
        .eq('date_key', dateKey)
        .eq('hour', hour)
        .eq('clicked_number', clickedNumber);

      if (error) throw error;
      console.log('✅ Topic click deleted:', { userId, topicName, dateKey, hour, clickedNumber });
      return true;
    } catch (error) {
      console.error('❌ Error deleting topic click:', error);
      throw error;
    }
  }

  // ✅ NEW: Save ABCD/BCD analysis results
  async saveAnalysisResults(userId, topicName, dateKey, hour, abcdNumbers, bcdNumbers, metadata = {}) {
    try {
      console.log(`💾 Saving analysis results for ${topicName} on ${dateKey} HR${hour}:`, {
        abcdNumbers,
        bcdNumbers,
        metadata
      });

      const { data, error } = await this.supabase
        .from('topic_analysis_results')
        .upsert({
          user_id: userId,
          topic_name: topicName,
          date_key: dateKey,
          hour: `HR${hour}`,
          abcd_numbers: abcdNumbers,
          bcd_numbers: bcdNumbers,
          analysis_source: metadata.source || 'rule2_analysis',
          analysis_date: metadata.analysisDate || dateKey,
          pattern_type: metadata.pattern || 'N-1',
          metadata: metadata,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,topic_name,date_key,hour'
        });

      if (error) throw error;
      console.log(`✅ Analysis results saved for ${topicName} on ${dateKey} HR${hour}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving analysis results:', error);
      throw error;
    }
  }

  // ✅ NEW: Get ABCD/BCD analysis results
  async getAnalysisResults(userId, topicName = null, dateKey = null, hour = null) {
    try {
      let query = this.supabase
        .from('topic_analysis_results')
        .select('*')
        .eq('user_id', userId);

      if (topicName) query = query.eq('topic_name', topicName);
      if (dateKey) query = query.eq('date_key', dateKey);
      if (hour) query = query.eq('hour', `HR${hour}`);

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ Retrieved ${data.length} analysis results for user ${userId}`);
      return data;
    } catch (error) {
      console.error('❌ Error getting analysis results:', error);
      throw error;
    }
  }

  // ✅ NEW: Get analysis results organized by topic and date
  async getOrganizedAnalysisResults(userId) {
    try {
      const results = await this.getAnalysisResults(userId);
      
      // Organize by topic -> date -> hour
      const organized = {};
      
      results.forEach(result => {
        const { topic_name, date_key, hour, abcd_numbers, bcd_numbers } = result;
        
        if (!organized[topic_name]) {
          organized[topic_name] = {};
        }
        if (!organized[topic_name][date_key]) {
          organized[topic_name][date_key] = {};
        }
        
        organized[topic_name][date_key] = {
          abcdNumbers: abcd_numbers || [],
          bcdNumbers: bcd_numbers || [],
          source: result.analysis_source,
          analysisDate: result.analysis_date,
          pattern: result.pattern_type,
          metadata: result.metadata,
          updatedAt: result.updated_at
        };
      });

      console.log(`✅ Organized analysis results for ${Object.keys(organized).length} topics`);
      return organized;
    } catch (error) {
      console.error('❌ Error organizing analysis results:', error);
      throw error;
    }
  }

  // ✅ NEW: Save multiple analysis results at once (batch operation)
  async saveMultipleAnalysisResults(userId, analysisData) {
    try {
      console.log(`💾 Batch saving analysis results for ${Object.keys(analysisData).length} topics`);
      
      const insertData = [];
      
      for (const topicName in analysisData) {
        for (const dateKey in analysisData[topicName]) {
          const analysis = analysisData[topicName][dateKey];
          insertData.push({
            user_id: userId,
            topic_name: topicName,
            date_key: dateKey,
            hour: 'HR1', // Default to HR1, can be parameterized
            abcd_numbers: analysis.abcdNumbers || [],
            bcd_numbers: analysis.bcdNumbers || [],
            analysis_source: analysis.source || 'rule2_analysis',
            analysis_date: analysis.analysisDate || dateKey,
            pattern_type: analysis.pattern || 'N-1',
            metadata: analysis.metadata || {},
            updated_at: new Date().toISOString()
          });
        }
      }

      const { data, error } = await this.supabase
        .from('topic_analysis_results')
        .upsert(insertData, {
          onConflict: 'user_id,topic_name,date_key,hour'
        });

      if (error) throw error;
      console.log(`✅ Batch saved ${insertData.length} analysis results`);
      return true;
    } catch (error) {
      console.error('❌ Error batch saving analysis results:', error);
      throw error;
    }
  }

  // Health check
  async checkConnection() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count(*)')
        .limit(1);

      if (error) throw error;
      console.log('✅ Supabase connection healthy');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cleanSupabaseService = new CleanSupabaseService();
export default cleanSupabaseService;
