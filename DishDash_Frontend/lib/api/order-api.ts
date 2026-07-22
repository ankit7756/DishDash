import api from "./axios";
import { API } from "./endpoints";

export interface OrderItem {
    foodId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CreateOrderPayload {
    restaurantId: string;
    restaurantName: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryAddress: string;
    phone: string;
    paymentMethod: "Cash on Delivery" | "Khalti";
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

// Payment
export const sendKhaltiOTP = async (payload: {
    phone: string;
    amount: string;
    restaurantName: string;
}): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(API.PAYMENT.KHALTI_SEND_OTP, payload);
    return res.data;
};

export const verifyKhaltiOTP = async (otp: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(API.PAYMENT.KHALTI_VERIFY_OTP, { otp });
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