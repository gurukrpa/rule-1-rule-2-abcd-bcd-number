export class DateModel {
  constructor(dates = {}, maxDays = Infinity) {
    this.dates = dates;
    this.maxDays = maxDays;
  }

  addNewDate(newDate) {
    // Get all existing dates sorted by day number
    const existingDates = Object.entries(this.dates)
      .filter(([_, date]) => date) // Only include non-empty dates
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    // Find the next available day number
    let nextDay = 1;
    if (existingDates.length > 0) {
      const lastDay = parseInt(existingDates[existingDates.length - 1][0]);
      nextDay = lastDay + 1;
    }

    // Validate against maxDays
    if (nextDay > this.maxDays) {
      throw new Error(`Cannot add more dates. Maximum limit of ${this.maxDays} days reached.`);
    }

    // Add new date
    const updatedDates = {
      ...this.dates,
      [nextDay]: newDate
    };

    this.dates = updatedDates;
    return {
      dates: updatedDates,
      dayNumber: nextDay
    };
  }

  getDates() {
    return this.dates;
  }

  getExistingDates() {
    return Object.values(this.dates).filter(Boolean);
  }

  updateDate(day, value) {
    if (day > this.maxDays) {
      throw new Error(`Cannot update date. Day number ${day} exceeds maximum limit of ${this.maxDays} days.`);
    }
    this.dates[day] = value;
    return this.dates;
  }

  getSortedDates() {
    return Object.entries(this.dates)
      .filter(([_, date]) => date) // Only include non-empty dates
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .reduce((acc, [day, date]) => {
        acc[day] = date;
        return acc;
      }, {});
  }

  hasDate(date) {
    return Object.values(this.dates).includes(date);
  }

  getDayForDate(date) {
    const entry = Object.entries(this.dates).find(([_, d]) => d === date);
    return entry ? parseInt(entry[0]) : null;
  }

  getNextAvailableDay() {
    const existingDays = Object.keys(this.dates)
      .map(Number)
      .filter(day => this.dates[day])
      .sort((a, b) => a - b);

    let nextDay = 1;
    if (existingDays.length > 0) {
      nextDay = existingDays[existingDays.length - 1] + 1;
    }

    if (nextDay > this.maxDays) {
      throw new Error(`Cannot add more dates. Maximum limit of ${this.maxDays} days reached.`);
    }

    return nextDay;
  }
}