import { useTheme } from "@/contexts/theme";
import { Link } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type FeatureCardProps = {
    title: string;
    description: string;
    isWide: boolean;
};

export default function Home() {
    const { theme, font, fontSize, space, radius } = useTheme();
    const { width } = useWindowDimensions();

    const isWide = width >= 900;

    const FeatureCard = ({ title, description, isWide }: FeatureCardProps) => (
        <View
            style={[
                styles.featureCard,
                {
                    width: isWide ? "31.8%" : "100%",
                    padding: space[6],
                    borderRadius: radius.xl,
                    backgroundColor: theme.tertiaryBg,
                    borderColor: theme.borderColor,
                },
            ]}
        >
            <Text
                style={{
                    marginBottom: space[3],
                    color: theme.bodyColor,
                    fontFamily: font.baseBold,
                    fontSize: fontSize.h4,
                }}
            >
                {title}
            </Text>

            <Text
                style={{
                    color: theme.secondaryColor,
                    fontFamily: font.base,
                    fontSize: fontSize.base,
                    lineHeight: 21,
                }}
            >
                {description}
            </Text>
        </View>
    );

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.bodyBg }}
            contentContainerStyle={styles.page}
            showsVerticalScrollIndicator={false}
        >
            <ImageBackground
                source={require("../../imagens/banner.jpg")}
                resizeMode="cover"
                style={[
                    styles.hero,
                    {
                        minHeight: isWide ? 500 : 440,
                        paddingHorizontal: space[5],
                        paddingVertical: isWide ? space[9] : space[8],
                    },
                ]}
                imageStyle={styles.heroImage}
            >
                <View style={styles.heroOverlay} />

                <View style={styles.heroContent}>
                    <Text
                        style={{
                            marginBottom: space[4],
                            color: "rgba(255,255,255,0.78)",
                            fontFamily: font.baseSemibold,
                            fontSize: fontSize.sm,
                            letterSpacing: 3,
                            textTransform: "uppercase",
                        }}
                    >
                        Barbearia Corta Aí
                    </Text>

                    <Text
                        style={{
                            marginBottom: space[4],
                            color: "#FFFFFF",
                            fontFamily: font.headingFamily,
                            fontSize: isWide ? fontSize.display : 44,
                            lineHeight: isWide ? 58 : 48,
                            textAlign: "center",
                            textShadowColor: "rgba(0,0,0,0.35)",
                            textShadowOffset: { width: 0, height: 2 },
                            textShadowRadius: 8,
                        }}
                    >
                        O corte perfeito, no seu ritmo
                    </Text>

                    <Text
                        style={{
                            maxWidth: 620,
                            color: "rgba(255,255,255,0.88)",
                            fontFamily: font.base,
                            fontSize: fontSize.lg,
                            lineHeight: 24,
                            textAlign: "center",
                            textShadowColor: "rgba(0,0,0,0.30)",
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 4,
                        }}
                    >
                        Ambiente moderno, profissionais experientes e agendamento rápido.
                        Venha conquistar o visual que combina com você.
                    </Text>
                </View>
            </ImageBackground>

            <View
                style={[
                    styles.section,
                    {
                        paddingHorizontal: space[5],
                        paddingVertical: isWide ? space[9] : space[8],
                        backgroundColor: theme.secondaryBg,
                    },
                ]}
            >
                <View style={styles.container}>
                    <Text
                        style={{
                            marginBottom: space[7],
                            color: theme.bodyColor,
                            fontFamily: font.headingFamily,
                            fontSize: fontSize.h2,
                            textAlign: "center",
                        }}
                    >
                        Nossos diferenciais
                    </Text>

                    <View
                        style={[
                            styles.featureGrid,
                            {
                                flexDirection: isWide ? "row" : "column",
                                gap: space[5],
                            },
                        ]}
                    >
                        <FeatureCard
                            isWide={isWide}
                            title="Profissionais experientes"
                            description="Equipe qualificada e antenada nas tendências para garantir um corte impecável."
                        />

                        <FeatureCard
                            isWide={isWide}
                            title="Ambiente acolhedor"
                            description="Espaço confortável, música agradável e atendimento personalizado do início ao fim."
                        />

                        <FeatureCard
                            isWide={isWide}
                            title="Agendamento simples"
                            description="Reserve seu horário em poucos cliques e evite filas."
                        />
                    </View>
                </View>
            </View>

            <View
                style={[
                    styles.callout,
                    {
                        paddingHorizontal: space[5],
                        paddingVertical: isWide ? space[9] : space[8],
                    },
                ]}
            >
                <View style={styles.calloutContent}>
                    <Text
                        style={{
                            marginBottom: space[3],
                            color: "#FFFFFF",
                            fontFamily: font.headingFamily,
                            fontSize: fontSize.h2,
                            textAlign: "center",
                        }}
                    >
                        Pronto para transformar seu visual?
                    </Text>

                    <Text
                        style={{
                            marginBottom: space[5],
                            color: "rgba(255,255,255,0.88)",
                            fontFamily: font.base,
                            fontSize: fontSize.lg,
                            lineHeight: 24,
                            textAlign: "center",
                        }}
                    >
                        Escolha o serviço ideal e agende agora com a gente.
                    </Text>

                    <ImageBackground
                        source={require("../../imagens/banner3.png")}
                        resizeMode="stretch"
                        style={styles.buttonImage}
                        imageStyle={{ borderRadius: radius.circle }}
                    >
                        <Link href="/" asChild>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    {
                                        opacity: pressed ? 0.72 : 1,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        color: "#201D1D",
                                        fontFamily: font.baseBold,
                                        fontSize: fontSize.lg,
                                    }}
                                >
                                    Agendar agora
                                </Text>
                            </Pressable>
                        </Link>
                    </ImageBackground>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flexGrow: 1,
    },
    hero: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(5, 19, 29, 0.62)",
    },
    heroContent: {
        width: "100%",
        maxWidth: 720,
        alignItems: "center",
        zIndex: 1,
    },
    section: {
        width: "100%",
    },
    container: {
        width: "100%",
        maxWidth: 1120,
        alignSelf: "center",
    },
    featureGrid: {
        width: "100%",
        justifyContent: "space-between",
        alignItems: "stretch",
    },
    featureCard: {
        borderWidth: 1,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 15,
        elevation: 3,
    },
    callout: {
        width: "100%",
        alignItems: "center",
        backgroundColor: "#093956",
    },
    calloutContent: {
        width: "100%",
        maxWidth: 720,
        alignItems: "center",
    },
    buttonImage: {
        width: 250,
        height: 90,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
});