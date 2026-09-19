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

/**
 * Authenticates user credentials against the backend auth service,
 * with graceful fallback to the requested demo credentials:
 * - Email: user@example.com
 * - Password: password123
 */
export async function authenticateUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    const res = await fetch('/api/auth/login', {
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
      // Respect exact backend message or map fields
      const msg = data.message || data.error || 'Authentication failed';
      const isEmailIssue =
        data.field === 'email' ||
        msg.toLowerCase().includes('email') ||
        (cleanEmail !== DEMO_CREDENTIALS.email);

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
    // Otherwise it was a network failure, fall back to demo credential check below
  }

  // 2. Local Demo / Mock Credential Check
  if (cleanEmail !== DEMO_CREDENTIALS.email) {
    const err = new Error('Email invalid');
    err.field = 'email';
    throw err;
  }

  if (cleanPassword !== DEMO_CREDENTIALS.password) {
    const err = new Error('Incorrect password');
    err.field = 'password';
    throw err;
  }

  const mockToken = 'jwt_mock_token_' + Date.now();
  const mockUser = {
    id: 'user_1',
    name: 'Demo User',
    email: DEMO_CREDENTIALS.email,
    role: 'user',
  };

  localStorage.setItem(AUTH_STORAGE_KEY, mockToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

  return { success: true, token: mockToken, user: mockUser };
}
