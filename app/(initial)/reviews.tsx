import { Button } from "@/components/button";
import ReviewCard from "@/components/CardReviews";
import { FormField } from "@/components/formField";
import Notifications from "@/components/notifications";
import { H1 } from "@/components/text";
import { useTheme } from "@/contexts/theme";
import { getNotificationForReview, type Notification as BackendNotification } from "@/services/notifications";
import { deleteReview, getNextVisibleCount, getVisibleReviews, hasMoreReviews, loadReviews, normalizeRating, type Review, REVIEWS_PER_PAGE, saveReview } from "@/services/reviews";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Reviews() {
    const { theme, font, fontSize, radius, space } = useTheme();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviewFormVisible, setReviewFormVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
    const [notification, setNotification] = useState<BackendNotification | null>(null);

    useEffect(() => {
        let isMounted = true;

        loadReviews()
            .then(({ reviews: loadedReviews, currentUserId: loadedCurrentUserId }) => {
                if (isMounted) {
                    setReviews(loadedReviews);
                    setCurrentUserId(loadedCurrentUserId);
                }
            })
            .catch((requestError: unknown) => {
                if (isMounted) {
                    setError( requestError instanceof Error ? requestError.message : "Não foi possível carregar as avaliações.");
                }
            })
            .finally(() => {
                if (isMounted) { setLoading(false); }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const visibleReviews = getVisibleReviews(reviews, visibleCount);
    const canShowMore = hasMoreReviews(reviews, visibleCount);

    function openReviewForm() {
        setFormError(null);
        setEditingReviewId(null);
        setSelectedRating(0);
        setComment("");
        setReviewFormVisible(true);
    }

    function closeReviewForm() {
        if (submitting) return;
        setReviewFormVisible(false);
        setEditingReviewId(null);
        setSelectedRating(0);
        setComment("");
        setFormError(null);
    }

    async function submitReview() {
        if (selectedRating === 0) {
            setFormError("Selecione uma quantidade de estrelas.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            if (currentUserId === null) { throw new Error("Sua sessão expirou. Faça login novamente para avaliar."); }

            const savedReview = await saveReview(editingReviewId, currentUserId, { rating: selectedRating, comment });
            setReviews((currentReviews) => editingReviewId === null ? [savedReview, ...currentReviews] : currentReviews.map((review) => (
                    review.id === savedReview.id ? savedReview : review
                )));
            setSubmitting(false);
            closeReviewForm();
            setNotification(await getNotificationForReview(currentUserId));
        } catch (submitError: unknown) {
            setFormError( submitError instanceof Error  ? submitError.message : "Não foi possível enviar a avaliação." );
        } finally {
            setSubmitting(false);
        }
    }

    function openEditForm(review: Review) {
        setEditingReviewId(review.id);
        setSelectedRating(normalizeRating(review.rating));
        setComment(review.comment);
        setFormError(null);
        setReviewFormVisible(true);
    }

    function confirmDelete(review: Review) {
        Alert.alert(
            "Excluir avaliação",
            "Tem certeza que deseja excluir sua avaliação?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: () => void removeReview(review.id) },
            ],
        );
    }

    async function removeReview(reviewId: number) {
        try {
            setDeletingReviewId(reviewId);
            await deleteReview(reviewId);
            setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId));
            if (currentUserId !== null) {
                setNotification(await getNotificationForReview(currentUserId));
            }
        } catch (deleteError: unknown) {
            Alert.alert( "Não foi possível excluir", deleteError instanceof Error ? deleteError.message : "Não foi possível remover a avaliação." );
        } finally {
            setDeletingReviewId(null);
        }
    }

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
                    <H1>Avaliações</H1>
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

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Avaliar estabelecimento"
                        onPress={openReviewForm}
                        style={({ pressed }) => [
                            styles.reviewPrompt,
                            {
                                borderColor: theme.borderColor,
                                borderRadius: radius.lg,
                                marginBottom: space[6],
                                opacity: pressed ? 0.75 : 1,
                                padding: space[4],
                            },
                        ]}
                    >
                        <View style={styles.reviewPromptIcon}>
                            <FontAwesome name="star" size={20} color="#E5A900" />
                        </View>
                        <View style={styles.reviewPromptContent}>
                            <Text
                                style={{
                                    color: theme.bodyColor,
                                    fontFamily: font.baseSemibold,
                                    fontSize: fontSize.base,
                                }}
                            >
                                Avaliar estabelecimento
                            </Text>
                            <Text
                                style={{
                                    color: theme.tertiaryColor,
                                    fontFamily: font.base,
                                    fontSize: fontSize.sm,
                                    marginTop: space[1],
                                }}
                            >
                                Conte como foi sua experiência
                            </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={14} color={theme.tertiaryColor} />
                    </Pressable>

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
                                    padding: space[4]
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: theme.danger,
                                    fontFamily: font.base,
                                    fontSize: fontSize.base,
                                    textAlign: "center"
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
                                    textAlign: "center"
                                }}
                            >
                                Ainda não há avaliações.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {visibleReviews.map((review) => (
                                <ReviewCard
                                    canManage={currentUserId === review.user_id}
                                    deleting={deletingReviewId === review.id}
                                    key={review.id}
                                    onDelete={() => confirmDelete(review)}
                                    onEdit={() => openEditForm(review)}
                                    review={review}
                                />
                            ))}

                            {canShowMore ? (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setVisibleCount(getNextVisibleCount)}
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
                                            fontSize: fontSize.base
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

            <Modal
                animationType="slide"
                onRequestClose={closeReviewForm}
                presentationStyle="pageSheet"
                visible={reviewFormVisible}
            >
                <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bodyBg }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={styles.modalContent}
                    >
                        <ScrollView
                            contentContainerStyle={[ styles.modalPage, { paddingHorizontal: space[4], paddingVertical: space[6] }, ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHeader}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Fechar avaliação"
                                    disabled={submitting}
                                    hitSlop={8}
                                    onPress={closeReviewForm}
                                >
                                    <FontAwesome name="arrow-left" size={20} color={theme.bodyColor} />
                                </Pressable>
                                <Text
                                    style={{
                                        color: theme.bodyColor,
                                        fontFamily: font.headingFamily,
                                        fontSize: fontSize.h3
                                    }}
                                >
                                    {editingReviewId === null ? "Avaliar estabelecimento" : "Editar avaliação"}
                                </Text>
                                <View style={styles.modalHeaderSpacer} />
                            </View>

                            <Text
                                style={{
                                    color: theme.bodyColor,
                                    fontFamily: font.baseSemibold,
                                    fontSize: fontSize.base,
                                    marginTop: space[7],
                                    textAlign: "center"
                                }}
                            >
                                Como foi sua experiência?
                            </Text>

                            <View
                                accessibilityLabel={`${selectedRating} de 5 estrelas selecionadas`}
                                style={styles.ratingPicker}
                            >
                                {Array.from({ length: 5 }, (_, index) => {
                                    const rating = index + 1;
                                    const selected = rating <= selectedRating;

                                    return (
                                        <Pressable
                                            accessibilityLabel={`${rating} ${rating === 1 ? "estrela" : "estrelas"}`}
                                            accessibilityRole="button"
                                            hitSlop={8}
                                            key={rating}
                                            onPress={() => { setSelectedRating(rating); setFormError(null); }}
                                        >
                                            <FontAwesome name={selected ? "star" : "star-o"} size={42} color={selected ? "#E5A900" : theme.borderColor} />
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <FormField
                                label="Comentário (opcional)"
                                multiline
                                onChangeText={(value) => { setComment(value); setFormError(null); }}
                                placeholder="Compartilhe sua experiência"
                                style={{ minHeight: 140, padding: 14 }}
                                textAlignVertical="top"
                                value={comment}
                            />

                            {formError ? (
                                <Text
                                    style={{
                                        color: theme.danger,
                                        fontFamily: font.base,
                                        fontSize: fontSize.sm,
                                        marginTop: space[3]
                                    }}
                                >
                                    {formError}
                                </Text>
                            ) : null}

                            <Button disabled={submitting} onPress={() => void submitReview()} >
                                {submitting ? "Enviando..." : editingReviewId === null ? "Enviar avaliação" : "Salvar alterações"}
                            </Button>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

            <Modal
                animationType="fade"
                onRequestClose={() => setNotification(null)}
                transparent
                visible={notification !== null}
            >
                <View style={[styles.notificationBackdrop, { backgroundColor: theme.backdrop }]}>
                    {notification && (
                        <Notifications
                            title={notification.title}
                            message={notification.message}
                            type={notification.type}
                            onClose={() => setNotification(null)}
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    page: { flexGrow: 1 },
    container: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center"
    },
    reviewPrompt: {
        alignItems: "center",
        borderWidth: 1,
        flexDirection: "row"
    },
    reviewPromptIcon: {
        alignItems: "center",
        height: 36,
        justifyContent: "center",
        marginRight: 12,
        width: 36
    },
    reviewPromptContent: { flex: 1 },
    feedback: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120
    },
    moreButton: {
        alignItems: "center",
        borderWidth: 1,
        minHeight: 46,
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    modalContent: { flex: 1 },
    modalPage: { flexGrow: 1 },
    modalHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    modalHeaderSpacer: { width: 20 },
    ratingPicker: {
        alignItems: "center",
        flexDirection: "row",
        gap: 14,
        justifyContent: "center",
        marginVertical: 28
    },
    notificationBackdrop: {
        flex: 1,
    },
});