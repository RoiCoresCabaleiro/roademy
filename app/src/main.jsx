// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
//import { BrowserRouter } from 'react-router-dom';
import { HashRouter }    from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// eslint-disable-next-line react-refresh/only-export-components
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-100 text-red-800">
      <h2>Algo salió mal.</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Reintentar</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HashRouter>
        {/* <BrowserRouter> */}
        <AuthProvider>
          <App />
        </AuthProvider>
        {/* </BrowserRouter> */}
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
