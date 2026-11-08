import { useState } from "react";
import { useGeolocalizacao } from "../hooks/useGeolocalizacao.js";
import { api } from "../services/api.js";
import FormularioEstabelecimento from "../components/FormularioEstabelecimento.jsx";

const CENTRO_PADRAO = { lat: -6.8902, lng: -38.5614 };

export default function CadastroPage() {
    const { status, posicao } = useGeolocalizacao();
    const [formKey, setFormKey] = useState(0);
    const [sucesso, setSucesso] = useState(null);

    if (status === "carregando") {
        return <div className="carregando">Obtendo sua localização…</div>;
    }

    const centro = posicao ?? CENTRO_PADRAO;

    async function salvar(dados) {
        const criado = await api.criar(dados);
        setSucesso(`"${criado.nome}" cadastrado com sucesso!`);
        setFormKey((k) => k + 1); // recria o formulário, limpando os campos
    }

    return (
        <div className="pagina-rolavel">
            {sucesso && (
                <div className="sucesso" onClick={() => setSucesso(null)}>
                    ✅ {sucesso} <small>(clique para fechar)</small>
                </div>
            )}
            <div className="pagina pagina-larga">
                <h1>Cadastrar estabelecimento</h1>
                <FormularioEstabelecimento
                    key={formKey}
                    centro={centro}
                    zoom={posicao ? 15 : 14}
                    textoBotao="Cadastrar"
                    onSalvar={salvar}
                />
            </div>
        </div>
    );
}