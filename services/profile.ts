import API_URL from "@/services/api";
import { clearAuthToken, getAuthToken } from "@/services/auth";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

const PROFILE_ENDPOINT = "/users/me";
const BARBER_PROFILE_ENDPOINT = "/barbers/me";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type Role = { id: number; name: string };

export type BarberProfile = {
    id?: number;
    user_id?: number;
    name?: string;
    photo: string | null;
    phone: string | null;
    active: boolean;
};

export type ProfileResponse = {
    id: number;
    name: string;
    email: string;
    cpf: string;
    role_id: number;
    role?: Role | null;
    barber?: BarberProfile | null;
};

export type ProfileForm = {
    name: string;
    email: string;
    cpf: string;
    password: string;
    confirmPassword: string;
    phone: string;
    active: boolean;
    photo: string | null;
};

type EditableTextField = Exclude<keyof ProfileForm, "active" | "photo">;

type SelectedPhoto = {
    uri: string;
    fileName: string;
    mimeType: string;
    fileSize?: number;
};

type Status = { type: "success" | "error"; message: string } | null;
type ApiError = { message?: string; error?: string };

const EMPTY_FORM: ProfileForm = {
    name: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    phone: "",
    active: true,
    photo: null,
};

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const formatCPF = (value: string) =>
    onlyDigits(value)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const formatPhone = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

function apiMessage(data: unknown, fallback: string) {
    if (data && typeof data === "object") {
        const error = data as ApiError;
        return error.message || error.error || fallback;
    }
    return fallback;
}

function userFacingError(error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message : "";

    if (/Unsupported FormDataPart implementation/i.test(message)) {
        return "Não foi possível preparar a foto para envio. Selecione outra imagem.";
    }

    return message || fallback;
}

async function readBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

function normalizeProfile(data: unknown): ProfileResponse {
    if (!data || typeof data !== "object") {
        throw new Error("A API retornou um perfil inválido.");
    }

    const root = data as Record<string, unknown>;
    const user = ((root.user as Record<string, unknown> | undefined) ??
        (root.data as Record<string, unknown> | undefined) ??
        root) as unknown as ProfileResponse;

    if (root.user && !user.barber && root.barber) {
        user.barber = root.barber as BarberProfile;
    }

    return user;
}

function normalizeBarberProfile(data: unknown): BarberProfile | null {
    if (!data || typeof data !== "object") return null;

    const root = data as Record<string, unknown>;
    const barber = (root.barber ?? root.data ?? root) as Record<string, unknown>;

    if (
        barber.photo === undefined &&
        barber.phone === undefined &&
        barber.active === undefined
    ) {
        return null;
    }

    return barber as BarberProfile;
}

function photoUrl(photo: string | null) {
    if (!photo) return null;
    if (/^(https?:|file:|blob:|data:)/i.test(photo)) return photo;
    if (!API_URL) return photo;

    return `${API_URL.replace(/\/$/, "")}/${photo.replace(/^\/+/, "")}`;
}

