import { useTheme } from "@/contexts/theme";
import { getReviews, Review } from "@/services/reviews";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REVIEWS_PER_PAGE = 10;

const RATING_LABELS: Record<number, string> = {
    1: "Horrível",
    2: "Ruim",
    3: "Mediano",
    4: "Bom",
    5: "Excelente",
};

function getReviewerName(review: Review): string {
    const reviewWithUser = review as Review & {
        user?: { name?: string };
        user_name?: string;
    };

    return reviewWithUser.user?.name || reviewWithUser.user_name || `Usuário ${review.user_id}`;
}

function formatReviewDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("pt-BR");
}

function Rating({ rating }: { rating: number }) {
    const { theme } = useTheme();
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

    return (
        <View accessibilityLabel={`${safeRating} de 5 estrelas`} style={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
                <FontAwesome key={index} name={index < safeRating ? "star" : "star-o"} size={18} color={index < safeRating ? "#E5A900" : theme.borderColor} />
            ))}
        </View>
    );
}

function ReviewCard({ review }: { review: Review }) {
    const { theme, font, fontSize, radius, space } = useTheme();
    const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
    const date = formatReviewDate(review.commentedAt || review.updatedAt);

    return (
        <View
            style={[
                styles.reviewCard,
                {
                    backgroundColor: theme.secondaryBg,
                    borderColor: theme.borderColor,
                    borderRadius: radius.lg,
                    marginBottom: space[4],
                    padding: space[4],
                },
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.reviewer}>
                    <Text
                        style={{
                            color: theme.bodyColor,
                            fontFamily: font.baseSemibold,
                            fontSize: fontSize.lg,
                        }}
                    >
                        {getReviewerName(review)}
                    </Text>
                    {date ? (
                        <Text
                            style={{
                                color: theme.tertiaryColor,
                                fontFamily: font.base,
                                fontSize: fontSize.sm,
                                marginTop: space[1],
                            }}
                        >
                            {date}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.rating}>
                    <Rating rating={rating} />
                    <Text
                        style={{
                            color: theme.secondaryColor,
                            fontFamily: font.baseMedium,
                            fontSize: fontSize.sm,
                            marginTop: space[1],
                            textAlign: "right",
                        }}
                    >
                        {RATING_LABELS[rating]}
                    </Text>
                </View>
            </View>

            <Text
                style={{
                    color: theme.secondaryColor,
                    fontFamily: font.base,
                    fontSize: fontSize.base,
                    lineHeight: 21,
                    marginTop: space[4],
                }}
            >
                {review.comment}
            </Text>
        </View>
    );
}

export default function Reviews() {
    const { theme, font, fontSize, space } = useTheme();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        getReviews()
            .then((loadedReviews) => {
                if (isMounted) {
                    setReviews(loadedReviews);
                }
            })
            .catch((requestError: unknown) => {
                if (isMounted) {
                    setError(
                        requestError instanceof Error ? requestError.message : "Não foi possível carregar as avaliações.",
                    );
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleReviews = reviews.slice(0, visibleCount);
    const canShowMore = visibleCount < reviews.length;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bodyBg }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.page,
                    { paddingHorizontal: space[4], paddingVertical: space[6] },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <Text
                        style={{
                            color: theme.bodyColor,
                            fontFamily: font.headingFamily,
                            fontSize: fontSize.h1,
                            marginBottom: space[2],
                        }}
                    >
                        Avaliações
                    </Text>
                    <Text
                        style={{
                            color: theme.secondaryColor,
                            fontFamily: font.base,
                            fontSize: fontSize.base,
                            marginBottom: space[6],
                        }}
                    >
                        Veja o que nossos clientes estão dizendo.
                    </Text>

                    {loading ? (
                        <View style={styles.feedback}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text
                                style={{
                                    color: theme.secondaryColor,
                                    fontFamily: font.base,
                                    fontSize: fontSize.base,
                                    marginTop: space[3],
                                }}
                            >
                                Carregando avaliações...
                            </Text>
                        </View>
                    ) : error ? (
                        <View
                            style={[
                                styles.feedback,
                                {
                                    backgroundColor: theme.tertiaryBg,
                                    borderColor: theme.danger,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    padding: space[4],
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: theme.danger,
                                    fontFamily: font.base,
                                    fontSize: fontSize.base,
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </Text>
                        </View>
                    ) : reviews.length === 0 ? (
                        <View style={styles.feedback}>
                            <Text
                                style={{
                                    color: theme.secondaryColor,
                                    fontFamily: font.base,
                                    fontSize: fontSize.base,
                                    textAlign: "center",
                                }}
                            >
                                Ainda não há avaliações.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {visibleReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}

                            {canShowMore ? (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setVisibleCount((count) => count + REVIEWS_PER_PAGE)}
                                    style={({ pressed }) => [
                                        styles.moreButton,
                                        {
                                            borderColor: theme.bodyColor,
                                            opacity: pressed ? 0.7 : 1,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: theme.bodyColor,
                                            fontFamily: font.baseSemibold,
                                            fontSize: fontSize.base,
                                        }}
                                    >
                                        Mostrar mais reviews
                                    </Text>
                                </Pressable>
                            ) : null}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    page: {
        flexGrow: 1,
    },
    container: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
    },
    reviewCard: {
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    reviewer: {
        flex: 1,
    },
    rating: {
        alignItems: "flex-end",
        marginLeft: 12,
    },
    stars: {
        flexDirection: "row",
        gap: 3,
    },
    feedback: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    moreButton: {
        alignItems: "center",
        borderWidth: 1,
        minHeight: 46,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
});