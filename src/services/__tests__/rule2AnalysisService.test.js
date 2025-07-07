import { Rule2AnalysisService } from '../rule2AnalysisService';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ 
      data: [
        { date: '2024-12-31', hour_entry: 'HR1', excel_data: { 'D-1 Set-1 Matrix': {} } }
      ], 
      error: null 
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase
}));

describe('Rule2AnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractElementNumber', () => {
    test('extracts number from valid element string', () => {
      const service = new Rule2AnalysisService();
      
      expect(service.extractElementNumber('as-7/su-something')).toBe(7);
      expect(service.extractElementNumber('me-12/mo-data')).toBe(12);
      expect(service.extractElementNumber('ju-3-something')).toBe(3);
    });

    test('returns null for invalid strings', () => {
      const service = new Rule2AnalysisService();
      
      expect(service.extractElementNumber('invalid-string')).toBeNull();
      expect(service.extractElementNumber('')).toBeNull();
      expect(service.extractElementNumber(null)).toBeNull();
      expect(service.extractElementNumber(undefined)).toBeNull();
    });
  });

  describe('processSetAnalysis', () => {
    test('processes ABCD analysis correctly', () => {
      const service = new Rule2AnalysisService();
      
      const aDay = { as: 'as-1/su-data', me: 'me-2/mo-data' };
      const bDay = { as: 'as-1/su-data', me: 'me-3/mo-data' };
      const cDay = { as: 'as-1/su-data', me: 'me-4/mo-data' };
      const dDay = { as: 'as-1/su-data', me: 'me-5/mo-data' };
      
      const result = service.processSetAnalysis('D-1 Set-1 Matrix', aDay, bDay, cDay, dDay, 'HR1');
      
      expect(result).toHaveProperty('setName', 'D-1 Set-1 Matrix');
      expect(result).toHaveProperty('abcdNumbers');
      expect(result).toHaveProperty('bcdNumbers');
      expect(Array.isArray(result.abcdNumbers)).toBe(true);
      expect(Array.isArray(result.bcdNumbers)).toBe(true);
    });

    test('handles empty data gracefully', () => {
      const service = new Rule2AnalysisService();
      
      const result = service.processSetAnalysis('D-1 Set-1 Matrix', {}, {}, {}, {}, 'HR1');
      
      expect(result).toHaveProperty('setName', 'D-1 Set-1 Matrix');
      expect(result.abcdNumbers).toEqual([]);
      expect(result.bcdNumbers).toEqual([]);
    });
  });

  describe('performRule2Analysis', () => {
    test('performs complete analysis successfully', async () => {
      const service = new Rule2AnalysisService();
      
      // Mock getUserExcelData to return test data
      service.getUserExcelData = jest.fn().mockResolvedValue([
        {
          date: '2024-12-31',
          hour_entry: 'HR1',
          excel_data: {
            'D-1 Set-1 Matrix': {
              Su: 'as-1/su-data',
              Mo: 'me-2/mo-data'
            }
          }
        }
      ]);

      const result = await service.performRule2Analysis(
        'test-user',
        '2024-12-31',
        ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31']
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('hrResults');
    });

    test('handles analysis errors gracefully', async () => {
      const service = new Rule2AnalysisService();
      
      // Mock service to throw error
      service.getUserExcelData = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await service.performRule2Analysis(
        'test-user',
        '2024-12-31',
        ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31']
      );

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('ABCD/BCD Logic', () => {
    test('correctly identifies ABCD numbers (appears in 2+ of A,B,C)', () => {
      const service = new Rule2AnalysisService();
      
      // Number 1 appears in A, B, C days = ABCD
      const aDay = { as: 'as-1/su-data' };
      const bDay = { as: 'as-1/su-data' };
      const cDay = { as: 'as-1/su-data' };
      const dDay = { as: 'as-1/su-data' };
      
      const result = service.processSetAnalysis('Test Matrix', aDay, bDay, cDay, dDay, 'HR1');
      
      expect(result.abcdNumbers).toContain(1);
    });

    test('correctly identifies BCD numbers (exclusive B-D or C-D pairs)', () => {
      const service = new Rule2AnalysisService();
      
      // Number 5 appears only in B and D = BCD
      const aDay = { as: 'as-1/su-data' };
      const bDay = { as: 'as-5/su-data' };
      const cDay = { as: 'as-1/su-data' };
      const dDay = { as: 'as-5/su-data' };
      
      const result = service.processSetAnalysis('Test Matrix', aDay, bDay, cDay, dDay, 'HR1');
      
      expect(result.bcdNumbers).toContain(5);
    });

    test('ABCD takes priority over BCD (mutual exclusivity)', () => {
      const service = new Rule2AnalysisService();
      
      // Number 1 appears in A, B, C, D = ABCD (not BCD)
      const aDay = { as: 'as-1/su-data' };
      const bDay = { as: 'as-1/su-data' };
      const cDay = { as: 'as-1/su-data' };
      const dDay = { as: 'as-1/su-data' };
      
      const result = service.processSetAnalysis('Test Matrix', aDay, bDay, cDay, dDay, 'HR1');
      
      expect(result.abcdNumbers).toContain(1);
      expect(result.bcdNumbers).not.toContain(1);
    });
  });
});
