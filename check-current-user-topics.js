const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Connected to database');
});

console.log('🔍 CHECKING TOPIC COUNTS FOR 26/06/2025');
console.log('==========================================');

// Check all users with data for 26/06/2025
const checkTopics = () => {
    const query = `
        SELECT 
            user_id,
            COUNT(*) as total_rows,
            COUNT(DISTINCT dnumber) as unique_dnumbers,
            GROUP_CONCAT(DISTINCT dnumber ORDER BY dnumber) as dnumbers
        FROM excel_data 
        WHERE trigger_date = '2025-06-26'
        GROUP BY user_id
        ORDER BY unique_dnumbers DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error:', err);
            return;
        }
        
        console.log('\n📊 USERS WITH DATA FOR 26/06/2025:');
        console.log('===================================');
        
        if (rows.length === 0) {
            console.log('❌ No data found for 26/06/2025');
        } else {
            rows.forEach((row, index) => {
                const expectedTopics = row.unique_dnumbers * 2; // Each D-number should have 2 topics
                console.log(`\n${index + 1}. User: ${row.user_id}`);
                console.log(`   📈 Total rows: ${row.total_rows}`);
                console.log(`   🎯 Unique D-numbers: ${row.unique_dnumbers}`);
                console.log(`   📝 Expected topics: ${expectedTopics}`);
                console.log(`   🔢 D-numbers: ${row.dnumbers || 'None'}`);
                
                if (row.unique_dnumbers === 15) {
                    console.log('   ✅ COMPLETE DATA (should show 30 topics)');
                } else {
                    console.log(`   ❌ INCOMPLETE DATA (missing ${15 - row.unique_dnumbers} D-numbers)`);
                }
            });
        }
        
        // Check which D-numbers are missing for incomplete users
        console.log('\n🔍 MISSING D-NUMBERS ANALYSIS:');
        console.log('==============================');
        
        const expectedDNumbers = ['D-1', 'D-3', 'D-4', 'D-5', 'D-7', 'D-9', 'D-10', 'D-11', 'D-12', 'D-27', 'D-30', 'D-60', 'D-81', 'D-108', 'D-144'];
        
        rows.forEach((row) => {
            if (row.unique_dnumbers < 15) {
                const userDNumbers = row.dnumbers ? row.dnumbers.split(',') : [];
                const missing = expectedDNumbers.filter(d => !userDNumbers.includes(d));
                console.log(`\nUser ${row.user_id}:`);
                console.log(`   Has: ${userDNumbers.join(', ')}`);
                console.log(`   Missing: ${missing.join(', ')}`);
            }
        });
        
        db.close();
    });
};

checkTopics();
