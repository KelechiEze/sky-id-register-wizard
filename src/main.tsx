
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css' // Restored App.css import

createRoot(document.getElementById("root")!).render(<App />);
