import { normalizeArray, parseResponse, requireApiUrl } from "./api";
import { getAuthToken } from "./auth";

export type BarberScheduleSlot = {
	start: string;
	end: string;
};

export type BarberSchedule = {
	id: number;
	barber_id: number;
	date: string;
	appointment_id: number;
	slot_group: string;
	status: string;
	notes?: string | null;
	slots: BarberScheduleSlot[];
	serviceName: string;
	serviceDuration: number;
};

type BarberScheduleResponse = {
	id: number;
	barber_id: number;
	date: string;
	start: string;
	end: string;
	status: string;
	appointment_id: number;
	slot_group: string;
	notes?: string | null;
	appointment?: {
		notes?: string | null;
		service?: {
			name?: string;
			duration_minutes?: number;
		};
	};
};

async function getAuthenticatedHeaders() {
	const token = await getAuthToken();

	if (!token) {
		throw new Error("É necessário estar logado para acessar a agenda do barbeiro.");
	}

	return {
		Authorization: `Bearer ${token}`,
		Accept: "application/json",
	};
}

export async function getBarberAppointments(): Promise<BarberSchedule[]> {
	const response = await fetch(`${requireApiUrl()}/barber-schedules/me`, {
		method: "GET",
		headers: await getAuthenticatedHeaders(),
	});

	const payload = await parseResponse<unknown>(
		response,
		"Não foi possível carregar a agenda do barbeiro."
	);

	const schedules = normalizeArray<BarberScheduleResponse>(payload, [
		"appointments",
		"agendamentos",
		"schedules",
	]);

	const groupedSchedules = new Map<string, BarberScheduleResponse[]>();

	for (const schedule of schedules) {
		const groupKey = schedule.slot_group || `appointment-${schedule.appointment_id}`;
		const group = groupedSchedules.get(groupKey) ?? [];

		group.push(schedule);
		groupedSchedules.set(groupKey, group);
	}

	return Array.from(groupedSchedules.values()).map((group) => {
		const orderedGroup = [...group].sort((first, second) =>
			first.start.localeCompare(second.start)
		);
		const firstSchedule = orderedGroup[0];
		const lastSchedule = orderedGroup[orderedGroup.length - 1];

		return {
			id: firstSchedule.id,
			barber_id: firstSchedule.barber_id,
			date: firstSchedule.date,
			appointment_id: firstSchedule.appointment_id,
			slot_group: firstSchedule.slot_group,
			status: firstSchedule.status,
			notes: firstSchedule.notes ?? firstSchedule.appointment?.notes ?? null,
			slots: [{ start: firstSchedule.start, end: lastSchedule.end }],
			serviceName: firstSchedule.appointment?.service?.name ?? "Não informado",
			serviceDuration:
				firstSchedule.appointment?.service?.duration_minutes ?? 0,
		};
	});
}
