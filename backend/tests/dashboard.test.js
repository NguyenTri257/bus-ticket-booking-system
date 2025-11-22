const request = require('supertest');
const app = require('../app');

describe('Dashboard API', () => {
  let passengerToken;
  let adminToken;

  beforeAll(async () => {
    // Register and login as passenger
    await request(app)
      .post('/auth/register')
      .send({
        email: 'passenger2@example.com',
        phone: '+84901234568',
        password: 'SecurePass123!',
        fullName: 'Passenger User 2',
        role: 'passenger'
      });

    const passengerLogin = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'passenger2@example.com',
        password: 'SecurePass123!'
      });

    passengerToken = passengerLogin.body.data.accessToken;

    // Register and login as admin
    await request(app)
      .post('/auth/register')
      .send({
        email: 'admin2@example.com',
        phone: '+84909876544',
        password: 'SecurePass123!',
        fullName: 'Admin User 2',
        role: 'admin'
      });

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        identifier: 'admin2@example.com',
        password: 'SecurePass123!'
      });

    adminToken = adminLogin.body.data.accessToken;
  });

  it('should return dashboard summary for passenger', async () => {
    const response = await request(app)
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalBookings');
    expect(response.body.data).toHaveProperty('upcomingTrips');
    expect(response.body.data).toHaveProperty('recentActivity');
    expect(Array.isArray(response.body.data.recentActivity)).toBe(true);
  });

  it('should return dashboard activity for passenger', async () => {
    const response = await request(app)
      .get('/dashboard/activity')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    // Each activity should have type, description, timestamp
    if (response.body.data.length > 0) {
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('description');
      expect(response.body.data[0]).toHaveProperty('timestamp');
    }
  });

  it('should return dashboard stats for admin', async () => {
    const response = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalUsers');
    expect(response.body.data).toHaveProperty('totalRevenue');
    expect(response.body.data).toHaveProperty('totalBookings');
    expect(response.body.data).toHaveProperty('activeTrips');
    expect(typeof response.body.data.totalUsers).toBe('number');
    expect(typeof response.body.data.totalRevenue).toBe('number');
  });

  it('should deny passenger access to admin stats', async () => {
    const response = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_003');
  });

  it('should return 404 for invalid dashboard endpoint', async () => {
    const response = await request(app)
      .get('/dashboard/invalid')
      .set('Authorization', `Bearer ${passengerToken}`)
      .expect(404);

    // Note: 404 returns HTML, not JSON
  });
});