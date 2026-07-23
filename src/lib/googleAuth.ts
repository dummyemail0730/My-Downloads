import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let isSigningIn = false;
const TOKEN_STORAGE_KEY = 'shadow_gdrive_access_token';

let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
})();

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {}
};

export const getAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    try {
      cachedAccessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {}
  }
  return cachedAccessToken;
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    const token = getAccessToken();
    if (user && token) {
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else if (token) {
      // User has a stored access token from previous session
      const mockUser: any = {
        displayName: 'Google Drive Account',
        email: user?.email || 'Connected'
      };
      if (onAuthSuccess) onAuthSuccess(mockUser, token);
    } else {
      setAccessToken(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google OAuth access token');
    }

    setAccessToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (e) {}
  setAccessToken(null);
};
