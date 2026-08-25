import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { useTheme } from "@/contexts/theme";

type Service = {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
};

const services: Service[] = [
  {
    id: 1,
    name: "Corte de Cabelo",
    description: "Corte masculino personalizado de acordo com o estilo do cliente.",
    duration_minutes: 40,
    price: 45,
  },
  {
    id: 2,
    name: "Barba",
    description: "Modelagem e acabamento da barba com toalha quente.",
    duration_minutes: 30,
    price: 35,
  },
  {
    id: 3,
    name: "Corte + Barba",
    description: "Combo completo com corte de cabelo e barba.",
    duration_minutes: 70,
    price: 70,
  },
];

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Services() {
  const { width } = useWindowDimensions();
  const { theme, font, fontSize, space, radius } = useTheme();

  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.bodyBg,
    },
    content: {
      width: "100%",
      maxWidth: 1200,
      alignSelf: "center",
      paddingHorizontal: space[5],
      paddingVertical: space[6],
    },
    title: {
      color: theme.bodyColor,
      fontFamily: font.headingFamily,
      fontSize: fontSize.h1,
      textAlign: "center",
      marginBottom: space[7],
    },
    listContent: {
      paddingBottom: space[6],
    },
    row: {
      gap: space[5],
    },
    cardWrapper: {
      flex: 1,
      marginBottom: space[5],
    },
    card: {
      flex: 1,
      minHeight: 190,
      padding: space[5],
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: radius.base,
      backgroundColor: theme.secondaryBg,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    cardTitle: {
      color: theme.primary,
      fontFamily: font.baseBold,
      fontSize: fontSize.h3,
      marginBottom: space[3],
    },
    description: {
      color: theme.secondaryColor,
      fontFamily: font.base,
      fontSize: fontSize.base,
      lineHeight: 20,
      marginBottom: space[3],
    },
    info: {
      color: theme.secondaryColor,
      fontFamily: font.baseMedium,
      fontSize: fontSize.base,
      marginBottom: space[2],
    },
    price: {
      color: theme.primary,
      fontFamily: font.baseBold,
      fontSize: fontSize.lg,
      marginTop: space[1],
    },
  });

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Nossos Serviços</Text>

        <FlatList
          key={columns}
          data={services}
          numColumns={columns}
          keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={columns > 1 ? styles.row : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <Text style={styles.description}>{item.description}</Text>

                <Text style={styles.info}>
                  Tempo: {item.duration_minutes} min
                </Text>

                <Text style={styles.price}>
                  Preço: {formatPrice(item.price)}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}