import api from "./axios";
import { API } from "./endpoints";
export interface Food {
    _id: string;
    name: string;
    image: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    isAvailable: boolean;
    isPopular: boolean;
    restaurantId: {
        _id: string;
        name: string;
        image: string;
        rating: number;
        deliveryTime?: string;
        deliveryFee?: number;
    } | string;
}

export interface Restaurant {
    _id: string;
    name: string;
    image: string;
    description: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: number;
    categories: string[];
    isOpen: boolean;
    address: string;
    phone: string;
}

export const getAllFoods = async (): Promise<Food[]> => {
    const res = await api.get(API.FOODS.GET_ALL);
    return res.data.data;
};

export const getPopularFoods = async (): Promise<Food[]> => {
    const res = await api.get(API.FOODS.GET_POPULAR);
    return res.data.data;
};

export const getFoodById = async (id: string): Promise<Food> => {
    const res = await api.get(API.FOODS.GET_BY_ID(id));
    return res.data.data;
};

export const getFoodsByRestaurant = async (restaurantId: string): Promise<Food[]> => {
    const res = await api.get(API.FOODS.GET_BY_RESTAURANT(restaurantId));
    return res.data.data;
};

export const getAllRestaurants = async (): Promise<Restaurant[]> => {
    const res = await api.get(API.RESTAURANTS.GET_ALL);
    return res.data.data;
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
    const res = await api.get(API.RESTAURANTS.GET_BY_ID(id));
    return res.data.data;
};

export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
    const res = await api.get(`${API.RESTAURANTS.SEARCH}?query=${encodeURIComponent(query)}`);
    return res.data.data;
};