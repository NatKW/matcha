import { Router } from "express";

import likesRouter from "./likes.js";
import matchesRouter from "./matches.js";
import messagesRouter from "./messages.js";
import photosRouter from "./photos.js";
import usersRouter from "./users.js";

const router = Router();

// route de test
router.get("/", (req, res) => {
  res.send("Matcha API structured 🚀");
});

router.use("/likes", likesRouter);
router.use("/matches", matchesRouter);
router.use("/messages", messagesRouter);
router.use("/photos", photosRouter);
router.use("/users", usersRouter);

export default router;