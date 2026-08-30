import { Button } from "@/components/button";
import { ProfilePicture } from "@/components/profile-picture";
import { H2 } from "@/components/text";
import { useTheme } from "@/contexts/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type ProfileForm = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
};

const INITIAL_PROFILE: ProfileForm = {
  nome: "João da Silva",
  email: "joao@email.com",
  telefone: "(41) 99999-9999",
  cpf: "000.000.000-00",
};

const PROFILE_IMAGE =
  "https://avatars.githubusercontent.com/u/106830297?v=4";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCPF = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatTelefone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function Profile() {
  const { theme, font, fontSize, space, radius, currentColor, toggleTheme } =
    useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const isWide = width >= 768;

  const [form, setForm] = useState<ProfileForm>(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setSaved(false);
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.bodyBg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingHorizontal: space[5], paddingVertical: isWide ? space[8] : space[6] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={[styles.header, { marginBottom: space[5] }]}>
            <Text
              style={{
                marginBottom: space[2],
                color: theme.primary,
                fontFamily: font.baseSemibold,
                fontSize: fontSize.sm,
                letterSpacing: 2,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Minha conta
            </Text>

            <Text
              style={{
                color: theme.bodyColor,
                fontFamily: font.baseBold,
                fontSize: fontSize.h2,
                textAlign: "center",
                marginBottom: space[2],
              }}
            >
              Perfil
            </Text>

            <Text
              style={{
                color: theme.secondaryColor,
                fontFamily: font.base,
                fontSize: fontSize.base,
                lineHeight: 21,
                textAlign: "center",
              }}
            >
              Consulte e atualize suas informações pessoais.
            </Text>
          </View>


          <View
            style={[
              styles.profileCard,
              {
                padding: isWide ? space[7] : space[5],
                borderRadius: radius.xl,
                borderColor: theme.borderColor,
                backgroundColor: theme.secondaryBg,
              },
            ]}
          >
            <View
              style={[
                styles.identity,
                {
                  paddingBottom: space[5],
                  marginBottom: space[5],
                  borderBottomColor: theme.borderColor,
                },
              ]}
            >
              <ProfilePicture fotoUrl={PROFILE_IMAGE} />

              <Text
                style={{
                  marginTop: space[3],
                  color: theme.bodyColor,
                  fontFamily: font.baseBold,
                  fontSize: fontSize.h3,
                }}
              >
                {form.nome}
              </Text>

              <Text
                style={{
                  marginTop: space[1],
                  color: theme.secondaryColor,
                  fontFamily: font.base,
                  fontSize: fontSize.base,
                }}
              >
                {form.email}
              </Text>
            </View>

            <View style={[styles.section, { gap: space[4] }]}>
              <H2>Informações pessoais</H2>

              <View
                style={[
                  styles.formRow,
                  {
                    flexDirection: isWide ? "row" : "column",
                    gap: space[4],
                  },
                ]}
              >
                <View style={styles.field}>
                  <Text
                    style={{
                      marginBottom: space[2],
                      color: theme.bodyColor,
                      fontFamily: font.baseSemibold,
                      fontSize: fontSize.base,
                    }}
                  >
                    Nome
                  </Text>
                  <TextInput
                    value={form.nome}
                    onChangeText={(value) =>
                      handleChange("nome", value)
                    }
                    placeholder="Seu nome"
                    placeholderTextColor={theme.tertiaryColor}
                    style={[
                      styles.input,
                      {
                        paddingHorizontal: space[4],
                        paddingVertical: space[3],
                        borderRadius: radius.base,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        color: theme.bodyColor,
                        fontFamily: font.base,
                        fontSize: fontSize.base,
                      },
                    ]}
                  />
                </View>

                <View style={styles.field}>
                  <Text
                    style={{
                      marginBottom: space[2],
                      color: theme.bodyColor,
                      fontFamily: font.baseSemibold,
                      fontSize: fontSize.base,
                    }}
                  >
                    E-mail
                  </Text>
                  <TextInput
                    value={form.email}
                    editable={false}
                    style={[
                      styles.input,
                      {
                        paddingHorizontal: space[4],
                        paddingVertical: space[3],
                        borderRadius: radius.base,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        color: theme.tertiaryColor,
                        fontFamily: font.base,
                        fontSize: fontSize.base,
                      },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.formRow,
                  {
                    flexDirection: isWide ? "row" : "column",
                    gap: space[4],
                  },
                ]}
              >
                <View style={styles.field}>
                  <Text
                    style={{
                      marginBottom: space[2],
                      color: theme.bodyColor,
                      fontFamily: font.baseSemibold,
                      fontSize: fontSize.base,
                    }}
                  >
                    Telefone
                  </Text>
                  <TextInput
                    value={form.telefone}
                    onChangeText={(value) => handleChange("telefone", formatTelefone(value))}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={theme.tertiaryColor}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      {
                        paddingHorizontal: space[4],
                        paddingVertical: space[3],
                        borderRadius: radius.base,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        color: theme.bodyColor,
                        fontFamily: font.base,
                        fontSize: fontSize.base,
                      },
                    ]}
                  />
                </View>

                <View style={styles.field}>
                  <Text
                    style={{
                      marginBottom: space[2],
                      color: theme.bodyColor,
                      fontFamily: font.baseSemibold,
                      fontSize: fontSize.base,
                    }}
                  >
                    CPF
                  </Text>
                  <TextInput
                    value={form.cpf}
                    onChangeText={(value) => handleChange("cpf", formatCPF(value))}
                    placeholder="000.000.000-00"
                    placeholderTextColor={theme.tertiaryColor}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        paddingHorizontal: space[4],
                        paddingVertical: space[3],
                        borderRadius: radius.base,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        color: theme.bodyColor,
                        fontFamily: font.base,
                        fontSize: fontSize.base,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={{ marginTop: space[2] }}>
                <Button onPress={() => setSaved(true)}>
                  Salvar alterações
                </Button>
              </View>

              {saved && (
                <View
                  style={[
                    styles.successBox,
                    {
                      marginTop: space[2],
                      padding: space[3],
                      borderRadius: radius.base,
                      borderColor: theme.success,
                      backgroundColor: theme.tertiaryBg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.success,
                      fontFamily: font.baseMedium,
                      fontSize: fontSize.base,
                      textAlign: "center",
                    }}
                  >
                    Alterações salvas localmente.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.bottomGrid,
              {
                marginTop: space[5],
                flexDirection: isWide ? "row" : "column",
                gap: space[4],
              },
            ]}
          >
            <View
              style={[
                styles.secondaryCard,
                {
                  padding: space[5],
                  borderRadius: radius.lg,
                  borderColor: theme.borderColor,
                  backgroundColor: theme.secondaryBg,
                },
              ]}
            >
              <H2>Preferências</H2>
              <Text
                style={{
                  marginVertical: space[3],
                  color: theme.secondaryColor,
                  fontFamily: font.base,
                  fontSize: fontSize.base,
                }}
              >
                Tema atual:{" "}
                {currentColor === "dark" ? "Escuro" : "Claro"}
              </Text>
              <View style={styles.actionWrap}>
                <Button onPress={toggleTheme}>Trocar tema</Button>
              </View>
            </View>

            <View
              style={[
                styles.secondaryCard,
                {
                  padding: space[5],
                  borderRadius: radius.lg,
                  borderColor: theme.borderColor,
                  backgroundColor: theme.secondaryBg,
                },
              ]}
            >
              <H2>Sessão</H2>
              <Text
                style={{
                  marginVertical: space[3],
                  color: theme.secondaryColor,
                  fontFamily: font.base,
                  fontSize: fontSize.base,
                }}
              >
                Retorne à tela de login.
              </Text>
              <View style={styles.actionWrap}>
                <Button onPress={() => router.replace("/login")}>Sair da conta</Button>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
  },
  profileCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  identity: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 16,
    marginBottom: 16,
  },
  section: {
    width: "100%",
  },
  formRow: {
    width: "100%",
  },
  field: {
    flex: 1,
    width: "100%",
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    backgroundColor: "#f8f8f8",
  },
  successBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#7dd3a8",
    backgroundColor: "#f0fdf4",
  },
  bottomGrid: {
    width: "100%",
    alignItems: "stretch",
  },
  secondaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 0.5,
  },
  actionWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
});