import { useTheme } from "@/contexts/theme";
import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type FormFieldProps = TextInputProps & {
    label: string;
};

export function FormField({ label, ...inputProps }: FormFieldProps) {
    const { currentColor, theme, font, fontSize, radius, space } = useTheme();

    const inputTextColor =
        currentColor === "dark" ? "#FFFFFF" : theme.bodyColor;

    return (
        <View style={[styles.container, { marginBottom: space[5] }]}>
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
                {label}
            </Text>

            <TextInput
                {...inputProps}
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
                    inputProps.style,
                ]}
                placeholderTextColor={inputTextColor}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
});