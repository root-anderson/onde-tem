import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { CATEGORIAS, NOMES_CATEGORIAS } from "../utils/categorias.js";

const LIMITE = 10;

export default function GerenciarPage() {
    const [dados, setDados] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);

    const [busca, setBusca] = useState("");
    const [buscaAplicada, setBuscaAplicada] = useState("");
    const [categoria, setCategoria] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [mensagem, setMensagem] = useState(null);

    const totalPaginas = Math.max(Math.ceil(total / LIMITE), 1);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const r = await api.listar({
                pagina,
                limite: LIMITE,
                busca: buscaAplicada,
                categoria,
            });
            setDados(r.dados);
            setTotal(r.total);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [pagina, buscaAplicada, categoria]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    function aplicarBusca(e) {
        e.preventDefault();
        setPagina(1);
        setBuscaAplicada(busca.trim());
    }

    function mudarCategoria(valor) {
        setPagina(1);
        setCategoria(valor);
    }

    async function excluir(item) {
        if (!window.confirm(`Excluir "${item.nome}"? Esta ação não pode ser desfeita.`)) {
            return;
        }
        try {
            await api.excluir(item.id);
            setMensagem(`"${item.nome}" foi excluído.`);
            // Se era o último item da página, volta uma página
            if (dados.length === 1 && pagina > 1) {
                setPagina(pagina - 1);
            } else {
                carregar();
            }
        } catch (e) {
            setErro(e.message);
        }
    }

    return (
        <div className="pagina-rolavel">
            {mensagem && (
                <div className="sucesso" onClick={() => setMensagem(null)}>
                    ✅ {mensagem} <small>(clique para fechar)</small>
                </div>
            )}

            <div className="pagina pagina-larga">
                <h1>Gerenciar estabelecimentos</h1>

                <div className="filtros">
                    <form className="linha-busca" onSubmit={aplicarBusca}>
                        <input
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por nome…"
                            aria-label="Buscar por nome"
                        />
                        <button type="submit" className="botao">
                            Buscar
                        </button>
                    </form>

                    <select
                        value={categoria}
                        onChange={(e) => mudarCategoria(e.target.value)}
                        aria-label="Filtrar por categoria"
                    >
                        <option value="">Todas as categorias</option>
                        {NOMES_CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                                {CATEGORIAS[c].emoji} {c}
                            </option>
                        ))}
                    </select>
                </div>

                {erro && <p className="erro">{erro}</p>}

                <div className="tabela-wrap">
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Localização</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.nome}</strong>
                                        {item.descricao && (
                                            <div className="descricao-tabela">{item.descricao}</div>
                                        )}
                                    </td>
                                    <td>
                                        {CATEGORIAS[item.categoria]?.emoji} {item.categoria}
                                    </td>
                                    <td className="coordenadas">
                                        {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                                    </td>
                                    <td className="acoes">
                                        <Link to={`/gerenciar/${item.id}`} className="botao-sec">
                                            Editar
                                        </Link>
                                        <button
                                            className="botao-perigo"
                                            onClick={() => excluir(item)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!carregando && dados.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="vazio">
                                        Nenhum estabelecimento encontrado.
                                    </td>
                                </tr>
                            )}
                            {carregando && dados.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="vazio">
                                        Carregando…
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="paginacao">
                    <button
                        className="botao-sec"
                        onClick={() => setPagina(pagina - 1)}
                        disabled={pagina <= 1 || carregando}
                    >
                        ← Anterior
                    </button>
                    <span>
                        Página {pagina} de {totalPaginas} ({total} no total)
                    </span>
                    <button
                        className="botao-sec"
                        onClick={() => setPagina(pagina + 1)}
                        disabled={pagina >= totalPaginas || carregando}
                    >
                        Próxima →
                    </button>
                </div>
            </div>
        </div>
    );
}