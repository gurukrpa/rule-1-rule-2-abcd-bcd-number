import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Get current date in a readable format
 */
const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

/**
 * Get current date for filename (YYYY-MM-DD format)
 */
const getDateForFilename = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

/**
 * Convert custom date to filename format
 */
const formatCustomDateForFilename = (customDate) => {
  // If custom date is empty or invalid, use current date
  if (!customDate || customDate.trim() === '') {
    return getDateForFilename();
  }
  
  // Try to parse the custom date and format it for filename
  try {
    const date = new Date(customDate);
    if (isNaN(date.getTime())) {
      // If invalid date, use current date
      return getDateForFilename();
    }
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    // If parsing fails, use current date
    return getDateForFilename();
  }
};

/**
 * Generate alphanumeric label following the pattern:
 * A1-A50, B1-B50, ..., Z1-Z50 (1,300 labels)
 * Then AA1-AA50, AB1-AB50, ..., ZZ1-ZZ50 (33,800 more labels)
 * Then AAA1-AAA50, AAB1-AAB50, etc.
 */
const generateAlphanumericLabel = (index) => {
  const numberPart = (index % 50) + 1; // 1-50 for each letter group
  const letterGroupIndex = Math.floor(index / 50); // Which letter group we're in
  
  // Generate letter part based on letterGroupIndex
  let letterPart = '';
  let remaining = letterGroupIndex;
  
  if (remaining < 26) {
    // Single letter: A-Z (0-25)
    letterPart = String.fromCharCode(65 + remaining);
  } else if (remaining < 26 + (26 * 26)) {
    // Double letter: AA-ZZ (26-701)
    remaining -= 26;
    const firstLetter = Math.floor(remaining / 26);
    const secondLetter = remaining % 26;
    letterPart = String.fromCharCode(65 + firstLetter) + String.fromCharCode(65 + secondLetter);
  } else {
    // Triple letter: AAA-ZZZ (702+)
    remaining -= 26 + (26 * 26);
    const firstLetter = Math.floor(remaining / (26 * 26));
    const secondLetter = Math.floor((remaining % (26 * 26)) / 26);
    const thirdLetter = remaining % 26;
    letterPart = String.fromCharCode(65 + firstLetter) + 
                 String.fromCharCode(65 + secondLetter) + 
                 String.fromCharCode(65 + thirdLetter);
  }
  
  return `${letterPart}${numberPart}`;
};

/**
 * Prepare data for export (Planet columns only, no Label)
 */
const prepareExportData = (combinations) => {
  if (!combinations || combinations.length === 0) return [];
  
  const planetHeaders = combinations[0].planets || [];
  
  return combinations.map((combination, index) => {
    const row = {};
    
    // Add planet columns with their values, using A1, A2, A3... format as headers
    planetHeaders.forEach((planet, planetIndex) => {
      const planetLabel = generateAlphanumericLabel(planetIndex);
      row[planetLabel] = combination.numbers[planetIndex];
    });
    
    return row;
  });
};

/**
 * Export to Excel using ExcelJS for better formatting
 */
export const exportToExcel = (combinations, filename = 'planet-combinations', customDate = '') => {
  try {
    const data = prepareExportData(combinations);
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Use custom date if provided, otherwise use current date
    const displayDate = customDate.trim() !== '' ? customDate : getCurrentDate();
    const dateForFile = formatCustomDateForFilename(customDate);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Total Lines: ${data.length} - ${displayDate}`);
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Add headers with styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Light alternating colors for rows
    const lightColors = [
      'F8F9FA', // Very light gray
      'E3F2FD', // Very light blue  
      'E8F5E8', // Very light green
      'FFF3E0', // Very light orange
      'F3E5F5', // Very light purple
      'E0F2F1'  // Very light teal
    ];
    
    // Add data rows with alternating light colors
    data.forEach((row, index) => {
      const dataRow = worksheet.addRow(Object.values(row));
      const colorIndex = index % lightColors.length;
      
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Apply light alternating colors
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: lightColors[colorIndex] }
        };
      });
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.max(maxLength + 2, 10);
    });
    
    // Generate buffer and download using .then() for better compatibility
    workbook.xlsx.writeBuffer()
      .then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${dateForFile}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error generating Excel file:', error);
        alert('Error generating Excel file. Please try again.');
      });
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};

/**
 * Simple PDF export fallback without autoTable
 */
const exportToPDFSimple = (combinations, filename = 'planet-combinations', customDate = '') => {
  try {
    console.log('Starting simple PDF export...');
    const data = prepareExportData(combinations);
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Use custom date if provided, otherwise use current date
    const displayDate = customDate.trim() !== '' ? customDate : getCurrentDate();
    const dateForFile = formatCustomDateForFilename(customDate);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    console.log('Simple PDF document created');
    
    // Add title (bigger and bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Lines: ${data.length} - ${displayDate}`, 10, 15);
    
    // Add simple text-based table
    const headers = Object.keys(data[0]);
    let yPosition = 25; // Start higher
    
    // Calculate column width dynamically
    const numColumns = headers.length;
    const availableWidth = 180; // A4 width minus margins
    const columnWidth = Math.max(12, availableWidth / numColumns);
    
    // Add headers (optimized font size)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let xPosition = 15;
    headers.forEach(header => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidth;
    });
    
    yPosition += 8; // Adequate spacing
    
    // Add data rows with alternating background colors
    doc.setFontSize(8); // Smaller font for more columns
    doc.setFont('helvetica', 'bold');
    data.forEach((row, index) => {
      const isEvenRow = index % 2 === 0;
      
      // Add light blue background for odd rows
      if (!isEvenRow) {
        doc.setFillColor(227, 242, 253); // Light blue (RGB: 227, 242, 253)
        doc.rect(10, yPosition - 5, 190, 6, 'F'); // Background rectangle
      }
      
      xPosition = 15;
      Object.values(row).forEach((value, colIndex) => {
        doc.text(String(value), xPosition, yPosition);
        xPosition += columnWidth;
      });
      yPosition += 6; // Tighter row spacing for more data
      
      // Add new page if needed (use most of the page)
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 15;
      }
    });
    
    doc.save(`${filename}-${dateForFile}.pdf`);
    console.log('Simple PDF exported successfully');
    
  } catch (error) {
    console.error('Simple PDF export error:', error);
    throw error;
  }
};

