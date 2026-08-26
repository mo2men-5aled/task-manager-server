import { Response } from "express";
import { Task } from "../models/Task";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth";
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from "../validators/taskSchemas";

export const listTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, status, priority } = (req as unknown as { validated: TaskQueryInput }).validated;

  const filter: Record<string, unknown> = { owner: req.userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: "i" };

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ tasks });
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = (req as unknown as { validated: CreateTaskInput }).validated;
  const task = await Task.create({ ...data, owner: req.userId });
  res.status(201).json({ task });
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.status(200).json({ task });
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = (req as unknown as { validated: UpdateTaskInput }).validated;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    data,
    { new: true, runValidators: true }
  );
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.status(200).json({ task });
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  res.status(204).send();
});
