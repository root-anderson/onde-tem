import { query } from "../db.js";
import { validarEstabelecimento, idValido } from "../validators.js";

// Colunas devolvidas ao frontend. A coluna geography é convertida em lat/lng.
const COLUNAS = `
  id, nome, descricao, categoria,
  ST_Y(localizacao::geometry) AS lat,
  ST_X(localizacao::geometry) AS lng,
  criado_em
`;

function erroInterno(res, erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
}

// CREATE
export async function criar(req, res) {
    const { erros, dados } = validarEstabelecimento(req.body);
    if (erros.length) return res.status(400).json({ erros });

    try {
        const r = await query(
            `INSERT INTO estabelecimentos (nome, descricao, categoria, localizacao)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography)
       RETURNING ${COLUNAS}`,
            [dados.nome, dados.descricao, dados.categoria, dados.lng, dados.lat]
        );
        res.status(201).json(r.rows[0]);
    } catch (erro) {
        erroInterno(res, erro);
    }
}

// READ (lista paginada, com filtros opcionais)
export async function listar(req, res) {
    const pagina = Math.max(parseInt(req.query.pagina) || 1, 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite) || 10, 1), 50);
    const offset = (pagina - 1) * limite;

    const condicoes = [];
    const params = [];

    if (req.query.categoria) {
        params.push(req.query.categoria);
        condicoes.push(`categoria = $${params.length}`);
    }
    if (req.query.busca) {
        params.push(`%${req.query.busca}%`);
        condicoes.push(`nome ILIKE $${params.length}`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

    try {
        const total = await query(
            `SELECT COUNT(*)::int AS total FROM estabelecimentos ${where}`,
            params
        );
        const lista = await query(
            `SELECT ${COLUNAS} FROM estabelecimentos ${where}
       ORDER BY criado_em DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limite, offset]
        );
        res.json({
            dados: lista.rows,
            total: total.rows[0].total,
            pagina,
            limite,
        });
    } catch (erro) {
        erroInterno(res, erro);
    }
}

// READ (um só)
export async function buscarUm(req, res) {
    const { id } = req.params;
    if (!idValido(id)) return res.status(400).json({ mensagem: "id inválido" });

    try {
        const r = await query(
            `SELECT ${COLUNAS} FROM estabelecimentos WHERE id = $1`,
            [id]
        );
        if (r.rowCount === 0) {
            return res.status(404).json({ mensagem: "Estabelecimento não encontrado" });
        }
        res.json(r.rows[0]);
    } catch (erro) {
        erroInterno(res, erro);
    }
}

// UPDATE
export async function atualizar(req, res) {
    const { id } = req.params;
    if (!idValido(id)) return res.status(400).json({ mensagem: "id inválido" });

    const { erros, dados } = validarEstabelecimento(req.body);
    if (erros.length) return res.status(400).json({ erros });

    try {
        const r = await query(
            `UPDATE estabelecimentos
       SET nome = $1, descricao = $2, categoria = $3,
           localizacao = ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography
       WHERE id = $6
       RETURNING ${COLUNAS}`,
            [dados.nome, dados.descricao, dados.categoria, dados.lng, dados.lat, id]
        );
        if (r.rowCount === 0) {
            return res.status(404).json({ mensagem: "Estabelecimento não encontrado" });
        }
        res.json(r.rows[0]);
    } catch (erro) {
        erroInterno(res, erro);
    }
}

// DELETE
export async function excluir(req, res) {
    const { id } = req.params;
    if (!idValido(id)) return res.status(400).json({ mensagem: "id inválido" });

    try {
        const r = await query(
            "DELETE FROM estabelecimentos WHERE id = $1 RETURNING id",
            [id]
        );
        if (r.rowCount === 0) {
            return res.status(404).json({ mensagem: "Estabelecimento não encontrado" });
        }
        res.status(204).send();
    } catch (erro) {
        erroInterno(res, erro);
    }
}