import { normalizeArray, parseResponse, requireApiUrl } from "./api";
import { getAuthToken } from "./auth";

export type Service = {
    id: number;
    name: string;
    price?: number | string;
    duration?: number;
};

export type Barber = {
    id: number;
    name: string;
};

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

export function formatDateInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseDateInput(value: string): string | null {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        return null;
    }

    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function getServices(): Promise<Service[]> {
    const response = await fetch(`${requireApiUrl()}/services`);
    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar os serviços."
    );

    return normalizeArray<Service>(payload, ["services", "servicos"]);
}

export async function getBarbers(): Promise<Barber[]> {
    const response = await fetch(`${requireApiUrl()}/barbers`);
    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar os barbeiros."
    );

    return normalizeArray<Barber>(payload, ["barbers", "barbeiros"]);
}

export async function getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${requireApiUrl()}/appointments`);
    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar os agendamentos."
    );

    return normalizeArray<Appointment>(payload, ["appointments", "agendamentos"]);
}

export async function getAppointmentById(id: number): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`);

    return parseResponse<Appointment>(
        response,
        "Não foi possível carregar o agendamento."
    );
}

export async function createAppointment(
    appointmentData: CreateAppointmentData
): Promise<Appointment> {
    const token = await getAuthToken();
    const response = await fetch(`${requireApiUrl()}/appointments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function updateAppointment(
    id: number,
    appointmentData: Partial<CreateAppointmentData> & {
        status?: AppointmentStatus;
    }
): Promise<Appointment> {
    const response = await fetch(`${requireApiUrl()}/appointments/${id}`, {
        method: "PUT",
        headers: {
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
    });

    await parseResponse<null>(
        response,
        "Não foi possível remover o agendamento."
    );
}

export { default } from "./api";

