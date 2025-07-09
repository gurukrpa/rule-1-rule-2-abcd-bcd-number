import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { divisions, planets as houseGroups, getHouseGroupColor, getHouseTextStyle } from '../utils/constants';
import { updateHouseNumbers, calculateGroupCountsForDate } from '../utils/houseCalculations';
import ExcelUpload from './ExcelUpload';
import * as XLSX from 'xlsx'; // Add this import for Excel functionality
import ExcelJS from 'exceljs'; // Add this import for ExcelJS
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary component
import Logo from './Logo';

const astroPlanets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

// --- Add House Mapping ---
const houseToNumberMap = {
  Ar: 1, Ta: 2, Ge: 3, Cn: 4, Le: 5, Vi: 6,
  Li: 7, Sc: 8, Sg: 9, Cp: 10, Aq: 11, Pi: 12
};
// --- End House Mapping ---

const getGroupNameFromHouse = (house) => {
  if (!house) return null;
  // Corrected group definitions based on your rules:
  const arHouses = ['Ar', 'Cn', 'Li', 'Cp'];
  const taHouses = ['Ta', 'Le', 'Sc', 'Aq'];
  const geHouses = ['Ge', 'Vi', 'Sg', 'Pi']; // Pi is included here

  // Check against the corrected groups
  if (arHouses.includes(house)) return 'Ar';
  if (taHouses.includes(house)) return 'Ta';
  if (geHouses.includes(house)) return 'Ge'; // This now correctly includes Pi

  return null; // Return null if house doesn't match any group
};

// --- Add House Steps Calculation Function ---
const calculateHouseSteps = (house1, house2) => {
  if (!house1 || house1 === '-' || !house2 || house2 === '-') {
    return null; // Cannot calculate if either house is invalid
  }
  const num1 = houseToNumberMap[house1];
  const num2 = houseToNumberMap[house2];

  if (num1 === undefined || num2 === undefined) {
    return null; // Cannot calculate if house name is not in map
  }

  const diff = (num2 - num1 + 12) % 12;
  return diff + 1; // Add 1 for inclusive counting
};
// --- End House Steps Calculation Function ---

function DayDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [hrData, setHrData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [houseNumbers, setHouseNumbers] = useState({}); 
  const [excelData, setExcelData] = useState(null);
  const [dates, setDates] = useState([]);
  const [dayDetails, setDayDetails] = useState([]); 
  const [dayDateMap, setDayDateMap] = useState({}); 
  const [houseDifferences, setHouseDifferences] = useState({});
  const [excelFileName, setExcelFileName] = useState(''); // Add this missing state variable
  const [calculatedGroupCounts, setCalculatedGroupCounts] = useState({});
  const [planetGroupCounts, setPlanetGroupCounts] = useState({});
  const [sameNumberCounts, setSameNumberCounts] = useState({});
  const [sameGroupCounts, setSameGroupCounts] = useState({});
  const [countsCalculated, setCountsCalculated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, hr')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        setUser(userData);

        const { data: hrData, error: hrError } = await supabase
          .from('hr_data')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (hrError) throw hrError;

        setHrData(hrData);

        const uniqueDates = [...new Set(hrData
          .filter(item => item.date)
          .map(item => item.date)
        )].sort((a, b) => new Date(a) - new Date(b));

        const newDayDateMap = {};
        hrData.forEach(item => {
          if (item.topic && item.topic.startsWith('DAY-')) {
            const day = parseInt(item.topic.split('-')[1]);
            if (item.date) {
               newDayDateMap[day] = item.date;
            }
          }
        });

        setDates(uniqueDates);
        setDayDateMap(newDayDateMap); 
        if (uniqueDates.length > 0) {
           setSelectedDate(uniqueDates[uniqueDates.length - 1]);
        } else {
           setSelectedDate(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUser(null);
        setHrData([]);
        setDates([]);
        setSelectedDate(null);
        setDayDateMap({});
      }
    }

    if (userId) fetchData();
  }, [userId]);

  useEffect(() => {
    if (selectedDate) {
      fetchDayDetails(); 
    }
    else {
        setDayDetails([]); 
    }

    if (hrData.length > 0 && Object.keys(dayDateMap).length > 0) {
       try {
          const differences = updateHouseNumbers(hrData, dayDateMap);
          setHouseDifferences(differences);
       } catch (calcError) {
           console.error("Error calculating house differences:", calcError);
           setHouseDifferences({}); 
       }
    } else {
        setHouseDifferences({});
    }

    if (selectedDate && hrData.length > 0 && user?.hr) {
      try {
        const counts = calculateGroupCountsForDate(hrData, selectedDate, user.hr);
        setCalculatedGroupCounts(counts);
      } catch(countError) {
        console.error("Error calculating group counts:", countError);
        setCalculatedGroupCounts({}); 
      }
    } else {
      setCalculatedGroupCounts({});
    }

  }, [selectedDate, hrData, dayDateMap, user]); 

  // Function to calculate group counts for each planet column from Excel data
  useEffect(() => {
    if (excelData && Object.keys(excelData).length > 0) {
      const counts = {};
      astroPlanets.forEach(planet => {
        counts[planet] = { Ar: 0, Ta: 0, Ge: 0 };
        if (excelData[planet]) {
          divisions.forEach(division => {
            const house = excelData[planet][division];
            const group = getGroupNameFromHouse(house);
            if (group) {
              counts[planet][group]++;
            }
          });
        }
      });
      setPlanetGroupCounts(counts);
    } else {
      setPlanetGroupCounts({}); // Clear counts if no excelData
    }
  }, [excelData]); // Rerun when excelData changes

  // Function to calculate same numbers and groups PER HR vs planet columns
  const calculateSameNumbersAndGroups = () => {
    // console.log('Calculating with excelData (using calculated numbers logic):', JSON.stringify(excelData, null, 2)); // Optional: Keep or remove

    if (!excelData || !selectedDate || !user?.hr || !houseDifferences) {
      console.log('Calculation skipped: Missing excelData, selectedDate, user.hr, or houseDifferences');
      return;
    }

    const dayNumber = getDayNumberForDate(selectedDate);
    // console.log(`Starting calculation for date: ${selectedDate} (Day ${dayNumber}), HRs: ${user.hr}`); // Optional

    const finalSameNumberCounts = {};
    const finalSameGroupCounts = {};

    for (let hr = 1; hr <= user.hr; hr++) {
      const hrSameNumberCounts = {};
      const hrSameGroupCounts = {};
      astroPlanets.forEach(planet => {
        hrSameNumberCounts[planet] = 0;
        hrSameGroupCounts[planet] = 0;
      });

      divisions.forEach(division => {
        const userHouseString = getPlanetHouse(hr, division); // e.g., "Le"
        const userHouseName = userHouseString?.match(/^[A-Za-z]{2}/)?.[0]; // Extract house name like "Le"

        // --- Get User Number (Difference) --- 
        let userNumber = null;
        if (dayNumber !== null && dayNumber > 1) {
          const differenceKey = `${hr}_${division}_${dayNumber}`;
          const differenceValue = houseDifferences[differenceKey];
          // Ensure difference is a valid number before using it
          if (differenceValue !== null && differenceValue !== undefined && !isNaN(differenceValue)) {
             userNumber = parseInt(differenceValue, 10);
          }
        }
        // --- End Get User Number --- 

        astroPlanets.forEach(planet => {
          const planetHouseString = excelData?.[planet]?.[division]; // e.g., "Cn"
          const planetHouseName = planetHouseString?.match(/^[A-Za-z]{2}/)?.[0]; // Extract house name like "Cn"

          // --- Get Planet Number (Steps) --- 
          let planetNumber = null;
          if (userHouseName && planetHouseName) {
            const steps = calculateHouseSteps(userHouseName, planetHouseName);
            // Ensure steps is a valid number
            if (steps !== null && !isNaN(steps)) {
              planetNumber = steps;
            }
          }
          // --- End Get Planet Number --- 

          // --- Optional: Logging for debugging the calculated numbers --- 
          if (hr === 1 && planet === 'Su' && ['D-10', 'D-3', 'D-27'].includes(division)) {
            console.log(`DEBUG_CALC (HR-1, Su, ${division}): UserNum=${userNumber} (Diff), PlanetNum=${planetNumber} (Steps) (from UserHouse='${userHouseName}', PlanetHouse='${planetHouseName}')`);
          }
          // --- END Optional Logging --- 

          // Check for Same Numbers (using calculated numbers)
          // Compare only if both numbers are validly calculated
          if (userNumber !== null && planetNumber !== null && userNumber === planetNumber) {
            hrSameNumberCounts[planet]++;
            // --- Optional: Log when a number match occurs --- 
            if (hr === 1 && planet === 'Su' && ['D-10', 'D-3', 'D-27'].includes(division)) {
              console.log(`   -> FOUND SAME NUMBER MATCH (Calc) for HR-1, Su at Division=${division}`);
            }
          }

          // Check for Same Groups (logic remains the same)
          const userGroupName = userHouseName ? getGroupNameFromHouse(userHouseName) : null;
          const planetGroupName = planetHouseName ? getGroupNameFromHouse(planetHouseName) : null;

          if (userGroupName && planetGroupName && userGroupName === planetGroupName) {
            hrSameGroupCounts[planet]++;
          }
        });
      });

      finalSameNumberCounts[hr] = hrSameNumberCounts;
      finalSameGroupCounts[hr] = hrSameGroupCounts;
    }

    setSameNumberCounts(finalSameNumberCounts);
    setSameGroupCounts(finalSameGroupCounts);

    // console.log('Per-HR Same Numbers counts (Final - Calc Logic):', finalSameNumberCounts); // Optional
    // console.log('Per-HR Same Groups counts (Final):', finalSameGroupCounts); // Optional
  };

  // The useEffect calling this function
  useEffect(() => {
    if (excelData && hrData.length > 0 && selectedDate && user?.hr) {
      setCountsCalculated(false); // Reset flag before starting calculation
      calculateSameNumbersAndGroups();
    } else {
        setSameNumberCounts({});
        setSameGroupCounts({});
        setCountsCalculated(false); // Reset flag if conditions not met
    }
  }, [excelData, hrData, selectedDate, user?.hr]);

  // --- NEW useEffect to set countsCalculated flag --- 
  useEffect(() => {
    // Check if the count objects are populated (have HR keys)
    const hasNumberData = Object.keys(sameNumberCounts).length > 0;
    const hasGroupData = Object.keys(sameGroupCounts).length > 0;

    // Set the flag to true only if both count states have data
    if (hasNumberData && hasGroupData) {
      setCountsCalculated(true);
      console.log('Counts calculated and flag set to true.'); // <-- Log line 1
    } else {
       // Optional: Keep it false if data is cleared or calculation hasn't run
       // setCountsCalculated(false); 
       console.log('Count data not ready, flag remains false.'); // <-- Log line 2
    }
  }, [sameNumberCounts, sameGroupCounts]); // Dependencies: run when count states change

  const fetchDayDetails = async () => {
    if (!selectedDate) {
        setDayDetails([]);
        return;
    }
    try {
      const { data, error } = await supabase
        .from('DayDetails') 
        .select('*')
        .eq('user_id', userId)
        .eq('future_date', selectedDate);

      if (error) throw error;

      setDayDetails(data || []); 
    } catch (error) {
      console.error('Error fetching DayDetails:', error);
      setDayDetails([]); 
    }
  };

  const handleExcelUpload = (data, fileName) => {
    console.log('Received data from ExcelUpload component:', data);
    setExcelData(data);
    console.log('Excel data state AFTER setExcelData:', data);
    setExcelFileName(fileName); // Set the uploaded file name
  };

  const getPlanetHouse = (hr, topic) => {
    const entry = hrData.find(
      item =>
        item.hr_number === `HR-${hr}` && // Should match HR-1, HR-2, etc.
        item.topic === topic &&
        item.date === selectedDate
    );
    return entry?.planet_house || '-';
  };

  const getDayNumberForDate = (date) => {
    if (!date) return null;
    for (const [day, d] of Object.entries(dayDateMap)) {
        if (d === date) {
            return parseInt(day);
        }
    }
    return null;
  };

  // Function to get the house difference/count for display
  const getHouseDifferenceDisplay = (hr, topic) => {
    const dayNumber = getDayNumberForDate(selectedDate);
    // Ensure dayNumber is valid and not the first day (as difference is calculated *to* this day)
    if (dayNumber === null || dayNumber <= 1) {
        return ''; // No difference for the first day or if date mapping fails
    }
    // The key in houseDifferences is for the *current* day, representing the move *from* the previous day
    const differenceKey = `${hr}_${topic}_${dayNumber}`;
    const difference = houseDifferences[differenceKey];

    // Return the difference formatted in parentheses if it exists
    return (difference !== null && difference !== undefined) ? `(${difference})` : '';
  };

  const handleDownloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Day Details');
  
      // Add only the main Date row at the top
      const dateRow = worksheet.addRow(['Date:', selectedDate]);
      dateRow.font = { bold: true };
      worksheet.addRow([]); // Blank row after date
  
      // --- Data Rows per HR --- 
      for (let hr = 1; hr <= user.hr; hr++) {
        // Add HR Header Row (Merged)
        const hrHeaderRow = worksheet.addRow([`HR-${hr}`]);
        hrHeaderRow.font = { bold: true, size: 14 };
        hrHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }; // Light grey fill
        let totalColumns = 0; 

        // Add Planet Header Row for this HR
        const planetHeaderRowValues = ['Topic', 'House (Count)', ...astroPlanets];
        const planetHeaderRow = worksheet.addRow(planetHeaderRowValues);
        planetHeaderRow.font = { bold: true };
        planetHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } }; // Medium grey fill
        totalColumns = planetHeaderRowValues.length; // Store the number of columns

        // Merge the HR Header row
        if (totalColumns > 0) {
           worksheet.mergeCells(hrHeaderRow.getCell(1).address, hrHeaderRow.getCell(totalColumns).address); 
           hrHeaderRow.getCell(1).alignment = { horizontal: 'center' };
        }

        // Division Rows
        divisions.forEach(division => {
          const rowData = [];
          const planetHouse = getPlanetHouse(hr, division);
          const houseDiffDisplay = getHouseDifferenceDisplay(hr, division);
          const userHouseName = planetHouse?.match(/^[A-Za-z]{2}/)?.[0];
          
          // --- MODIFIED: Prepend HR number to the division --- 
          rowData.push(`HR-${hr} ${division}`); // Topic (e.g., "HR-1 D-1")
          // --- END MODIFICATION ---
          
          rowData.push(`${planetHouse} ${houseDiffDisplay}`.trim()); // House (Count)
  
          astroPlanets.forEach(planet => {
            const excelHouseString = excelData?.[planet]?.[division] || '-';
            const planetHouseName = excelHouseString?.match(/^[A-Za-z]{2}/)?.[0];
            const steps = calculateHouseSteps(userHouseName, planetHouseName);
            rowData.push(`${excelHouseString} ${steps !== null ? `(${steps})` : ''}`.trim());
          });
  
          worksheet.addRow(rowData);
        });

        // Add Summary Rows for this HR (Existing Logic)
        if (countsCalculated) { 
          // Group Ar/Ta/Ge Rows
          ['Ar', 'Ta', 'Ge'].forEach(groupName => {
            const groupRowData = [`Group ${groupName}`, '-']; 
            const groupColor = getHouseGroupColor(groupName); 
            
            astroPlanets.forEach(planet => {
              const count = planetGroupCounts[planet]?.[groupName] || 0;
              groupRowData.push(count);
            });
            const addedRow = worksheet.addRow(groupRowData);
            addedRow.font = { bold: true };
            let fillColor = 'FFFFFFFF'; 
            if (groupColor.includes('#DCEDC1')) fillColor = 'FFDCEDC1'; 
            else if (groupColor.includes('#FFD3B6')) fillColor = 'FFFFD3B6'; 
            else if (groupColor.includes('#FFAAA5')) fillColor = 'FFFFAAA5'; 
            addedRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
            addedRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }; 
          });

          // Same Numbers Row
          const sameNumRowData = ['Same Numbers', '-'];
          astroPlanets.forEach(planet => {
            const count = sameNumberCounts[hr]?.[planet] || 0;
            sameNumRowData.push(count);
          });
          const sameNumRow = worksheet.addRow(sameNumRowData);
          sameNumRow.font = { bold: true };
          sameNumRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }; 
          sameNumRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

          // Same Groups Row
          const sameGroupRowData = ['Same Groups', '-'];
          astroPlanets.forEach(planet => {
            const count = sameGroupCounts[hr]?.[planet] || 0;
            sameGroupRowData.push(count);
          });
          const sameGroupRow = worksheet.addRow(sameGroupRowData);
          sameGroupRow.font = { bold: true };
          sameGroupRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }; 
          sameGroupRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        }
  
        worksheet.addRow([]); // Add a blank line between HRs
      }
  
      // --- Adjust Styling Logic --- 
      worksheet.eachRow((row, rowNumber) => {
          // Identify data rows by checking if the first cell starts with "HR-" followed by a division
          const firstCellValue = row.getCell(1).value?.toString() || '';
          if (firstCellValue.match(/^HR-\d+ D-\d+/)) { 
              row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                  if (colNumber >= 2) { // Start coloring from 'House (Count)' column onwards
                      const val = cell.value?.toString() || '';
                      const houseMatch = val.match(/^[A-Za-z]{2}/)?.[0]; 
                      if (houseMatch) {
                          const colorClass = getHouseGroupColor(houseMatch);
                          let fillColor = 'FFFFFFFF'; 
                          if (colorClass.includes('#DCEDC1')) fillColor = 'FFDCEDC1'; 
                          else if (colorClass.includes('#FFD3B6')) fillColor = 'FFFFD3B6'; 
                          else if (colorClass.includes('#FFAAA5')) fillColor = 'FFFFAAA5'; 
                          
                          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
                      }
                  }
              });
          }
      });

      // Auto-fit columns 
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          let cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2; 
      });
  
      // --- Export File --- 
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const datePart = excelFileName?.match(/\d{1,2}-\d{1,2}-\d{2}/)?.[0] || selectedDate || 'no_date';
      link.download = `${user?.username || 'User'}_DayDetails_${datePart}.xlsx`;
      link.click();

    } catch (err) {
      console.error('Excel download failed:', err);
    }
  };

  if (!userId) {
      return <div className="p-4 text-center text-red-500">User ID not found in URL.</div>;
  }
  if (!user) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Loading User Data...</h2>
      </div>
    );
  }

  if (dates.length === 0) {
      return (
          <div className="min-h-screen bg-gray-100 p-4">
               <div className="max-w-full mx-auto">
                   <div className="flex justify-between items-center mb-4">
                      <h1 className="text-2xl font-bold">{user.username}</h1>
                       <button
                           onClick={() => navigate('/')}
                           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                       >
                           Back
                       </button>
                   </div>
                  <p className="text-center text-gray-600 mt-10">No date entries found for this user.</p>
               </div>
           </div>
      );
  }

  if (!selectedDate) {
    return <div className="p-4 text-center text-yellow-600">Please select a date.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-full mx-auto overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex items-center space-x-4">              <Logo size="medium" showText={false} pageTitle="Day Details" />
            <h1 className="text-2xl font-bold">
              {user.username} - Selected Date: {selectedDate}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <ExcelUpload
               onDataUploaded={(data, fileName) => handleExcelUpload(data, fileName)}
               icon="⬆️"
             />
             {excelFileName ? (
               <div className="file-name-display">
                 <span>{excelFileName}</span>
               </div>
             ) : null}
             <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">Select Date:</label>
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {dates.map((date, index) => (
                    <option key={index} value={date}>
                        {date}
                    </option>
                    ))}
                </select>
             </div>
              <button
                onClick={handleDownloadExcel}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
              >
                Download Excel
              </button>
              <button
                onClick={() => navigate(`/abcd-number/${userId}`)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
              >
                ABCD Number
              </button>
              <button
                onClick={() => navigate('/number-gen')}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
              >
                Number Gen
              </button>
              <button
                onClick={() => navigate(`/user-data/${userId}`)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
             >
                Back
             </button>
          </div>
        </div>

        {dayDetails.length > 0 && (
          <div className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Predictions for {selectedDate}</h2>
            <table className="w-full border-collapse bg-gray-100 text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-gray-700 bg-gray-200 border">HR Number</th>
                  <th className="p-2 text-left font-medium text-gray-700 bg-gray-200 border">Division</th>
                  <th className="p-2 text-left font-medium text-gray-700 bg-gray-200 border">Predicted House</th>
                </tr>
              </thead>
              <tbody>
                {dayDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className="p-2 text-gray-800 border">{detail.hr_number}</td>
                    <td className="p-2 text-gray-800 border">{detail.division}</td>
                    <td className="p-2 text-gray-800 border">{detail.predicted_house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- This is the main loop rendering HR tables --- */}
        {Array.from({ length: user.hr }, (_, i) => i + 1).map(hr => (
          <div key={hr} className="mb-8 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-4">HR-{hr}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-gray-100 text-sm mb-4">
                <thead>
                  {/* --- UPDATED Header Row --- */}
                  <tr>
                    <th className="p-2 text-left font-medium text-gray-700 bg-gray-200 border sticky left-0 z-20">Division</th>
                    <th className="p-2 text-left font-medium text-gray-700 bg-gray-200 border">House (Count)</th>
                    {/* Map over astroPlanets to create header cells */} 
                    {astroPlanets.map(planet => (
                      <th key={planet} className="p-2 text-center font-medium text-gray-700 bg-gray-200 border">
                        {planet}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* --- Rows for divisions --- */}
                  {divisions.map(division => {
                    const planetHouse = getPlanetHouse(hr, division);
                    const houseDifferenceDisplay = getHouseDifferenceDisplay(hr, division);
                    return (
                      <tr key={division}>
                        <td className="p-2 text-gray-800 border sticky left-0 z-10 bg-white">{division}</td>
                        <td className={`p-2 text-sm border ${getHouseGroupColor(planetHouse)} ${getHouseTextStyle(planetHouse)}`}>
                          <div>{planetHouse} {houseDifferenceDisplay}</div>
                        </td>
                        {astroPlanets.map(planet => {
                          const excelHouse = excelData?.[planet]?.[division] || '-';
                          const houseColor = excelHouse !== '-' ? getHouseGroupColor(excelHouse) : '';
                          const houseStyle = excelHouse !== '-' ? getHouseTextStyle(excelHouse) : '';
                          const steps = calculateHouseSteps(planetHouse, excelHouse);
                          const stepsDisplay = steps !== null ? `(${steps})` : '';
                          return (
                            <td key={planet} className={`p-2 text-center border ${houseColor} ${houseStyle}`}>
                              {excelHouse} {stepsDisplay}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* --- END Rows for divisions --- */}

                  {/* === Conditional rendering block for calculated rows === */}
                  {countsCalculated && (
                    <>
                      {/* --- Rows for Planet Group Counts (Ar, Ta, Ge) using getHouseGroupColor --- */}
                      {['Ar', 'Ta', 'Ge'].map(groupName => {
                        // Get the background color class using the imported function
                        // Pass a representative house name (like the group name itself) 
                        const bgColorClass = getHouseGroupColor(groupName); // Use the function

                        return (
                          <tr key={groupName} className={`${bgColorClass} font-medium`}>
                            {/* Apply color class to sticky cell as well */}
                            <td className={`p-2 text-left border sticky left-0 z-10 ${bgColorClass}`}>
                              Group {groupName}
                            </td>
                            <td className="p-2 text-left border">-</td> {/* Placeholder */}
                            {astroPlanets.map(planet => {
                              const count = planetGroupCounts[planet]?.[groupName] || 0;
                              return (
                                <td key={`${planet}-${groupName}`} className="p-2 text-center border">
                                  {count}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {/* --- END Group Count Rows --- */}

                      {/* Row for Same Numbers */}
                      <tr className="bg-gray-200 font-medium">
                        <td className="p-2 text-left border sticky left-0 z-10 bg-gray-200">Same Numbers</td>
                        <td className="p-2 text-left border">-</td>
                        {astroPlanets.map(planet => {
                          const count = sameNumberCounts[hr]?.[planet] || 0;
                          return (
                            <td key={planet} className="p-2 text-center border">
                              {count}
                            </td>
                          );
                        })}
                      </tr>
                      {/* Row for Same Groups */}
                      <tr className="bg-gray-200 font-medium">
                        <td className="p-2 text-left border sticky left-0 z-10 bg-gray-200">Same Groups</td>
                        <td className="p-2 text-left border">-</td>
                        {astroPlanets.map(planet => {
                          const count = sameGroupCounts[hr]?.[planet] || 0;
                          return (
                            <td key={planet} className="p-2 text-center border">
                              {count}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                  {/* === END Conditional rendering block === */} 
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {/* --- End of main loop --- */}
      </div>
    </div>
  );
}

export default DayDetails;