# Vedic Astrology API Server

A comprehensive REST API for Vedic astrology calculations using Swiss Ephemeris with fixed Lahiri ayanamsha.

## Features

### Core Calculations
- **Swiss Ephemeris Integration**: Professional astronomical calculations
- **Fixed Lahiri Ayanamsha**: 24°12′53″ for consistent sidereal calculations
- **Sunrise-based Timing**: Accurate local sunrise calculations for daily timing
- **Planetary Positions**: All 9 traditional grahas including Rahu/Ketu

### Special Calculations
- **Hora Lagna (HL)**: Dynamic hora calculation based on sunrise
- **Ghati Lagna (GL)**: Ghati-based timing calculation  
- **Pranapada (PP)**: Life breath calculation with modality adjustments
- **Sunrise Lagna (SL)**: Nakshatra-based calculation
- **Indu Lagna (IL)**: Wealth calculation using 9th house lords
- **Varnada (VAR)**: Directional calculation with even/odd adjustments

### Upagrahas (Sub-planets)
- **Gulika**: Saturn's segment calculation using 8-fold day/night division
- **Mandi**: Mid-point of Saturn's segment for shadow calculations
- **Kalavela System**: Proper day/night lord progression for upagraha timing

### Varga System (Divisional Charts)
- **Classical Vargas**: D1, D3, D9, D10, D12, D30 with traditional rules
- **Extended Vargas**: D2-D144 for specialized analysis
- **Proper D3**: Parashara's forward/reverse progression
- **Accurate D9**: Movable/fixed/dual sign-based navamsa
- **Classical D30**: Planet-based trimsamsa with odd/even sign rules

## API Endpoints

### POST /api/compute
Comprehensive calculation including all specials and upagrahas.

**Request:**
```json
{
  "dateTime": "2024-01-15T14:30:00",
  "tz": "Asia/Kolkata",
  "lat": 28.6139,
  "lon": 77.2090
}
```

**Response includes:**
- Ascendant and Moon positions (sidereal)
- All special calculations (HL, GL, PP, SL, IL, VAR)
- Gulika and Mandi with timing details
- Astrological tokens for frontend integration

### POST /api/varga
Divisional chart calculations for multiple charts.

**Request:**
```json
{
  "dateTime": "2024-01-15T14:30:00", 
  "tz": "Asia/Kolkata",
  "lat": 28.6139,
  "lon": 77.2090,
  "charts": ["D1", "D3", "D9", "D10", "D12", "D30"]
}
```

**Response includes:**
- All planetary positions in requested divisional charts
- Sign indices and names for each placement
- Astrological tokens for each placement

## Setup

1. **Install Dependencies:**
   ```bash
   npm install express cors sweph luxon
   ```

2. **Swiss Ephemeris Data:**
   - Create `./ephe` directory
   - Download Swiss Ephemeris .se1 files to this directory
   - Files needed: planets, asteroids, moon phases data

3. **Start Server:**
   ```bash
   node server/vedic/api.server.cjs
   ```
   Server runs on port 8086 by default.

## Technical Details

### Time Handling
- Converts local datetime to UTC Julian Day for Swiss Ephemeris
- Handles timezone conversions using Luxon
- Calculates sunrise for proper Vedic day determination
- Manages cross-date sunrise scenarios automatically

### Ayanamsha
- Uses fixed Lahiri ayanamsha (24°12′53″) 
- Converts all tropical longitudes to sidereal
- Ensures consistent calculations without annual drift

### Swiss Ephemeris Integration
- Proper API usage with result.data structure
- SEFLG_SWIEPH for high-precision calculations
- Placidus house system for ascendant calculation
- Rise/transit calculations for sunrise/sunset

### Token System
- Generates unique placement tokens: `as-{house}-{ascSign}-{key}`
- Enables frontend state management and placement tracking
- Format: house number from ascendant, ascendant sign, calculation type

## Files

- `api.server.cjs` - Main server file (CommonJS format)
- `test.html` - Browser-based API testing interface
- `/ephe/` - Swiss Ephemeris data files directory

## Usage Notes

- Server respects project constraint: "only work on vedic sandbox"
- Does not modify existing userlist, ABCD, or other project components
- Standalone Vedic calculation system for astrological analysis
- Ready for integration with existing frontend applications

## Testing

Open `test.html` in browser to test both endpoints with sample data from Delhi, India.
