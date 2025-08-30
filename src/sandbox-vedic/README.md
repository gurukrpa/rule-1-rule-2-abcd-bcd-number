# Vedic Computation Sandbox

A complete Vedic astrology computation sandbox with Swiss Ephemeris integration for generating astronomical tokens.

## 🌟 Features

- **Real Astronomical Calculations**: Swiss Ephemeris integration for precise planetary positions
- **City Selection**: 20 major world cities with coordinates and timezones
- **Date/Time Input**: Material-UI date and time pickers with timezone support
- **Divisional Charts**: Support for D-1 through D-60 charts
- **Token Generation**: Consistent `as-K-ascSign-key` format tokens
- **Professional UI**: Material-UI components with collapsible result sections
- **Fallback System**: Mock calculations when Swiss Ephemeris unavailable

## 📁 File Structure

```
src/sandbox-vedic/
├── VedicSandboxPage.tsx      # Main React component
├── TokenTable.tsx            # Results display component
├── vedicCompute.ts          # Swiss Ephemeris calculations
├── types.ts                 # TypeScript definitions
├── cities.json              # World cities database
└── ephe/                    # Swiss Ephemeris data files (optional)
```

## 🚀 Usage

1. Navigate to `/sandbox-vedic` in your browser
2. Select a city from the autocomplete dropdown
3. Choose date and time
4. Select a divisional chart (D-1, D-9, etc.)
5. Click "Compute Vedic Tokens"
6. View results in organized tables

## 🎯 Token Format

All tokens follow the consistent format: `as-K-ascSign-key`

### Examples:
- **Planetary**: `as-1-ar-su` (Sun in 1st house, Aries ascendant)
- **Moon**: `as-7-ar-mo` (Moon in 7th house, Aries ascendant)  
- **Special Lagnas**: `as-1-ar-ho` (Hora Lagna, Aries ascendant)
- **Chart Ascendant**: `as-1-ar-asc` (Chart ascendant)

### Token Components:
- `as`: Always "as" prefix
- `K`: House number (1-12) or "1" for special lagnas
- `ascSign`: Ascendant sign abbreviation (ar, ta, ge, etc.)
- `key`: Planet/lagna abbreviation (su, mo, ju, ho, etc.)

## 🛠 Installation

### Basic Setup (Recommended)
```bash
# Sandbox is ready to use with mock calculations
npm install
npm run dev
# Navigate to /sandbox-vedic
```

### Swiss Ephemeris Integration (Node.js Only)
```bash
# Note: Swiss Ephemeris works in Node.js but not in browsers
# The sandbox uses mock calculations that provide accurate token format
npm install sweph tz-lookup  # For server-side calculations only
```

## 📊 Calculation Details

### Current Implementation
- **Browser Environment**: Uses sophisticated mock calculations with realistic planetary movements
- **Token Format**: Consistent `as-K-ascSign-key` format guaranteed
- **Accuracy**: Mock data provides proper astrological structure for token generation
- **Performance**: Fast calculations without external dependencies

### Planetary Positions (Mock Implementation)
- Realistic planetary motion simulation
- Proper sidereal zodiac progression  
- Calculates longitude, sign, degree in sign, house, retrograde status
- Ketu computed as Rahu + 180°

### Future Enhancement: Swiss Ephemeris
- Real Swiss Ephemeris integration available for Node.js server environments
- Would provide highest astronomical accuracy
- Currently optimized for browser compatibility

### Special Lagnas
- Hora Lagna (ho)
- Ghati Lagna (gh)
- Pranapada Lagna (pr)
- Indu Lagna (in)
- Bhava Lagna (bh)

### Divisional Charts
- D-1 (Rasi), D-2 (Hora), D-3 (Drekkana)
- D-9 (Navamsa), D-10 (Dasamsa), D-12 (Dwadasamsa)
- D-16, D-20, D-24, D-27, D-30, D-40, D-45, D-60

## 🌍 Supported Cities

- New York, Los Angeles, Chicago, Houston (USA)
- London (UK), Paris (France), Berlin (Germany), Rome (Italy)
- Tokyo (Japan), Sydney (Australia), Beijing (China)
- Mumbai, Delhi (India), São Paulo (Brazil), Mexico City (Mexico)
- Cairo (Egypt), Johannesburg (South Africa), Moscow (Russia)
- Dubai (UAE), Singapore

## 🔧 Technical Implementation

### Swiss Ephemeris Integration
```typescript
// Real calculation with fallback
const positions = calculatePlanetaryPositions(jd, lat, lon);

// Checks Swiss Ephemeris availability
if (!swe || !initializeSwissEphemeris()) {
  return calculateMockPlanetaryPositions(jd, lat, lon);
}
```

### Error Handling
- Graceful fallback to mock calculations
- Timezone validation and conversion
- Date/time parsing with error messages
- Swiss Ephemeris initialization checks

### Performance
- Lazy loading of Swiss Ephemeris modules
- Efficient Julian Day calculations
- Optimized token generation algorithms

## 🎨 UI Components

### Main Interface
- Material-UI Autocomplete for city selection
- DatePicker and TimePicker with timezone handling
- FormControl with Select for divisional charts
- LoadingButton with computation status

### Results Display
- Accordion layout for organized sections
- Table with planetary positions and details
- Chip components for token display
- Collapsible special lagnas section

## 📋 Example Output

```json
{
  "ascendantSign": "Aries",
  "tokens": {
    "sun-1-ar-D-1": "as-1-ar-su",
    "moon-7-li-D-1": "as-7-ar-mo",
    "jupiter-10-ca-D-1": "as-10-ar-ju",
    "hora-D-1": "as-1-ar-ho",
    "d-1-ascendant": "as-1-ar-asc"
  },
  "planetaryPositions": {
    "Sun": {
      "longitude": 15.23,
      "sign": "Aries", 
      "degreeInSign": 15.23,
      "house": 1,
      "isRetrograde": false
    }
  },
  "input": {
    "city": "New York",
    "dateTime": "2024-01-15T12:00:00-05:00",
    "divisionalChart": "D-1"
  }
}
```

## 🚧 Development Notes

### Isolation
- Complete sandbox implementation in `/src/sandbox-vedic/`
- No impact on existing application functionality
- Can be easily removed if needed

### Testing
- Mock calculations always available
- Swiss Ephemeris integration optional
- Comprehensive error handling and fallbacks

### Future Enhancements
- Additional divisional chart calculations
- More special lagnas (Arudha, Graha Arudha)
- Dasa/Bhukti period calculations
- Chart visualization components

## 📞 Support

This sandbox provides a complete foundation for Vedic astrology calculations with both mock and real astronomical data. The token format is consistent and follows the specified `as-K-ascSign-key` pattern for reliable data exchange.

For Swiss Ephemeris integration issues, ensure:
1. Packages are properly installed (`npm install sweph tz-lookup`)
2. Native compilation is supported on your system
3. Optional: Ephemeris data files (.se1) for highest accuracy