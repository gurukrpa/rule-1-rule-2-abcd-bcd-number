// Helper functions for Supabase storage - Supabase only, no localStorage fallback
import { supabase } from '../supabaseClient';

/**
 * Get Excel data from Supabase only
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @returns {Promise<Object|null>} Returns parsed data object or null
 */
export async function getExcelFromSupabase(userId, date) {
  try {
    console.log(`🔍 Fetching Excel data from Supabase: userId=${userId}, date=${date}`);
    
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
        console.error(`❌ Failed to parse Excel data JSON:`, parseError);
        return null;
      }
    } else {
      console.log(`❌ Supabase Excel fetch failed or no data found:`, error?.message || 'No data');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching Excel data from Supabase:`, error);
    return null;
  }
}

/**
 * Get Hour Entry data from Supabase only
 * @param {string} userId - User ID
 * @param {string} date - Date string  
 * @returns {Promise<Object|null>} Returns planetSelections object or null
 */
export async function getHourEntryFromSupabase(userId, date) {
  try {
    console.log(`🔍 Fetching Hour Entry from Supabase: userId=${userId}, date=${date}`);
    
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
        console.error(`❌ Failed to parse Hour Entry JSON:`, parseError);
        return null;
      }
    } else {
      console.log(`❌ Supabase Hour Entry fetch failed or no data found:`, error?.message || 'No data');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching Hour Entry from Supabase:`, error);
    return null;
  }
}

/**
 * Combined function that gets data from Supabase only
 * @param {string} userId - User ID
 * @param {string} date - Date string
 * @returns {Promise<Object>} Combined data object
 */
export async function getDataForDate(userId, date) {
  const excelData = await getExcelFromSupabase(userId, date);
  const hourEntryData = await getHourEntryFromSupabase(userId, date);

  return {
    excelData,
    hourEntryData,
    hasData: !!(excelData && hourEntryData)
  };
}
