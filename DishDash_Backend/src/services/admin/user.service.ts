import bcryptjs from "bcryptjs";
import * as userRepo from "../../repositories/user.repository";
import { HttpError } from "../../errors/http-error";

export class AdminUserService {
    async createUser(data: any) {
        const emailCheck = await userRepo.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }

        const usernameCheck = await userRepo.getUserByUsername(data.username);
        if (usernameCheck) {
            throw new HttpError(403, "Username already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;

        const newUser = await userRepo.createUser(data);
        return newUser;
    }

    // ✅ UPDATED: With pagination and search
    async getAllUsers(
        page?: string,
        size?: string,
        search?: string
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;

        const { users, total } = await userRepo.getAllUsers(
            pageNumber,
            pageSize,
            search
        );

        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize)
        };

        return { users, pagination };
    }

    async getUserById(id: string) {
        const user = await userRepo.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(id: string, updateData: any) {
        const user = await userRepo.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // SECURITY FIX: this previously passed updateData straight through to
        // userRepo.updateUser without hashing — if an admin's request body
        // included a password field, it would be stored in PLAINTEXT (unlike
        // createUser just above, which correctly hashes it). Found during the
        // final RBAC/security sweep.
        if (updateData.password) {
            updateData.password = await bcryptjs.hash(updateData.password, 10);
        }

        const updatedUser = await userRepo.updateUser(id, updateData);
        return updatedUser;
    }

    async deleteUser(id: string) {
        const user = await userRepo.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const deleted = await userRepo.deleteUser(id);
        return deleted;
    }
}