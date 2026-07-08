import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';
import { RestaurantModel } from '../../models/Restaurant.model';
import { FoodModel } from '../../models/Food.model';

describe('Food Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let testRestaurantId: string;
    let testFoodId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['fadmin@test.com', 'fuser@test.com'] } });

        // Admin
        await request(app).post('/api/auth/register').send({
            username: 'fadmin', email: 'fadmin@test.com',
            password: 'Admin123!', fullName: 'Food Admin', phone: '9800002001'
        });
        await UserModel.findOneAndUpdate({ email: 'fadmin@test.com' }, { role: 'admin' });
        const al = await request(app).post('/api/auth/login')
            .send({ email: 'fadmin@test.com', password: 'Admin123!' });
        adminToken = al.body.token;

        // Regular user
        await request(app).post('/api/auth/register').send({
            username: 'fuser', email: 'fuser@test.com',
            password: 'User123!', fullName: 'Food User', phone: '9800002002'
        });
        const ul = await request(app).post('/api/auth/login')
            .send({ email: 'fuser@test.com', password: 'User123!' });
        userToken = ul.body.token;

        // Seed restaurant
        const r = await RestaurantModel.create({
            name: 'Food Test Restaurant', description: 'Food tests',
            image: 'r.jpg', deliveryTime: '25 min', deliveryFee: 40,
            categories: ['Pizza'], address: 'Patan', phone: '9800002003', isOpen: true,
        });
        testRestaurantId = r._id.toString();

        // Seed a food item
        const f = await FoodModel.create({
            name: 'Test Pepperoni Pizza',
            description: 'Classic pepperoni pizza',
            image: 'pizza.jpg',
            restaurantId: testRestaurantId,
            category: 'Pizza',
            price: 550,
            isAvailable: true,
            isPopular: true,
        });
        testFoodId = f._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['fadmin@test.com', 'fuser@test.com'] } });
        await RestaurantModel.deleteMany({ name: 'Food Test Restaurant' });
        await FoodModel.deleteMany({ restaurantId: testRestaurantId });
    });

    describe('GET /api/foods', () => {
        test('should return all available foods', async () => {
            const res = await request(app).get('/api/foods');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/foods/popular', () => {
        test('should return popular foods', async () => {
            const res = await request(app).get('/api/foods/popular');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/foods/restaurant/:restaurantId', () => {
        test('should return foods for a specific restaurant', async () => {
            const res = await request(app)
                .get(`/api/foods/restaurant/${testRestaurantId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/foods/:id', () => {
        test('should return a single food item by id', async () => {
            const res = await request(app).get(`/api/foods/${testFoodId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Test Pepperoni Pizza');
        });

        test('should return 404 for non-existent food', async () => {
            const res = await request(app)
                .get('/api/foods/000000000000000000000000');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/admin/foods', () => {
        test('should get all foods with pagination as admin', async () => {
            const res = await request(app)
                .get('/api/admin/foods')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should filter foods by restaurantId', async () => {
            const res = await request(app)
                .get(`/api/admin/foods?restaurantId=${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test('should search foods by name', async () => {
            const res = await request(app)
                .get('/api/admin/foods?search=Pepperoni')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test('should return 403 for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/foods')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/admin/foods');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/admin/foods/:id', () => {
        test('should get a food by id as admin', async () => {
            const res = await request(app)
                .get(`/api/admin/foods/${testFoodId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Test Pepperoni Pizza');
        });

        test('should return 404 for non-existent food', async () => {
            const res = await request(app)
                .get('/api/admin/foods/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/admin/foods/:id', () => {
        test('should update food price as admin', async () => {
            const res = await request(app)
                .put(`/api/admin/foods/${testFoodId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('price', '600')
                .field('isPopular', 'true');

            expect(res.status).toBe(200);
            expect(res.body.data.price).toBe(600);
        });

        test('should return 404 for updating non-existent food', async () => {
            const res = await request(app)
                .put('/api/admin/foods/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('price', '100');
            expect(res.status).toBe(404);
        });

        test('should return 403 for regular user', async () => {
            const res = await request(app)
                .put(`/api/admin/foods/${testFoodId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ price: 100 });
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/admin/foods/:id', () => {
        test('should delete a food as admin', async () => {
            const temp = await FoodModel.create({
                name: 'Temp Delete Food', description: 'del', image: 'del.jpg',
                restaurantId: testRestaurantId, category: 'Test', price: 100,
            });

            const res = await request(app)
                .delete(`/api/admin/foods/${temp._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 for deleting non-existent food', async () => {
            const res = await request(app)
                .delete('/api/admin/foods/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });
});