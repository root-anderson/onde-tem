// Os nomes devem ser IDÊNTICOS aos de CATEGORIAS no backend (validators.js)
export const CATEGORIAS = {
    Restaurante: { emoji: "🍽️", cor: "#ea580c" },
    "Farmácia": { emoji: "💊", cor: "#16a34a" },
    Mercadinho: { emoji: "🛒", cor: "#2563eb" },
    "Posto de combustível": { emoji: "⛽", cor: "#ca8a04" },
    Hospital: { emoji: "🏥", cor: "#dc2626" },
    "Praça": { emoji: "🌳", cor: "#0d9488" },
};

export const NOMES_CATEGORIAS = Object.keys(CATEGORIAS);

export function formatarDistancia(metros) {
    if (metros == null) return "";
    return metros < 1000
        ? `${Math.round(metros)} m`
        : `${(metros / 1000).toFixed(1)} km`;
}