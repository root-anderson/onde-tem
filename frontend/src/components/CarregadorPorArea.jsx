import { useCallback, useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { api } from "../services/api.js";

const ATRASO_MS = 400;

export default function CarregadorPorArea({
    ativo,
    categoria,
    onResultado,
    onCarregando,
    onErro,
}) {
    const mapa = useMap();
    const timer = useRef(null);
    const controlador = useRef(null);

    // Guarda os callbacks mais recentes sem torná-los dependências
    const callbacks = useRef({ onResultado, onCarregando, onErro });
    useEffect(() => {
        callbacks.current = { onResultado, onCarregando, onErro };
    });

    const carregar = useCallback(async () => {
        // Cancela a consulta anterior, se ainda estiver em andamento
        controlador.current?.abort();
        const atual = new AbortController();
        controlador.current = atual;

        const b = mapa.getBounds();
        const limites = {
            minLng: b.getWest(),
            minLat: b.getSouth(),
            maxLng: b.getEast(),
            maxLat: b.getNorth(),
        };

        callbacks.current.onCarregando(true);
        try {
            const resposta = await api.porArea(limites, categoria, atual.signal);
            callbacks.current.onResultado(resposta);
            callbacks.current.onErro(null);
        } catch (erro) {
            if (erro.name === "AbortError") return;
            callbacks.current.onErro(erro.message);
        } finally {
            if (controlador.current === atual) callbacks.current.onCarregando(false);
        }
    }, [mapa, categoria]);

    // Quando o usuário termina de mover ou dar zoom no mapa
    useMapEvents({
        moveend: () => {
            if (!ativo) return;
            clearTimeout(timer.current);
            timer.current = setTimeout(carregar, ATRASO_MS);
        },
    });

    // Carga inicial e quando o modo ou a categoria mudam
    useEffect(() => {
        if (!ativo) return;
        carregar();
        return () => {
            clearTimeout(timer.current);
            controlador.current?.abort();
        };
    }, [ativo, carregar]);

    return null;
}