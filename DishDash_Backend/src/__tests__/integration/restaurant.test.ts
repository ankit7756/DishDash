import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User.model';
import { RestaurantModel } from '../../models/Restaurant.model';

describe('Restaurant Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let testRestaurantId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({
            email: { $in: ['radmin@test.com', 'ruser@test.com'] }
        });

        // Admin
        await request(app).post('/api/auth/register').send({
            username: 'radmin', email: 'radmin@test.com',
            password: 'Admin123!', fullName: 'Rest Admin', phone: '9800001001'
        });
        await UserModel.findOneAndUpdate({ email: 'radmin@test.com' }, { role: 'admin' });
        const al = await request(app).post('/api/auth/login')
            .send({ email: 'radmin@test.com', password: 'Admin123!' });
        adminToken = al.body.token;

        await request(app).post('/api/auth/register').send({
            username: 'ruser', email: 'ruser@test.com',
            password: 'User123!', fullName: 'Rest User', phone: '9800001002'
        });
        const ul = await request(app).post('/api/auth/login')
            .send({ email: 'ruser@test.com', password: 'User123!' });
        userToken = ul.body.token;

        const r = await RestaurantModel.create({
            name: 'Integration Test Restaurant',
            description: 'Used in integration tests',
            image: 'test.jpg',
            deliveryTime: '30-40 min',
            deliveryFee: 60,
            categories: ['Burgers', 'Pizza'],
            address: 'Kathmandu, Nepal',
            phone: '9800001003',
            isOpen: true,
        });
        testRestaurantId = r._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['radmin@test.com', 'ruser@test.com'] } });
        await RestaurantModel.deleteMany({ name: { $in: ['Integration Test Restaurant', 'Temp To Delete'] } });
    });

    describe('GET /api/restaurants', () => {
        test('should return open restaurants for any visitor', async () => {
            const res = await request(app).get('/api/restaurants');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should only include restaurants with isOpen:true', async () => {
            const res = await request(app).get('/api/restaurants');
            expect(res.status).toBe(200);
            res.body.data.forEach((r: any) => {
                expect(r.isOpen).toBe(true);
            });
        });
    });

    describe('GET /api/restaurants/:id', () => {
        test('should return a single restaurant by id', async () => {
            const res = await request(app)
                .get(`/api/restaurants/${testRestaurantId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(testRestaurantId);
        });

        test('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/restaurants/000000000000000000000000');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/restaurants/search', () => {
        test('should find restaurants matching query', async () => {
            const res = await request(app)
                .get('/api/restaurants/search?query=Integration');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 400 when query param is missing', async () => {
            const res = await request(app).get('/api/restaurants/search');
            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/admin/restaurants', () => {
        test('should return all restaurants with pagination as admin', async () => {
            const res = await request(app)
                .get('/api/admin/restaurants')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('pagination');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('should support page and size query params', async () => {
            const res = await request(app)
                .get('/api/admin/restaurants?page=1&size=5')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.size).toBe(5);
        });

        test('should search by name', async () => {
            const res = await request(app)
                .get('/api/admin/restaurants?search=Integration Test')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test('should return 403 for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/restaurants')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/admin/restaurants');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/admin/restaurants/:id', () => {
        test('should get restaurant by id as admin', async () => {
            const res = await request(app)
                .get(`/api/admin/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Integration Test Restaurant');
        });

        test('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/admin/restaurants/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/admin/restaurants/:id', () => {
        test('should update restaurant fields as admin', async () => {
            const res = await request(app)
                .put(`/api/admin/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('deliveryFee', '75');

            expect(res.status).toBe(200);
            expect(Number(res.body.data.deliveryFee)).toBe(75);
        });

        test('should return 404 for updating non-existent restaurant', async () => {
            const res = await request(app)
                .put('/api/admin/restaurants/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('name', 'Ghost');
            expect(res.status).toBe(404);
        });

        test('should return 403 for regular user trying to update', async () => {
            const res = await request(app)
                .put(`/api/admin/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Hack' });
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/admin/restaurants/:id', () => {
        test('should delete a restaurant as admin', async () => {
            const temp = await RestaurantModel.create({
                name: 'Temp To Delete', description: 'temp', image: 'temp.jpg',
                deliveryTime: '20 min', deliveryFee: 30, categories: ['Test'],
                address: 'Temp', phone: '9800001099', isOpen: true,
            });

            const res = await request(app)
                .delete(`/api/admin/restaurants/${temp._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('should return 404 when restaurant does not exist', async () => {
            const res = await request(app)
                .delete('/api/admin/restaurants/000000000000000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });
});