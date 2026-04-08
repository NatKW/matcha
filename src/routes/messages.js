import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const messagesRouter = Router();

// 🔹 POST /messages → envoyer un message
messagesRouter.post("/", authMiddleware, async (req, res) => {
  const sender_id = req.user.userId;
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sender_id, receiver_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur POST /messages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /messages/:user_id → récupérer tous les messages de l'utilisateur
messagesRouter.get("/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  // sécurité : l'utilisateur ne peut accéder qu'à ses messages
  if (parseInt(user_id) !== req.user.userId) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE sender_id = $1 OR receiver_id = $1
       ORDER BY created_at ASC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur GET /messages/:user_id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /messages/conversation/:user1/:user2 → récupérer la conversation entre deux utilisateurs
messagesRouter.get("/conversation/:user1/:user2", authMiddleware, async (req, res) => {
  const { user1, user2 } = req.params;
  const userId = req.user.userId;

  // sécurité : l'utilisateur doit être l'un des deux
  if (parseInt(user1) !== userId && parseInt(user2) !== userId) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [user1, user2]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucun message trouvé entre ces utilisateurs" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erreur GET /messages/conversation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /messages/:id → supprimer un message
messagesRouter.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // vérifier que le message appartient à l'utilisateur
    const check = await pool.query(
      `SELECT * FROM messages WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
      [id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: "Vous ne pouvez pas supprimer ce message" });
    }

    const result = await pool.query(
      "DELETE FROM messages WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({ message: "Message supprimé avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /messages/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default messagesRouter;