import { useTheme } from "@/contexts/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCPF = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [numero, setNumero] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const router = useRouter();

    const cadastro = () => {
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

        if (!numero.trim() || onlyDigits(numero).length < 10) {
            Alert.alert("Erro", "Digite um número válido");
            return;
        }

        if (!senha.trim()) {
            Alert.alert("Erro", "Senha é obrigatória");
            return;
        }

        if (!isValidPassword(senha)) {
            Alert.alert("Erro", "A senha deve ter no mínimo 7 caracteres, uma letra maiúscula, um símbolo e um número");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não conferem");
            return;
        }

        Alert.alert("Sucesso", "Cadastro realizado com sucesso", [
            { text: "OK", onPress: () => router.replace("/login") },
        ]);
    };

    return (
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

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text style={[styles.label, { color: theme.bodyColor, fontFamily: font.baseMedium, fontSize: fontSize.base, marginBottom: space[2] }]}>
                        Email:
                    </Text>
                    <TextInput
                        style={[styles.input, { color: inputTextColor, backgroundColor: theme.tertiaryBg, borderColor: theme.borderColor, borderRadius: radius.base, fontFamily: font.base, fontSize: fontSize.lg }]}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Email"
                        placeholderTextColor={inputTextColor}
                    />
                </View>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text style={[styles.label, { color: theme.bodyColor, fontFamily: font.baseMedium, fontSize: fontSize.base, marginBottom: space[2] }]}>CPF:</Text>
                    <TextInput
                        style={[styles.input, { color: inputTextColor, backgroundColor: theme.tertiaryBg, borderColor: theme.borderColor, borderRadius: radius.base, fontFamily: font.base, fontSize: fontSize.lg }]}
                        value={cpf}
                        onChangeText={(value) => setCpf(formatCPF(value))}
                        keyboardType="numeric"
                        placeholder="000.000.000-00"
                        placeholderTextColor={inputTextColor}
                    />
                </View>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text style={[styles.label, { color: theme.bodyColor, fontFamily: font.baseMedium, fontSize: fontSize.base, marginBottom: space[2] }]}>Número:</Text>
                    <TextInput
                        style={[styles.input, { color: inputTextColor, backgroundColor: theme.tertiaryBg, borderColor: theme.borderColor, borderRadius: radius.base, fontFamily: font.base, fontSize: fontSize.lg }]}
                        value={numero}
                        onChangeText={(value) => setNumero(formatPhone(value))}
                        keyboardType="phone-pad"
                        placeholder="(00) 00000-0000"
                        placeholderTextColor={inputTextColor}
                    />
                </View>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text style={[styles.label, { color: theme.bodyColor, fontFamily: font.baseMedium, fontSize: fontSize.base, marginBottom: space[2] }]}>
                        Senha:
                    </Text>
                    <TextInput
                        style={[styles.input, { color: inputTextColor, backgroundColor: theme.tertiaryBg, borderColor: theme.borderColor, borderRadius: radius.base, fontFamily: font.base, fontSize: fontSize.lg }]}
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Senha"
                        placeholderTextColor={inputTextColor}
                        secureTextEntry
                    />
                </View>

                <View style={[styles.formGroup, { marginBottom: space[5] }]}>
                    <Text style={[styles.label, { color: theme.bodyColor, fontFamily: font.baseMedium, fontSize: fontSize.base, marginBottom: space[2] }]}>Confirmar senha:</Text>
                    <TextInput
                        style={[styles.input, { color: inputTextColor, backgroundColor: theme.tertiaryBg, borderColor: theme.borderColor, borderRadius: radius.base, fontFamily: font.base, fontSize: fontSize.lg }]}
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        placeholder="Confirmar senha"
                        placeholderTextColor={inputTextColor}
                            
                    />
                </View>

                <Pressable
                    onPress={cadastro}
                    style={({ pressed }) => [styles.button, { backgroundColor: pressed ? theme.secondaryColor : theme.bodyColor, borderRadius: radius.base }]}
                >
                    <Text style={[styles.buttonText, { color: theme.secondaryBg, fontFamily: font.baseSemibold, fontSize: fontSize.lg }]}>
                        Cadastrar
                    </Text>
                </Pressable>

                <Pressable onPress={() => router.replace("/login")} style={{ marginTop: space[4] }}>
                    <Text style={[styles.backLink, { color: "#FFFFFF", fontFamily: font.baseMedium, fontSize: fontSize.base }]}> 
                        Já possui conta? Entrar
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 50 },
    card: {
        width: "100%",
        maxWidth: 400,
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