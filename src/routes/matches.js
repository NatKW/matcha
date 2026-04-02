import { Router } from "express";
import pool from "../config/db.js";

const matchesRouter = Router();

// 🔹 GET /matches/:user_id → récupérer tous les matches d’un user
matchesRouter.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM matches
       WHERE user1_id = $1 OR user2_id = $1`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur GET /matches:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /matches/:id → supprimer un match
matchesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM matches WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Match non trouvé" });
    }

    res.json({ message: "Match supprimé" });
  } catch (err) {
    console.error("Erreur DELETE /matches:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /matches/check?user1=1&user2=2 → vérifier match
matchesRouter.get("/check", async (req, res) => {
  const { user1, user2 } = req.query;

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

export default matchesRouter;