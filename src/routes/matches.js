import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const matchesRouter = Router();

// 🔹 GET /matches → récupérer tous les matches de l'utilisateur connecté
matchesRouter.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
  `
  SELECT 
    m.id,
    m.created_at,
    u.id AS user_id,
    u.username
  FROM matches m
  JOIN users u ON (
    u.id = CASE
      WHEN m.user1_id = $1 THEN m.user2_id
      ELSE m.user1_id
    END
  )
  WHERE m.user1_id = $1 OR m.user2_id = $1
  ORDER BY m.created_at ASC
  `,
  [userId]
);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur GET /matches:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /matches/check?user1=1&user2=2 → vérifier si deux utilisateurs sont en match
matchesRouter.get("/check", authMiddleware, async (req, res) => {
  const { user1, user2 } = req.query;
  const userId = req.user.userId;

  // sécurité : l'utilisateur doit être l'un des deux
  if (parseInt(user1) !== userId && parseInt(user2) !== userId) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM matches
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`,
      [user1, user2]
    );

    res.json({ match: result.rows.length > 0 });
  } catch (err) {
    console.error("Erreur GET /matches/check:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST /matches → créer un match entre deux utilisateurs
matchesRouter.post("/", authMiddleware, async (req, res) => {
  const user1 = req.user.userId;
  const { user2 } = req.body;

  if (!user2) {
    return res.status(400).json({ error: "Paramètre user2 manquant" });
  }

  // éviter match avec soi-même
  if (parseInt(user2) === user1) {
    return res.status(400).json({ error: "Impossible de matcher avec soi-même" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO matches (user1_id, user2_id)
       VALUES (LEAST($1, $2), GREATEST($1, $2))
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user1, user2]
    );

    res.status(201).json({
      matchCreated: result.rows.length > 0,
      match: result.rows[0] || null
    });
  } catch (err) {
    console.error("Erreur POST /matches:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /matches/:id → supprimer un match
matchesRouter.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // vérifier que le match inclut l'utilisateur
    const check = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Vous ne pouvez pas supprimer ce match" });
    }

    const result = await pool.query(
      `DELETE FROM matches WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({ message: "Match supprimé avec succès", match: result.rows[0] });
  } catch (err) {
    console.error("Erreur DELETE /matches/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default matchesRouter;