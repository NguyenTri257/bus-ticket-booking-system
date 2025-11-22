const request = require('supertest');
const app = require('../app');

describe('Authentication API', () => {
  let accessToken;
  let refreshToken;

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        phone: '+84901234567',
        password: 'SecurePass123!',
        fullName: 'Test User',
        role: 'passenger'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('userId');
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.role).toBe('passenger');
  });

  it('should fail registration with invalid email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        phone: '+84901234567',
        password: 'SecurePass123!',
        fullName: 'Test User'
      })
      .expect(422);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VAL_001');
  });

  it('should fail registration with existing email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        phone: '+84907654321',
        password: 'SecurePass123!',
        fullName: 'Another User'
      })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('USER_002');
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'test@example.com',
        password: 'SecurePass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user.role).toBe('passenger');

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'test@example.com',
        password: 'WrongPass123!'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_001');
  });

  it('should refresh access token', async () => {
    const oldAccessToken = accessToken;
    const response = await request(app)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${oldAccessToken}`)
      .send({
        refreshToken
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data.expiresIn).toBe(3600);
    
    // Update the access token for subsequent tests
    accessToken = response.body.data.accessToken;

    // Verify old access token is blacklisted
    const dashboardResponse = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${oldAccessToken}`)
      .expect(401);

    expect(dashboardResponse.body.success).toBe(false);
    expect(dashboardResponse.body.error.code).toBe('AUTH_004');
  });

  it('should logout successfully', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logged out successfully');
  });

  it('should return health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is healthy');
  });
});