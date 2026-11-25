import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestoreDatabaseId =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  'ai-studio-4c46b102-5ec1-4f13-b6a7-8d1159b686ab';
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'adriangabionza1990@gmail.com';
const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export const PUBLIC_CATALOG_KEYS = [
  'admin_console_link',
  'custom_projects',
  'custom_anime',
  'custom_games',
  'shadow_master_tutorials',
  'custom_tools',
  'deleted_item_ids',
] as const;

export const PRIVATE_CONFIG_KEYS = [
  'user_suggestions',
  'user_appointments',
  'user_shout_outs',
  'user_activity_logs',
  'chatbot_passcodes',
] as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export function isFirebaseAdminUser(user: User | null = auth.currentUser): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL
  );
}

export function hasStrictAdminAuthority(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem('is_admin_mode') === 'true' &&
    isFirebaseAdminUser(auth.currentUser)
  );
}

export async function getAdminIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!isFirebaseAdminUser(user) || !user) return null;
  try {
    return await user.getIdToken();
  } catch (err) {
    console.warn('Failed to acquire Firebase Admin ID token:', err);
    return null;
  }
}

function sanitizePlainObjects(list: unknown, maxItems: number): Record<string, any>[] {
  if (!Array.isArray(list)) return [];
  const cleaned: Record<string, any>[] = [];
  for (const item of list.slice(0, maxItems)) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      try {
        // Strip undefined/functions so Firestore never rejects payloads
        const normalized = JSON.parse(JSON.stringify(item));
        if (normalized && typeof normalized === 'object' && !Array.isArray(normalized)) {
          cleaned.push(normalized);
        }
      } catch (_) {}
    }
  }
  return cleaned;
}

