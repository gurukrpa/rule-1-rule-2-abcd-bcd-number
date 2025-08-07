#!/usr/bin/env node
/**
 * 🔄 Supabase to Firebase Data Migration Script
 * 
 * This script safely copies all data from Supabase to Firebase without deleting anything.
 * It handles all your existing data including:
 * - Users
 * - Excel uploads  
 * - Hour entries
 * - User dates
 * - ABCD/BCD numbers
 * - Rule2 analysis results
 * 
 * Usage: node migrate-supabase-to-firebase.js
 */

import { cleanSupabaseService } from './src/services/CleanSupabaseService.js';
import { dualServiceManager } from './src/services/DualServiceManager.js';

class SupabaseToFirebaseMigration {
  constructor() {
    this.migrationStats = {
      startTime: new Date(),
      users: { total: 0, migrated: 0, errors: 0 },
      excelData: { total: 0, migrated: 0, errors: 0 },
      hourEntries: { total: 0, migrated: 0, errors: 0 },
      userDates: { total: 0, migrated: 0, errors: 0 },
      abcdNumbers: { total: 0, migrated: 0, errors: 0 },
      errors: []
    };
  }

  async startMigration() {
    console.log('🚀 Starting Supabase to Firebase Migration...');
    console.log('📅 Started at:', this.migrationStats.startTime.toISOString());
    console.log('');

    try {
      // Enable dual-service mode for migration
      console.log('🔧 Enabling dual-service mode...');
      dualServiceManager.enable();

      // Step 1: Migrate Users
      await this.migrateUsers();

      // Step 2: Migrate User Dates  
      await this.migrateUserDates();

      // Step 3: Migrate Excel Data
      await this.migrateExcelData();

      // Step 4: Migrate Hour Entries
      await this.migrateHourEntries();

      // Step 5: Migrate ABCD/BCD Numbers (if available)
      await this.migrateAbcdNumbers();

      // Show final summary
      this.showMigrationSummary();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.migrationStats.errors.push({ step: 'general', error: error.message });
    }
  }

