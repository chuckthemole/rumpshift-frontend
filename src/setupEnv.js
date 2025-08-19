import { createApiClient, setApi, setEnv } from '@rumpushub/common-react';

// Set up API client
const api = createApiClient(process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080');
setApi(api);

// Set environment
setEnv(process.env.REACT_APP_ENV || 'development');

// Set fonts safely for Webpack
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
