import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
});

export async function query(texto, parametros = []) {
    const resultado = await pool.query(texto, parametros);
    return resultado;
}