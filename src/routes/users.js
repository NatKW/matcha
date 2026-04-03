import { Router } from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.js";

const usersRouter = Router();


// 🔹 REGISTER
usersRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, bio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, bio`,
      [username, email, hashedPassword, bio]
    );

    const user = result.rows[0];

    // 🔑 token directement après inscription
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user, token });

  } catch (err) {
    console.error("Erreur REGISTER:", err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "Utilisateur déjà existant" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 LOGIN
usersRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🔐 supprimer password avant retour
    delete user.password;

    res.json({ user, token });

  } catch (err) {
    console.error("Erreur LOGIN:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 GET /users (protégé)
usersRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, bio FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur GET /users:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 GET /users/:id (protégé)
usersRouter.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, username, email, bio FROM users WHERE id = $1",
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


// 🔹 PUT /users/:id (protégé)
usersRouter.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, bio } = req.body;

    // 🔐 empêcher modification d’un autre user
    if (Number(id) !== req.user.userId) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, bio = $3
       WHERE id = $4
       RETURNING id, username, email, bio`,
      [username, email, bio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Erreur PUT /users:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// 🔹 DELETE /users/:id (protégé)
usersRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 empêcher suppression d’un autre user
    if (Number(id) !== req.user.userId) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé" });

  } catch (err) {
    console.error("Erreur DELETE /users:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default usersRouter;