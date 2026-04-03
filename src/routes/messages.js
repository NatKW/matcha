import { Router } from "express";
import pool from "../config/db.js";
import authMiddleware from "../middlewares/auth.js";

const messagesRouter = Router();

// 🔹 POST /messages → envoyer un message
messagesRouter.post("/", authMiddleware, async (req, res) => {
  const sender_id = req.user.userId;
  const { receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, receiver_id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur POST /messages:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET /messages/:user_id → récupérer tous les messages envoyés ou reçus par un utilisateur
messagesRouter.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

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
messagesRouter.get("/conversation/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

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
messagesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM messages WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message non trouvé" });
    }

    res.json({ message: "Message supprimé avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /messages/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default messagesRouter;
