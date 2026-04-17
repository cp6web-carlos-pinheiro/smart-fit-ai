import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { GetWorkoutPlan } from "@/usecases/GetWorkoutPlan";
import { NotFoundError } from "@/errors";

const paramsSchema = z.object({
  workoutPlanId: z.string().uuid(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workoutPlanId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { workoutPlanId } = paramsSchema.parse(await params);

    const getWorkoutPlan = new GetWorkoutPlan();
    const result = await getWorkoutPlan.execute({
      userId: session.user.id,
      workoutPlanId,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota GET /workout-plans/[id]:", error);

    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message, code: "NOT_FOUND_ERROR" }, { status: 404 });
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}