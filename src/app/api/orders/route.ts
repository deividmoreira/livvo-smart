import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            clientId,
            serviceId,
            pickupLocation,
            scheduledAt,
            adults,
            children,
            vehicles,
            baseTotal,
            pricingMultiplier,
            finalTotal,
            platformAmount,
            agencyAmount,
            commissionPercent
        } = body;

        // Validacoes basicas
        if (!clientId || !serviceId || !pickupLocation || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                clientId,
                serviceId,
                pickupLocation,
                scheduledAt: new Date(scheduledAt),
                adults: adults || 1,
                children: children || 0,
                baseTotal,
                pricingMultiplier,
                finalTotal,
                platformAmount,
                agencyAmount,
                commissionPercent,
                status: "AGUARDANDO_PAGAMENTO", // Depois do MP Webhook, vai para AGUARDANDO_ACEITE e inicia 20min

                // Se for privativo, adiciona os veiculos
                orderVehicles: vehicles && vehicles.length > 0 ? {
                    create: vehicles.map((v: any) => ({
                        vehicleId: v.vehicleId,
                        quantity: v.quantity,
                        unitPriceSnapshot: v.unitPriceSnapshot,
                        lineTotal: v.lineTotal
                    }))
                } : undefined
            },
            include: {
                orderVehicles: true,
                service: true
            }
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error("Order Creation Error", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
