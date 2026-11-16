import { parseResponse, requireMicroservicesUrl } from "./api";

export type NotificationStatus = "pending" | "sent" | "failed" | string;

export type Notification = {
    id: number;
    user_id: number;
    appointment_id?: number | null;
    review_id?: number | null;
    type: string;
    title: string;
    message: string;
    status: NotificationStatus;
    scheduled_at: string | null;
    sent_at: string | null;
};

const NOTIFICATION_FETCH_DELAY_MS = 200;

function normalizeNotification(payload: unknown): Notification | null {
    if (typeof payload !== "object" || payload === null) {
        return null;
    }

    const root = payload as Record<string, unknown>;

    if (typeof root.id === "number") {
        return root as Notification;
    }

    for (const key of ["notification", "notificação", "latest"]) {
        if (typeof root[key] === "object" && root[key] !== null) {
            return root[key] as Notification;
        }
    }

    if (typeof root.data === "object" && root.data !== null) {
        return root.data as Notification;
    }

    return null;
}

export async function getLatestNotification(userId: number): Promise<Notification | null> {
    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("O ID do usuário deve ser um número inteiro positivo.");
    }

    const response = await fetch(
        `${requireMicroservicesUrl().replace(/\/$/, "")}/notifications/me`,
        {
            method: "GET",
            headers: {
                "x-user-id": String(userId),
            },
        },
    );

    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar suas notificações.",
    );

    return normalizeNotification(payload);
}

export async function getNotificationForAppointment(userId: number): Promise<Notification | null> {
    await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_FETCH_DELAY_MS));

    return getLatestNotification(userId);
}

export async function getNotificationForReview(userId: number): Promise<Notification | null> {
    await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_FETCH_DELAY_MS));

    return getLatestNotification(userId);
}