/**
 * Export to PDF using jsPDF with autoTable
 */
export const exportToPDF = (combinations, filename = 'planet-combinations', customDate = '') => {
  try {
    console.log('Starting PDF export...', { combinations: combinations?.length, filename });
    
    const data = prepareExportData(combinations);
    console.log('Prepared data for PDF:', { dataLength: data.length, firstRow: data[0] });
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Use custom date if provided, otherwise use current date
    const displayDate = customDate.trim() !== '' ? customDate : getCurrentDate();
    const dateForFile = formatCustomDateForFilename(customDate);

    console.log('Creating jsPDF document...');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    console.log('jsPDF document created successfully');
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Lines: ${data.length} - ${displayDate}`, 20, 20);
    
    // Get headers and data for table
    const headers = Object.keys(data[0]);
    const rows = data.map(row => Object.values(row));
    
    // Light colors for alternating rows (RGB values)
    const lightColors = [
      [248, 249, 250], // Very light gray
      [227, 242, 253], // Very light blue  
      [232, 245, 232], // Very light green
      [255, 243, 224], // Very light orange
      [243, 229, 245], // Very light purple
      [224, 242, 241]  // Very light teal
    ];
    
    console.log('Table data prepared:', { headers, rowCount: rows.length });
    
    // Try autoTable first, fallback to simple if it fails
    try {
      console.log('Checking for autoTable function...');
      if (typeof doc.autoTable === 'function') {
        console.log('Using autoTable for PDF generation...');
        
        // Calculate optimal column width based on number of columns
        const numColumns = headers.length;
        const availableWidth = 180; // A4 width minus margins (210 - 30)
        const columnWidth = Math.max(12, availableWidth / numColumns); // Minimum 12mm per column
        
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 25,
          theme: 'grid',
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 10, // Smaller font for more columns
            cellPadding: 2
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 8, // Smaller font for data to fit more
            fontStyle: 'bold',
            cellPadding: 1.5
          },
          // Custom row styling with alternating light colors
          didParseCell: (data) => {
            if (data.section === 'body') {
              const colorIndex = data.row.index % lightColors.length;
              data.cell.styles.fillColor = lightColors[colorIndex];
            }
          },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.1,
          margin: { top: 25, right: 15, bottom: 10, left: 15 },
          // Dynamic column styles based on actual number of columns
          columnStyles: headers.reduce((styles, header, index) => {
            styles[index] = { cellWidth: columnWidth, minCellWidth: 8 };
            return styles;
          }, {}),
          styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap',
            minCellHeight: 5,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            fontSize: 8
          },
          // Force all content on one page by adjusting page break
          pageBreak: 'avoid',
          tableWidth: 'auto',
          showHead: 'everyPage'
        });
        console.log('AutoTable PDF created successfully');
      } else {
        console.log('AutoTable not available, using simple PDF');
        return exportToPDFSimple(combinations, filename);
      }
    } catch (autoTableError) {
      console.log('AutoTable failed, falling back to simple PDF:', autoTableError);
      return exportToPDFSimple(combinations, filename);
    }
    
    // Save the PDF
    console.log('Saving PDF...');
    doc.save(`${filename}-${dateForFile}.pdf`);
    console.log('PDF saved successfully');
    
  } catch (error) {
    console.error('Detailed PDF export error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try simple fallback as last resort
    try {
      console.log('Attempting simple PDF fallback...');
      return exportToPDFSimple(combinations, filename);
    } catch (fallbackError) {
      console.error('Fallback PDF also failed:', fallbackError);
      alert(`PDF export failed completely. Error: ${error.message}`);
    }
  }
};
