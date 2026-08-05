import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { ErrorBoundary as AppErrorBoundary } from './components/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';
import { initAnalytics } from './lib/analytics';
import './lib/i18n';
import './index.css';

initMonitoring();
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
