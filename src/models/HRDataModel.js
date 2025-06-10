import { supabase } from '../supabaseClient';

export class HRDataModel {
  constructor(userId) {
    this.userId = userId;
  }

  async fetch() {
    const { data, error } = await supabase
      .from('hr_data')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async shiftDataForNewDate(oldDates, newDates) {
    try {
      // Get all data for the affected dates
      const { data: existingData, error: fetchError } = await supabase
        .from('hr_data')
        .select('*')
        .eq('user_id', this.userId)
        .in('date', Object.values(oldDates));

      if (fetchError) throw fetchError;

      // Create mapping of old dates to new days
      const dateMapping = new Map();
      Object.entries(oldDates).forEach(([oldDay, oldDate]) => {
        Object.entries(newDates).forEach(([newDay, newDate]) => {
          if (oldDate === newDate) {
            dateMapping.set(oldDate, parseInt(newDay));
          }
        });
      });

      // Update data with new day numbers
      const updatedData = existingData.map(record => {
        const newDay = dateMapping.get(record.date);
        if (!newDay) return null;

        const newRecord = { ...record };
        if (record.topic.startsWith('DAY-')) {
          newRecord.topic = `DAY-${newDay}`;
        }
        return newRecord;
      }).filter(Boolean);

      // Delete old data
      if (existingData.length > 0) {
        const { error: deleteError } = await supabase
          .from('hr_data')
          .delete()
          .eq('user_id', this.userId)
          .in('date', Object.values(oldDates));

        if (deleteError) throw deleteError;
      }

      // Insert updated data
      if (updatedData.length > 0) {
        const { error: insertError } = await supabase
          .from('hr_data')
          .insert(updatedData);

        if (insertError) throw insertError;
      }

      return this.fetch();
    } catch (error) {
      console.error('Error shifting data:', error);
      throw error;
    }
  }

  async save(dates, formData, user) {
    const newData = this.processFormData(dates, formData, user);
    
    // Delete existing data for these dates
    const datesToUpdate = Object.values(dates).filter(Boolean);
    if (datesToUpdate.length > 0) {
      const { error: deleteError } = await supabase
        .from('hr_data')
        .delete()
        .eq('user_id', this.userId)
        .in('date', datesToUpdate);

      if (deleteError) throw deleteError;
    }

    // Insert new data
    if (newData.length > 0) {
      const { error: insertError } = await supabase
        .from('hr_data')
        .insert(newData);

      if (insertError) throw insertError;
    }

    return this.fetch();
  }

  processFormData(dates, formData, user) {
    const newData = [];

    Object.entries(dates).forEach(([day, date]) => {
      if (!date) return;

      for (let hr = 1; hr <= user.hr; hr++) {
        // Add planet data
        const planet = formData.get(`planet_hr${hr}_day${day}`);
        if (planet) {
          newData.push({
            user_id: this.userId,
            topic: `DAY-${day}`,
            date,
            hr_number: `HR-${hr}`,
            planet_house: planet
          });
        }

        // Add division data
        const divisions = this.getDivisions();
        divisions.forEach(division => {
          const house = formData.get(`house_hr${hr}_day${day}_${division}`);
          if (house) {
            newData.push({
              user_id: this.userId,
              topic: division,
              date,
              hr_number: `HR-${hr}`,
              planet_house: house
            });
          }
        });
      }
    });

    return newData;
  }

  getDivisions() {
    return [
      "D-1", "D-9", "D-10", "D-3", "D-4", "D-7", "D-12", 
      "D-27", "D-30", "D-60", "D-5", "D-11", "D-81", 
      "D-108", "D-144"
    ];
  }
}