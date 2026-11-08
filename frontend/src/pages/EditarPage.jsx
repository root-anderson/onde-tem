import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import FormularioEstabelecimento from "../components/FormularioEstabelecimento.jsx";

export default function EditarPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setItem(null);
        setErro(null);

        api
            .buscarUm(id)
            .then((r) => {
                if (!cancelado) setItem(r);
            })
            .catch((e) => {
                if (!cancelado) setErro(e.message);
            });

        return () => {
            cancelado = true;
        };
    }, [id]);

    async function salvar(dados) {
        await api.atualizar(id, dados);
        navigate("/gerenciar");
    }

    return (
        <div className="pagina-rolavel">
            <div className="pagina pagina-larga">
                <p>
                    <Link to="/gerenciar">← Voltar para a lista</Link>
                </p>
                <h1>Editar estabelecimento</h1>

                {erro && <p className="erro">{erro}</p>}
                {!item && !erro && <p className="info">Carregando…</p>}

                {item && (
                    <FormularioEstabelecimento
                        inicial={item}
                        centro={{ lat: item.lat, lng: item.lng }}
                        zoom={17}
                        textoBotao="Salvar alterações"
                        onSalvar={salvar}
                    />
                )}
            </div>
        </div>
    );
}