import connectDB from "@/config/db";
import { genToken } from "@/lib/genToken";
import userModel from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    
    try {
        await connectDB();

        const user = await userModel.findOne({ email });
        if (!user) return NextResponse.json({ success: false, message: "Account not exist" });

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) return NextResponse.json({ success: false, message: "Invalid credentials" });

        const token = genToken(user._id);

        return NextResponse.json({
            success: true,
            user,
            token,
            message: "Login successfully"
        });
        
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ success: false, message: errMessage });
    }
}