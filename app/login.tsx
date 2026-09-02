import { useTheme } from "@/contexts/theme";
import { loginUser } from "@/services/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export default function Login() {
    const { currentColor, theme, font, fontSize, radius, space } = useTheme();
    const inputTextColor = currentColor === "dark" ? "#FFFFFF" : theme.bodyColor;

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const login = async () => {
        if (!email.trim()){
            Alert.alert("Erro", "Campo email é obrigatório")
            return
        }

        if (!senha.trim()) {
            Alert.alert("Erro", "Senha é obrigatória")
            return
        }

        try {
            setLoading(true)
            const response = await loginUser(email, senha)

            Alert.alert(
                "Sucesso",
                response.message || "Login realizado com sucesso!",
                [{ text: "OK", onPress: () => router.replace("/(initial)/home") }]
            )
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Não foi possível realizar o login."

            Alert.alert("Erro", message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
        <View
            style={[
                styles.page,
                {
                    backgroundColor: theme.bodyBg,
                    paddingHorizontal: space[4],
                },
            ]}
        >
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.secondaryBg,
                        borderColor: theme.bodyColor,
                        borderRadius: radius.lg,
                        padding: space[7],
                    },
                ]}
            >
                <Text
                    style={[
                        styles.title,
                        {
                            color: theme.bodyColor,
                            fontFamily: font.baseBold,
                            fontSize: fontSize.h2,
                            marginBottom: space[6],
                        },
                    ]}
                >
                    Login
                </Text>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text
                        style={[
                            styles.label,
                            {
                                color: theme.bodyColor,
                                fontFamily: font.baseMedium,
                                fontSize: fontSize.base,
                                marginBottom: space[2],
                            },
                        ]}
                    >
                        Email:
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: inputTextColor,
                                backgroundColor: theme.tertiaryBg,
                                borderColor: theme.borderColor,
                                borderRadius: radius.base,
                                fontFamily: font.base,
                                fontSize: fontSize.lg,
                            },
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Email"
                        placeholderTextColor={inputTextColor}
                    />
                </View>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text
                        style={[
                            styles.label,
                            {
                                color: theme.bodyColor,
                                fontFamily: font.baseMedium,
                                fontSize: fontSize.base,
                                marginBottom: space[2],
                            },
                        ]}
                    >
                        Senha:
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: inputTextColor,
                                backgroundColor: theme.tertiaryBg,
                                borderColor: theme.borderColor,
                                borderRadius: radius.base,
                                fontFamily: font.base,
                                fontSize: fontSize.lg,
                            },
                        ]}
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Senha"
                        placeholderTextColor={inputTextColor}
                        secureTextEntry
                    />
                </View>

                <Pressable
                    onPress={login}
                    disabled={loading}
                    style={({ pressed }) => [
                        styles.button,
                        {
                            backgroundColor: pressed
                                ? theme.secondaryColor
                                : theme.bodyColor,
                            borderRadius: radius.base,
                            marginTop: space[1],
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                color: theme.secondaryBg,
                                fontFamily: font.baseSemibold,
                                fontSize: fontSize.lg,
                            },
                        ]}
                    >
                            {loading ? "Entrando..." : "Entrar"}
                    </Text>
                </Pressable>

                <View
                    style={[
                        styles.registerRow,
                        { marginTop: space[4] },
                    ]}
                >
                    <Text
                        style={{
                            color: theme.secondaryColor,
                            fontFamily: font.base,
                            fontSize: fontSize.base,
                        }}
                    >
                        Não possui conta?{" "}
                    </Text>

                    <Pressable onPress={() => router.push("/cadastro")}>
                        <Text
                            style={[
                                styles.registerLink,
                                {
                                    color: "#FFFFFF",
                                    fontFamily: font.baseMedium,
                                    fontSize: fontSize.base,
                                },
                            ]}
                        >
                            Cadastre-se aqui
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    page: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 50,
    },
    card: {
        width: "100%",
        maxWidth: 400,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: "#0a0a0a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.10)",
            },
        }),
    },
    title: {
        textAlign: "left",
    },
    formGroup: {
        width: "100%",
    },
    label: {
        width: "100%",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    button: {
        width: "100%",
        minHeight: 46,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    buttonText: {
        textAlign: "center",
    },
    registerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
    },
    registerLink: {
        textDecorationLine: "underline",
    },
});