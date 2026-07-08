import { authMiddleware } from '../../../middleware/auth.middleware';
import { adminMiddleware } from '../../../middleware/admin.middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'foodify_secret_key';

function makeMocks(reqOverrides: any = {}) {
    const req: any = { headers: {}, ...reqOverrides };
    const res: any = {
        _status: 200,
        _body: null,
        status(code: number) { this._status = code; return this; },
        json(body: any) { this._body = body; return this; }
    };
    const next = jest.fn();
    return { req, res, next };
}

function makeToken(payload: { userId: string; email: string; role: string }, opts?: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', ...opts });
}

// authMiddleware

describe('authMiddleware Unit Tests', () => {

    test('should call next() and attach userId/userEmail/userRole from valid token', () => {
        const token = makeToken({ userId: 'user123', email: 'a@b.com', role: 'user' });
        const { req, res, next } = makeMocks({
            headers: { authorization: `Bearer ${token}` }
        });

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.userId).toBe('user123');
        expect(req.userEmail).toBe('a@b.com');
        expect(req.userRole).toBe('user');
    });

    test('should return 401 when Authorization header is missing entirely', () => {
        const { req, res, next } = makeMocks();

        authMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(401);
        expect(res._body.success).toBe(false);
    });

    test('should return 401 when header does not start with "Bearer "', () => {
        const token = makeToken({ userId: 'u1', email: 'a@b.com', role: 'user' });
        const { req, res, next } = makeMocks({
            headers: { authorization: `Token ${token}` }
        });

        authMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(401);
    });

    test('should return 401 for a clearly invalid token string', () => {
        const { req, res, next } = makeMocks({
            headers: { authorization: 'Bearer this.is.fakejwt' }
        });

        authMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(401);
    });

    test('should return 401 for an expired token (TokenExpiredError)', () => {
        const expired = makeToken(
            { userId: 'u1', email: 'a@b.com', role: 'user' },
            { expiresIn: '-1s' }
        );
        const { req, res, next } = makeMocks({
            headers: { authorization: `Bearer ${expired}` }
        });

        authMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(401);
    });

    test('should attach role "admin" correctly for admin token', () => {
        const token = makeToken({ userId: 'admin1', email: 'admin@b.com', role: 'admin' });
        const { req, res, next } = makeMocks({
            headers: { authorization: `Bearer ${token}` }
        });

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.userRole).toBe('admin');
    });
});

// adminMiddleware 
describe('adminMiddleware Unit Tests', () => {

    test('should call next() when userRole is "admin"', () => {
        const { req, res, next } = makeMocks();
        req.userRole = 'admin';

        adminMiddleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should return 403 when userRole is "user"', () => {
        const { req, res, next } = makeMocks();
        req.userRole = 'user';

        adminMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(403);
        expect(res._body.success).toBe(false);
    });

    test('should return 401 when userRole is not set at all', () => {
        const { req, res, next } = makeMocks();

        adminMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res._status).toBe(401);
    });

    test('should return 403 for any non-admin role string', () => {
        const { req, res, next } = makeMocks();
        req.userRole = 'superuser';

        adminMiddleware(req, res, next);

        expect(res._status).toBe(403);
    });
});