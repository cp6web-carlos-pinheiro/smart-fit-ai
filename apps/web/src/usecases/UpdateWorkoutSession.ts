import { NotFoundError } from "@/errors";
import { prisma } from "@/lib/db";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  completedAt: string | null | Date;  
}

interface OutputDto {
  id: string;
  startedAt: string;
  completedAt: string | null;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { 
        id: dto.workoutDayId, 
        workoutPlanId: dto.workoutPlanId 
      },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const session = await prisma.workoutSession.findUnique({
      where: { 
        id: dto.sessionId, 
        workoutDayId: dto.workoutDayId 
      },
    });

    if (!session) {
      throw new NotFoundError("Workout session not found");
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: dto.sessionId },
      data: { 
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null 
      },
    });

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt.toISOString(),
      completedAt: updatedSession.completedAt?.toISOString() ?? null,
    };
  }
}