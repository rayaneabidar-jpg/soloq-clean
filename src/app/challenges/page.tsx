"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { ArrowUpDown, Trash2, User, Trophy } from "lucide-react";

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
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8 mt-4 pb-6">
        <h1 className="text-4xl font-bold text-white">Listes des challenges :</h1>

        <div className="flex gap-4">
          <Button variant="ghost" size="icon" className="border border-white/10 text-white/50 hover:text-white">
            <ArrowUpDown size={18} />
          </Button>
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/50 rounded-xl border border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun challenge trouvé</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto text-sm">Il n'y a pas encore de challenge actif.</p>
          {user && (
            <Link href="/challenges/new">
              <Button variant="gold" size="lg" className="px-8 text-base">Créer un challenge</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="relative group h-full"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Main Card Link - z-10 to be on top of background but below interactive buttons */}
              <Link href={`/challenges/${challenge.id}`} className="absolute inset-0 z-10 rounded-xl" />

              {/* Card - Content needs to be z-0 or z-20 depending on interactivity */}
              <Card className="h-full bg-[#1a1a1a] border border-white/5 group-hover:border-white/20 group-hover:bg-[#202020] transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-black/50 group-hover:-translate-y-1 p-5 flex flex-col justify-between relative z-0">
                <div>
                  <div className="flex flex-row items-start justify-between mb-4 relative z-20">
                    <h3 className="text-lg font-bold text-white leading-tight pr-2 group-hover:text-[var(--color-green-start)] transition-colors pointer-events-none">
                      {challenge.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Delete logic
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm text-white/50 mb-6 font-light pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span>Période :</span>
                      <span className="text-white">12/11 - 12/12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mode :</span>
                      <span className="text-white uppercase font-medium bg-white/5 px-2 py-0.5 rounded text-xs">{challenge.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 mt-auto border-t border-white/5 pt-4 pointer-events-none">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[#333] border border-[#1a1a1a] flex items-center justify-center text-[9px] text-white">
                        <User size={12} />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-[#222] border border-[#1a1a1a] flex items-center justify-center text-[9px] text-white">
                      +
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-white/50 group-hover:text-white rounded-full px-4 text-xs border border-white/10 bg-transparent group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                    Ouvrir
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
