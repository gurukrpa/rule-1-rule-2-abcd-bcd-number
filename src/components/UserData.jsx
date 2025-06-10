import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase, startTraining, getPrediction } from '../supabaseClient';
import { houses, planets, divisions, getHouseGroupColor } from '../utils/constants';
import { updateHouseNumbers } from '../utils/houseCalculations';
import AddNewDate from './AddNewDate';
import ExcelUpload from './ExcelUpload';
import * as XLSX from 'xlsx'; // Import the xlsx library
import ExcelJS from 'exceljs'; // Import the exceljs library

function UserData() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hrData, setHrData] = useState([]);
  const [dates, setDates] = useState({});
  const [houseNumbers, setHouseNumbers] = useState({});
  const [excelData, setExcelData] = useState(null);
  const [groupTotals, setGroupTotals] = useState({ Ar: 0, Ta: 0, Ge: 0 });
  const [groupCounts, setGroupCounts] = useState({}); // Track counts per HR and day
  const [excelUploadDate, setExcelUploadDate] = useState('');
  const [sameNumberCounts, setSameNumberCounts] = useState({}); // Track same number counts per HR and day
  const [sameGroupCounts, setSameGroupCounts] = useState({}); // Track same group counts per HR and day

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        setSuccess(null);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, hr')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        setUser(userData);

        // Fetch HR data
        const { data: hrData, error: hrError } = await supabase
          .from('hr_data')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (hrError) throw hrError;

        // Process dates from HR data
        const datesMap = {};
        hrData.forEach(item => {
          if (item.topic.startsWith('DAY-')) {
            const day = parseInt(item.topic.split('-')[1]);
            datesMap[day] = item.date;
          }
        });

        setHrData(hrData || []);
        setDates(datesMap);
        setHouseNumbers(updateHouseNumbers(hrData, datesMap));
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId]); // Ensure data is fetched when userId changes

  const generateUUID = () => {
    return crypto.randomUUID();
  };

  const handleAddDate = async (newDate) => {
    try {
      setSaving(true);
      setError(null);

      // Find the next available day number
      const existingDays = Object.keys(dates)
        .map(Number)
        .sort((a, b) => a - b);
      const nextDay = existingDays.length > 0 ? Math.max(...existingDays) + 1 : 1;

      // Create new HR data entries
      const newEntries = [];

      // Add entries for each HR
      for (let hr = 1; hr <= (user?.hr || 1); hr++) {
        // Add main day entry
        newEntries.push({
          id: generateUUID(),
          user_id: userId,
          topic: `DAY-${nextDay}`,
          date: newDate,
          hr_number: `HR-${hr}`,
          planet_house: null
        });

        // Add entries for each division
        divisions.forEach(division => {
          newEntries.push({
            id: generateUUID(),
            user_id: userId,
            topic: division,
            date: newDate,
            hr_number: `HR-${hr}`,
            planet_house: null
          });
        });
      }

      // Insert new entries
      const { error: insertError } = await supabase
        .from('hr_data')
        .insert(newEntries);

      if (insertError) throw insertError;

      // Update local state
      setDates(prev => ({
        ...prev,
        [nextDay]: newDate
      }));
      setHrData(prev => [...prev, ...newEntries]);
      setSuccess('New date added successfully!');
      setTimeout(() => setSuccess(null), 3000);

      return true;
    } catch (error) {
      setError('Error adding date: ' + error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = async (day, value) => {
    try {
      setDates(prev => ({
        ...prev,
        [day]: value
      }));

      if (!value) return;

      // Update existing entries for this day
      const updatedData = hrData.map(item => {
        if (item.topic === `DAY-${day}` ||
            (item.date === dates[day] && divisions.includes(item.topic))) {
          return { ...item, date: value };
        }
        return item;
      });

      setHrData(updatedData);
    } catch (error) {
      setError('Error updating date: ' + error.message);
    }
  };

  const handlePlanetChange = (hr, day, value) => {
    try {
      const updatedData = [...hrData];

      // Update planet selection
      const planetEntry = updatedData.find(
        item => item.hr_number === `HR-${hr}` &&
               item.topic === `DAY-${day}`
      );

      if (planetEntry) {
        planetEntry.planet_house = value;
      }

      // Update division houses if Excel data exists
      if (excelData && value) {
        const planetData = excelData[value];
        if (planetData) {
          divisions.forEach(division => {
            const divisionEntry = updatedData.find(
              item => item.hr_number === `HR-${hr}` &&
                     item.topic === division &&
                     item.date === dates[day]
            );

            if (divisionEntry) {
              divisionEntry.planet_house = planetData[division] || null;
            }
          });
        }
      }

      setHrData(updatedData);
    } catch (error) {
      console.error('Error in handlePlanetChange:', error);
      setError('Failed to update planet selection');
    }
  };

  const handleExcelUpload = (data, fileName) => {
    console.log('Received data from ExcelUpload component:', data);
    setExcelData(data);
    setExcelFileName(fileName);
    setExcelGroupCounts({});
    setExcelUploadDate(new Date().toISOString().split('T')[0]); // e.g., "2025-05-01"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Calculate house counts FIRST, so they are available for hr_data saving
      const newHouseNumbers = updateHouseNumbers(hrData, dates);
      setHouseNumbers(newHouseNumbers); // Update state for UI consistency

      // Save HR data - Modify this mapping
      const dataToSave = hrData
        .filter(item => item.date)
        .map(item => {
          // Find the corresponding day number for the item's date
          const dayEntry = Object.entries(dates).find(([d, date]) => date === item.date);
          const day = dayEntry ? dayEntry[0] : null;
          const hr = item.hr_number.split('-')[1]; // Extract HR number

          // Construct the key to look up the calculated house number
          const houseNumberKey = (hr && item.topic && day && !item.topic.startsWith('DAY-'))
                               ? `${hr}_${item.topic}_${day}`
                               : null; // Only calculate for division topics

          // Get the calculated number, default to null if not found or not applicable
          const calculatedHouseNumber = houseNumberKey ? (newHouseNumbers[houseNumberKey] || null) : null;

          return {
            ...item,
            id: item.id || generateUUID(),
            // V-- CHANGE THIS LINE --V
            house_number: calculatedHouseNumber // Use the correct column name 'house_number'
            // ^-- CHANGE THIS LINE --^
          };
        });

      if (dataToSave.length > 0) {
        // Debug: Log the data being saved to hr_data
        // Update the console log key as well if you keep it
        console.log('Saving hr_data:', dataToSave.find(d => d.house_number !== null));

        const { error: insertError } = await supabase
          .from('hr_data')
          .upsert(dataToSave); // This now includes the corrected column name

        if (insertError) throw insertError;
      }

      // --- Saving to the 'house' table (This part already uses 'house_number') ---

      // Prepare house count data for the house table
      const houseCountData = [];
      const hrNumbersArray = Array.from({ length: user.hr }, (_, i) => i + 1); // Define hrNumbersArray here if not available globally

      hrNumbersArray.forEach(hr => { // Use hrNumbersArray
        Object.entries(dates).forEach(([day, date]) => {
          // Calculate group counts for this HR and day
          const groupCounts = {
            Ar: 0,
            Ta: 0,
            Ge: 0
          };

          divisions.forEach(division => {
            const key = `${hr}_${division}_${day}`;
            const planetHouse = hrData.find(
              d => d.hr_number === `HR-${hr}` &&
                   d.topic === division &&
                   d.date === date
            )?.planet_house;

            if (planetHouse) {
              if (['Ar', 'Cn', 'Li', 'Cp'].includes(planetHouse)) {
                groupCounts.Ar++;
              } else if (['Ta', 'Le', 'Sc', 'Aq'].includes(planetHouse)) {
                groupCounts.Ta++;
              } else if (['Ge', 'Vi', 'Sg', 'Pi'].includes(planetHouse)) {
                groupCounts.Ge++;
              }
            }
          });

          houseCountData.push({
            user_id: userId,
            hr_number: hr,
            day_number: parseInt(day),
            group_ar: groupCounts.Ar,
            group_ta: groupCounts.Ta,
            group_ge: groupCounts.Ge,
            date: date
          });

          // Save house count per topic (division) into 'house' table
          divisions.forEach(division => {
            const topicData = hrData.find(
              d => d.hr_number === `HR-${hr}` &&
                   d.topic === division &&
                   d.date === date
            );

            if (topicData) {
              houseCountData.push({
                user_id: userId,
                hr_number: hr,
                day_number: parseInt(day),
                date: date,
                topic: division,
                planet_house: topicData.planet_house || null,
                // Use the already calculated newHouseNumbers here too
                house_number: newHouseNumbers[`${hr}_${division}_${day}`] || null,
              });
            }
          });
        });
      });

      // Debug: Log the data being saved to house table
      console.log('Saving house count data (to house table):', houseCountData.find(d => d.house_number !== null)); // Log an example

      // Delete existing house counts for these dates from 'house' table
      const datesToDelete = Object.values(dates).filter(Boolean);
      if (datesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('house') // Still targeting the 'house' table here
          .delete()
          .eq('user_id', userId)
          .in('date', datesToDelete);

        if (deleteError) throw deleteError;
      }

      // Insert new house counts into 'house' table
      if (houseCountData.length > 0) {
        const { error: insertError } = await supabase
          .from('house') // Still targeting the 'house' table here
          .insert(houseCountData);

        if (insertError) {
          console.error('Insert error into house table:', insertError);
          throw insertError;
        }
      }

      // --- End saving to 'house' table ---


      setSuccess('All data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateGroupTotals = (hrData) => {
    const totals = { Ar: 0, Ta: 0, Ge: 0 };
    hrData.forEach((item) => {
      if (["Ar", "Cn", "Li", "Cp"].includes(item.planet_house)) totals.Ar++;
      if (["Ta", "Ve", "Sc", "Pi"].includes(item.planet_house)) totals.Ta++;
      if (["Ge", "Aq", "Sa", "Ca"].includes(item.planet_house)) totals.Ge++;
    });
    setGroupTotals(totals);
  };

  useEffect(() => {
    calculateGroupTotals(hrData);
  }, [hrData]);

  // Function to update group counts
  const updateGroupCounts = () => {
    const newCounts = {};

    hrNumbers.forEach(hr => {
      newCounts[hr] = {};
      Object.keys(dates).forEach(day => {
        newCounts[hr][day] = { Ar: 0, Ta: 0, Ge: 0 };
      });
    });

    hrData.forEach(item => {
      if (!item.planet_house) return;

      const hrNum = item.hr_number.split('-')[1];
      const day = item.topic.startsWith('DAY-')
        ? item.topic.split('-')[1]
        : Object.entries(dates).find(([d, date]) => date === item.date)?.[0];

      if (hrNum && day) {
        // Correct group matching
        if (['Ar', 'Cn', 'Li', 'Cp'].includes(item.planet_house)) {
          newCounts[hrNum][day].Ar++;
        } else if (['Ta', 'Le', 'Sc', 'Aq'].includes(item.planet_house)) {
          newCounts[hrNum][day].Ta++;
        } else if (['Ge', 'Vi', 'Sg', 'Pi'].includes(item.planet_house)) {
          newCounts[hrNum][day].Ge++;
        }
      }
    });

    setGroupCounts(newCounts);
  };

  // Update counts whenever data changes
  useEffect(() => {
    if (hrData.length > 0 && Object.keys(dates).length > 0) {
      updateGroupCounts();
    }
  }, [hrData, dates]);

  const calculateSameNumbers = () => {
    const sameNumberCounts = {};

    hrNumbers.forEach(hr => {
      sameNumberCounts[hr] = {};
      Object.keys(dates).forEach(day => {
        const currentDay = parseInt(day);
        const previousDay = currentDay - 1;

        if (!dates[previousDay]) {
          // Skip if there is no previous day
          sameNumberCounts[hr][day] = 0;
          return;
        }

        let sameCount = 0;

        divisions.forEach(division => {
          const currentKey = `${hr}_${division}_${currentDay}`;
          const previousKey = `${hr}_${division}_${previousDay}`;

          const currentNumber = houseNumbers[currentKey];
          const previousNumber = houseNumbers[previousKey];

          if (currentNumber && currentNumber === previousNumber) {
            sameCount++;
          }
        });

        sameNumberCounts[hr][day] = sameCount;
      });
    });

    setSameNumberCounts(sameNumberCounts);
  };

  useEffect(() => {
    if (hrData.length > 0 && Object.keys(dates).length > 0) {
      calculateSameNumbers();
    }
  }, [hrData, dates, houseNumbers]);

  const calculateSameGroups = () => {
    const sameGroupCounts = {};

    hrNumbers.forEach(hr => {
      sameGroupCounts[hr] = {};
      Object.keys(dates).forEach(day => {
        const currentDay = parseInt(day);
        const previousDay = currentDay - 1;

        if (!dates[previousDay]) {
          // Skip if there is no previous day
          sameGroupCounts[hr][day] = 0;
          return;
        }

        let sameGroupCount = 0;

        divisions.forEach(division => {
          const currentData = hrData.find(
            d => d.hr_number === `HR-${hr}` &&
                 d.topic === division &&
                 d.date === dates[currentDay]
          );

          const previousData = hrData.find(
            d => d.hr_number === `HR-${hr}` &&
                 d.topic === division &&
                 d.date === dates[previousDay]
          );

          const currentGroup = currentData?.planet_house && ['Ar', 'Cn', 'Li', 'Cp'].includes(currentData.planet_house)
            ? 'Ar'
            : currentData?.planet_house && ['Ta', 'Le', 'Sc', 'Aq'].includes(currentData.planet_house)
            ? 'Ta'
            : currentData?.planet_house && ['Ge', 'Vi', 'Sg', 'Pi'].includes(currentData.planet_house)
            ? 'Ge'
            : null;

          const previousGroup = previousData?.planet_house && ['Ar', 'Cn', 'Li', 'Cp'].includes(previousData.planet_house)
            ? 'Ar'
            : previousData?.planet_house && ['Ta', 'Le', 'Sc', 'Aq'].includes(previousData.planet_house)
            ? 'Ta'
            : previousData?.planet_house && ['Ge', 'Vi', 'Sg', 'Pi'].includes(previousData.planet_house)
            ? 'Ge'
            : null;

          if (currentGroup && previousGroup && currentGroup === previousGroup) {
            sameGroupCount++;
          }
        });

        sameGroupCounts[hr][day] = sameGroupCount;
      });
    });

    setSameGroupCounts(sameGroupCounts);
  };

  useEffect(() => {
    if (hrData.length > 0 && Object.keys(dates).length > 0) {
      calculateSameGroups();
    }
  }, [hrData, dates]);

  const handleDownloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('User Data');

      // Add a merged header row with user information and upload date
      worksheet.mergeCells('A1', 'D1');
      worksheet.getCell('A1').value = `User: ${user.username}, Excel Upload Date: ${excelUploadDate}`;
      worksheet.getCell('A1').font = { bold: true };

      // Add headers
      const headers = ['Topic', ...Object.keys(dates).map(day => `Day-${day}`)];
      worksheet.addRow(headers);

      // Add a row for dates corresponding to each day
      const dateRow = ['Date', ...Object.keys(dates).map(day => dates[day] || '-')];
      worksheet.addRow(dateRow);

      // Add data rows for planets and house numbers
      hrNumbers.forEach(hr => {
        divisions.forEach(division => {
          const row = [`HR-${hr} ${division}`];
          Object.entries(dates).forEach(([day, date]) => {
            const existingData = hrData.find(
              d => d.hr_number === `HR-${hr}` &&
                   d.topic === division &&
                   d.date === date
            );
            const houseNumber = houseNumbers[`${hr}_${division}_${day}`];
            row.push(`${existingData?.planet_house || '-'} - (${houseNumber || '-'})`);
          });
          worksheet.addRow(row);
        });

        // Add group counts under each HR
        worksheet.addRow([`HR-${hr} Group Ar`, ...Object.keys(dates).map(day => groupCounts[hr]?.[day]?.Ar || 0)]);
        worksheet.addRow([`HR-${hr} Group Ta`, ...Object.keys(dates).map(day => groupCounts[hr]?.[day]?.Ta || 0)]);
        worksheet.addRow([`HR-${hr} Group Ge`, ...Object.keys(dates).map(day => groupCounts[hr]?.[day]?.Ge || 0)]);

        // Add same number counts under each HR
        worksheet.addRow([`HR-${hr} Same Numbers`, ...Object.keys(dates).map(day => sameNumberCounts[hr]?.[day] || 0)]);

        // Add same group counts under each HR
        worksheet.addRow([`HR-${hr} Same Groups`, ...Object.keys(dates).map(day => sameGroupCounts[hr]?.[day] || 0)]);

        worksheet.addRow([]); // Add a blank row after each HR
      });

      // Apply styles (e.g., background colors)
      console.log('Debugging handleDownloadExcel:');
      console.log('hrData:', hrData);
      console.log('groupCounts:', groupCounts);
      console.log('houseNumbers:', houseNumbers);

      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          const cellValue = cell.value ? cell.value.toString() : ''; // Ensure cell value is a string
          console.log(`Row ${rowNumber}, Column ${colNumber}, Value: ${cellValue}`); // Debug log for cell value

          if (rowNumber === 1 || rowNumber === 2) {
            // Header and date row styling
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCCCCC' }, // Light gray
            };
          } else {
            // Apply colors based on house group
            const house = cellValue.match(/[A-Za-z]{2}/)?.[0]; // Extract house from cell value
            const color = getHouseGroupColor(house);

            if (color.includes('#DCEDC1')) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDCEDC1' }, // Green
              };
            } else if (color.includes('#FFD3B6')) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFD3B6' }, // Orange
              };
            } else if (color.includes('#FFAAA5')) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFAAA5' }, // Red
              };
            } else {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' }, // White
              };
            }
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${user?.username || 'User'}_data.xlsx`;
      link.click();
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };

  // --- PGML Function Handlers ---
  const [inputText, setInputText] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [training, setTraining] = useState(false);

  const handleTrainModel = async () => {
    setTraining(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await startTraining();
      console.log("Training initiated:", result);
      setSuccess('Training process started successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Training failed:", err);
      setError('Failed to start training: ' + err.message);
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to analyze.');
      return;
    }
    setPredicting(true);
    setError(null);
    setPredictionResult(null);
    try {
      const result = await getPrediction(inputText);
      console.log("Prediction result:", result);
      setPredictionResult(result);
      setSuccess('Prediction successful!');
       setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError('Prediction failed: ' + err.message);
    } finally {
      setPredicting(false);
    }
  };
  // --- End PGML Function Handlers ---


  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  const hrNumbers = Array.from({ length: user.hr }, (_, i) => i + 1);

  // Sort dates by day number
  const allDates = Object.entries(dates)
    .sort(([a], [b]) => Number(a) - Number(b))
    .reduce((acc, [day, date]) => {
      acc[day] = date;
      return acc;
    }, {});

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">
              {user?.username || 'User Not Found'} {/* Display username */}
            </h1>
            <span className="text-sm text-gray-600">
              HR: {user?.hr || 'N/A'} {/* Display HR numbers */}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ExcelUpload
              onDataUploaded={handleExcelUpload}
              showIcon={true}
              isUploaded={!!excelData}
            />
            <AddNewDate
              onAddDate={handleAddDate}
              existingDates={Object.values(dates).filter(Boolean)}
            />
            <button
              onClick={handleDownloadExcel}
              className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600"
            >
              Download Excel
            </button>
            <button
              onClick={() => navigate('/')} 
              className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600"
            >
              Back
            </button>
            <Link
              to={`/day-details/${userId}?dates=${encodeURIComponent(JSON.stringify(dates))}`}
              className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
            >
              Go to Day Details
            </Link>
            <Link
              to={`/abcd-number/${userId}`}
              className="bg-orange-500 text-white px-3 py-1 text-xs rounded hover:bg-orange-600"
            >
              ABCD Number
            </Link>
            <Link
              to="/number-gen"
              className="bg-purple-500 text-white px-3 py-1 text-xs rounded hover:bg-purple-600"
            >
              Number Gen
            </Link>
            <button
              type="submit"  // Add type="submit" to trigger form submission
              form="userDataForm"  // Add form attribute to connect to the form
              disabled={saving}
              className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="p-2 m-2 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-2 m-2 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <form id="userDataForm" onSubmit={handleSubmit}>  {/* Add id to the form */}
          {hrNumbers.map(hr => (
            <div key={hr} className="mb-8">
              <div className="sticky top-0 bg-gray-200 z-10">
                <h2 className="text-lg font-semibold px-4 py-2">
                  {user?.username || 'User Not Found'} - HR-{hr} {/* Display username and HR */}
                </h2>
              </div>
              <div className="relative">
                {/* Top Scrollbar */}
                <div className="overflow-x-auto scrollbar-hidden absolute top-0 left-0 right-0 z-10">
                  <div className="w-full" style={{ height: '1px' }}></div>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr>
                        <th className="w-24 p-2 text-left text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200">
                          Topic
                        </th>
                        {Object.entries(allDates).map(([day, date]) => (
                          <th key={day} className="w-40 p-0 text-left text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200">
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between p-2 space-x-4">
                                <span>HR-{hr}</span> {/* Add HR number above each date */}
                              </div>
                              <div className="flex items-center justify-between p-2 space-x-4">
                                <span>Day-{day}</span>
                                <input
                                  type="date"
                                  value={date || ''}
                                  onChange={(e) => handleDateChange(day, e.target.value)}
                                  className="text-xs border-0 p-0"
                                />
                              </div>
                              <select
                                name={`planet_hr${hr}_day${day}`}
                                value={hrData.find(
                                  d => d.hr_number === `HR-${hr}` &&
                                      d.topic === `DAY-${day}`
                                )?.planet_house || ''}
                                onChange={(e) => handlePlanetChange(hr, day, e.target.value)}
                                className="w-full text-xs border-t border-gray-200 p-1"
                              >
                                <option value="">PLN</option>
                                {planets.map((p) => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {divisions.map((division) => (
                        <tr key={division} className="border-b border-gray-200">
                          <td className="p-2 text-xs font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                            {division}
                          </td>
                          {Object.entries(allDates).map(([day, date]) => {
                            const existingData = hrData.find(
                              d => d.hr_number === `HR-${hr}` &&
                                  d.topic === division &&
                                  d.date === date
                            );
                            const key = `${hr}_${division}_${day}`;
                            const houseNumber = houseNumbers[key];
                            return (
                              <td key={day} className="p-0 border-r border-gray-200">
                                <div className="flex items-center">
                                  <div className={`w-full text-xs p-2 ${
                                    existingData?.planet_house ? getHouseGroupColor(existingData.planet_house) : ''
                                  }`}>
                                    {existingData?.planet_house || '-'}
                                  </div>
                                  <div className="w-8 text-center">
                                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                                      houseNumber
                                        ? 'bg-blue-100 text-blue-800 font-medium'
                                        : 'text-gray-400'
                                    }`}>
                                      {houseNumber || '-'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* Add group counts under each HR */}
                      <tr className="bg-[#DCEDC1]">
                        <td className="p-2 text-xs font-bold text-black">Ar</td>
                        {Object.keys(allDates).map(day => (
                          <td key={`ar-${day}`} className="p-2 text-xs font-bold text-black text-center">
                            {groupCounts[hr]?.[day]?.Ar || 0}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#FFD3B6]">
                        <td className="p-2 text-xs font-bold text-black">Ta</td>
                        {Object.keys(allDates).map(day => (
                          <td key={`ta-${day}`} className="p-2 text-xs font-bold text-black text-center">
                            {groupCounts[hr]?.[day]?.Ta || 0}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#FFAAA5]">
                        <td className="p-2 text-xs font-bold text-black">Ge</td>
                        {Object.keys(allDates).map(day => (
                          <td key={`ge-${day}`} className="p-2 text-xs font-bold text-black text-center">
                            {groupCounts[hr]?.[day]?.Ge || 0}
                          </td>
                        ))}
                      </tr>
                      {/* Add same number counts under each HR */}
                      <tr className="bg-gray-200">
                        <td className="p-2 text-xs font-bold text-black text-[10px]">Same Numbers</td>
                        {Object.keys(allDates).map(day => (
                          <td key={`same-${day}`} className="p-2 text-xs font-bold text-black text-center text-[10px]">
                            {sameNumberCounts[hr]?.[day] || 0}
                          </td>
                        ))}
                      </tr>
                      {/* Add same group counts under each HR */}
                      <tr className="bg-gray-300">
                        <td className="p-2 text-xs font-bold text-black text-[10px]">Same Groups</td>
                        {Object.keys(allDates).map(day => (
                          <td key={`same-group-${day}`} className="p-2 text-xs font-bold text-black text-center text-[10px]">
                            {sameGroupCounts[hr]?.[day] || 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

// Keep only this default export
export default UserData;

// Remove any other 'export default UserData;' lines