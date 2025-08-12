export class HouseNumberModel {
  constructor(houses = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"]) {
    this.houses = houses;
  }

  calculate(data, dates, totalHR) {
    const numbers = {};
    const groupedData = this.groupDataByKey(data);
    const sortedDays = this.getSortedDays(dates);
    const divisions = this.getDivisions();

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

  calculateHouseNumber(startHouse, endHouse) {
    if (!startHouse || !endHouse) return null;
    const startIndex = this.houses.indexOf(startHouse);
    const endIndex = this.houses.indexOf(endHouse);
    if (startIndex === -1 || endIndex === -1) return null;
    
    if (startHouse === endHouse) return 1;

    let count = 1;
    let currentIndex = startIndex;

    while (currentIndex !== endIndex) {
      currentIndex = (currentIndex + 1) % 12;
      count++;
    }

    return count;
  }

  private groupDataByKey(data) {
    return data.reduce((acc, item) => {
      const key = `${item.hr_number}_${item.date}_${item.topic}`;
      acc[key] = item;
      return acc;
    }, {});
  }

  private getSortedDays(dates) {
    return Object.keys(dates)
      .map(Number)
      .sort((a, b) => b - a);
  }

  private getDivisions() {
    return [
      "D-1", "D-9", "D-10", "D-3", "D-4", "D-7", "D-12", 
      "D-27", "D-30", "D-60", "D-5", "D-11", "D-81", 
      "D-108", "D-144"
    ];
  }
}