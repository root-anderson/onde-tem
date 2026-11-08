const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "OndeTem/1.0 (trabalho academico de Banco de Dados II)";

// Cache simples em memória e controle de ritmo (Nominatim: 1 req/s)
const cache = new Map();
const CACHE_MAX = 200;
let ultimaChamada = 0;

export async function buscarEndereco(req, res) {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 3 || q.length > 200) {
        return res.status(400).json({ mensagem: "q deve ter entre 3 e 200 caracteres" });
    }

    const chave = q.toLowerCase();
    if (cache.has(chave)) return res.json(cache.get(chave));

    const espera = 1100 - (Date.now() - ultimaChamada);
    if (espera > 0) {
        return res.status(429).json({ mensagem: "Muitas buscas seguidas, aguarde um instante" });
    }
    ultimaChamada = Date.now();

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "br");
    url.searchParams.set("accept-language", "pt-BR");

    try {
        const resposta = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        if (!resposta.ok) {
            return res.status(502).json({ mensagem: "Serviço de geocodificação indisponível" });
        }
        const bruto = await resposta.json();
        const resultados = bruto.map((item) => ({
            nome: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
        }));

        if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
        cache.set(chave, resultados);

        res.json(resultados);
    } catch (erro) {
        console.error(erro);
        res.status(502).json({ mensagem: "Falha ao consultar o serviço de geocodificação" });
    }
}