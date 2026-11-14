import { normalizeArray, parseResponse, requireMicroservicesUrl } from "./api";

export type Review = {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    commentedAt: string;
    updatedAt: string;
};

export type CreateReviewData = {
    user_id: number;
    rating: number;
    comment: string;
};

function validateReviewData(review: CreateReviewData): void {
    if (!Number.isInteger(review.user_id) || review.user_id <= 0) {
        throw new Error("O ID do usuário deve ser um número inteiro positivo.");
    }

    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        throw new Error("A avaliação deve ser um número inteiro entre 1 e 5.");
    }

    if (typeof review.comment !== "string" || !review.comment.trim()) {
        throw new Error("O comentário não pode estar vazio.");
    }
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