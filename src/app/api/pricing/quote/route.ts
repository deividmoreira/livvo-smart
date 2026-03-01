import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Regra: Alta temporada (Julho a Janeiro) = +10%
// Feriados fora da alta = +10% (configuravel nas regras e feriados)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { serviceId, scheduledAt, peopleCount, vehicles } = body;
        // vehicles: array de { vehicleId, quantity }

        if (!serviceId || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

        const date = new Date(scheduledAt);
        const month = date.getMonth() + 1; // 1 to 12
        const isHighSeason = month >= 7 || month === 1; // July to January

        let baseTotal = 0;

        if (service.type === "PRIVATIVO") {
            // Calcula o preco baseado nos veiculos 
            if (vehicles && vehicles.length > 0) {
                for (const v of vehicles) {
                    const vehicle = await prisma.vehicle.findUnique({ where: { id: v.vehicleId } });
                    if (vehicle) {
                        baseTotal += vehicle.price * v.quantity;
                    }
                }
            }
        } else {
            // Compartilhado ou Translado e por basePrice, normalmente por pessoa
            const pricePerUnit = service.basePrice || 0;
            baseTotal = pricePerUnit * (peopleCount || 1);
        }

        let pricingMultiplier = 1.0;
        let adjustmentType = "NORMAL";

        if (isHighSeason) {
            pricingMultiplier = 1.10; // +10%
            adjustmentType = "ALTA_TEMPORADA";
        } else {
            // Verifica se eh feriado
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const holiday = await prisma.holiday.findFirst({
                where: {
                    active: true,
                    date: startOfDay
                }
            });

            if (holiday) {
                // Pega configuracao dinamica do admin (se existir)
                const rule = await prisma.pricingRule.findFirst({ where: { name: "FERIADO" } });
                const multiplier = rule ? 1 + (rule.value / 100) : 1.10;
                pricingMultiplier = multiplier;
                adjustmentType = "FERIADO";
            }
        }

        const finalTotal = baseTotal * pricingMultiplier;

        return NextResponse.json({
            baseTotal,
            pricingMultiplier,
            adjustmentType,
            finalTotal,
            breakdown: {
                serviceId,
                adjustmentType,
                isHighSeason
            }
        });

    } catch (error) {
        console.error("Pricing Error", error);
        return NextResponse.json({ error: "Failed to quote pricing" }, { status: 500 });
    }
}
