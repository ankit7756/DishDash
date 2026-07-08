import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
        verify: jest.fn(),
    }),
}));

describe('Password Reset Integration Tests', () => {
    const testUser = {
        username: 'resetpwuser',
        email: 'resetpw@test.com',
        password: 'Password123!',
        fullName: 'Reset PW User',
        phone: '9800000050'
    };

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await request(app).post('/api/auth/register').send(testUser);
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/request-password-reset', () => {
        test('should return 200 for a registered email', async () => {
            const res = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: testUser.email });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 for an unregistered email', async () => {
            const res = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: 'ghost@nowhere.com' });
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('should return error when email field is missing', async () => {
            const res = await request(app)
                .post('/api/auth/request-password-reset')
                .send({});

            expect([400, 404]).toContain(res.status);
        });
    });

    describe('POST /api/auth/reset-password/:token', () => {
        test('should reset password with a valid signed JWT', async () => {
            const jwt = require('jsonwebtoken');
            const user = await UserModel.findOne({ email: testUser.email });
            const token = jwt.sign(
                { id: user!._id },
                process.env.JWT_SECRET || 'foodify_secret_key',
                { expiresIn: '1h' }
            );

            const res = await request(app)
                .post(`/api/auth/reset-password/${token}`)
                .send({ newPassword: 'NewPassword123!' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 400 for an invalid token string', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password/this-is-not-a-jwt')
                .send({ newPassword: 'NewPassword123!' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should return 400 for an expired token', async () => {
            const jwt = require('jsonwebtoken');
            const expired = jwt.sign(
                { id: 'someid' },
                process.env.JWT_SECRET || 'foodify_secret_key',
                { expiresIn: '-1s' }
            );

            const res = await request(app)
                .post(`/api/auth/reset-password/${expired}`)
                .send({ newPassword: 'NewPassword123!' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/reset-password-direct', () => {
        test('should reset password directly with valid email', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password-direct')
                .send({ email: testUser.email, newPassword: 'DirectNew123!' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 for an unknown email', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password-direct')
                .send({ email: 'unknown@test.com', newPassword: 'DirectNew123!' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('should return 400 when newPassword is shorter than 6 chars', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password-direct')
                .send({ email: testUser.email, newPassword: '123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should return 400 when newPassword field is missing', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password-direct')
                .send({ email: testUser.email });

            expect(res.status).toBe(400);
        });
    });
});