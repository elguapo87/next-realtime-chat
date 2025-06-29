import cloudinary from "@/lib/cloudinary";
import { protectRoute } from "@/middleware/authUser";
import userModel from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const user = await protectRoute(req);
        const userId = user._id;
        if (!user || !userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const formData = await req.formData();
        const fullName = formData.get("fullName") as string;
        const bio = formData.get("bio") as string;
        const imageFile = formData.get("profileImage");

        let imageUrl = "";

        if (imageFile instanceof File && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadRes = await cloudinary.uploader.upload(`data:image/jpeg;base64,${buffer.toString("base64")}`, {
                folder: "realtime_chat"
            });
            imageUrl = uploadRes.secure_url;
        }

        let updatedProfile;

        if (!imageUrl) {
            updatedProfile = { fullName, bio }

        } else {
            updatedProfile = { profileImage: imageUrl, fullName, bio };
        }

        await userModel.findByIdAndUpdate(userId, updatedProfile);

        return NextResponse.json({ success: true, profile: updatedProfile, message: "Profile updated" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ success: false, message: errMessage });
    }
}