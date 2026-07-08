import { UserModel } from "../models/User.model";
import { QueryFilter } from "mongoose";

export const getUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email });
};

export const getUserByUsername = async (username: string) => {
    return await UserModel.findOne({ username });
};

export const createUser = async (userData: any) => {
    const user = new UserModel(userData);
    return await user.save();
};

export const getUserById = async (id: string) => {
    return await UserModel.findById(id);
};

export const getAllUsers = async (
    page: number,
    size: number,
    search?: string
): Promise<{ users: any[], total: number }> => {
    const filter: QueryFilter<any> = {};

    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        UserModel.find(filter)
            .select("-password")
            .skip((page - 1) * size)
            .limit(size)
            .sort({ createdAt: -1 }),
        UserModel.countDocuments(filter)
    ]);

    return { users, total };
};

export const updateUser = async (id: string, updateData: any) => {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
};

export const deleteUser = async (id: string) => {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
};