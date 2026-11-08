import { Router } from "express";
import {
    criar,
    listar,
    buscarUm,
    atualizar,
    excluir,
} from "../controllers/estabelecimentos.controller.js";

const router = Router();

router.post("/", criar);
router.get("/", listar);
router.get("/:id", buscarUm);
router.put("/:id", atualizar);
router.delete("/:id", excluir);

export default router;