import { createApiClient, setApi, setNamedApi, setLoggingEnv } from '@rumpushub/common-react';
import { LOGGER } from '@rumpushub/common-react';

// ----------------------------
// Setup API Clients
// ----------------------------

// Determine if we're in production
const isProduction = process.env.REACT_APP_ENV === 'production';

// Set base URLs based on environment
const baseURL = isProduction
    ? process.env.REACT_APP_API_BASE_URL_PRODUCTION
    : process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const rumpshiftURL = isProduction
    ? process.env.REACT_APP_API_RUMPSHIFT_URL_PRODUCTION
    : process.env.REACT_APP_API_RUMPSHIFT_URL || 'http://localhost:8080';

try {
    const baseAPI = createApiClient(baseURL);
    setApi(baseAPI);

    const rumpshiftAPI = createApiClient(rumpshiftURL);
    setNamedApi('RUMPSHIFT_API', rumpshiftAPI);

    LOGGER.debug('APIs set up successfully');
} catch (err) {
    console.error('Failed to initialize API clients:', err);
    alert(
        'Failed to initialize API clients:\n' +
        (err?.message || JSON.stringify(err))
    );

    // Optionally, throw again to stop further execution
    throw err;
}


LOGGER.debug('Main API base URL:', baseURL);
LOGGER.debug('Rumpshift API base URL:', rumpshiftURL);

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
setLoggingEnv(process.env.REACT_APP_ENV || 'development');

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
