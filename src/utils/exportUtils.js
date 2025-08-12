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
 * Generate alphanumeric label (A1-A50, B1-B50, C1-C50, etc.)
 */
const generateAlphanumericLabel = (index) => {
  const letterIndex = Math.floor(index / 50);
  const numberIndex = (index % 50) + 1;
  const letter = String.fromCharCode(65 + letterIndex); // A, B, C, etc.
  return `${letter}${numberIndex}`;
};

/**
 * Prepare data for export (Label + Planet columns only)
 */
const prepareExportData = (combinations) => {
  if (!combinations || combinations.length === 0) return [];
  
  const planetHeaders = combinations[0].planets || [];
  
  return combinations.map((combination, index) => {
    const row = {
      Label: generateAlphanumericLabel(index)
    };
    
    // Add planet columns with their values
    planetHeaders.forEach((planet, planetIndex) => {
      row[planet] = combination.numbers[planetIndex];
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
    
    // Add data rows with alternating colors
    data.forEach((row, index) => {
      const dataRow = worksheet.addRow(Object.values(row));
      const isEvenRow = index % 2 === 0;
      
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Add alternating row colors (zebra striping)
        if (!isEvenRow) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E3F2FD' } // Light blue for odd rows
          };
        }
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
    
    // Generate buffer and download
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${dateForFile}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
    
    // Add headers (bigger and bold)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    let xPosition = 10;
    const columnWidth = Math.min(20, 180 / headers.length); // Tighter column width
    headers.forEach(header => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidth;
    });
    
    yPosition += 8; // Adequate spacing for bigger font
    
    // Add data rows with alternating background colors (bigger and bold)
    doc.setFontSize(10); // Bigger data font
    doc.setFont('helvetica', 'bold'); // Make data bold
    data.forEach((row, index) => {
      const isEvenRow = index % 2 === 0;
      
      // Add light blue background for odd rows
      if (!isEvenRow) {
        doc.setFillColor(227, 242, 253); // Light blue (RGB: 227, 242, 253)
        doc.rect(5, yPosition - 5, 190, 7, 'F'); // Larger background rectangle for bigger text
      }
      
      xPosition = 10;
      Object.values(row).forEach((value, colIndex) => {
        doc.text(String(value), xPosition, yPosition);
        xPosition += columnWidth;
      });
      yPosition += 7; // Adequate row spacing for bigger font
      
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
    
    console.log('Table data prepared:', { headers, rowCount: rows.length });
    
    // Try autoTable first, fallback to simple if it fails
    try {
      console.log('Checking for autoTable function...');
      if (typeof doc.autoTable === 'function') {
        console.log('Using autoTable for PDF generation...');
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 25, // Reduced from 30 to start higher
          theme: 'grid',
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 12, // Bigger header font
            cellPadding: 3 // Slightly more padding for bigger text
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 10, // Bigger body font
            fontStyle: 'bold', // Make body text bold
            cellPadding: 2 // Adequate padding for bigger text
          },
          alternateRowStyles: {
            fillColor: [227, 242, 253] // Light blue RGB values
          },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.1,
          margin: { top: 25, right: 10, bottom: 10, left: 10 }, // Balanced margins
          columnStyles: {
            // Make columns narrower and closer together
            0: { cellWidth: 'auto', minCellWidth: 15 }, // Label column
            1: { cellWidth: 'auto', minCellWidth: 20 }, // Planet columns
            2: { cellWidth: 'auto', minCellWidth: 20 },
            3: { cellWidth: 'auto', minCellWidth: 20 },
            4: { cellWidth: 'auto', minCellWidth: 20 },
            5: { cellWidth: 'auto', minCellWidth: 20 },
            6: { cellWidth: 'auto', minCellWidth: 20 },
            7: { cellWidth: 'auto', minCellWidth: 20 },
            8: { cellWidth: 'auto', minCellWidth: 20 },
            9: { cellWidth: 'auto', minCellWidth: 20 }
          },
          styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap', // Wrap content for tighter columns
            minCellHeight: 6, // Minimum row height for bigger font
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          }
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
