import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";

const iconeSelecao = L.divIcon({
    className: "pino",
    html: '<span style="background:#7c3aed">📍</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

function arredondar(latlng) {
    const p = latlng.wrap(); // mantém a longitude entre -180 e 180
    return {
        lat: Number(p.lat.toFixed(6)),
        lng: Number(p.lng.toFixed(6)),
    };
}

// Clicar no mapa define a posição
function CliqueNoMapa({ onChange }) {
    useMapEvents({
        click: (e) => onChange(arredondar(e.latlng)),
    });
    return null;
}

// Move o mapa até um alvo (resultado da busca de endereço)
function VoarPara({ alvo }) {
    const mapa = useMap();
    useEffect(() => {
        if (alvo) mapa.flyTo([alvo.lat, alvo.lng], 17);
    }, [alvo, mapa]);
    return null;
}

export default function SeletorLocalizacao({
    posicao,
    onChange,
    alvo,
    centro,
    zoom,
}) {
    const eventosMarcador = useMemo(
        () => ({
            dragend(e) {
                onChange(arredondar(e.target.getLatLng()));
            },
        }),
        [onChange]
    );

    return (
        <MapContainer
            center={[centro.lat, centro.lng]}
            zoom={zoom}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CliqueNoMapa onChange={onChange} />
            <VoarPara alvo={alvo} />
            {posicao && (
                <Marker
                    position={[posicao.lat, posicao.lng]}
                    icon={iconeSelecao}
                    draggable
                    eventHandlers={eventosMarcador}
                />
            )}
        </MapContainer>
    );
}