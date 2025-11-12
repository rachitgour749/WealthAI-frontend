/**
 * API endpoint functions
 */
import axiosClient from './axiosClient';

// Configuration endpoints
export const getConfig = async () => {
  const response = await axiosClient.get('/api/config');
  return response.data;
};

export const updateConfig = async (config) => {
  const response = await axiosClient.put('/api/config', config);
  return response.data;
};

// Backtest endpoints
export const runBacktest = async (request) => {
  const response = await axiosClient.post('/api/run/backtest', request);
  return response.data;
};

export const runEOD = async () => {
  const response = await axiosClient.post('/api/run/eod');
  return response.data;
};

// Data endpoints
export const getCandidates = async () => {
  const response = await axiosClient.get('/api/candidates');
  return response.data;
};

export const getPositions = async () => {
  const response = await axiosClient.get('/api/positions');
  return response.data;
};

export const getDataAvailability = async () => {
  const response = await axiosClient.get('/api/data/availability');
  return response.data;
};

export const getSymbols = async () => {
  const response = await axiosClient.get('/api/symbols');
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await axiosClient.get('/');
  return response.data;
};

