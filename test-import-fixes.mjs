#!/usr/bin/env node

// Quick test to verify import fixes in planetsAnalysisDataService.js
console.log('🔧 TESTING IMPORT FIXES');
console.log('======================');

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testImportFixes() {
    try {
        console.log('📄 Checking planetsAnalysisDataService.js imports...');
        
        const servicePath = join(__dirname, 'src/services/planetsAnalysisDataService.js');
        const serviceContent = await readFile(servicePath, 'utf8');
        
        // Check for corrected imports
        const hasCorrectRule2Import = serviceContent.includes('import rule2AnalysisService from \'./rule2AnalysisService.js\'');
        const hasCorrectRealTimeImport = serviceContent.includes('import { RealTimeRule2AnalysisService } from \'./realTimeRule2AnalysisService.js\'');
        const hasCorrectCleanSupabaseImport = serviceContent.includes('import { cleanSupabaseService } from \'./CleanSupabaseService.js\'');
        
        console.log(`✅ rule2AnalysisService import (default): ${hasCorrectRule2Import ? 'FIXED' : 'NEEDS FIX'}`);
        console.log(`✅ RealTimeRule2AnalysisService import (named): ${hasCorrectRealTimeImport ? 'CORRECT' : 'NEEDS FIX'}`);
        console.log(`✅ cleanSupabaseService import (named): ${hasCorrectCleanSupabaseImport ? 'CORRECT' : 'NEEDS FIX'}`);
        
        console.log('\n📄 Checking rule2AnalysisService.js imports...');
        
        const rule2ServicePath = join(__dirname, 'src/services/rule2AnalysisService.js');
        const rule2ServiceContent = await readFile(rule2ServicePath, 'utf8');
        
        // Check for corrected imports in rule2AnalysisService.js
        const hasCorrectCleanSupabaseImportInRule2 = rule2ServiceContent.includes('import cleanSupabaseService from \'./CleanSupabaseService.js\'');
        const hasCorrectAbcdBcdImport = rule2ServiceContent.includes('import { performAbcdBcdAnalysis } from \'../utils/abcdBcdAnalysis.js\'');
        
        console.log(`✅ cleanSupabaseService import (default): ${hasCorrectCleanSupabaseImportInRule2 ? 'FIXED' : 'NEEDS FIX'}`);
        console.log(`✅ performAbcdBcdAnalysis import: ${hasCorrectAbcdBcdImport ? 'FIXED' : 'NEEDS FIX'}`);
        
        const allFixed = hasCorrectRule2Import && 
                        hasCorrectRealTimeImport && 
                        hasCorrectCleanSupabaseImport && 
                        hasCorrectCleanSupabaseImportInRule2 && 
                        hasCorrectAbcdBcdImport;
        
        console.log('\n🎯 IMPORT FIX SUMMARY:');
        console.log('=====================');
        
        if (allFixed) {
            console.log('✅ ALL IMPORTS FIXED - No more "does not provide an export named" errors expected');
            console.log('\n🚀 Ready to test in browser:');
            console.log('   - Planets Analysis: http://localhost:5173/planets-analysis/planets-test-user-2025');
            console.log('   - Test Suite: http://localhost:5173/test-planets-dynamic-abcd-bcd.html');
        } else {
            console.log('❌ Some imports still need fixing');
        }
        
    } catch (error) {
        console.error('❌ Error testing imports:', error.message);
    }
}

testImportFixes();
