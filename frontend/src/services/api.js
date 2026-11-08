const BASE = import.meta.env.VITE_API_URL;

async function requisicao(caminho, opcoes = {}) {
    const resposta = await fetch(`${BASE}${caminho}`, {
        headers: { "Content-Type": "application/json" },
        ...opcoes,
    });

    if (resposta.status === 204) return null;

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const mensagem =
            corpo?.erros?.join("; ") || corpo?.mensagem || "Erro ao comunicar com o servidor";
        throw new Error(mensagem);
    }
    return corpo;
}

function montarQuery(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") q.set(chave, valor);
    });
    return q.toString();
}

export const api = {
    listar: (params = {}) => requisicao(`/api/estabelecimentos?${montarQuery(params)}`),
    buscarUm: (id) => requisicao(`/api/estabelecimentos/${id}`),
    criar: (dados) =>
        requisicao("/api/estabelecimentos", { method: "POST", body: JSON.stringify(dados) }),
    atualizar: (id, dados) =>
        requisicao(`/api/estabelecimentos/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
    excluir: (id) => requisicao(`/api/estabelecimentos/${id}`, { method: "DELETE" }),

    porArea: (limites, categoria, signal) =>
        requisicao(`/api/estabelecimentos/area?${montarQuery({ ...limites, categoria })}`, { signal }),
    proximos: (params) => requisicao(`/api/estabelecimentos/proximos?${montarQuery(params)}`),

    geocodificar: (q) => requisicao(`/api/geocode?${montarQuery({ q })}`),
};