import api from "./axios";
import { API } from "./endpoints";

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
    const res = await api.get(API.ADMIN.STATS);
    return res.data.data;
};

// ── Restaurants ───────────────────────────────────────────────────────────────
export const adminGetRestaurants = async (page = "1", size = "10", search?: string) => {
    const res = await api.get(API.ADMIN.RESTAURANTS.GET_ALL, { params: { page, size, search } });
    return res.data;
};

export const adminGetRestaurantById = async (id: string) => {
    const res = await api.get(API.ADMIN.RESTAURANTS.GET_ONE(id));
    return res.data.data;
};

export const adminCreateRestaurant = async (data: FormData) => {
    const res = await api.post(API.ADMIN.RESTAURANTS.CREATE, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const adminUpdateRestaurant = async (id: string, data: FormData) => {
    const res = await api.put(API.ADMIN.RESTAURANTS.UPDATE(id), data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const adminDeleteRestaurant = async (id: string) => {
    const res = await api.delete(API.ADMIN.RESTAURANTS.DELETE(id));
    return res.data;
};

// ── Foods ─────────────────────────────────────────────────────────────────────
export const adminGetFoods = async (page = "1", size = "10", search?: string, restaurantId?: string) => {
    const res = await api.get(API.ADMIN.FOODS.GET_ALL, { params: { page, size, search, restaurantId } });
    return res.data;
};

export const adminGetFoodById = async (id: string) => {
    const res = await api.get(API.ADMIN.FOODS.GET_ONE(id));
    return res.data.data;
};

export const adminCreateFood = async (data: FormData) => {
    const res = await api.post(API.ADMIN.FOODS.CREATE, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const adminUpdateFood = async (id: string, data: FormData) => {
    const res = await api.put(API.ADMIN.FOODS.UPDATE(id), data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const adminDeleteFood = async (id: string) => {
    const res = await api.delete(API.ADMIN.FOODS.DELETE(id));
    return res.data;
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const adminGetOrders = async (page = "1", size = "15", status?: string, search?: string) => {
    const res = await api.get(API.ADMIN.ORDERS.GET_ALL, { params: { page, size, status, search } });
    return res.data;
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
    const res = await api.put(API.ADMIN.ORDERS.UPDATE_STATUS(id), { status });
    return res.data;
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const adminGetReviews = async (page = "1", size = "12") => {
    const res = await api.get(API.ADMIN.REVIEWS, { params: { page, size } });
    return res.data;
};