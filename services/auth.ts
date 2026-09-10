import * as SecureStore from "expo-secure-store";
import API_URL from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    } | null;
};

export type LoginResponse = {
    message: string;
    token: string;
    user: AuthUser;
};

type ApiError = {
    message?: string;
    error?: string;
};

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
        }),
    });

    const data = await response.json() as LoginResponse | ApiError;

    if (!response.ok) {
        const error = data as ApiError;

        throw new Error(
            error.message ||
            error.error ||
            "Email ou senha inválidos."
        );
    }

    const loginResponse = data as LoginResponse;
    await SecureStore.setItemAsync(TOKEN_KEY, loginResponse.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(loginResponse.user));

    return loginResponse;
}

export async function getAuthToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getAuthUser(): Promise<AuthUser | null> {
    const value = await SecureStore.getItemAsync(USER_KEY);

    if (!value) {
        return null;
    }

    try {
        const user = JSON.parse(value) as AuthUser;
        return Number.isInteger(user.id) && user.id > 0 ? user : null;
    } catch {
        return null;
    }
}

export async function fetchAuthenticatedUser(): Promise<AuthUser | null> {
    const token = await getAuthToken();

    if (!token || !API_URL) {
        return null;
    }

    const response = await fetch(`${API_URL.replace(/\/$/, "")}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json() as AuthUser | { user?: AuthUser; data?: AuthUser } | null;
    const user = data && typeof data === "object"
        ? ("id" in data ? data : data.user ?? data.data)
        : null;

    if (!user || !Number.isInteger(user.id) || user.id <= 0) {
        return null;
    }

    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return user;
}

export async function clearAuthToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
}