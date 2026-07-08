import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';
import { RestaurantModel } from '../../models/Restaurant.model';
import { OrderModel } from '../../models/Order.model';
import { ReviewModel } from '../../models/Review.model';

describe('Review Integration Tests', () => {
    let userToken: string;
    let adminToken: string;
    let userId: string;
    let testRestaurantId: string;
    let deliveredOrderId: string;
    let pendingOrderId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['rvuser@test.com', 'rvadmin@test.com'] } });

        // User
        await request(app).post('/api/auth/register').send({
            username: 'rvuser', email: 'rvuser@test.com',
            password: 'User123!', fullName: 'Review User', phone: '9800004001'
        });
        const ul = await request(app).post('/api/auth/login')
            .send({ email: 'rvuser@test.com', password: 'User123!' });
        userToken = ul.body.token;
        userId = ul.body.user._id;

        // Admin
        await request(app).post('/api/auth/register').send({
            username: 'rvadmin', email: 'rvadmin@test.com',
            password: 'Admin123!', fullName: 'Review Admin', phone: '9800004002'
        });
        await UserModel.findOneAndUpdate({ email: 'rvadmin@test.com' }, { role: 'admin' });
        const al = await request(app).post('/api/auth/login')
            .send({ email: 'rvadmin@test.com', password: 'Admin123!' });
        adminToken = al.body.token;

        // Restaurant
        const r = await RestaurantModel.create({
            name: 'Review Test Restaurant', description: 'Reviews', image: 'r.jpg',
            deliveryTime: '30 min', deliveryFee: 50, categories: ['Pizza'],
            address: 'Lalitpur', phone: '9800004003', isOpen: true,
        });
        testRestaurantId = r._id.toString();

        // Seed delivered and pending orders directly
        const base = {
            userId, restaurantId: testRestaurantId,
            restaurantName: 'Review Test Restaurant',
            items: [{ foodId: '000000000000000000000001', name: 'Pizza', price: 350, quantity: 1, image: 'p.jpg' }],
            subtotal: 350, deliveryFee: 50, totalAmount: 400,
            deliveryAddress: 'Lalitpur', phone: '9800004001',
            paymentMethod: 'Cash on Delivery',
        };
        const d = await OrderModel.create({ ...base, status: 'delivered' });
        deliveredOrderId = d._id.toString();

        const p = await OrderModel.create({ ...base, status: 'pending' });
        pendingOrderId = p._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['rvuser@test.com', 'rvadmin@test.com'] } });
        await RestaurantModel.deleteMany({ name: 'Review Test Restaurant' });
        await OrderModel.deleteMany({ restaurantName: 'Review Test Restaurant' });
        await ReviewModel.deleteMany({ restaurantName: 'Review Test Restaurant' });
    });

    describe('POST /api/reviews/order/:orderId', () => {
        test('should submit a review for a delivered order', async () => {
            const res = await request(app)
                .post(`/api/reviews/order/${deliveredOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ stars: 5, message: 'Excellent food, delivered hot and fresh!' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.stars).toBe(5);
        });

        test('should not allow reviewing the same order twice', async () => {
            const res = await request(app)
                .post(`/api/reviews/order/${deliveredOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ stars: 4, message: 'Second review attempt' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should not allow reviewing a non-delivered order', async () => {
            const res = await request(app)
                .post(`/api/reviews/order/${pendingOrderId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ stars: 3, message: 'Premature review' });

            expect(res.status).toBe(400);
        });

        test('should return 401 without authentication', async () => {
            const res = await request(app)
                .post(`/api/reviews/order/${deliveredOrderId}`)
                .send({ stars: 3 });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/reviews/my', () => {
        test('should return all reviews submitted by current user', async () => {
            const res = await request(app)
                .get('/api/reviews/my')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/reviews/my');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/reviews/order/:orderId', () => {
        test('should return the review for a specific order', async () => {
            const res = await request(app)
                .get(`/api/reviews/order/${deliveredOrderId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/admin/reviews', () => {
        test('should return all reviews with pagination as admin', async () => {
            const res = await request(app)
                .get('/api/admin/reviews')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should support page and size query params', async () => {
            const res = await request(app)
                .get('/api/admin/reviews?page=1&size=5')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(1);
        });

        test('should return 403 for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/reviews')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/admin/reviews');
            expect(res.status).toBe(401);
        });
    });
});