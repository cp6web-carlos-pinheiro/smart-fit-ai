import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { CreateWorkoutPlan } from "@/usecases/CreateWorkoutPlan";
import { ListWorkoutPlans } from "@/usecases/ListWorkoutPlans";
import { NotFoundError } from "@/errors";

const listQuerySchema = z.object({
  active: z.enum(["true", "false"]).optional().default("true").transform(val => val === "true"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeParam = searchParams.get("active");
    const validated = listQuerySchema.parse({ active: activeParam });

    const listWorkoutPlans = new ListWorkoutPlans();
    const result = await listWorkoutPlans.execute({
      userId: session.user.id,
      active: validated.active,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota GET /workout-plans:", error);
    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    const createWorkoutPlan = new CreateWorkoutPlan();
    const result = await createWorkoutPlan.execute({
      userId: session.user.id,
      name: body.name,
      workoutDays: body.workoutDays,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro na rota POST /workout-plans:", error);

    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message, code: "NOT_FOUND_ERROR" }, { status: 404 });
    }

    return Response.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}