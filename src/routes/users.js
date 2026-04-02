import { Router } from "express";
import pool from "../config/db.js";

const usersRouter = Router();


// 🔹 GET /users → récupérer tous les utilisateurs
usersRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /users:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 GET /users/:id → récupérer un utilisateur par id
usersRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur GET /users/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 POST /users → créer un utilisateur
usersRouter.post("/", async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    // validation minimale
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password, bio)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [username, email, password, bio]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur POST /users:", err);

    // gestion des erreurs uniques (email/username)
    if (err.code === "23505") {
      return res.status(400).json({ error: "Utilisateur déjà existant" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 PUT /users/:id → modifier un utilisateur
usersRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, bio } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, bio = $3
       WHERE id = $4
       RETURNING *`,
      [username, email, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur PUT /users/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE /users/:id → supprimer un utilisateur
usersRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /users/:id:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default usersRouter;