import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';

describe('Admin Users Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let testUserId: string;

    const adminUser = {
        username: 'adminusr',
        email: 'admin@test.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        phone: '9999999999'
    };

    const regularUser = {
        username: 'regularusr',
        email: 'user@test.com',
        password: 'User123!',
        fullName: 'Regular User',
        phone: '8888888888'
    };

    beforeAll(async () => {
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, regularUser.email] }
        });

        await request(app).post('/api/auth/register').send(adminUser);
        await UserModel.findOneAndUpdate({ email: adminUser.email }, { role: 'admin' });
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = adminLogin.body.token;

        await request(app).post('/api/auth/register').send(regularUser);
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: regularUser.email, password: regularUser.password });
        userToken = userLogin.body.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, regularUser.email, 'created@test.com'] }
        });
    });

    describe('GET /api/admin/users', () => {
        test('should get all users as admin', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
        });

        test('should not get users without token', async () => {
            const res = await request(app).get('/api/admin/users');
            expect(res.status).toBe(401);
        });

        test('should not get users as regular user', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        test('should support page and size pagination', async () => {
            const res = await request(app)
                .get('/api/admin/users?page=1&size=5')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.size).toBe(5);
        });

        test('should support search by name or email', async () => {
            const res = await request(app)
                .get('/api/admin/users?search=admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/admin/users', () => {
        test('should create a new user as admin', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'createduser',
                    email: 'created@test.com',
                    password: 'Created123!',
                    fullName: 'Created User',
                    phone: '7777777777'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            testUserId = res.body.data._id;
        });

        test('should not create user as regular user', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});
            expect(res.status).toBe(403);
        });

        test('should return 403 when creating with duplicate email', async () => {
            const res = await request(app)
                .post('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'dupuser',
                    email: 'created@test.com',  // already exists
                    password: 'Created123!',
                    fullName: 'Dup User',
                    phone: '6666666666'
                });
            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        test('should get a single user by id as admin', async () => {
            const res = await request(app)
                .get(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe('created@test.com');
        });

        test('should return 500 for completely invalid id format', async () => {
            const res = await request(app)
                .get('/api/admin/users/not-a-valid-mongo-id')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(500);
        });

        test('should return 404 for valid ObjectId that does not exist', async () => {
            const res = await request(app)
                .get('/api/admin/users/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        test('should update a user as admin', async () => {
            const res = await request(app)
                .put(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ fullName: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body.data.fullName).toBe('Updated Name');
        });

        test('should not update as regular user', async () => {
            const res = await request(app)
                .put(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ fullName: 'Hacked' });
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        test('should delete a user as admin', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 when deleting already deleted user', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        test('should return 401 when deleting without token', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${testUserId}`);
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/admin/stats', () => {
        test('should return platform-wide stats as admin', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalUsers');
            expect(res.body.data).toHaveProperty('totalRestaurants');
            expect(res.body.data).toHaveProperty('totalFoods');
            expect(res.body.data).toHaveProperty('totalOrders');
            expect(res.body.data).toHaveProperty('ordersThisMonth');
            expect(res.body.data).toHaveProperty('revenueThisMonth');
            expect(res.body.data).toHaveProperty('recentOrders');
        });

        test('should return 401 for stats without token', async () => {
            const res = await request(app).get('/api/admin/stats');
            expect(res.status).toBe(401);
        });

        test('should return 403 for stats as regular user', async () => {
            const res = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });
    });
});