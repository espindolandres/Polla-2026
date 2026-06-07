import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Recupera rutas redirigidas por public/404.html en GitHub Pages.
(function restoreGithubPagesRoute(location) {
  if (location.search.startsWith('?/')) {
    const decodedPath = location.search
      .slice(1)
      .split('&')
      .map((segment) => segment.replace(/~and~/g, '&'))
      .join('?');
    window.history.replaceState(null, null, location.pathname.replace(/\/$/, '') + decodedPath + location.hash);
  }
})(window.location);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
