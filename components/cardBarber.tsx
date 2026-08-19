import { useState } from "react";
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import { useTheme } from "@/contexts/theme";
import React from "react";

export type Barbeiro = {
  id: number;
  name: string;
  photo: string | ImageSourcePropType;
};

type CardProps = {
  barbeiro: Barbeiro;
};

export default function Card({ barbeiro }: CardProps) {
  const { theme, font, fontSize, radius, space } = useTheme();
  const [imageError, setImageError] = useState(false);

  const imageSource: ImageSourcePropType =
    typeof barbeiro.photo === "string"
      ? { uri: barbeiro.photo }
      : barbeiro.photo;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.secondaryBg,
          borderColor: theme.borderColor,
          borderRadius: radius.lg,
          padding: space[4],
        },
      ]}
    >
      {!imageError ? (
        <Image
          source={imageSource}
          accessibilityLabel={`Foto de ${barbeiro.name}`}
          resizeMode="cover"
          onError={() => setImageError(true)}
          style={[
            styles.photo,
            {
              borderRadius: radius.base,
              backgroundColor: theme.tertiaryBg,
              marginBottom: space[3],
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.photo,
            styles.photoFallback,
            {
              borderRadius: radius.base,
              backgroundColor: theme.tertiaryBg,
              marginBottom: space[3],
            },
          ]}
        >
          <Text
            style={{
              color: theme.tertiaryColor,
              fontFamily: font.baseMedium,
              fontSize: fontSize.base,
            }}
          >
            Sem foto
          </Text>
        </View>
      )}

      <Text
        style={{
          color: theme.bodyColor,
          fontFamily: font.baseBold,
          fontSize: fontSize.h4,
        }}
      >
        {barbeiro.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    minWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  photo: {
    width: "100%",
    height: 180,
  },
  photoFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});