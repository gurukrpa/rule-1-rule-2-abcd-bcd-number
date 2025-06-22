import { useState } from 'react';
import { divisions } from '../utils/constants';

export const useFormData = (user, userId) => {
  const processFormData = (formData, dates) => {
    const newData = [];

    // Create entries using the synchronized dates
    for (let hr = 1; hr <= user.hr; hr++) {
      for (let day = user.days; day >= 1; day--) {
        const date = dates[day];
        const planet = formData.get(`planet_hr${hr}_day${day}`);
        
        if (date || planet) {
          newData.push({
            user_id: userId,
            topic: `DAY-${day}`,
            date: date || null,
            hr_number: `HR-${hr}`,
            planet_house: planet || null
          });
        }

        if (date) {
          for (const division of divisions) {
            const house = formData.get(`house_hr${hr}_day${day}_${division}`);
            if (house) {
              newData.push({
                user_id: userId,
                topic: division,
                date,
                hr_number: `HR-${hr}`,
                planet_house: house
              });
            }
          }
        }
      }
    }

    return newData;
  };

  return { processFormData };
};