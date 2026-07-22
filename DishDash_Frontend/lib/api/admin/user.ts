import api from "../axios";
import { API } from "../endpoints";

export const createUser = async (userData: FormData) => {
    const response = await api.post(API.ADMIN.USERS.CREATE, userData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getAllUsers = async (page = "1", size = "10", search?: string) => {
    const response = await api.get(API.ADMIN.USERS.GET_ALL, {
        params: { page, size, search },
    });
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await api.get(API.ADMIN.USERS.GET_ONE(id));
    return response.data;
};

export const updateUser = async (id: string, userData: FormData) => {
    const response = await api.put(API.ADMIN.USERS.UPDATE(id), userData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await api.delete(API.ADMIN.USERS.DELETE(id));
    return response.data;
};