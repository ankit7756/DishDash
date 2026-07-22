import api from "./axios";
import { API } from "./endpoints";

// SECURITY: matches the backend's price-tampering fix — only foodId and
// quantity are ever sent. Price, subtotal, and totalAmount are calculated
// server-side from the real Food/Restaurant records and cannot be
// influenced by the client (see order.controller.ts's createOrder).
export interface CreateOrderItem {
    foodId: string;
    quantity: number;
}

export interface CreateOrderPayload {
    restaurantId: string;
    items: CreateOrderItem[];
    deliveryAddress: string;
    phone: string;
    paymentMethod: "Cash on Delivery" | "Khalti";
}

export interface OrderItem {
    foodId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    _id: string;
    restaurantId: string | { _id: string; name: string; image: string; rating: number; phone?: string; address?: string };
    restaurantName: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryAddress: string;
    phone: string;
    paymentMethod: string;
    paymentStatus: "unpaid" | "pending" | "completed" | "failed" | "refunded";
    khaltiPidx?: string;
    status: "pending" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
    orderDate: string;
    deliveryDate?: string;
    createdAt: string;
}

export interface Review {
    _id: string;
    userId: string;
    orderId: string;
    restaurantId: string;
    restaurantName: string;
    foodItems: string[];
    stars: number;
    message: string;
    createdAt: string;
}

// Orders
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await api.post(API.ORDERS.CREATE, payload);
    return res.data.data;
};

export const getUserOrders = async (): Promise<Order[]> => {
    const res = await api.get(API.ORDERS.GET_ALL);
    return res.data.data;
};

export const getCurrentOrders = async (): Promise<Order[]> => {
    const res = await api.get(API.ORDERS.CURRENT);
    return res.data.data;
};

export const getOrderHistory = async (): Promise<Order[]> => {
    const res = await api.get(API.ORDERS.HISTORY);
    return res.data.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
    const res = await api.get(API.ORDERS.GET_BY_ID(id));
    return res.data.data;
};

export const confirmDelivery = async (id: string): Promise<Order> => {
    const res = await api.put(API.ORDERS.CONFIRM(id));
    return res.data.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
    const res = await api.put(API.ORDERS.CANCEL(id));
    return res.data.data;
};

// Payment — replaces the old fake email-OTP flow entirely with the real
// Khalti ePayment integration (see khalti.service.ts on the backend).
export const initiateKhaltiPayment = async (orderId: string): Promise<{ success: boolean; pidx: string; paymentUrl: string }> => {
    const res = await api.post(API.PAYMENT.KHALTI_INITIATE, { orderId });
    return res.data;
};

export const verifyKhaltiPayment = async (orderId: string): Promise<{
    success: boolean;
    paymentStatus: Order["paymentStatus"];
    khaltiStatus: string;
    transactionId: string | null;
    order: Order;
}> => {
    const res = await api.post(API.PAYMENT.KHALTI_VERIFY, { orderId });
    return res.data;
};

// Reviews
export const submitReview = async (orderId: string, stars: number, message: string): Promise<Review> => {
    const res = await api.post(API.REVIEWS.SUBMIT(orderId), { stars, message });
    return res.data.data;
};

export const getReviewByOrder = async (orderId: string): Promise<Review | null> => {
    const res = await api.get(API.REVIEWS.GET_BY_ORDER(orderId));
    return res.data.data;
};

export const getMyReviews = async (): Promise<Review[]> => {
    const res = await api.get(API.REVIEWS.MY_REVIEWS);
    return res.data.data;
};