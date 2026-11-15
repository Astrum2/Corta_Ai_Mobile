import { normalizeArray, parseResponse, requireMicroservicesUrl } from "./api";
import { getAuthUser } from "./auth";

export type Review = {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    commentedAt: string;
    updatedAt: string;
    user?: { name?: string };
    user_name?: string;
};

export type CreateReviewData = {
    user_id: number;
    rating: number;
    comment: string;
};

export type UpdateReviewData = {
    rating: number;
    comment: string;
};

export type ReviewsPageData = {
    reviews: Review[];
    currentUserId: number | null;
};

export const REVIEWS_PER_PAGE = 10;

export const RATING_LABELS: Record<number, string> = {
    1: "Horrível",
    2: "Ruim",
    3: "Mediano",
    4: "Bom",
    5: "Excelente",
};

export function getVisibleReviews(reviews: Review[], visibleCount: number): Review[] {
    return reviews.slice(0, visibleCount);
}

export function hasMoreReviews(reviews: Review[], visibleCount: number): boolean {
    return visibleCount < reviews.length;
}

export function getNextVisibleCount(visibleCount: number): number {
    return visibleCount + REVIEWS_PER_PAGE;
}

export function getReviewerName(review: Review): string {
    return review.user?.name || review.user_name || `Usuário ${review.user_id}`;
}

export function formatReviewDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("pt-BR");
}

export function normalizeRating(rating: number): number {
    return Math.max(1, Math.min(5, Math.round(rating)));
}

export async function loadReviews(): Promise<ReviewsPageData> {
    const [reviews, user] = await Promise.all([getReviews(), getAuthUser()]);

    return {
        reviews,
        currentUserId: user?.id ?? null,
    };
}

function validateReviewData(review: CreateReviewData): void {
    if (!Number.isInteger(review.user_id) || review.user_id <= 0) {
        throw new Error("O ID do usuário deve ser um número inteiro positivo.");
    }

    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        throw new Error("A avaliação deve ser um número inteiro entre 1 e 5.");
    }

    if (typeof review.comment !== "string") {
        throw new Error("O comentário deve ser um texto.");
    }
}

export async function saveReview( reviewId: number | null, userId: number, review: UpdateReviewData ): Promise<Review> {
    if (reviewId !== null) {
        return updateReview(reviewId, review);
    }

    return createReview({
        user_id: userId,
        ...review,
    });
}

export async function getReviews(): Promise<Review[]> {
    const response = await fetch(
        `${requireMicroservicesUrl().replace(/\/$/, "")}/reviews`,
        {
            method: "GET",
        },
    );
    const payload = await parseResponse<unknown>(
        response,
        "Não foi possível carregar as avaliações.",
    );

    return normalizeArray<Review>(payload, ["reviews", "avaliações"]);
}

export async function createReview(review: CreateReviewData): Promise<Review> {
    validateReviewData(review);

    const response = await fetch(
        `${requireMicroservicesUrl().replace(/\/$/, "")}/reviews`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: review.user_id,
                rating: review.rating,
                comment: review.comment.trim(),
            }),
        },
    );

    return parseResponse<Review>(
        response,
        "Não foi possível enviar a avaliação.",
    );
}

export async function updateReview(
    id: number,
    review: UpdateReviewData,
): Promise<Review> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("O ID da avaliação deve ser um número inteiro positivo.");
    }

    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        throw new Error("A avaliação deve ser um número inteiro entre 1 e 5.");
    }

    if (typeof review.comment !== "string") {
        throw new Error("O comentário deve ser um texto.");
    }

    const response = await fetch(
        `${requireMicroservicesUrl().replace(/\/$/, "")}/reviews/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rating: review.rating,
                comment: review.comment.trim(),
            }),
        },
    );

    return parseResponse<Review>(
        response,
        "Não foi possível atualizar a avaliação.",
    );
}

export async function deleteReview(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("O ID da avaliação deve ser um número inteiro positivo.");
    }

    const response = await fetch(
        `${requireMicroservicesUrl().replace(/\/$/, "")}/reviews/${id}`,
        {
            method: "DELETE",
        },
    );

    await parseResponse<null>(
        response,
        "Não foi possível remover a avaliação.",
    );
}