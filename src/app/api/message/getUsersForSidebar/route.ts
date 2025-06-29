import { protectRoute } from "@/middleware/authUser";
import messageModel from "@/models/messageModel";
import userModel from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await protectRoute(req);
        const userId = user._id
        if (!user || !userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password");

        // Count number of messages not seen
        const unseenMessages: Record<string, number> = {};

        const promises = filteredUsers.map(async (user) => {
            const messages = await messageModel.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            if (messages.length > 0) {
                unseenMessages[user._id as string] = messages.length;
            }
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, users: filteredUsers, unseenMessages });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred"
        return NextResponse.json({ success: false, message: errMessage });
    }
}


