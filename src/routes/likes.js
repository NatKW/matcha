import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const likesRouter = Router();

// 🔹 POST /likes → liker une photo + créer match si réciproque
likesRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId; // 🔥 vient du JWT
    const { photo_id } = req.body;

    if (!photo_id) {
      return res.status(400).json({ error: "photo_id requis" });
    }

    // 1️⃣ Ajouter le like
    const likeResult = await pool.query(
      `INSERT INTO likes (user_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, photo_id]
    );

    // 2️⃣ Trouver le propriétaire de la photo
    const photoRes = await pool.query(
      `SELECT user_id FROM photos WHERE id = $1`,
      [photo_id]
    );

    if (photoRes.rows.length === 0) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const ownerId = photoRes.rows[0].user_id;

    // ❌ éviter auto-like
    if (ownerId === user_id) {
      return res.status(400).json({ error: "Impossible de se liker soi-même" });
    }

    // 3️⃣ Vérifier like inverse
    const reciprocal = await pool.query(
      `SELECT 1 FROM likes
       WHERE user_id = $1
       AND photo_id IN (
         SELECT id FROM photos WHERE user_id = $2
       )
       LIMIT 1`,
      [ownerId, user_id]
    );

    if (reciprocal.rows.length === 0) {
      return res.status(201).json({
        like: likeResult.rows[0] || null,
        match: false
      });
    }

    // 4️⃣ Créer match
    const matchResult = await pool.query(
      `INSERT INTO matches (user1_id, user2_id)
       VALUES (LEAST($1, $2), GREATEST($1, $2))
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, ownerId]
    );

    return res.status(201).json({
      like: likeResult.rows[0] || null,
      match: true,
      matchData: matchResult.rows[0] || null
    });

  } catch (err) {
    console.error("Erreur POST /likes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default likesRouter;