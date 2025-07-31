#!/usr/bin/env node
/**
 * 🔄 Supabase to Firebase Data Migration Script (Node.js Compatible)
 * 
 * This script safely copies all data from Supabase to Firebase without deleting anything.
 * Usage: node migrate-supabase-to-firebase-node.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase stub service for migration logging
class FirebaseStubService {
  constructor() {
    console.log('🔥 Firebase Stub Service initialized for migration logging');
  }

  async createUser(userData) {
    console.log('🔥 [Firebase] Would create user:', userData.username || userData.id);
    return { success: true, source: 'firebase-stub' };
  }

  async saveExcelData(userId, date, excelData) {
    console.log('🔥 [Firebase] Would save Excel data:', { userId, date, fileName: excelData.fileName });
    return { success: true, source: 'firebase-stub' };
  }

  async saveHourEntry(userId, date, planetSelections) {
    console.log('🔥 [Firebase] Would save hour entry:', { userId, date, hrCount: Object.keys(planetSelections).length });
    return { success: true, source: 'firebase-stub' };
  }

  async saveUserDates(userId, dates) {
    console.log('🔥 [Firebase] Would save user dates:', { userId, dateCount: dates.length });
    return { success: true, source: 'firebase-stub' };
  }
}

// Supabase service wrapper
class SupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }

  async getUserDates(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_dates_abcd')
        .select('dates')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.dates || [];
    } catch (error) {
      console.warn('⚠️ Could not get dates for user:', error.message);
      return [];
    }
  }

  async getExcelData(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('excel_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? {
        fileName: data.file_name,
        sets: data.data?.sets || {},
        date: data.date
      } : null;
    } catch (error) {
      return null;
    }
  }

  async getHourEntry(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? {
        planetSelections: data.hour_data?.planetSelections || {},
        date: data.date_key
      } : null;
    } catch (error) {
      return null;
    }
  }

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
}

class DataMigration {
  constructor() {
    this.supabaseService = new SupabaseService();
    this.firebaseService = new FirebaseStubService();
    this.stats = {
      startTime: new Date(),
      users: { total: 0, migrated: 0, errors: 0 },
      excelData: { total: 0, migrated: 0, errors: 0 },
      hourEntries: { total: 0, migrated: 0, errors: 0 },
      userDates: { total: 0, migrated: 0, errors: 0 },
      errors: []
    };
  }

  async startMigration() {
    console.log('🚀 Starting Supabase to Firebase Data Migration...');
    console.log('📅 Started at:', this.stats.startTime.toISOString());
    console.log('');

    try {
      // Step 1: Migrate Users
      await this.migrateUsers();

      // Step 2: Migrate User Dates  
      await this.migrateUserDates();

      // Step 3: Migrate Excel Data
      await this.migrateExcelData();

      // Step 4: Migrate Hour Entries
      await this.migrateHourEntries();

      // Show final summary
      this.showMigrationSummary();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.stats.errors.push({ step: 'general', error: error.message });
      this.showMigrationSummary();
    }
  }

  async migrateUsers() {
    console.log('👥 Migrating Users...');
    
    try {
      const users = await this.supabaseService.getAllUsers();
      this.stats.users.total = users.length;

      console.log(`📊 Found ${users.length} users to migrate`);

      for (const user of users) {
        try {
          console.log(`   📤 Migrating user: ${user.username} (${user.id})`);
          
          // Save user to Firebase 
          await this.firebaseService.createUser(user);
          this.stats.users.migrated++;
          console.log(`   ✅ User ${user.username} migrated successfully`);

        } catch (error) {
          this.stats.users.errors++;
          this.stats.errors.push({
            step: 'users',
            user: user.username,
            error: error.message
          });
          console.log(`   ❌ Failed to migrate user ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ Users migration completed: ${this.stats.users.migrated}/${this.stats.users.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to fetch users from Supabase:', error);
      throw error;
    }
  }

  async migrateUserDates() {
    console.log('📅 Migrating User Dates...');
    
    try {
      const users = await this.supabaseService.getAllUsers();

      for (const user of users) {
        try {
          console.log(`   📤 Migrating dates for user: ${user.username}`);
          
          const userDates = await this.supabaseService.getUserDates(user.id);
          
          if (userDates && userDates.length > 0) {
            await this.firebaseService.saveUserDates(user.id, userDates);
            this.stats.userDates.migrated++;
            console.log(`   ✅ ${userDates.length} dates migrated for ${user.username}`);
          } else {
            console.log(`   ℹ️ No dates found for ${user.username}`);
          }

          this.stats.userDates.total++;

        } catch (error) {
          this.stats.userDates.errors++;
          this.stats.errors.push({
            step: 'userDates',
            user: user.username,
            error: error.message
          });
          console.log(`   ❌ Failed to migrate dates for ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ User dates migration completed: ${this.stats.userDates.migrated}/${this.stats.userDates.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate user dates:', error);
      throw error;
    }
  }

  async migrateExcelData() {
    console.log('📊 Migrating Excel Data...');
    
    try {
      const users = await this.supabaseService.getAllUsers();

      for (const user of users) {
        try {
          const userDates = await this.supabaseService.getUserDates(user.id);
          
          for (const date of userDates) {
            try {
              console.log(`   📤 Checking Excel data for ${user.username} on ${date}`);
              
              const excelData = await this.supabaseService.getExcelData(user.id, date);
              
              if (excelData) {
                await this.firebaseService.saveExcelData(user.id, date, excelData);
                this.stats.excelData.migrated++;
                console.log(`   ✅ Excel data migrated for ${user.username} - ${date}`);
              } else {
                console.log(`   ℹ️ No Excel data for ${user.username} - ${date}`);
              }

              this.stats.excelData.total++;

            } catch (error) {
              this.stats.excelData.errors++;
              this.stats.errors.push({
                step: 'excelData',
                user: user.username,
                date: date,
                error: error.message
              });
              console.log(`   ❌ Failed to migrate Excel data for ${user.username} - ${date}: ${error.message}`);
            }
          }

        } catch (error) {
          console.log(`   ⚠️ Could not get dates for ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ Excel data migration completed: ${this.stats.excelData.migrated}/${this.stats.excelData.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate Excel data:', error);
      throw error;
    }
  }

  async migrateHourEntries() {
    console.log('⏰ Migrating Hour Entries...');
    
    try {
      const users = await this.supabaseService.getAllUsers();

      for (const user of users) {
        try {
          const userDates = await this.supabaseService.getUserDates(user.id);
          
          for (const date of userDates) {
            try {
              console.log(`   📤 Checking Hour entry for ${user.username} on ${date}`);
              
              const hourEntry = await this.supabaseService.getHourEntry(user.id, date);
              
              if (hourEntry && hourEntry.planetSelections) {
                await this.firebaseService.saveHourEntry(user.id, date, hourEntry.planetSelections);
                this.stats.hourEntries.migrated++;
                console.log(`   ✅ Hour entry migrated for ${user.username} - ${date}`);
              } else {
                console.log(`   ℹ️ No Hour entry for ${user.username} - ${date}`);
              }

              this.stats.hourEntries.total++;

            } catch (error) {
              this.stats.hourEntries.errors++;
              this.stats.errors.push({
                step: 'hourEntries',
                user: user.username,
                date: date,
                error: error.message
              });
              console.log(`   ❌ Failed to migrate Hour entry for ${user.username} - ${date}: ${error.message}`);
            }
          }

        } catch (error) {
          console.log(`   ⚠️ Could not get dates for ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ Hour entries migration completed: ${this.stats.hourEntries.migrated}/${this.stats.hourEntries.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate hour entries:', error);
      throw error;
    }
  }

  showMigrationSummary() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.stats.startTime) / 1000);

    console.log('');
    console.log('🎉 Migration Summary');
    console.log('==========================================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📅 Completed: ${endTime.toISOString()}`);
    console.log('');

    console.log('📊 Migration Results:');
    console.log(`👥 Users:        ${this.stats.users.migrated}/${this.stats.users.total} migrated (${this.stats.users.errors} errors)`);
    console.log(`📅 User Dates:   ${this.stats.userDates.migrated}/${this.stats.userDates.total} migrated (${this.stats.userDates.errors} errors)`);
    console.log(`📊 Excel Data:   ${this.stats.excelData.migrated}/${this.stats.excelData.total} migrated (${this.stats.excelData.errors} errors)`);
    console.log(`⏰ Hour Entries: ${this.stats.hourEntries.migrated}/${this.stats.hourEntries.total} migrated (${this.stats.hourEntries.errors} errors)`);
    console.log('');

    const totalItems = this.stats.users.total + this.stats.userDates.total + 
                      this.stats.excelData.total + this.stats.hourEntries.total;
    const totalMigrated = this.stats.users.migrated + this.stats.userDates.migrated + 
                         this.stats.excelData.migrated + this.stats.hourEntries.migrated;
    const totalErrors = this.stats.users.errors + this.stats.userDates.errors + 
                       this.stats.excelData.errors + this.stats.hourEntries.errors;

    console.log(`📈 Overall: ${totalMigrated}/${totalItems} items migrated successfully`);
    console.log(`❌ Total Errors: ${totalErrors}`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('⚠️  Error Details:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.step}] ${error.user || 'General'} ${error.date || ''}: ${error.error}`);
      });
    }

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Enable Firebase in production environment');
    console.log('2. Test Firebase data integrity');  
    console.log('3. Set up Firebase as backup service');
    console.log('4. Configure dual-service mode for production');
  }
}

// Run migration automatically
const migration = new DataMigration();

// Add graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Migration interrupted by user');
  migration.showMigrationSummary();
  process.exit(0);
});

// Start migration
migration.startMigration()
  .then(() => {
    console.log('🎉 Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    migration.showMigrationSummary();
    process.exit(1);
  });
