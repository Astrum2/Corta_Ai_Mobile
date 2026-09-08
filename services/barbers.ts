import API_URL from "@/services/api";

const BARBERS_ENDPOINT = "/barbers";

export type Barber = {
    id: number;
    name: string;
    photo: string;
};

type ApiError = {
    message?: string;
    error?: string;
};

function photoUrl(photo: unknown) {
    if (typeof photo !== "string" || !photo) {
        return "";
    }

    if (/^(https?:|file:|blob:|data:)/i.test(photo)) {
        return photo;
    }

    if (!API_URL) {
        return photo;
    }

    return `${API_URL.replace(/\/$/, "")}/${photo.replace(/^\/+/, "")}`;
}

function normalizeBarber(value: unknown): Barber | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const barber = value as Record<string, unknown>;
    const user = barber.user as Record<string, unknown> | undefined;
    const id = barber.id ?? barber.user_id ?? user?.id;
    const name = barber.name ?? user?.name;

    if (
        (typeof id !== "number" && typeof id !== "string") ||
        typeof name !== "string"
    ) {
        return null;
    }

    return {
        id: Number(id),
        name,
        photo: photoUrl(barber.photo ?? user?.photo),
    };
}

export async function getBarbers(): Promise<Barber[]> {
    if (!API_URL) {
        throw new Error("EXPO_PUBLIC_URL não está configurada.");
    }

    const response = await fetch(
        `${API_URL.replace(/\/$/, "")}${BARBERS_ENDPOINT}`,
    );
    const data: unknown = await response.json();

    if (!response.ok) {
        const error = data as ApiError;
        throw new Error(
            error.message ||
                error.error ||
                "Não foi possível carregar os barbeiros.",
        );
    }

    const root = data as { barbers?: unknown; data?: unknown };
    const items = Array.isArray(data)
        ? data
        : Array.isArray(root.barbers)
            ? root.barbers
            : Array.isArray(root.data)
                ? root.data
                : [];

    return items
        .map(normalizeBarber)
        .filter((barber): barber is Barber => barber !== null);
}