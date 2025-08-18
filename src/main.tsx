import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCssVariables } from './utils/cssVariableInjector'

// Initialize dynamic CSS variables before rendering the app
initializeCssVariables();

createRoot(document.getElementById("root")!).render(<App />);
