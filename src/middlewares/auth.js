import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ❌ pas de token
  if (!authHeader) {
    return res.status(401).json({ error: "Accès non autorisé" });
  }

  // format attendu : "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // on ajoute l'utilisateur dans la requête
    req.user = decoded;

    next(); // passe à la suite (route)
  } catch (err) {
    return res.status(403).json({ error: "Token invalide" });
  }
};

export default authMiddleware;