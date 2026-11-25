import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {
  hasStrictAdminAuthority,
  getAdminIdToken,
  loadPublicCatalogFromFirestore,
  syncPublicCatalogToFirestore,
  syncPrivateGlobalConfigsToFirestore,
} from './firebase';

const PUBLIC_SYNC_KEYS = [
  'admin_console_link',
  'custom_projects',
  'custom_anime',
  'custom_games',
  'shadow_master_tutorials',
  'custom_tools',
  'deleted_item_ids',
];

// Intercept localStorage calls so verified Admin edits persist permanently to Firebase Firestore + authenticated backend
const origSetItem = localStorage.setItem;
(window as any)._origSetItem = origSetItem;

async function syncAdminMutation(patch: Record<string, any>) {
  if (!hasStrictAdminAuthority()) return;
  try {
    await Promise.all([
      syncPublicCatalogToFirestore(patch).catch((err) =>
        console.warn('Firestore public catalog sync notice:', err)
      ),
      syncPrivateGlobalConfigsToFirestore(patch).catch((err) =>
        console.warn('Firestore global config sync notice:', err)
      ),
    ]);
    const idToken = await getAdminIdToken();
    if (idToken) {
      fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(patch),
      }).catch((err) => console.error('Failed to sync configs to server:', err));
    }
  } catch (e) {
    console.warn('Admin config sync notice:', e);
  }
}

localStorage.setItem = function (key, value) {
  try {
    origSetItem.call(localStorage, key, value);
  } catch (e) {}

  if (PUBLIC_SYNC_KEYS.includes(key) && hasStrictAdminAuthority()) {
    let parsedValue: any = value;
    try {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        parsedValue = JSON.parse(value);
      }
      syncAdminMutation({ [key]: parsedValue });
    } catch (e: any) {
      console.warn('Config serialization sync notice:', e?.message || e);
    }
  }
};

const origRemoveItem = localStorage.removeItem;
(window as any)._origRemoveItem = origRemoveItem;

localStorage.removeItem = function (key) {
  origRemoveItem.call(localStorage, key);
  if (PUBLIC_SYNC_KEYS.includes(key) && hasStrictAdminAuthority()) {
    syncAdminMutation({ [key]: key === 'admin_console_link' ? 'https://drive.google.com' : [] });
  }
};

const root = createRoot(document.getElementById('root')!);

function applyAuthoritativeCatalog(data: Record<string, any> | null) {
  if (!data) return;

  if (typeof data.admin_console_link === 'string' && data.admin_console_link.trim()) {
    origSetItem.call(localStorage, 'admin_console_link', data.admin_console_link);
  }

  const deletedSet = new Set(
    (Array.isArray(data.deleted_item_ids) ? data.deleted_item_ids : []).map(String)
  );
  if (Array.isArray(data.deleted_item_ids)) {
    origSetItem.call(localStorage, 'deleted_item_ids', JSON.stringify(Array.from(deletedSet)));
  }

  const arrayKeys = [
    'custom_projects',
    'custom_anime',
    'custom_games',
    'shadow_master_tutorials',
    'custom_tools',
  ];

  for (const key of arrayKeys) {
    const serverVal = data[key];
    if (Array.isArray(serverVal)) {
      const filtered = serverVal.filter((item: any) => {
        if (!item) return false;
        const id = item.id !== undefined ? String(item.id) : String(item.name || item.title || '');
        return !id || !deletedSet.has(id);
      });
      origSetItem.call(localStorage, key, JSON.stringify(filtered));
    }
  }
}

async function bootstrapCatalog() {
  try {
    const firestoreCatalog = await loadPublicCatalogFromFirestore().catch(() => null);
    if (firestoreCatalog && Object.values(firestoreCatalog).some((v) => v !== undefined)) {
      applyAuthoritativeCatalog(firestoreCatalog);
      return;
    }

    const res = await fetch('/api/configs');
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      throw new Error('Endpoint returned non-JSON, falling back to static custom_configs.json');
    }
    const serverData = await res.json();
    applyAuthoritativeCatalog(serverData);
  } catch (err) {
    try {
      const fallbackRes = await fetch('/custom_configs.json');
      const fallbackData = await fallbackRes.json();
      applyAuthoritativeCatalog(fallbackData);
    } catch (fallbackErr) {
      console.warn('Error fetching initial catalog configs:', fallbackErr);
    }
  }
}

bootstrapCatalog().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
