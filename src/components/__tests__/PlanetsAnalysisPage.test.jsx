import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlanetsAnalysisPage from '../PlanetsAnalysisPage';

// Mock the services
jest.mock('../../services/planetsAnalysisDataService', () => ({
  PlanetsAnalysisDataService: {
    getLatestAnalysisNumbers: jest.fn(() => Promise.resolve({
      success: true,
      data: {
        topicNumbers: {
          'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] }
        },
        timestamp: '2025-07-08T00:00:00.000Z'
      }
    })),
    getTopicNumbers: jest.fn((data, topic) => ({ abcd: [1, 2, 4, 7, 9], bcd: [5] })),
    isAbcdNumber: jest.fn((data, topic, num) => [1, 2, 4, 7, 9].includes(num)),
    isBcdNumber: jest.fn((data, topic, num) => [5].includes(num))
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PlanetsAnalysisPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // Mock localStorage data
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'current-user-info') {
        return JSON.stringify({
          userId: 'test-user',
          name: 'Test User'
        });
      }
      if (key === 'available-dates-test-user') {
        return JSON.stringify(['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31']);
      }
      return null;
    });
  });

  test('renders planets analysis page', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    expect(screen.getByText(/planets analysis/i)).toBeInTheDocument();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/select analysis date/i)).toBeInTheDocument();
    });
  });

  test('loads analysis data successfully', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    await waitFor(() => {
      // Should show success indicator when data loads
      expect(screen.getByText(/analysis loaded/i) || screen.getByText(/database active/i)).toBeInTheDocument();
    });
  });

  test('displays ABCD/BCD badges correctly', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    // Wait for component to fully load
    await waitFor(() => {
      const badges = screen.getAllByText(/ABCD|BCD/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test('handles date selection', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    await waitFor(() => {
      const dateSelect = screen.getByRole('combobox', { name: /select date/i });
      expect(dateSelect).toBeInTheDocument();
      
      fireEvent.change(dateSelect, { target: { value: '2024-12-31' } });
      expect(dateSelect.value).toBe('2024-12-31');
    });
  });

  test('handles hour selection', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    await waitFor(() => {
      // Look for hour selection elements
      const hourElements = screen.getAllByText(/HR/i);
      expect(hourElements.length).toBeGreaterThan(0);
    });
  });

  test('processes excel file upload', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    const fileInput = screen.getByLabelText(/upload excel file/i) || 
                     screen.getByText(/choose file/i).closest('input');
    
    if (fileInput) {
      const file = new File(['test content'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        // Should show processing indicator
        expect(screen.getByText(/processing/i) || screen.getByText(/loading/i)).toBeInTheDocument();
      });
    }
  });

  test('displays fallback data when service fails', async () => {
    // Mock service failure
    const { PlanetsAnalysisDataService } = require('../../services/planetsAnalysisDataService');
    PlanetsAnalysisDataService.getLatestAnalysisNumbers.mockRejectedValueOnce(new Error('Service error'));
    
    renderWithRouter(<PlanetsAnalysisPage />);
    
    await waitFor(() => {
      // Should show fallback mode indicator
      expect(screen.getByText(/fallback/i) || screen.getByText(/hardcoded/i)).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button clicked', async () => {
    renderWithRouter(<PlanetsAnalysisPage />);
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton);
      
      // Should trigger data reload
      expect(PlanetsAnalysisDataService.getLatestAnalysisNumbers).toHaveBeenCalledTimes(2);
    });
  });
});
