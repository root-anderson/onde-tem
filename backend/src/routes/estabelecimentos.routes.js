import { Router } from "express";
import {
    criar,
    listar,
    buscarUm,
    atualizar,
    excluir,
    porArea,
    proximos,
} from "../controllers/estabelecimentos.controller.js";

const router = Router();

// Rotas fixas ANTES de "/:id", senão "area" seria tratado como um id
router.get("/area", porArea);
router.get("/proximos", proximos);

router.post("/", criar);
router.get("/", listar);
router.get("/:id", buscarUm);
router.put("/:id", atualizar);
router.delete("/:id", excluir);

export default router;