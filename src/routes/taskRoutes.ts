import { Router } from "express";
import { listTasks, createTask, getTask, updateTask, deleteTask } from "../controllers/taskController";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../validators/taskSchemas";

const router = Router();

router.use(requireAuth);

router.get("/", validate(taskQuerySchema, "query"), listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", getTask);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;
