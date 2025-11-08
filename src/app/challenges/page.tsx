"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Challenge = {
  id: string;
  name: string;
  start_at: string;
  end_at: string | null;
  visibility: string;
  mode: string;
  ranking_rule: string;
  owner_id: string;
  created_at: string;
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(sessionData.session?.user || null);

        const res = await fetch("/api/challenges", {
          cache: "no-store",
        });
        const json = await res.json();
        setChallenges(json.challenges || []);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Challenges</h1>
        {user && (
          <button
            onClick={() => router.push("/challenges/new")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold"
          >
            Créer un challenge
          </button>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="text-center text-gray-400">
          <p className="text-lg">Aucun challenge disponible</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => router.push(`/challenges/${challenge.id}`)}
            >
              <h2 className="text-xl font-bold mb-2">{challenge.name}</h2>
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <p>Mode: {challenge.mode}</p>
                <p>Ranking: {challenge.ranking_rule}</p>
                <p>
                  Visibilité:{" "}
                  <span className="text-blue-400">{challenge.visibility}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/challenges/${challenge.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-center text-sm"
                >
                  Ouvrir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
