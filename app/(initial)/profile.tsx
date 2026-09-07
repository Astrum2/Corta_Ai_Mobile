import { FormField } from "@/components/formField";
import { ProfilePicture } from "@/components/profile-picture";
import { useTheme } from "@/contexts/theme";
import { formatCPF, formatPhone, useProfile } from "@/services/profile";
import React from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { currentColor, theme, font, fontSize, radius, space, toggleTheme } = useTheme();
  const { form, role, isBarber, selectedPhoto, resolvedPhoto, loading, saving, loggingOut, status, changeField, setActive, pickPhoto, save, logout } = useProfile();
console.log("Database photo:", form.photo);
console.log("Selected photo:", selectedPhoto?.uri);
console.log("Resolved photo:", resolvedPhoto);
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bodyBg }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{
            color: theme.secondaryColor,
            fontFamily: font.base,
            fontSize: fontSize.base,
            marginTop: space[3],
          }}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bodyBg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingHorizontal: space[4], paddingVertical: space[6] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.card,
          {
            backgroundColor: theme.secondaryBg,
            borderColor: theme.bodyColor,
            borderRadius: radius.lg,
            padding: space[5],
          },
        ]}>
          <Text style={[
            styles.title,
            {
              color: theme.bodyColor,
              fontFamily: font.baseBold,
              fontSize: fontSize.h2,
              marginBottom: space[4],
            },
          ]}>
            Meu perfil
          </Text>

          <View style={[
            styles.identity,
            {
              borderBottomColor: theme.borderColor,
              marginBottom: space[4],
              paddingBottom: space[4],
            },
          ]}>


            {isBarber && (
              <>
                <ProfilePicture fotoUrl={resolvedPhoto ?? ""} />

                <Pressable
                  onPress={pickPhoto}
                  style={({ pressed }) => [
                    styles.photoButton,
                    {
                      borderColor: theme.borderColor,
                      borderRadius: radius.base,
                      marginTop: space[2],
                      backgroundColor: pressed
                        ? theme.tertiaryBg
                        : theme.secondaryBg,
                    },
                  ]}
                >
                  <Text style={{
                    color: theme.bodyColor,
                    fontFamily: font.baseMedium,
                    fontSize: fontSize.base,
                  }}>
                    Alterar foto
                  </Text>
                </Pressable>
              </>
            )}

            <Text style={{
              color: theme.bodyColor,
              fontFamily: font.baseBold,
              fontSize: fontSize.h4,
              marginTop: space[3],
            }}>
              {form.name || "Usuário"}
            </Text>

            <Text style={{
              color: theme.secondaryColor,
              fontFamily: font.base,
              fontSize: fontSize.base,
              marginTop: space[1],
            }}>
              {form.email}
            </Text>

            {role?.name && (
              <Text style={{
                color: theme.primary,
                fontFamily: font.baseSemibold,
                fontSize: fontSize.sm,
                marginTop: space[1],
              }}>
                {role.name}
              </Text>
            )}
          </View>

          <Text style={[
            styles.sectionTitle,
            {
              color: theme.bodyColor,
              fontFamily: font.baseSemibold,
              fontSize: fontSize.lg,
              marginBottom: space[3],
            },
          ]}>
            Dados da conta
          </Text>

          <FormField
            label="Nome:"
            value={form.name}
            onChangeText={(value) => changeField("name", value)}
            placeholder="Nome"
            autoCapitalize="words"
          />
          <FormField
            label="Email:"
            value={form.email}
            onChangeText={(value) => changeField("email", value)}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormField
            label="CPF:"
            value={form.cpf}
            onChangeText={(value) => changeField("cpf", formatCPF(value))}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
          />
          <FormField
            label="Nova senha:"
            value={form.password}
            onChangeText={(value) => changeField("password", value)}
            placeholder="Deixe vazio para manter a senha"
            secureTextEntry
            autoCapitalize="none"
          />
          <FormField
            label="Confirmar nova senha:"
            value={form.confirmPassword}
            onChangeText={(value) => changeField("confirmPassword", value)}
            placeholder="Repita a nova senha"
            secureTextEntry
            autoCapitalize="none"
          />

          {isBarber && (
            <View style={[
              styles.barberSection,
              {
                borderTopColor: theme.borderColor,
                marginTop: space[2],
                paddingTop: space[4],
              },
            ]}>
              <Text style={[
                styles.sectionTitle,
                {
                  color: theme.bodyColor,
                  fontFamily: font.baseSemibold,
                  fontSize: fontSize.lg,
                  marginBottom: space[3],
                },
              ]}>
                Dados do barbeiro
              </Text>

              <FormField
                label="Telefone:"
                value={form.phone}
                onChangeText={(value) => changeField("phone", formatPhone(value))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
              />

              <View style={[
                styles.switchRow,
                {
                  backgroundColor: theme.tertiaryBg,
                  borderColor: theme.borderColor,
                  borderRadius: radius.base,
                  marginBottom: space[3],
                  padding: space[3],
                },
              ]}>
                <View style={styles.switchText}>
                  <Text style={{
                    color: theme.bodyColor,
                    fontFamily: font.baseMedium,
                    fontSize: fontSize.base,
                  }}>
                    Perfil ativo
                  </Text>
                  <Text style={{
                    color: theme.secondaryColor,
                    fontFamily: font.base,
                    fontSize: fontSize.sm,
                    marginTop: space[1],
                  }}>
                    Define se você aparece como barbeiro ativo.
                  </Text>
                </View>
                <Switch value={form.active} onValueChange={setActive} />
              </View>

              {selectedPhoto && (
                <Text style={{
                  color: theme.secondaryColor,
                  fontFamily: font.base,
                  fontSize: fontSize.sm,
                  marginBottom: space[3],
                }}>
                  Nova foto: {selectedPhoto.fileName}
                </Text>
              )}
            </View>
          )}

          {status && (
            <View style={[
              styles.status,
              {
                backgroundColor: theme.tertiaryBg,
                borderColor: status.type === "success"
                  ? theme.success
                  : theme.danger,
                borderRadius: radius.base,
                marginBottom: space[3],
                padding: space[3],
              },
            ]}>
              <Text style={{
                color: status.type === "success"
                  ? theme.success
                  : theme.danger,
                fontFamily: font.baseMedium,
                fontSize: fontSize.base,
                textAlign: "center",
              }}>
                {status.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={save}
            disabled={saving}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed
                  ? theme.secondaryColor
                  : theme.bodyColor,
                borderRadius: radius.base,
                marginBottom: space[3],
              },
            ]}
          >
            <Text style={[
              styles.buttonText,
              {
                color: theme.secondaryBg,
                fontFamily: font.baseSemibold,
                fontSize: fontSize.lg,
              },
            ]}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: pressed
                  ? theme.tertiaryBg
                  : theme.secondaryBg,
                borderColor: theme.borderColor,
                borderRadius: radius.base,
                marginBottom: space[3],
              },
            ]}
          >
            <Text style={{
              color: theme.bodyColor,
              fontFamily: font.baseMedium,
              fontSize: fontSize.base,
            }}>
              Tema: {currentColor === "dark" ? "Escuro" : "Claro"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => logout()}
            disabled={loggingOut}
            style={[
              styles.button,
              {
                backgroundColor: theme.danger,
                borderRadius: radius.base,
              },
            ]}
          >
            <Text style={[
              styles.buttonText,
              {
                color: "#FFFFFF",
                fontFamily: font.baseSemibold,
                fontSize: fontSize.lg,
              },
            ]}>
              {loggingOut ? "Saindo..." : "Sair da conta"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flexGrow: 1, alignItems: "center" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { textAlign: "left" },
  identity: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  sectionTitle: { width: "100%" },
  barberSection: { width: "100%", borderTopWidth: 1 },
  switchRow: {
    width: "100%",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: { flex: 1, marginRight: 12 },
  status: { width: "100%", borderWidth: 1 },
  photoButton: {
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    width: "100%",
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  secondaryButton: {
    width: "100%",
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttonText: { textAlign: "center" },
  card: {
    width: "100%",
    maxWidth: 500,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#0a0a0a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.10)" },
    }),
  },
});