import { useCallback, useState } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Circle,
    Marker,
    Popup,
} from "react-leaflet";
import { useGeolocalizacao } from "../hooks/useGeolocalizacao.js";
import { api } from "../services/api.js";
import CarregadorPorArea from "../components/CarregadorPorArea.jsx";
import { iconeCategoria } from "../utils/icones.js";
import {
    CATEGORIAS,
    NOMES_CATEGORIAS,
    formatarDistancia,
} from "../utils/categorias.js";

const CENTRO_PADRAO = { lat: -6.8902, lng: -38.5614 };
const RAIOS_KM = [1, 2, 5, 10];

export default function MapaPage() {
    const { status, posicao, erro: erroGeo } = useGeolocalizacao();

    const [mapa, setMapa] = useState(null);
    const [modo, setModo] = useState("area"); // "area" | "raio"
    const [categoria, setCategoria] = useState("");
    const [raioKm, setRaioKm] = useState(2);

    const [pontosArea, setPontosArea] = useState([]);
    const [limitado, setLimitado] = useState(false);
    const [resultadoRaio, setResultadoRaio] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erroApi, setErroApi] = useState(null);

    if (status === "carregando") {
        return <div className="carregando">Obtendo sua localização…</div>;
    }

    const centro = posicao ?? CENTRO_PADRAO;
    const zoom = posicao ? 15 : 14;

    const pontos = modo === "raio" ? resultadoRaio?.pontos ?? [] : pontosArea;

    function receberArea(resposta) {
        setPontosArea(resposta.dados);
        setLimitado(resposta.limitado);
    }

    function trocarModo(novo) {
        setModo(novo);
        setErroApi(null);
        if (novo === "area") setResultadoRaio(null);
    }

    async function buscarPorRaio() {
        if (!posicao) return;
        const raioM = raioKm * 1000;
        setCarregando(true);
        setErroApi(null);
        try {
            const resposta = await api.proximos({
                lat: posicao.lat,
                lng: posicao.lng,
                raio: raioM,
                categoria,
            });
            setResultadoRaio({ pontos: resposta.dados, raioM });
            mapa?.fitBounds(L.latLng(posicao.lat, posicao.lng).toBounds(raioM * 2), {
                padding: [20, 20],
            });
        } catch (erro) {
            setErroApi(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="mapa-layout">
            <aside className="painel">
                <h2>Buscar</h2>

                <div className="grupo">
                    <label>
                        <input
                            type="radio"
                            checked={modo === "area"}
                            onChange={() => trocarModo("area")}
                        />{" "}
                        Explorar o mapa
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={modo === "raio"}
                            onChange={() => trocarModo("raio")}
                        />{" "}
                        Perto de mim
                    </label>
                </div>

                <div className="grupo">
                    <label htmlFor="filtro-categoria">Categoria</label>
                    <select
                        id="filtro-categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {NOMES_CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                                {CATEGORIAS[c].emoji} {c}
                            </option>
                        ))}
                    </select>
                </div>

                {modo === "area" && (
                    <p className="info">
                        {carregando
                            ? "Carregando…"
                            : `${pontosArea.length} estabelecimento(s) na área visível.`}
                        <br />
                        Mova o mapa para ver outros.
                    </p>
                )}

                {modo === "raio" && (
                    <>
                        <div className="grupo">
                            <label htmlFor="raio">Raio</label>
                            <select
                                id="raio"
                                value={raioKm}
                                onChange={(e) => setRaioKm(Number(e.target.value))}
                            >
                                {RAIOS_KM.map((r) => (
                                    <option key={r} value={r}>
                                        {r} km
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="botao"
                            onClick={buscarPorRaio}
                            disabled={!posicao || carregando}
                        >
                            {carregando ? "Buscando…" : "Buscar perto de mim"}
                        </button>

                        {!posicao && (
                            <p className="info">
                                A busca por raio precisa da sua localização. Permita o acesso no
                                navegador e recarregue a página.
                            </p>
                        )}

                        {resultadoRaio && (
                            <>
                                <h3>
                                    {resultadoRaio.pontos.length} resultado(s) em{" "}
                                    {resultadoRaio.raioM / 1000} km
                                </h3>
                                <ul className="lista-resultados">
                                    {resultadoRaio.pontos.map((p) => (
                                        <li key={p.id}>
                                            <button onClick={() => mapa?.flyTo([p.lat, p.lng], 17)}>
                                                <span>
                                                    {CATEGORIAS[p.categoria]?.emoji ?? "📍"} {p.nome}
                                                </span>
                                                <small>{formatarDistancia(p.distancia_m)}</small>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </>
                )}

                {limitado && modo === "area" && (
                    <p className="info">
                        Muitos pontos nesta área: mostrando só os primeiros 500. Aproxime o
                        mapa para ver mais detalhes.
                    </p>
                )}
                {erroApi && <p className="erro">{erroApi}</p>}
            </aside>

            <div className="mapa-area">
                {erroGeo && <div className="aviso">{erroGeo}</div>}

                <MapContainer center={[centro.lat, centro.lng]} zoom={zoom} ref={setMapa}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <CarregadorPorArea
                        ativo={modo === "area"}
                        categoria={categoria}
                        onResultado={receberArea}
                        onCarregando={setCarregando}
                        onErro={setErroApi}
                    />

                    {posicao && (
                        <>
                            <CircleMarker
                                center={[posicao.lat, posicao.lng]}
                                radius={8}
                                pathOptions={{
                                    color: "white",
                                    weight: 3,
                                    fillColor: "#2563eb",
                                    fillOpacity: 1,
                                }}
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

                    {modo === "raio" && resultadoRaio && posicao && (
                        <Circle
                            center={[posicao.lat, posicao.lng]}
                            radius={resultadoRaio.raioM}
                            pathOptions={{ color: "#0f766e", weight: 2, fillOpacity: 0.05 }}
                        />
                    )}

                    {pontos.map((p) => (
                        <Marker
                            key={p.id}
                            position={[p.lat, p.lng]}
                            icon={iconeCategoria(p.categoria)}
                        >
                            <Popup>
                                <strong>{p.nome}</strong>
                                <br />
                                {p.categoria}
                                {p.descricao && (
                                    <>
                                        <br />
                                        {p.descricao}
                                    </>
                                )}
                                {p.distancia_m != null && (
                                    <>
                                        <br />
                                        <em>a {formatarDistancia(p.distancia_m)} de você</em>
                                    </>
                                )}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}