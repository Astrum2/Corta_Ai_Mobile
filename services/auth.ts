import * as SecureStore from "expo-secure-store";
import API_URL from "./api";

const TOKEN_KEY = "auth_token";

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

    return loginResponse;
}

export async function getAuthToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearAuthToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}