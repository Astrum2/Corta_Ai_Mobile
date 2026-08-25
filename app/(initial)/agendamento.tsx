import { Button } from "@/components/button";
import { H1 } from "@/components/text";
import { useTheme } from "@/contexts/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";

export default function Login() {
    const { currentColor, theme, radius, fontSize } = useTheme()
    const inputTextColor = currentColor === "dark" ? "#FFFFFF" : theme.bodyColor
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const router = useRouter()

    const login = () => {
        if (!email.trim()){
            Alert.alert("Erro", "Campo email é obrigatório")
            return
        }

        if (!senha.trim()) {
            Alert.alert("Erro", "Senha é obrigatória")
            return
        }

        if (email === "admin" && senha === "murilo123") {
            router.replace("/home")
        }else {
            Alert.alert("Email ou senha inválidos")
        }

    }


    return (
        <View 
            style={[
                styles.container,
                {
                    backgroundColor: theme.bodyBg,
                    gap: 20
                }
            ]
            }
        >
            <H1>login</H1>

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        borderRadius: radius.base,
                        fontSize: fontSize.base,
                        color: inputTextColor
                    }
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={inputTextColor}
            />

            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        borderRadius: radius.base,
                        fontSize: fontSize.base,
                        color: inputTextColor
                    }
                ]}
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha"
                placeholderTextColor={inputTextColor}
                secureTextEntry
            />

            <Button onPress={login}>Entrar</Button>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    input: {
        borderWidth: 1,
        padding: 14,
        width: 300
    }
})