import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const orderId = params.id;
        const body = await req.json();
        const { agencyId } = body;

        if (!agencyId) {
            return NextResponse.json({ error: "Missing agencyId" }, { status: 400 });
        }

        // Atomic Update (Disputa)
        // Atualiza apenas se estiver AGUARDANDO_ACEITE e dentro do tempo, e sem agencyId ainda.
        const result = await prisma.order.updateMany({
            where: {
                id: orderId,
                status: "AGUARDANDO_ACEITE",
                agencyId: null,
                acceptExpiresAt: {
                    gt: new Date() // Nao expirou ainda
                }
            },
            data: {
                status: "CONFIRMADA",
                agencyId: agencyId,
                acceptedAt: new Date()
            }
        });

        if (result.count === 0) {
            // Se não atualizou nada, ou alguem chegou primeiro, ou expirou, ou ja foi aceita.
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
            if (order.status === "CONFIRMADA") {
                return NextResponse.json({ error: "Corrida indisponível. Já foi aceita." }, { status: 409 });
            }
            if (order.acceptExpiresAt && order.acceptExpiresAt < new Date()) {
                return NextResponse.json({ error: "Tempo expirado. Sem aceite." }, { status: 410 });
            }
            return NextResponse.json({ error: "Failed to accept order" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Corrida confirmada." });

    } catch (error) {
        console.error("Accept Order Error", error);
        return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
    }
}
