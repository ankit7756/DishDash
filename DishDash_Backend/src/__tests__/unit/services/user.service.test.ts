jest.mock('../../../repositories/user.repository');
jest.mock('../../../config/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
    transporter: { verify: jest.fn() },
}));

import * as userService from '../../../services/user.service';
import * as userRepo from '../../../repositories/user.repository';

const mockedRepo = userRepo as jest.Mocked<typeof userRepo>;

describe('User Service Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser()', () => {
        const validInput = {
            fullName: 'John Doe',
            username: 'johndoe',
            phone: '9800000001',
            email: 'john@example.com',
            password: 'Password123!'
        };

        test('should register and return user without password field', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.createUser.mockResolvedValue({
                _id: 'user123',
                fullName: validInput.fullName,
                username: validInput.username,
                phone: validInput.phone,
                email: validInput.email,
                role: 'user',
                toObject: () => ({})
            } as any);

            const result = await userService.registerUser(validInput);

            expect(result.message).toBeDefined();
            expect(result.user.email).toBe(validInput.email);
            expect(result.user).not.toHaveProperty('password');
        });

        test('should throw HttpError 400 when email already exists', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue({ _id: 'existing' } as any);

            await expect(userService.registerUser(validInput))
                .rejects
                .toMatchObject({ statusCode: 400, message: 'Email already exists' });
        });

        test('should hash password before calling createUser', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.createUser.mockResolvedValue({
                _id: 'u1', ...validInput, role: 'user'
            } as any);

            await userService.registerUser(validInput);

            const calledWith = mockedRepo.createUser.mock.calls[0][0];
            // Must NOT store plaintext
            expect(calledWith.password).not.toBe(validInput.password);
            // bcrypt hashes start with $2b$
            expect(calledWith.password).toMatch(/^\$2b\$/);
        });

        test('should always set role to "user" regardless of input', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);
            mockedRepo.createUser.mockResolvedValue({
                _id: 'u1', ...validInput, role: 'user'
            } as any);

            await userService.registerUser(validInput);

            const calledWith = mockedRepo.createUser.mock.calls[0][0];
            expect(calledWith.role).toBe('user');
        });
    });

    describe('loginUser()', () => {
        const bcryptjs = require('bcryptjs');

        test('should return JWT token and user data on valid login', async () => {
            const hashed = await bcryptjs.hash('Password123!', 10);
            mockedRepo.getUserByEmail.mockResolvedValue({
                _id: 'user123',
                email: 'john@example.com',
                password: hashed,
                fullName: 'John Doe',
                username: 'johndoe',
                phone: '9800000001',
                role: 'user'
            } as any);

            const result = await userService.loginUser({
                email: 'john@example.com',
                password: 'Password123!'
            });

            expect(result).toHaveProperty('token');
            // Valid JWT has 3 dot-separated parts
            expect(result.token.split('.').length).toBe(3);
            expect(result.user.email).toBe('john@example.com');
        });

        test('should throw HttpError 401 when user is not found', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);

            await expect(userService.loginUser({
                email: 'nobody@nowhere.com',
                password: 'pass'
            })).rejects.toMatchObject({ statusCode: 401 });
        });

        test('should throw HttpError 401 when password is wrong', async () => {
            const hashed = await bcryptjs.hash('correct', 10);
            mockedRepo.getUserByEmail.mockResolvedValue({
                _id: 'u1', email: 'j@j.com',
                password: hashed, role: 'user'
            } as any);

            await expect(userService.loginUser({
                email: 'j@j.com',
                password: 'wrongpassword'
            })).rejects.toMatchObject({ statusCode: 401 });
        });
    });

    describe('sendResetPasswordEmail()', () => {
        test('should throw HttpError 400 when email is undefined', async () => {
            await expect(userService.sendResetPasswordEmail(undefined))
                .rejects
                .toMatchObject({ statusCode: 400, message: 'Email is required' });
        });

        test('should throw HttpError 404 when email is not registered', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue(null);

            await expect(userService.sendResetPasswordEmail('ghost@test.com'))
                .rejects
                .toMatchObject({ statusCode: 404, message: 'User not found' });
        });

        test('should call sendEmail and return user when email exists', async () => {
            mockedRepo.getUserByEmail.mockResolvedValue({
                _id: 'u1', email: 'john@example.com',
                fullName: 'John', username: 'john'
            } as any);

            const result = await userService.sendResetPasswordEmail('john@example.com');

            const { sendEmail } = require('../../../config/email');
            expect(sendEmail).toHaveBeenCalledTimes(1);
            expect(result).toHaveProperty('email', 'john@example.com');
        });
    });

    describe('resetPassword()', () => {
        test('should throw HttpError 400 when token is undefined', async () => {
            await expect(userService.resetPassword(undefined, 'NewPass123!'))
                .rejects
                .toMatchObject({ statusCode: 400 });
        });

        test('should throw HttpError 400 when newPassword is undefined', async () => {
            await expect(userService.resetPassword('sometoken', undefined))
                .rejects
                .toMatchObject({ statusCode: 400 });
        });

        test('should throw HttpError 400 for an invalid token string', async () => {
            await expect(userService.resetPassword('not-a-jwt', 'NewPass123!'))
                .rejects
                .toMatchObject({ statusCode: 400 });
        });

        test('should update password hash for a valid token', async () => {
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'foodify_secret_key';
            // service uses { id: user._id } in the token
            const token = jwt.sign({ id: 'user123' }, JWT_SECRET, { expiresIn: '1h' });

            mockedRepo.getUserById.mockResolvedValue({ _id: 'user123', email: 'j@j.com' } as any);
            mockedRepo.updateUser.mockResolvedValue({ _id: 'user123' } as any);

            await userService.resetPassword(token, 'NewPass123!');

            const updateCall = mockedRepo.updateUser.mock.calls[0];
            expect(updateCall[1].password).toMatch(/^\$2b\$/);
        });
    });
});