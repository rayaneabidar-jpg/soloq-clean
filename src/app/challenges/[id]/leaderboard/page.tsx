import LeaderboardClient from "@/app/components/LeaderboardClient";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Extraire l'id de la route dynamique

  return <LeaderboardClient id={id} />; // ✅ Passer l'id au client
}
