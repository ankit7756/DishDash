import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';

describe('Auth Integration Tests', () => {
    const testUser = {
        username: 'testauth',
        email: 'testauth@example.com',
        password: 'Password123!',
        fullName: 'Test Auth User',
        phone: '9800000001'
    };

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user and return user data', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe(testUser.email);
            // password must never be returned
            expect(res.body.user).not.toHaveProperty('password');
        });

        test('should not register with a duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail with missing fullName (zod validation)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'nofullname',
                    email: 'nofull@example.com',
                    password: 'Password123!',
                    phone: '9800000002'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail with username shorter than 3 characters', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'short@example.com', username: 'ab' });

            expect(res.status).toBe(400);
        });

        test('should fail with password shorter than 6 characters', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'short@example.com', username: 'shortpw', password: '123' });

            expect(res.status).toBe(400);
        });

        test('should fail with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'not-an-email', username: 'validemail' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login with correct credentials and return a JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.token.split('.').length).toBe(3);
            expect(res.body.user.email).toBe(testUser.email);
        });

        test('should return 401 with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'WrongPass999!' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should return 401 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'ghost@nowhere.com', password: 'Password123!' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should return 400 when password field is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/auth/profile', () => {
        let token: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            token = res.body.token;
        });

        test('should return own profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data).not.toHaveProperty('password');
        });

        test('should return 401 without any token', async () => {
            const res = await request(app).get('/api/auth/profile');
            expect(res.status).toBe(401);
        });

        test('should return 401 with a malformed token', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer not.a.real.jwt');
            expect(res.status).toBe(401);
        });

        test('should return 401 when Authorization header has no Bearer prefix', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', token);  // no "Bearer " prefix
            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/auth/profile', () => {
        let token: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            token = res.body.token;
        });

        test('should update profile fields successfully', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .field('fullName', 'Updated Full Name')
                .field('phone', '9800099999');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe('Updated Full Name');
        });

        test('should return 401 when updating without token', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .send({ fullName: 'No Auth' });
            expect(res.status).toBe(401);
        });
    });
});