function sanitizeStringArray(list: unknown, maxItems: number, maxLen = 128): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, maxItems)
    .map((v) => String(v ?? '').trim().slice(0, maxLen))
    .filter(Boolean);
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  if (!user || !user.emailVerified || !user.email || !VALID_ID_REGEX.test(user.uid)) {
    return;
  }

  const profilePath = `users/${user.uid}`;
  const profileRef = doc(db, 'users', user.uid);

  let existsAlready = false;
  try {
    const snap = await getDoc(profileRef);
    existsAlready = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  const sanitizedDisplayName = (user.displayName || '').slice(0, 120);
  const sanitizedEmail = user.email.slice(0, 254);
  const sanitizedPhoto = (user.photoURL || '').slice(0, 512);

  try {
    if (existsAlready) {
      await setDoc(
        profileRef,
        {
          displayName: sanitizedDisplayName,
          email: sanitizedEmail,
          photoURL: sanitizedPhoto,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await setDoc(profileRef, {
        uid: user.uid,
        displayName: sanitizedDisplayName,
        email: sanitizedEmail,
        photoURL: sanitizedPhoto,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existsAlready ? OperationType.UPDATE : OperationType.CREATE,
      profilePath
    );
  }
}

export async function loadPublicCatalogFromFirestore(): Promise<Record<string, any> | null> {
  const catalogPath = 'portalSettings/publicCatalog';
  try {
    const snap = await getDoc(doc(db, 'portalSettings', 'publicCatalog'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        admin_console_link: typeof data.admin_console_link === 'string' ? data.admin_console_link : undefined,
        custom_projects: Array.isArray(data.custom_projects) ? data.custom_projects : undefined,
        custom_anime: Array.isArray(data.custom_anime) ? data.custom_anime : undefined,
        custom_games: Array.isArray(data.custom_games) ? data.custom_games : undefined,
        shadow_master_tutorials: Array.isArray(data.shadow_master_tutorials) ? data.shadow_master_tutorials : undefined,
        custom_tools: Array.isArray(data.custom_tools) ? data.custom_tools : undefined,
        deleted_item_ids: Array.isArray(data.deleted_item_ids) ? data.deleted_item_ids : undefined,
      };
    }

    // Legacy fallback if admin has data stored only in portalSettings/globalConfigs
    if (isFirebaseAdminUser()) {
      const legacySnap = await getDoc(doc(db, 'portalSettings', 'globalConfigs'));
      if (legacySnap.exists()) {
        const legacyData = legacySnap.data();
        return {
          admin_console_link: typeof legacyData.admin_console_link === 'string' ? legacyData.admin_console_link : undefined,
          custom_projects: Array.isArray(legacyData.custom_projects) ? legacyData.custom_projects : undefined,
          custom_anime: Array.isArray(legacyData.custom_anime) ? legacyData.custom_anime : undefined,
          custom_games: Array.isArray(legacyData.custom_games) ? legacyData.custom_games : undefined,
          shadow_master_tutorials: Array.isArray(legacyData.shadow_master_tutorials) ? legacyData.shadow_master_tutorials : undefined,
          custom_tools: Array.isArray(legacyData.custom_tools) ? legacyData.custom_tools : undefined,
          deleted_item_ids: Array.isArray(legacyData.deleted_item_ids) ? legacyData.deleted_item_ids : undefined,
        };
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, catalogPath);
  }
}

export async function syncPublicCatalogToFirestore(
  partial: Record<string, any>
): Promise<boolean> {
  const user = auth.currentUser;
  if (!hasStrictAdminAuthority() || !user || !VALID_ID_REGEX.test(user.uid)) {
    return false;
  }

  const catalogPath = 'portalSettings/publicCatalog';
  const catalogRef = doc(db, 'portalSettings', 'publicCatalog');

  let current: Record<string, any> = {};
  try {
    const existingSnap = await getDoc(catalogRef);
    if (existingSnap.exists()) {
      current = existingSnap.data() || {};
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, catalogPath);
  }

  const merged: Record<string, any> = {
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  };

  const resolveField = (key: (typeof PUBLIC_CATALOG_KEYS)[number]) => {
    if (key in partial) return partial[key];
    return current[key];
  };

  const adminLink = resolveField('admin_console_link');
  if (typeof adminLink === 'string' && adminLink.trim()) {
    merged.admin_console_link = adminLink.trim().slice(0, 512);
  } else if ('admin_console_link' in partial && partial.admin_console_link === null) {
    merged.admin_console_link = 'https://drive.google.com';
  }

  const projects = resolveField('custom_projects');
  if (Array.isArray(projects)) {
    merged.custom_projects = sanitizePlainObjects(projects, 100);
  }

  const anime = resolveField('custom_anime');
  if (Array.isArray(anime)) {
    merged.custom_anime = sanitizePlainObjects(anime, 100);
  }

  const games = resolveField('custom_games');
  if (Array.isArray(games)) {
    merged.custom_games = sanitizePlainObjects(games, 100);
  }

  const tutorials = resolveField('shadow_master_tutorials');
  if (Array.isArray(tutorials)) {
    merged.shadow_master_tutorials = sanitizePlainObjects(tutorials, 100);
  }

  const tools = resolveField('custom_tools');
  if (Array.isArray(tools)) {
    merged.custom_tools = sanitizePlainObjects(tools, 100);
  }

  const deleted = resolveField('deleted_item_ids');
  if (Array.isArray(deleted)) {
    merged.deleted_item_ids = sanitizeStringArray(deleted, 200, 128);
  }

  try {
    await setDoc(catalogRef, merged);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadow_firebase_saved', { detail: { target: 'publicCatalog' } }));
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, catalogPath);
  }
}

export async function loadPrivateGlobalConfigsFromFirestore(): Promise<Record<string, any> | null> {
  if (!isFirebaseAdminUser(auth.currentUser)) return null;
  const globalPath = 'portalSettings/globalConfigs';
  try {
    const snap = await getDoc(doc(db, 'portalSettings', 'globalConfigs'));
    if (!snap.exists()) return null;
    return snap.data() || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, globalPath);
  }
}

export async function syncPrivateGlobalConfigsToFirestore(
  partial: Record<string, any>
): Promise<boolean> {
  const user = auth.currentUser;
  if (!hasStrictAdminAuthority() || !user || !VALID_ID_REGEX.test(user.uid)) {
    return false;
  }

  const globalPath = 'portalSettings/globalConfigs';
  const globalRef = doc(db, 'portalSettings', 'globalConfigs');

  let current: Record<string, any> = {};
  try {
    const snap = await getDoc(globalRef);
    if (snap.exists()) {
      current = snap.data() || {};
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, globalPath);
  }

  const merged: Record<string, any> = {
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  };

  const resolveField = (key: string) => (key in partial ? partial[key] : current[key]);

  const adminLink = resolveField('admin_console_link');
  if (typeof adminLink === 'string' && adminLink.trim()) {
    merged.admin_console_link = adminLink.trim().slice(0, 512);
  }

  const copyObjArray = (key: string, maxItems: number) => {
    const val = resolveField(key);
    if (Array.isArray(val)) {
      merged[key] = sanitizePlainObjects(val, maxItems);
    }
  };

  copyObjArray('custom_projects', 100);
  copyObjArray('custom_anime', 100);
  copyObjArray('custom_games', 100);
  copyObjArray('shadow_master_tutorials', 100);
  copyObjArray('custom_tools', 100);
  copyObjArray('user_suggestions', 200);
  copyObjArray('user_appointments', 200);
  copyObjArray('user_shout_outs', 200);
  copyObjArray('user_activity_logs', 200);

  const deleted = resolveField('deleted_item_ids');
  if (Array.isArray(deleted)) {
    merged.deleted_item_ids = sanitizeStringArray(deleted, 200, 128);
  }

  const passcodes = resolveField('chatbot_passcodes');
  if (Array.isArray(passcodes)) {
    merged.chatbot_passcodes = sanitizeStringArray(passcodes, 100, 64);
  }

  try {
    await setDoc(globalRef, merged);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadow_firebase_saved', { detail: { target: 'globalConfigs' } }));
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, globalPath);
  }
}

export async function loadMusicLibraryFromFirestore(): Promise<{
  tracks: any[];
  playlists?: string[];
  syncedAt?: string;
} | null> {
  const libPath = 'portalSettings/musicLibrary';
  try {
    const snap = await getDoc(doc(db, 'portalSettings', 'musicLibrary'));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      tracks: Array.isArray(data.tracks) ? data.tracks : [],
      playlists: Array.isArray(data.playlists) ? data.playlists : undefined,
      syncedAt: typeof data.syncedAt === 'string' ? data.syncedAt : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, libPath);
  }
}

export async function syncMusicLibraryToFirestore(
  tracks: any[],
  playlists: string[] = ['All']
): Promise<boolean> {
  const user = auth.currentUser;
  if (!hasStrictAdminAuthority() || !user || !VALID_ID_REGEX.test(user.uid)) {
    return false;
  }

  const libPath = 'portalSettings/musicLibrary';
  const boundedTracks = tracks.slice(0, 500).map((t) => ({
    id: String(t.id || '').slice(0, 128),
    fileId: t.fileId ? String(t.fileId).slice(0, 128) : '',
    title: String(t.title || '').slice(0, 200),
    artist: String(t.artist || '').slice(0, 160),
    duration: String(t.duration || '03:45').slice(0, 32),
    quality: String(t.quality || 'MP3 [320KBPS]').slice(0, 64),
    size: String(t.size || 'Drive Audio').slice(0, 64),
    link: String(t.link || '').slice(0, 512),
    streamUrl: String(t.streamUrl || '').slice(0, 512),
    image: String(t.image || '').slice(0, 512),
    isDrive: Boolean(t.isDrive),
    playlists: Array.isArray(t.playlists)
      ? t.playlists.slice(0, 20).map((p: any) => String(p).slice(0, 80))
      : [],
    protocol: String(t.protocol || 'GDRIVE_STREAM').slice(0, 64),
  }));

  const boundedPlaylists = playlists
    .slice(0, 50)
    .map((p) => String(p).slice(0, 80));

  try {
    await setDoc(doc(db, 'portalSettings', 'musicLibrary'), {
      tracks: boundedTracks,
      playlists: boundedPlaylists,
      syncedAt: new Date().toISOString().slice(0, 64),
      totalCount: boundedTracks.length,
      updatedBy: user.uid,
      updatedAt: serverTimestamp(),
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shadow_firebase_saved', { detail: { target: 'musicLibrary' } }));
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, libPath);
  }
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (_) {
    return fallback;
  }
}

export async function flushAllLocalCatalogAndConfigsToFirestore(): Promise<boolean> {
  if (!hasStrictAdminAuthority() || typeof window === 'undefined') {
    return false;
  }

  const publicPartial: Record<string, any> = {};
  const adminLink = localStorage.getItem('admin_console_link');
  if (adminLink) publicPartial.admin_console_link = adminLink;

  const projects = safeParseJson<any[] | null>(localStorage.getItem('custom_projects'), null);
  if (Array.isArray(projects)) publicPartial.custom_projects = projects;

  const anime = safeParseJson<any[] | null>(localStorage.getItem('custom_anime'), null);
  if (Array.isArray(anime)) publicPartial.custom_anime = anime;

  const games = safeParseJson<any[] | null>(localStorage.getItem('custom_games'), null);
  if (Array.isArray(games)) publicPartial.custom_games = games;

  const tutorials = safeParseJson<any[] | null>(localStorage.getItem('shadow_master_tutorials'), null);
  if (Array.isArray(tutorials)) publicPartial.shadow_master_tutorials = tutorials;

  const tools = safeParseJson<any[] | null>(localStorage.getItem('custom_tools'), null);
  if (Array.isArray(tools)) publicPartial.custom_tools = tools;

  const deletedIds = safeParseJson<string[] | null>(localStorage.getItem('deleted_item_ids'), null);
  if (Array.isArray(deletedIds)) publicPartial.deleted_item_ids = deletedIds;

  const privatePartial: Record<string, any> = {
    ...publicPartial,
    user_suggestions: safeParseJson<any[]>(localStorage.getItem('shadow_suggestions'), []),
    user_appointments: safeParseJson<any[]>(localStorage.getItem('shadow_appointments'), []),
    user_shout_outs: safeParseJson<any[]>(localStorage.getItem('shadow_shout_outs_v3'), []),
    user_activity_logs: safeParseJson<any[]>(localStorage.getItem('shadow_user_movements'), []),
    chatbot_passcodes: safeParseJson<string[]>(localStorage.getItem('chatbot_generated_passwords'), []),
  };

  await Promise.all([
    syncPublicCatalogToFirestore(publicPartial),
    syncPrivateGlobalConfigsToFirestore(privatePartial),
  ]);

  const localTracks = safeParseJson<any[] | null>(localStorage.getItem('shadow_gdrive_tracks'), null);
  const localPlaylists = safeParseJson<string[]>(localStorage.getItem('shadow_music_playlists'), ['All']);
  if (Array.isArray(localTracks) && localTracks.length > 0 && !localTracks.every((t) => String(t?.id || '').startsWith('default-track-'))) {
    await syncMusicLibraryToFirestore(localTracks, localPlaylists).catch(() => false);
  }

  const idToken = await getAdminIdToken();
  if (idToken) {
    fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(privatePartial),
    }).catch(() => {});
  }

  return true;
}
