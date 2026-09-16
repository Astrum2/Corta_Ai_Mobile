import API_URL from "@/services/api";

const BARBERS_ENDPOINT = "/barbers";

export type Barber = {
    id: number;
    name: string;
    photo: string;
    active: boolean;
};

type ApiError = {
    message?: string;
    error?: string;
};

function photoUrl(photo: unknown, cacheKey: number) {
    if (typeof photo !== "string" || !photo) {
        return "";
    }

    if (/^(https?:|file:|blob:|data:)/i.test(photo)) {
        return photo;
    }

    if (!API_URL) {
        return photo;
    }

    const url = `${API_URL.replace(/\/$/, "")}/${photo.replace(/^\/+/, "")}`;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${cacheKey}`;
}

function normalizeBarber(value: unknown, cacheKey: number): Barber | null {
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
        photo: photoUrl(barber.photo ?? user?.photo, cacheKey),
        active: barber.active === true,
    };
}

export async function getBarbers(): Promise<Barber[]> {
    if (!API_URL) {
        throw new Error("EXPO_PUBLIC_URL não está configurada.");
    }

    const cacheKey = Date.now();
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
        .map((value) => normalizeBarber(value, cacheKey))
        .map((barber) => {
            if (!barber) return null;
            return {
                ...barber,
                photo: barber.photo,
            };
        })
        .filter((barber): barber is Barber => barber !== null && barber.active === true);
}