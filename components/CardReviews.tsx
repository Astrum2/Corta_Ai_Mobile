import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/contexts/theme";
import {
    formatReviewDate,
    getReviewerName,
    normalizeRating,
    RATING_LABELS,
    type Review,
} from "@/services/reviews";

function Rating({ rating }: { rating: number }) {
    const { theme } = useTheme();
    const safeRating = normalizeRating(rating);

    return (
        <View accessibilityLabel={`${safeRating} de 5 estrelas`} style={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
                <FontAwesome
                    key={index}
                    name={index < safeRating ? "star" : "star-o"}
                    size={18}
                    color={index < safeRating ? "#E5A900" : theme.borderColor}
                />
            ))}
        </View>
    );
}

type ReviewCardProps = {
    canManage: boolean;
    deleting: boolean;
    onDelete: () => void;
    onEdit: () => void;
    review: Review;
};

export default function ReviewCard({ canManage, deleting, onDelete, onEdit, review }: ReviewCardProps) {
    const { theme, font, fontSize, radius, space } = useTheme();
    const rating = normalizeRating(review.rating);
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

            {canManage ? (
                <View style={[styles.reviewActions, { marginTop: space[4] }]}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={deleting}
                        onPress={onEdit}
                        style={({ pressed }) => ({ opacity: pressed || deleting ? 0.6 : 1 })}
                    >
                        <Text style={{ color: theme.primary, fontFamily: font.baseSemibold, fontSize: fontSize.sm }}>
                            Editar
                        </Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        disabled={deleting}
                        onPress={onDelete}
                        style={({ pressed }) => ({ opacity: pressed || deleting ? 0.6 : 1 })}
                    >
                        {deleting ? (
                            <ActivityIndicator color={theme.danger} size="small" />
                        ) : (
                            <Text style={{ color: theme.danger, fontFamily: font.baseSemibold, fontSize: fontSize.sm }}>
                                Excluir
                            </Text>
                        )}
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    reviewCard: { borderWidth: 1 },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    reviewer: { flex: 1 },
    rating: {
        alignItems: "flex-end",
        marginLeft: 12,
    },
    reviewActions: {
        alignItems: "center",
        flexDirection: "row",
        gap: 20,
        justifyContent: "flex-end",
    },
    stars: {
        flexDirection: "row",
        gap: 3,
    },
});
