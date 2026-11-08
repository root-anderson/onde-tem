import { useEffect, useState } from "react";

const MENSAGENS = {
    1: "Permissão de localização negada. Mostrando uma região padrão.",
    2: "Não foi possível determinar sua localização. Mostrando uma região padrão.",
    3: "Tempo esgotado ao obter sua localização. Mostrando uma região padrão.",
};

export function useGeolocalizacao() {
    const [estado, setEstado] = useState({
        status: "carregando", // "carregando" | "ok" | "erro"
        posicao: null,
        erro: null,
    });

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setEstado({
                status: "erro",
                posicao: null,
                erro: "Seu navegador não suporta geolocalização. Mostrando uma região padrão.",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setEstado({
                    status: "ok",
                    posicao: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        precisao: pos.coords.accuracy,
                    },
                    erro: null,
                }),
            (err) =>
                setEstado({
                    status: "erro",
                    posicao: null,
                    erro: MENSAGENS[err.code] || "Erro ao obter localização.",
                }),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    return estado;
}