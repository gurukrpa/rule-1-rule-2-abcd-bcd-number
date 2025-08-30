export type City = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
};

export type TokenResult = {
  ascendantSign: string;
  tokens: Record<string, string | null>;
  charts: string[];
  planetaryPositions: Record<string, any>;
  specialLagnas: Record<string, any>;
  input: {
    city: City;
    dateTime: string;
    weekday: string;
    divisionalChart: string;
  };
  computedAt: string;
};

export type VedicChartType = 
  | 'D-1'  // Rasi Chart
  | 'D-2'  // Hora Chart
  | 'D-3'  // Drekkana Chart
  | 'D-9'  // Navamsa Chart
  | 'D-10' // Dasamsa Chart
  | 'D-12' // Dvadasamsa Chart
  | 'D-16' // Shodasamsa Chart
  | 'D-20' // Vimsamsa Chart
  | 'D-24' // Chaturvimsamsa Chart
  | 'D-27' // Saptavimsamsa Chart
  | 'D-30' // Trimsamsa Chart
  | 'D-40' // Khavedamsa Chart
  | 'D-45' // Akshavedamsa Chart
  | 'D-60'; // Shashtyamsa Chart

export type Planet = 
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type ZodiacSign = 
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type ComputeRequest = {
  city: City;
  date: string;
  time: string;
  weekday?: string;
  divisionalChart: VedicChartType;
};
