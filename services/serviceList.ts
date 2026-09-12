import { normalizeArray, parseResponse, requireApiUrl } from "./api";
import { getAuthToken } from "./auth";

export type Service = {
	id: number;
	name: string;
	description: string;
	duration_minutes: number;
	price: number;
};

export type ServiceData = Omit<Service, "id">;

async function authenticatedRequest(
	path: string,
	init: RequestInit = {},
): Promise<Response> {
	const token = await getAuthToken();

	if (!token) {
		throw new Error("É necessário estar logado para gerenciar serviços.");
	}

	const headers = new Headers(init.headers);
	headers.set("Authorization", `Bearer ${token}`);
	headers.set("Content-Type", "application/json");

	return fetch(`${requireApiUrl()}${path}`, {
		...init,
		headers,
	});
}

async function parseServiceResponse(response: Response, fallback: string) {
	const payload = await parseResponse<unknown>(response, fallback);
	return payload;
}

export async function getServices(): Promise<Service[]> {
	const response = await fetch(`${requireApiUrl()}/services`, {
		method: "GET",
	});
	const payload = await parseResponse<unknown>(
		response,
		"Não foi possível carregar os serviços."
	);

	return normalizeArray<Service>(payload, ["services", "servicos"]);
}

export async function createService(service: ServiceData): Promise<unknown> {
	const response = await authenticatedRequest("/services", {
		method: "POST",
		body: JSON.stringify(service),
	});

	return parseServiceResponse(response, "Não foi possível adicionar o serviço.");
}

export async function updateService(
	id: number,
	service: ServiceData,
): Promise<unknown> {
	const response = await authenticatedRequest(`/services/${id}`, {
		method: "PUT",
		body: JSON.stringify(service),
	});

	return parseServiceResponse(response, "Não foi possível atualizar o serviço.");
}

export async function deleteService(id: number): Promise<void> {
	const response = await authenticatedRequest(`/services/${id}`, {
		method: "DELETE",
	});

	await parseServiceResponse(response, "Não foi possível excluir o serviço.");
}
