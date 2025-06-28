// lib/protectRoute.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import userModel from "@/models/userModel";
import connectDB from "@/config/db";


export const protectRoute = async (req: NextRequest) => {
  try {
    const token = req.headers.get("token");

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized: No token" }, { status: 401 });
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, message: "Missing SECRET_KEY" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secretKey) as { userId: string };

    await connectDB();
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return user;

  } catch (error) {
    console.error("ProtectRoute Error:", error);
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
  }
};
