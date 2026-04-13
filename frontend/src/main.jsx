import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LocaleProvider } from './hooks/useLocale'
import ErrorBoundary from './components/ErrorBoundary.jsx'


createRoot(document.getElementById("root")).render(
  <LocaleProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </LocaleProvider>
);
