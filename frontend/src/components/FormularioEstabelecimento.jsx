import { useState } from "react";
import SeletorLocalizacao from "./SeletorLocalizacao.jsx";
import { api } from "../services/api.js";
import { CATEGORIAS, NOMES_CATEGORIAS } from "../utils/categorias.js";

export default function FormularioEstabelecimento({
    inicial,
    centro,
    zoom = 14,
    textoBotao = "Salvar",
    onSalvar,
}) {
    const [nome, setNome] = useState(inicial?.nome ?? "");
    const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
    const [categoria, setCategoria] = useState(inicial?.categoria ?? "");
    const [posicao, setPosicao] = useState(
        inicial ? { lat: inicial.lat, lng: inicial.lng } : null
    );
    const [alvo, setAlvo] = useState(null);

    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);
    const [erroBusca, setErroBusca] = useState(null);

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);

    async function buscarEndereco() {
        const termo = busca.trim();
        if (termo.length < 3) {
            setErroBusca("Digite pelo menos 3 caracteres.");
            return;
        }
        setBuscando(true);
        setBloqueado(true);
        setErroBusca(null);
        try {
            setResultados(await api.geocodificar(termo));
        } catch (e) {
            setResultados(null);
            setErroBusca(e.message);
        } finally {
            setBuscando(false);
            // Respeita o limite do Nominatim (1 busca por segundo)
            setTimeout(() => setBloqueado(false), 1200);
        }
    }

    function escolherResultado(r) {
        const p = { lat: Number(r.lat.toFixed(6)), lng: Number(r.lng.toFixed(6)) };
        setPosicao(p);
        setAlvo({ ...p }); // objeto novo: faz o mapa voar até lá
        setResultados(null);
    }

    async function enviar(e) {
        e.preventDefault();
        setErro(null);
        if (!posicao) {
            setErro("Marque a localização: busque um endereço ou clique no mapa.");
            return;
        }
        setSalvando(true);
        try {
            await onSalvar({
                nome,
                descricao,
                categoria,
                lat: posicao.lat,
                lng: posicao.lng,
            });
        } catch (e2) {
            setErro(e2.message);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <form className="formulario" onSubmit={enviar}>
            <div className="form-campos">
                <div className="campo">
                    <label htmlFor="nome">Nome *</label>
                    <input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        maxLength={120}
                        required
                    />
                </div>

                <div className="campo">
                    <label htmlFor="categoria">Categoria *</label>
                    <select
                        id="categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                    >
                        <option value="">Selecione…</option>
                        {NOMES_CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                                {CATEGORIAS[c].emoji} {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        maxLength={1000}
                        rows={3}
                    />
                </div>

                <div className="campo">
                    <label htmlFor="busca">Buscar endereço ou localidade</label>
                    <div className="linha-busca">
                        <input
                            id="busca"
                            value={busca}
                            placeholder="Ex.: Praça Getúlio Vargas, Sousa PB"
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // não envia o formulário
                                    if (!bloqueado) buscarEndereco();
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="botao"
                            onClick={buscarEndereco}
                            disabled={buscando || bloqueado}
                        >
                            {buscando ? "Buscando…" : "Buscar"}
                        </button>
                    </div>

                    {erroBusca && <p className="erro">{erroBusca}</p>}

                    {resultados && resultados.length === 0 && (
                        <p className="info">
                            Nenhum resultado. Clique no mapa para marcar o local.
                        </p>
                    )}

                    {resultados && resultados.length > 0 && (
                        <ul className="resultados-busca">
                            {resultados.map((r, i) => (
                                <li key={i}>
                                    <button type="button" onClick={() => escolherResultado(r)}>
                                        {r.nome}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <p className="info">
                    Você também pode <strong>clicar no mapa</strong> ou{" "}
                    <strong>arrastar o marcador</strong> para ajustar a posição.
                </p>

                <p className="coordenadas">
                    {posicao
                        ? `📍 Posição: ${posicao.lat}, ${posicao.lng}`
                        : "Nenhuma posição marcada ainda."}
                </p>

                {erro && <p className="erro">{erro}</p>}

                <button type="submit" className="botao" disabled={salvando}>
                    {salvando ? "Salvando…" : textoBotao}
                </button>
            </div>

            <div className="seletor-mapa">
                <SeletorLocalizacao
                    posicao={posicao}
                    onChange={setPosicao}
                    alvo={alvo}
                    centro={centro}
                    zoom={zoom}
                />
            </div>
        </form>
    );
}