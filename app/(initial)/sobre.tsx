import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import Card, { type Barbeiro } from "@/components/cardBarber";
import { useTheme } from "@/contexts/theme";
import { getBarbers } from "@/services/barbers";
import React, { useEffect, useState } from "react";

export default function Sobre() {
  const { width } = useWindowDimensions();
  const { theme, font, fontSize, space } = useTheme();
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBarbeiros() {
      try {
        const data = await getBarbers();
        if (active) setBarbeiros(data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar os barbeiros.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBarbeiros();
    return () => {
      active = false;
    };
  }, []);

  const columns = width >= 680 ? 2 : 1;

  return (
    <FlatList
      key={columns}
      data={barbeiros}
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
      ListEmptyComponent={loading || error ? (
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
          {loading ? "Carregando barbeiros..." : error}
        </Text>
      ) : (
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
      )}
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