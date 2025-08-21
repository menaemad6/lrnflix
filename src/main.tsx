import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCssVariables } from './utils/cssVariableInjector'
import './i18n/i18n' // Initialize i18n

// Initialize dynamic CSS variables before rendering the app
initializeCssVariables();

createRoot(document.getElementById("root")!).render(<App />);
