import { useTheme } from "@/contexts/theme";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  onPress: () => void;
  children: string;
};

export const Button = ({ onPress, children }: Props) => {
  const { theme, font, fontSize, radius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
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