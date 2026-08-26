import { Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { RegisterInput, LoginInput } from "../validators/authSchemas";

const SALT_ROUNDS = 10;

function toPublicUser(user: { _id: unknown; name: string; email: string }) {
  return { id: user._id, name: user.name, email: user.email };
}

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = (req as unknown as { validated: RegisterInput }).validated;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken({ userId: user._id.toString() });
  res.status(201).json({ token, user: toPublicUser(user) });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = (req as unknown as { validated: LoginInput }).validated;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user._id.toString() });
  res.status(200).json({ token, user: toPublicUser(user) });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({ user: toPublicUser(user) });
});
