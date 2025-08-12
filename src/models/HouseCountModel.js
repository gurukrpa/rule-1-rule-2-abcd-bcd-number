import { houses } from '../utils/constants';

export class HouseCountModel {
  constructor() {
    this.houses = houses;
  }

  calculateHouseNumber(startHouse, endHouse) {
    if (!startHouse || !endHouse) return null;
    const startIndex = this.houses.indexOf(startHouse);
    const endIndex = this.houses.indexOf(endHouse);
    if (startIndex === -1 || endIndex === -1) return null;
    
    // If same house, return 1
    if (startHouse === endHouse) return 1;

    let count = 1;
    let currentIndex = startIndex;

    // Keep moving forward until we reach the end house
    while (currentIndex !== endIndex) {
      currentIndex = (currentIndex + 1) % 12;
      count++;
    }

    return count;
  }

  calculateAllHouseNumbers(data, dates, totalHR, divisions) {
    const numbers = {};
    const groupedData = this.groupDataByKey(data);

    const sortedDays = Object.entries(dates)
      .sort((a, b) => b[0] - a[0]) // Sort by day number descending (5 to 1)
      .map(([day]) => Number(day));

    for (let i = 0; i < sortedDays.length - 1; i++) {
      const currentDay = sortedDays[i];
      const nextDay = sortedDays[i + 1];
      
      const currentDate = dates[currentDay];
      const nextDate = dates[nextDay];

      if (!currentDate || !nextDate) continue;

      for (let hr = 1; hr <= totalHR; hr++) {
        for (const division of divisions) {
          const currentKey = `HR-${hr}_${currentDate}_${division}`;
          const nextKey = `HR-${hr}_${nextDate}_${division}`;
          
          const currentHouse = groupedData[currentKey]?.planet_house;
          const nextHouse = groupedData[nextKey]?.planet_house;

          if (currentHouse && nextHouse) {
            const number = this.calculateHouseNumber(currentHouse, nextHouse);
            if (number !== null) {
              numbers[`${hr}_${division}_${nextDay}`] = number;
            }
          }
        }
      }
    }

    return numbers;
  }

  groupDataByKey(data) {
    return data.reduce((acc, item) => {
      const key = `${item.hr_number}_${item.date}_${item.topic}`;
      acc[key] = item;
      return acc;
    }, {});
  }

  validateHouseTransition(fromHouse, toHouse) {
    if (!fromHouse || !toHouse) return false;
    return this.houses.includes(fromHouse) && this.houses.includes(toHouse);
  }

  getHouseSequence(fromHouse, toHouse) {
    if (!this.validateHouseTransition(fromHouse, toHouse)) return [];
    
    const sequence = [fromHouse];
    let currentIndex = this.houses.indexOf(fromHouse);
    const endIndex = this.houses.indexOf(toHouse);
    
    while (currentIndex !== endIndex) {
      currentIndex = (currentIndex + 1) % 12;
      sequence.push(this.houses[currentIndex]);
    }
    
    return sequence;
  }
}