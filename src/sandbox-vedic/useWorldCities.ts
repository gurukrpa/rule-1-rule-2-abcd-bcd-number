import { useMemo } from 'react';
import cities from './cities.json';
import type { City } from './types';

export function useWorldCities() {
  const citiesData = useMemo(() => {
    return cities as City[];
  }, []);

  const searchCities = useMemo(() => {
    return (searchTerm: string): City[] => {
      if (!searchTerm || searchTerm.length < 2) {
        return citiesData.slice(0, 10); // Return first 10 cities for empty search
      }

      const lowerSearchTerm = searchTerm.toLowerCase();
      return citiesData.filter(city => 
        city.name.toLowerCase().includes(lowerSearchTerm) ||
        city.country.toLowerCase().includes(lowerSearchTerm)
      ).slice(0, 20); // Limit to 20 results
    };
  }, [citiesData]);

  const getCityByName = useMemo(() => {
    return (cityName: string): City | undefined => {
      return citiesData.find(city => 
        city.name.toLowerCase() === cityName.toLowerCase()
      );
    };
  }, [citiesData]);

  const getCitiesByCountry = useMemo(() => {
    return (countryName: string): City[] => {
      return citiesData.filter(city => 
        city.country.toLowerCase() === countryName.toLowerCase()
      );
    };
  }, [citiesData]);

  return {
    cities: citiesData,
    searchCities,
    getCityByName,
    getCitiesByCountry,
    totalCities: citiesData.length
  };
}
