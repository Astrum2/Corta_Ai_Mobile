import { FormField } from "@/components/formField";
import { SelectField } from "@/components/selectField";
import { useTheme } from "@/contexts/theme";
import { TIME_SLOTS, type Appointment } from "@/services/appointments";
import { deleteUserAppointment, getUserAppointments, updateUserAppointment } from "@/services/appointmentsUser";
import { formatDateInput, parseDateInput } from "@/services/formatters";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(value: string) {
    const [year, month, day] = value.split("-");

    return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatStatus(status: string) {
    const labels: Record<string, string> = {
        scheduled: "Agendado",
        confirmed: "Confirmado",
        completed: "Concluído",
        cancelled: "Cancelado",
    };

    return labels[status] ?? status;
}

export default function MeusAgendamentos() {
    const { theme, font, fontSize, radius, space } = useTheme();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setAppointments(await getUserAppointments());
        } catch (reason) {
            setError(
                reason instanceof Error ? reason.message : "Não foi possível carregar seus agendamentos."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const openEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setEditDate(formatDate(appointment.date).replace(/-/g, "/"));
        setEditTime(appointment.time);
        setEditNotes(appointment.notes ?? "");
    };

    const closeEdit = () => {
        if (savingId === null) {
            setEditingAppointment(null);
        }
    };

    const saveEdit = async () => {
        if (!editingAppointment) {
            return;
        }

        const date = parseDateInput(editDate);

        if (!date) {
            Alert.alert("Data inválida", "Informe a data no formato DD/MM/AAAA.");
            return;
        }

        if (!editTime.trim()) {
            Alert.alert("Horário inválido", "Informe um horário.");
            return;
        }

        try {
            setSavingId(editingAppointment.id);
            await updateUserAppointment(editingAppointment.id, {
                service_id: editingAppointment.service_id,
                barber_id: editingAppointment.barber_id,
                date,
                time: editTime.trim(),
                status: editingAppointment.status,
                notes: editNotes.trim() || null,
            });
            setEditingAppointment(null);
            await loadAppointments();
        } catch (reason) {
            Alert.alert(
                "Erro",
                reason instanceof Error ? reason.message : "Não foi possível atualizar o agendamento."
            );
        } finally {
            setSavingId(null);
        }
    };

    const confirmDelete = (appointment: Appointment) => {
        Alert.alert(
            "Excluir agendamento",
            "Deseja realmente excluir este agendamento?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeletingId(appointment.id);
                            await deleteUserAppointment(appointment.id);
                            await loadAppointments();
                        } catch (reason) {
                            Alert.alert(
                                "Erro",
                                reason instanceof Error ? reason.message : "Não foi possível excluir o agendamento."
                            );
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [loadAppointments])
    );

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: theme.bodyBg,
            }}
        >
            <Stack.Screen options={{ title: "Meus agendamentos" }} />
            <FlatList
                data={appointments}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={[styles.list, { padding: space[4] }]}
                refreshing={loading}
                onRefresh={loadAppointments}
                ListHeaderComponent={
                    <Text
                        style={{
                            color: theme.bodyColor,
                            fontFamily: font.baseBold,
                            fontSize: fontSize.h2,
                            marginBottom: space[4],
                        }}
                    >
                        Meus agendamentos
                    </Text>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.feedback}>
                            <ActivityIndicator color={theme.primary} />
                            <Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
                                Carregando agendamentos...
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.feedback}>
                            <Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
                                {error || "Você ainda não possui agendamentos."}
                            </Text>
                            {!!error && (
                                <Pressable onPress={loadAppointments}>
                                    <Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                                        Tentar novamente
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )
                }
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.secondaryBg,
                                borderColor: theme.borderColor,
                                borderRadius: radius.lg,
                                marginBottom: space[3],
                                padding: space[4],
                            },
                        ]}
                    >
                        <Text style={{ color: theme.bodyColor, fontFamily: font.baseBold, fontSize: fontSize.lg }}>
                            {item.service?.name ?? `Serviço #${item.service_id}`}
                        </Text>
                        <Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
                            Barbeiro: {item.barber?.name ?? `#${item.barber_id}`}
                        </Text>
                        <Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
                            Data: {formatDate(item.date)} às {item.time}
                        </Text>
                        <Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                            Status: {formatStatus(item.status)}
                        </Text>
                        {!!item.notes && (
                            <Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
                                Observações: {item.notes}
                            </Text>
                        )}
                        <View style={styles.actions}>
                            <Pressable
                                onPress={() => openEdit(item)}
                                disabled={savingId !== null || deletingId !== null}
                                style={[styles.actionButton, { borderColor: theme.borderColor }]}
                            >
                                <Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                                    Editar
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => confirmDelete(item)}
                                disabled={savingId !== null || deletingId !== null}
                                style={[styles.actionButton, { backgroundColor: theme.danger, borderColor: theme.danger }]}
                            >
                                <Text style={{ color: "#FFFFFF", fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                                    {deletingId === item.id ? "Excluindo..." : "Excluir"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />
            <Modal
                visible={editingAppointment !== null}
                transparent
                animationType="slide"
                onRequestClose={closeEdit}
            >
                <View style={[styles.modalBackdrop, { backgroundColor: theme.backdrop }]}>
                    <View
                        style={[
                            styles.modal,
                            {
                                backgroundColor: theme.secondaryBg,
                                borderColor: theme.borderColor,
                                borderRadius: radius.lg,
                            },
                        ]}
                    >
                        <Text style={{ color: theme.bodyColor, fontFamily: font.baseBold, fontSize: fontSize.h3 }}>
                            Editar agendamento
                        </Text>
                        <FormField
                            label="Data"
                            value={editDate}
                            onChangeText={(value) => setEditDate(formatDateInput(value))}
                            placeholder="DD/MM/AAAA"
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        <SelectField
                            label="Horário"
                            value={editTime}
                            options={TIME_SLOTS.map((time) => ({ label: time, value: time }))}
                            onChange={setEditTime}
                            placeholder="Selecione um horário"
                            disabled={savingId !== null}
                        />
                        <FormField
                            label="Observações"
                            value={editNotes}
                            onChangeText={setEditNotes}
                            placeholder="Opcional"
                            multiline
                            style={styles.notesInput}
                        />
                        <View style={styles.modalActions}>
                            <Pressable onPress={closeEdit} disabled={savingId !== null}>
                                <Text style={{ color: theme.secondaryColor, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                                    Cancelar
                                </Text>
                            </Pressable>
                            <Pressable onPress={saveEdit} disabled={savingId !== null}>
                                <Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
                                    {savingId !== null ? "Salvando..." : "Salvar"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    list: {
        flexGrow: 1,
    },
    feedback: {
        alignItems: "center",
        gap: 12,
        paddingVertical: 32,
    },
    card: {
        borderWidth: 1,
        gap: 6,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 8,
        minWidth: 88,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    modal: {
        alignSelf: "center",
        borderWidth: 1,
        maxWidth: 520,
        padding: 20,
        width: "100%",
    },
    modalActions: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 24,
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: "top",
    },
});
