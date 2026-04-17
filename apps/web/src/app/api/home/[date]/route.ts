import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { GetHomeData } from "@/usecases/GetHomeData";
import { NotFoundError } from "@/errors";

const paramsSchema = z.object({
  date: z.string().pipe(z.coerce.date()), 
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
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

    const { date } = paramsSchema.parse(await params);

    const getHomeData = new GetHomeData();
    const result = await getHomeData.execute({
      userId: session.user.id,
      date: date,            
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota home:", error);

    if (error instanceof NotFoundError) {
      return Response.json(
        { error: error.message, code: "NOT_FOUND_ERROR" },
        { status: 404 }
      );
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}