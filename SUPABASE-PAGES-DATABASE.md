# Supabase Database Setup for IndexPage, Rule-1, and Rule-2

This document outlines the new database schema and implementation for easier date-by-date management, especially for adding new D-dates to Rule-1 analysis.

## 🗄️ Database Schema

### Core Tables

1. **`processed_data`** - Main table storing all processed Excel/Hour data
   - Supports Index, Rule-1, and Rule-2 pages
   - Stores both raw and formatted data
   - Includes extracted numbers, planet codes, sign codes

2. **`abcd_sequences`** - Stores ABCD date sequences for analysis
   - Links Rule-1 and Rule-2 trigger dates to their A,B,C,D dates
   - Tracks selected HR for each sequence

3. **`analysis_results`** - Stores ABCD/BCD analysis results
   - Linked to sequences via foreign key
   - Includes badge text and qualification reasons

4. **`index_page_cache`** - Performance cache for IndexPage display
   - Reduces processing time for repeated views
   - Auto-expires after 1 hour

### Helpful Views

- **`rule1_current_sequences`** - Current Rule-1 sequences ready for new D-date
- **`rule2_analysis_summary`** - Rule-2 analysis summaries
- **`index_page_ready_data`** - Dates with complete data for IndexPage

## 🚀 Key Features

### Easy D-Date Addition for Rule-1

Instead of managing complex ABCD sequences manually:

```javascript
// OLD WAY - Complex manual management
const dates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'];
// Add new date and manually shift everything...

// NEW WAY - Simple D-date addition
const { addNewDDate } = useRule1DDateManager(userId);
await addNewDDate('2025-01-05', processedDDateData);
// Automatically: A→B, B→C, C→D, D→NewD + run analysis
```

### Date-by-Date Data Access

```javascript
// Get specific date data
const dateData = await pagesDataService.getProcessedData('2025-01-05', 'rule1');

// Get multiple dates for ABCD sequence
const sequenceData = await pagesDataService.getProcessedDataForDates(
  ['2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'], 
  'rule1'
);
```

### Automatic Analysis

When adding a new D-date:
1. ✅ Data automatically processed and stored
2. ✅ New ABCD sequence created (shifted dates)
3. ✅ ABCD/BCD analysis runs automatically
4. ✅ Results stored with badge text for display

## 📁 File Structure

### Database
- `supabase_schema_pages.sql` - Complete database schema
- Run this in Supabase SQL Editor to create all tables

### Services
- `src/services/PagesDataService.js` - Main database service class
- Handles all CRUD operations for pages data

### Hooks
- `src/hooks/useRule1DDateManager.js` - React hook for Rule-1 D-date management
- Simplifies adding new D-dates with automatic analysis

### Components
- `src/components/Rule1DDateManager.jsx` - Example component showing usage
- Ready-to-use interface for adding D-dates

## 🛠️ Setup Instructions

### 1. Create Database Tables

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_schema_pages.sql`
3. Run the SQL to create all tables and views

### 2. Update Existing Components

Integrate the new services into existing pages:

```javascript
// In Rule1Page.jsx
import { PagesDataService } from '../services/PagesDataService';
import { useRule1DDateManager } from '../hooks/useRule1DDateManager';

const Rule1Page = ({ userId, date }) => {
  const pagesDataService = new PagesDataService(userId);
  const { addNewDDate, currentSequence } = useRule1DDateManager(userId);
  
  // Use database instead of localStorage
  const loadData = async () => {
    const data = await pagesDataService.getProcessedData(date, 'rule1');
    // Process data...
  };
  
  // Rest of component...
};
```

### 3. Migration from localStorage

```javascript
// Migrate existing localStorage data
const pagesDataService = new PagesDataService(userId);
const localData = {
  dates: JSON.parse(localStorage.getItem('dates') || '{}'),
  // ... other localStorage data
};

const migrationResults = await pagesDataService.migrateFromLocalStorage(localData);
console.log('Migration results:', migrationResults);
```

## 📊 Usage Examples

### Adding New D-Date to Rule-1

```javascript
// 1. User uploads Excel for new date
const excelData = processExcelFile(file);

// 2. Add to Rule-1 sequence
const result = await addNewDDate('2025-01-06', excelData);

// 3. Results automatically available
console.log('ABCD Results:', result.analysisResults);
```

### Displaying IndexPage Data

```javascript
// Get cached data or fetch fresh
const displayData = await pagesDataService.getCachedIndexPageData(
  dateWindow, selectedHR, setName
) || await pagesDataService.generateIndexPageData(dateWindow);
```

### Rule-2 Analysis

```javascript
// Create sequence and analyze
const sequence = await pagesDataService.saveABCDSequence(
  triggerDate, 'rule2', aDate, bDate, cDate, dDate, selectedHR
);

const analysisResults = await runRule2Analysis(sequence);
await pagesDataService.saveAnalysisResults(sequence.id, analysisResults);
```

## 🔧 Benefits

1. **Simplified D-Date Addition**: Just add new date, analysis happens automatically
2. **Date-by-Date Access**: Easy retrieval of specific date data
3. **Performance**: Cached IndexPage data, indexed queries
4. **Consistency**: Single source of truth in database
5. **Scalability**: Handles large datasets efficiently
6. **Audit Trail**: Full history of sequences and analysis results

## 🚨 Migration Notes

- Existing localStorage data can be migrated using the provided migration methods
- No breaking changes to existing components if using the new services
- Database tables are designed to coexist with current localStorage approach during transition
- Cache tables improve performance without changing logic

This database structure makes it much easier to handle the growing complexity of ABCD sequences while providing a clean interface for adding new D-dates to Rule-1 analysis.
