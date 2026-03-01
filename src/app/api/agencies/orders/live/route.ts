import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simples emissor de eventos para demonstracao MVP
let clients: ReadableStreamDefaultController[] = [];

// Funcao para ser chamada no webhook de pagamento
export function broadcastNewOrder(order: any) {
    clients.forEach(client => {
        try {
            client.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(order)}\n\n`));
        } catch {
            // Ignora erro de conexao morta
        }
    });
}

// Rota SSE para as agencias escutarem
export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            clients.push(controller);

            // Envia uma mensagem de ping inicial
            controller.enqueue(new TextEncoder().encode(`: ping\n\n`));

            // Ao desconectar
            req.signal.addEventListener("abort", () => {
                clients = clients.filter(c => c !== controller);
                controller.close();
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive"
        }
    });
}
