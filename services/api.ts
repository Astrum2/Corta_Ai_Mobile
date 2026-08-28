const API_URL = "https://cortaai.local/api";

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

type ApiError = {
    message?: string;
    error?: string;
};

export async function registerUser(userData: CreateUserData): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            cpf: userData.cpf.replace(/\D/g, ""),
            password: userData.password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = data as ApiError;

        throw new Error(
            error.message ||
            error.error ||
            "Não foi possível realizar o cadastro."
        );
    }

    return data as User;
}

export default API_URL;