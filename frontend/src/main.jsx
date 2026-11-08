import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

/**
 * Graceful root mounting to prevent blank white screens on deployment
 */
function mountApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("[Vitality] Root element '#root' was not found in the DOM.");
    const fallbackContainer = document.createElement('div');
    fallbackContainer.id = 'root';
    document.body.appendChild(fallbackContainer);
    return ReactDOM.createRoot(fallbackContainer);
  }

  return ReactDOM.createRoot(rootElement);
}

try {
  const root = mountApp();
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (mountErr) {
  console.error('[Vitality Fatal Mounting Error]:', mountErr);
  const el = document.getElementById('root') || document.body;
  el.innerHTML = `
    <div style="font-family: sans-serif; padding: 2rem; text-align: center; color: #333;">
      <h2>Failed to initialize Vitality</h2>
      <p style="color: #666; font-size: 0.9rem;">${mountErr.message || mountErr}</p>
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; border-radius: 8px; background: #059669; color: white; border: none; cursor: pointer;">
        Reload
      </button>
    </div>
  `;
}

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[VitaLity PWA] ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[VitaLity PWA] ServiceWorker registration failed:', error);
      });
  });
}