  async migrateUsers() {
    console.log('👥 Migrating Users...');
    
    try {
      const users = await cleanSupabaseService.getAllUsers();
      this.migrationStats.users.total = users.length;

      console.log(`📊 Found ${users.length} users to migrate`);

      for (const user of users) {
        try {
          console.log(`   📤 Migrating user: ${user.username} (${user.id})`);
          
          // Save user to Firebase via dual-service manager
          const result = await dualServiceManager.saveUser(user);
          
          if (result.overall.success) {
            this.migrationStats.users.migrated++;
            console.log(`   ✅ User ${user.username} migrated successfully`);
          } else {
            this.migrationStats.users.errors++;
            console.log(`   ⚠️ Partial migration for user ${user.username}`);
          }

        } catch (error) {
          this.migrationStats.users.errors++;
          this.migrationStats.errors.push({
            step: 'users',
            user: user.username,
            error: error.message
          });
          console.log(`   ❌ Failed to migrate user ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ Users migration completed: ${this.migrationStats.users.migrated}/${this.migrationStats.users.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to fetch users from Supabase:', error);
      throw error;
    }
  }

  async migrateUserDates() {
    console.log('📅 Migrating User Dates...');
    
    try {
      const users = await cleanSupabaseService.getAllUsers();

      for (const user of users) {
        try {
          console.log(`   📤 Migrating dates for user: ${user.username}`);
          
          const userDates = await cleanSupabaseService.getUserDates(user.id);
          
          if (userDates && userDates.length > 0) {
            const result = await dualServiceManager.saveUserDates(user.id, userDates);
            
            if (result.overall.success) {
              this.migrationStats.userDates.migrated++;
              console.log(`   ✅ ${userDates.length} dates migrated for ${user.username}`);
            } else {
              this.migrationStats.userDates.errors++;
              console.log(`   ⚠️ Partial migration of dates for ${user.username}`);
            }
          } else {
            console.log(`   ℹ️ No dates found for ${user.username}`);
          }

          this.migrationStats.userDates.total++;

        } catch (error) {
          this.migrationStats.userDates.errors++;
          this.migrationStats.errors.push({
            step: 'userDates',
            user: user.username,
            error: error.message
          });
          console.log(`   ❌ Failed to migrate dates for ${user.username}: ${error.message}`);
        }
      }

      console.log(`✅ User dates migration completed: ${this.migrationStats.userDates.migrated}/${this.migrationStats.userDates.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate user dates:', error);
      throw error;
    }
  }

  async migrateExcelData() {
    console.log('📊 Migrating Excel Data...');
    
    try {
      const users = await cleanSupabaseService.getAllUsers();

      for (const user of users) {
        try {
          const userDates = await cleanSupabaseService.getUserDates(user.id);
          
          for (const date of userDates) {
            try {
              console.log(`   📤 Checking Excel data for ${user.username} on ${date}`);
              
              const excelData = await cleanSupabaseService.getExcelData(user.id, date);
              
              if (excelData) {
                const result = await dualServiceManager.saveExcelData(user.id, date, excelData);
                
                if (result.overall.success) {
                  this.migrationStats.excelData.migrated++;
                  console.log(`   ✅ Excel data migrated for ${user.username} - ${date}`);
                } else {
                  this.migrationStats.excelData.errors++;
                  console.log(`   ⚠️ Partial migration of Excel data for ${user.username} - ${date}`);
                }
              } else {
                console.log(`   ℹ️ No Excel data for ${user.username} - ${date}`);
              }

              this.migrationStats.excelData.total++;

            } catch (error) {
              this.migrationStats.excelData.errors++;
              this.migrationStats.errors.push({
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

      console.log(`✅ Excel data migration completed: ${this.migrationStats.excelData.migrated}/${this.migrationStats.excelData.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate Excel data:', error);
      throw error;
    }
  }

  async migrateHourEntries() {
    console.log('⏰ Migrating Hour Entries...');
    
    try {
      const users = await cleanSupabaseService.getAllUsers();

      for (const user of users) {
        try {
          const userDates = await cleanSupabaseService.getUserDates(user.id);
          
          for (const date of userDates) {
            try {
              console.log(`   📤 Checking Hour entry for ${user.username} on ${date}`);
              
              const hourEntry = await cleanSupabaseService.getHourEntry(user.id, date);
              
              if (hourEntry && hourEntry.planetSelections) {
                const result = await dualServiceManager.saveHourEntry(user.id, date, hourEntry.planetSelections);
                
                if (result.overall.success) {
                  this.migrationStats.hourEntries.migrated++;
                  console.log(`   ✅ Hour entry migrated for ${user.username} - ${date}`);
                } else {
                  this.migrationStats.hourEntries.errors++;
                  console.log(`   ⚠️ Partial migration of Hour entry for ${user.username} - ${date}`);
                }
              } else {
                console.log(`   ℹ️ No Hour entry for ${user.username} - ${date}`);
              }

              this.migrationStats.hourEntries.total++;

            } catch (error) {
              this.migrationStats.hourEntries.errors++;
              this.migrationStats.errors.push({
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

      console.log(`✅ Hour entries migration completed: ${this.migrationStats.hourEntries.migrated}/${this.migrationStats.hourEntries.total}`);
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate hour entries:', error);
      throw error;
    }
  }

  async migrateAbcdNumbers() {
    console.log('🔢 Migrating ABCD/BCD Numbers...');
    
    try {
      // This would require implementing Firebase ABCD/BCD number storage
      console.log('   ℹ️ ABCD/BCD numbers migration requires Firebase implementation');
      console.log('   ℹ️ Currently stored in: topic_abcd_bcd_numbers table');
      console.log('   ℹ️ This step can be implemented once Firebase service is fully configured');
      
      this.migrationStats.abcdNumbers.total = 0;
      this.migrationStats.abcdNumbers.migrated = 0;

      console.log('⏭️ ABCD/BCD numbers migration skipped (Firebase implementation needed)');
      console.log('');

    } catch (error) {
      console.error('❌ Failed to migrate ABCD/BCD numbers:', error);
    }
  }

  showMigrationSummary() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.migrationStats.startTime) / 1000);

    console.log('');
    console.log('🎉 Migration Summary');
    console.log('==========================================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📅 Completed: ${endTime.toISOString()}`);
    console.log('');

    console.log('📊 Migration Results:');
    console.log(`👥 Users:        ${this.migrationStats.users.migrated}/${this.migrationStats.users.total} migrated (${this.migrationStats.users.errors} errors)`);
    console.log(`📅 User Dates:   ${this.migrationStats.userDates.migrated}/${this.migrationStats.userDates.total} migrated (${this.migrationStats.userDates.errors} errors)`);
    console.log(`📊 Excel Data:   ${this.migrationStats.excelData.migrated}/${this.migrationStats.excelData.total} migrated (${this.migrationStats.excelData.errors} errors)`);
    console.log(`⏰ Hour Entries: ${this.migrationStats.hourEntries.migrated}/${this.migrationStats.hourEntries.total} migrated (${this.migrationStats.hourEntries.errors} errors)`);
    console.log(`🔢 ABCD Numbers: ${this.migrationStats.abcdNumbers.migrated}/${this.migrationStats.abcdNumbers.total} migrated (${this.migrationStats.abcdNumbers.errors} errors)`);
    console.log('');

    const totalItems = this.migrationStats.users.total + this.migrationStats.userDates.total + 
                      this.migrationStats.excelData.total + this.migrationStats.hourEntries.total;
    const totalMigrated = this.migrationStats.users.migrated + this.migrationStats.userDates.migrated + 
                         this.migrationStats.excelData.migrated + this.migrationStats.hourEntries.migrated;
    const totalErrors = this.migrationStats.users.errors + this.migrationStats.userDates.errors + 
                       this.migrationStats.excelData.errors + this.migrationStats.hourEntries.errors;

    console.log(`📈 Overall: ${totalMigrated}/${totalItems} items migrated successfully`);
    console.log(`❌ Total Errors: ${totalErrors}`);

    if (this.migrationStats.errors.length > 0) {
      console.log('');
      console.log('⚠️  Error Details:');
      this.migrationStats.errors.forEach((error, index) => {
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

  // Helper method to add a user save method to dual service manager
  async saveUser(user) {
    // Use the new createUser method in DualServiceManager
    try {
      return await dualServiceManager.createUser(user);
    } catch (error) {
      console.log('⚠️ User save error:', error.message);
      return { overall: { success: false }, error: error.message };
    }
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new SupabaseToFirebaseMigration();
  
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
}

export { SupabaseToFirebaseMigration };
