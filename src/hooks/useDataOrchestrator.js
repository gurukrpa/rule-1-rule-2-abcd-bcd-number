import { useState, useEffect } from 'react';
import { DataOrchestrator } from '../services/DataOrchestrator';

export function useDataOrchestrator(userId) {
  const [orchestrator, setOrchestrator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    user: null,
    hrData: [],
    dates: {},
    houseNumbers: {},
    totalPages: 1
  });

  useEffect(() => {
    const initializeOrchestrator = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const newOrchestrator = new DataOrchestrator(userId);
        const initialData = await newOrchestrator.initialize();
        
        console.log('Initialized data:', initialData); // Debugging log
        setOrchestrator(newOrchestrator);
        setData(initialData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      initializeOrchestrator();
    }
  }, [userId]);

  const addNewDate = async (newDate) => {
    try {
      if (!orchestrator) throw new Error('Orchestrator not initialized');
      
      const { dates, totalPages } = await orchestrator.addNewDate(newDate);
      setData(prev => ({ ...prev, dates, totalPages }));
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const saveData = async (dates, formData) => {
    try {
      if (!orchestrator) throw new Error('Orchestrator not initialized');
      
      const { hrData, houseNumbers } = await orchestrator.saveData(dates, formData, data.user);
      setData(prev => ({ ...prev, hrData, houseNumbers }));
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const getCurrentPageDates = (currentPage) => {
    return orchestrator?.getCurrentPageDates(currentPage) || {};
  };

  const getExistingDates = () => {
    return orchestrator?.getExistingDates() || [];
  };

  return {
    loading,
    error,
    data,
    addNewDate,
    saveData,
    getCurrentPageDates,
    getExistingDates
  };
}