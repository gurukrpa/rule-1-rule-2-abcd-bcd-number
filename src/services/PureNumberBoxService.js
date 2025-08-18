// Pure Clean Number Box Service - SUPABASE ONLY
import { supabase } from '../supabaseClient';

class PureNumberBoxService {
  // Click a number - toggle on/off
  async clickNumber(userId, topic, dateKey, hour, number) {
    try {
      // Check if already clicked
      const { data: existing } = await supabase
        .from('topic_clicks')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_name', topic)
        .eq('date_key', dateKey)
        .eq('hour', hour)
        .eq('clicked_number', number)
        .single();

      if (existing) {
        // Remove if exists
        await supabase
          .from('topic_clicks')
          .delete()
          .eq('id', existing.id);
        return false; // Not clicked anymore
      } else {
        // Add if doesn't exist
        await supabase
          .from('topic_clicks')
          .insert({
            user_id: userId,
            topic_name: topic,
            date_key: dateKey,
            hour: hour,
            clicked_number: number,
            is_matched: true
          });
        return true; // Now clicked
      }
    } catch (error) {
      console.error('Error clicking number:', error);
      throw error;
    }
  }

  // Get clicked numbers for specific context
  async getClickedNumbers(userId, topic, dateKey, hour) {
    try {
      const { data, error } = await supabase
        .from('topic_clicks')
        .select('clicked_number')
        .eq('user_id', userId)
        .eq('topic_name', topic)
        .eq('date_key', dateKey)
        .eq('hour', hour);

      if (error) throw error;
      return data.map(row => row.clicked_number);
    } catch (error) {
      console.error('Error getting clicked numbers:', error);
      return [];
    }
  }

  // Get all clicked numbers for user (for cross-page sync)
  async getAllClickedNumbers(userId) {
    try {
      const { data, error } = await supabase
        .from('topic_clicks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting all clicked numbers:', error);
      return [];
    }
  }

  // Count highlighted topics for a date/hour
  async getHighlightedCount(userId, dateKey, hour, abcdBcdData) {
    try {
      const allClicked = await this.getAllClickedNumbers(userId);
      
      let count = 0;
      const topics = {};
      
      // Group by topic
      allClicked.forEach(click => {
        if (click.date_key === dateKey && click.hour === hour) {
          if (!topics[click.topic_name]) topics[click.topic_name] = [];
          topics[click.topic_name].push(click.clicked_number);
        }
      });

      // Count topics that have clicked numbers matching ABCD/BCD
      Object.keys(topics).forEach(topic => {
        const clickedNumbers = topics[topic];
        const analysis = abcdBcdData[topic];
        
        if (analysis) {
          const hasMatch = clickedNumbers.some(num => 
            analysis.abcdNumbers?.includes(num) || analysis.bcdNumbers?.includes(num)
          );
          if (hasMatch) count++;
        }
      });

      return count;
    } catch (error) {
      console.error('Error counting highlighted topics:', error);
      return 0;
    }
  }
}

export default new PureNumberBoxService();
