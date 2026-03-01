import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const rules = await prisma.pricingRule.findMany({
            orderBy: { name: "asc" }
        });
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch pricing rules" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { name, value } = body;

        if (!name || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const rule = await prisma.pricingRule.upsert({
            where: { name },
            update: { value },
            create: { name, value, description: "Regra de Preço: " + name }
        });

        return NextResponse.json({ success: true, rule });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update pricing rule" }, { status: 500 });
    }
}
