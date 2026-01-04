import express from "express";
import * as timerController from "../controllers/timerController.js";

const router = express.Router();

router.get("/", timerController.getTimers);
router.get("/:id", timerController.getTimer);
router.post("/", timerController.createTimer);
router.put("/:id", timerController.updateTimer);
router.delete("/:id", timerController.deleteTimer);

export default router;
