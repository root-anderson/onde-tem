import { buscarEndereco } from "./controllers/geocode.controller.js";
import estabelecimentosRoutes from "./routes/estabelecimentos.routes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const origens = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({ origin: origens }));

app.use(express.json());
app.use("/api/estabelecimentos", estabelecimentosRoutes);

// Rota de saúde: confirma que a API e o banco estão no ar
app.get("/api/health", async (req, res) => {
    try {
        const r = await query("SELECT PostGIS_Version() AS postgis, now() AS hora");
        res.json({ status: "ok", ...r.rows[0] });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ status: "erro", mensagem: "Falha ao conectar ao banco" });
    }
});

app.get("/api/geocode", buscarEndereco);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});