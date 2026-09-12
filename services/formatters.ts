export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const formatCPF = (value: string) =>
    onlyDigits(value)
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const formatPhone = (value: string) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatDateInput = (value: string): string => {
    const digits = onlyDigits(value).slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const parseDateInput = (value: string): string | null => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;

    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const formatCurrency = (value: number): string =>
    value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

export const formatCurrencyInput = (value: string): string => {
    const digits = onlyDigits(value);

    if (!digits) return "";

    return formatCurrency(Number(digits) / 100);
};

export const parseCurrencyInput = (value: string): number | null => {
    const digits = onlyDigits(value);

    if (!digits) return null;

    return Number(digits) / 100;
};