import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const agencies = await prisma.agency.findMany({
            include: {
                user: { select: { name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(agencies);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch agencies" }, { status: 500 });
    }
}
