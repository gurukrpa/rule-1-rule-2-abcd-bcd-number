import { supabase } from '../supabaseClient';

export const backupService = {
  async createBackup(userId) {
    try {
      // Fetch all user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Fetch all HR data for the user
      const { data: hrData, error: hrError } = await supabase
        .from('hr_data')
        .select('*')
        .eq('user_id', userId);

      if (hrError) throw hrError;

      // Create backup object
      const backup = {
        timestamp: new Date().toISOString(),
        user: userData,
        hrData: hrData || [],
      };

      // Save to localStorage
      const backupKey = `housecount_backup_${userId}`;
      const existingBackups = JSON.parse(localStorage.getItem(backupKey) || '[]');
      
      // Keep only the last 5 backups
      existingBackups.unshift(backup);
      if (existingBackups.length > 5) {
        existingBackups.pop();
      }

      localStorage.setItem(backupKey, JSON.stringify(existingBackups));
      return backup;

    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  },

  async restoreBackup(userId, timestamp) {
    try {
      // Get backups from localStorage
      const backupKey = `housecount_backup_${userId}`;
      const backups = JSON.parse(localStorage.getItem(backupKey) || '[]');
      
      // Find the specific backup
      const backup = backups.find(b => b.timestamp === timestamp);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Delete existing HR data
      const { error: deleteError } = await supabase
        .from('hr_data')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert backed up HR data
      if (backup.hrData.length > 0) {
        const { error: insertError } = await supabase
          .from('hr_data')
          .insert(backup.hrData);

        if (insertError) throw insertError;
      }

      return backup;

    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw error;
    }
  },

  getBackups(userId) {
    const backupKey = `housecount_backup_${userId}`;
    return JSON.parse(localStorage.getItem(backupKey) || '[]');
  },

  deleteBackup(userId, timestamp) {
    const backupKey = `housecount_backup_${userId}`;
    const backups = JSON.parse(localStorage.getItem(backupKey) || '[]');
    const updatedBackups = backups.filter(b => b.timestamp !== timestamp);
    localStorage.setItem(backupKey, JSON.stringify(updatedBackups));
  }
};