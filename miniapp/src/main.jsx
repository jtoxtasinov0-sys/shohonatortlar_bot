import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './store';
import { initTelegram } from './telegram';
import './index.css';

// Telegramga "tayyorman" deb darhol aytamiz — React render bo'lishini
// kutmaymiz. Telegram o'zining yuklanish ekranini shundan keyin olib
// tashlaydi, ya'ni ilova sezilarli tez ochilgandek ko'rinadi.
initTelegram();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
