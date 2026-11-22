import { Button } from "@/components/button";
import { FormField } from "@/components/formField";
import Notifications from "@/components/notifications";
import { SelectField } from "@/components/selectField";
import { H1 } from "@/components/text";
import { useTheme } from "@/contexts/theme";
import { createAppointmentFromForm, getAvailableTimeSlots } from "@/services/appointments";
import { fetchAuthenticatedUser, getAuthToken, getAuthUser } from "@/services/auth";
import { getBarbers, type Barber } from "@/services/barbers";
import { formatDateInput, formatDateValue, parseDateInput, parseDateInputToDate } from "@/services/formatters";
import { getNotificationForAppointment, type Notification as BackendNotification } from "@/services/notifications";
import { getServices, Service } from "@/services/serviceList";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SelectOption = {
    label: string;
    value: string;
};

export default function Agendamento() {
    const { currentColor, theme, radius, fontSize, font } = useTheme();
    const params = useLocalSearchParams<{ user_id?: string | string[] }>();
    const router = useRouter();
    const rawUserId = Array.isArray(params.user_id) ? params.user_id[0] : params.user_id;
    const userId = Number(rawUserId);
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
    const userIdValido = Number.isInteger(userId) && userId > 0;
    const [usuarioIdAutenticado, setUsuarioIdAutenticado] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        async function verificarAutenticacao() {
            const token = await getAuthToken();

            if (!mounted) { return }

            if (!token) { router.replace("/login"); return }

            const authUser = (await getAuthUser()) ?? (await fetchAuthenticatedUser());
            setUsuarioIdAutenticado(authUser?.id ?? (userIdValido ? userId : null));
            setUsuarioAutenticado(true);
        }

        verificarAutenticacao();

        return () => {
            mounted = false;
        };
    }, [router]);

    const [servicos, setServicos] = useState<Service[]>([]);
    const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
    const [serviceId, setServiceId] = useState("");
    const [barberId, setBarberId] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);
    const [erroHorarios, setErroHorarios] = useState("");
    const [carregandoServicos, setCarregandoServicos] = useState(true);
    const [carregandoBarbeiros, setCarregandoBarbeiros] = useState(true);
    const [erroServicos, setErroServicos] = useState("");
    const [erroBarbeiros, setErroBarbeiros] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [notification, setNotification] = useState<BackendNotification | null>(null);

    useEffect(() => {
        let mounted = true;

        async function carregarDados() {
            setCarregandoServicos(true);
            setCarregandoBarbeiros(true);
            setErroServicos("");
            setErroBarbeiros("");

            const [servicesResult, barbersResult] = await Promise.allSettled([
                getServices(),
                getBarbers(),
            ]);

            if (!mounted) { return }

            if (servicesResult.status === "fulfilled") {
                setServicos(servicesResult.value);
            } else {
                setErroServicos( servicesResult.reason instanceof Error ? servicesResult.reason.message : "Não foi possível carregar os serviços." );
            }

            if (barbersResult.status === "fulfilled") {
                setBarbeiros(barbersResult.value);
            } else {
                setErroBarbeiros( barbersResult.reason instanceof Error ? barbersResult.reason.message : "Não foi possível carregar os barbeiros." );
            }

            setCarregandoServicos(false);
            setCarregandoBarbeiros(false);
        }

        carregarDados();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const apiDate = parseDateInput(selectedDate.trim());
        const parsedBarberId = Number(barberId);
        const parsedServiceId = Number(serviceId);
        const barberIdValido = Number.isInteger(parsedBarberId) && parsedBarberId > 0;
        const selectedService = servicos.find((servico) => servico.id === parsedServiceId);

        if (!apiDate || !barberIdValido || !selectedService) {
            setAvailableTimeSlots([]);
            setSelectedTimeSlot("");
            setCarregandoHorarios(false);
            return () => { mounted = false; };
        }

        const availabilityDate = apiDate;
        const serviceDuration = selectedService.duration_minutes;
        setSelectedTimeSlot("");
        setCarregandoHorarios(true);

        async function carregarHorariosOcupados() {
            setCarregandoHorarios(true);
            setErroHorarios("");

            try {
                const lista = await getAvailableTimeSlots(
                    parsedBarberId,
                    availabilityDate,
                    serviceDuration
                );

                if (!mounted) { return }

                setAvailableTimeSlots(lista);
            } catch (error) {
                if (mounted) {
                    setAvailableTimeSlots([]);
                    setErroHorarios( error instanceof Error ? error.message : "Não foi possível verificar os horários disponíveis." );
                }
            } finally {
                if (mounted) { setCarregandoHorarios(false) }
            }
        }

        carregarHorariosOcupados();

        return () => { mounted = false };
    }, [barberId, selectedDate, serviceId, servicos]);

    const serviceOptions = useMemo<SelectOption[]>(
        () =>
            servicos.map((servico) => ({
                label: servico.name,
                value: String(servico.id),
            })),
        [servicos]
    );

    const barberOptions = useMemo<SelectOption[]>(
        () =>
            barbeiros.map((barbeiro) => ({
                label: barbeiro.name,
                value: String(barbeiro.id),
            })),
        [barbeiros]
    );

    const timeOptions = useMemo<SelectOption[]>(() => {
        const apiDate = parseDateInput(selectedDate.trim());
        const parsedBarberId = Number(barberId);

        if (!apiDate || !Number.isInteger(parsedBarberId) || parsedBarberId <= 0) {
            return [];
        }

        return availableTimeSlots.map((time) => ({
                label: time,
                value: time,
            }));
    }, [availableTimeSlots, barberId, selectedDate]);

    const limparFormulario = () => {
        setServiceId("");
        setBarberId("");
        setSelectedDate("");
        setSelectedTimeSlot("");
        setNotes("");
        setAvailableTimeSlots([]);
        setCarregandoHorarios(false);
    };

    const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
        setDatePickerVisible(Platform.OS === "ios");

        if (date) {
            setSelectedDate(formatDateValue(date));
            setSelectedTimeSlot("");
            setAvailableTimeSlots([]);
            setCarregandoHorarios(false);
        }
    };

    const enviarAgendamento = async () => {
        if (!usuarioAutenticado) {
            Alert.alert("Login necessário", "Faça login para criar um agendamento.");
            return;
        }

        const appointmentUserId = usuarioIdAutenticado ?? (userIdValido ? userId : null);

        if (appointmentUserId === null) {
            Alert.alert("Erro", "Não foi possível identificar o usuário autenticado.");
            return;
        }

        try {
            setEnviando(true);

            await createAppointmentFromForm({
                userId: appointmentUserId,
                serviceId,
                barberId,
                date: selectedDate,
                time: selectedTimeSlot,
                notes
            });

            limparFormulario();
            setNotification(await getNotificationForAppointment(appointmentUserId));
        } catch (error) {
            Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível criar o agendamento." );
        } finally {
            setEnviando(false);
        }
    };

    const campoDesabilitado = enviando || !usuarioAutenticado;
    const carregandoDados = carregandoServicos || carregandoBarbeiros;

    return (
        <KeyboardAvoidingView
            style={[styles.flex, {
                backgroundColor: currentColor === "dark" ? "#141414" : theme.bodyBg,
            }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <H1>Agendamento</H1>

                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: theme.secondaryColor,
                            fontFamily: font.base,
                            fontSize: fontSize.base,
                        },
                    ]}
                >
                    Preencha os dados abaixo para reservar seu horário.
                </Text>

                {!usuarioAutenticado && (
                    <Text
                        style={[
                            styles.loginAlert,
                            {
                                color: theme.danger,
                                fontFamily: font.baseBold,
                                fontSize: fontSize.lg,
                            },
                        ]}
                    >
                        Faça login para criar um agendamento.
                    </Text>
                )}

                <View
                    style={[
                        styles.form,
                        {
                            backgroundColor: currentColor === "dark" ? "#141414" : theme.secondaryBg,
                            borderColor: theme.borderColor,
                            borderRadius: radius.lg,
                        },
                    ]}
                >
                    {carregandoDados && (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color={theme.primary} />
                            <Text
                                style={{
                                    color: theme.secondaryColor,
                                    fontFamily: font.base,
                                    fontSize: fontSize.base,
                                }}
                            >
                                Carregando dados...
                            </Text>
                        </View>
                    )}

                    <SelectField
                        label="Serviço"
                        placeholder={ carregandoServicos  ? "Carregando serviços..." : "Selecione" }
                        value={serviceId}
                        options={serviceOptions}
                        onChange={setServiceId}
                        disabled={ campoDesabilitado || carregandoServicos || servicos.length === 0 }
                    />

                    {!!erroServicos && (
                        <Text
                            style={[
                                styles.errorText,
                                {
                                    color: theme.danger,
                                    fontFamily: font.baseMedium,
                                    fontSize: fontSize.base,
                                },
                            ]}
                        >
                            {erroServicos}
                        </Text>
                    )}

                    <SelectField
                        label="Barbeiro"
                        placeholder={ carregandoBarbeiros  ? "Carregando barbeiros..." : "Selecione" }
                        value={barberId}
                        options={barberOptions}
                        onChange={(value) => { setBarberId(value); setSelectedTimeSlot(""); setAvailableTimeSlots([]); setCarregandoHorarios(false);  }}
                        disabled={ campoDesabilitado || carregandoBarbeiros || barbeiros.length === 0 }
                    />

                    {!!erroBarbeiros && (
                        <Text
                            style={[
                                styles.errorText,
                                {
                                    color: theme.danger,
                                    fontFamily: font.baseMedium,
                                    fontSize: fontSize.base,
                                },
                            ]}
                        >
                            {erroBarbeiros}
                        </Text>
                    )}

                    <FormField
                        label="Data"
                        value={selectedDate}
                        onChangeText={(value) => {
                            setSelectedDate(formatDateInput(value));
                            setSelectedTimeSlot("");
                            setAvailableTimeSlots([]);
                            setCarregandoHorarios(false);
                        }}
                        editable={!campoDesabilitado}
                        placeholder="DD/MM/AAAA"
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        maxLength={10}
                        rightElement={
                            Platform.OS !== "web" ? (
                                <Pressable
                                    accessibilityLabel="Selecionar data"
                                    accessibilityRole="button"
                                    disabled={campoDesabilitado}
                                    onPress={() => setDatePickerVisible(true)}
                                    style={styles.calendarButton}
                                >
                                    <Ionicons
                                        name="calendar-outline"
                                        size={22}
                                        color={theme.primary}
                                    />
                                </Pressable>
                            ) : undefined
                        }
                    />
                    {datePickerVisible && Platform.OS !== "web" && (
                        <DateTimePicker
                            value={parseDateInputToDate(selectedDate) ?? new Date()}
                            mode="date"
                            display={Platform.OS === "android" ? "calendar" : "default"}
                            onChange={handleDateChange}
                        />
                    )}

                    <SelectField
                        label="Horários disponíveis (15 em 15 minutos)"
                        placeholder={ carregandoHorarios ? "Carregando horários..." : !barberId || !selectedDate ? "Selecione o barbeiro e a data" : timeOptions.length === 0 ? "Nenhum horário disponível" : "Selecione um horário" }
                        value={selectedTimeSlot}
                        options={timeOptions}
                        onChange={setSelectedTimeSlot}
                        disabled={ campoDesabilitado || carregandoHorarios || timeOptions.length === 0 }
                    />

                    {!!erroHorarios && (
                        <Text
                            style={[
                                styles.errorText,
                                {
                                    color: theme.danger,
                                    fontFamily: font.baseMedium,
                                    fontSize: fontSize.base,
                                },
                            ]}
                        >
                            {erroHorarios}
                        </Text>
                    )}

                    <FormField
                        label="Observações"
                        value={notes}
                        onChangeText={setNotes}
                        editable={!campoDesabilitado}
                        placeholder="Opcional"
                        multiline
                        style={styles.notesInput}
                    />

                    <Button
                        onPress={enviarAgendamento}
                        disabled={  enviando || carregandoDados || servicos.length === 0 || barbeiros.length === 0 || !usuarioAutenticado }
                    >
                        {enviando ? "Enviando..." : "Confirmar agendamento"}
                    </Button>
                </View>
            </ScrollView>
            <Modal
                visible={notification !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setNotification(null)}
            >
                <View style={[styles.notificationBackdrop, { backgroundColor: theme.backdrop }]}>
                    {notification && (
                        <Notifications
                            title={notification.title}
                            message={notification.message}
                            type={notification.type}
                            onClose={() => setNotification(null)}
                        />
                    )}
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 48,
    },
    subtitle: {
        marginTop: 10,
        marginBottom: 20,
    },
    loginAlert: {
        marginBottom: 14,
    },
    form: {
        gap: 14,
        padding: 20,
        borderWidth: 1,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    notesInput: {
        minHeight: 88,
        textAlignVertical: "top",
    },
    errorText: {
        marginTop: -6,
    },
    notificationBackdrop: {
        flex: 1,
    },
    calendarButton: {
        padding: 10,
    },
});
