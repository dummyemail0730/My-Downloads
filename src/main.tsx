import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept localStorage calls to transparently synchronize configured links and custom items with the server
const origSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  origSetItem.call(localStorage, key, value);
  const syncKeys = [
    'admin_console_link',
    'custom_projects',
    'custom_anime',
    'custom_games',
    'shadow_master_tutorials',
    'custom_tools',
    'deleted_item_ids'
  ];
  if (syncKeys.includes(key)) {
    let parsedValue = value;
    try {
      if (value && (value.startsWith('[') || value.startsWith('{'))) {
        parsedValue = JSON.parse(value);
      }
    } catch (e) {}

    fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ [key]: parsedValue })
    }).catch(err => console.error('Failed to sync configs to server:', err));
  }
};

const origRemoveItem = localStorage.removeItem;
localStorage.removeItem = function (key) {
  origRemoveItem.call(localStorage, key);
  const syncKeys = [
    'admin_console_link',
    'custom_projects',
    'custom_anime',
    'custom_games',
    'shadow_master_tutorials',
    'custom_tools',
    'deleted_item_ids'
  ];
  if (syncKeys.includes(key)) {
    fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ [key]: null })
    }).catch(err => console.error('Failed to sync removal to server:', err));
  }
};

const root = createRoot(document.getElementById('root')!);

// Fetch latest server configurations first so all React components initialize with correct shared values outside of AI Studio
fetch('/api/configs')
  .then(res => res.json())
  .then(data => {
    if (data) {
      if (data.admin_console_link) {
        origSetItem.call(localStorage, 'admin_console_link', data.admin_console_link);
      }
      const syncKeys = [
        'custom_projects',
        'custom_anime',
        'custom_games',
        'shadow_master_tutorials',
        'custom_tools',
        'deleted_item_ids'
      ];
      for (const key of syncKeys) {
        if (data[key] !== undefined && data[key] !== null) {
          const strVal = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
          origSetItem.call(localStorage, key, strVal);
        }
      }
    }
  })
  .catch(err => console.error('Error fetching server configs on bootstrap:', err))
  .finally(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
