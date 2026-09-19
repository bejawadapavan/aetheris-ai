import { getBackendUrl } from './api.js';

const AUTH_STORAGE_KEY = 'aetheris_auth_token';
const USER_STORAGE_KEY = 'aetheris_user';

// Standard demo credentials for mock / offline fallback
export const DEMO_CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123',
};

export function getStoredToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY) || '';
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function isUserAuthenticated() {
  return Boolean(getStoredToken());
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

const LOCAL_ACCOUNTS_KEY = 'aetheris_local_accounts';

function getLocalAccounts() {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAccounts(accounts) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

/**
 * Authenticates user credentials against the backend auth service,
 * supporting both personal email addresses and the standard demo credentials:
 * - Email: user@example.com
 * - Password: password123
 */
export async function authenticateUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Basic email pattern check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    const err = new Error('Email invalid');
    err.field = 'email';
    throw err;
  }

  if (!cleanPassword) {
    const err = new Error('Incorrect password');
    err.field = 'password';
    throw err;
  }

  // 1. Try backend authentication if reachable
  try {
    const base = getBackendUrl();
    const loginUrl = base.endsWith('/api') ? `${base}/auth/login` : `${base}/api/auth/login`;
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      return { success: true, token: data.token, user: data.user };
    }

    if (res.status === 401 || res.status === 400) {
      const msg = data.message || data.error || 'Authentication failed';
      const isEmailIssue =
        data.field === 'email' || msg.toLowerCase().includes('email');

      const err = new Error(
        isEmailIssue ? 'Email invalid' : 'Incorrect password'
      );
      err.field = isEmailIssue ? 'email' : 'password';
      throw err;
    }
  } catch (netErr) {
    // If it was an intentional credential error thrown above, re-throw it
    if (netErr.field) {
      throw netErr;
    }
    // Otherwise it was a network failure, proceed to local fallback below
  }

  // 2. Local Fallback (offline mode / client-only deployment)
  if (cleanEmail === DEMO_CREDENTIALS.email) {
    if (cleanPassword !== DEMO_CREDENTIALS.password) {
      const err = new Error('Incorrect password');
      err.field = 'password';
      throw err;
    }
  } else {
    // Personal email account check in local storage
    const accounts = getLocalAccounts();
    if (accounts[cleanEmail]) {
      if (accounts[cleanEmail].password !== cleanPassword) {
        const err = new Error('Incorrect password');
        err.field = 'password';
        throw err;
      }
    } else {
      // Auto-save new personal account
      accounts[cleanEmail] = {
        password: cleanPassword,
        name: cleanEmail.split('@')[0],
      };
      saveLocalAccounts(accounts);
    }
  }

  const rawName = cleanEmail.split('@')[0];
  const displayName =
    cleanEmail === DEMO_CREDENTIALS.email
      ? 'Demo User'
      : rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const mockToken = 'jwt_' + btoa(cleanEmail) + '_' + Date.now();
  const mockUser = {
    id: 'user_' + Date.now(),
    name: displayName,
    email: cleanEmail,
    role: 'user',
  };

  localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

  return { success: true, token: mockToken, user: mockUser };
}
