import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { status } = body;

        if (!status || !["ATIVA", "SUSPENSA"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const agency = await prisma.agency.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json({ success: true, agency });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update agency status" }, { status: 500 });
    }
}
