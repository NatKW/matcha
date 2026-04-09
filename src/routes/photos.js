// src/routes/photos.js
import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const photosRouter = Router();

// 🔹 GET /photos → récupérer toutes les photos
photosRouter.get("/", authMiddleware, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM photos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /photos:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /photos/user/:user_id → récupérer les photos d'un utilisateur
photosRouter.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM photos WHERE user_id = $1 ORDER BY id ASC",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune photo trouvée" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /photos/user/:user_id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST /photos → upload image + créer photo
photosRouter.post(
  "/",
  authMiddleware,
  upload.single("image"), (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  },
  async (req, res) => {
    const user_id = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: "Image manquante" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
      const result = await pool.query(
        `INSERT INTO photos (user_id, url)
         VALUES ($1, $2)
         RETURNING *`,
        [user_id, imageUrl]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Erreur upload photo:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

// 🔹 PUT /photos/:id → modifier une photo
photosRouter.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, url } = req.body;

    const result = await pool.query(
      `UPDATE photos
       SET user_id = $1, url = $2
       WHERE id = $3
       RETURNING *`,
      [user_id, url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Photo non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur PUT /photos/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /photos/:id → supprimer une photo
photosRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM photos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Photo non trouvée" });
    }

    res.json({ message: "Photo supprimée avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /photos/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default photosRouter;