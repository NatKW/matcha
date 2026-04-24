import { Router } from "express";
import usersRouter from "./users.js";
import photosRouter from "./photos.js";
import likesRouter from "./likes.js";
import matchesRouter from "./matches.js";
import messagesRouter from "./messages.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("API is structured 🚀");
});

router.use("/users", usersRouter);
router.use("/photos", photosRouter);
router.use("/likes", likesRouter);
router.use("/matches", matchesRouter);
router.use("/messages", messagesRouter);

export default router;