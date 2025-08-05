// frontend/src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

// IMPORTANT: We no longer set the token globally here.
// It will be handled on a per-request basis by our server actions.

export default apiClient;