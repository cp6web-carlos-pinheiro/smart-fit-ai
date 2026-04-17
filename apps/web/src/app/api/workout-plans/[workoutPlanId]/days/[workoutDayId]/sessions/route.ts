import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { StartWorkoutSession } from "@/usecases/StartWorkoutSession";
import { NotFoundError, WorkoutPlanNotActiveError, SessionAlreadyStartedError } from "@/errors";

const paramsSchema = z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workoutPlanId: string; workoutDayId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { workoutPlanId, workoutDayId } = paramsSchema.parse(await params);

    const startWorkoutSession = new StartWorkoutSession();
    const result = await startWorkoutSession.execute({
      userId: session.user.id,
      workoutPlanId,
      workoutDayId,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro na rota POST start session:", error);

    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message, code: "NOT_FOUND_ERROR" }, { status: 404 });
    }
    if (error instanceof WorkoutPlanNotActiveError) {
      return Response.json({ error: error.message, code: "WORKOUT_PLAN_NOT_ACTIVE_ERROR" }, { status: 422 });
    }
    if (error instanceof SessionAlreadyStartedError) {
      return Response.json({ error: error.message, code: "SESSION_ALREADY_STARTED_ERROR" }, { status: 409 });
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}