import { createApiClient, setApi, setNamedApi, setEnv } from '@rumpushub/common-react';

// ----------------------------
// Setup API Clients
// ----------------------------

// MAIN API (backward compatible)
const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const baseAPI = createApiClient(baseURL);
setApi(baseAPI);

// Rumpshift API (named API)
const rumpshiftURL = process.env.REACT_APP_API_RUMPSHIFT_URL || 'http://localhost:8080';
const rumpshiftAPI = createApiClient(rumpshiftURL);
setNamedApi('RUMPSHIFT_API', rumpshiftAPI);

/**
 * NOTE:
 * If you add a new API URL here, you MUST also define it in your webpack.config.js
 * using webpack.DefinePlugin so that process.env variables are available at build time.
 * Example in webpack.config.js:
 * 
 * new webpack.DefinePlugin({
 *   'process.env.REACT_APP_API_MY_NEW_URL': JSON.stringify(process.env.REACT_APP_API_MY_NEW_URL || 'http://localhost:XXXX')
 * })
 */

// ----------------------------
// Set environment
// ----------------------------
setEnv(process.env.REACT_APP_ENV || 'development');

// ----------------------------
// Set fonts safely for Webpack
// ----------------------------
document.documentElement.style.setProperty(
    '--primary-font',
    process.env.REACT_APP_DEFAULT_FONT || '"Nunito", sans-serif'
);

document.documentElement.style.setProperty(
    '--secondary-font',
    process.env.REACT_APP_SECONDARY_FONT || '"Roboto", sans-serif'
);

document.documentElement.style.setProperty(
    '--backup-primary-font',
    process.env.REACT_APP_BACKUP_PRIMARY_FONT || 'Arial, sans-serif'
);

document.documentElement.style.setProperty(
    '--backup-secondary-font',
    process.env.REACT_APP_BACKUP_SECONDARY_FONT || 'sans-serif'
);
