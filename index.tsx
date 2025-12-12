import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './VigilHIPS/frontend/App.tsx';

console.log("VIGIL: System Boot Initiated.");

const container = document.getElementById('root');

// Failsafe: If React doesn't take over in 3 seconds, show an error.
const mountTimeout = setTimeout(() => {
  if (container && container.innerText.includes("Initializing VIGIL Platform")) {
    console.error("VIGIL FATAL: Mount timed out.");
    container.innerHTML = `
      <div style="color: #ef4444; font-family: monospace; padding: 20px; text-align: center;">
        <h3>Boot Failure</h3>
        <p>The application failed to mount within the allocated time.</p>
        <p style="font-size: 0.8rem; opacity: 0.8;">Check console for 404s on modules or syntax errors.</p>
      </div>
    `;
  }
}, 3000);

if (container) {
  try {
    const root = createRoot(container);
    // Render App
    root.render(<App />);
    console.log("VIGIL: UI Mounted Successfully.");
    
    // Clear the timeout as we successfully initiated render
    // Note: This clear doesn't guarantee render completion but indicates the root was created.
    // The innerText check in timeout handles the visual state.
  } catch (err) {
    console.error("VIGIL FATAL: Render crashed", err);
    throw err; // Re-throw to be caught by global handler
  }
} else {
  console.error("VIGIL FATAL: Root element not found in DOM.");
}