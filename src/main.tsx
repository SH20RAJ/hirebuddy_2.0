import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { EnvironmentValidator } from './utils/security'

// Run security validation on startup
EnvironmentValidator.logEnvironmentStatus();

createRoot(document.getElementById("root")!).render(<App />);
