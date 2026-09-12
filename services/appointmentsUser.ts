import { normalizeArray, parseResponse, requireApiUrl } from "./api";
import type { Appointment } from "./appointments";
import { getAuthToken } from "./auth";

export type UpdateUserAppointmentData = Partial<
    Pick<Appointment, "service_id" | "barber_id" | "date" | "time" | "notes" | "status">
>;

async function getAuthenticatedHeaders() {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("É necessário estar logado para gerenciar seus agendamentos.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export async function getUserAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${requireApiUrl()}/appointments/me`, {
        method: "GET",
        headers: await getAuthenticatedHeaders(),
    });

    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar seus agendamentos."
    );

    return normalizeArray<Appointment>(payload, ["appointments", "agendamentos"]);
}

export async function updateUserAppointment(
    id: number,
    appointmentData: UpdateUserAppointmentData,
): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "PUT",
        headers: await getAuthenticatedHeaders(),
        body: JSON.stringify(appointmentData),
    });

    return parseResponse<Appointment>(
        response,
        "Não foi possível atualizar seu agendamento."
    );
}

export async function deleteUserAppointment(id: number): Promise<void> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "DELETE",
        headers: await getAuthenticatedHeaders(),
    });

    await parseResponse<null>(
        response,
        "Não foi possível remover seu agendamento."
    );
}
