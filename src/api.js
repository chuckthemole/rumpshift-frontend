import axios from 'axios';

// Determine environment
const isProduction = process.env.REACT_APP_ENV === 'production'; // else is development

// Select base URL based on environment
const baseURL = isProduction
    ? process.env.REACT_APP_API_BASE_URL_PRODUCTION
    : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

console.log('Using API base URL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
