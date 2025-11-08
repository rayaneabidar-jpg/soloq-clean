// src/app/components/RecentMatches.tsx
"use client";

import { useEffect, useState } from "react";

interface Match {
  id: string;
  result: "WIN" | "LOSS";
  timestamp: string;
}

interface RecentMatchesProps {
  challengeId: string;
  playerId: string;
}

export default function RecentMatches({ challengeId, playerId }: RecentMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await fetch(
          `/api/challenges/${challengeId}/players/${playerId}/matches`
        );
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [challengeId, playerId]);

  if (loading) return <div className="text-gray-400">Chargement...</div>;
  if (matches.length === 0) return <div className="text-gray-400">Aucun match</div>;

  return (
    <div className="flex gap-2 flex-wrap">
      {matches.slice(0, 5).map((match) => (
        <div
          key={match.id}
          className={`px-3 py-1 rounded text-sm font-semibold ${
            match.result === "WIN"
              ? "bg-green-900 text-green-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          {match.result === "WIN" ? "✅ W" : "❌ L"}
        </div>
      ))}
    </div>
  );
}
