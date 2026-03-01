import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const holidays = await prisma.holiday.findMany({
            orderBy: { date: "asc" }
        });
        return NextResponse.json(holidays);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, date } = body;

        if (!name || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const holiday = await prisma.holiday.create({
            data: {
                name,
                date: new Date(date)
            }
        });

        return NextResponse.json({ success: true, holiday });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
    }
}
