#!/usr/bin/env node

/**
 * Excel File Analysis Script
 * Analyzes the real Excel file structure to understand planet detection issues
 */

import XLSX from 'xlsx';
import fs from 'fs';

const excelFilePath = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/viboothi: Vishnu upload excel/april-2025/3-4-2025.xlsx';

console.log('🔍 ANALYZING REAL EXCEL FILE');
console.log('=' .repeat(60));
console.log(`📁 File: ${excelFilePath}`);

try {
    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
        console.log('❌ File not found at specified path');
        console.log('📋 Please check the file path and try again');
        process.exit(1);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    console.log(`\n📊 EXCEL FILE STRUCTURE:`);
    console.log(`✅ Sheet name: ${sheetName}`);
    console.log(`✅ Range: ${worksheet['!ref']}`);
    console.log(`✅ Rows: ${range.e.r + 1}, Columns: ${range.e.c + 1}`);

    // Analyze Column A (Planet names)
    console.log(`\n🌍 COLUMN A ANALYSIS (Planet Names):`);
    console.log('-'.repeat(40));
    
    const planetsFound = [];
    const allCellsInColumnA = [];
    
    for (let row = 0; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
            const cellValue = cell.v.toString().trim();
            allCellsInColumnA.push({
                row: row + 1, // 1-based row number
                value: cellValue
            });
            
            // Check if this looks like a planet name
            const commonPlanets = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Kethu'];
            const isLikelyPlanet = commonPlanets.some(planet => 
                cellValue.toLowerCase().includes(planet.toLowerCase())
            );
            
            if (isLikelyPlanet) {
                planetsFound.push({
                    row: row + 1,
                    originalName: cellValue,
                    detectedAs: commonPlanets.find(planet => 
                        cellValue.toLowerCase().includes(planet.toLowerCase())
                    )
                });
            }
        }
    }

    console.log(`📋 All cells in Column A:`);
    allCellsInColumnA.forEach(cell => {
        console.log(`   Row ${cell.row}: "${cell.value}"`);
    });

    console.log(`\n🌟 DETECTED PLANETS:`);
    console.log(`✅ Found ${planetsFound.length} planets:`);
    planetsFound.forEach(planet => {
        console.log(`   Row ${planet.row}: "${planet.originalName}" → ${planet.detectedAs}`);
    });

    // Specific Ketu analysis
    console.log(`\n🎯 KETU SPECIFIC ANALYSIS:`);
    const ketuVariations = ['Ketu', 'Kethu', 'KETU', 'KETHU', 'ketu', 'kethu'];
    const ketuCells = allCellsInColumnA.filter(cell => 
        ketuVariations.some(variation => 
            cell.value.toLowerCase().includes(variation.toLowerCase())
        )
    );
    
    if (ketuCells.length > 0) {
        console.log(`✅ KETU FOUND!`);
        ketuCells.forEach(cell => {
            console.log(`   Row ${cell.row}: "${cell.value}"`);
        });
    } else {
        console.log(`❌ KETU NOT FOUND in Column A`);
        console.log(`❌ Searched for: ${ketuVariations.join(', ')}`);
    }

    // Analyze division headers (Row 1)
    console.log(`\n📋 DIVISION HEADERS ANALYSIS (Row 1):`);
    console.log('-'.repeat(40));
    
    const headers = [];
    for (let col = 1; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v) {
            headers.push({
                column: String.fromCharCode(65 + col), // Convert to A, B, C...
                value: cell.v.toString().trim()
            });
        }
    }

    console.log(`✅ Found ${headers.length} headers:`);
    headers.slice(0, 10).forEach(header => { // Show first 10
        console.log(`   Column ${header.column}: "${header.value}"`);
    });
    if (headers.length > 10) {
        console.log(`   ... and ${headers.length - 10} more`);
    }

    // Sample data analysis
    console.log(`\n📊 SAMPLE DATA ANALYSIS:`);
    console.log('-'.repeat(40));
    
    if (planetsFound.length > 0) {
        const firstPlanet = planetsFound[0];
        console.log(`🔍 Analyzing data for "${firstPlanet.originalName}" (Row ${firstPlanet.row}):`);
        
        const sampleData = [];
        for (let col = 1; col <= Math.min(10, range.e.c); col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: firstPlanet.row - 1, c: col });
            const cell = worksheet[cellAddress];
            
            if (cell && cell.v) {
                sampleData.push({
                    column: String.fromCharCode(65 + col),
                    value: cell.v.toString().trim()
                });
            }
        }
        
        console.log(`   Sample data (first 10 columns):`);
        sampleData.forEach(data => {
            console.log(`     Column ${data.column}: "${data.value}"`);
        });
    }

    // Generate validation rules
    console.log(`\n🔧 RECOMMENDED VALIDATION RULES:`);
    console.log('-'.repeat(40));
    
    console.log(`✅ Expected planets in Column A (based on analysis):`);
    const expectedPlanets = [...new Set(planetsFound.map(p => p.detectedAs))];
    console.log(`   ${expectedPlanets.join(', ')}`);
    
    console.log(`✅ Planet rows should be: ${planetsFound.map(p => p.row).join(', ')}`);
    console.log(`✅ Division columns: ${headers.length} divisions found`);
    console.log(`✅ Expected data cells: ${planetsFound.length} planets × ${headers.length} divisions = ${planetsFound.length * headers.length}`);

    // Generate ExcelUpload.jsx fix
    console.log(`\n🛠️ EXCELUPLOAD.JSX FIX NEEDED:`);
    console.log('-'.repeat(40));
    
    console.log(`// Current planet mapping needs to include these exact names:`);
    planetsFound.forEach(planet => {
        console.log(`'${planet.originalName}': 'XX', // Maps to ${planet.detectedAs}`);
    });

} catch (error) {
    console.error('❌ Error analyzing Excel file:', error.message);
    console.log('\n🔍 TROUBLESHOOTING:');
    console.log('1. Verify the file path is correct');
    console.log('2. Ensure the file is not open in Excel');
    console.log('3. Check file permissions');
}
