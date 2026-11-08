import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from "react-leaflet";
import { useGeolocalizacao } from "../hooks/useGeolocalizacao.js";

// Centro de Cajazeiras: usado se a localização não estiver disponível
const CENTRO_PADRAO = { lat: -6.8902, lng: -38.5614 };

export default function MapaPage() {
    const { status, posicao, erro } = useGeolocalizacao();

    if (status === "carregando") {
        return <div className="carregando">Obtendo sua localização…</div>;
    }

    const centro = posicao ?? CENTRO_PADRAO;
    const zoom = posicao ? 15 : 14;

    return (
        <>
            {erro && <div className="aviso">{erro}</div>}

            <MapContainer center={[centro.lat, centro.lng]} zoom={zoom}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {posicao && (
                    <>
                        <CircleMarker
                            center={[posicao.lat, posicao.lng]}
                            radius={8}
                            pathOptions={{ color: "white", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
                        >
                            <Popup>Você está aqui</Popup>
                        </CircleMarker>
                        <Circle
                            center={[posicao.lat, posicao.lng]}
                            radius={posicao.precisao}
                            pathOptions={{ color: "#2563eb", weight: 1, fillOpacity: 0.1 }}
                        />
                    </>
                )}
            </MapContainer>
        </>
    );
}