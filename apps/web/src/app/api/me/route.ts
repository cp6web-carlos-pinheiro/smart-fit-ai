import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { GetUserTrainData } from "@/usecases/GetUserTrainData";
import { UpsertUserTrainData } from "@/usecases/UpsertUserTrainData";

const upsertSchema = z.object({
  weightInGrams: z.number().min(1000).max(500000),
  heightInCentimeters: z.number().min(50).max(300),
  age: z.number().int().min(10).max(120),
  bodyFatPercentage: z.number().int().min(0).max(100),
});

export async function GET() {
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

    const getUserTrainData = new GetUserTrainData();
    const result = await getUserTrainData.execute({
      userId: session.user.id,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota GET /me:", error);
    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const validatedBody = upsertSchema.parse(body);

    const upsertUserTrainData = new UpsertUserTrainData();
    const result = await upsertUserTrainData.execute({
      userId: session.user.id,
      ...validatedBody,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota PUT /me:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input", code: "VALIDATION_ERROR", details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}