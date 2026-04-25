import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const likesRouter = Router();

// 🔹 POST /likes → liker une photo + match si réciproque
likesRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { photo_id } = req.body;

    if (!photo_id) {
      return res.status(400).json({ error: "photo_id requis" });
    }

    // 1️⃣ Vérifier la photo + owner
    const photoRes = await pool.query(
      `SELECT user_id FROM photos WHERE id = $1`,
      [photo_id]
    );

    if (photoRes.rows.length === 0) {
      return res.status(404).json({ error: "Photo introuvable" });
    }

    const ownerId = photoRes.rows[0].user_id;

    // ❌ empêcher auto-like
    if (ownerId === user_id) {
      return res.status(400).json({ error: "Impossible de se liker soi-même" });
    }

    // 2️⃣ Ajouter le like
    const likeResult = await pool.query(
      `INSERT INTO likes (user_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, photo_id]
    );

    // si déjà liké → on stoppe proprement
    const alreadyLiked = likeResult.rows.length === 0;

    // 3️⃣ Vérifier like réciproque (simplifié)
    const reciprocal = await pool.query(
      `
      SELECT 1
      FROM likes l
      JOIN photos p ON p.id = l.photo_id
      WHERE l.user_id = $1
        AND p.user_id = $2
      LIMIT 1
      `,
      [ownerId, user_id]
    );

    const isMatch = reciprocal.rows.length > 0;

    // 4️⃣ Créer match si nécessaire
    let matchData = null;

    if (isMatch) {
      const matchResult = await pool.query(
        `
        INSERT INTO matches (user1_id, user2_id)
        VALUES (LEAST($1, $2), GREATEST($1, $2))
        ON CONFLICT DO NOTHING
        RETURNING *
        `,
        [user_id, ownerId]
      );

      matchData = matchResult.rows[0] || null;
    }

    // 5️⃣ réponse clean
    return res.status(201).json({
      like: alreadyLiked ? null : likeResult.rows[0],
      match: isMatch,
      matchData
    });

  } catch (err) {
    console.error("Erreur POST /likes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default likesRouter;