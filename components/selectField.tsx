import { useTheme } from "@/contexts/theme";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Option = { label: string; value: string };

type Props = {
    label: string;
    placeholder: string;
    value: string;
    options: Option[];
    disabled?: boolean;
    onChange: (value: string) => void;
};

export function SelectField({
    label,
    placeholder,
    value,
    options,
    disabled = false,
    onChange,
}: Props) {
    const { theme, radius, fontSize, font } = useTheme();
    const [visible, setVisible] = useState(false);
    const selected = options.find((option) => option.value === value);

    return (
        <View style={styles.group}>
            <Text
                style={{
                    color: theme.bodyColor,
                    fontFamily: font.baseSemibold,
                    fontSize: fontSize.base,
                }}
            >
                {label}
            </Text>
            <Pressable
                disabled={disabled}
                onPress={() => setVisible(true)}
                style={({ pressed }) => [
                    styles.select,
                    {
                        borderColor: theme.borderColor,
                        backgroundColor: theme.tertiaryBg,
                        borderRadius: radius.base,
                        opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
                    },
                ]}
            >
                <Text
                    style={{
                        color: value ? theme.bodyColor : theme.tertiaryColor,
                        fontFamily: font.base,
                        fontSize: fontSize.base,
                    }}
                >
                    {selected?.label ?? placeholder}
                </Text>
                <Text style={{ color: theme.secondaryColor }}>⌄</Text>
            </Pressable>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={[styles.backdrop, { backgroundColor: theme.backdrop }]}
                    onPress={() => setVisible(false)}
                >
                    <Pressable
                        style={[
                            styles.modal,
                            {
                                backgroundColor: theme.secondaryBg,
                                borderColor: theme.borderColor,
                                borderRadius: radius.lg,
                            },
                        ]}
                        onPress={() => undefined}
                    >
                        <Text
                            style={{
                                color: theme.bodyColor,
                                fontFamily: font.baseBold,
                                fontSize: fontSize.lg,
                                marginBottom: 10,
                            }}
                        >
                            {label}
                        </Text>
                        <ScrollView style={styles.options}>
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => {
                                            onChange(option.value);
                                            setVisible(false);
                                        }}
                                        style={[
                                            styles.option,
                                            {
                                                borderBottomColor: theme.borderColor,
                                                backgroundColor: isSelected
                                                    ? theme.tertiaryBg
                                                    : "transparent",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                color: theme.bodyColor,
                                                fontFamily: isSelected
                                                    ? font.baseSemibold
                                                    : font.base,
                                                fontSize: fontSize.base,
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    group: { gap: 6 },
    select: {
        minHeight: 46,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    backdrop: { flex: 1, justifyContent: "center", padding: 24 },
    modal: {
        width: "100%",
        maxWidth: 520,
        maxHeight: "70%",
        alignSelf: "center",
        borderWidth: 1,
        padding: 16,
    },
    options: { flexGrow: 0 },
    option: {
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
