import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { GetStats } from "@/usecases/GetStats";
import { NotFoundError } from "@/errors"; 

const statsQuerySchema = z.object({
  from: z.string().pipe(z.coerce.date()),
  to: z.string().pipe(z.coerce.date()),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawFrom = searchParams.get("from");
    const rawTo = searchParams.get("to");

    if (!rawFrom || !rawTo) {
      return Response.json(
        { error: "Missing 'from' or 'to' query parameters", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const validated = statsQuerySchema.parse({
      from: rawFrom,
      to: rawTo,
    });

    const getStats = new GetStats();
    const result = await getStats.execute({
      userId: session.user.id,
      from: validated.from,
      to: validated.to,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota GET /stats:", error);

    if (error instanceof NotFoundError) {
      return Response.json(
        { error: error.message, code: "NOT_FOUND_ERROR" },
        { status: 404 }
      );
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        { 
          error: "Invalid date format", 
          code: "VALIDATION_ERROR",
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}