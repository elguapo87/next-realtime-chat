import connectDB from "@/config/db";
import { genToken } from "@/lib/genToken";
import userModel from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { fullName, email, password, bio } = await req.json();

    try {
        if (!fullName || !email || !password) {
            return NextResponse.json({ success: false, message: "Missing Details" });
        }

        await connectDB();

        const existingUser = await userModel.findOne({ email });
        if (existingUser) return NextResponse.json({ success: false, message: "Account already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = genToken(user._id);

        return NextResponse.json({
            success: true,
            userData: user,
            token,
            message: "Account created successfully"
        });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ success: false, message: errMessage });
    }
}