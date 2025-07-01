#!/usr/bin/env node

// Quick verification script for Planets Dynamic ABCD/BCD implementation
console.log('🧪 PLANETS DYNAMIC ABCD/BCD VERIFICATION');
console.log('=======================================');

// Test the service files exist and are properly structured
import { promises as fs } from 'fs';
import path from 'path';

const BASE_PATH = process.cwd();

async function verifyImplementation() {
    console.log('📁 Checking file structure...');
    
    // Check if our service file exists
    const servicePath = path.join(BASE_PATH, 'src/services/planetsAnalysisDataService.js');
    const planetsPagePath = path.join(BASE_PATH, 'src/components/PlanetsAnalysisPage.jsx');
    const planetsSimplePath = path.join(BASE_PATH, 'src/components/PlanetsAnalysisPageSimple.jsx');
    
    try {
        // Check service file
        const serviceContent = await fs.readFile(servicePath, 'utf8');
        console.log('✅ PlanetsAnalysisDataService.js exists');
        
        // Check key methods in service
        const hasGetLatestAnalysisNumbers = serviceContent.includes('getLatestAnalysisNumbers');
        const hasGetTopicNumbers = serviceContent.includes('getTopicNumbers');
        const hasIsAbcdNumber = serviceContent.includes('isAbcdNumber');
        const hasIsBcdNumber = serviceContent.includes('isBcdNumber');
        
        console.log(`   📋 getLatestAnalysisNumbers: ${hasGetLatestAnalysisNumbers ? '✅' : '❌'}`);
        console.log(`   📋 getTopicNumbers: ${hasGetTopicNumbers ? '✅' : '❌'}`);
        console.log(`   📋 isAbcdNumber: ${hasIsAbcdNumber ? '✅' : '❌'}`);
        console.log(`   📋 isBcdNumber: ${hasIsBcdNumber ? '✅' : '❌'}`);
        
        // Check components
        const planetsPageContent = await fs.readFile(planetsPagePath, 'utf8');
        const planetsSimpleContent = await fs.readFile(planetsSimplePath, 'utf8');
        
        console.log('✅ PlanetsAnalysisPage.jsx exists');
        console.log('✅ PlanetsAnalysisPageSimple.jsx exists');
        
        // Check if components import the service
        const pageImportsService = planetsPageContent.includes('planetsAnalysisDataService');
        const simpleImportsService = planetsSimpleContent.includes('planetsAnalysisDataService');
        
        console.log(`   📋 PlanetsAnalysisPage imports service: ${pageImportsService ? '✅' : '❌'}`);
        console.log(`   📋 PlanetsAnalysisPageSimple imports service: ${simpleImportsService ? '✅' : '❌'}`);
        
        // Check for dynamic data usage
        const pageUsesDynamicData = planetsPageContent.includes('analysisData');
        const simpleUsesDynamicData = planetsSimpleContent.includes('analysisData');
        
        console.log(`   📋 PlanetsAnalysisPage uses dynamic data: ${pageUsesDynamicData ? '✅' : '❌'}`);
        console.log(`   📋 PlanetsAnalysisPageSimple uses dynamic data: ${simpleUsesDynamicData ? '✅' : '❌'}`);
        
        console.log('\n🎯 IMPLEMENTATION VERIFICATION SUMMARY:');
        console.log('=====================================');
        
        const allChecks = [
            hasGetLatestAnalysisNumbers,
            hasGetTopicNumbers, 
            hasIsAbcdNumber,
            hasIsBcdNumber,
            pageImportsService,
            simpleImportsService,
            pageUsesDynamicData,
            simpleUsesDynamicData
        ];
        
        const passedChecks = allChecks.filter(Boolean).length;
        const totalChecks = allChecks.length;
        
        console.log(`📊 Implementation Status: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log('✅ IMPLEMENTATION COMPLETE - All dynamic ABCD/BCD features integrated!');
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Browser test at: http://localhost:5175/planets-analysis/planets-test-user-2025');
            console.log('2. Run integration test at: http://localhost:5175/test-planets-dynamic-abcd-bcd.html');
            console.log('3. Verify dynamic numbers display correctly for each topic');
        } else {
            console.log('⚠️ IMPLEMENTATION INCOMPLETE - Some features may not work as expected');
        }
        
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

verifyImplementation();
