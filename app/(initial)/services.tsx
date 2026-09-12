import { Button } from "@/components/button";
import { useTheme } from "@/contexts/theme";
import { fetchAuthenticatedUser, getAuthToken, getAuthUser } from "@/services/auth";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/services/formatters";
import { createService, deleteService, getServices, Service, ServiceData, updateService } from "@/services/serviceList";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

export default function Services() {
  const { width } = useWindowDimensions();
  const { theme, font, fontSize, space, radius } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBarber, setIsBarber] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceData>({
    name: "",
    description: "",
    duration_minutes: 0,
    price: 0,
  });
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      const token = await getAuthToken();
      if (!token) return;

      const user = (await getAuthUser()) ?? (await fetchAuthenticatedUser());
      const roleName = user?.role?.name?.trim().toLowerCase();
      setIsBarber(roleName === "barber" || roleName === "barbeiro");
    }

    void loadPermissions();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      try {
        const data = await getServices();

        if (mounted) {
          setServices(data);
        }
      } catch (serviceError) {
        if (mounted) {
          setError(
            serviceError instanceof Error ? serviceError.message : "Não foi possível carregar os serviços."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const serviceRows: Service[][] = [];

  for (let index = 0; index < services.length; index += columns) {
    serviceRows.push(services.slice(index, index + columns));
  }

  function resetForm() {
    setEditingServiceId(null);
    setForm({ name: "", description: "", duration_minutes: 0, price: 0 });
    setFormPrice("");
    setFormDuration("");
  }

  function startEditing(service: Service) {
    setEditingServiceId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
    });
    setFormPrice(formatCurrency(service.price));
    setFormDuration(String(service.duration_minutes));
  }

  async function saveService() {
    const duration = Number(formDuration);
    const price = parseCurrencyInput(formPrice);

    if (!form.name.trim() || !form.description.trim() || !Number.isFinite(duration) || duration <= 0 || price === null || price < 0) {
      Alert.alert("Dados inválidos", "Preencha nome, descrição, duração e preço corretamente.");
      return;
    }

    const data: ServiceData = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration_minutes: duration,
      price,
    };

    try {
      setSaving(true);
      if (editingServiceId === null) {
        await createService(data);
      } else {
        await updateService(editingServiceId, data);
      }
      setServices(await getServices());
      resetForm();
    } catch (saveError) {
      Alert.alert("Erro", saveError instanceof Error ? saveError.message : "Não foi possível salvar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(service: Service) {
    Alert.alert("Excluir serviço", `Deseja excluir ${service.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteService(service.id);
            setServices((current) => current.filter((item) => item.id !== service.id));
          } catch (deleteError) {
            Alert.alert("Erro", deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o serviço.");
          }
        },
      },
    ]);
  }

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bodyBg,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      paddingHorizontal: space[5],
      paddingVertical: space[6],
    },
    title: {
      color: theme.bodyColor,
      fontFamily: font.headingFamily,
      fontSize: fontSize.h1,
      textAlign: "center",
      marginBottom: space[7],
    },
    listContent: {
      paddingBottom: space[6],
    },
    row: {
      gap: space[5],
    },
    cardWrapper: {
      flex: 1,
      marginBottom: space[5],
    },
    card: {
      flex: 1,
      minHeight: 190,
      padding: space[5],
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: radius.base,
      backgroundColor: theme.secondaryBg,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    cardTitle: {
      color: theme.primary,
      fontFamily: font.baseBold,
      fontSize: fontSize.h3,
      marginBottom: space[3],
    },
    description: {
      color: theme.secondaryColor,
      fontFamily: font.base,
      fontSize: fontSize.base,
      lineHeight: 20,
      marginBottom: space[3],
    },
    info: {
      color: theme.secondaryColor,
      fontFamily: font.baseMedium,
      fontSize: fontSize.base,
      marginBottom: space[2],
    },
    price: {
      color: theme.primary,
      fontFamily: font.baseBold,
      fontSize: fontSize.lg,
      marginTop: space[1],
    },
    centeredMessage: {
      alignItems: "center",
      paddingVertical: space[6],
    },
    message: {
      color: theme.secondaryColor,
      fontFamily: font.base,
      fontSize: fontSize.base,
      textAlign: "center",
    },
    management: {
      marginBottom: space[6],
      padding: space[4],
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: radius.base,
      backgroundColor: theme.secondaryBg,
      gap: space[3],
    },
    editForm: {
      gap: space[3],
    },
    input: {
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: radius.base,
      color: theme.bodyColor,
      fontFamily: font.base,
      fontSize: fontSize.base,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    actions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: space[3],
    },
    actionText: {
      color: theme.primary,
      fontFamily: font.baseBold,
      fontSize: fontSize.base,
      textAlign: "center",
      padding: space[2],
    },
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Nossos Serviços</Text>

        {isBarber && editingServiceId === null && (
          <View style={styles.management}>
            <Text style={styles.cardTitle}>
              Adicionar serviço
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              placeholder="Nome"
              placeholderTextColor={theme.tertiaryColor}
              style={styles.input}
            />
            <TextInput
              value={form.description}
              onChangeText={(description) => setForm((current) => ({ ...current, description }))}
              placeholder="Descrição"
              placeholderTextColor={theme.tertiaryColor}
              style={styles.input}
              multiline
            />
            <TextInput
              value={formDuration}
              onChangeText={setFormDuration}
              placeholder="Duração em minutos"
              placeholderTextColor={theme.tertiaryColor}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              value={formPrice}
              onChangeText={(value) => setFormPrice(formatCurrencyInput(value))}
              placeholder="Preço"
              placeholderTextColor={theme.tertiaryColor}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Button onPress={saveService} disabled={saving}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </View>
        )}

        {isLoading ? (
          <View style={styles.centeredMessage}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centeredMessage}>
            <Text style={styles.message}>{error}</Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {serviceRows.map((row, rowIndex) => (
              <View key={`service-row-${rowIndex}`} style={styles.row}>
                {row.map((item) => (
                  <View key={item.id} style={styles.cardWrapper}>
                    <View style={styles.card}>
                        {editingServiceId === item.id ? (
                          <View style={styles.editForm}>
                            <Text style={styles.cardTitle}>Editar serviço</Text>
                            <TextInput
                              value={form.name}
                              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
                              placeholder="Nome"
                              placeholderTextColor={theme.tertiaryColor}
                              style={styles.input}
                            />
                            <TextInput
                              value={form.description}
                              onChangeText={(description) => setForm((current) => ({ ...current, description }))}
                              placeholder="Descrição"
                              placeholderTextColor={theme.tertiaryColor}
                              style={styles.input}
                              multiline
                            />
                            <TextInput
                              value={formDuration}
                              onChangeText={setFormDuration}
                              placeholder="Duração em minutos"
                              placeholderTextColor={theme.tertiaryColor}
                              keyboardType="numeric"
                              style={styles.input}
                            />
                            <TextInput
                              value={formPrice}
                              onChangeText={(value) => setFormPrice(formatCurrencyInput(value))}
                              placeholder="Preço"
                              placeholderTextColor={theme.tertiaryColor}
                              keyboardType="decimal-pad"
                              style={styles.input}
                            />
                            <Button onPress={saveService} disabled={saving}>
                              {saving ? "Salvando..." : "Salvar"}
                            </Button>
                            <Text style={styles.actionText} onPress={resetForm}>Cancelar edição</Text>
                          </View>
                        ) : (
                          <>
                            <Text style={styles.cardTitle}>{item.name}</Text>

                            <Text style={styles.description}>{item.description}</Text>

                            <Text style={styles.info}>
                              Tempo: {item.duration_minutes} min
                            </Text>

                            <Text style={styles.price}>
                              Preço: {formatCurrency(item.price)}
                            </Text>
                          </>
                        )}
                        {isBarber && editingServiceId !== item.id && (
                        <View style={styles.actions}>
                          <Text style={styles.actionText} onPress={() => startEditing(item)}>Editar</Text>
                          <Text style={styles.actionText} onPress={() => confirmDelete(item)}>Excluir</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
                {row.length < columns && <View style={styles.cardWrapper} />}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
