
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Remove App.css import as we're using RegistrationStyles.css in App.tsx

createRoot(document.getElementById("root")!).render(<App />);
