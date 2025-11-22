const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

describe('Authorization Middleware', () => {
  let passengerToken;
  let adminToken;

  beforeAll(async () => {
    // Register and login as passenger
    await request(app)
      .post('/auth/register')
      .send({
        email: 'passenger@example.com',
        phone: '+84901234567',
        password: 'SecurePass123!',
        fullName: 'Passenger User',
        role: 'passenger'
      });

    const passengerLogin = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'passenger@example.com',
        password: 'SecurePass123!'
      });

    passengerToken = passengerLogin.body.data.accessToken;

    // Register and login as admin
    await request(app)
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        phone: '+84909876543',
        password: 'SecurePass123!',
        fullName: 'Admin User',
        role: 'admin'
      });

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'admin@example.com',
        password: 'SecurePass123!'
      });

    adminToken = adminLogin.body.data.accessToken;
  });

  it('should allow passenger to access passenger dashboard', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalBookings');
    expect(response.body.data).toHaveProperty('upcomingTrips');
  });

  it('should allow admin to access admin dashboard', async () => {
    const response = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalUsers');
    expect(response.body.data).toHaveProperty('totalRevenue');
  });

  it('should deny passenger access to admin-only endpoint', async () => {
    const response = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_003');
  });

  it('should deny access without token', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_001');
  });

  it('should deny access with invalid token', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_002');
  });

  it('should deny access with expired token', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { userId: 1, email: 'test@example.com', role: 'passenger' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_002');
  });
});