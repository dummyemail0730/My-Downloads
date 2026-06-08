import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept localStorage calls to transparently synchronize configured links and custom items with the server
const origSetItem = localStorage.setItem;
(window as any)._origSetItem = origSetItem;

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
(window as any)._origRemoveItem = origRemoveItem;

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

      const payloadToUpload: Record<string, any> = {};
      let needsUpload = false;

      for (const key of syncKeys) {
        const localValStr = localStorage.getItem(key);
        let localVal: any = null;
        try {
          if (localValStr && (localValStr.startsWith('[') || localValStr.startsWith('{'))) {
            localVal = JSON.parse(localValStr);
          }
        } catch (e) {}

        const serverVal = data[key];

        if (serverVal !== undefined && serverVal !== null) {
          const isServerEmpty = Array.isArray(serverVal) && serverVal.length === 0;
          const isLocalEmpty = !localVal || (Array.isArray(localVal) && localVal.length === 0);

          if (isServerEmpty && !isLocalEmpty) {
            // Server has no values but the browser local storage already contains custom entries.
            // Push the browser data up to populate the server config instead of erasing it.
            payloadToUpload[key] = localVal;
            needsUpload = true;
          } else {
            // Respect the server's data
            const strVal = typeof serverVal === 'string' ? serverVal : JSON.stringify(serverVal);
            origSetItem.call(localStorage, key, strVal);
          }
        } else if (localVal && (!Array.isArray(localVal) || localVal.length > 0)) {
          // Server doesn't track this key yet but local storage does. Sync it up.
          payloadToUpload[key] = localVal;
          needsUpload = true;
        }
      }

      if (needsUpload) {
        fetch('/api/configs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadToUpload)
        }).catch(err => console.error('Failed to sync local state back to server on start:', err));
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
