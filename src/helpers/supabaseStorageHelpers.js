// Helper functions for Supabase storage migration
import { supabase } from '../supabaseClient';

/**
 * Get Excel data with automatic fallback
 * Tries Supabase first, then falls back to localStorage automatically
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @returns {Promise<Object|null>} Returns parsed data object or null
 */
export async function getExcelFromSupabase(userId, date) {
  try {
    console.log(`🔍 Fetching Excel data with automatic fallback: userId=${userId}, date=${date}`);
    
    const { data, error } = await supabase
      .from('excel_data')
      .select('excel_data')
      .eq('user_id', userId)
      .eq('date_key', date)
      .single();

    if (!error && data && data.excel_data) {
      // Parse the JSON string stored in excel_data column
      let parsedData;
      try {
        // Handle both string and object cases
        if (typeof data.excel_data === 'string') {
          parsedData = JSON.parse(data.excel_data);
        } else {
          parsedData = data.excel_data;
        }
        
        // Extract the nested data object that contains sets and planets
        const result = parsedData.data || parsedData;
        
        console.log(`✅ Excel data fetched from Supabase:`, {
          date,
          hasData: !!result,
          hasSets: !!(result?.sets),
          setCount: result?.sets ? Object.keys(result.sets).length : 0
        });
        
        return result;
      } catch (parseError) {
        console.error(`❌ Failed to parse Excel data JSON, falling back to localStorage:`, parseError);
      }
    } else {
      console.log(`❌ Supabase Excel fetch failed, falling back to localStorage:`, error?.message || 'No data');
    }

    // Automatic fallback to localStorage
    console.log(`📦 Falling back to localStorage for Excel data`);
    return getExcelFromLocalStorage(userId, date);
    
  } catch (error) {
    console.error(`❌ Error fetching Excel data from Supabase, falling back to localStorage:`, error);
    return getExcelFromLocalStorage(userId, date);
  }
}

/**
 * Get Hour Entry data with automatic fallback
 * Tries Supabase first, then falls back to localStorage automatically
 * @param {string} userId - User ID
 * @param {string} date - Date string  
 * @returns {Promise<Object|null>} Returns planetSelections object or null
 */
export async function getHourEntryFromSupabase(userId, date) {
  try {
    console.log(`🔍 Fetching Hour Entry with automatic fallback: userId=${userId}, date=${date}`);
    
    const { data, error } = await supabase
      .from('hour_entry')
      .select('hour_data')
      .eq('user_id', userId)
      .eq('date_key', date)
      .single();

    if (!error && data && data.hour_data) {
      // Parse the JSON string stored in hour_data column
      let parsedData;
      try {
        // Handle both string and object cases
        if (typeof data.hour_data === 'string') {
          parsedData = JSON.parse(data.hour_data);
        } else {
          parsedData = data.hour_data;
        }
        
        // Extract planetSelections from the parsed data
        const planetSelections = parsedData.planetSelections || parsedData;
        
        console.log(`✅ Hour Entry fetched from Supabase:`, {
          date,
          hasPlanetSelections: !!planetSelections,
          hrKeys: planetSelections ? Object.keys(planetSelections) : []
        });

        return { planetSelections };
      } catch (parseError) {
        console.error(`❌ Failed to parse Hour Entry JSON, falling back to localStorage:`, parseError);
      }
    } else {
      console.log(`❌ Supabase Hour Entry fetch failed, falling back to localStorage:`, error?.message || 'No data');
    }

    // Automatic fallback to localStorage
    console.log(`📦 Falling back to localStorage for Hour Entry data`);
    return getHourEntryFromLocalStorage(userId, date);
    
  } catch (error) {
    console.error(`❌ Error fetching Hour Entry from Supabase, falling back to localStorage:`, error);
    return getHourEntryFromLocalStorage(userId, date);
  }
}

/**
 * Fallback to localStorage with original logic
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @returns {Object|null} Excel data from localStorage or null
 */
export function getExcelFromLocalStorage(userId, date) {
  try {
    const key = `abcd_excel_${userId}_${date}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.data || parsed;
    }
  } catch (error) {
    console.error(`❌ Error reading Excel from localStorage:`, error);
  }
  return null;
}

/**
 * Fallback to localStorage with original logic
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @returns {Object|null} Hour entry data from localStorage or null
 */
export function getHourEntryFromLocalStorage(userId, date) {
  try {
    const key = `abcd_hourEntry_${userId}_${date}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.planetSelections || parsed;
    }
  } catch (error) {
    console.error(`❌ Error reading Hour Entry from localStorage:`, error);
  }
  return null;
}

/**
 * Combined function that tries Supabase first, then localStorage
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @param {boolean} useSupabaseStorage - Flag to enable Supabase storage
 * @returns {Promise<Object>} Combined data object
 */
export async function getDataForDate(userId, date, useSupabaseStorage = true) {
  let excelData = null;
  let hourEntryData = null;

  if (useSupabaseStorage) {
    // Try Supabase first
    excelData = await getExcelFromSupabase(userId, date);
    hourEntryData = await getHourEntryFromSupabase(userId, date);
  }

  // Fallback to localStorage if Supabase fails or is disabled
  if (!excelData) {
    excelData = getExcelFromLocalStorage(userId, date);
  }
  
  if (!hourEntryData) {
    hourEntryData = getHourEntryFromLocalStorage(userId, date);
  }

  return {
    excelData,
    hourEntryData,
    hasData: !!(excelData && hourEntryData)
  };
}
