import { useTheme } from "@/contexts/theme";
import React from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {
  children: string;
};

export const Button = ({ onPress, children, disabled }: Props) => {
  const { theme, font, fontSize, radius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: theme.primary,
        width: 170,
        minHeight: 42,
        borderRadius: radius.lg,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        paddingHorizontal: 18,
        paddingVertical: 10,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text
        style={{
          color: theme.primaryText,
          fontFamily: font.baseBold,
          fontSize: fontSize.base,
          textAlign: "center",
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};