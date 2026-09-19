import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useRunStore } from './state/runStore';

if (import.meta.env.DEV) {
  (window as unknown as { __run: typeof useRunStore }).__run = useRunStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
