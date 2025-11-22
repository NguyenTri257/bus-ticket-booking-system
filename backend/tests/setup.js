const { Pool } = require('pg');

// Mock the pg Pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

mockPool.query
  .mockImplementation((query, params) => {
    if (query.includes('INSERT INTO users')) {
      return Promise.resolve({ rows: [{ user_id: 1, email: params[0], phone: params[1], full_name: params[3], role: params[4] || 'passenger', created_at: new Date() }] });
    }
    if (query.includes('SELECT * FROM users WHERE email')) {
      // For login tests, return a user
      if (params && (params[0] === 'test@example.com' || params[0] === 'passenger@example.com' || params[0] === 'passenger2@example.com' || params[0] === 'admin@example.com' || params[0] === 'admin2@example.com')) {
        return Promise.resolve({ rows: [{ user_id: 1, email: params[0], password_hash: 'hashedPassword', role: params[0].includes('admin') ? 'admin' : 'passenger', full_name: 'Test User' }] });
      }
      if (params && params[0] === 'existing@example.com') {
        return Promise.resolve({ rows: [{ user_id: 1, email: 'existing@example.com', password_hash: 'hashed', role: 'passenger' }] });
      }
      return Promise.resolve({ rows: [] });
    }
    if (query.includes('SELECT * FROM users WHERE id') || query.includes('SELECT user_id')) {
      return Promise.resolve({ rows: [{ user_id: 1, email: 'test@example.com', role: 'passenger' }] });
    }
    return Promise.resolve({ rows: [] });
  });

jest.mock('pg', () => {
  return { Pool: jest.fn(() => mockPool) };
});

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  })),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn((password, hash) => Promise.resolve(password === 'SecurePass123!')),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mockToken'),
  verify: jest.fn(() => ({ userId: 1, email: 'test@example.com', role: 'passenger' })),
}));

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: jest.fn(() => Promise.resolve({
      getPayload: () => ({
        sub: 'googleId',
        email: 'google@example.com',
        name: 'Google User',
      }),
    })),
  })),
}));

// Mock userRepository
const mockRegisteredUsers = new Set(['existing@example.com']);

jest.mock('../src/repositories/userRepository', () => ({
  create: jest.fn((userData) => {
    mockRegisteredUsers.add(userData.email);
    return Promise.resolve({
      user_id: 1,
      email: userData.email,
      phone: userData.phone,
      full_name: userData.fullName,
      role: userData.role,
      created_at: new Date()
    });
  }),
  findByEmail: jest.fn((email) => {
    if (mockRegisteredUsers.has(email)) {
      return Promise.resolve({
        user_id: 1,
        email,
        password_hash: 'hashedPassword',
        role: email.includes('admin') ? 'admin' : 'passenger',
        full_name: 'Test User'
      });
    }
    return Promise.resolve(null);
  }),
  findByPhone: jest.fn(() => Promise.resolve(null)),
  findById: jest.fn(() => Promise.resolve({
    user_id: 1,
    email: 'test@example.com',
    role: 'passenger'
  })),
  findByGoogleId: jest.fn(() => Promise.resolve(null)),
  updateGoogleId: jest.fn(() => Promise.resolve({})),
}));

// Mock authService
const mockBlacklistedTokens = new Set();

jest.mock('../src/services/authService', () => ({
  generateAccessToken: jest.fn((payload) => `token_${payload.role}_${Date.now()}`),
  generateRefreshToken: jest.fn(() => 'mockRefreshToken'),
  verifyAccessToken: jest.fn((token) => {
    if (token && token.includes('token_')) {
      const role = token.includes('admin') ? 'admin' : 'passenger';
      return { userId: 1, email: 'test@example.com', role, exp: Math.floor(Date.now() / 1000) + 3600 };
    }
    if (token && token.includes('eyJ')) {
      return { userId: 1, email: 'test@example.com', role: 'passenger', exp: Math.floor(Date.now() / 1000) + 3600 };
    }
    return null;
  }),
  verifyRefreshToken: jest.fn(() => ({ userId: 1, role: 'passenger' })),
  storeRefreshToken: jest.fn(() => Promise.resolve()),
  getRefreshToken: jest.fn(() => Promise.resolve('mockRefreshToken')),
  deleteRefreshToken: jest.fn(() => Promise.resolve()),
  blacklistAccessToken: jest.fn((token) => {
    mockBlacklistedTokens.add(token);
    return Promise.resolve();
  }),
  isTokenBlacklisted: jest.fn((token) => Promise.resolve(mockBlacklistedTokens.has(token))),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';