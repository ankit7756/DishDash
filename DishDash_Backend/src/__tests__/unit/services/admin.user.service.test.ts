jest.mock('../../../repositories/user.repository');

import { AdminUserService } from '../../../services/admin/user.service';
import * as userRepo from '../../../repositories/user.repository';

const mockedRepo = userRepo as jest.Mocked<typeof userRepo>;

describe('AdminUserService Unit Tests', () => {
    let service: AdminUserService;

    beforeEach(() => {
        service = new AdminUserService();
        jest.clearAllMocks();
    });


    describe('createUser()', () => {
        const userData = {
            fullName: 'New User',
            username: 'newuser',
            email: 'newuser@test.com',
            password: 'Password123!',
            phone: '9800000001'
        };

        test('should create and return a new user', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.getUserByUsername.mockResolvedValue(null);
            mockedRepo.createUser.mockResolvedValue({ _id: 'u1', ...userData } as any);

            const result = await service.createUser({ ...userData });

            expect(result).toBeDefined();
            expect(mockedRepo.createUser).toHaveBeenCalledTimes(1);
        });

        test('should throw HttpError 403 when email is already in use', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue({ _id: 'existing' } as any);

            await expect(service.createUser(userData))
                .rejects
                .toMatchObject({ statusCode: 403, message: 'Email already in use' });
        });

        test('should throw HttpError 403 when username is already taken', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.getUserByUsername.mockResolvedValue({ _id: 'taken' } as any);

            await expect(service.createUser(userData))
                .rejects
                .toMatchObject({ statusCode: 403, message: 'Username already in use' });
        });

        test('should hash the password before storing', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.getUserByUsername.mockResolvedValue(null);
            mockedRepo.createUser.mockResolvedValue({ _id: 'u1', ...userData } as any);

            await service.createUser({ ...userData });

            const storedPassword = mockedRepo.createUser.mock.calls[0][0].password;
            expect(storedPassword).not.toBe(userData.password);
            expect(storedPassword).toMatch(/^\$2b\$/);
        });
    });


    describe('getAllUsers()', () => {
        test('should return users array and pagination metadata', async () => {
            mockedRepo.getAllUsers.mockResolvedValue({
                users: [{ _id: 'u1', email: 'a@b.com' }] as any,
                total: 1
            });

            const result = await service.getAllUsers('1', '10');

            expect(result.users.length).toBe(1);
            expect(result.pagination).toMatchObject({
                page: 1, size: 10, totalItems: 1, totalPages: 1
            });
        });

        test('should default to page=1 and size=10 when not provided', async () => {
            mockedRepo.getAllUsers.mockResolvedValue({ users: [], total: 0 });

            const result = await service.getAllUsers();

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.size).toBe(10);
        });

        test('should pass search string through to repository', async () => {
            mockedRepo.getAllUsers.mockResolvedValue({ users: [], total: 0 });

            await service.getAllUsers('1', '10', 'john');

            expect(mockedRepo.getAllUsers).toHaveBeenCalledWith(1, 10, 'john');
        });

        test('should calculate totalPages correctly using Math.ceil', async () => {
            // 25 items / 10 per page = ceil(2.5) = 3
            mockedRepo.getAllUsers.mockResolvedValue({ users: [] as any, total: 25 });

            const result = await service.getAllUsers('1', '10');
            expect(result.pagination.totalPages).toBe(3);
        });
    });


    describe('getUserById()', () => {
        test('should return user when found', async () => {
            mockedRepo.getUserById.mockResolvedValue({ _id: 'u1', email: 'a@b.com' } as any);

            const result = await service.getUserById('u1');
            expect(result).toMatchObject({ email: 'a@b.com' });
        });

        test('should throw HttpError 404 when user does not exist', async () => {
            mockedRepo.getUserById.mockResolvedValue(null);

            await expect(service.getUserById('nonexistent'))
                .rejects
                .toMatchObject({ statusCode: 404, message: 'User not found' });
        });
    });


    describe('updateUser()', () => {
        test('should update and return the updated user', async () => {
            mockedRepo.getUserById.mockResolvedValue({ _id: 'u1' } as any);
            mockedRepo.updateUser.mockResolvedValue({ _id: 'u1', fullName: 'Updated' } as any);

            const result = await service.updateUser('u1', { fullName: 'Updated' });
            expect(result).toMatchObject({ fullName: 'Updated' });
        });

        test('should throw HttpError 404 if user not found before updating', async () => {
            mockedRepo.getUserById.mockResolvedValue(null);

            await expect(service.updateUser('ghost', { fullName: 'X' }))
                .rejects
                .toMatchObject({ statusCode: 404, message: 'User not found' });
        });
    });


    describe('deleteUser()', () => {
        test('should return true on successful delete', async () => {
            mockedRepo.getUserById.mockResolvedValue({ _id: 'u1' } as any);
            mockedRepo.deleteUser.mockResolvedValue(true);

            const result = await service.deleteUser('u1');
            expect(result).toBe(true);
        });

        test('should throw HttpError 404 if user not found before deleting', async () => {
            mockedRepo.getUserById.mockResolvedValue(null);

            await expect(service.deleteUser('ghost'))
                .rejects
                .toMatchObject({ statusCode: 404, message: 'User not found' });
        });
    });
});