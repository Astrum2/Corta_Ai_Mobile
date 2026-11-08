import { normalizeArray, parseResponse, requireMicroservicesUrl } from "./api";

export type NotificationStatus = "pending" | "sent" | "failed" | string;

export type Notification = {
    id: number;
    user_id: number;
    appointment_id: number;
    type: string;
    title: string;
    message: string;
    status: NotificationStatus;
    scheduled_at: string | null;
    sent_at: string | null;
};

const NOTIFICATION_FETCH_DELAY_MS = 200;

export async function getNotifications(userId: number): Promise<Notification[]> {
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

    return normalizeArray<Notification>(payload, ["notifications", "notificações"]);
}

export async function getNotificationForAppointment(
    userId: number,
    appointmentId: number,
): Promise<Notification | null> {
    await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_FETCH_DELAY_MS));

    const notifications = await getNotifications(userId);

    return notifications.find((notification) => notification.appointment_id === appointmentId) ?? null;
}