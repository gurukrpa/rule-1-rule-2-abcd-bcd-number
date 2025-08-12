import { houses, divisions } from './constants';

export const calculateHouseNumber = (startHouse, endHouse) => {
  if (!startHouse || !endHouse) return null;
  
  const startIndex = houses.indexOf(startHouse);
  const endIndex = houses.indexOf(endHouse);
  
  if (startIndex === -1 || endIndex === -1) return null;
  if (startHouse === endHouse) return 1;

  let count = 1;
  let currentIndex = startIndex;

  while (currentIndex !== endIndex) {
    currentIndex = (currentIndex + 1) % 12;
    count++;
  }

  return count;
};

export const updateHouseNumbers = (hrData, dates) => {
  const numbers = {};
  
  // Sort dates chronologically
  const sortedDates = Object.entries(dates)
    .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
    .map(([day, date]) => ({ day: Number(day), date }));

  // Calculate house numbers between consecutive dates for each HR
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = sortedDates[i];
    const nextDate = sortedDates[i + 1];

    // Get all unique HR numbers from the data
    const hrNumbers = [...new Set(hrData.map(d => d.hr_number))];

    // For each HR number
    hrNumbers.forEach(hrNumber => {
      // Get data for both dates for this HR
      const currentDayData = hrData.filter(d => 
        d.date === currentDate.date && 
        d.hr_number === hrNumber
      );
      const nextDayData = hrData.filter(d => 
        d.date === nextDate.date && 
        d.hr_number === hrNumber
      );

      // For each division
      divisions.forEach(division => {
        // Get houses for current and next day
        const currentHouse = currentDayData.find(d => d.topic === division)?.planet_house;
        const nextHouse = nextDayData.find(d => d.topic === division)?.planet_house;

        console.log(`HR: ${hrNumber}, Division: ${division}, Current Date: ${currentDate.date}, Next Date: ${nextDate.date}, Current House: ${currentHouse}, Next House: ${nextHouse}`);

        if (currentHouse && nextHouse) {
          const count = calculateHouseNumber(currentHouse, nextHouse);
          if (count !== null) {
            // Extract HR number from string (e.g., "HR-1" -> 1)
            const hr = parseInt(hrNumber.split('-')[1]);
            // Store the count for the next day (showing movement from previous day)
            numbers[`${hr}_${division}_${nextDate.day}`] = count;
          }
        }
      });
    });
  }

  return numbers;
};

// New function to calculate group counts for a specific date
export const calculateGroupCountsForDate = (hrData, targetDate, userHrCount) => {
  const counts = {};

  // Initialize counts for each HR number up to the user's total HRs
  for (let hr = 1; hr <= userHrCount; hr++) {
    counts[hr] = { Ar: 0, Ta: 0, Ge: 0 };
  }

  // Iterate through hrData, but only consider items matching the targetDate
  hrData.forEach(item => {
    // Ensure the item has a planet_house and matches the targetDate
    if (!item.planet_house || item.date !== targetDate) return;

    // Extract HR number (e.g., "HR-1" -> 1)
    const hrNumMatch = item.hr_number?.match(/\d+$/);
    const hrNum = hrNumMatch ? parseInt(hrNumMatch[0]) : null;

    if (hrNum && hrNum <= userHrCount) {
      // Correct group matching based on planet_house
      if (['Ar', 'Cn', 'Li', 'Cp'].includes(item.planet_house)) {
        counts[hrNum].Ar++;
      } else if (['Ta', 'Le', 'Sc', 'Aq'].includes(item.planet_house)) {
        counts[hrNum].Ta++;
      } else if (['Ge', 'Vi', 'Sg', 'Pi'].includes(item.planet_house)) {
        counts[hrNum].Ge++;
      }
    }
  });

  return counts;
};