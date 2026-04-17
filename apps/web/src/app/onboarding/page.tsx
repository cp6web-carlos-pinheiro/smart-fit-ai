import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";        
import { getHomeData, getUserTrainData } from "@/app/_lib/api/fetch-generated";
import dayjs from "dayjs";
import { Chat } from "@/app/_components/chat";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  const today = dayjs();

  let homeData, trainData;

  try {
    [homeData, trainData] = await Promise.all([
      getHomeData(today.format("YYYY-MM-DD")),
      getUserTrainData(),
    ]);
  } catch (error) {
    console.error("Erro ao buscar dados de onboarding:", error);
  }

  if (
    homeData?.status === 200 &&
    trainData?.status === 200 &&
    homeData.data?.activeWorkoutPlanId &&
    trainData.data
  ) {
    redirect("/");
  }

  return <Chat embedded initialMessage="Quero começar a melhorar minha saúde!" />;
}