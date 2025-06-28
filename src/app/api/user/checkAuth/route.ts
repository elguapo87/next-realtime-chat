import { protectRoute } from "@/middleware/authUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const authUser = await protectRoute(req);

    return NextResponse.json({ success: true, user: authUser });
}