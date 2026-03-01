import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastNewOrder } from "../../agencies/orders/live/route";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // MVP: Mock Mercado Pago Webhook
        // Na vida real: Validar assinatura x-signature do Mercado Pago
        // payload = { orderId: string, status: 'approved' | 'rejected', ... }
        const { orderId, status } = payload;

        if (!orderId || !status) {
            return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        if (status === "approved") {
            // 1. Atualizar Order para AGUARDANDO_ACEITE
            // 2. Definir 20 min de expericao (acceptExpiresAt)
            const acceptExpiresAt = new Date(Date.now() + 20 * 60000); // 20 min a partir de agora

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "AGUARDANDO_ACEITE",
                    acceptExpiresAt
                },
                include: {
                    service: true,
                    client: true,
                    orderVehicles: true
                }
            });

            // 3. Registrar pagamento
            await prisma.payment.create({
                data: {
                    orderId,
                    status: "APPROVED",
                    amount: updatedOrder.finalTotal,
                    externalPaymentId: payload.paymentId || "mock_payment_123"
                }
            });

            // 4. Disparar SSE para todas as agências conectadas
            broadcastNewOrder(updatedOrder);

            return NextResponse.json({ success: true, message: "Payment validated and dispute started." });
        } else {
            // Registrar falha de pagamento e order status CANCELADA ou REJEITADA
            await prisma.payment.create({
                data: {
                    orderId,
                    status: "REJECTED",
                    amount: 0,
                }
            });

            return NextResponse.json({ success: true, message: "Payment rejected ignored." });
        }

    } catch (error) {
        console.error("Webhook Error", error);
        return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }
}
