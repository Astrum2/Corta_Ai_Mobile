import { useTheme } from "@/contexts/theme";
import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type FormFieldProps = TextInputProps & {
    label: string;
    rightElement?: React.ReactNode;
};

export function FormField({ label, rightElement, ...inputProps }: FormFieldProps) {
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

            <View
                style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: currentColor === "dark"
                            ? "#1B1C1B"
                            : theme.tertiaryBg,
                        borderColor: theme.borderColor,
                        borderRadius: radius.base,
                    },
                ]}
            >
                <TextInput
                    {...inputProps}
                    style={[
                        styles.input,
                        {
                            color: inputTextColor,
                            fontFamily: font.base,
                            fontSize: fontSize.lg,
                        },
                        inputProps.style,
                    ]}
                    placeholderTextColor={inputTextColor}
                />
                {rightElement}
            </View>
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
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    inputWrapper: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
    },
});