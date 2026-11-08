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