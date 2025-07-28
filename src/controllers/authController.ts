import { Request, Response } from "express";
import User from "../models/User";
import DocumentModel from "../models/Document";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = (req as any).user;
    
    // Delete all documents associated with this user from MongoDB
    const deleteResult = await DocumentModel.deleteMany({ userId });
    
    console.log(`Deleted ${deleteResult.deletedCount} documents for user ${userId}`);
    
    res.json({ 
      message: "Logged out successfully", 
      documentsDeleted: deleteResult.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting user documents on logout:", error);
    res.status(500).json({ message: "Logout failed, could not delete user documents" });
  }
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email, and password required" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed });
  await user.save();

  res.status(201).json({ message: "User registered successfully" });
}
