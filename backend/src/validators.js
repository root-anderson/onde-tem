export const CATEGORIAS = [
    "Restaurante",
    "Farmácia",
    "Mercadinho",
    "Posto de combustível",
    "Hospital",
    "Praça",
];

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function idValido(id) {
    return UUID_REGEX.test(id);
}

export function validarEstabelecimento(body) {
    const erros = [];

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const descricao =
        typeof body.descricao === "string" ? body.descricao.trim() : "";
    const categoria = body.categoria;
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (nome.length < 2 || nome.length > 120) {
        erros.push("nome deve ter entre 2 e 120 caracteres");
    }
    if (descricao.length > 1000) {
        erros.push("descricao deve ter no máximo 1000 caracteres");
    }
    if (!CATEGORIAS.includes(categoria)) {
        erros.push(`categoria deve ser uma de: ${CATEGORIAS.join(", ")}`);
    }
    if (body.lat === "" || body.lat == null || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        erros.push("lat deve ser um número entre -90 e 90");
    }
    if (body.lng === "" || body.lng == null || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        erros.push("lng deve ser um número entre -180 e 180");
    }

    return { erros, dados: { nome, descricao, categoria, lat, lng } };
}

export function validarArea(q) {
    const minLng = Number(q.minLng);
    const minLat = Number(q.minLat);
    const maxLng = Number(q.maxLng);
    const maxLat = Number(q.maxLat);

    const campos = [q.minLng, q.minLat, q.maxLng, q.maxLat];
    if (campos.some((c) => c === undefined || c === "")) {
        return { erro: "informe minLng, minLat, maxLng e maxLat" };
    }
    if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) {
        return { erro: "os limites devem ser números" };
    }
    if (minLat < -90 || maxLat > 90 || minLng < -180 || maxLng > 180) {
        return { erro: "limites fora do intervalo válido" };
    }
    if (minLng >= maxLng || minLat >= maxLat) {
        return { erro: "os valores mínimos devem ser menores que os máximos" };
    }
    return { dados: { minLng, minLat, maxLng, maxLat } };
}

export const RAIO_MAXIMO_M = 50000;

export function validarProximos(q) {
    if (q.lat === undefined || q.lat === "" || q.lng === undefined || q.lng === "") {
        return { erro: "informe lat e lng" };
    }
    const lat = Number(q.lat);
    const lng = Number(q.lng);
    const raio = q.raio === undefined || q.raio === "" ? 2000 : Number(q.raio);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { erro: "lat deve estar entre -90 e 90" };
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return { erro: "lng deve estar entre -180 e 180" };
    }
    if (!Number.isFinite(raio) || raio <= 0 || raio > RAIO_MAXIMO_M) {
        return { erro: `raio deve estar entre 1 e ${RAIO_MAXIMO_M} metros` };
    }
    return { dados: { lat, lng, raio } };
}