import { useTheme } from "@/contexts/theme";
import { getBarberAppointments, type BarberSchedule } from "@/services/appointmentsBarber";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(value: string) {
	const [year, month, day] = value.split("-");

	return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatTime(value: string | undefined) {
	return value?.slice(0, 5) ?? "Não informado";
}

function formatStatus(status: string) {
	const labels: Record<string, string> = {
		booked: "Reservado",
		scheduled: "Agendado",
		confirmed: "Confirmado",
		completed: "Concluído",
		cancelled: "Cancelado",
	};

	return labels[status] ?? status;
}

export default function AgendaBarbeiro() {
	const { theme, font, fontSize, radius, space } = useTheme();
	const [appointments, setAppointments] = useState<BarberSchedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadAppointments = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			setAppointments(await getBarberAppointments());
		} catch (reason) {
			setError(
				reason instanceof Error
					? reason.message
					: "Não foi possível carregar a agenda do barbeiro."
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void loadAppointments();
		}, [loadAppointments])
	);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bodyBg }]}>
			<Stack.Screen options={{ title: "Agenda do barbeiro" }} />
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
						Agenda do barbeiro
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
							Data: {formatDate(item.date)}
						</Text>
						<Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
							Horário inicial: {formatTime(item.slots[0]?.start)}
						</Text>
						<Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
							Horário final: {formatTime(item.slots[item.slots.length - 1]?.end)}
						</Text>
						<Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
							Duração: {item.serviceDuration} minutos
						</Text>
						<Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
							Serviço: {item.serviceName}
						</Text>
						<Text style={{ color: theme.secondaryColor, fontFamily: font.base, fontSize: fontSize.base }}>
							Notas: {item.notes || "Sem notas"}
						</Text>
						<Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.base }}>
							Status: {formatStatus(item.status)}
						</Text>
					</View>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
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
});
