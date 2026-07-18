import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpError } from './errors/http-error';
import reviewRoutes from "./routes/review.route";
import { sanitizeBody } from "./middleware/sanitize.middleware";

// Import routes
import authRoutes from "./routes/auth.route";
import restaurantRoutes from "./routes/restaurant.route";
import foodRoutes from "./routes/food.route";
import orderRoutes from "./routes/order.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminRestaurantRoutes from "./routes/admin/restaurant.route";
import adminFoodRoutes from "./routes/admin/food.route";
import adminMiscRoutes from "./routes/admin/misc.route";
import { adminActivityLogger } from "./middleware/auditLogger.middleware";
import paymentRoutes from "./routes/payment.route";
import { globalLimiter } from "./middleware/rateLimiter.middleware";

const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://192.168.1.78:3000'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));
// SECURITY FEATURE: Helmet sets a range of protective HTTP headers in one call
// — Content-Security-Policy, X-Frame-Options (clickjacking), X-Content-Type-
// Options (MIME sniffing), and others. This is the "close the easy gaps"
// layer, standard practice for any Express API.
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// SECURITY FEATURE: strips MongoDB operator keys ($ne, $gt, etc.) and HTML/
// script content from every request body — see utils/sanitize.ts for the
// full NoSQL-injection and stored-XSS rationale.
app.use(sanitizeBody);
// Baseline rate limiting across the whole API — blunts scripted abuse/scraping.
// Specific sensitive endpoints (auth, OTP) layer stricter limiters on top of this.
app.use(globalLimiter);

// Public API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Admin API Routes
app.use('/api/admin/users', adminActivityLogger, adminUserRoutes);
app.use('/api/admin/restaurants', adminActivityLogger, adminRestaurantRoutes);
app.use('/api/admin/foods', adminActivityLogger, adminFoodRoutes);
app.use('/api/admin', adminActivityLogger, adminMiscRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: "Foodify API is running!" });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;