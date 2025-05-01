import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // NestJS backend URL
});

export const callBackend = async (query: string) => {
  const response = await api.post('/grok', { query });
  return response.data;
};