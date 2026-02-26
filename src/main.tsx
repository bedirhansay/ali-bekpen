import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Providers } from './app/providers';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <Providers>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--bg-card-solid)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(16px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--income)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--expense)',
              secondary: '#fff',
            },
          }
        }}
      />
    </Providers>
  </StrictMode>
);
