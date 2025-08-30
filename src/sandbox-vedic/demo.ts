/**
 * Demo script showing how to use the Vedic Computation Sandbox programmatically
 * This can be run in a Node.js environment or browser console
 */

import type { VedicChartType } from './types';
import { useWorldCities } from './useWorldCities';
import { computeVedicTokens, getAvailableDivisionalCharts } from './vedicCompute';

// Example usage function
export async function demoVedicComputation() {
  console.log('🌟 Vedic Computation Sandbox Demo');
  console.log('==================================');

  // Get available cities
  const { cities, getCityByName } = useWorldCities();
  console.log(`📍 Available cities: ${cities.length}`);

  // Select Delhi as example city
  const delhi = getCityByName('Delhi');
  if (!delhi) {
    console.error('❌ Delhi not found in cities database');
    return;
  }

  console.log(`🏙️  Selected city: ${delhi.name}, ${delhi.country}`);
  console.log(`🌍 Coordinates: ${delhi.lat}°N, ${delhi.lon}°E`);
  console.log(`🕐 Timezone: ${delhi.tz}`);

  // Get available charts
  const charts = getAvailableDivisionalCharts();
  console.log(`📊 Available charts: ${charts.join(', ')}`);

  // Example computation for D-1 chart
  const request = {
    city: delhi,
    date: '2025-08-21',
    time: '12:00:00',
    weekday: 'Thursday',
    divisionalChart: 'D-1' as VedicChartType
  };

  console.log('\n⚡ Computing Vedic tokens...');
  console.log('Input:', JSON.stringify(request, null, 2));

  try {
    const result = await computeVedicTokens(request);
    
    console.log('\n✅ Computation successful!');
    console.log(`🔮 Ascendant: ${result.ascendantSign}`);
    console.log(`📅 Computed at: ${result.computedAt}`);
    
    console.log('\n🪐 Planetary Positions:');
    Object.entries(result.planetaryPositions).forEach(([planet, data]) => {
      console.log(`  ${planet}: ${data.sign} ${data.degreeInSign.toFixed(2)}° (House ${data.house})`);
    });
    
    console.log('\n🔸 Special Lagnas:');
    Object.entries(result.specialLagnas).forEach(([lagna, data]) => {
      console.log(`  ${lagna}: ${data.sign} ${data.degree.toFixed(2)}°`);
    });
    
    console.log('\n🎯 Generated Tokens:');
    Object.entries(result.tokens).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Computation failed:', error);
    throw error;
  }
}

// Example batch computation
export async function demoBatchComputation() {
  console.log('\n🔄 Batch Computation Demo');
  console.log('=========================');
  
  const cities = ['Delhi', 'London', 'New York', 'Tokyo'];
  const charts: VedicChartType[] = ['D-1', 'D-9', 'D-10'];
  
  const { getCityByName } = useWorldCities();
  
  for (const cityName of cities) {
    const city = getCityByName(cityName);
    if (!city) continue;
    
    console.log(`\n🏙️  Processing ${city.name}...`);
    
    for (const chart of charts) {
      const request = {
        city,
        date: '2025-08-21',
        time: '12:00:00',
        divisionalChart: chart
      };
      
      try {
        const result = await computeVedicTokens(request);
        console.log(`  ${chart}: Ascendant ${result.ascendantSign} (${Object.keys(result.tokens).length} tokens)`);
      } catch (error) {
        console.error(`  ${chart}: Error - ${error.message}`);
      }
    }
  }
}

// Example token analysis
export function analyzeTokens(result: any) {
  console.log('\n🔍 Token Analysis');
  console.log('=================');
  
  const tokens = result.tokens;
  const tokenKeys = Object.keys(tokens);
  
  console.log(`📊 Total tokens generated: ${tokenKeys.length}`);
  
  // Group by type
  const planetaryTokens = tokenKeys.filter(key => 
    ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']
    .some(planet => key.includes(planet))
  );
  
  const lagnaTokens = tokenKeys.filter(key => key.includes('lagna'));
  const chartTokens = tokenKeys.filter(key => key.includes('d-'));
  
  console.log(`🪐 Planetary tokens: ${planetaryTokens.length}`);
  console.log(`🔸 Lagna tokens: ${lagnaTokens.length}`);
  console.log(`📊 Chart tokens: ${chartTokens.length}`);
  
  // Show examples
  if (planetaryTokens.length > 0) {
    console.log('\n🪐 Example planetary tokens:');
    planetaryTokens.slice(0, 3).forEach(key => {
      console.log(`  ${key}: ${tokens[key]}`);
    });
  }
  
  if (lagnaTokens.length > 0) {
    console.log('\n🔸 Example lagna tokens:');
    lagnaTokens.slice(0, 3).forEach(key => {
      console.log(`  ${key}: ${tokens[key]}`);
    });
  }
}

// Run demo if called directly
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for console access
  (window as any).demoVedicComputation = demoVedicComputation;
  (window as any).demoBatchComputation = demoBatchComputation;
  (window as any).analyzeTokens = analyzeTokens;
  
  console.log('💡 Demo functions available in browser console:');
  console.log('   - demoVedicComputation()');
  console.log('   - demoBatchComputation()');
  console.log('   - analyzeTokens(result)');
}
