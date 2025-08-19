import { createApiClient, setApi, setEnv } from '@rumpushub/common-react';

// Set up API client
const api = createApiClient(process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080');
setApi(api);

// Set environment
setEnv(process.env.REACT_APP_ENV || 'development');

// Set default font
const initialFont = process.env.REACT_APP_DEFAULT_FONT || '"Nunito", sans-serif';
document.documentElement.style.setProperty('--primary-font', initialFont); // --primary-font set in rumpus-styles.scss
