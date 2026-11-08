import { useTheme } from "@/contexts/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type NotificationProps = {
    title: string;
    message: string;
    type: string;
    onClose?: () => void;
};

function getNotificationIcon(type: string) {
    const normalizedType = type.trim().toLowerCase();

    if (["error", "erro", "failure", "failed", "cancelled", "cancelado"].includes(normalizedType)) {
        return "⚠️";
    }

    if (["warning", "warn", "aviso", "pending", "pendente"].includes(normalizedType)) {
        return "⚠️";
    }

    if (["info", "information", "informação"].includes(normalizedType)) {
        return "ℹ️";
    }

    return "✅";
}

export default function Notifications({ title, message, type, onClose }: NotificationProps) {
    const { theme, font, fontSize, radius, space } = useTheme();

    return (
        <SafeAreaView style={styles.container}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.secondaryBg,
                        borderColor: theme.borderColor,
                        borderRadius: radius.xl,
                        padding: space[6],
                    },
                ]}
            >
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: theme.tertiaryBg,
                            borderRadius: radius.circle,
                            marginBottom: space[5],
                        },
                    ]}
                >
                    <Text accessibilityLabel="Tipo da notificação" style={styles.icon}>
                        {getNotificationIcon(type)}
                    </Text>
                </View>

                <Text
                    style={{
                        color: theme.bodyColor,
                        fontFamily: font.baseBold,
                        fontSize: fontSize.h3,
                        marginBottom: space[3],
                        textAlign: "center",
                    }}
                >
                    {title}
                </Text>

                <Text
                    style={{
                        color: theme.secondaryColor,
                        fontFamily: font.base,
                        fontSize: fontSize.lg,
                        lineHeight: 24,
                        textAlign: "center",
                    }}
                >
                    {message}
                </Text>

                {onClose && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Fechar notificação"
                        onPress={onClose}
                        style={[
                            styles.closeButton,
                            {
                                backgroundColor: theme.primary,
                                borderRadius: radius.lg,
                                marginTop: space[6],
                                paddingHorizontal: space[5],
                                paddingVertical: space[3],
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: theme.primaryText,
                                fontFamily: font.baseBold,
                                fontSize: fontSize.base,
                            }}
                        >
                            Fechar
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        width: "100%",
    },
    card: {
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        maxWidth: 520,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    iconContainer: {
        alignItems: "center",
        height: 72,
        justifyContent: "center",
        width: 72,
    },
    icon: {
        fontSize: 36,
    },
    closeButton: {
        alignItems: "center",
        minWidth: 120,
    },
});