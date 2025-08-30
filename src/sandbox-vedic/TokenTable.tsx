import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import type { Planet, TokenResult } from './types';
import { getPlanetDetails } from './vedicCompute';

interface TokenTableProps {
  result: TokenResult | null;
  loading?: boolean;
  error?: string | null;
}

const PLANETS: Planet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
];

export function TokenTable({ result, loading = false, error = null }: TokenTableProps) {
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Computing Vedic tokens...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a city, date, and time to compute Vedic tokens
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vedic Computation Results
      </Typography>

      {/* Input Summary */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Input Parameters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography><strong>City:</strong> {result.input.city.name}, {result.input.city.country}</Typography>
              <Typography><strong>Coordinates:</strong> {result.input.city.lat.toFixed(4)}°N, {result.input.city.lon.toFixed(4)}°E</Typography>
              <Typography><strong>Timezone:</strong> {result.input.city.tz}</Typography>
            </Box>
            <Box>
              <Typography><strong>Date/Time:</strong> {new Date(result.input.dateTime).toLocaleString()}</Typography>
              <Typography><strong>Weekday:</strong> {result.input.weekday}</Typography>
              <Typography><strong>Chart:</strong> {result.input.divisionalChart}</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Ascendant and Basic Info */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Ascendant & Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`Ascendant: ${result.ascendantSign}`} 
              color="primary" 
              size="medium" 
              sx={{ mr: 2, mb: 1 }}
            />
            <Chip 
              label={`Chart: ${result.input.divisionalChart}`} 
              color="secondary" 
              size="medium" 
              sx={{ mr: 2, mb: 1 }}
            />
            <Chip 
              label={`Computed: ${new Date(result.computedAt).toLocaleTimeString()}`} 
              color="info" 
              size="medium" 
              sx={{ mb: 1 }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Planetary Positions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Planetary Positions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Planet</strong></TableCell>
                  <TableCell><strong>Sign</strong></TableCell>
                  <TableCell><strong>Degree</strong></TableCell>
                  <TableCell><strong>House</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Longitude</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PLANETS.map(planet => {
                  const details = getPlanetDetails(planet, result);
                  if (!details) return null;
                  
                  return (
                    <TableRow key={planet}>
                      <TableCell>{details.name}</TableCell>
                      <TableCell>{details.sign}</TableCell>
                      <TableCell>{details.degree}°</TableCell>
                      <TableCell>{details.house}</TableCell>
                      <TableCell>
                        {details.isRetrograde && (
                          <Chip label="Retrograde" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{details.longitude}°</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Special Lagnas */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Special Lagnas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Lagna</strong></TableCell>
                  <TableCell><strong>Sign</strong></TableCell>
                  <TableCell><strong>Degree</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(result.specialLagnas).map(([lagna, data]) => (
                  <TableRow key={lagna}>
                    <TableCell>{lagna}</TableCell>
                    <TableCell>{data.sign}</TableCell>
                    <TableCell>{data.degree.toFixed(2)}°</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Generated Tokens */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Generated Tokens (as-K-ascSign-key format)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Token Key</strong></TableCell>
                  <TableCell><strong>Token Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(result.tokens).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={value || 'null'} 
                        color={value ? 'success' : 'default'}
                        size="small"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Debug Information */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Debug Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result, null, 2)}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