export function useProfile() {
    const router = useRouter();
    const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
    const [role, setRole] = useState<Role | null>(null);
    const [hasBarberProfile, setHasBarberProfile] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [status, setStatus] = useState<Status>(null);

    const roleName = role?.name?.trim().toLowerCase() ?? "";
    const isBarber =
        hasBarberProfile || roleName === "barber" || roleName === "barbeiro";
    const resolvedPhoto = useMemo(
        () => selectedPhoto?.uri ?? photoUrl(form.photo),
        [form.photo, selectedPhoto],
    );

    async function authenticatedFetch(endpoint: string, init: RequestInit = {}) {
        if (!API_URL) throw new Error("EXPO_PUBLIC_URL não está configurada.");

        const token = await getAuthToken();
        if (!token) {
            await logout(false);
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${token}`);

        return fetch(`${API_URL.replace(/\/$/, "")}${endpoint}`, {
            ...init,
            headers,
        });
    }

    async function handleUnauthorized(response: Response) {
        if (response.status !== 401 && response.status !== 403) return false;
        await logout(false);
        return true;
    }

    async function loadProfile() {
        try {
            setLoading(true);
            setStatus(null);

            const response = await authenticatedFetch(PROFILE_ENDPOINT);
            if (await handleUnauthorized(response)) return;

            const data = await readBody(response);
            if (!response.ok) {
                throw new Error(apiMessage(data, "Não foi possível carregar o perfil."));
            }

            const user = normalizeProfile(data);
            const roleName = user.role?.name?.trim().toLowerCase() ?? "";
            const userIsBarber = roleName === "barber" || roleName === "barbeiro";
            let barber = userIsBarber ? user.barber ?? null : null;

            if (userIsBarber) {
                const barberResponse = await authenticatedFetch(BARBER_PROFILE_ENDPOINT);

                if (await handleUnauthorized(barberResponse)) return;

                if (barberResponse.ok) {
                    const barberData = await readBody(barberResponse);
                    barber = normalizeBarberProfile(barberData) ?? barber;
                }
            }

            setRole(user.role ?? null);
            setHasBarberProfile(Boolean(barber));
            setSelectedPhoto(null);
            setForm({
                name: user.name ?? "",
                email: user.email ?? "",
                cpf: formatCPF(user.cpf ?? ""),
                password: "",
                confirmPassword: "",
                phone: formatPhone(barber?.phone ?? ""),
                active: barber?.active ?? true,
                photo: barber?.photo ?? null,
            });
        } catch (error) {
            setStatus({
                type: "error",
                message: userFacingError(error, "Erro ao atualizar perfil."),
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadProfile();
    }, []);

    function changeField(field: EditableTextField, value: string) {
        setStatus(null);
        setForm((current) => ({ ...current, [field]: value }));
    }

    function setActive(active: boolean) {
        setStatus(null);
        setForm((current) => ({ ...current, active }));
    }

    function validate() {
        if (!form.name.trim()) return "Informe o nome.";
        if (!form.email.trim()) return "Informe o e-mail.";
        if (onlyDigits(form.cpf).length !== 11) return "Informe um CPF válido.";
        if (form.password && form.password.length < 8) {
            return "A nova senha deve ter pelo menos 8 caracteres.";
        }
        if (form.password !== form.confirmPassword) {
            return "A confirmação da nova senha não confere.";
        }
        if (isBarber && form.phone && onlyDigits(form.phone).length < 10) {
            return "Informe um telefone válido.";
        }
        return null;
    }

    async function pickPhoto() {
        setStatus(null);
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setStatus({ type: "error", message: "Permita o acesso às fotos." });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        const mimeType = asset.mimeType?.toLowerCase() ?? "";

        if (!ALLOWED_PHOTO_TYPES.has(mimeType)) {
            setStatus({ type: "error", message: "Use uma imagem JPEG, PNG ou WebP." });
            return;
        }
        if (asset.fileSize && asset.fileSize > MAX_PHOTO_SIZE) {
            setStatus({ type: "error", message: "A foto deve ter no máximo 5 MB." });
            return;
        }

        const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
        setSelectedPhoto({
            uri: asset.uri,
            fileName: asset.fileName || `barber-${Date.now()}.${extension}`,
            mimeType,
            fileSize: asset.fileSize,
        });
    }

    async function appendPhoto(
        data: FormData,
        photo: SelectedPhoto,
        fieldName = "photo",
    ) {
        if (Platform.OS === "web") {
            const blob = await (await fetch(photo.uri)).blob();

            if (blob.size > MAX_PHOTO_SIZE) {
                throw new Error("A foto deve ter no máximo 5 MB.");
            }

            data.append(fieldName, blob, photo.fileName);
            return;
        }

        data.append(fieldName, {
            uri: photo.uri,
            name: photo.fileName,
            type: photo.mimeType,
        } as unknown as Blob);
    }

    async function saveUser() {
        const payload: Record<string, string> = {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            cpf: onlyDigits(form.cpf),
        };
        if (form.password) payload.password = form.password;

        const response = await authenticatedFetch(PROFILE_ENDPOINT, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (await handleUnauthorized(response)) throw new Error("Sessão expirada.");

        const data = await readBody(response);
        if (!response.ok) {
            throw new Error(apiMessage(data, "Não foi possível atualizar a conta."));
        }
    }

    async function uploadPhoto(photo: SelectedPhoto) {
        const token = await getAuthToken();

        if (!token) {
            await logout(false);
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        const file = new File(photo.uri);

        const data = new FormData();
        data.append("photo", file);

        const response = await expoFetch(
            `${API_URL!.replace(/\/$/, "")}/upload-image`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            }
        );

        if (await handleUnauthorized(response)) {
            throw new Error("Sessão expirada.");
        }

        const body = await readBody(response);

        if (!response.ok) {
            throw new Error(
                apiMessage(body, "Não foi possível enviar a foto.")
            );
        }

        return body as { url: string };
    }

    async function saveBarber(photoUrl?: string) {
        const payload = {
            name: form.name.trim(),
            phone: onlyDigits(form.phone),
            active: form.active,
            ...(photoUrl ? { photo: photoUrl } : {}),
        };

        const response = await authenticatedFetch(BARBER_PROFILE_ENDPOINT, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (await handleUnauthorized(response)) {
            throw new Error("Sessão expirada.");
        }

        const body = await readBody(response);

        if (!response.ok) {
            throw new Error(
                apiMessage(body, "Não foi possível atualizar o barbeiro.")
            );
        }
    }

    async function save() {
        const validationError = validate();
        if (validationError) {
            setStatus({ type: "error", message: validationError });
            return;
        }

        try {
            let uploadedPhotoUrl: string | undefined;
            if (selectedPhoto) {
                const uploadedPhoto = await uploadPhoto(selectedPhoto);
                uploadedPhotoUrl = uploadedPhoto.url;
            }
            setSaving(true);
            setStatus(null);
            await saveUser();
            if (isBarber) {
                await saveBarber(uploadedPhotoUrl);
            }
            await loadProfile();
            setStatus({ type: "success", message: "Perfil atualizado com sucesso." });
        } catch (error) {
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Erro ao atualizar perfil.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function logout(showLoading = true) {
        try {
            if (showLoading) setLoggingOut(true);
            await clearAuthToken();
        } finally {
            setLoggingOut(false);
            router.replace("/login");
        }
    }

    return {
        form,
        role,
        isBarber,
        selectedPhoto,
        resolvedPhoto,
        loading,
        saving,
        loggingOut,
        status,
        changeField,
        setActive,
        pickPhoto,
        save,
        logout,
    };
}
