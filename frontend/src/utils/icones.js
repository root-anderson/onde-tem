import L from "leaflet";
import { CATEGORIAS } from "./categorias.js";

const cache = {};

export function iconeCategoria(categoria) {
    if (cache[categoria]) return cache[categoria];

    const { emoji, cor } = CATEGORIAS[categoria] ?? { emoji: "📍", cor: "#475569" };

    cache[categoria] = L.divIcon({
        className: "pino",
        html: `<span style="background:${cor}">${emoji}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
    });
    return cache[categoria];
}