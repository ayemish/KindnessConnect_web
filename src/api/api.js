// src/api/api.js

import axios from 'axios';


const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000'; 

const api = axios.create({
  baseURL: BASE_URL, 
});

export default api;