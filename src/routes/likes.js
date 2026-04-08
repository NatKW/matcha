import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const photosRouter = Router();

// 🔹 GET /photos → récupérer toutes les photos
photosRouter.get("/", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM photos ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /photos:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /photos/user/:user_id → photos d’un utilisateur
photosRouter.get("/user/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM photos WHERE user_id = $1 ORDER BY id ASC",
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /photos/user:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST /photos → créer une photo
photosRouter.post("/", authMiddleware, async (req, res) => {
  const user_id = req.user.userId; // 🔐 sécurisé
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL manquante" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO photos (user_id, url)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur POST /photos:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 PUT /photos/:id → modifier une photo
photosRouter.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  const { url } = req.body;

  try {
    // 🔐 vérifier que la photo appartient à l'utilisateur
    const check = await pool.query(
      "SELECT * FROM photos WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const result = await pool.query(
      `UPDATE photos
       SET url = $1
       WHERE id = $2
       RETURNING *`,
      [url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur PUT /photos:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /photos/:id → supprimer une photo
photosRouter.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;

  try {
    // 🔐 vérifier que la photo appartient à l'utilisateur
    const check = await pool.query(
      "SELECT * FROM photos WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    await pool.query(
      "DELETE FROM photos WHERE id = $1",
      [id]
    );

    res.json({ message: "Photo supprimée avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /photos:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default photosRouter;