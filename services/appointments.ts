import { normalizeArray, parseResponse, requireApiUrl } from "./api";
import { getAuthToken } from "./auth";
import { type Barber } from "./barbers";
import { parseDateInput } from "./formatters";
import type { Service } from "./serviceList";

export type AppointmentStatus =
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | string;

export type Appointment = {
    id: number;
    user_id: number;
    service_id: number;
    barber_id: number;
    date: string;
    time: string;
    status: AppointmentStatus;
    notes?: string | null;
    user?: {
        id: number;
        name: string;
        email?: string;
    };
    service?: Service;
    barber?: Barber;
    created_at?: string;
    updated_at?: string;
};

export type CreateAppointmentData = {
    user_id: number;
    service_id: number;
    barber_id: number;
    date: string;
    time: string;
    notes?: string | null;
};

export type AppointmentFormData = {
    userId: number | null;
    serviceId: string;
    barberId: string;
    date: string;
    time: string;
    notes: string;
};

const TIME_SLOT_START_HOUR = 8;
const TIME_SLOT_END_HOUR = 20;
const TIME_SLOT_INTERVAL_MINUTES = 15;

function buildTimeSlots(): string[] {
    const slots: string[] = [];

    for (let hour = TIME_SLOT_START_HOUR; hour <= TIME_SLOT_END_HOUR; hour += 1) {
        for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL_MINUTES) {
            slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        }
    }

    return slots;
}

export const TIME_SLOTS = buildTimeSlots();

function timeToMinutes(time: string): number {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);

    if (!match) {
        return -1;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return -1;
    }

    return hours * 60 + minutes;
}

async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
    const token = await getAuthToken();

    if (!token) {
        throw new Error("É necessário estar logado para acessar os agendamentos.");
    }

    return {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${requireApiUrl()}/appointments`, {
        method: "GET",
        headers: await getAuthenticatedHeaders(),
    });
    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar os agendamentos."
    );

    return normalizeArray<Appointment>(payload, ["appointments", "agendamentos"]);
}

export async function getAvailableTimeSlots(
    barberId: number,
    date: string,
    serviceDurationMinutes: number = TIME_SLOT_INTERVAL_MINUTES
): Promise<string[]> {
    const appointments = await getAppointments();
    const normalizedDate = date.slice(0, 10);
    const requestedDuration = Number.isFinite(serviceDurationMinutes)
        ? Math.max(TIME_SLOT_INTERVAL_MINUTES, Math.round(serviceDurationMinutes))
        : TIME_SLOT_INTERVAL_MINUTES;

    const occupiedIntervals = appointments
        .filter((appointment) => {
            const status = String(appointment.status).toLowerCase();

            return (
                Number(appointment.barber_id) === barberId &&
                String(appointment.date).slice(0, 10) === normalizedDate &&
                status !== "cancelled" &&
                status !== "canceled"
            );
        })
        .map((appointment) => {
            const start = timeToMinutes(String(appointment.time).slice(0, 5));
            const duration = appointment.service?.duration_minutes;
            const appointmentDuration =
                Number.isFinite(duration) && Number(duration) > 0
                    ? Math.round(Number(duration))
                    : TIME_SLOT_INTERVAL_MINUTES;

            return {
                start,
                end: start + appointmentDuration,
            };
        })
        .filter((interval) => interval.start >= 0);

    return TIME_SLOTS.filter((time) => {
        const candidateStart = timeToMinutes(time);
        const candidateEnd = candidateStart + requestedDuration;
        const withinBusinessHours = candidateEnd <= TIME_SLOT_END_HOUR * 60;

        return (
            withinBusinessHours &&
            !occupiedIntervals.some(
                (interval) =>
                    candidateStart < interval.end &&
                    candidateEnd > interval.start
            )
        );
    });
}

export async function getAppointmentById(id: number): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "GET",
        headers: await getAuthenticatedHeaders(),
    });

    return parseResponse<Appointment>(
        response,
        "Não foi possível carregar o agendamento."
    );
}

export async function createAppointment(
    appointmentData: CreateAppointmentData
): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments`, {
        method: "POST",
        headers: {
            ...await getAuthenticatedHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: appointmentData.user_id,
            service_id: appointmentData.service_id,
            barber_id: appointmentData.barber_id,
            date: appointmentData.date,
            time: appointmentData.time,
            notes: appointmentData.notes?.trim() || null,
        }),
    });

    return parseResponse<Appointment>(
        response,
        "Não foi possível criar o agendamento."
    );
}

export async function createAppointmentFromForm(
    formData: AppointmentFormData
): Promise<Appointment> {
    if (!formData.userId || !Number.isInteger(formData.userId) || formData.userId <= 0) {
        throw new Error("Usuário inválido para criar o agendamento.");
    }

    if (!formData.serviceId) {
        throw new Error("Selecione um serviço.");
    }

    if (!formData.barberId) {
        throw new Error("Selecione um barbeiro.");
    }

    if (!formData.date.trim()) {
        throw new Error("Informe a data do agendamento.");
    }

    const apiDate = parseDateInput(formData.date.trim());

    if (!apiDate) {
        throw new Error("Informe uma data válida no formato DD/MM/AAAA.");
    }

    if (!formData.time) {
        throw new Error("Selecione um horário.");
    }

    const serviceId = Number(formData.serviceId);
    const barberId = Number(formData.barberId);

    if (
        !Number.isInteger(serviceId) ||
        serviceId <= 0 ||
        !Number.isInteger(barberId) ||
        barberId <= 0
    ) {
        throw new Error("Serviço ou barbeiro inválido.");
    }

    return createAppointment({
        user_id: formData.userId,
        service_id: serviceId,
        barber_id: barberId,
        date: apiDate,
        time: formData.time,
        notes: formData.notes.trim() || null,
    });
}

export async function updateAppointment(
    id: number,
    appointmentData: Partial<CreateAppointmentData> & {
        status?: AppointmentStatus;
    }
): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "PUT",
        headers: {
            ...await getAuthenticatedHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
    });

    return parseResponse<Appointment>(
        response,
        "Não foi possível atualizar o agendamento."
    );
}

export async function deleteAppointment(id: number): Promise<void> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "DELETE",
        headers: await getAuthenticatedHeaders(),
    });

    await parseResponse<null>(
        response,
        "Não foi possível remover o agendamento."
    );
}

export { default } from "./api";

