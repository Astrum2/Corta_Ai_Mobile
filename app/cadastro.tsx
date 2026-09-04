import { FormField } from "@/components/formField";
import { useTheme } from "@/contexts/theme";
import { registerUser } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCPF = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const isValidCPF = (value: string) => {
    const cpf = onlyDigits(value);
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

    const calculateDigit = (length: number) => {
        let sum = 0;
        for (let index = 0; index < length; index += 1) {
            sum += Number(cpf[index]) * (length + 1 - index);
        }

        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };

    return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPassword = (value: string) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{7,}$/.test(value);

export default function Cadastro() {
    const { currentColor, theme, font, fontSize, radius, space } = useTheme();
    const inputTextColor = currentColor === "dark" ? "#FFFFFF" : theme.bodyColor;

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [numero, setNumero] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const cadastro = async () => {
        if (!nome.trim()) {
            Alert.alert("Erro", "Campo nome é obrigatório");
            return;
        }

        if (!email.trim()) {
            Alert.alert("Erro", "Campo email é obrigatório");
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert("Erro", "Digite um email válido");
            return;
        }

        if (!isValidCPF(cpf)) {
            Alert.alert("Erro", "Digite um CPF válido");
            return;
        }

        if (!senha.trim()) {
            Alert.alert("Erro", "Senha é obrigatória");
            return;
        }

        if (!isValidPassword(senha)) {
            Alert.alert(
                "Erro",
                "A senha deve ter no mínimo 7 caracteres, uma letra maiúscula, um símbolo e um número"
            );
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não conferem");
            return;
        }

        try {
            setLoading(true);

            const response = await registerUser({
                name: nome,
                email,
                cpf,
                password: senha,
            });

            setNome("");
            setEmail("");
            setCpf("");
            setNumero("");
            setSenha("");
            setConfirmarSenha("");

            Alert.alert(
                "Sucesso",
                response.message || "Usuário criado!",
                [{ text: "OK", onPress: () => router.replace("/login") }]
            );
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Não foi possível realizar o cadastro.";

            Alert.alert("Erro", message);
        } finally {
            setLoading(false);
        }
    };

    return (

        <ScrollView
            keyboardShouldPersistTaps="handled"
        >
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
                        Cadastro
                    </Text>

                    <FormField
                        label="Nome:"
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Nome"
                    />

                    <FormField
                        label="Email:"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <FormField
                        label="CPF:"
                        value={cpf}
                        onChangeText={(value) => setCpf(formatCPF(value))}
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                    />

                    <FormField
                        label="Senha:"
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Senha"
                        secureTextEntry
                    />

                    <FormField
                        label="Confirmar senha:"
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        placeholder="Confirmar senha"
                        secureTextEntry
                    />

                    <Pressable
                        onPress={cadastro}
                        disabled={loading}
                        style={({ pressed }) => [
                            styles.button,
                            {
                                backgroundColor: pressed ? theme.secondaryColor : theme.bodyColor,
                                borderRadius: radius.base,
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
                            {loading ? "Cadastrando..." : "Cadastrar"}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.replace("/login")}
                        style={{ marginTop: space[4] }}
                    >
                        <Text
                            style={[
                                styles.backLink,
                                {
                                    color: "#000000",
                                    fontFamily: font.baseMedium,
                                    fontSize: fontSize.base,
                                },
                            ]}
                        >
                            Já possui conta? Entrar
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 50 },
    card: {
        width: "100%",
        maxWidth: 400,
        marginBottom: 50,
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: "#0a0a0a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 4 },
            web: { boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.10)" },
        }),
    },
    title: { textAlign: "left" },
    formGroup: { width: "100%" },
    label: { width: "100%" },
    input: { width: "100%", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
    button: { width: "100%", minHeight: 46, justifyContent: "center", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 },
    buttonText: { textAlign: "center" },
    backLink: { textAlign: "center", textDecorationLine: "underline" },
});