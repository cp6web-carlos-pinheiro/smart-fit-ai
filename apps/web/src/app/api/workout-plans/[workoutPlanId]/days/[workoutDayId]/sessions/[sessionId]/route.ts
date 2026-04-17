import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { UpdateWorkoutSession } from "@/usecases/UpdateWorkoutSession";
import { NotFoundError } from "@/errors";

const paramsSchema = z.object({
  workoutPlanId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  sessionId: z.string().uuid(),
});

const bodySchema = z.object({
    completedAt: z.iso.datetime().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workoutPlanId: string; workoutDayId: string; sessionId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { workoutPlanId, workoutDayId, sessionId } = paramsSchema.parse(await params);
    const body = await req.json();
    const validatedBody = bodySchema.parse(body);

    const updateWorkoutSession = new UpdateWorkoutSession();
    const result = await updateWorkoutSession.execute({
      userId: session.user.id,
      workoutPlanId,
      workoutDayId,
      sessionId,
      completedAt: validatedBody.completedAt ? new Date(validatedBody.completedAt) : null,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota PATCH session:", error);

    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message, code: "NOT_FOUND_ERROR" }, { status: 404 });
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}