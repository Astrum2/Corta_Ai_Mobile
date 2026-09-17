import { onlyDigits } from "./formatters";

const API_URL = process.env.EXPO_PUBLIC_URL


export type CreateUserData = {
    name: string;
    email: string;
    cpf: string;
    password: string;
};

export type Role = {
    id: number;
    name: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    cpf: string;
    role_id: number;
    role?: Role;
};

export type RegisterUserResponse = User & {
    message?: string;
};

type ApiError = {
    message?: string;
    error?: string;
    errors?: Record<string, string | string[]>;
};

function firstValidationMessage(errors: Record<string, string | string[]> | undefined) {
    if (!errors) return "";

    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] ?? "" : firstError;
}

export function userFacingApiMessage(payload: unknown, fallbackMessage: string): string {
    const error = typeof payload === "object" && payload !== null
        ? payload as ApiError
        : undefined;
    const rawMessage = error?.message || error?.error || firstValidationMessage(error?.errors)
        || (typeof payload === "string" && payload.trim() ? payload.trim() : fallbackMessage);
    const normalizedMessage = rawMessage.toLowerCase();

    if (normalizedMessage.includes("these credentials do not match")
        || normalizedMessage.includes("invalid credentials")) {
        return "E-mail ou senha inválidos. Confira seus dados e tente novamente.";
    }

    if (normalizedMessage.includes("email has already been taken")
        || normalizedMessage.includes("e-mail já está cadastrado")) {
        return "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.";
    }

    if (normalizedMessage.includes("unauthenticated")
        || normalizedMessage.includes("unauthorized")) {
        return "Sua sessão expirou. Entre novamente para continuar.";
    }

    if (normalizedMessage.includes("network request failed")
        || normalizedMessage.includes("failed to fetch")) {
        return "Não conseguimos conectar ao servidor. Verifique sua internet e tente novamente.";
    }

    return rawMessage;
}

export function requireApiUrl(): string {
    if (!API_URL) {
        throw new Error("EXPO_PUBLIC_URL não está configurada.");
    }

    return API_URL;
}

export async function parseResponse<T>(
    response: Response,
    fallbackMessage: string
): Promise<T> {
    const contentType = response.headers.get("content-type") ?? "";
    const hasJson = contentType.includes("application/json");

    let data: unknown = null;

    if (response.status !== 204) {
        try {
            data = hasJson ? await response.json() : await response.text();
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        throw new Error(userFacingApiMessage(data, fallbackMessage));
    }

    return data as T;
}

export function normalizeArray<T>(payload: unknown, keys: string[]): T[] {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (typeof payload !== "object" || payload === null) {
        return [];
    }

    const root = payload as Record<string, unknown>;

    for (const key of keys) {
        if (Array.isArray(root[key])) {
            return root[key] as T[];
        }
    }

    if (Array.isArray(root.data)) {
        return root.data as T[];
    }

    if (typeof root.data === "object" && root.data !== null) {
        const nested = root.data as Record<string, unknown>;

        for (const key of keys) {
            if (Array.isArray(nested[key])) {
                return nested[key] as T[];
            }
        }
    }

    return [];
}

export async function registerUser(userData: CreateUserData): Promise<RegisterUserResponse> {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            cpf: onlyDigits(userData.cpf),
            password: userData.password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(userFacingApiMessage(data, "Não foi possível realizar o cadastro."));
    }

    return data as User;
}

export default API_URL;