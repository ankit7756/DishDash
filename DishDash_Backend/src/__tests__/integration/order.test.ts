import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';
import { RestaurantModel } from '../../models/Restaurant.model';
import { OrderModel } from '../../models/Order.model';

describe('Order Integration Tests', () => {
    let userToken: string;
    let userId: string;
    let adminToken: string;
    let testRestaurantId: string;
    let pendingOrderId: string;
    let deliveredOrderId: string;

    const makeOrder = (restaurantId: string) => ({
        restaurantId,
        restaurantName: 'Order Test Restaurant',
        items: [{
            foodId: '000000000000000000000001',
            name: 'Test Burger',
            price: 250,
            quantity: 2,
            image: 'burger.jpg'
        }],
        subtotal: 500,
        deliveryFee: 50,
        totalAmount: 550,
        deliveryAddress: 'Kathmandu, Thamel',
        phone: '9800003001',
        paymentMethod: 'Cash on Delivery'
    });

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['ouser@test.com', 'oadmin@test.com'] } });

        // User
        await request(app).post('/api/auth/register').send({
            username: 'ouser', email: 'ouser@test.com',
            password: 'User123!', fullName: 'Order User', phone: '9800003001'
        });
        const ul = await request(app).post('/api/auth/login')
            .send({ email: 'ouser@test.com', password: 'User123!' });
        userToken = ul.body.token;
        userId = ul.body.user._id;

        // Admin
        await request(app).post('/api/auth/register').send({
            username: 'oadmin', email: 'oadmin@test.com',
            password: 'Admin123!', fullName: 'Order Admin', phone: '9800003002'
        });
        await UserModel.findOneAndUpdate({ email: 'oadmin@test.com' }, { role: 'admin' });
        const al = await request(app).post('/api/auth/login')
            .send({ email: 'oadmin@test.com', password: 'Admin123!' });
        adminToken = al.body.token;

        // Restaurant
        const r = await RestaurantModel.create({
            name: 'Order Test Restaurant', description: 'Orders', image: 'r.jpg',
            deliveryTime: '30 min', deliveryFee: 50, categories: ['Burgers'],
            address: 'Thamel', phone: '9800003003', isOpen: true,
        });
        testRestaurantId = r._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['ouser@test.com', 'oadmin@test.com', 'stranger@test.com'] } });
        await RestaurantModel.deleteMany({ name: 'Order Test Restaurant' });
        await OrderModel.deleteMany({ restaurantName: 'Order Test Restaurant' });
    });

    describe('POST /api/orders', () => {
        test('should place a new order and return status pending', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(makeOrder(testRestaurantId));

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('pending');
            pendingOrderId = res.body.data._id;
        });

        test('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send(makeOrder(testRestaurantId));
            expect(res.status).toBe(401);
        });

        test('should return 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ restaurantId: testRestaurantId }); // missing everything else
            expect(res.status).toBe(400);
        });

        test('should default paymentMethod to Cash on Delivery when omitted', async () => {
            const payload = { ...makeOrder(testRestaurantId) };
            delete (payload as any).paymentMethod;

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data.paymentMethod).toBe('Cash on Delivery');
        });
    });

    describe('GET /api/orders/current', () => {
        test('should return pending/preparing/out_for_delivery orders', async () => {
            const res = await request(app)
                .get('/api/orders/current')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/orders/current');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/orders/:id', () => {
        test('should get own order by id', async () => {
            const res = await request(app)
                .get(`/api/orders/${pendingOrderId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(pendingOrderId);
        });

        test('should return 404 when fetching another user\'s order', async () => {
            await request(app).post('/api/auth/register').send({
                username: 'stranger', email: 'stranger@test.com',
                password: 'Str123456!', fullName: 'Stranger', phone: '9800003099'
            });
            const sl = await request(app).post('/api/auth/login')
                .send({ email: 'stranger@test.com', password: 'Str123456!' });
            const strangerToken = sl.body.token;

            const res = await request(app)
                .get(`/api/orders/${pendingOrderId}`)
                .set('Authorization', `Bearer ${strangerToken}`);
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/orders/:id/confirm', () => {
        test('should mark order as delivered', async () => {
            const res = await request(app)
                .put(`/api/orders/${pendingOrderId}/confirm`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('delivered');
            deliveredOrderId = pendingOrderId;
        });

        test('should return 400 when confirming already delivered order', async () => {
            const res = await request(app)
                .put(`/api/orders/${deliveredOrderId}/confirm`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/orders/history', () => {
        test('should return delivered and cancelled orders only', async () => {
            const res = await request(app)
                .get('/api/orders/history')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            // All returned statuses must be delivered or cancelled
            res.body.data.forEach((o: any) => {
                expect(['delivered', 'cancelled']).toContain(o.status);
            });
        });
    });

    describe('PUT /api/orders/:id/cancel', () => {
        test('should cancel a pending order', async () => {
            const newOrder = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(makeOrder(testRestaurantId));

            const res = await request(app)
                .put(`/api/orders/${newOrder.body.data._id}/cancel`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('cancelled');
        });

        test('should return 400 when cancelling a delivered order', async () => {
            const res = await request(app)
                .put(`/api/orders/${deliveredOrderId}/cancel`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /api/admin/orders/:id/status', () => {
        test('should update order status as admin', async () => {
            const newOrder = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(makeOrder(testRestaurantId));

            const res = await request(app)
                .put(`/api/admin/orders/${newOrder.body.data._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'preparing' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('preparing');
        });

        test('should return 400 for invalid status value', async () => {
            // adminUpdateOrderStatus: if(!valid.includes(status)) return 400
            const newOrder = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(makeOrder(testRestaurantId));

            const res = await request(app)
                .put(`/api/admin/orders/${newOrder.body.data._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'flying' });

            expect(res.status).toBe(400);
        });

        test('should return 403 for regular user updating status', async () => {
            const newOrder = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(makeOrder(testRestaurantId));

            const res = await request(app)
                .put(`/api/admin/orders/${newOrder.body.data._id}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'preparing' });

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/admin/orders', () => {
        test('should return all orders with pagination as admin', async () => {
            const res = await request(app)
                .get('/api/admin/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should filter by status query param', async () => {
            const res = await request(app)
                .get('/api/admin/orders?status=pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            res.body.data.forEach((o: any) => {
                expect(o.status).toBe('pending');
            });
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/admin/orders');
            expect(res.status).toBe(401);
        });
    });
});