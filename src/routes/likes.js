import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const likesRouter = Router();

// 🔹 POST /likes → créer un like simple
likesRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const { user_id, photo_id } = req.body;

    if (!user_id || !photo_id) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const result = await pool.query(
      `INSERT INTO likes (user_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, photo_id]
    );

    res.status(201).json(result.rows[0] || null);
  } catch (err) {
    console.error("Erreur POST /likes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /likes → vérifier si un like existe
likesRouter.get("/", async (req, res) => {
  try {
    const { user_id, photo_id } = req.query;

    if (!user_id || !photo_id) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const result = await pool.query(
      `SELECT * FROM likes WHERE user_id = $1 AND photo_id = $2`,
      [user_id, photo_id]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Erreur GET /likes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST /likes/match → créer un match si le like est réciproque
likesRouter.post("/match", async (req, res) => {
  try {
    const { user_id, photo_id } = req.body;

    if (!user_id || !photo_id) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // 1️⃣ Trouver le propriétaire de la photo likée
    const photoRes = await pool.query(
      `SELECT user_id FROM photos WHERE id = $1`,
      [photo_id]
    );

    if (photoRes.rows.length === 0) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const ownerId = photoRes.rows[0].user_id;

    // empêcher de liker soi-même
    if (ownerId === Number(user_id)) {
      return res.status(400).json({ error: "Impossible de se liker soi-même" });
    }

    // 2️⃣ Vérifier si le propriétaire a déjà liké une photo du demandeur
    const reciprocal = await pool.query(
      `SELECT 1 FROM likes
       WHERE user_id = $1
       AND photo_id IN (
         SELECT id FROM photos WHERE user_id = $2
       )
       LIMIT 1`,
      [ownerId, user_id]
    );

    // 3️⃣ Ajouter le like actuel
    const likeResult = await pool.query(
      `INSERT INTO likes (user_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, photo_id]
    );

    // Si pas de like réciproque, on renvoie juste le like
    if (reciprocal.rows.length === 0) {
      return res.status(201).json({
        like: likeResult.rows[0] || null,
        match: false
      });
    }

    // 4️⃣ Créer le match
    const matchResult = await pool.query(
      `INSERT INTO matches (user1_id, user2_id)
       VALUES (LEAST($1, $2), GREATEST($1, $2))
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, ownerId]
    );

    res.status(201).json({
      like: likeResult.rows[0] || null,
      match: true,
      matchData: matchResult.rows[0] || null
    });

  } catch (err) {
    console.error("Erreur POST /likes/match:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default likesRouter;