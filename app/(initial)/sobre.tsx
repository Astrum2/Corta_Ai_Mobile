import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import Card, { type Barbeiro } from "@/components/cardBarber";
import { useTheme } from "@/contexts/theme";
import React from "react";

const BARBEIROS: Barbeiro[] = [
  {
    id: 1,
    name: "João Barbeiro",
    photo:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
    {
    id: 2,
    name: "João Barbeiro",
    photo:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
    {
    id: 3,
    name: "João Barbeiro",
    photo:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
    {
    id: 4,
    name: "João Barbeiro",
    photo:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Sobre() {
  const { width } = useWindowDimensions();
  const { theme, font, fontSize, space } = useTheme();

  const columns = width >= 680 ? 2 : 1;

  return (
    <FlatList
      key={columns}
      data={BARBEIROS}
      keyExtractor={(item) => String(item.id)}
      numColumns={columns}
      contentContainerStyle={[
        styles.content,
        {
          backgroundColor: theme.bodyBg,
          paddingHorizontal: space[5],
          paddingTop: space[8],
          paddingBottom: space[9],
        },
      ]}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text
            style={[
              styles.introTitle,
              {
                fontFamily: font.headingFamily,
                fontSize: fontSize.h2,
                marginBottom: space[2],
              },
            ]}
          >
            Nossa Didática
          </Text>

          <Text
            style={[
              styles.introText,
              {
                color: theme.secondaryColor,
                fontFamily: font.base,
                fontSize: fontSize.lg,
                marginBottom: space[8],
              },
            ]}
          >
            Nossa equipe trabalha com uma didática simples e personalizada:
            primeiro entendemos seu estilo, depois explicamos as opções de corte e
            finalização para você participar da escolha. Assim, cada atendimento
            fica mais claro, confortável e com resultado alinhado ao que você quer.
          </Text>

          <Text
            style={{
              color: theme.bodyColor,
              fontFamily: font.headingFamily,
              fontSize: fontSize.h2,
              marginBottom: space[2],
            }}
          >
            Nossos Barbeiros
          </Text>

          <Text
            style={{
              color: theme.secondaryColor,
              fontFamily: font.base,
              fontSize: fontSize.lg,
              marginBottom: space[7],
            }}
          >
            Conheça a equipe disponível no momento.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <Card barbeiro={item} />
        </View>
      )}
      ListEmptyComponent={
        <Text
          style={[
            styles.status,
            {
              color: theme.secondaryColor,
              fontFamily: font.baseSemibold,
              fontSize: fontSize.base,
            },
          ]}
        >
          Nenhum barbeiro encontrado.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  header: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    alignItems: "center",
  },
  introTitle: {
    textAlign: "center",
  },
  introText: {
    maxWidth: 900,
    textAlign: "center",
    lineHeight: 26,
  },
  row: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    marginBottom: 16,
  },
  status: {
    textAlign: "center",
    marginVertical: 22,
  },
});