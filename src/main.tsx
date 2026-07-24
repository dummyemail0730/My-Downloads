import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept localStorage calls to transparently synchronize configured links and custom items with the server
const origSetItem = localStorage.setItem;
(window as any)._origSetItem = origSetItem;

localStorage.setItem = function (key, value) {
  try {
    origSetItem.call(localStorage, key, value);
  } catch (e) {}

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
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        parsedValue = JSON.parse(value);
      }
      fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [key]: parsedValue })
      }).catch(err => console.error('Failed to sync configs to server:', err));
    } catch (e) {
      console.warn('Config serialization sync notice:', e?.message || e);
    }
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
  .then(res => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Endpoint returned HTML, falling back to static custom_configs.json');
    }
    return res.json();
  })
  .catch(err => {
    console.warn('API configs endpoint not available or returned non-JSON, falling back to static custom_configs.json:', err);
    return fetch('/custom_configs.json').then(res => res.json());
  })
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

      let deletedIds: string[] = [];
      try {
        const serverDeleted = data.deleted_item_ids;
        const localDeletedStr = localStorage.getItem('deleted_item_ids');
        const localDeleted = localDeletedStr ? JSON.parse(localDeletedStr) : [];
        const combined = new Set([
          ...(Array.isArray(serverDeleted) ? serverDeleted : []),
          ...(Array.isArray(localDeleted) ? localDeleted : [])
        ]);
        deletedIds = Array.from(combined).map(String);
      } catch (e) {}

      for (const key of syncKeys) {
        if (key === 'deleted_item_ids') {
          const serverVal = data.deleted_item_ids || [];
          const localValStr = localStorage.getItem('deleted_item_ids');
          let localVal: any[] = [];
          try {
            if (localValStr && localValStr.startsWith('[')) {
              localVal = JSON.parse(localValStr);
            }
          } catch (e) {}

          const serverSet = new Set((Array.isArray(serverVal) ? serverVal : []).map(String));
          const localSet = new Set((Array.isArray(localVal) ? localVal : []).map(String));
          const mergedSet = new Set([...serverSet, ...localSet]);
          
          const mergedList = Array.from(mergedSet);
          const mergedStr = JSON.stringify(mergedList);

          origSetItem.call(localStorage, 'deleted_item_ids', mergedStr);
          payloadToUpload.deleted_item_ids = mergedList;
          if (JSON.stringify(serverVal) !== mergedStr) {
            needsUpload = true;
          }
          continue;
        }

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
            const serverList = Array.isArray(serverVal) ? serverVal : [];
            const localList = Array.isArray(localVal) ? localVal : [];

            const map = new Map();
            
            // Add server items (excluding deleted items)
            serverList.forEach((item: any) => {
              if (item) {
                const id = item.id !== undefined ? String(item.id) : String(item.name || item.title || '');
                if (id && !deletedIds.includes(id)) {
                  map.set(id, item);
                }
              }
            });

            // Add local items (excluding deleted items)
            localList.forEach((item: any) => {
              if (item) {
                const id = item.id !== undefined ? String(item.id) : String(item.name || item.title || '');
                if (id && !deletedIds.includes(id) && !map.has(id)) {
                  map.set(id, item);
                }
              }
            });

            const mergedList = Array.from(map.values());
            const mergedStr = JSON.stringify(mergedList);

            origSetItem.call(localStorage, key, mergedStr);

            if (JSON.stringify(serverVal) !== mergedStr) {
              payloadToUpload[key] = mergedList;
              needsUpload = true;
            }
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
