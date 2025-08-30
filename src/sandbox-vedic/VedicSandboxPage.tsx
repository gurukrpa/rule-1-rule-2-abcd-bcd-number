import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { DateTime } from 'luxon';
import React, { useCallback, useState } from 'react';

import { TokenTable } from './TokenTable';
import type { City, TokenResult, VedicChartType } from './types';
import { useWorldCities } from './useWorldCities';
import { checkSwissEphemerisData, computeVedicTokens, getAvailableDivisionalCharts } from './vedicCompute';

export function VedicSandboxPage() {
  // State
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(DateTime.now().toISODate() || '');
  const [selectedTime, setSelectedTime] = useState<string>(DateTime.now().toFormat('HH:mm'));
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [selectedChart, setSelectedChart] = useState<VedicChartType>('D-1');
  const [result, setResult] = useState<TokenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { cities, searchCities } = useWorldCities();

  // Available options
  const availableCharts = getAvailableDivisionalCharts();
  const weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Swiss Ephemeris status
  const ephemerisStatus = checkSwissEphemerisData();

  // Handlers
  const handleCityChange = useCallback((event: any, newValue: City | null) => {
    setSelectedCity(newValue);
    setError(null);
  }, []);

  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      const dateTime = DateTime.fromISO(newDate);
      if (dateTime.isValid) {
        setSelectedWeekday(dateTime.weekdayLong);
      }
    }
    setError(null);
  }, []);

  const handleTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(event.target.value);
    setError(null);
  }, []);

  const handleWeekdayChange = useCallback((event: any) => {
    setSelectedWeekday(event.target.value);
    setError(null);
  }, []);

  const handleChartChange = useCallback((event: any) => {
    setSelectedChart(event.target.value as VedicChartType);
    setError(null);
  }, []);

  const handleCompute = useCallback(async () => {
    if (!selectedCity || !selectedDate || !selectedTime) {
      setError('Please select city, date, and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request = {
        city: selectedCity,
        date: selectedDate,
        time: selectedTime + ':00', // Add seconds
        weekday: selectedWeekday || DateTime.fromISO(selectedDate).weekdayLong,
        divisionalChart: selectedChart
      };

      const computedResult = await computeVedicTokens(request);
      setResult(computedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedDate, selectedTime, selectedWeekday, selectedChart]);

  const handleReset = useCallback(() => {
    setSelectedCity(null);
    setSelectedDate(DateTime.now().toISODate() || '');
    setSelectedTime(DateTime.now().toFormat('HH:mm'));
    setSelectedWeekday('');
    setSelectedChart('D-1');
    setResult(null);
    setError(null);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Vedic Computation Sandbox
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Test Swiss Ephemeris-based Vedic calculations with world cities, dates, and times
      </Typography>

      {/* Swiss Ephemeris Status */}
      <Alert 
        severity={ephemerisStatus.available ? 'success' : 'warning'} 
        sx={{ mb: 3 }}
      >
        <strong>Swiss Ephemeris Status:</strong> {ephemerisStatus.message}
      </Alert>

      {/* Input Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Input Parameters
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* City Selection */}
          <Autocomplete
            options={cities}
            getOptionLabel={(option) => `${option.name}, ${option.country}`}
            value={selectedCity}
            onChange={handleCityChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select City"
                placeholder="Type to search cities..."
                fullWidth
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={`${option.name}-${option.country}`}>
                <Box>
                  <Typography variant="body1">
                    {option.name}, {option.country}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.lat.toFixed(4)}°N, {option.lon.toFixed(4)}°E • {option.tz}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="No cities found"
            loadingText="Loading cities..."
          />

          {/* Date and Time Selection */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ flex: 1, minWidth: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              label="Time"
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              sx={{ flex: 1, minWidth: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          {/* Weekday and Chart Selection */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel>Weekday</InputLabel>
              <Select
                value={selectedWeekday}
                onChange={handleWeekdayChange}
                label="Weekday"
              >
                {weekdays.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel>Divisional Chart</InputLabel>
              <Select
                value={selectedChart}
                onChange={handleChartChange}
                label="Divisional Chart"
              >
                {availableCharts.map((chart) => (
                  <MenuItem key={chart} value={chart}>
                    {chart}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCompute}
              disabled={loading || !selectedCity || !selectedDate || !selectedTime}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 150 }}
            >
              {loading ? 'Computing...' : 'Compute Tokens'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={handleReset}
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      <TokenTable 
        result={result} 
        loading={loading} 
        error={error} 
      />

      {/* Instructions */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          How to Use This Sandbox
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li><strong>Select a City:</strong> Choose from major world cities with pre-configured coordinates and timezones</li>
            <li><strong>Pick Date & Time:</strong> Select any date and time for the calculation</li>
            <li><strong>Choose Weekday:</strong> Override weekday if needed (auto-computed from date)</li>
            <li><strong>Select Chart:</strong> Choose from D-1 to D-60 divisional charts</li>
            <li><strong>Compute:</strong> Click "Compute Tokens" to generate Vedic calculations</li>
            <li><strong>Review Results:</strong> Examine planetary positions, special lagnas, and generated tokens</li>
          </ol>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> This is currently using mock calculations for demonstration. 
            Real Swiss Ephemeris integration is required for accurate astrological computations.
          </Typography>
        </Typography>
      </Paper>
    </Container>
  );
}
