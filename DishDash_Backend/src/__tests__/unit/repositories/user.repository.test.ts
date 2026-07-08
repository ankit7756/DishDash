import mongoose from 'mongoose';
import { connectDatabaseTest } from '../../../database/mongodb';
import * as userRepo from '../../../repositories/user.repository';
import { UserModel } from '../../../models/User.model';
import bcryptjs from 'bcryptjs';

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await connectDatabaseTest();
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

const makeUserData = async (overrides: Partial<any> = {}) => {
    const ts = Date.now() + Math.random();
    return {
        fullName: 'Repo Test User',
        username: `repouser_${ts}`,
        email: `repouser_${ts}@test.com`,
        password: await bcryptjs.hash('pass123', 10),
        phone: '9800005001',
        role: 'user',
        ...overrides
    };
};

afterEach(async () => {
    await UserModel.deleteMany({ fullName: 'Repo Test User' });
});

describe('userRepo.createUser()', () => {
    test('should persist a new user and return the document', async () => {
        const data = await makeUserData();
        const user = await userRepo.createUser(data);
        expect(user._id).toBeDefined();
        expect(user.email).toBe(data.email);
    });

    test('should store the hashed password as-is', async () => {
        const data = await makeUserData();
        const user = await userRepo.createUser(data);
        expect(user.password).toMatch(/^\$2b\$/);
    });
});

describe('userRepo.getUserByEmail()', () => {
    test('should find an existing user by email', async () => {
        const data = await makeUserData();
        await userRepo.createUser(data);
        const found = await userRepo.getUserByEmail(data.email);
        expect(found).not.toBeNull();
        expect(found!.email).toBe(data.email);
    });

    test('should return null when email does not exist', async () => {
        const result = await userRepo.getUserByEmail('nobody@norepo.test');
        expect(result).toBeNull();
    });
});

describe('userRepo.getUserByUsername()', () => {
    test('should find user by username', async () => {
        const data = await makeUserData();
        await userRepo.createUser(data);
        const found = await userRepo.getUserByUsername(data.username);
        expect(found).not.toBeNull();
        expect(found!.username).toBe(data.username);
    });

    test('should return null for non-existent username', async () => {
        const result = await userRepo.getUserByUsername('ghost_xyz_999_repo');
        expect(result).toBeNull();
    });
});

describe('userRepo.getUserById()', () => {
    test('should find a user by MongoDB _id string', async () => {
        const data = await makeUserData();
        const created = await userRepo.createUser(data);
        const found = await userRepo.getUserById(created._id.toString());
        expect(found).not.toBeNull();
        expect(found!._id.toString()).toBe(created._id.toString());
    });

    test('should return null for a valid ObjectId that does not exist', async () => {
        const result = await userRepo.getUserById('000000000000000000000000');
        expect(result).toBeNull();
    });
});

describe('userRepo.updateUser()', () => {
    test('should update specified fields and return updated doc', async () => {
        const data = await makeUserData();
        const created = await userRepo.createUser(data);
        const updated = await userRepo.updateUser(created._id.toString(), { phone: '9800099999' });
        expect(updated).not.toBeNull();
        expect(updated!.phone).toBe('9800099999');
    });

    test('should return updated doc with new field value', async () => {
        const data = await makeUserData();
        const created = await userRepo.createUser(data);
        const updated = await userRepo.updateUser(created._id.toString(), { phone: '9800011111' });
        expect(updated).not.toBeNull();
        expect(updated!.phone).toBe('9800011111');
    });
});

describe('userRepo.getAllUsers()', () => {
    test('should return a users array and total count', async () => {
        await userRepo.createUser(await makeUserData());
        await userRepo.createUser(await makeUserData());
        const { users, total } = await userRepo.getAllUsers(1, 100);
        expect(Array.isArray(users)).toBe(true);
        expect(total).toBeGreaterThanOrEqual(2);
    });

    test('should filter results using the search string', async () => {
        const data = await makeUserData();
        await userRepo.createUser(data);
        const { users } = await userRepo.getAllUsers(1, 100, data.username);
        expect(users.some((u: any) => u.username === data.username)).toBe(true);
    });

    test('should paginate — page 1 and page 2 return different records', async () => {
        await userRepo.createUser(await makeUserData());
        await userRepo.createUser(await makeUserData());
        const { users: page1 } = await userRepo.getAllUsers(1, 1);
        const { users: page2 } = await userRepo.getAllUsers(2, 1);
        if (page1.length > 0 && page2.length > 0) {
            expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
        }
    });
});

describe('userRepo.deleteUser()', () => {
    test('should delete user and return true', async () => {
        const data = await makeUserData();
        const created = await userRepo.createUser(data);
        const result = await userRepo.deleteUser(created._id.toString());
        expect(result).toBe(true);
        const check = await userRepo.getUserById(created._id.toString());
        expect(check).toBeNull();
    });

    test('should return false for a non-existent user id', async () => {
        const result = await userRepo.deleteUser('000000000000000000000000');
        expect(result).toBe(false);
    });
});